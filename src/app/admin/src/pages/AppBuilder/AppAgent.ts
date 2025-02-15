import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
// import chatChunkExpert from "@/service/chat/chat-chunk-sc"
import { AppBuilderMessage } from "./types"
import { balanceStore } from "@/stores/balanceStore"
import { appCodeStore } from "./store/appCodeStore"
import { logStore } from "./AIEditor/components/LogStore"
import { knowledgeStore } from "./AIEditor/components/KnowledgeStore"
import { getMetadata } from "@/service/apis/metadata"
import { AppIndex } from "../AppManagement/store/types"
import { markdown as template } from "./template.md"
import getSystemPrompt from "@/prompts"

interface CommandInput {
  content: string
  images?: string[]
}

class AppAgent {
  private static instance: AppAgent

  private constructor() {}

  public static getInstance(): AppAgent {
    if (!AppAgent.instance) {
      AppAgent.instance = new AppAgent()
    }
    return AppAgent.instance
  }

  private async getAppsContext(): Promise<string> {
    try {
      const result = await getMetadata(["app_index"])
      if (!result.data?.[0]?.value) {
        return "暂无应用信息"
      }

      const apps = JSON.parse(result.data[0].value) as AppIndex[]
      const appsContext = apps
        .map(
          (app) => `
应用ID: ${app.id}
应用名称: ${app.title}${app.creator ? `\n创建者: ${app.creator.name}` : ""}`
        )
        .join("\n---\n")

      return appsContext
    } catch (error) {
      console.error("Error getting apps context:", error)
      return "获取应用信息失败"
    }
  }

  private getRelevantLogs(): { logs: string; completeness: any } {
    const MAX_LOGS = 20
    const allLogs = logStore.getLatestLogs(20, true)
    const errorAndWarnings = allLogs.filter((log) => log.level === "error" || log.level === "warn").slice(0, MAX_LOGS)
    const remainingCount = MAX_LOGS - errorAndWarnings.length
    const otherLogs = allLogs.filter((log) => log.level !== "error" && log.level !== "warn").slice(0, remainingCount)
    const relevantLogs = [...errorAndWarnings, ...otherLogs].sort((a, b) => b.timestamp - a.timestamp)
    const completeness = logStore.checkLogsCompleteness(relevantLogs)
    const logsText = relevantLogs
      .map(
        (log) =>
          `[${log.level.toUpperCase()}] ${log.message}${log.details ? `\nDetails: ${JSON.stringify(log.details)}` : ""}`
      )
      .join("\n")

    return {
      logs: logsText,
      completeness,
    }
  }

  public async processCommand(
    appId: string,
    messages: AppBuilderMessage[],
    command: string | CommandInput,
    onChunk?: (chunk: string) => void
  ): Promise<{
    success: boolean
    content?: string
    version?: any
    error?: string
  }> {
    if (!balanceStore.checkBalance()) {
      throw new Error("余额不足，请前往企业设置-账户进行充值")
    }

    try {
      const commandContent = typeof command === "string" ? command : command.content
      const isPMMode = commandContent.trim().toLowerCase().startsWith("@pm")

      appCodeStore.setAppId(appId)

      // 获取资料数据
      const result = await getMetadata(["resource_index"])
      const resources = JSON.parse(result.data?.[0]?.value || "[]")

      const allModules = appCodeStore.currentVersion?.modules || {}

      let relevantModules: Record<string, any> = {}
      let moduleSelectionMode = "all"

      if (appCodeStore.viewState.useSelectedModulesAsContext) {
        relevantModules = appCodeStore.getContextModules()
        moduleSelectionMode = "manual"
      } else {
        const moduleCount = Object.keys(allModules).length
        if (moduleCount <= 20) {
          relevantModules = allModules
          moduleSelectionMode = "all"
        } else {
          const relevantIds = []
          if (relevantIds.length === 0) {
            relevantModules = allModules
            moduleSelectionMode = "all"
          } else {
            relevantModules = relevantIds.reduce((acc, id) => {
              if (allModules[id]) {
                acc[id] = allModules[id]
              }
              return acc
            }, {})
            moduleSelectionMode = "smart"
          }
        }
      }

      const appEntryId = `${appId}_app_entry`
      if (allModules[appEntryId] && !relevantModules[appEntryId]) {
        relevantModules[appEntryId] = allModules[appEntryId]
      }

      const modulesContext = Object.entries(relevantModules)
        .map(
          ([id, module]) => `
<mo-ai-code moduleId="${id}" name="${module.data.name || "未生成路径，需要你生成对应的 name"}" title="${module.data.title || "未生成路径，需要你生成对应的 title"}" path="${module.data.path || "未生成路径，需要你生成对应的路径"}" type="${module.data.type}">          
${module.data.code}
</mo-ai-code>
`
        )
        .join("\n---\n")

      const { logs: relevantLogs, completeness } = this.getRelevantLogs()
      const knowledgeContext = knowledgeStore.getKnowledgeContext()
      const appsContext = await this.getAppsContext()

      // 构建项目上下文数据
      const projectContext = `
1. 应用入口代码：
<mo-ai-code type="app">
${appCodeStore.currentVersion?.modules[appEntryId]?.data?.code || "需要先创建应用入口代码，包含基础路由配置"}
</mo-ai-code>


2. ${
        moduleSelectionMode === "manual"
          ? `手动选中的模块代码 (${Object.keys(relevantModules).length}个模块):`
          : `所有模块代码 (${Object.keys(relevantModules).length}个模块):`
      }
${modulesContext}

3. 系统日志上下文（注意：这只是最近的部分日志，按重要性排序）：
${relevantLogs}

${
  !completeness.isComplete
    ? `
注意：当前日志可能不完整：
${completeness.summary}

如果这些日志不足以分析问题，请：
1. 说明需要查看更多日志
2. 具体说明需要哪些类型的日志（例如：特定时间段、特定级别、或包含特定关键词的日志）
3. 建议用户使用日志查看器的过滤功能，找到并提供相关日志
`
    : ""
}

4. 知识库内容：
${knowledgeContext || "暂无自定义知识内容"}

5. 系统中的应用列表：
${appsContext}

${
  typeof command !== "string" && command.images?.length > 0
    ? `
6. 用户上传的图片资源：
${command.images.map((url, index) => `图片${index + 1}: ${url}`).join("\n")}`
    : ""
}`

      const baseInput = (role) => `
            <role>注意：${role}</role>
      `
      const enhancedCommand = isPMMode
        ? `${commandContent}${baseInput("仔细阅读<project>里的代码，不需要生成代码，只需要和用户讨论，帮助用户分析问题")}`
        : `${commandContent}${baseInput("你作为工程师MO，仔细阅读<project>里的代码，你通过修改和维护 <project>里的代码来实现用户的需求，<template> 里的代码仅供参考和学习，生成完整代码来完成用户的需求，生成的代码必须完整，不可以因为代码很长，或者代码没有修改就省略原来的代码，禁止使用 “保持原有代码不变” 这样的注释来省略代码，不要添加 \`\`\`typescript，\`\`\`jsx,这样的标签，如果用户反馈有任何问题，你都必须通过打日志来排查问题，只有定位到问题才生成修复代码，再编写代码的时候要考虑兼容性，添加新功能不要破坏原有功能，避免使用消耗性能的 css 属性，UI 设计要保持一致性，注意，NextUI 使用的是 V2 版本，在编写代码前思考模块设计，写在<design>中，确保每个模块职责单一，避免出现超大模块, 不要使用\`\`\`mo-ai-code, 生成的代码必须包裹在<mo-ai-code>这里不能用\`\`\`包裹代码<mo-ai-code>标签里，禁止使用 import/export 语句，禁止使用 装饰器语法, NextUI 没有 useToast 方法，禁止输出\`\`\` 标记，await content.wpm.import 必须放在顶部同步使用，不能异步使用，不能在函数组件内部使用，<mo-ai-message> 在所有的 <mo-ai-code> 之后生成，在应用入口模块必须使用 <NextUI.NextUIProvider navigate={navigate}> 来包裹 Routes 并且使用 NextUI 的 Link 等导航组件，所有跳转都需要使用 Link 或者 navigate，不允许直接写 href链接，NextUI 没有 Typography，Text 这些组件，所有 wpm.import 的组件都必须生成并 wpm.export ,尤其是入口模块，用树状思维的方式来生成模块，从入口模块开始逐个生成")}每个<mo-ai-code>模块代码的顶层里都要添加这段代码都要添加这段的代码 const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context
const { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Modal,ModalBody,ModalContent, useDisclosure } = NextUI;
 
,默认图片使用 images.unsplash.com 的服务来生成，但是不要修改已有的图片链接，只有当图片 src 为空是才使用 images.unsplash.com 的服务来生成，只使用 wpm.export 导出代码和 wpm.import 导入代码，应用入口模块的导出名称固定使用 appId，所有模块的结尾都要用 </mo-ai-code> 闭合，一次性生成所有模块，不要分批生成, 不要使用 BrowserRouter，因为父组件已经用, await 必须在 async 函数内使用，禁止在代码中输出类似 “其他代码保持不变 / 其他方法保持不变” 这样的注释`

      const allMessages = [
        ...messages,
        {
          role: "user",
          content: enhancedCommand,
          images: typeof command === "string" ? [] : command.images,
        },
      ]

      let response = ""
      const system = await getSystemPrompt(resources, {
        projectContext, // 将项目上下文数据传递给后端
        template,
      })
      await chatChunkExpert(
        allMessages,
        (chunk: string) => {
          response += chunk
          onChunk?.(chunk)
        },
        () => {},
        true,
        0,
        "YES",
        system
      )

      const version = await appCodeStore.handleAIGeneration(response)
      if (version.isNoCode) {
        return {
          isPMMode: true,
        }
      }
      return {
        ...version,
        isPMMode,
      }
    } catch (error) {
      console.error("Error in processCommand:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export default AppAgent.getInstance()

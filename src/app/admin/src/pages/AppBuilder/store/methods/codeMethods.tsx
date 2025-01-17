import { transform } from "@/utils/moduleLoader"
import { AppCodeStore, ModuleData, ShataAICode, ChangeMessage } from "../types"
import message from "@/components/Message"

// 新增: 解析变更消息
export function extractChangeMessages(content: string): ChangeMessage[] {
  const messages: ChangeMessage[] = []
  const messageBlocks = content.match(/<mo-ai-message>([\s\S]*?)<\/mo-ai-message>/g)

  if (!messageBlocks) return messages

  for (const block of messageBlocks) {
    try {
      const contentMatch = block.match(/<mo-ai-message>([\s\S]*?)<\/mo-ai-message>/)
      if (!contentMatch) continue

      const content = contentMatch[1].trim()
      const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)

      if (lines.length < 1) continue

      // 解析第一行: type(scope): subject
      const headerMatch = lines[0].match(/^(\w+)\(([^)]+)\):\s*(.+)$/)
      if (!headerMatch) continue

      const [_, type, scope, subject] = headerMatch

      // 收集详细信息
      const details: string[] = []
      let collectingDetails = false

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (line.startsWith("-")) {
          collectingDetails = true
          details.push(line.slice(1).trim())
        } else if (collectingDetails && line) {
          details[details.length - 1] += " " + line
        }
      }

      messages.push({
        type: type as ChangeMessage["type"],
        scope,
        subject,
        details,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error("Error parsing change message:", error)
      continue
    }
  }

  return messages
}

export function compileCode(this: AppCodeStore, code: string): Promise<string> {
  try {
    const { code: compiledCode } = transform(
      `export default async () => {
          ${code}
       }
      `,
      {
        filename: "example.tsx",
        presets: ["react", "typescript"],
      }
    )
    return Promise.resolve(compiledCode)
  } catch (error) {
    console.error("Error compiling code:", code)
    message.error(
      <div className='flex items-center gap-2'>
        <span>AI 生成代码编译失败, 请告诉 AI 重新生成</span>
      </div>
    )
    throw error
  }
}

// 修改: 提取 search-replace 代码块，使用新的文本格式处理方式
export function extractSearchReplaceCodes(content: string): Array<{
  type: string
  name: string
  title?: string
  path?: string
  searchReplaces: Array<{
    search: string
    replace: string
  }>
}> {
  const results: Array<{
    type: string
    name: string
    title?: string
    path?: string
    searchReplaces: Array<{
      search: string
      replace: string
    }>
  }> = []

  const searchReplaceBlocks = content.match(/<mo-ai-code-search-replace[^>]*>([\s\S]*?)<\/mo-ai-code-search-replace>/g)
  if (!searchReplaceBlocks) return results

  for (const block of searchReplaceBlocks) {
    try {
      const typeMatch = block.match(/type="([^"]+)"/)
      const nameMatch = block.match(/name="([^"]+)"/)
      const titleMatch = block.match(/title="([^"]+)"/)
      const pathMatch = block.match(/path="([^"]+)"/)

      if (!typeMatch || !nameMatch) continue

      const type = typeMatch[1]
      const name = nameMatch[1]
      const title = titleMatch ? titleMatch[1] : undefined
      const path = pathMatch ? pathMatch[1] : undefined

      const contentMatch = block.match(/<mo-ai-code-search-replace[^>]*>([\s\S]*?)<\/mo-ai-code-search-replace>/)
      if (!contentMatch) continue

      const searchReplaces: Array<{ search: string; replace: string }> = []
      const content = contentMatch[1].trim()

      // 直接在内容中查找所有的 SEARCH/REPLACE 块
      const searchReplaceMatches = content.matchAll(/<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)>>>>>>> REPLACE/g)
      for (const match of Array.from(searchReplaceMatches)) {
        searchReplaces.push({
          search: match[1].trim(),
          replace: match[2].trim(),
        })
      }
      if (searchReplaces.length > 0) {
        results.push({
          type,
          name,
          title,
          path,
          searchReplaces,
        })
      }
    } catch (error) {
      console.error("Error processing search-replace block:", error)
      continue
    }
  }

  return results
}

export function extractShataAICodes(content: string): ShataAICode[] {
  try {
    const results: ShataAICode[] = []
    const codeBlocks = content.match(/<mo-ai-code[^>]*>([\s\S]*?)<\/mo-ai-code>/g)
    
    if (!codeBlocks) return results

    for (const block of codeBlocks) {
      try {
        const typeMatch = block.match(/type="([^"]+)"/)
        if (!typeMatch) continue

        const type = typeMatch[1] as ShataAICode["type"]
        const codeMatch = block.match(/<mo-ai-code[^>]*>([\s\S]*?)<\/mo-ai-code>/)
        if (!codeMatch) continue

        let code = codeMatch[1].trim()

        if (type === "app") {
          results.push({
            type,
            code,
            name: "entry",
            title: "应用入口",
            path: "index.jsx",
          })
          continue
        }

        const nameMatch = block.match(/name="([^"]+)"/)
        const name = nameMatch ? nameMatch[1] : undefined

        const titleMatch = block.match(/title="([^"]+)"/)
        const title = titleMatch ? titleMatch[1] : undefined

        const pathMatch = block.match(/path="([^"]+)"/)
        const path = pathMatch ? pathMatch[1] : undefined

        results.push({
          type,
          code,
          name,
          title,
          path,
        })
      } catch (blockError) {
        console.error("Error processing code block:", blockError)
        continue
      }
    }

    return results
  } catch (error) {
    console.error("Error extracting code blocks:", error)
    throw new Error("Failed to extract code blocks")
  }
}

export async function processAIResponse(this: AppCodeStore, aiResponse: string): Promise<Record<string, ModuleData>> {
  if (!this.appId) throw new Error("AppId not set")

  try {
    // 解析变更消息
    const changeMessages = this.extractChangeMessages(aiResponse)
    changeMessages.forEach((msg) => this.addChangeMessage(msg))

    // 处理完整代码块
    const codeBlocks = this.extractShataAICodes(aiResponse)
    const moduleData: Record<string, ModuleData> = {}

    // 处理 search-replace 代码块
    const searchReplaceBlocks = this.extractSearchReplaceCodes(aiResponse)

    // 首先处理完整代码块
    for (const block of codeBlocks) {
      const moduleId = block.type === "app" ? `${this.appId}_app_entry` : `${this.appId}_${block.type}_${block.name}`

      moduleData[moduleId] = {
        id: moduleId,
        type: block.type,
        name: block.name!,
        title: block.title,
        code: block.code,
        path: block.path,
        compiledCode: block.type === "markdown" ? true : await this.compileCode(block.code),
      }

      // 如果是手动选择上下文模式,将新模块添加到选中列表
      if (this.viewState.useSelectedModulesAsContext && !this.viewState.selectedModules.includes(moduleId)) {
        this.viewState.selectedModules.push(moduleId)
        message.success(`新模块 "${block.title || block.name}" 已自动添加到上下文中`)
      }
    }

    // 处理 search-replace 块
    for (const block of searchReplaceBlocks) {
      const moduleId = `${this.appId}_${block.type}_${block.name}`
      const existingModule = this.currentVersion?.modules[moduleId]

      if (existingModule) {
        // 从原始代码开始，然后逐步应用每个替换
        let updatedCode = existingModule.data.code

        // 按顺序应用所有的 search-replace 对
        // 每次替换都基于前一次替换的结果
        for (const { search, replace } of block.searchReplaces) {
          updatedCode = updatedCode.replace(search, replace)
          // 可以添加日志来调试替换过程
          console.log("After replacement:", {
            search,
            replace,
            result: updatedCode,
          })
        }

        moduleData[moduleId] = {
          id: moduleId,
          type: block.type,
          name: block.name,
          title: block.title,
          code: updatedCode, // 最终的代码包含了所有连续替换的结果
          path: block.path,
          compiledCode: block.type === "markdown" ? true : await this.compileCode(updatedCode),
        }
      }
    }

    return moduleData
  } catch (error) {
    console.error("Error processing AI response:", error)
    throw new Error("Failed to process AI response")
  }
}

export async function executeModules(this: AppCodeStore, context: any) {
  if (!this.currentVersion) return []
  const results: Array<{
    success: boolean
    moduleId: string
    type: string
    name: string
    executionTime?: number
    error?: string
    result?: any
  }> = []

  const version = this.currentVersion

  try {
    for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
      const startTime = performance.now()

      try {
        const moduleData = moduleWrapper.data

        // 如果是 markdown 类型，跳过执行
        if (moduleData.type === "markdown") {
          results.push({
            success: true,
            moduleId,
            type: moduleData.type,
            name: moduleData.name,
            executionTime: 0,
          })
          continue
        }

        if (!moduleData || !moduleData.compiledCode) {
          throw new Error(`Invalid module data for ${moduleId}`)
        }
        const moduleFunction = new Function(
          "context",
          `
          ${moduleData.compiledCode.replace(/export default/, "return")}
        `
        )
        const getResult = moduleFunction(context)
        getResult()
        delete moduleData.code
        delete moduleData.compiledCode
        results.push({
          success: true,
          moduleId,
          type: moduleData.type,
          name: moduleData.name,
          executionTime: performance.now() - startTime,
        })
      } catch (error) {
        console.error(`Error executing module ${moduleId}:`, error)
        results.push({
          success: false,
          moduleId,
          type: moduleWrapper.data?.type || "unknown",
          name: moduleWrapper.data?.name || moduleId,
          executionTime: performance.now() - startTime,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }
    return results
  } catch (error) {
    console.error("Error executing modules:", error)
    return [
      {
        success: false,
        moduleId: "unknown",
        type: "unknown",
        name: "unknown",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    ]
  }
}

export async function addModules(this: AppCodeStore, updates: Record<string, string>): Promise<Version> {
  if (!this.currentVersion) {
    throw new Error("No current version")
  }

  try {
    const updatedModules: Record<string, any> = {}

    for (const [moduleId, newCode] of Object.entries(updates)) {
      const existingModule = this.currentVersion.modules[moduleId]
      if (!existingModule) {
        throw new Error(`Module ${moduleId} not found`)
      }
      let compiledCode
      if (moduleId.includes("markdown")) {
        compiledCode = newCode
      } else {
        compiledCode = await this.compileCode(newCode)
      }

      updatedModules[moduleId] = {
        data: {
          ...existingModule.data,
          code: newCode,
          compiledCode,
        },
        updatedAt: new Date().toISOString(),
      }
    }

    const newVersion: Version = {
      timestamp: Date.now(),
      app: {
        ...this.currentVersion.app,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
      },
      modules: {
        ...this.currentVersion.modules,
        ...updatedModules,
      },
    }

    return newVersion
  } catch (error) {
    console.error("Error adding modules:", error)
    throw error
  }
}

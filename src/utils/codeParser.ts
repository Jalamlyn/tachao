import { message } from "@/components/Message"
import * as Babel from "@babel/standalone"
import React from "react"
import { aiLog } from "./AITraceLogger"

// 导入 shadcn UI 组件
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"

// 导入 NextUI Button
import { Button } from "@nextui-org/react"

// shadcn UI 和 NextUI 组件映射
const uiComponents = {
  Alert,
  AlertTitle,
  AlertDescription,
  Button, // NextUI Button
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Calendar,
}

/**
 * 通用的 AI 代码解析函数
 */
export const parseAICode = async (content: string, tag: string): Promise<any> => {
  try {
    aiLog.log(`Starting to parse ${tag}`, { contentLength: content?.length });
    
    // 1. 提取标签内容
    const regex = new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`)
    const match = content.match(regex)
    if (!match) {
      aiLog.log(`No valid ${tag} found in content`, { contentPreview: content?.substring(0, 200) });
      throw new Error(`No valid ${tag} found`)
    }
    
    const code = match[1].trim()
    aiLog.log(`Extracted code from ${tag}`, { code });

    // 2. 使用 babel 转换
    const jsCode = await jsxToJs(code)
    aiLog.log(`Transformed code`, { jsCode });

    // 3. 解析配置对象
    const result = parseConfigObject(jsCode)
    aiLog.log(`Parsed result`, { result });

    return result
  } catch (error) {
    aiLog.error(error as Error);
    throw error;
  }
}

/**
 * 从 shata-ai-form 标签中提取代码
 */
const extractCode = (content: string): string | null => {
  const regex = /<shata-ai-form>([\s\S]*?)<\/shata-ai-form>/
  const match = content.match(regex)
  return match ? match[1].trim() : null
}

/**
 * 从 shata-ai-edit 标签中提取编辑操作代码
 */
const extractEditCode = (content: string): string | null => {
  const regex = /<shata-ai-edit>([\s\S]*?)<\/shata-ai-edit>/
  const match = content.match(regex)
  return match ? match[1].trim() : null
}

/**
 * 从 shata-ai-resource 标签中提取资源操作代码
 */
export const extractResourceCode = (content: string): string | null => {
  aiLog.log("Starting to extract resource code");
  const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/
  const match = content.match(regex)
  const code = match ? match[1].trim() : null
  aiLog.log("Extracted resource code", { code });
  return code
}

/**
 * 验证自定义组件是否只使用了允许的 UI 组件
 */
const validateCustomComponents = (jsxCode: string): boolean => {
  // 简单的正则匹配检查是否使用了非允许的组件
  const componentPattern = /<([A-Z][a-zA-Z0-9]*)/g
  const matches = jsxCode.match(componentPattern) || []

  for (const match of matches) {
    const componentName = match.slice(1) // 移除 < 符号
    if (!uiComponents[componentName]) {
      message.error(`不支持的组件: ${componentName}，请只使用允许的 UI 组件`)
      return false
    }
  }

  return true
}

/**
 * 将 JSX 代码转换为 JavaScript
 */
const jsxToJs = async (jsxCode: string): Promise<string> => {
  try {
    aiLog.log("Starting JSX transformation");
    // 验证自定义组件
    if (!validateCustomComponents(jsxCode)) {
      throw new Error("自定义组件验证失败")
    }

    const result = Babel.transform(jsxCode, {
      presets: ["react"],
    }).code
    aiLog.log("Transformed code", { result });
    return result
  } catch (error) {
    aiLog.error(error as Error);
    throw new Error("Failed to transform JSX")
  }
}

/**
 * 解析配置对象
 */
const parseConfigObject = (jsCode: string): any => {
  try {
    aiLog.log("Starting to parse config object");
    // 移除 export default 并获取对象部分
    const objectCode = jsCode.replace(/export\s+default\s+/, "return ")
    aiLog.log("Prepared code", { objectCode });

    // 创建一个新的 Function 来执行代码，传入 React 和 UI 组件
    const createConfig = new Function("React", ...Object.keys(uiComponents), `${objectCode}`)
    const result = createConfig(React, ...Object.values(uiComponents))
    aiLog.log("Parsed result", { result });

    return result
  } catch (error) {
    aiLog.error(error as Error);
    throw new Error("Failed to parse config object")
  }
}

/**
 * 解析资源操作代码
 */
export const parseResourceOperations = async (content: string): Promise<any> => {
  try {
    aiLog.log("Starting to parse resource operations", { content });

    // 使用新的通用解析函数
    const result = await parseAICode(content, "shata-ai-resource")
    aiLog.log("Parsed result", { result });

    // 如果解析失败，尝试使用旧的 JSON 解析作为备选方案
    if (!result) {
      aiLog.log("Falling back to JSON parse");
      try {
        const jsonResult = JSON.parse(content)
        aiLog.log("JSON parse result", { jsonResult });
        return jsonResult
      } catch (jsonError) {
        aiLog.error(jsonError as Error);
        throw new Error("No valid resource operations found")
      }
    }

    return result.operations || result
  } catch (error) {
    aiLog.error(error as Error);
    message.error("资源操作解析失败，请检查格式是否正确")
    throw error
  }
}

/**
 * 解析表单编辑操作代码
 */
export const parseFormEditOperations = async (
  content: string
): Promise<(config: any, set: Function, React: any) => void> => {
  try {
    const code = extractEditCode(content)
    if (!code) {
      throw new Error("No valid edit operations found")
    }

    // 首先编译 JSX
    const jsCode = await jsxToJs(code)
    // 创建一个新的 Function 来执行编辑操作
    aiLog.log("Transformed edit operations", { jsCode });
    return new Function("config", "set", "React", ...Object.keys(uiComponents), `${jsCode}`) as (
      config: any,
      set: Function,
      React: any
    ) => void
  } catch (error) {
    aiLog.error(error as Error);
    message.error("编辑操作解析失败，请检查格式是否正确")
    throw error
  }
}

/**
 * 主函数：解析和转换配置代码
 */
export const parseFormConfig = async (content: string): Promise<any> => {
  try {
    // 使用新的通用解析函数
    return await parseAICode(content, "shata-ai-form")
  } catch (error) {
    aiLog.error(error as Error);
    message.error("配置解析失败，请检查配置格式是否正确")
    throw error
  }
}

/**
 * 验证配置对象是否符合预期格式
 */
export const validateFormConfig = (config: any): boolean => {
  try {
    // 检查基本结构
    if (!config || typeof config !== "object") return false
    if (!config.formFields || typeof config.formFields !== "object") return false

    // 检查字段定义
    for (const section of Object.values(config.formFields)) {
      if (!Array.isArray(section)) return false
      for (const field of section as any[]) {
        if (!field.name || !field.label || !field.type) return false
      }
    }

    return true
  } catch (error) {
    aiLog.error(error as Error);
    return false
  }
}
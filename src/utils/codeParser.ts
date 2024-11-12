import { message } from "@/components/Message"
import * as Babel from "@babel/standalone"
import React from "react"

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
    console.log(`[parseAICode] Starting to parse ${tag}, content length:`, content?.length)
    
    // 1. 提取标签内容
    const regex = new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`)
    const match = content.match(regex)
    if (!match) {
      console.warn(`[parseAICode] No valid ${tag} found in content`)
      console.log(`[parseAICode] Content preview:`, content?.substring(0, 200))
      throw new Error(`No valid ${tag} found`)
    }
    
    const code = match[1].trim()
    console.log(`[parseAICode] Extracted code from ${tag}:`, code)

    // 2. 使用 babel 转换
    const jsCode = await jsxToJs(code)
    console.log(`[parseAICode] Transformed code:`, jsCode)

    // 3. 解析配置对象
    const result = parseConfigObject(jsCode)
    console.log(`[parseAICode] Parsed result:`, result)

    return result
  } catch (error) {
    console.error(`[parseAICode] Failed to parse ${tag}:`, error)
    console.error(`[parseAICode] Original content:`, content)
    throw error
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
  console.log("[extractResourceCode] Starting to extract resource code")
  const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/
  const match = content.match(regex)
  const code = match ? match[1].trim() : null
  console.log("[extractResourceCode] Extracted code:", code)
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
    console.log("[jsxToJs] Starting JSX transformation")
    // 验证自定义组件
    if (!validateCustomComponents(jsxCode)) {
      throw new Error("自定义组件验证失败")
    }

    const result = Babel.transform(jsxCode, {
      presets: ["react"],
    }).code
    console.log("[jsxToJs] Transformed code:", result)
    return result
  } catch (error) {
    console.error("Failed to transform JSX:", error)
    throw new Error("Failed to transform JSX")
  }
}

/**
 * 解析配置对象
 */
const parseConfigObject = (jsCode: string): any => {
  try {
    console.log("[parseConfigObject] Starting to parse config object")
    // 移除 export default 并获取对象部分
    const objectCode = jsCode.replace(/export\s+default\s+/, "return ")
    console.log("[parseConfigObject] Prepared code:", objectCode)

    // 创建一个新的 Function 来执行代码，传入 React 和 UI 组件
    const createConfig = new Function("React", ...Object.keys(uiComponents), `${objectCode}`)
    const result = createConfig(React, ...Object.values(uiComponents))
    console.log("[parseConfigObject] Parsed result:", result)

    return result
  } catch (error) {
    console.error("Failed to parse config object:", error)
    throw new Error("Failed to parse config object")
  }
}

/**
 * 解析资源操作代码
 */
export const parseResourceOperations = async (content: string): Promise<any> => {
  try {
    console.log("[parseResourceOperations] Starting to parse resource operations")
    console.log("[parseResourceOperations] Input content:", content)

    // 使用新的通用解析函数
    const result = await parseAICode(content, "shata-ai-resource")
    console.log("[parseResourceOperations] Parsed result:", result)

    // 如果解析失败，尝试使用旧的 JSON 解析作为备选方案
    if (!result) {
      console.log("[parseResourceOperations] Falling back to JSON parse")
      try {
        const jsonResult = JSON.parse(content)
        console.log("[parseResourceOperations] JSON parse result:", jsonResult)
        return jsonResult
      } catch (jsonError) {
        console.error("[parseResourceOperations] JSON parse failed:", jsonError)
        throw new Error("No valid resource operations found")
      }
    }

    return result.operations || result
  } catch (error) {
    console.error("[parseResourceOperations] Failed to parse operations:", error)
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
    console.log(jsCode)
    return new Function("config", "set", "React", ...Object.keys(uiComponents), `${jsCode}`) as (
      config: any,
      set: Function,
      React: any
    ) => void
  } catch (error) {
    console.error("Failed to parse edit operations:", error)
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
    console.error("Failed to parse form config:", error)
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
    console.error("Config validation failed:", error)
    return false
  }
}
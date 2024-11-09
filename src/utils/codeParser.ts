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
    // 验证自定义组件
    if (!validateCustomComponents(jsxCode)) {
      throw new Error("自定义组件验证失败")
    }

    return Babel.transform(jsxCode, {
      presets: ["react"],
    }).code
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
    // 移除 export default 并获取对象部分
    const objectCode = jsCode.replace(/export\s+default\s+/, "return ")

    // 创建一个新的 Function 来执行代码，传入 React 和 UI 组件
    const createConfig = new Function("React", ...Object.keys(uiComponents), `${objectCode}`)

    return createConfig(React, ...Object.values(uiComponents))
  } catch (error) {
    console.error("Failed to parse config object:", error)
    throw new Error("Failed to parse config object")
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
    // 提取代码
    const code = extractCode(content)
    if (!code) {
      throw new Error("No valid code found in content")
    }

    // 转换 JSX
    const jsCode = await jsxToJs(code)

    // 解析配置对象
    const config = parseConfigObject(jsCode)

    return config
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

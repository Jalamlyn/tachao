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
  Button,
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
    aiLog.log(`Starting to parse ${tag}`, {
      contentLength: content?.length,
      contentFirstChars: content?.substring(0, 50),
      contentLastChars: content?.substring(content.length - 50),
    })

    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`)
    const match = content.match(regex)
    if (!match) {
      aiLog.log(`No valid ${tag} found in content`)
      throw new Error(`No valid ${tag} found`)
    }

    const code = match[1].trim()
    const jsCode = await jsxToJs(code)
    const result = parseConfigObject(jsCode)

    return result
  } catch (error) {
    aiLog.error(error as Error)
    throw error
  }
}

/**
 * 将 JSX 代码转换为 JavaScript
 */
export const jsxToJs = async (jsxCode: string): Promise<string> => {
  try {
    const result = Babel.transform(jsxCode, {
      presets: ["react"],
    }).code
    return result
  } catch (error) {
    throw new Error("Failed to transform JSX")
  }
}

/**
 * 解析配置对象
 */
const parseConfigObject = (jsCode: string): any => {
  try {
    const objectCode = jsCode.replace(/export\s+default\s+/, "return ")
    const createConfig = new Function("React", ...Object.keys(uiComponents), objectCode)
    const result = createConfig(React, ...Object.values(uiComponents))
    return result
  } catch (error) {
    aiLog.error(error as Error)
    throw new Error("Failed to parse config object")
  }
}

/**
 * 解析资源操作代码
 */
export const parseResourceOperations = async (content: string): Promise<any> => {
  try {
    const result = await parseAICode(content, "shata-ai-resource")
    return result.operations || result
  } catch (error) {
    aiLog.error(error as Error)
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
    const regex = /<shata-ai-edit>([\s\S]*?)<\/shata-ai-edit>/
    const match = content.match(regex)
    if (!match) {
      throw new Error("No valid edit operations found")
    }

    const code = match[1].trim()
    const jsCode = await jsxToJs(code)
    return new Function("config", "set", "React", ...Object.keys(uiComponents), jsCode) as (
      config: any,
      set: Function,
      React: any
    ) => void
  } catch (error) {
    aiLog.error(error as Error)
    message.error("编辑操作解析失败，请检查格式是否正确")
    throw error
  }
}

/**
 * 解析表单配置代码
 */
export const parseFormConfig = async (content: string) => {
  try {
    // 1. 提取代码
    const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
    const match = content.match(regex)
    if (!match) {
      throw new Error("No valid code found")
    }

    const code = match[1].trim()

    // 3. 直接返回代码，不做转换
    return {
      code,
      // 为了向后兼容，可以返回一个空的配置对象
      config: {},
    }
  } catch (error) {
    console.error("Error parsing form code:", error)
    throw error
  }
}

/**
 * 验证配置对象是否符合预期格式
 */
export const validateFormConfig = (config: any): boolean => {
  try {
    if (!config || typeof config !== "object") return false
    if (!config.formFields || typeof config.formFields !== "object") return false

    for (const section of Object.values(config.formFields)) {
      if (!Array.isArray(section)) return false
      for (const field of section as any[]) {
        if (!field.name || !field.label || !field.type) return false
      }
    }

    return true
  } catch (error) {
    aiLog.error(error as Error)
    return false
  }
}

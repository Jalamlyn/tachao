import { message } from "@/components/Message"
import * as Babel from "@babel/standalone"
import React from "react"

/**
 * 从 mo-ai-form 标签中提取代码
 */
const extractCode = (content: string): string | null => {
  const regex = /<mo-ai-form>([\s\S]*?)<\/mo-ai-form>/
  const match = content.match(regex)
  return match ? match[1].trim() : null
}

/**
 * 将 JSX 代码转换为 JavaScript
 */
const jsxToJs = async (jsxCode: string): Promise<string> => {
  try {
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

    // 创建一个新的 Function 来执行代码
    const createConfig = new Function("React", `${objectCode}`)

    return createConfig(React)
  } catch (error) {
    console.error("Failed to parse config object:", error)
    throw new Error("Failed to parse config object")
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

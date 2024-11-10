import type { PageConfig } from '../types/page'

/**
 * 解析页面配置
 */
export const parsePageConfig = async (
  rawConfig: string
): Promise<PageConfig | null> => {
  try {
    // 提取 <shata-ai-page> 标签中的内容
    const match = rawConfig.match(/<shata-ai-page>([\s\S]*?)<\/shata-ai-page>/)
    if (!match) {
      throw new Error("无效的页面配置格式")
    }
    
    // 清理代码块标记
    const configString = match[1]
      .replace(/```mo/g, '')
      .replace(/```/g, '')
      .trim()
    
    // 解析配置对象
    const config = eval(`(${configString})`)
    
    // 验证必要字段
    if (!config.metadata?.title) {
      throw new Error("缺少页面标题")
    }
    
    if (!config.layout) {
      throw new Error("缺少布局配置")
    }
    
    if (!Array.isArray(config.content)) {
      throw new Error("内容配置必须是数组")
    }
    
    return config as PageConfig
  } catch (error) {
    console.error("Error parsing page config:", error)
    throw new Error("解析页面配置失败：" + (error as Error).message)
  }
}
import { jsonParse, jsonStringify } from "@/utils"
import { logger } from "./types"

/**
 * 生成规范化的元数据ID
 */
export const generateMetadataId = (type: string, customId?: string): string => {
  if (customId) {
    const cleanId = customId.replace(new RegExp(`^${type}_`), "")
    return `${type}_${cleanId}`
  }
  return `${type}_${Date.now()}`
}

export { jsonParse, jsonStringify, logger }
import { logger } from "@/utils/logger"

/**
 * 元数据索引接口
 */
export interface MetadataIndex {
  id: string
  type: string
  title: string       // 统一的title字段
  status: string
  updatedAt: string
  // 保留template相关字段以保证兼容性
  template?: {
    id: string
    title: string
    type: string
  }
  // 索引字段
  indexFields?: {
    templateId?: string
    templateTitle?: string
    templateType?: string
    orderNumber?: string
    createdAt: string
    updatedAt?: string
    [key: string]: any
  }
  [key: string]: any // 支持扩展字段
}

/**
 * 元数据详情接口
 */
export interface MetadataDetail<T = any> {
  id: string
  type: string
  title: string        // 统一的title字段
  status: string
  data: T
  versionCode: number
  modifiedBy: string
  createdAt: string
  updatedAt: string
  // 保留template相关字段以保证兼容性
  template?: {
    id: string
    title: string
    type: string
  }
  indexFields?: {
    templateId?: string
    templateTitle?: string
    templateType?: string
    orderNumber?: string
    createdAt: string
    updatedAt?: string
    [key: string]: any
  }
  [key: string]: any
}

// 导出日志记录器以供其他模块使用
export { logger }
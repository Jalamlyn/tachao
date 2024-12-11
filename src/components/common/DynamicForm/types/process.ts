/**
 * @fileoverview 流程相关类型定义
 * @description 定义了表单流程处理的相关类型
 * @since 1.0.0
 */

import { FormField } from "./field"

/**
 * 流程步骤依赖
 * @description 定义流程步骤之间的依赖关系
 */
export interface ProcessStepDependency {
  /** 依赖的步骤 */
  step: string
  /** 依赖条件 */
  condition?: {
    /** 字段名 */
    field?: string
    /** 字段值 */
    value?: any
    /** 自定义条件 */
    custom?: (stepData: any) => boolean
  }
  /** 提示消息 */
  message?: string
}

/**
 * 流程步骤超时配置
 * @description 配置流程步骤的超时处理
 */
export interface ProcessStepTimeout {
  /** 持续时间 */
  duration: number
  /** 超时动作 */
  action: "warn" | "block" | "auto-approve" | "auto-reject"
  /** 提示消息 */
  message?: string
  /** 回调函数 */
  callback?: (step: string) => void
}

/**
 * 流程步骤审批人配置
 * @description 配置流程步骤的审批人
 */
export interface ProcessStepApprovers {
  /** 审批类型 */
  type: "single" | "multiple" | "any" | "all"
  /** 角色列表 */
  roles?: string[]
  /** 用户列表 */
  users?: string[]
  /** 最小审批人数 */
  minApprovers?: number
  /** 最大审批人数 */
  maxApprovers?: number
  /** 截止时间 */
  deadline?: number
  /** 通知类型 */
  notifyType?: "email" | "sms" | "both"
  /** 升级配置 */
  escalation?: {
    /** 升级时间 */
    after: number
    /** 升级到 */
    to: string[]
  }
}

/**
 * 流程步骤
 * @description 流程步骤的完整配置
 * 
 * @example
 * ```typescript
 * const step: ProcessStep = {
 *   key: 'review',
 *   title: '审核',
 *   description: '请审核提交的信息',
 *   fields: [
 *     { name: 'comment', label: '审核意见', type: 'textarea' }
 *   ]
 * }
 * ```
 */
export interface ProcessStep {
  /** 步骤键名 */
  key: string
  /** 步骤标题 */
  title: string
  /** 步骤描述 */
  description?: string
  /** 步骤图标 */
  icon?: string
  /** 步骤字段 */
  fields?: FormField[]
  /** 步骤依赖 */
  dependencies?: ProcessStepDependency[]
  /** 步骤权重 */
  weight?: number
  /** 超时配置 */
  timeout?: ProcessStepTimeout
  /** 审批人配置 */
  approvers?: ProcessStepApprovers
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 是否必须 */
  required?: boolean
}

/**
 * 流程步骤状态
 * @description 流程步骤的状态信息
 */
export interface ProcessStepStatus {
  /** 是否完成 */
  isCompleted: boolean
  /** 是否被阻塞 */
  isBlocked: boolean
  /** 阻塞原因 */
  blockReason?: string
}

/**
 * 流程进度
 * @description 流程的整体进度信息
 */
export interface ProcessProgress {
  /** 总步骤数 */
  total: number
  /** 已完成步骤数 */
  completed: number
  /** 当前步骤 */
  current: number
  /** 完成百分比 */
  percentage: number
  /** 步骤状态 */
  status: {
    [key: string]: ProcessStepStatus
  }
}
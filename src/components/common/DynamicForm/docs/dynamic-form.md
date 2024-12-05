# DynamicForm 动态表单组件文档

## 简介

DynamicForm 是一个灵活的动态表单组件，支持以下功能：

- 基础表单字段渲染
- 动态表格（支持多表格）
- 流程确认步骤
- 打印预览
- 自定义验证
- 动态联动

## 基础类型

### FormFieldType

表单字段类型枚举：

```mo
type FormFieldType =
  | "text" // 文本输入
  | "password" // 密码输入
  | "number" // 数字输入
  | "email" // 邮箱输入
  | "tel" // 电话输入
  | "url" // URL输入
  | "textarea" // 多行文本
  | "select" // 下拉选择
  | "date" // 日期选择
  | "datetime" // 日期时间选择
  | "file" // 文件上传
  | "image" // 图片上传
  | "custom" // 自定义组件
  | "resource" // 资源选择
```

### FormField

表单字段配置接口：

```mo
interface FormField {
  name: string // 字段名称
  label: string // 字段标签
  type: FormFieldType // 字段类型
  placeholder?: string // 占位文本
  disabled?: boolean // 是否禁用
  hidden?: boolean // 是否隐藏
  required?: boolean // 是否必填
  tooltip?: TooltipConfig // 提示配置
  validators?: Array<(value: any, allValues?: any) => string | undefined> // 自定义验证器
  options?: Array<{
    // 选项配置（用于select类型）
    label: string
    value: string | number
    disabled?: boolean
  }>
  accept?: string // 文件接受类型
  resourceConfig?: {
    // 资源选择配置
    resourceName: string
    appId: string
    selectionMode?: "single" | "multiple"
  }
  onUpload?: (file: File) => Promise<void> // 上传处理函数
  render?: (props: {
    // 自定义渲染函数
    field: any
    form: UseFormReturn<any>
    isEditable: boolean
  }) => ReactNode
}
```

### ProcessStep

流程步骤配置：

```mo
interface ProcessStepDependency {
  step: string // 依赖的步骤key
  condition?: {
    field?: string // 依赖字段
    value?: any // 期望值
    custom?: (stepData: any) => boolean // 自定义验证函数
  }
  message?: string // 依赖未满足时的提示信息
}

interface ProcessStepTimeout {
  duration: number // 超时时间（毫秒）
  action: 'warn' | 'block' | 'auto-approve' | 'auto-reject'
  message?: string
}

interface ProcessStepApprovers {
  type: 'single' | 'multiple' | 'any' | 'all'
  roles?: string[]
  users?: string[]
  minApprovers?: number
}

interface ProcessStep {
  key: string // 步骤键名
  title: string // 步骤标题
  description?: string // 步骤描述
  icon?: string // 步骤图标
  fields?: FormField[] // 步骤表单字段
  dependencies?: ProcessStepDependency[] // 步骤依赖
  weight?: number // 步骤权重
  timeout?: ProcessStepTimeout // 超时配置
  approvers?: ProcessStepApprovers // 审批人配置
}
```

### 流程确认功能

新版本的流程确认功能支持以下特性：

1. 标签页布局
   - 使用标签页形式展示流程步骤
   - 节省表单空间
   - 清晰展示步骤状态

2. 步骤依赖关系
   - 支持步骤间的依赖配置
   - 可设置字段值条件
   - 支持自定义验证函数
   - 提供清晰的依赖提示

3. 进度指示
   - 显示整体完成进度
   - 支持步骤权重
   - 展示步骤状态（已完成/被阻塞）

4. 超时处理
   - 可配置步骤超时时间
   - 支持多种超时动作
   - 自定义超时提示

5. 审批人配置
   - 支持多种审批模式
   - 角色和用户级别的权限控制
   - 最小审批人数设置

使用示例：

```typescript
const processSteps = [
  {
    key: 'basic_info',
    title: '基础信息',
    weight: 1,
    timeout: {
      duration: 24 * 60 * 60 * 1000, // 24小时
      action: 'warn'
    }
  },
  {
    key: 'department_approval',
    title: '部门审批',
    weight: 2,
    dependencies: [
      {
        step: 'basic_info',
        condition: {
          field: 'amount',
          custom: (value) => value > 1000
        }
      }
    ],
    approvers: {
      type: 'all',
      roles: ['DEPARTMENT_MANAGER']
    }
  }
]
```

## 最佳实践

1. 步骤依赖配置
   - 避免循环依赖
   - 保持依赖链条简单
   - 提供清晰的依赖提示
   - 考虑添加依赖自动解除机制

2. 进度展示
   - 合理设置步骤权重
   - 提供多种进度展示方式
   - 突出显示异常状态
   - 添加预计完成时间

3. 用户体验
   - 清晰的视觉反馈
   - 步骤说明和帮助信息
   - 支持步骤间快速导航
   - 保存未完成步骤数据

4. 权限控制
   - 严格的角色验证
   - 灵活的审批人配置
   - 完整的操作日志
   - 超时自动处理

## 注意事项

1. 性能优化
   - 避免不必要的重渲染
   - 合理使用缓存
   - 异步加载大数据

2. 数据一致性
   - 保存所有步骤状态
   - 处理并发操作
   - 验证数据完整性

3. 错误处理
   - 友好的错误提示
   - 完整的错误日志
   - 提供恢复机制

4. 扩展性
   - 支持自定义组件
   - 预留扩展接口
   - 保持向后兼容
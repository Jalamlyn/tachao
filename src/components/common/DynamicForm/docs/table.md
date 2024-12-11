# 表格相关类型定义

## TableColumn
表格列配置接口:
```typescript
interface TableColumn {
  key: string
  title: string
  type: FormFieldType
  width?: string | number
  editable?: boolean
  required?: boolean
  placeholder?: string
  options?: Array<{
    label: string
    value: string | number
  }>
  resourceConfig?: ResourceConfig & {
    showTrigger?: boolean // 是否显示触发按钮
    triggerPosition?: "right" | "cell" // 触发按钮位置
    inlineDisplay?: boolean // 是否内联显示选择界面
  }
  render?: (value: any, record: any, index: number) => ReactNode
  summary?: {
    render?: (value: any) => ReactNode
  }
  className?: string
  style?: React.CSSProperties
  isMappedField?: boolean
  mappedFrom?: string
}
```

## TableSummary
表格汇总配置接口:
```typescript
interface TableSummary {
  show?: boolean
  label?: string
  className?: string
  style?: React.CSSProperties
}
```

## TableConfig
表格配置接口:
```typescript
interface TableConfig {
  columns: TableColumn[]
  toolbar?: ReactNode
  summary?: TableSummary
}
```

## TableGroup
表格分组接口:
```typescript
interface TableGroup {
  key: string
  title: string
  description?: string
  icon?: string
  config: TableConfig
  className?: string
  style?: React.CSSProperties
}
```
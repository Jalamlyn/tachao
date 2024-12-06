# DynamicForm AI 配置文档

## 类型定义

```typescript
type FormFieldType =
  | "text"
  | "password" 
  | "number"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "date"
  | "datetime"
  | "file"
  | "image"
  | "custom"
  | "resource"
  | "signature"
  | "radio"
  | "checkbox"
  | "switch"
  | "slider"

interface FormField {
  name: string
  label: string
  type: FormFieldType
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  required?: boolean
  tooltip?: TooltipConfig
  validators?: Array<(value: any, allValues?: any) => string | undefined>
  options?: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>
  accept?: string
  resourceConfig?: ResourceConfig
  onUpload?: (file: File) => Promise<void>
  render?: (props: {
    field: any
    form: UseFormReturn<any>
    isEditable: boolean
  }) => ReactNode
  width?: number | string
  height?: number
  lineWidth?: number
  lineColor?: string
  className?: string
  checkedLabel?: string
  uncheckedLabel?: string
  min?: number
  max?: number
  step?: number
  layout?: "horizontal" | "vertical"
}

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
  resourceConfig?: ResourceConfig
  render?: (value: any, record: any, index: number) => ReactNode
  summary?: {
    calculate?: (records: any[]) => any
    render?: (value: any) => ReactNode
  }
}

interface DynamicFormConfig {
  metadata: {
    title: string
    description?: string
    permissions?: {
      edit?: boolean
      delete?: boolean
      print?: boolean
    }
  }
  renderConfig: {
    basicFields: FormField[] | {
      groups: FormFieldGroup[]
      defaultGroup?: string
    }
    table?: TableConfig
    tables?: TableGroup[]
    processSteps?: ProcessStep[]
  }
  orderNumberConfig?: {
    prefix?: string
    fieldName?: string
    label?: string
  }
  watch?: (form: UseFormReturn<any>) => () => void
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult
}
```

## 计算字段最佳实践

对于需要计算的字段,建议使用watch统一处理,而不是使用formula配置。示例:

```typescript
{
  config: {
    // ... 其他配置
    watch: (form) => {
      const subscription = form.watch((value, { name }) => {
        // 1. 折旧值计算
        if (name === "purchaseAmount" || name === "salvageValueRate") {
          const amount = Number(value.purchaseAmount) || 0;
          const rate = Number(value.salvageValueRate) || 0;
          form.setValue("depreciationValue", amount * (1 - rate / 100));
        }
        
        // 2. 盘盈盘亏计算
        if(name === "actualQuantity" || name === "bookQuantity") {
          const actual = Number(value.actualQuantity) || 0;
          const book = Number(value.bookQuantity) || 0;
          form.setValue("inventoryDifference", actual - book);
        }
      });
      return () => subscription.unsubscribe();
    }
  }
}
```

使用watch处理计算字段的优势:

1. 统一的数据处理方式
2. 更灵活的计算逻辑
3. 更好的错误处理
4. 可以处理复杂的依赖关系
5. 便于调试和维护

建议的计算字段处理模式:

1. 在watch中集中管理所有计算逻辑
2. 做好类型转换和默认值处理
3. 添加适当的错误处理
4. 保持代码的可维护性
5. 添加必要的日志记录

## 配置示例

### 基础表单
[其他配置示例保持不变...]
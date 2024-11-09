# DynamicForm 动态表单组件文档

## 目录
1. [简介](#简介)
2. [基础类型](#基础类型)
3. [表单配置](#表单配置)
4. [表格配置](#表格配置)
5. [流程确认配置](#流程确认配置)
6. [示例](#示例)

## 简介

DynamicForm 是一个灵活的动态表单组件，支持以下功能：
- 基础表单字段渲染
- 动态表格
- 流程确认步骤
- 打印预览
- 自定义验证
- 动态联动

## 基础类型

### FormFieldType

表单字段类型枚举：

```typescript
type FormFieldType =
  | "text"        // 文本输入
  | "password"    // 密码输入
  | "number"      // 数字输入
  | "email"       // 邮箱输入
  | "tel"         // 电话输入
  | "url"         // URL输入
  | "textarea"    // 多行文本
  | "select"      // 下拉选择
  | "date"        // 日期选择
  | "datetime"    // 日期时间选择
  | "file"        // 文件上传
  | "image"       // 图片上传
  | "custom"      // 自定义组件
  | "resource"    // 资源选择
```

### FormField

表单字段配置接口：

```typescript
interface FormField {
  name: string;                 // 字段名称
  label: string;               // 字段标签
  type: FormFieldType;         // 字段类型
  placeholder?: string;        // 占位文本
  disabled?: boolean;          // 是否禁用
  hidden?: boolean;            // 是否隐藏
  required?: boolean;          // 是否必填
  tooltip?: TooltipConfig;     // 提示配置
  validators?: Array<(value: any, allValues?: any) => string | undefined>; // 自定义验证器
  options?: Array<{           // 选项配置（用于select类型）
    label: string;
    value: string | number;
    disabled?: boolean;
  }>;
  accept?: string;            // 文件接受类型
  resourceConfig?: {          // 资源选择配置
    resourceName: string;
    appId: string;
    selectionMode?: "single" | "multiple";
  };
  onUpload?: (file: File) => Promise<void>;  // 上传处理函数
  render?: (props: {         // 自定义渲染函数
    field: any;
    form: UseFormReturn<any>;
    isEditable: boolean;
  }) => ReactNode;
}
```

## 表单配置

### DynamicFormConfig

表单总体配置接口：

```typescript
interface DynamicFormConfig {
  metadata: FormMetadata;           // 元数据配置
  renderConfig: FormRenderConfig;   // 渲染配置
  orderNumberConfig?: {             // 单号配置
    prefix?: string;
    fieldName?: string;
    label?: string;
  };
  watch?: (form: UseFormReturn<any>) => (() => void);  // 表单监听函数
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult;  // 表单验证函数
}
```

### FormMetadata

表单元数据配置：

```typescript
interface FormMetadata {
  title: string;                // 表单标题
  description?: string;         // 表单描述
  permissions?: {              // 权限配置
    edit?: boolean;
    delete?: boolean;
    print?: boolean;
  };
}
```

## 表格配置

### TableConfig

表格配置接口：

```typescript
interface TableConfig {
  columns: TableColumn[];     // 列配置
  toolbar?: ReactNode;        // 工具栏
  summary?: TableSummary;     // 汇总配置
}
```

### TableColumn

表格列配置：

```typescript
interface TableColumn {
  key: string;                // 列键名
  title: string;              // 列标题
  type: FormFieldType;        // 列类型
  width?: string | number;    // 列宽度
  editable?: boolean;         // 是否可编辑
  required?: boolean;         // 是否必填
  placeholder?: string;       // 占位文本
  options?: Array<{          // 选项配置
    label: string;
    value: string | number;
  }>;
  resourceConfig?: {         // 资源配置
    resourceName: string;
    appId: string;
    selectionMode?: "single" | "multiple";
  };
  render?: (value: any, record: any, index: number) => ReactNode;  // 自定义渲染
  summary?: {               // 汇总配置
    calculate?: (records: any[]) => any;
    render?: (value: any) => ReactNode;
  };
}
```

## 流程确认配置

### ProcessStep

流程步骤配置：

```typescript
interface ProcessStep {
  key: string;              // 步骤键名
  title: string;            // 步骤标题
  description?: string;     // 步骤描述
  icon?: string;           // 步骤图标
  fields?: FormField[];    // 步骤表单字段
}
```

## 示例

### 基础表单示例

```typescript
const formConfig: DynamicFormConfig = {
  metadata: {
    title: "基础信息表单",
    description: "用于收集基本信息",
    permissions: {
      edit: true,
      print: true
    }
  },
  renderConfig: {
    basicFields: [
      {
        name: "name",
        label: "姓名",
        type: "text",
        required: true
      },
      {
        name: "email",
        label: "邮箱",
        type: "email",
        validators: [
          (value) => {
            if (!value.includes("@")) {
              return "请输入有效的邮箱地址";
            }
          }
        ]
      }
    ]
  }
};
```

### 表格示例

```typescript
const tableConfig: TableConfig = {
  columns: [
    {
      key: "name",
      title: "商品名称",
      type: "text",
      required: true
    },
    {
      key: "price",
      title: "单价",
      type: "number",
      width: 120,
      summary: {
        calculate: (records) => records.reduce((sum, rec) => sum + (rec.price || 0), 0)
      }
    }
  ],
  summary: {
    show: true,
    label: "合计"
  }
};
```

### 流程确认示例

```typescript
const processSteps: ProcessStep[] = [
  {
    key: "review",
    title: "审核确认",
    description: "请确认以下信息",
    icon: "mdi:check-circle",
    fields: [
      {
        name: "comments",
        label: "审核意见",
        type: "textarea",
        required: true
      }
    ]
  }
];
```

## 注意事项

1. 表单字段验证
- 必填字段验证会自动进行
- 可以通过 validators 数组添加自定义验证
- 支持异步验证

2. 表格功能
- 支持行编辑
- 支持列汇总
- 支持自定义渲染

3. 流程确认
- 支持多步骤确认
- 每个步骤可以包含独立的表单
- 支持确认状态追踪

4. 打印功能
- 支持自定义打印样式
- 支持打印预览
- 支持分页打印

## 最佳实践

1. 字段命名
- 使用有意义的字段名
- 保持命名风格一致
- 避免特殊字符

2. 验证规则
- 合理使用必填验证
- 添加适当的自定义验证
- 提供清晰的错误提示

3. 表单布局
- 相关字段组织在一起
- 使用合适的字段类型
- 提供必要的帮助信息

4. 性能优化
- 避免过多的表单监听
- 合理使用异步验证
- 控制表格数据量

## 常见问题

1. 表单验证不生效
- 检查字段是否正确配置
- 确认验证器返回格式正确
- 查看控制台错误信息

2. 表格显示异常
- 检查列配置是否完整
- 确认数据格式正确
- 验证自定义渲染函数

3. 打印样式问题
- 使用专门的打印样式
- 检查媒体查询配置
- 测试不同打印设备

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础表单功能
- 支持表格和流程确认

### v1.1.0
- 添加打印功能
- 优化表单验证
- 改进错误提示

## 贡献指南

1. 提交 Issue
- 描述问题或建议
- 提供复现步骤
- 附加相关代码

2. 提交 PR
- 遵循代码规范
- 添加必要的测试
- 更新相关文档
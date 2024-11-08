# 动态表单配置指南

## 目录
1. [简介](#简介)
2. [配置结构概览](#配置结构概览)
3. [详细配置说明](#详细配置说明)
   3.1 [元数据配置（metadata）](#元数据配置)
   3.2 [渲染配置（renderConfig）](#渲染配置)
      - [基本字段（basicFields）](#基本字段)
      - [自定义渲染（Custom Rendering）](#自定义渲染)
      - [表格配置（table）](#表格配置)
      - [流程步骤（processSteps）](#流程步骤)
   3.3 [订单号配置（orderNumberConfig）](#订单号配置)
   3.4 [验证配置（validate）](#验证配置)
   3.5 [依赖关系配置（dependencies）](#依赖关系配置)
4. [完整配置示例](#完整配置示例)
5. [最佳实践](#最佳实践)
6. [常见问题（FAQ）](#常见问题)

## 简介

动态表单配置是一个强大的工具，允许您通过 JSON 配置来定义复杂的表单结构和行为，而无需编写大量的 React 代码。本文档将详细介绍如何正确配置动态表单，以满足各种业务需求。

## 配置结构概览

```typescript
interface DynamicFormConfig {
  metadata: FormMetadata;
  renderConfig: FormRenderConfig;
  orderNumberConfig?: OrderNumberConfig;
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult;
  dependencies?: DependencyConfig;
}
```

## 详细配置说明

### 元数据配置

元数据配置定义了表单的基本信息。

```typescript
interface FormMetadata {
  title: string;                // 表单标题（必填）
  description?: string;         // 表单描述（可选）
  permissions?: {              // 定义表单的操作权限（可选）
    edit?: boolean;
    delete?: boolean;
    print?: boolean;
  };
  type?: string;               // 表单类型（可选）
}
```

示例：
```javascript
const metadata = {
  title: "请假申请表",
  description: "用于员工请假申请和审批",
  permissions: {
    edit: true,
    delete: false,
    print: true
  },
  type: "leave-request"
};
```

### 渲染配置

渲染配置定义了表单的具体结构和字段。

#### 基本字段

基本字段是表单的主要组成部分，每个字段都有以下属性：

```typescript
interface FormField {
  name: string;                // 字段名称
  label: string;               // 字段标签
  type: FormFieldType;         // 字段类型
  placeholder?: string;        // 占位文本
  disabled?: boolean;          // 是否禁用
  hidden?: boolean;            // 是否隐藏
  required?: boolean;          // 是否必填
  tooltip?: TooltipConfig;     // 提示信息配置
  validators?: Array<(value: any, allValues?: any) => string | undefined>;  // 验证器
  showWhen?: {                // 条件显示配置
    field: string;
    value: any;
    operator?: "eq" | "neq" | "gt" | "lt" | "contains";
  };
}
```

支持的字段类型：
- text：文本输入
- password：密码输入
- number：数字输入
- email：邮箱输入
- tel：电话输入
- url：URL输入
- textarea：多行文本
- select：下拉选择
- date：日期选择
- datetime：日期时间选择
- custom：自定义组件

示例：
```javascript
const basicFields = [
  {
    name: "name",
    label: "姓名",
    type: "text",
    required: true,
    tooltip: {
      content: "请输入真实姓名",
      placement: "right"
    }
  },
  {
    name: "leaveType",
    label: "请假类型",
    type: "select",
    required: true,
    options: [
      { label: "年假", value: "annual" },
      { label: "事假", value: "personal" },
      { label: "病假", value: "sick" }
    ]
  }
];
```

#### 自定义渲染

字段可以通过 `render` 属性来自定义渲染内容。

```typescript
interface RenderProps {
  field: any;                 // 字段相关的属性和方法
  form: UseFormReturn<any>;   // react-hook-form 表单实例
  isEditable: boolean;        // 当前字段是否可编辑
}
```

示例：

1. 基本自定义输入框：
```javascript
{
  name: "username",
  label: "用户名",
  type: "custom",
  render: ({ field, form, isEditable }) => (
    <Input 
      {...field} 
      disabled={!isEditable}
      placeholder="请输入用户名" 
    />
  )
}
```

2. 带验证按钮的输入框：
```javascript
{
  name: "applicant",
  label: "申请人",
  type: "custom",
  render: ({ field, form, isEditable }) => (
    <div className="flex items-center space-x-2">
      <Input 
        {...field}
        disabled={!isEditable} 
        className="flex-grow" 
      />
      <Button 
        color="primary" 
        variant="solid" 
        size="sm"
        isDisabled={!isEditable}
        onClick={() => {
          console.log('验证申请人', field.value);
        }}
      >
        核验
      </Button>
    </div>
  )
}
```

注意事项：

1. **Props 解构**
   - render 函数接收 `{ field, form, isEditable }` 作为参数
   - 必须正确解构这些 props 以访问相关属性和方法

2. **可编辑状态**
   - 使用 `isEditable` 控制表单元素的禁用状态
   - 对于自定义按钮等交互元素，也应该考虑禁用状态

3. **UI组件使用**
   - 表单中只能使用 shadcn UI 组件库中的组件
   - Button 组件必须使用 NextUI 的 Button
   - 确保正确导入所需的组件

#### 表格配置

表格配置用于创建动态表格，通常用于录入多行数据。

```typescript
interface TableConfig {
  columns: TableColumn[];
  summary?: TableSummary;
  rowCalculations?: TableRowCalculations;
}

interface TableColumn {
  key: string;
  title: string;
  type: TableColumnType;
  width?: string | number;
  editable?: boolean;
  required?: boolean;
}
```

示例：
```javascript
const tableConfig = {
  columns: [
    { key: "item", title: "物品", type: "text", required: true },
    { key: "quantity", title: "数量", type: "number", width: 100 },
    { key: "price", title: "单价", type: "number", width: 100 },
    { 
      key: "total", 
      title: "小计", 
      type: "number", 
      width: 100,
      render: (value, record) => record.quantity * record.price
    }
  ],
  summary: {
    fields: {
      totalAmount: {
        label: "总金额",
        calculate: (records) => records.reduce((sum, record) => sum + (record.quantity * record.price), 0)
      }
    }
  }
};
```

#### 流程步骤

流程步骤用于创建多步骤表单。

```typescript
interface ProcessStep {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  fields?: FormField[];
}
```

示例：
```javascript
const processSteps = [
  {
    key: "apply",
    title: "申请信息",
    icon: "mdi:form-select",
    fields: [
      { name: "reason", label: "请假原因", type: "textarea", required: true }
    ]
  },
  {
    key: "approve",
    title: "审批信息",
    icon: "mdi:check-circle",
    fields: [
      { name: "approver", label: "审批人", type: "text", required: true }
    ]
  }
];
```

### 订单号配置

订单号配置用于生成自动递增的订单号。

```typescript
interface OrderNumberConfig {
  prefix?: string;      // 前缀
  fieldName?: string;   // 字段名
  label?: string;       // 标签文本
}
```

示例：
```javascript
const orderNumberConfig = {
  prefix: "LEAVE",
  fieldName: "leaveNo",
  label: "请假单号"
};
```

### 验证配置

验证配置允许您定义自定义的表单级验证逻辑。

```typescript
interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  fields?: { [key: string]: string };
}
```

示例：
```javascript
const validate = async (values) => {
  const errors = [];
  const warnings = [];

  if (values.endDate && values.startDate) {
    if (new Date(values.endDate) < new Date(values.startDate)) {
      errors.push("结束日期不能早于开始日期");
    }
  }

  if (values.leaveType === 'sick' && !values.attachment) {
    warnings.push("建议上传病假证明");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fields: {
      endDate: new Date(values.endDate) < new Date(values.startDate) 
        ? "结束日期不能早于开始日期" 
        : undefined
    }
  };
};
```

### 依赖关系配置

依赖关系配置用于定义字段之间的动态关系。

```typescript
interface DependencyConfig {
  [key: string]: {
    dependsOn: string[];
    calculate: (values: any) => any;
  };
}
```

示例：
```javascript
const dependencies = {
  totalDays: {
    dependsOn: ["startDate", "endDate"],
    calculate: (values) => {
      if (!values.startDate || !values.endDate) return 0;
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
  }
};
```

## 完整配置示例

```javascript
const formConfig = {
  metadata: {
    title: "请假申请表",
    description: "用于员工请假申请和审批",
    permissions: {
      edit: true,
      delete: false,
      print: true
    },
    type: "leave-request"
  },
  renderConfig: {
    basicFields: [
      {
        name: "name",
        label: "姓名",
        type: "text",
        required: true,
        tooltip: {
          content: "请输入真实姓名",
          placement: "right"
        }
      },
      {
        name: "department",
        label: "部门",
        type: "select",
        required: true,
        options: [
          { label: "技术部", value: "tech" },
          { label: "人事部", value: "hr" }
        ]
      },
      {
        name: "leaveType",
        label: "请假类型",
        type: "select",
        required: true,
        options: [
          { label: "年假", value: "annual" },
          { label: "事假", value: "personal" },
          { label: "病假", value: "sick" }
        ]
      },
      {
        name: "startDate",
        label: "开始日期",
        type: "date",
        required: true
      },
      {
        name: "endDate",
        label: "结束日期",
        type: "date",
        required: true
      },
      {
        name: "totalDays",
        label: "请假天数",
        type: "number",
        disabled: true
      }
    ],
    processSteps: [
      {
        key: "apply",
        title: "申请信息",
        icon: "mdi:form-select",
        fields: [
          {
            name: "reason",
            label: "请假原因",
            type: "textarea",
            required: true
          },
          {
            name: "attachment",
            label: "附件",
            type: "file",
            showWhen: {
              field: "leaveType",
              value: "sick",
              operator: "eq"
            }
          }
        ]
      },
      {
        key: "approve",
        title: "审批信息",
        icon: "mdi:check-circle",
        fields: [
          {
            name: "approver",
            label: "审批人",
            type: "text",
            required: true,
            render: ({ field, form, isEditable }) => (
              <div className="flex items-center space-x-2">
                <Input 
                  {...field}
                  disabled={!isEditable} 
                  className="flex-grow" 
                />
                <Button 
                  color="primary" 
                  variant="solid" 
                  size="sm"
                  isDisabled={!isEditable}
                  onClick={() => {
                    console.log('选择审批人');
                  }}
                >
                  选择
                </Button>
              </div>
            )
          }
        ]
      }
    ]
  },
  orderNumberConfig: {
    prefix: "LEAVE",
    fieldName: "leaveNo",
    label: "请假单号"
  },
  validate: async (values) => {
    const errors = [];
    const warnings = [];

    if (values.endDate && values.startDate) {
      if (new Date(values.endDate) < new Date(values.startDate)) {
        errors.push("结束日期不能早于开始日期");
      }
    }

    if (values.leaveType === 'sick' && !values.attachment) {
      warnings.push("建议上传病假证明");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fields: {
        endDate: new Date(values.endDate) < new Date(values.startDate) 
          ? "结束日期不能早于开始日期" 
          : undefined
      }
    };
  },
  dependencies: {
    totalDays: {
      dependsOn: ["startDate", "endDate"],
      calculate: (values) => {
        if (!values.startDate || !values.endDate) return 0;
        const start = new Date(values.startDate);
        const end = new Date(values.endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
    }
  }
};
```

## 最佳实践

1. **字段命名规范**
   - 使用驼峰命名法
   - 名称应具有描述性
   - 避免使用特殊字符

2. **表单验证**
   - 合理使用必填验证
   - 添加适当的字段验证
   - 处理好字段间的依赖验证

3. **用户体验**
   - 添加合适的提示信息
   - 使用 tooltip 说明字段用途
   - 合理使用禁用状态

4. **性能优化**
   - 避免过多的字段依赖
   - 优化计算逻辑
   - 合理使用缓存

5. **移动端适配**
   - 确保布局响应式
   - 适配触摸操作
   - 优化表单尺寸

## 常见问题

1. **如何处理复杂的表单逻辑？**
   - 使用 dependencies 配置处理字段依赖
   - 使用自定义渲染函数处理特殊UI
   - 合理拆分表单步骤

2. **如何实现条件字段显示？**
   - 使用 showWhen 配置
   - 在 render 函数中添加条件判断
   - 使用依赖关系控制显示逻辑

3. **如何处理文件上传？**
   - 使用 file 类型的字段
   - 在 render 函数中自定义上传组件
   - 处理好文件验证和限制

4. **如何优化打印效果？**
   - 使用 CSS 媒体查询
   - 调整打印样式
   - 控制分页位置

5. **如何处理表单数据的保存和恢复？**
   - 使用 form.reset 重置表单
   - 使用 form.setValue 设置字段值
   - 处理好数据格式转换
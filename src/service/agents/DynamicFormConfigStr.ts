export default `
# 动态表单配置指南

## 目录
1. [简介](#简介)
2. [配置结构概览](#配置结构概览)
3. [详细配置说明](#详细配置说明)
   3.1 [元数据配置（metadata）](#元数据配置)
   3.2 [渲染配置（renderConfig）](#渲染配置)
   3.3 [订单号配置（orderNumberConfig）](#订单号配置)
   3.4 [验证配置（validate）](#验证配置)
   3.5 [依赖关系配置（dependencies）](#依赖关系配置)
4. [完整配置示例](#完整配置示例)
5. [最佳实践](#最佳实践)
6. [常见问题（FAQ）](#常见问题)

## 简介

动态表单配置是一个强大的工具，允许您通过 JSON 配置来定义复杂的表单结构和行为，而无需编写大量的 React 代码。本文档将详细介绍如何正确配置动态表单，以满足各种业务需求。

## 配置结构概览

interface DynamicFormConfig {
  metadata: FormMetadata;
  renderConfig: FormRenderConfig;
  orderNumberConfig?: OrderNumberConfig;
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult;
  dependencies?: DependencyConfig;
}
详细配置说明
元数据配置
元数据配置定义了表单的基本信息。

interface FormMetadata {
  title: string;
  description?: string;
  permissions?: {
    edit?: boolean;
    delete?: boolean;
    print?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  type?: string;
}
title：表单标题（必填）
description：表单描述（可选）
permissions：定义表单的操作权限（可选）
createdAt/updatedAt：创建和更新时间（可选）
createdBy/updatedBy：创建和更新者（可选）
type：表单类型（可选）
示例：

const metadata = {
  title: "客户信息表",
  description: "用于收集和管理客户基本信息",
  permissions: {
    edit: true,
    delete: false,
    print: true
  },
  type: "customer"
};
渲染配置
渲染配置定义了表单的具体结构和字段。

interface FormRenderConfig {
  basicFields: FormField[];
  table?: TableConfig;
  processSteps?: ProcessStep[];
}
基本字段（basicFields）
基本字段是表单的主要组成部分，每个字段都有以下属性：

interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  options?: Array<{ label: string; value: string | number; disabled?: boolean }>;
  validators?: Array<(value: any, allValues?: any) => string | undefined>;
  showWhen?: {
    field: string;
    value: any;
    operator?: "eq" | "neq" | "gt" | "lt" | "contains";
  };
  resourceConfig?: {
    resourceName: string;
    appId?: string;
    selectionMode?: "single" | "multiple";
  };
  render?: (props: { field: any; form: any; isEditable: boolean }) => React.ReactNode;
}
字段类型（FormFieldType）包括：

text：文本输入
password：密码输入
number：数字输入
email：邮箱输入
tel：电话输入
url：URL输入
textarea：多行文本
select：下拉选择
date：日期选择
datetime：日期时间选择
file：文件上传
image：图片上传
custom：自定义组件
resource：资源选择
示例：

const basicFields = [
  {
    name: "name",
    label: "姓名",
    type: "text",
    required: true,
    placeholder: "请输入姓名"
  },
  {
    name: "age",
    label: "年龄",
    type: "number",
    validators: [
      (value) => value < 18 ? "年龄必须大于或等于18岁" : undefined
    ]
  },
  {
    name: "email",
    label: "邮箱",
    type: "email",
    validators: [
      (value) => !value.includes("@") ? "请输入有效的邮箱地址" : undefined
    ]
  },
  {
    name: "gender",
    label: "性别",
    type: "select",
    options: [
      { label: "男", value: "male" },
      { label: "女", value: "female" },
      { label: "其他", value: "other" }
    ]
  }
];
表格配置（table）
表格配置用于创建动态表格，通常用于录入多行数据。

interface TableConfig {
  columns: TableColumn[];
  summary?: TableSummary;
  rowCalculations?: TableRowCalculations;
}
表格列配置：

interface TableColumn {
  key: string;
  title: string;
  type: TableColumnType;
  width?: string | number;
  editable?: boolean;
  required?: boolean;
  options?: Array<{ label: string; value: string | number; disabled?: boolean }>;
  resourceConfig?: {
    resourceName: string;
    appId?: string;
    selectionMode?: "single" | "multiple";
  };
  render?: (value: any, record: any, index: number) => React.ReactNode;
}
示例：

const tableConfig = {
  columns: [
    { key: "product", title: "产品", type: "text", required: true },
    { key: "quantity", title: "数量", type: "number", width: 100 },
    { key: "price", title: "单价", type: "number", width: 100 },
    { 
      key: "total", 
      title: "总价", 
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
  },
  rowCalculations: {
    total: (row) => row.quantity * row.price
  }
};
流程步骤（processSteps）
流程步骤用于创建多步骤表单。

interface ProcessStep {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  fields?: FormField[];
  onConfirm?: () => Promise<void>;
  onCancel?: () => void;
}
示例：

const processSteps = [
  {
    key: "basicInfo",
    title: "基本信息",
    icon: "user",
    fields: [
      { name: "name", label: "姓名", type: "text", required: true },
      { name: "age", label: "年龄", type: "number" }
    ]
  },
  {
    key: "contactInfo",
    title: "联系方式",
    icon: "phone",
    fields: [
      { name: "email", label: "邮箱", type: "email", required: true },
      { name: "phone", label: "电话", type: "tel" }
    ]
  },
  {
    key: "confirmation",
    title: "确认信息",
    icon: "check-circle",
    fields: [
      { name: "agree", label: "我同意隐私政策", type: "checkbox", required: true }
    ],
    onConfirm: async () => {
      // 执行确认逻辑
      console.log("表单已确认");
    }
  }
];
订单号配置
订单号配置用于生成自动递增的订单号。

interface OrderNumberConfig {
  prefix?: string;
  fieldName?: string;
  label?: string;
}
示例：

const orderNumberConfig = {
  prefix: "ORD",
  fieldName: "orderNumber",
  label: "订单编号"
};
验证配置
验证配置允许您定义自定义的表单级验证逻辑。

type ValidateFunction = (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult;

interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  fields?: { [key: string]: string };
  categorizedErrors?: {
    required?: string[];
    invalid?: string[];
    other?: string[];
  };
}
示例：

const validate = async (values, context) => {
  const errors = [];
  const warnings = [];

  if (values.age < 18) {
    errors.push("年龄必须大于或等于18岁");
  }

  if (values.email && !values.phone) {
    warnings.push("建议同时提供电话号码");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fields: {
      age: values.age < 18 ? "年龄必须大于或等于18岁" : undefined
    }
  };
};
依赖关系配置
依赖关系配置用于定义字段之间的动态关系。

interface DependencyConfig {
  [key: string]: {
    dependsOn: string[];
    calculate: (values: any) => any;
  };
}
示例：

const dependencies = {
  fullName: {
    dependsOn: ["firstName", "lastName"],
    calculate: (values) => \`\${values.firstName} \${values.lastName}\`
  },
  totalAmount: {
    dependsOn: ["quantity", "unitPrice"],
    calculate: (values) => values.quantity * values.unitPrice
  }
};
完整配置示例
以下是一个完整的动态表单配置示例，包含了所有主要部分：

const formConfig = {
  metadata: {
    title: "客户订单表",
    description: "用于创建新的客户订单",
    permissions: {
      edit: true,
      delete: false,
      print: true
    },
    type: "order"
  },
  renderConfig: {
    basicFields: [
      { name: "customerName", label: "客户姓名", type: "text", required: true },
      { name: "orderDate", label: "订单日期", type: "date", required: true },
      { 
        name: "paymentMethod", 
        label: "支付方式", 
        type: "select",
        options: [
          { label: "信用卡", value: "credit" },
          { label: "借记卡", value: "debit" },
          { label: "现金", value: "cash" }
        ]
      }
    ],
    table: {
      columns: [
        { key: "product", title: "产品", type: "text", required: true },
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
      },
      rowCalculations: {
        total: (row) => row.quantity * row.price
      }
    },
    processSteps: [
      {
        key: "orderDetails",
        title: "订单详情",
        icon: "shopping-cart",
        fields: [
          { name: "notes", label: "订单备注", type: "textarea" }
        ]
      },
      {
        key: "confirmation",
        title: "确认订单",
        icon: "check-circle",
        fields: [
          { name: "agree", label: "我已确认订单信息", type: "checkbox", required: true }
        ],
        onConfirm: async () => {
          console.log("订单已确认");
        }
      }
    ]
  },
  orderNumberConfig: {
    prefix: "ORD",
    fieldName: "orderNumber",
    label: "订单编号"
  },
  validate: async (values) => {
    const errors = [];
    if (values.orderDate && new Date(values.orderDate) < new Date()) {
      errors.push("订单日期不能早于今天");
    }
    return {
      valid: errors.length === 0,
      errors,
      fields: {
        orderDate: values.orderDate && new Date(values.orderDate) < new Date() ? "订单日期不能早于今天" : undefined
      }
    };
  },
  dependencies: {
    totalAmount: {
      dependsOn: ["table"],
      calculate: (values) => {
        return values.table.reduce((sum, row) => sum + (row.quantity * row.price), 0);
      }
    }
  }
};
### Tooltip 配置

字段可以配置 tooltip 来显示帮助信息或详细说明。

interface TooltipConfig {
  content: React.ReactNode;  // tooltip 内容，支持 React 组件
  placement?: 'top' | 'bottom' | 'left' | 'right';  // 显示位置
}

使用示例：

const formConfig = {
  renderConfig: {
    basicFields: [
      {
        name: "leaveType",
        label: "请假类型",
        type: "select",
        options: [
          { label: "年假", value: "annual" },
          { label: "事假", value: "personal" },
          { label: "病假", value: "sick" }
        ],
        tooltip: {
          content: (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">请假类型说明</h4>
              <div className="space-y-1">
                <div>• 年假：按照工龄和公司政策计算</div>
                <div>• 事假：需提前申请，扣除工资</div>
                <div>• 病假：需提供医疗证明</div>
              </div>
            </div>
          ),
          placement: "right"
        },
        required: true
      }
    ]
  }
}

tooltip 特性：

1. 支持富文本内容
2. 可自定义显示位置
3. 响应式设计
4. 支持键盘导航
5. 适配移动设备

最佳实践
字段命名：使用清晰、描述性的名称，遵循驼峰命名法。
验证：对重要字段使用多重验证，包括前端和后端验证。
依赖关系：谨慎使用依赖关系，过多的依赖可能导致性能问题。
性能考虑：对于大型表单，考虑使用分步骤加载或懒加载技术。
错误处理：提供清晰、用户友好的错误信息。
可访问性：确保表单字段有适当的标签和描述，支持键盘导航。
响应式设计：确保表单在不同设备上都能正常显示和使用。
测试：全面测试表单，包括边界情况和错误场景。
常见问题
Q: 如何处理复杂的表单逻辑？ A: 使用 dependencies 配置和自定义渲染函数来处理复杂逻辑。对于非常复杂的情况，考虑使用自定义组件。

Q: 如何实现条件字段显示？ A: 使用 showWhen 属性来定义字段的显示条件。

Q: 如何处理大量数据的表格？ A: 考虑使用分页或虚拟滚动技术。可以通过自定义渲染函数来实现这些高级功能。

Q: 如何集成第三方组件？ A: 使用 custom 类型的字段，并通过 render 函数来渲染第三方组件。

Q: 如何处理文件上传？ A: 使用 file 或 image 类型的字段，并在后端实现相应的文件处理逻辑。

Q: 如何实现多语言支持？ A: 将所有文本内容（如标签、错误信息等）存储在语言文件中，并使用国际化库（如 i18next）来动态加载文本。

记住，动态表单配置是一个强大而灵活的工具。通过合理的配置和使用，您可以创建出复杂、高效且用户友好的表单。如果遇到特殊需求，不要犹豫寻求帮助或查阅更多文档。
`

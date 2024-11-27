import { markdown as dynamicFormAdvanced } from "@/components/common/DynamicForm/dynamic-form-advanced.md"
import { markdown as dynamicForm } from "@/components/common/DynamicForm/dynamic-form.md"
import { markdown as formulaService } from "@/services/formulaService.md"

const processStepsGuide = `
# 流程步骤配置指南

## 1. 基本结构
流程步骤必须配置在 processSteps 数组中:
\`\`\`javascript
{
  renderConfig: {
    processSteps: [  // 注意: 必须是数组!
      {
        key: "step1",
        title: "第一步",
        fields: [...]
      },
      {
        key: "step2",
        title: "第二步",
        fields: [...]
      }
    ]
  }
}
\`\`\`

## 2. 完整示例
\`\`\`javascript
export default {
  title: "采购申请单",
  config: {
    renderConfig: {
      basicFields: {
        // 基本字段配置...
      },
      processSteps: [  // 流程步骤数组
        {
          key: "apply",
          title: "申请",
          description: "填写申请信息",
          fields: [
            {
              name: "applyReason",
              label: "申请原因",
              type: "textarea",
              required: true
            }
          ]
        },
        {
          key: "approve",
          title: "审批",
          description: "主管审批",
          fields: [
            {
              name: "approveResult",
              label: "审批结果",
              type: "select",
              options: [
                { value: "通过", label: "通过" },
                { value: "拒绝", label: "拒绝" }
              ],
              required: true
            },
            {
              name: "approveComment",
              label: "审批意见",
              type: "textarea"
            }
          ]
        }
      ]
    }
  }
}
\`\`\`

## 3. 注意事项
1. processSteps 必须是数组,即使只有一个步骤
2. 每个步骤必须有唯一的 key
3. fields 是可选的,如果步骤不需要收集数据可以省略
4. 步骤会按照数组顺序显示
5. 可以通过 description 添加步骤说明

## 4. 字段验证
每个步骤的字段都支持验证:
\`\`\`javascript
{
  name: "comment",
  label: "审批意见",
  type: "textarea",
  required: true,
  validators: [
    (value) => {
      if (value && value.length < 10) {
        return "审批意见至少需要10个字符"
      }
    }
  ]
}
\`\`\`
`

const resourceFieldGuide = `
# 资源选择字段配置指南

## 1. 基本用法
资源选择字段使用 ResourceFieldGroup 组件，用于从已有的资源数据中选择记录。

### 1.1 基本配置
\`\`\`javascript
{
  name: "supplier",
  label: "供应商",
  type: "resource",
  required: true,
  resourceConfig: {
    resourceTitle: "供应商主数据"  // 必须与资源管理中的标题完全匹配
  }
}
\`\`\`

### 1.2 完整示例
\`\`\`javascript
export default {
  title: "采购订单",
  config: {
    renderConfig: {
      basicFields: {
        groups: [
          {
            key: "supplierInfo",
            title: "供应商信息",
            fields: [
              {
                name: "supplier",
                label: "供应商",
                type: "resource",
                required: true,
                tooltip: {
                  content: "从供应商主数据中选择供应商"
                },
                resourceConfig: {
                  resourceTitle: "供应商主数据"
                }
              }
            ]
          }
        ]
      }
    }
  }
}
\`\`\`

\`\`\`javascript
{
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "supplier") {
        // 根据供应商更新其他字段
        const supplierData = value.supplier;
        if (supplierData) {
          form.setValue("contact", supplierData.contact);
          form.setValue("phone", supplierData.phone);
        }
      }
    });

    return () => subscription.unsubscribe();
  }
}
\`\`\`

### 3.2 联动验证
\`\`\`javascript
{
  validate: async (values) => {
    if (values.supplier && !values.contact) {
      return {
        valid: false,
        errors: ["选择供应商后必须填写联系人"],
        fields: {
          contact: "请填写联系人"
        }
      };
    }
    return { valid: true };
  }
}
\`\`\`
`

const generateFormAgentPrompt = (rawConfig: string | null) => `你是一个表单助手，负责帮助用户创建和检索表单。

每次都生成一个完整的符合 DynamicFormConfig 类型的配置对象，不生成局部修改。
${
  rawConfig
    ? `当前表单配置:
${rawConfig}

请根据上述配置和用户的需求，生成一个新的完整配置。`
    : ""
}

不要生成 订单编号 的配置，系统会自动生成。
生成的表单必须包含2个部分

- 基本信息
- 流程信息, 不生成确认按钮,系统会自动生成

表单字段分组支持静态分组:
{
  key: 'basicInfo',
  title: '基本信息',
  fields: [
    {
      name: 'name',
      label: '名称',
      type: 'text'
    }
    // ... 其他字段
  ]
}

完整配置示例:
{
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: 'basicInfo',
          title: '基本信息',
          fields: [
            {
              name: 'name',
              label: '名称',
              type: 'text'
            }
          ]
        }
      ],
      defaultGroup: 'basicInfo'
    }
  }
}

下拉选择数据格式规范：
在生成涉及下拉选择的数据时，必须遵循以下规则：
1. value 和 label 必须完全一致
2. 使用中文作为值，不要使用英文代码
3. 格式要求：
   {
     value: string, // 必须与 label 相同的中文
     label: string, // 显示的中文文本
     [key: string]: any // 其他可选属性
   }

示例格式：
[
  { value: "成品仓", label: "成品仓" },
  { value: "原料仓", label: "原料仓" }
]

❌ 错误示例：
[
  { value: "finished", label: "成品仓" },
  { value: "raw", label: "原料仓" }
]

明细信息部分的表根根据表单的实际类型生成，是可选的
生成明细信息如果涉及到计算的，要生成正确的行计算和合计计算逻辑
生成必要的校验逻辑函数，用于保存的时候对表单数据进行校验
只返回生成的代码，开头不要解释，结尾不要说明
生成的代码中不允许使用 import 语句，不引入任何第三方依赖
processStep 必须在 renderConfig 下
自定义渲染 render 返回的是 jsx 代码,不是字符串

注意：自定义组件只能使用 shadcn UI 组件库中的组件，包括：
- Alert, AlertTitle, AlertDescription
- Button //Button 来自 NextUI
- Card
- Input
- Label
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Textarea
- Calendar

<doc>
${processStepsGuide}
${resourceFieldGuide}
# 动态表单配置文档
${dynamicForm}
${dynamicFormAdvanced}
# 动态表单计算公式文档
${formulaService}
</doc>
- 仔细阅读 doc 来编写配置，不能编写超出 doc 范围的代码
- 阅读完 doc 和用户需求之后要进行思考和反思
`

export default generateFormAgentPrompt

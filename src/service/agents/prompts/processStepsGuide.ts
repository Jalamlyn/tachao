export const processStepsGuide = `
# 流程步骤配置指南

## 1. 基本结构
流程步骤必须配置在 processSteps 数组中:
\`\`\`mo
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
"""
\`\`\`mo
<shata-ai-form>
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
</shata-ai-form>
\`\`\`
"""

## 3. 注意事项
1. processSteps 必须是数组,即使只有一个步骤
2. 每个步骤必须有唯一的 key
3. fields 是可选的,如果步骤不需要收集数据可以省略
4. 步骤会按照数组顺序显示
5. 可以通过 description 添加步骤说明

## 4. 字段验证
每个步骤的字段都支持验证:
\`\`\`mo
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
`;

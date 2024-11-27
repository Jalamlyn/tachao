import { markdown as dynamicFormAdvanced } from "@/components/common/DynamicForm/dynamic-form-advanced.md"
import { markdown as dynamicForm } from "@/components/common/DynamicForm/dynamic-form.md"
import { markdown as formulaService } from "@/services/formulaService.md"

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

## 2. 最佳实践

### 2.1 字段命名规范
- 使用有意义的字段名，如 supplier、product、customer 等
- 字段名应该反映业务含义
- 保持命名的一致性

### 2.2 资源标题规范
- 使用完整的业务名称，如"供应商主数据"而不是简单的"供应商"
- 确保与资源管理中的标题完全匹配
- 使用清晰的中文名称

### 2.3 布局建议
- 资源选择字段通常占用较大空间，建议单独占据一行
- 可以与相关字段放在同一个字段组中
- 考虑移动端的显示效果

## 3. 表单联动示例

### 3.1 基于选择值更新其他字段
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

## 4. 注意事项

### 4.1 资源数据准备
- 确保资源数据已经在资源管理中创建
- 资源标题必须完全匹配
- 资源数据应该包含必要的字段

### 4.2 性能考虑
- 资源选择字段会加载完整的资源数据
- 避免在一个表单中使用过多的资源选择字段
- 考虑数据量对性能的影响

### 4.3 用户体验
- 添加合适的字段说明
- 使用清晰的标签文本
- 考虑必填字段的提示

### 4.4 错误处理
- 添加适当的验证规则
- 处理资源加载失败的情况
- 提供清晰的错误提示
`

const generateFormAgentPrompt = (rawConfig: string | null) => `
${basePrompt}

${resourceFieldGuide}

${
  rawConfig
    ? `当前表单配置:
${rawConfig}

请根据上述配置和用户的需求，生成一个新的完整配置。`
    : ""
}

请使用如下格式返回：
"""
\`\`\`mo
<shata-ai-form>
export default {
  title,
  config:{
    // 完整的表单配置对象
  }
}
</shata-ai-form>
\`\`\`
"""

[原有内容继续保持不变...]
`

export default generateFormAgentPrompt
export const resourceFieldGuide = `
# 资源选择字段配置指南

## 1. 基本用法
资源选择字段使用 ResourceFieldGroup 组件，用于从已有的资源数据中选择记录。

### 1.1 基本配置
\`\`\`mo
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
\`\`\`mo
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

\`\`\`mo
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
\`\`\`mo
<shata-ai-form>
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
</shata-ai-form>
\`\`\`
`;

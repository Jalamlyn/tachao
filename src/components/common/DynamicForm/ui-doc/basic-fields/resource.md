# 资源选择字段

## 基础资源选择
```typescript
{
  name: "basicResource",
  label: "选择资源",
  type: "resource",
  resourceConfig: {
    resourceId: "users",
    displayField: "name"
  }
}
```
基础的资源选择功能。

## 高级资源选择
```typescript
{
  name: "advancedResource",
  label: "选择客户",
  type: "resource",
  resourceConfig: {
    resourceId: "customers",
    multiple: true,
    displayFields: [
      { key: "name", label: "名称" },
      { key: "code", label: "编号" }
    ],
    displayFormat: (resource) => `${resource.name} (${resource.code})`
  }
}
```
支持多选和自定义显示格式。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "资源选择示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "resourceGroup",
          title: "资源选择字段示例",
          fields: [
            {
              name: "assignee",
              label: "负责人",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceId: "users",
                displayFields: [
                  { key: "name", label: "姓名" },
                  { key: "department", label: "部门" }
                ],
                displayFormat: (resource) => `${resource.name} - ${resource.department}`,
                fieldMapping: {
                  "email": "email",
                  "phone": {
                    field: "mobile",
                    transform: (value) => value?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
                  }
                }
              }
            },
            {
              name: "products",
              label: "关联产品",
              type: "resource",
              resourceConfig: {
                resourceId: "products",
                multiple: true,
                displayFields: [
                  { key: "name", label: "产品名称" },
                  { key: "code", label: "产品编码" },
                  { key: "price", label: "价格" }
                ],
                displayFormat: (resource) => {
                  return `${resource.name} (${resource.code}) - ¥${resource.price}`
                }
              },
              description: "可多选"
            }
          ]
        }
      ]
    }
  }
}
```
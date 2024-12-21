# 位置字段

## 基础位置
```typescript
{
  name: "basicLocation",
  label: "位置",
  type: "location"
}
```
基础的位置获取功能。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "位置示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "locationGroup",
          title: "位置字段示例",
          fields: [
            {
              name: "currentLocation",
              label: "当前位置",
              type: "location",
              required: true,
              description: "点击获取当前位置"
            },
            {
              name: "workLocation",
              label: "工作地点",
              type: "location",
              description: "请选择工作地点"
            }
          ]
        }
      ]
    }
  }
}
```
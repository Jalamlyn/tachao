# 基础布局

## 默认布局
```typescript
{
  name: "defaultLayout",
  label: "默认布局",
  type: "text"
}
```
默认情况下字段会自动适应宽度。

## 全宽布局
```typescript
{
  name: "fullWidth",
  label: "全宽布局",
  type: "text",
  layout: "full-width"
}
```
字段占据整行宽度。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "基础布局示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "layoutGroup",
          title: "基础布局示例",
          fields: [
            {
              name: "field1",
              label: "默认宽度",
              type: "text"
            },
            {
              name: "field2",
              label: "全宽字段",
              type: "textarea",
              layout: "full-width",
              rows: 4
            },
            {
              name: "field3",
              label: "自定义宽度",
              type: "text",
              style: {
                width: "300px"
              }
            },
            {
              name: "field4",
              label: "响应式宽度",
              type: "text",
              style: {
                sm: { width: "100%" },
                md: { width: "50%" },
                lg: { width: "300px" }
              }
            }
          ]
        }
      ]
    }
  }
}
```
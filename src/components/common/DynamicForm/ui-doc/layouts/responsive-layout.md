# 响应式布局

## 响应式宽度
```typescript
{
  name: "responsiveField",
  label: "响应式字段",
  type: "text",
  style: {
    sm: { width: "100%" },
    md: { width: "50%" },
    lg: { width: "33.33%" }
  }
}
```
根据屏幕尺寸自动调整宽度。

## 响应式列数
```typescript
{
  groups: [
    {
      key: "group1",
      title: "响应式分组",
      style: {
        sm: { colSpan: 1 },
        md: { colSpan: 2 },
        lg: { colSpan: 3 }
      },
      fields: []
    }
  ]
}
```
根据屏幕尺寸自动调整分组列数。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "响应式布局示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "responsiveGroup",
          title: "响应式布局",
          style: {
            sm: { colSpan: 1 },
            md: { colSpan: 2 },
            lg: { colSpan: 3 }
          },
          fields: [
            {
              name: "field1",
              label: "响应式字段1",
              type: "text",
              style: {
                sm: { width: "100%" },
                md: { width: "50%" },
                lg: { width: "33.33%" }
              }
            },
            {
              name: "field2",
              label: "响应式字段2",
              type: "select",
              style: {
                sm: { width: "100%" },
                md: { width: "50%" },
                lg: { width: "33.33%" }
              },
              options: [
                { label: "选项1", value: "1" },
                { label: "选项2", value: "2" }
              ]
            },
            {
              name: "field3",
              label: "全宽字段",
              type: "textarea",
              layout: "full-width",
              style: {
                sm: { height: "100px" },
                md: { height: "150px" },
                lg: { height: "200px" }
              }
            }
          ]
        }
      ]
    }
  }
}
```
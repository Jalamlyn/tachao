# 分组布局

## 标签页布局
```typescript
{
  groups: [
    {
      key: "group1",
      title: "分组1",
      fields: [
        {
          name: "field1",
          label: "字段1",
          type: "text"
        }
      ]
    },
    {
      key: "group2",
      title: "分组2",
      fields: [
        {
          name: "field2",
          label: "字段2",
          type: "text"
        }
      ]
    }
  ],
  layout: "tabs"
}
```
使用标签页形式展示分组。

## 垂直布局
```typescript
{
  groups: [
    {
      key: "group1",
      title: "分组1",
      icon: "mdi:account",
      description: "基本信息",
      fields: [
        {
          name: "field1",
          label: "字段1",
          type: "text"
        }
      ]
    }
  ],
  layout: "vertical"
}
```
垂直展示分组,支持图标和描述。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "分组布局示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basicInfo",
          title: "基本信息",
          icon: "mdi:account",
          description: "请填写基本信息",
          fields: [
            {
              name: "name",
              label: "姓名",
              type: "text",
              required: true
            },
            {
              name: "gender",
              label: "性别",
              type: "radio",
              options: [
                { label: "男", value: "male" },
                { label: "女", value: "female" }
              ]
            }
          ]
        },
        {
          key: "contactInfo",
          title: "联系方式",
          icon: "mdi:phone",
          description: "请填写联系方式",
          fields: [
            {
              name: "phone",
              label: "电话",
              type: "text",
              required: true
            },
            {
              name: "email",
              label: "邮箱",
              type: "text",
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            }
          ]
        },
        {
          key: "otherInfo",
          title: "其他信息",
          icon: "mdi:information",
          fields: [
            {
              name: "remark",
              label: "备注",
              type: "textarea",
              layout: "full-width"
            }
          ]
        }
      ],
      layout: "vertical" // 或 "tabs"
    }
  }
}
```
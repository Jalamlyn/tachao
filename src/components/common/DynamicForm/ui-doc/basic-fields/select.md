# 选择器字段

## 基础选择器
```typescript
{
  name: "basicSelect",
  label: "选择",
  type: "select",
  required: true,
  options: [
    { label: "选项1", value: "1" },
    { label: "选项2", value: "2" },
    { label: "选项3", value: "3" }
  ]
}
```
支持基本的下拉选择。

## 单选框组
```typescript
{
  name: "radio",
  label: "单选",
  type: "radio",
  options: [
    { label: "选项1", value: "1" },
    { label: "选项2", value: "2" },
    { label: "选项3", value: "3" }
  ],
  layout: "vertical"
}
```
使用radio类型实现单选框组。

## 复选框组
```typescript
{
  name: "checkbox",
  label: "多选",
  type: "checkbox",
  options: [
    { label: "选项1", value: "1" },
    { label: "选项2", value: "2" },
    { label: "选项3", value: "3" }
  ]
}
```
使用checkbox类型实现复选框组。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "选择器示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "selectGroup",
          title: "选择器字段示例",
          fields: [
            {
              name: "status",
              label: "状态",
              type: "select",
              required: true,
              options: [
                { label: "待处理", value: "pending" },
                { label: "处理中", value: "processing" },
                { label: "已完成", value: "completed" },
                { label: "已取消", value: "cancelled" }
              ],
              formatConfig: {
                type: "text",
                conditions: [
                  {
                    condition: value => value === "completed",
                    format: () => "已完成",
                    style: { color: "green" }
                  },
                  {
                    condition: value => value === "cancelled",
                    format: () => "已取消",
                    style: { color: "red" }
                  }
                ]
              }
            },
            {
              name: "type",
              label: "类型",
              type: "radio",
              required: true,
              options: [
                { label: "类型A", value: "A" },
                { label: "类型B", value: "B" },
                { label: "类型C", value: "C" }
              ],
              layout: "horizontal"
            },
            {
              name: "tags",
              label: "标签",
              type: "checkbox",
              options: [
                { label: "重要", value: "important" },
                { label: "紧急", value: "urgent" },
                { label: "普通", value: "normal" }
              ],
              description: "可多选"
            },
            {
              name: "category",
              label: "分类",
              type: "select",
              required: true,
              options: (form) => {
                // 根据type字段动态生成选项
                const type = form.getValues("type")
                switch(type) {
                  case "A":
                    return [
                      { label: "A-1", value: "a1" },
                      { label: "A-2", value: "a2" }
                    ]
                  case "B":
                    return [
                      { label: "B-1", value: "b1" },
                      { label: "B-2", value: "b2" }
                    ]
                  case "C":
                    return [
                      { label: "C-1", value: "c1" },
                      { label: "C-2", value: "c2" }
                    ]
                  default:
                    return []
                }
              }
            }
          ]
        }
      ]
    }
  }
}
```
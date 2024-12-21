# 数字输入字段

## 基础数字输入
```typescript
{
  name: "basicNumber",
  label: "数量",
  type: "number",
  required: true,
  min: 0,
  max: 100,
  step: 1
}
```
支持基本的数字输入,可以设置最小值、最大值和步进值。

## 金额输入
```typescript
{
  name: "amount",
  label: "金额",
  type: "number",
  required: true,
  formatConfig: {
    type: "currency",
    options: {
      currency: "CNY",
      precision: 2
    }
  },
  description: "请输入金额(元)"
}
```
使用formatConfig可以配置金额格式化。

## 百分比输入
```typescript
{
  name: "percentage",
  label: "百分比",
  type: "number",
  min: 0,
  max: 100,
  formatConfig: {
    type: "percentage",
    precision: 2
  },
  description: "请输入百分比值(0-100)"
}
```
支持百分比格式的数字输入。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "数字输入示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "numberGroup",
          title: "数字字段示例",
          fields: [
            {
              name: "quantity",
              label: "数量",
              type: "number",
              required: true,
              min: 0,
              max: 999,
              step: 1,
              description: "请输入0-999的整数"
            },
            {
              name: "price",
              label: "单价",
              type: "number",
              required: true,
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2
                }
              }
            },
            {
              name: "discount",
              label: "折扣",
              type: "number",
              min: 0,
              max: 100,
              formatConfig: {
                type: "percentage",
                precision: 2
              },
              description: "请输入折扣百分比"
            },
            {
              name: "score",
              label: "评分",
              type: "number",
              min: 0,
              max: 5,
              step: 0.5,
              formatConfig: {
                type: "number",
                precision: 1,
                conditions: [
                  {
                    condition: value => value >= 4,
                    format: value => `${value} - 优秀`,
                    style: { color: "green" }
                  },
                  {
                    condition: value => value >= 2,
                    format: value => `${value} - 合格`,
                    style: { color: "blue" }
                  },
                  {
                    condition: value => value < 2,
                    format: value => `${value} - 不合格`,
                    style: { color: "red" }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  }
}
```
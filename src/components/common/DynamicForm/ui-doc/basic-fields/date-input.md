# 日期时间输入字段

## 基础日期输入
```typescript
{
  name: "basicDate",
  label: "日期",
  type: "date",
  required: true,
  placeholder: "请选择日期"
}
```
支持基本的日期选择。

## 日期时间输入
```typescript
{
  name: "datetime",
  label: "日期时间",
  type: "datetime",
  required: true,
  formatConfig: {
    type: "datetime",
    dateFormat: "yyyy-MM-dd HH:mm:ss"
  }
}
```
支持日期和时间的选择。

## 日期范围
```typescript
{
  name: "dateRange",
  label: "日期范围",
  type: "date",
  range: true,
  formatConfig: {
    type: "date",
    dateFormat: "yyyy-MM-dd"
  },
  validators: [
    (value) => {
      if(value?.start && value?.end && value.start > value.end) {
        return "结束日期不能早于开始日期"
      }
    }
  ]
}
```
支持日期范围选择,可以添加自定义验证。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "日期时间示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "dateGroup",
          title: "日期时间字段示例",
          fields: [
            {
              name: "date",
              label: "日期",
              type: "date",
              required: true,
              placeholder: "请选择日期",
              formatConfig: {
                type: "date",
                dateFormat: "yyyy-MM-dd"
              }
            },
            {
              name: "datetime",
              label: "日期时间",
              type: "datetime",
              required: true,
              formatConfig: {
                type: "datetime",
                dateFormat: "yyyy-MM-dd HH:mm:ss"
              }
            },
            {
              name: "dateRange",
              label: "活动时间",
              type: "date",
              range: true,
              required: true,
              formatConfig: {
                type: "date",
                dateFormat: "yyyy-MM-dd"
              },
              description: "请选择活动的起止时间",
              validators: [
                (value) => {
                  if(value?.start && value?.end && value.start > value.end) {
                    return "结束日期不能早于开始日期"
                  }
                }
              ]
            },
            {
              name: "deadline",
              label: "截止日期",
              type: "date",
              required: true,
              formatConfig: {
                type: "date",
                dateFormat: "yyyy-MM-dd",
                conditions: [
                  {
                    condition: value => {
                      const today = new Date()
                      const deadline = new Date(value)
                      return deadline < today
                    },
                    format: value => `${value} (已过期)`,
                    style: { color: "red" }
                  },
                  {
                    condition: value => {
                      const today = new Date()
                      const deadline = new Date(value)
                      const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
                      return diff <= 7
                    },
                    format: value => `${value} (即将到期)`,
                    style: { color: "orange" }
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
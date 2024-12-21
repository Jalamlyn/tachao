# 数据格式化

## 基础格式化
```typescript
{
  basicFields: {
    groups: [
      {
        key: "basicFormatting",
        title: "基础格式化",
        fields: [
          {
            name: "amount",
            label: "金额",
            type: "number",
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          }
        ]
      }
    ]
  }
}
```
基础的数据格式化配置。

## 条件格式化
```typescript
{
  basicFields: {
    groups: [
      {
        key: "conditionalFormatting",
        title: "条件格式化",
        fields: [
          {
            name: "score",
            label: "得分",
            type: "number",
            formatConfig: {
              type: "number",
              precision: 1,
              conditions: [
                {
                  condition: value => value >= 90,
                  format: value => `${value} - 优秀`,
                  style: { color: "green" }
                },
                {
                  condition: value => value >= 60,
                  format: value => `${value} - 及格`,
                  style: { color: "blue" }
                },
                {
                  condition: value => value < 60,
                  format: value => `${value} - 不及格`,
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
```
支持条件格式化。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "数据格式化示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "numberFormatting",
          title: "数字格式化",
          icon: "mdi:numeric",
          fields: [
            {
              name: "integer",
              label: "整数",
              type: "number",
              formatConfig: {
                type: "number",
                useGrouping: true,
                precision: 0
              }
            },
            {
              name: "decimal",
              label: "小数",
              type: "number",
              formatConfig: {
                type: "number",
                precision: 2
              }
            },
            {
              name: "percentage",
              label: "百分比",
              type: "number",
              formatConfig: {
                type: "percentage",
                precision: 1
              }
            },
            {
              name: "currency",
              label: "货币",
              type: "number",
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2,
                  currencyDisplay: "symbol"
                }
              }
            }
          ]
        },
        {
          key: "dateFormatting",
          title: "日期格式化",
          icon: "mdi:calendar",
          fields: [
            {
              name: "date",
              label: "日期",
              type: "date",
              formatConfig: {
                type: "date",
                dateFormat: "yyyy-MM-dd"
              }
            },
            {
              name: "datetime",
              label: "日期时间",
              type: "datetime",
              formatConfig: {
                type: "datetime",
                dateFormat: "yyyy-MM-dd HH:mm:ss"
              }
            },
            {
              name: "customDate",
              label: "自定义日期",
              type: "date",
              formatConfig: {
                type: "date",
                dateFormat: "yyyy年MM月dd日"
              }
            }
          ]
        },
        {
          key: "conditionalFormatting",
          title: "条件格式化",
          icon: "mdi:format-color-fill",
          fields: [
            {
              name: "score",
              label: "评分",
              type: "number",
              formatConfig: {
                type: "number",
                precision: 1,
                conditions: [
                  {
                    condition: value => value >= 90,
                    format: value => `${value}分 - 优秀`,
                    style: { color: "green", fontWeight: "bold" }
                  },
                  {
                    condition: value => value >= 75,
                    format: value => `${value}分 - 良好`,
                    style: { color: "blue" }
                  },
                  {
                    condition: value => value >= 60,
                    format: value => `${value}分 - 及格`,
                    style: { color: "orange" }
                  },
                  {
                    condition: value => value < 60,
                    format: value => `${value}分 - 不及格`,
                    style: { color: "red" }
                  }
                ]
              }
            },
            {
              name: "status",
              label: "状态",
              type: "select",
              options: [
                { label: "正常", value: "normal" },
                { label: "警告", value: "warning" },
                { label: "错误", value: "error" }
              ],
              formatConfig: {
                type: "text",
                conditions: [
                  {
                    condition: value => value === "normal",
                    format: () => "✅ 正常",
                    style: { color: "green" }
                  },
                  {
                    condition: value => value === "warning",
                    format: () => "⚠️ 警告",
                    style: { color: "orange" }
                  },
                  {
                    condition: value => value === "error",
                    format: () => "❌ 错误",
                    style: { color: "red" }
                  }
                ]
              }
            },
            {
              name: "progress",
              label: "进度",
              type: "number",
              formatConfig: {
                type: "percentage",
                precision: 0,
                conditions: [
                  {
                    condition: value => value >= 100,
                    format: () => "已完成",
                    style: { color: "green" }
                  },
                  {
                    condition: value => value >= 0,
                    format: value => `${value}%`,
                    style: value => ({
                      color: value >= 80 ? "green" : 
                             value >= 50 ? "blue" : 
                             value >= 20 ? "orange" : "red"
                    })
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
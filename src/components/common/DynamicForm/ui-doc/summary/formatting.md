# 条件格式化汇总

## 基础格式化
```typescript
{
  summaryGroups: [
    {
      key: "formattedSummary",
      title: "格式化汇总",
      fields: [
        {
          name: "amount",
          label: "金额",
          type: "amount",
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
```
基础的格式化配置。

## 条件格式化
```typescript
{
  summaryGroups: [
    {
      key: "conditionalSummary",
      title: "条件格式化汇总",
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
```
支持条件格式化。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "条件格式化汇总示例"
  },
  renderConfig: {
    summaryGroups: [
      {
        key: "performanceSummary",
        title: "业绩汇总",
        icon: "mdi:chart-areaspline",
        description: "展示业绩相关指标",
        layout: "grid",
        columns: 3,
        fields: [
          {
            name: "salesAmount",
            label: "销售额",
            type: "amount",
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2,
                conditions: [
                  {
                    condition: value => value >= 1000000,
                    format: value => `${(value/10000).toFixed(2)}万`,
                    style: { color: "green", fontWeight: "bold" }
                  }
                ]
              }
            }
          },
          {
            name: "salesGrowth",
            label: "销售增长",
            type: "percentage",
            trend: "up",
            formatConfig: {
              type: "percentage",
              precision: 2,
              conditions: [
                {
                  condition: value => value >= 0.2,
                  style: { color: "green" }
                },
                {
                  condition: value => value <= -0.1,
                  style: { color: "red" }
                }
              ]
            }
          },
          {
            name: "customerCount",
            label: "客户数",
            type: "number",
            formatConfig: {
              type: "number",
              useGrouping: true,
              conditions: [
                {
                  condition: value => value >= 1000,
                  format: value => `${(value/1000).toFixed(1)}k`,
                  style: { color: "blue" }
                }
              ]
            }
          },
          {
            name: "satisfaction",
            label: "满意度",
            type: "number",
            formatConfig: {
              type: "number",
              precision: 1,
              conditions: [
                {
                  condition: value => value >= 4.5,
                  format: value => `${value}⭐ 优秀`,
                  style: { color: "green" }
                },
                {
                  condition: value => value >= 4.0,
                  format: value => `${value}⭐ 良好`,
                  style: { color: "blue" }
                },
                {
                  condition: value => value < 4.0,
                  format: value => `${value}⭐ 需改进`,
                  style: { color: "orange" }
                }
              ]
            }
          },
          {
            name: "completionRate",
            label: "完成率",
            type: "percentage",
            formatConfig: {
              type: "percentage",
              precision: 1,
              conditions: [
                {
                  condition: value => value >= 1,
                  format: value => "100% 已完成",
                  style: { color: "green" }
                },
                {
                  condition: value => value >= 0.8,
                  format: value => `${(value * 100).toFixed(1)}% 接近完成`,
                  style: { color: "blue" }
                },
                {
                  condition: value => value < 0.8,
                  format: value => `${(value * 100).toFixed(1)}% 需加快`,
                  style: { color: "orange" }
                }
              ]
            }
          },
          {
            name: "ranking",
            label: "排名",
            type: "number",
            formatConfig: {
              type: "number",
              precision: 0,
              conditions: [
                {
                  condition: value => value <= 3,
                  format: value => `Top ${value}`,
                  style: { color: "gold", fontWeight: "bold" }
                },
                {
                  condition: value => value <= 10,
                  format: value => `Top ${value}`,
                  style: { color: "blue" }
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
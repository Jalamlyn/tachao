# 数据转换

## 基础转换
```typescript
{
  basicFields: {
    groups: [
      {
        key: "basicTransform",
        title: "基础转换",
        fields: [
          {
            name: "text",
            label: "文本",
            type: "text",
            transform: (value) => value?.toUpperCase()
          }
        ]
      }
    ]
  }
}
```
基础的数据转换配置。

## 复杂转换
```typescript
{
  basicFields: {
    groups: [
      {
        key: "complexTransform",
        title: "复杂转换",
        fields: [
          {
            name: "address",
            label: "地址",
            type: "resource",
            resourceConfig: {
              resourceId: "addresses",
              fieldMapping: {
                "province": {
                  field: "province",
                  transform: (value) => `${value}省`
                },
                "city": {
                  fields: ["city", "district"],
                  transform: (values) => values.join(" ")
                }
              }
            }
          }
        ]
      }
    ]
  }
}
```
支持复杂的数据转换。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "数据转换示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "textTransform",
          title: "文本转换",
          icon: "mdi:text",
          fields: [
            {
              name: "uppercase",
              label: "大写转换",
              type: "text",
              transform: (value) => value?.toUpperCase(),
              description: "输入文本会自动转换为大写"
            },
            {
              name: "trim",
              label: "去除空格",
              type: "text",
              transform: (value) => value?.trim(),
              description: "自动去除首尾空格"
            },
            {
              name: "mask",
              label: "掩码处理",
              type: "text",
              transform: (value) => {
                if (!value) return value
                if (value.length <= 4) return value
                return value.slice(0, 2) + "*".repeat(value.length - 4) + value.slice(-2)
              },
              description: "自动对中间部分进行掩码处理"
            }
          ]
        },
        {
          key: "numberTransform",
          title: "数字转换",
          icon: "mdi:numeric",
          fields: [
            {
              name: "round",
              label: "四舍五入",
              type: "number",
              transform: (value) => Math.round(value),
              description: "自动四舍五入到整数"
            },
            {
              name: "absolute",
              label: "绝对值",
              type: "number",
              transform: (value) => Math.abs(value),
              description: "自动转换为绝对值"
            },
            {
              name: "chinese",
              label: "中文数字",
              type: "number",
              transform: (value) => {
                if (!value) return value
                const units = ["", "万", "亿"]
                const nums = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]
                let result = ""
                let num = Math.floor(value)
                let unitIndex = 0
                
                while (num > 0) {
                  const part = num % 10000
                  if (part > 0) {
                    result = nums[part] + units[unitIndex] + result
                  }
                  num = Math.floor(num / 10000)
                  unitIndex++
                }
                
                return result || nums[0]
              },
              description: "自动转换为中文数字"
            }
          ]
        },
        {
          key: "dateTransform",
          title: "日期转换",
          icon: "mdi:calendar",
          fields: [
            {
              name: "startOfDay",
              label: "日期开始",
              type: "datetime",
              transform: (value) => {
                if (!value) return value
                const date = new Date(value)
                date.setHours(0, 0, 0, 0)
                return date.toISOString()
              },
              description: "自动转换为当天开始时间"
            },
            {
              name: "endOfDay",
              label: "日期结束",
              type: "datetime",
              transform: (value) => {
                if (!value) return value
                const date = new Date(value)
                date.setHours(23, 59, 59, 999)
                return date.toISOString()
              },
              description: "自动转换为当天结束时间"
            },
            {
              name: "relativeTime",
              label: "相对时间",
              type: "datetime",
              transform: (value) => {
                if (!value) return value
                const date = new Date(value)
                const now = new Date()
                const diff = now.getTime() - date.getTime()
                const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                
                if (days === 0) return "今天"
                if (days === 1) return "昨天"
                if (days === -1) return "明天"
                if (days > 0) return `${days}天前`
                return `${Math.abs(days)}天后`
              },
              description: "自动转换为相对时间描述"
            }
          ]
        }
      ]
    }
  }
}
```
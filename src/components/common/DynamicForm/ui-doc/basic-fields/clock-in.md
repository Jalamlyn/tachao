# 打卡字段

## 基础打卡
```typescript
{
  name: "basicClockIn",
  label: "打卡",
  type: "clockIn",
  config: {
    enableLocation: true
  }
}
```
基础的打卡功能,支持位置记录。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "打卡示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "clockInGroup",
          title: "打卡字段示例",
          fields: [
            {
              name: "attendance",
              label: "考勤打卡",
              type: "clockIn",
              required: true,
              config: {
                enableLocation: true,
                requireNote: true,
                modes: ["in", "out"]
              },
              description: "请进行上下班打卡"
            },
            {
              name: "meeting",
              label: "会议签到",
              type: "clockIn",
              config: {
                enableLocation: true,
                modes: ["in"]
              },
              description: "请进行会议签到"
            }
          ]
        }
      ]
    }
  }
}
```
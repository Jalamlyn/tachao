# 开关字段

## 基础开关
```typescript
{
  name: "basicSwitch",
  label: "开关",
  type: "switch",
  checkedLabel: "开启",
  uncheckedLabel: "关闭"
}
```
基础的开关控件,支持自定义开启和关闭时的文本。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "开关示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "switchGroup",
          title: "开关字段示例",
          fields: [
            {
              name: "enabled",
              label: "启用状态",
              type: "switch",
              required: true,
              checkedLabel: "已启用",
              uncheckedLabel: "已禁用",
              defaultValue: true
            },
            {
              name: "notifications",
              label: "消息通知",
              type: "switch",
              checkedLabel: "开启通知",
              uncheckedLabel: "关闭通知",
              description: "是否接收系统通知"
            }
          ]
        }
      ]
    }
  }
}
```
# 打卡组件使用指南

本文档介绍了动态表单中打卡组件的使用方法和配置选项。

## 基础用法

最简单的打卡组件配置示例：

```typescript
const formConfig: DynamicFormConfig = {
  metadata: {
    title: "考勤表单"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "attendance",
          title: "考勤打卡",
          fields: [
            {
              type: "clockIn",
              name: "dailyAttendance",
              label: "每日打卡",
            }
          ]
        }
      ]
    }
  }
}
```

## 高级配置

打卡组件支持多种配置选项：

```typescript
const formConfig: DynamicFormConfig = {
  metadata: {
    title: "高级考勤表单"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "attendance",
          title: "考勤打卡",
          fields: [
            {
              type: "clockIn",
              name: "attendance",
              label: "考勤打卡",
              required: true,
              config: {
                enableLocation: true,    // 启用位置记录
                requireNote: true,       // 要求填写备注
                modes: ["in", "out"],    // 支持的打卡模式
              }
            }
          ]
        }
      ]
    }
  }
}
```

## 配置选项说明

### ClockInConfig 接口

```typescript
interface ClockInConfig {
  // 是否启用位置记录
  enableLocation?: boolean;
  
  // 是否要求填写备注
  requireNote?: boolean;
  
  // 支持的打卡模式：["in"]仅签到、["out"]仅签退、["in", "out"]都支持
  modes?: ("in" | "out")[];
}
```

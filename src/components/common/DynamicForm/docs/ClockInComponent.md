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

### 数据结构

打卡记录的数据结构如下：

```typescript
interface ClockInData {
  // 打卡时间戳
  timestamp: string;
  
  // 打卡类型：签到或签退
  type: "in" | "out";
  
  // 位置信息（如果启用）
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  
  // 备注信息（如果启用）
  note?: string;
}
```

## 使用场景示例

### 1. 简单考勤打卡

基础的考勤打卡场景：

```typescript
{
  type: "clockIn",
  name: "simpleAttendance",
  label: "考勤打卡",
  config: {
    modes: ["in", "out"]
  }
}
```

### 2. 外勤打卡

需要记录位置信息的外勤打卡：

```typescript
{
  type: "clockIn",
  name: "fieldWorkAttendance",
  label: "外勤打卡",
  config: {
    enableLocation: true,
    requireNote: true,
    modes: ["in", "out"]
  }
}
```

### 3. 仅签到场景

只需要签到功能的场景（如会议签到）：

```typescript
{
  type: "clockIn",
  name: "meetingAttendance",
  label: "会议签到",
  config: {
    modes: ["in"],
    requireNote: true
  }
}
```

## 注意事项

1. 位置记录
- 需要用户授予位置权限
- 部分浏览器可能不支持位置功能
- 位置精度可能受设备和环境影响

2. 数据处理
- 打卡记录按时间顺序存储
- 支持查看历史记录
- 建议定期清理或归档历史数据

3. 移动端适配
- 完全支持移动端使用
- 建议在移动端启用位置功能
- 注意移动端网络状况

## 最佳实践

1. 错误处理
```typescript
{
  type: "clockIn",
  name: "attendance",
  label: "打卡",
  config: {
    enableLocation: true
  },
  validate: (value) => {
    if (!value || value.length === 0) {
      return "请完成打卡"
    }
    return true
  }
}
```

2. 自定义显示
```typescript
{
  type: "clockIn",
  name: "attendance",
  label: "打卡",
  render: (value) => {
    if (!value) return null
    return (
      <div className="custom-attendance-display">
        {/* 自定义显示逻辑 */}
      </div>
    )
  }
}
```

3. 数据联动
```typescript
watch: (form) => {
  form.watch("attendance", (value) => {
    // 处理打卡数据变化
    const lastRecord = value[value.length - 1]
    if (lastRecord?.type === "out") {
      // 处理签退后的逻辑
    }
  })
}
```

## 常见问题

1. Q: 如何处理位置获取失败？
   A: 组件会自动处理位置获取失败的情况，并显示适当的错误信息。如果位置是必需的，可以阻止打卡操作。

2. Q: 能否自定义打卡时间？
   A: 默认使用系统当前时间。如需自定义，可以通过扩展配置实现。

3. Q: 如何导出打卡记录？
   A: 可以通过表单的getValue方法获取打卡数据，然后进行导出处理。

## 扩展开发

如需扩展打卡组件功能，可以：

1. 添加新的配置选项
```typescript
interface ExtendedClockInConfig extends ClockInConfig {
  customField?: string;
  // 其他自定义配置
}
```

2. 扩展打卡数据结构
```typescript
interface ExtendedClockInData extends ClockInData {
  customData?: any;
  // 其他自定义数据
}
```

3. 自定义验证规则
```typescript
validate: (value, formValues) => {
  // 自定义验证逻辑
  return true
}
```
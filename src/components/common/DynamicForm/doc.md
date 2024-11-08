# 动态表单配置指南

[原文档内容保持不变，在适当位置添加以下内容]

### Tooltip 配置

字段可以配置 tooltip 来显示帮助信息或详细说明。

```typescript
interface TooltipConfig {
  content: React.ReactNode;  // tooltip 内容，支持 React 组件
  placement?: 'top' | 'bottom' | 'left' | 'right';  // 显示位置
}
```

使用示例：

```typescript
const formConfig = {
  renderConfig: {
    basicFields: [
      {
        name: "leaveType",
        label: "请假类型",
        type: "select",
        options: [
          { label: "年假", value: "annual" },
          { label: "事假", value: "personal" },
          { label: "病假", value: "sick" }
        ],
        tooltip: {
          content: (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">请假类型说明</h4>
              <div className="space-y-1">
                <div>• 年假：按照工龄和公司政策计算</div>
                <div>• 事假：需提前申请，扣除工资</div>
                <div>• 病假：需提供医疗证明</div>
              </div>
            </div>
          ),
          placement: "right"
        },
        required: true
      }
    ]
  }
}
```

tooltip 特性：

1. 支持富文本内容
2. 可自定义显示位置
3. 响应式设计
4. 支持键盘导航
5. 适配移动设备

[文档其余部分保持不变]
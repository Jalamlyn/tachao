## Tooltip 配置

字段可以配置 tooltip 来显示帮助信息或详细说明。

```typescript
interface TooltipConfig {
  content: React.ReactNode;  // tooltip 内容，支持 React 组件
  placement?: 'top' | 'bottom' | 'left' | 'right';  // 显示位置
}
```

使用示例：

```javascript
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

### 最佳实践

1. 内容简洁明了
   - 避免过长的文本
   - 使用列表和分段提高可读性

2. 合理使用位置
   - 考虑页面布局选择合适的显示位置
   - 避免遮挡其他重要内容

3. 样式统一
   - 保持与整体设计风格一致
   - 使用一致的字体和颜色

4. 响应式考虑
   - 在不同设备上测试显示效果
   - 确保移动端的可用性
## 元数据配置

元数据配置定义了表单的基本信息。

```typescript
interface FormMetadata {
  title: string;                // 表单标题（必填）
  description?: string;         // 表单描述（可选）
  permissions?: {              // 定义表单的操作权限（可选）
    edit?: boolean;
    delete?: boolean;
    print?: boolean;
  };
  type?: string;               // 表单类型（可选）
}
```

示例：
```javascript
const metadata = {
  title: "请假申请表",
  description: "用于员工请假申请和审批",
  permissions: {
    edit: true,
    delete: false,
    print: true
  },
  type: "leave-request"
};
```
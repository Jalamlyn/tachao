## 流程步骤配置

流程步骤用于创建多步骤审批表单，支持复杂的审批流程管理。

### 配置结构

```typescript
interface ProcessStep {
  key: string;         // 步骤唯一标识
  title: string;       // 步骤标题
  description?: string;// 步骤描述
  icon?: string;       // 步骤图标(使用iconify图标)
  fields?: FormField[]; // 步骤表单字段
  conditions?: {       // 条件配置
    show?: {          // 显示条件
      field: string;  // 依赖字段
      value: any;     // 期望值
      operator?: "eq" | "neq" | "gt" | "lt" | "contains"; // 比较操作符
    }
    required?: {      // 必填条件
      field: string;
      value: any;
      operator?: "eq" | "neq" | "gt" | "lt" | "contains";
    }
  }
}
```

### 完整示例

```typescript
const config = {
  renderConfig: {
    processSteps: [
      {
        key: "deptApproval",
        title: "部门审批", 
        description: "部门主管审批",
        icon: "mdi:account-check",
        fields: [
          {
            name: "deptLeader",
            label: "部门主管",
            type: "text",
            required: true
          },
          {
            name: "deptComments",
            label: "审批意见",
            type: "textarea"
          }
        ],
        conditions: {
          show: {
            field: "leaveType",
            value: "sick",
            operator: "eq"
          }
        }
      },
      {
        key: "hrApproval",
        title: "人事审批",
        description: "人事部门审批",
        icon: "mdi:account-tie",
        fields: [
          {
            name: "hrApprover",
            label: "人事审批人",
            type: "text",
            required: true
          },
          {
            name: "hrComments",
            label: "审批意见",
            type: "textarea"
          }
        ]
      }
    ]
  }
};
```

### 高级功能

1. 条件审批
```typescript
// 根据请假类型显示不同审批步骤
{
  key: "medicalApproval",
  title: "医疗审批",
  conditions: {
    show: {
      field: "leaveType",
      value: "sick",
      operator: "eq"
    }
  }
}
```

2. 并行审批
```typescript
// 同时进行的审批步骤
{
  parallel: true,
  steps: [
    {
      key: "deptApproval",
      title: "部门审批"
    },
    {
      key: "projectApproval", 
      title: "项目审批"
    }
  ]
}
```

3. 审批历史
```typescript
// 记录审批历史
interface ApprovalHistory {
  step: string;
  approver: string;
  action: "approve" | "reject";
  comments: string;
  timestamp: string;
}
```

### 注意事项

1. 步骤配置
- key 必须唯一
- fields 中的字段名不能重复
- icon 使用 iconify 图标库
- 合理设置必填字段

2. 条件处理
- 条件配置要考虑完整性
- 避免循环依赖
- 处理默认情况

3. 性能优化
- 避免过多的条件判断
- 合理使用缓存
- 优化渲染逻辑

### 常见问题

1. 如何控制步骤顺序?
```typescript
// 使用 order 属性
{
  key: "step1",
  order: 1,
  title: "第一步"
}
```

2. 如何实现条件审批?
```typescript
// 使用 conditions 配置
{
  key: "specialApproval",
  conditions: {
    show: {
      field: "amount",
      value: 10000,
      operator: "gt"
    }
  }
}
```

3. 如何处理并行审批?
```typescript
// 使用 parallel 配置
{
  parallel: true,
  steps: [/*...*/]
}
```

4. 如何自定义审批表单?
```typescript
// 使用自定义组件
{
  key: "customApproval",
  fields: [
    {
      name: "custom",
      type: "custom",
      render: ({ field, form }) => {
        // 自定义渲染逻辑
      }
    }
  ]
}
```

### 最佳实践

1. 步骤组织
- 合理划分步骤
- 清晰的步骤说明
- 适当的图标提示

2. 条件配置
- 简化条件逻辑
- 处理边界情况
- 提供默认值

3. 用户体验
- 清晰的状态提示
- 合理的表单验证
- 友好的错误提示

4. 数据处理
- 数据格式统一
- 历史记录完整
- 状态管理清晰

### 示例场景

1. 请假审批
```typescript
const leaveApprovalConfig = {
  processSteps: [
    {
      key: "deptApproval",
      title: "部门审批",
      fields: [/*...*/]
    },
    {
      key: "hrApproval",
      title: "人事审批",
      fields: [/*...*/]
    }
  ]
};
```

2. 报销审批
```typescript
const expenseApprovalConfig = {
  processSteps: [
    {
      key: "managerApproval",
      title: "经理审批",
      conditions: {
        show: {
          field: "amount",
          value: 5000,
          operator: "gt"
        }
      }
    },
    {
      key: "financeApproval",
      title: "财务审批"
    }
  ]
};
```

3. 项目审批
```typescript
const projectApprovalConfig = {
  processSteps: [
    {
      parallel: true,
      steps: [
        {
          key: "techReview",
          title: "技术评审"
        },
        {
          key: "businessReview",
          title: "业务评审"
        }
      ]
    },
    {
      key: "finalApproval",
      title: "最终审批"
    }
  ]
};
```
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
        ]
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
  },
  watch: (form) => {
    const processWatch = createProcessWatch(form, 'processConfirmations')
    
    const subscriptions = [
      // 根据请假类型控制医疗审批步骤
      form.watch('leaveType', (value) => {
        processWatch.setStepVisibility('medicalApproval', value === 'sick')
      }),
      
      // 监听部门审批状态,控制人事审批步骤
      form.watch('processConfirmations.deptApproval.status', (status) => {
        processWatch.setStepVisibility('hrApproval', status === 'approved')
      }),
      
      // 金额超过 10000 时需要财务审批
      form.watch('amount', (value) => {
        processWatch.setStepVisibility('financeApproval', value > 10000)
      })
    ]
    
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
    }
  }
}
```

### Watch 工具函数

```typescript
const processWatch = createProcessWatch(form, 'processConfirmations')

// 设置步骤显示/隐藏
processWatch.setStepVisibility('stepKey', true/false)

// 设置步骤必填
processWatch.setStepRequired('stepKey', true/false)

// 监听步骤状态
processWatch.watchStepStatus('stepKey', (status) => {
  // 处理状态变化
})

// 批量更新步骤
processWatch.batchUpdateSteps([
  {
    stepKey: 'step1',
    updates: {
      hidden: false,
      required: true,
      status: 'pending'
    }
  }
])
```

### 最佳实践

1. 步骤组织
- 合理划分步骤
- 清晰的步骤说明
- 适当的图标提示

2. 状态管理
- 使用 watch 机制控制流程
- 合理设置步骤依赖
- 处理异常情况

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
  ],
  watch: (form) => {
    const processWatch = createProcessWatch(form, 'processConfirmations')
    
    const subscriptions = [
      form.watch('leaveType', (value) => {
        processWatch.setStepVisibility('medicalApproval', value === 'sick')
      })
    ]
    
    return () => subscriptions.forEach(sub => sub.unsubscribe())
  }
}
```

2. 报销审批
```typescript
const expenseApprovalConfig = {
  processSteps: [
    {
      key: "managerApproval",
      title: "经理审批"
    },
    {
      key: "financeApproval",
      title: "财务审批"
    }
  ],
  watch: (form) => {
    const processWatch = createProcessWatch(form, 'processConfirmations')
    
    const subscriptions = [
      form.watch('amount', (value) => {
        processWatch.setStepVisibility('financeApproval', value > 5000)
      })
    ]
    
    return () => subscriptions.forEach(sub => sub.unsubscribe())
  }
}
```

3. 项目审批
```typescript
const projectApprovalConfig = {
  processSteps: [
    {
      key: "techReview",
      title: "技术评审"
    },
    {
      key: "businessReview",
      title: "业务评审"
    },
    {
      key: "finalApproval",
      title: "最终审批"
    }
  ],
  watch: (form) => {
    const processWatch = createProcessWatch(form, 'processConfirmations')
    
    const subscriptions = [
      form.watch('processConfirmations.techReview.status', (status) => {
        processWatch.setStepVisibility('finalApproval', status === 'approved')
      }),
      form.watch('processConfirmations.businessReview.status', (status) => {
        processWatch.setStepVisibility('finalApproval', status === 'approved')
      })
    ]
    
    return () => subscriptions.forEach(sub => sub.unsubscribe())
  }
}
```
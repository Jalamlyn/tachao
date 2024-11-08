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
    
    const subscription = form.watch((value, { name }) => {
      // 使用单个 watch 处理所有字段变化
      switch(name) {
        case 'leaveType':
          processWatch.setStepVisibility('medicalApproval', value === 'sick')
          break
          
        case 'processConfirmations.deptApproval.status':
          processWatch.setStepVisibility('hrApproval', value === 'approved')
          break
          
        case 'amount':
          processWatch.setStepVisibility('financeApproval', value > 10000)
          break
      }
    })
    
    return () => subscription.unsubscribe()
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
- 使用单个 watch 处理所有字段变化
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
    
    const subscription = form.watch((value, { name }) => {
      switch(name) {
        case 'leaveType':
          processWatch.setStepVisibility('medicalApproval', value === 'sick')
          break
          
        case 'processConfirmations.deptApproval.status':
          processWatch.setStepVisibility('hrApproval', value === 'approved')
          break
      }
    })
    
    return () => subscription.unsubscribe()
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
    
    const subscription = form.watch((value, { name }) => {
      switch(name) {
        case 'amount':
          processWatch.setStepVisibility('financeApproval', value > 5000)
          break
          
        case 'processConfirmations.managerApproval.status':
          if (value === 'rejected') {
            processWatch.setStepVisibility('financeApproval', false)
          }
          break
      }
    })
    
    return () => subscription.unsubscribe()
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
    
    const subscription = form.watch((value, { name }) => {
      switch(name) {
        case 'processConfirmations.techReview.status':
        case 'processConfirmations.businessReview.status':
          const techStatus = form.getValues('processConfirmations.techReview.status')
          const businessStatus = form.getValues('processConfirmations.businessReview.status')
          const showFinal = techStatus === 'approved' && businessStatus === 'approved'
          processWatch.setStepVisibility('finalApproval', showFinal)
          break
      }
    })
    
    return () => subscription.unsubscribe()
  }
}
```

### Watch 性能优化

1. 使用单个 watch
```typescript
// 推荐: 使用单个 watch 处理所有变化
const subscription = form.watch((value, { name }) => {
  switch(name) {
    case 'field1':
      // 处理 field1 变化
      break
    case 'field2':
      // 处理 field2 变化
      break
  }
})

// 不推荐: 使用多个独立的 watch
const sub1 = form.watch('field1', (value) => {/*...*/})
const sub2 = form.watch('field2', (value) => {/*...*/})
```

2. 批量更新
```typescript
// 推荐: 使用 batchUpdateSteps 批量更新
processWatch.batchUpdateSteps([
  { stepKey: 'step1', updates: { hidden: false } },
  { stepKey: 'step2', updates: { required: true } }
])

// 不推荐: 多次单独更新
processWatch.setStepVisibility('step1', false)
processWatch.setStepRequired('step2', true)
```

3. 避免不必要的状态更新
```typescript
const subscription = form.watch((value, { name }) => {
  // 只处理关心的字段
  if (!['field1', 'field2'].includes(name)) {
    return
  }
  
  switch(name) {
    case 'field1':
      // 处理 field1 变化
      break
    case 'field2':
      // 处理 field2 变化
      break
  }
})
```
# AnalysisResult 组件

数据分析结果展示组件，用于展示数据分析的统计摘要、图表、明细表格和洞察。

## 1. 组件说明

### 1.1 数据计算规则
- 所有数值必须通过数据计算得到，禁止使用硬编码值
- 时间格式必须通过计算并格式化，如: formatDuration(calculateTime(data))
- 状态描述必须通过状态映射得到，如: getNodeStatus(item.status)

### 1.2 辅助函数
```typescript
// 计算平均处理时间
const calculateAverageTime = (data: any[]) => {
  const times = data
    .filter(item => item?.duration)
    .map(item => item.duration);
  return times.length ? 
    (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : 0;
};

// 格式化时间描述
const formatDuration = (days: number) => {
  if(days < 1) return `${(days * 24).toFixed(1)}小时`;
  return `${days.toFixed(1)}天`;
};

// 计算完成率
const calculateCompletionRate = (data: any[]) => {
  const total = data.length;
  const completed = data.filter(item => item.status === 'completed').length;
  return total ? `${((completed / total) * 100).toFixed(1)}%` : '0%';
};

// 状态映射
const getNodeStatus = (status: string) => {
  const statusMap = {
    completed: '已完成',
    processing: '进行中',
    pending: '待处理'
  };
  return statusMap[status] || '未知状态';
};
```



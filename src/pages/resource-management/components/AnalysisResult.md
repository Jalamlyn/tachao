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
2. 数据结构定义
2.1 Summary 字段规范
summary 字段的每个指标都必须包含 value 和 label:

{
  summary: {
    [key: string]: {
      value: number | string | Record<string, any>,
      label: string  // 显示给用户的文本
    }
  }
}
示例:

{
  summary: {
    totalCount: {
      value: 100,
      label: "总数量"
    },
    completionRate: {
      value: "85%",
      label: "完成率"
    },
    averageProcessTime: {
      value: "2.5天",
      label: "平均处理时长"
    }
  }
}
2.2 完整数据结构
{
  type: 'analyze',
  data: Array<any>,
  analysis: {
    // 统计摘要
    summary: {
      [key: string]: {
        value: number | string | Record<string, any>,
        label: string
      }
    },

    // 图表数据
    charts?: Array<{
      type: string,
      title: string,
      data: Array<{
        name: string,
        value: number
      }>
    }>,

    // 表格数据
    tables?: Array<{
      title: string,
      columns: Array<{
        key: string,
        title: string
      }>,
      data: Array<any>
    }>,

    // 数据洞察
    insights: Array<string>,

    // 流程分析数据(可选)
    processAnalysis?: {
      summary?: {
        totalProcessNodes: {
          value: number,
          label: string
        },
        completedNodes: {
          value: number,
          label: string
        },
        completionRate: {
          value: string,
          label: string
        },
        averageProcessTime: {
          value: string,
          label: string
        }
      },
      nodeStatus?: Record<string, string>,
      processDuration?: {
        total: string,
        nodesDuration: Record<string, string>
      },
      approvers?: Record<string, number>,
      processStatus?: Record<string, number>
    }
  }
}
3. 使用示例
const analysis = {
  summary: {
    totalCount: {
      value: 100,
      label: "总数量"
    },
    completionRate: {
      value: "85%",
      label: "完成率"
    },
    averageProcessTime: {
      value: "2.5天",
      label: "平均处理时长"
    }
  },
  charts: [
    {
      type: "pie",
      title: "状态分布",
      data: [
        { name: "已完成", value: 85 },
        { name: "进行中", value: 15 }
      ]
    }
  ],
  insights: [
    "总体完成率达到85%，表现良好",
    "平均处理时长为2.5天，符合预期"
  ],
  processAnalysis: {
    summary: {
      totalProcessNodes: {
        value: 5,
        label: "总节点数"
      },
      completedNodes: {
        value: 3,
        label: "已完成节点"
      },
      completionRate: {
        value: "60%",
        label: "完成率"
      },
      averageProcessTime: {
        value: "2.5天",
        label: "平均处理时长"
      }
    }
  }
}
```

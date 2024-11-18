# AnalysisResult 组件

数据分析结果展示组件，用于展示数据分析的统计摘要、图表、明细表格和洞察。

## 使用示例

```tsx
import { AnalysisResult } from './components/AnalysisResult';

const analysis = {
  summary: {
    totalCount: 100,
    averageValue: 50
  },
  charts: [{
    type: 'pie',
    title: '分布图',
    data: [{ name: 'A', value: 30 }]
  }],
  tables: [{
    title: '数据明细',
    columns: [
      { key: 'name', title: '名称' },
      { key: 'value', title: '数值' }
    ],
    data: [{ name: 'A', value: 30 }]
  }],
  insights: ['数据呈现上升趋势'],
  // 流程分析示例
  processAnalysis: {
    summary: {
      totalProcessNodes: 5,
      completedNodes: 3,
      completionRate: '60%',
      averageProcessTime: '2.5天'
    },
    nodeStatus: {
      '节点1': '已完成',
      '节点2': '进行中'
    },
    processDuration: {
      total: '5天',
      nodesDuration: {
        '节点1': '2天',
        '节点2': '3天'
      }
    },
    approvers: {
      '审批人A': 10,
      '审批人B': 5
    },
    processStatus: {
      '已完成': 3,
      '进行中': 2
    }
  }
};

<AnalysisResult analysis={analysis} />
```

## Props

### analysis
主要的数据分析结果对象，包含以下属性：

```typescript
{
  // 统计摘要，可以包含多种类型的数据
  summary: Record<string, number | string | Record<string, number> | Array<{ name: string; count: number }>>;

  // 可选的图表数据数组
  charts?: Array<{
    // 图表类型，支持多种图表类型
    type: string;
    // 图表标题
    title: string;
    // 图表数据
    data: Array<any>;
  }>;

  // 可选的明细表格数组
  tables?: Array<{
    // 表格标题
    title: string;
    // 表格列定义
    columns: Array<{
      key: string;      // 数据字段名
      title: string;    // 列标题
    }>;
    // 表格数据
    data: Array<any>;
  }>;

  // 数据洞察数组，包含分析发现和建议
  insights: string[];

  // 流程分析数据（可选）
  processAnalysis?: {
    // 流程概要信息
    summary?: {
      totalProcessNodes: number;    // 总节点数
      completedNodes: number;       // 已完成节点数
      completionRate: string;       // 完成率（百分比）
      averageProcessTime: string;   // 平均处理时长
    };
    
    // 节点状态信息，记录每个节点的当前状态
    nodeStatus?: Record<string, string>;
    
    // 流程耗时信息
    processDuration?: {
      total: string;                // 总耗时
      nodesDuration: Record<string, string>;  // 各节点耗时
    };
    
    // 审批人工作量统计
    approvers?: Record<string, number>;
    
    // 流程状态统计
    processStatus?: Record<string, number>;
  };
}
```

## AI 配置生成指南

### 1. 基础分析配置

生成基础的统计分析：
```javascript
const result = {
  type: 'analyze',
  data: data,
  analysis: {
    summary: {
      totalCount: data.length,
      averageValue: average(data.map(item => item.value))
    },
    insights: ['数据总量：' + data.length]
  }
};
```

### 2. 图表配置生成

支持多种图表类型，详见 ChartRenderer 组件文档。

### 3. 明细表格配置

生成明细表格示例：
```javascript
// 基础明细表格
tables: [{
  title: '数据明细',
  columns: [
    { key: 'date', title: '日期' },
    { key: 'amount', title: '金额' }
  ],
  data: data.slice(0, 10) // 显示前10条记录
}]

// 带筛选的明细表格
const filteredData = data.filter(item => item.amount > 1000);
tables: [{
  title: '大额订单明细(>1000)',
  columns: [
    { key: 'date', title: '日期' },
    { key: 'amount', title: '金额' }
  ],
  data: filteredData
}]

// 排序后的明细表格
const sortedData = [...data].sort((a, b) => b.amount - a.amount);
tables: [{
  title: '订单明细(金额降序)',
  columns: [
    { key: 'date', title: '日期' },
    { key: 'amount', title: '金额' }
  ],
  data: sortedData.slice(0, 10)
}]
```

### 4. 流程分析配置

生成流程分析示例：
```javascript
// 基础流程分析
processAnalysis: {
  summary: {
    totalProcessNodes: data.length,
    completedNodes: data.filter(item => item.status === 'completed').length,
    completionRate: `${(completedCount / totalCount * 100).toFixed(1)}%`,
    averageProcessTime: `${averageTime}天`
  },
  nodeStatus: data.reduce((acc, curr) => {
    acc[curr.nodeName] = curr.status;
    return acc;
  }, {}),
  processDuration: {
    total: `${totalDuration}天`,
    nodesDuration: data.reduce((acc, curr) => {
      acc[curr.nodeName] = `${curr.duration}天`;
      return acc;
    }, {})
  }
}

// 带审批人统计的流程分析
processAnalysis: {
  ...baseProcessAnalysis,
  approvers: data.reduce((acc, curr) => {
    acc[curr.approver] = (acc[curr.approver] || 0) + 1;
    return acc;
  }, {}),
  processStatus: data.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {})
}
```

### 5. 完整配置示例

```javascript
<shata-ai-resource>
const result = {
  type: 'analyze',
  data: data,
  analysis: {
    // 统计摘要
    summary: {
      totalCount: data.length,
      totalAmount: sum(data.map(item => item.amount)),
      averageAmount: average(data.map(item => item.amount))
    },
    // 图表展示
    charts: [{
      type: 'pie',
      title: '销售分布',
      data: {
        labels: ['产品A', '产品B'],
        values: [1000, 2000]
      }
    }],
    // 明细表格
    tables: [{
      title: '销售明细',
      columns: [
        { key: 'date', title: '日期' },
        { key: 'product', title: '产品' },
        { key: 'amount', title: '金额' }
      ],
      data: data.slice(0, 10)
    }],
    // 流程分析
    processAnalysis: {
      summary: {
        totalProcessNodes: 5,
        completedNodes: 3,
        completionRate: '60%',
        averageProcessTime: '2.5天'
      },
      nodeStatus: {
        '提交申请': '已完成',
        '部门审批': '进行中',
        '财务审核': '待处理'
      },
      processDuration: {
        total: '5天',
        nodesDuration: {
          '提交申请': '1天',
          '部门审批': '2天',
          '财务审核': '2天'
        }
      },
      approvers: {
        '张经理': 8,
        '李财务': 5
      },
      processStatus: {
        '已完成': 3,
        '进行中': 1,
        '待处理': 1
      }
    },
    // 数据洞察
    insights: [
      '总销售额达到3000元',
      '产品B销售占比较高',
      '流程完成率达到60%',
      '平均处理时长为2.5天'
    ]
  }
};
return result;
</shata-ai-resource>
```

## 注意事项

1. 数据量控制
- 明细表格建议限制显示条数，避免数据量过大
- 可以通过 slice 或 filter 控制数据量

2. 数据处理
- 可以在生成表格前对数据进行排序、筛选等处理
- 注意数据的有效性验证

3. 展示优化
- 表格标题应清晰说明数据含义和筛选条件
- 合理使用排序和筛选，提高数据可读性

4. 流程分析
- 确保流程节点状态准确反映当前情况
- 时间统计要考虑工作日和节假日
- 审批人工作量统计要考虑有效性
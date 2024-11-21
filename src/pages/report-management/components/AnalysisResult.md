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

## 2. 使用示例

```tsx
import { AnalysisResult } from "/Users/jalam/Works/mo-repo/shata-ai-front/src/pages/report-management/components/AnalysisResult"

// 🔴 错误示例 - 不要这样写:
const wrongAnalysis = {
  summary: {
    totalCount: 100,        // 错误:硬编码值
    averageValue: 50,       // 错误:硬编码值
  },
  processAnalysis: {
    summary: {
      totalProcessNodes: 5,    // 错误:硬编码值
      completedNodes: 3,       // 错误:硬编码值
      completionRate: "60%",   // 错误:硬编码值
      averageProcessTime: "2.5天" // 错误:硬编码值
    }
  }
}

// ✅ 正确示例 - 应该这样写:
const correctAnalysis = {
  summary: {
    totalCount: calculateTotalCount(data),
    averageValue: calculateAverage(data),
  },
  charts: [
    {
      type: "pie",
      title: "分布图",
      data: calculateDistributionData(data),
    },
  ],
  tables: [
    {
      title: "数据明细",
      columns: [
        { key: "name", title: "名称" },
        { key: "value", title: "数值" },
      ],
      data: processTableData(data),
    },
  ],
  insights: generateInsights(data),
  processAnalysis: {
    summary: {
      totalProcessNodes: calculateTotalNodes(data),
      completedNodes: calculateCompletedNodes(data),
      completionRate: calculateCompletionRate(data),
      averageProcessTime: formatDuration(calculateAverageTime(data))
    },
    nodeStatus: data.reduce((acc, item) => {
      acc[item.nodeName] = getNodeStatus(item.status);
      return acc;
    }, {}),
    processDuration: {
      total: formatDuration(calculateTotalDuration(data)),
      nodesDuration: calculateNodesDuration(data)
    },
    approvers: calculateApproverStats(data),
    processStatus: calculateProcessStatus(data)
  }
}

;<AnalysisResult analysis={correctAnalysis} />
```

## 3. Props

### analysis

主要的数据分析结果对象，包含以下属性：

```typescript
{
  // 统计摘要，必须通过数据计算得到
  summary: Record<string, number | string | Record<string, number> | Array<{ name: string; count: number }>>;

  // 可选的图表数据数组
  charts?: Array<{
    // 图表类型，支持多种图表类型
    type: string;
    // 图表标题
    title: string;
    // 图表数据，必须通过数据计算得到
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
    // 表格数据，必须通过数据处理得到
    data: Array<any>;
  }>;

  // 数据洞察数组，必须通过数据分析得到
  insights: string[];

  // 流程分析数据（可选）
  processAnalysis?: {
    // 流程概要信息，所有值必须通过计算得到
    summary?: {
      totalProcessNodes: number;    // 通过 calculateTotalNodes(data) 计算
      completedNodes: number;       // 通过 calculateCompletedNodes(data) 计算
      completionRate: string;       // 通过 calculateCompletionRate(data) 计算
      averageProcessTime: string;   // 通过 formatDuration(calculateAverageTime(data)) 计算
    };

    // 节点状态信息，记录每个节点的当前状态
    // ⚠️ 重要：值必须通过 getNodeStatus() 映射得到，如 '已完成'、'进行中'
    nodeStatus?: Record<string, string>;

    // 流程耗时信息
    // ⚠️ 重要：所有时间值必须通过 formatDuration() 格式化，如 '5天'、'2小时'
    processDuration?: {
      total: string;                // 通过 formatDuration(calculateTotalDuration(data)) 计算
      nodesDuration: Record<string, string>;  // 各节点耗时，必须通过计算得到
    };

    // 审批人工作量统计，必须通过数据统计得到
    approvers?: Record<string, number>;

    // 流程状态统计，必须通过数据统计得到
    processStatus?: Record<string, number>;
  };
}
```

## 4. AI 配置生成指南

### 4.1 基础分析配置

生成基础的统计分析：

```javascript
// 🔴 错误示例 - 不要这样写
const wrongResult = {
  type: "analyze",
  data: data,
  analysis: {
    summary: {
      totalCount: 100,           // 错误:硬编码值
      averageValue: 50,          // 错误:硬编码值
    },
    insights: ["数据总量：100"], // 错误:硬编码值
  },
}

// ✅ 正确示例 - 应该这样写
const correctResult = {
  type: "analyze",
  data: data,
  analysis: {
    summary: {
      totalCount: data.length,
      averageValue: calculateAverage(data.map(item => item.value)),
    },
    insights: generateInsights(data),
  },
}
```

### 4.2 图表配置生成

支持多种图表类型，所有数据必须通过计算得到：

```javascript
// 🔴 错误示例 - 不要这样写
charts: [{
  type: "pie",
  title: "分布图",
  data: [{ name: "A", value: 30 }], // 错误:硬编码值
}]

// ✅ 正确示例 - 应该这样写
charts: [{
  type: "pie",
  title: "分布图",
  data: calculateChartData(data),
}]
```

### 4.3 明细表格配置

生成明细表格示例：

```javascript
// ✅ 基础明细表格 - 通过数据处理
tables: [
  {
    title: "数据明细",
    columns: generateTableColumns(data),
    data: processTableData(data),
  },
]

// ✅ 带筛选的明细表格 - 通过数据过滤
const filteredData = filterLargeAmounts(data);
tables: [
  {
    title: "大额订单明细(>1000)",
    columns: generateTableColumns(filteredData),
    data: processTableData(filteredData),
  },
]

// ✅ 排序后的明细表格 - 通过数据排序
const sortedData = sortByAmount(data);
tables: [
  {
    title: "订单明细(金额降序)",
    columns: generateTableColumns(sortedData),
    data: processTableData(sortedData.slice(0, 10)),
  },
]
```

### 4.4 流程分析配置

生成流程分析示例：

```javascript
// ✅ 基础流程分析 - 所有值必须通过计算得到
processAnalysis: {
  summary: {
    totalProcessNodes: calculateTotalNodes(data),
    completedNodes: calculateCompletedNodes(data),
    completionRate: calculateCompletionRate(data),
    averageProcessTime: formatDuration(calculateAverageTime(data))
  },
  // ✅ 正确：nodeStatus 通过映射得到
  nodeStatus: data.reduce((acc, curr) => {
    acc[curr.nodeName] = getNodeStatus(curr.status);
    return acc;
  }, {}),
  // ✅ 正确：processDuration 通过计算和格式化得到
  processDuration: {
    total: formatDuration(calculateTotalDuration(data)),
    nodesDuration: data.reduce((acc, curr) => {
      acc[curr.nodeName] = formatDuration(calculateNodeDuration(curr));
      return acc;
    }, {})
  }
}

// ✅ 带审批人统计的流程分析 - 所有统计必须基于数据
processAnalysis: {
  ...baseProcessAnalysis,
  approvers: calculateApproverStats(data),
  processStatus: calculateProcessStatus(data)
}
```
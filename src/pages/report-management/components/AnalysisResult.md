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
  insights: ['数据呈现上升趋势']
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

### 4. 完整配置示例

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
    // 数据洞察
    insights: [
      '总销售额达到3000元',
      '产品B销售占比较高'
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
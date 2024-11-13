# AnalysisResult 组件

数据分析结果展示组件，用于展示数据分析的统计摘要、图表和洞察。

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
  insights: ['数据呈现上升趋势']
};

<AnalysisResult analysis={analysis} />
Props
analysis
主要的数据分析结果对象，包含以下属性：

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

  // 数据洞察数组，包含分析发现和建议
  insights: string[];
}
支持的图表类型
1. 基础图表
饼图 (pie)

用途：展示占比数据
适用场景：部分与整体的关系展示
数据格式：[{ name: string, value: number }]
柱状图 (bar)

用途：比较数据大小
适用场景：分类数据的对比
数据格式：[{ name: string, value: number }]
折线图 (line)

用途：展示数据趋势
适用场景：连续数据的变化
数据格式：[{ name: string, value: number }]
面积图 (area)

用途：展示数据累计趋势
适用场景：数据的累积效应
数据格式：[{ name: string, value: number }]
2. 高级图表
散点图 (scatter)

用途：展示数据分布
适用场景：两个变量之间的关系
数据格式：[{ name: string, value: number }]
雷达图 (radar)

用途：多维度数据对比
适用场景：多个维度的数据对比
数据格式：[{ name: string, value: number }]
仪表盘 (radialBar)

用途：展示进度或达成率
适用场景：目标完成情况
数据格式：[{ name: string, value: number }]
树形图 (treemap)

用途：展示层级数据
适用场景：层级结构数据
数据格式：[{ name: string, value: number }]
漏斗图 (funnel)

用途：展示转化率
适用场景：流程转化数据
数据格式：[{ name: string, value: number }]
3. 特殊图表
复合图表 (composed)

用途：组合多种图表类型
适用场景：多维度数据分析
数据格式：
[{
  name: string,
  value: number,       // 主要指标
  secondaryValue: number, // 次要指标
  thirdValue: number     // 第三指标
}]
桑基图 (sankey)

用途：展示流向关系
适用场景：数据流转过程
数据格式：
{
  nodes: [{ name: string }],
  links: [{
    source: number,
    target: number,
    value: number
  }]
}
图表选择建议
数据对比场景

类别间数值对比：使用柱状图
部分占整体比例：使用饼图
多维度指标对比：使用雷达图
趋势分析场景

连续数据变化：使用折线图
累计数据变化：使用面积图
多指标趋势：使用复合图表
分布分析场景

数据分布关系：使用散点图
层级数据分布：使用树形图
流程数据分布：使用漏斗图
流向分析场景

数据流转过程：使用桑基图
目标达成情况：使用仪表盘
组件功能
统计摘要展示

以卡片形式展示各类统计指标
支持多种数据类型的展示
带有动画效果的数据呈现
图表可视化

支持多种图表类型
自动适应数据进行渲染
包含图例和数据提示
响应式布局
数据洞察展示
```

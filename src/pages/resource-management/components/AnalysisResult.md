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
    // 图表类型，支持 'pie' | 'bar'
    type: string;
    // 图表标题
    title: string;
    // 图表数据
    data: Array<{ name: string; value: number }>;
  }>;
  
  // 数据洞察数组，包含分析发现和建议
  insights: string[];
}
```

## 组件功能

1. **统计摘要展示**
   - 以卡片形式展示各类统计指标
   - 支持多种数据类型的展示（数字、文本、对象、数组）
   - 带有动画效果的数据呈现

2. **图表可视化**
   - 支持饼图（pie）和柱状图（bar）两种图表类型
   - 自动适应数据进行渲染
   - 包含图例和数据提示
   - 响应式布局

3. **数据洞察展示**
   - 清晰展示分析发现和建议
   - 带有图标和动画效果
   - 良好的视觉层次

## 样式特点

- 使用 NextUI 的 Card 组件作为容器
- 响应式网格布局
- 动画过渡效果
- 统一的设计风格
- 良好的空间层次

## 注意事项

1. 确保传入的 `analysis` 对象包含必要的 `summary` 和 `insights` 属性
2. 图表数据需要符合指定的数据结构
3. 组件会自动处理空值和异常情况
4. 动画效果使用 framer-motion 实现，确保安装相关依赖

## 依赖

- @nextui-org/react
- recharts
- framer-motion
- @/components/ui/card
- @/components/ui/chart
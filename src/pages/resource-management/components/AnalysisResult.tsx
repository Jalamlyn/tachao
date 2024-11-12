import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface AnalysisResultProps {
  analysis: {
    summary: Record<string, number | string | Record<string, number>>;
    charts?: {
      type: string;
      title: string;
      data: Array<{ name: string; value: number }>;
    }[];
    insights: string[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const chartConfig = {
  values: {
    label: "数值",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  const renderChart = (chart: {
    type: string;
    title: string;
    data: Array<{ name: string; value: number }>;
  }) => {
    switch (chart.type.toLowerCase()) {
      case 'pie':
        return (
          <ChartContainer config={chartConfig} className="aspect-[16/9] w-full">
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ChartContainer>
        );
      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="aspect-[16/9] w-full">
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey="value"
                fill={`var(--color-values)`}
                name="数值"
              />
            </BarChart>
          </ChartContainer>
        );
      default:
        return null;
    }
  };

  const renderSummaryItem = (key: string, value: number | string | Record<string, number>) => {
    if (typeof value === 'object') {
      return (
        <div key={key} className="p-4 border rounded">
          <p className="text-sm text-muted-foreground capitalize">{key}</p>
          <div className="space-y-1">
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className="flex justify-between">
                <span className="text-sm">{subKey}</span>
                <span className="text-sm font-medium">{subValue}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="p-4 border rounded">
        <p className="text-sm text-muted-foreground capitalize">{key}</p>
        <p className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 统计摘要卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>统计摘要</CardTitle>
          <CardDescription>数据分析的关键指标</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analysis.summary).map(([key, value]) => renderSummaryItem(key, value))}
          </div>
        </CardContent>
      </Card>

      {/* 图表展示 */}
      {analysis.charts?.map((chart, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{chart.title || '数据可视化'}</CardTitle>
            <CardDescription>图表分析</CardDescription>
          </CardHeader>
          <CardContent>
            {renderChart(chart)}
          </CardContent>
        </Card>
      ))}

      {/* 数据洞察 */}
      <Card>
        <CardHeader>
          <CardTitle>数据洞察</CardTitle>
          <CardDescription>关键发现与建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 rounded bg-muted"
              >
                <span className="text-primary">💡</span>
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalysisResult
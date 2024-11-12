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
} from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface AnalysisResultProps {
  analysis: {
    summary: Record<string, number | string>;
    charts?: {
      type: string;
      data: {
        labels: string[];
        values: number[];
      };
    }[];
    insights: string[];
  };
}

const chartConfig = {
  values: {
    label: "数值",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  // 转换图表数据格式
  const transformChartData = (chartData: { labels: string[]; values: number[] }) => {
    return chartData.labels.map((label, index) => ({
      name: label,
      values: chartData.values[index],
    }))
  }

  return (
    <div className="space-y-6">
      {/* 统计摘要卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>统计摘要</CardTitle>
          <CardDescription>数据分析的关键指标</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analysis.summary).map(([key, value]) => (
              <div key={key} className="p-4 border rounded">
                <p className="text-sm text-muted-foreground capitalize">{key}</p>
                <p className="text-2xl font-bold">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 图表展示 */}
      {analysis.charts?.map((chart, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>数据可视化</CardTitle>
            <CardDescription>图表分析</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-[16/9] w-full">
              <BarChart data={transformChartData(chart.data)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  dataKey="values"
                  fill={`var(--color-values)`}
                  name="数值"
                />
              </BarChart>
            </ChartContainer>
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
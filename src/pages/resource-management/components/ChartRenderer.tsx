import React from "react"
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
  Line,
  LineChart,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Treemap,
  Sankey,
  ComposedChart,
  FunnelChart,
  Funnel,
  ResponsiveContainer,
} from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

// 更新图表配色方案，使用 CSS 变量
const CHART_COLORS = [
  "hsl(var(--chart-1))", // 173 58% 39%
  "hsl(var(--chart-2))", // 12 76% 61%
  "hsl(var(--chart-3))", // 197 37% 24%
  "hsl(var(--chart-4))", // 43 74% 66%
  "hsl(var(--chart-5))", // 27 87% 67%
]

interface ChartData {
  type: string
  title: string
  data: any
}

// 图表配置
const chartConfig = {
  values: {
    label: "数值",
    color: "hsl(var(--chart-1))",
  },
  secondary: {
    label: "次要数值",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const ChartRenderer: React.FC<{ chart: ChartData }> = ({ chart }) => {
  // 通用的图表容器样式
  const containerStyle = "aspect-[16/9] w-full"

  // 数据格式转换函数
  const transformPieData = (data: { labels: string[]; values: number[] }) => {
    if (!data.labels || !data.values) return []
    return data.labels.map((label, index) => ({
      name: label,
      value: data.values[index],
    }))
  }

  switch (chart.type.toLowerCase()) {
    case "pie":
      const pieData = Array.isArray(chart.data) ? chart.data : transformPieData(chart.data)
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <PieChart>
            <Pie
              data={pieData}
              cx='50%'
              cy='50%'
              labelLine={true}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill='#8884d8'
              dataKey='value'
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
          </PieChart>
        </ChartContainer>
      )

    case "bar":
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey='value' fill={`var(--color-values)`} name='数值'>
              {chart.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )

    case "line":
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              type='monotone'
              dataKey='value'
              stroke={CHART_COLORS[0]}
              name='数值'
              dot={{ fill: CHART_COLORS[0] }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ChartContainer>
      )

    case "area":
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <AreaChart data={chart.data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Area type='monotone' dataKey='value' fill={CHART_COLORS[0]} stroke={CHART_COLORS[0]} name='数值' />
          </AreaChart>
        </ChartContainer>
      )

    case "radar":
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <RadarChart cx='50%' cy='50%' outerRadius='80%' data={chart.data}>
            <PolarGrid />
            <PolarAngleAxis dataKey='name' />
            <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
            <Radar name='数值' dataKey='value' stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.6} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
          </RadarChart>
        </ChartContainer>
      )

    case "scatter":
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <ScatterChart>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' type='category' />
            <YAxis dataKey='value' />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Scatter name='数值' data={chart.data} fill={CHART_COLORS[0]} />
          </ScatterChart>
        </ChartContainer>
      )

    case "radialBar":
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <RadialBarChart cx='50%' cy='50%' innerRadius='10%' outerRadius='80%' barSize={10} data={chart.data}>
            <RadialBar
              minAngle={15}
              label={{ fill: "#666", position: "insideStart" }}
              background
              clockWise={true}
              dataKey='value'
            >
              {chart.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </RadialBar>
            <Legend iconSize={10} layout='vertical' verticalAlign='middle' align='right' />
            <Tooltip content={<ChartTooltipContent />} />
          </RadialBarChart>
        </ChartContainer>
      )

    case "treemap":
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <Treemap data={chart.data} dataKey='value' aspectRatio={4 / 3} stroke='#fff' fill={CHART_COLORS[0]}>
            <Tooltip content={<ChartTooltipContent />} />
          </Treemap>
        </ChartContainer>
      )

    case "funnel":
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <FunnelChart>
            <Tooltip content={<ChartTooltipContent />} />
            <Funnel dataKey='value' data={chart.data} isAnimationActive>
              {chart.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Funnel>
          </FunnelChart>
        </ChartContainer>
      )

    case "composed":
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <ComposedChart data={chart.data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey='value' fill={CHART_COLORS[0]} name='主要数值' />
            <Line type='monotone' dataKey='secondaryValue' stroke={CHART_COLORS[1]} name='次要数值' />
            <Area
              type='monotone'
              dataKey='thirdValue'
              fill={CHART_COLORS[2]}
              stroke={CHART_COLORS[2]}
              name='第三数值'
            />
          </ComposedChart>
        </ChartContainer>
      )

    case "sankey":
      return (
        <ChartContainer config={chartConfig} className={containerStyle}>
          <Sankey
            data={chart.data}
            node={{
              fill: CHART_COLORS[0],
              stroke: "#fff",
            }}
            link={{
              stroke: CHART_COLORS[1],
            }}
            nodePadding={50}
          >
            <Tooltip content={<ChartTooltipContent />} />
          </Sankey>
        </ChartContainer>
      )

    default:
      return null
  }
}

export default ChartRenderer
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

// 获取响应式高度
const getResponsiveHeight = (type: string): number => {
  const isMobile = window.innerWidth < 768
  switch (type.toLowerCase()) {
    case "pie":
      return isMobile ? 300 : 400
    case "bar":
      return isMobile ? 250 : 350
    case "line":
    case "area":
      return isMobile ? 200 : 300
    case "radar":
      return isMobile ? 250 : 350
    case "scatter":
      return isMobile ? 250 : 350
    case "radialBar":
      return isMobile ? 300 : 400
    case "treemap":
      return isMobile ? 250 : 350
    case "funnel":
      return isMobile ? 300 : 400
    case "composed":
      return isMobile ? 300 : 400
    case "sankey":
      return isMobile ? 350 : 450
    default:
      return isMobile ? 250 : 350
  }
}

// 获取移动端字体大小
const getMobileFontSize = (): number => {
  return window.innerWidth < 768 ? 10 : 12
}

const ChartRenderer: React.FC<{ chart: ChartData }> = React.memo(({ chart }) => {
  // 通用的图表容器样式
  const containerStyle = "w-full"
  const fontSize = getMobileFontSize()
  const height = getResponsiveHeight(chart.type)

  // 数据格式转换函数
  const transformPieData = (data: { labels: string[]; values: number[] }) => {
    if (!data.labels || !data.values) return []
    return data.labels.map((label, index) => ({
      name: label,
      value: data.values[index],
    }))
  }

  const renderChart = () => {
    switch (chart.type.toLowerCase()) {
      case "pie":
        const pieData = Array.isArray(chart.data) ? chart.data : transformPieData(chart.data)
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={height * 0.35}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize }} />
          </PieChart>
        )

      case "bar":
        return (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis tick={{ fontSize }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize }} />
            <Bar dataKey="value" fill={`var(--color-values)`} name="数值">
              {chart.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )

      case "line":
        return (
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis tick={{ fontSize }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS[0]}
              name="数值"
              dot={{ fill: CHART_COLORS[0] }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        )

      case "area":
        return (
          <AreaChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis tick={{ fontSize }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize }} />
            <Area
              type="monotone"
              dataKey="value"
              fill={CHART_COLORS[0]}
              stroke={CHART_COLORS[0]}
              name="数值"
            />
          </AreaChart>
        )

      case "radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chart.data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tick={{ fontSize }} />
            <PolarRadiusAxis angle={30} domain={[0, "auto"]} tick={{ fontSize }} />
            <Radar
              name="数值"
              dataKey="value"
              stroke={CHART_COLORS[0]}
              fill={CHART_COLORS[0]}
              fillOpacity={0.6}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize }} />
          </RadarChart>
        )

      case "scatter":
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" type="category" tick={{ fontSize }} />
            <YAxis dataKey="value" tick={{ fontSize }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize }} />
            <Scatter name="数值" data={chart.data} fill={CHART_COLORS[0]} />
          </ScatterChart>
        )

      case "radialBar":
        return (
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="10%"
            outerRadius="80%"
            barSize={10}
            data={chart.data}
          >
            <RadialBar
              minAngle={15}
              label={{ fill: "#666", position: "insideStart", fontSize }}
              background
              clockWise={true}
              dataKey="value"
            >
              {chart.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </RadialBar>
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize }}
            />
            <Tooltip content={<ChartTooltipContent />} />
          </RadialBarChart>
        )

      case "treemap":
        return (
          <Treemap
            data={chart.data}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill={CHART_COLORS[0]}
          >
            <Tooltip content={<ChartTooltipContent />} />
          </Treemap>
        )

      case "funnel":
        return (
          <FunnelChart>
            <Tooltip content={<ChartTooltipContent />} />
            <Funnel dataKey="value" data={chart.data} isAnimationActive>
              {chart.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Funnel>
          </FunnelChart>
        )

      case "composed":
        return (
          <ComposedChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis tick={{ fontSize }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize }} />
            <Bar dataKey="value" fill={CHART_COLORS[0]} name="主要数值" />
            <Line type="monotone" dataKey="secondaryValue" stroke={CHART_COLORS[1]} name="次要数值" />
            <Area
              type="monotone"
              dataKey="thirdValue"
              fill={CHART_COLORS[2]}
              stroke={CHART_COLORS[2]}
              name="第三数值"
            />
          </ComposedChart>
        )

      case "sankey":
        return (
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
        )

      default:
        return null
    }
  }

  return (
    <ChartContainer config={chartConfig} className={containerStyle}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </ChartContainer>
  )
})

ChartRenderer.displayName = "ChartRenderer"

export default ChartRenderer
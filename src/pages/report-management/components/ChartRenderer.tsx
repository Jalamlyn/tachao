import React, { useMemo } from "react"
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

const ChartRenderer: React.FC<{ chart: ChartData }> = React.memo(({ chart }) => {
  const isMobile = useMemo(() => window.innerWidth < 768, [])
  const fontSize = useMemo(() => isMobile ? 10 : 12, [isMobile])

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
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius="80%"
              paddingAngle={2}
              labelLine={{ strokeWidth: 1 }}
              label={({ name, percent }) => 
                isMobile 
                  ? `${(percent * 100).toFixed(0)}%`
                  : `${name}: ${(percent * 100).toFixed(0)}%`
              }
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Legend
              layout={isMobile ? "horizontal" : "vertical"}
              align="center"
              verticalAlign="bottom"
              wrapperStyle={{
                fontSize,
                padding: 10,
                maxWidth: "100%",
              }}
            />
            <Tooltip content={<ChartTooltipContent />} />
          </PieChart>
        )

      case "bar":
        return (
          <BarChart data={chart.data} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
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
            <Legend
              wrapperStyle={{ fontSize, padding: 10 }}
              verticalAlign="top"
              height={36}
            />
            <Bar dataKey="value" fill={`var(--color-values)`} name="数值" maxBarSize={60}>
              {chart.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )

      case "line":
        return (
          <LineChart data={chart.data} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
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
            <Legend
              wrapperStyle={{ fontSize, padding: 10 }}
              verticalAlign="top"
              height={36}
            />
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
          <AreaChart data={chart.data} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
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
            <Legend
              wrapperStyle={{ fontSize, padding: 10 }}
              verticalAlign="top"
              height={36}
            />
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
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="80%"
            data={chart.data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
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
            <Legend
              wrapperStyle={{ fontSize, padding: 10 }}
              verticalAlign="bottom"
            />
          </RadarChart>
        )

      case "scatter":
        return (
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" type="category" tick={{ fontSize }} />
            <YAxis dataKey="value" tick={{ fontSize }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend
              wrapperStyle={{ fontSize, padding: 10 }}
              verticalAlign="top"
              height={36}
            />
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
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
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
              wrapperStyle={{ fontSize, padding: 10 }}
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
          <FunnelChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
          <ComposedChart data={chart.data} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
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
            <Legend
              wrapperStyle={{ fontSize, padding: 10 }}
              verticalAlign="top"
              height={36}
            />
            <Bar dataKey="value" fill={CHART_COLORS[0]} name="主要数值" maxBarSize={60} />
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
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <Tooltip content={<ChartTooltipContent />} />
          </Sankey>
        )

      default:
        return null
    }
  }

  const getChartHeight = () => {
    const baseHeight = isMobile ? 300 : 400
    switch (chart.type.toLowerCase()) {
      case "pie":
        return baseHeight
      case "bar":
      case "line":
      case "area":
      case "composed":
        return baseHeight + 60 // 额外空间用于旋转的 x 轴标签
      default:
        return baseHeight
    }
  }

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <div style={{ width: '100%', height: getChartHeight() }}>
        <ResponsiveContainer width="100%" height="100%" aspect={undefined}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
})

ChartRenderer.displayName = "ChartRenderer"

export default ChartRenderer
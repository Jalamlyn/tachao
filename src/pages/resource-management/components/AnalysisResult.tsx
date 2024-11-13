import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  Pie, PieChart, Cell, Line, LineChart, Area, AreaChart,
  Scatter, ScatterChart, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart,
  Treemap, Sankey, ComposedChart, FunnelChart, Funnel,
  ResponsiveContainer
} from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from "framer-motion"

interface AnalysisResultProps {
  analysis: {
    summary: Record<string, number | string | Record<string, number> | Array<{ name: string; count: number }>>
    charts?: {
      type: string
      title: string
      data: Array<any>
    }[]
    insights: string[]
  }
}

// 图表配色方案
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

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

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  const renderChart = (chart: { type: string; title: string; data: Array<any> }) => {
    // 通用的图表容器样式
    const containerStyle = 'aspect-[16/9] w-full'

    switch (chart.type.toLowerCase()) {
      // 保留原有的饼图实现
      case "pie":
        return (
          <ChartContainer config={chartConfig} className={containerStyle}>
            <PieChart>
              <Pie
                data={chart.data}
                cx='50%'
                cy='50%'
                labelLine={true}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ChartContainer>
        )

      // 保留原有的柱状图实现
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
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )

      // 新增折线图
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
                type="monotone"
                dataKey='value'
                stroke={CHART_COLORS[0]}
                name='数值'
                dot={{ fill: CHART_COLORS[0] }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ChartContainer>
        )

      // 新增面积图
      case "area":
        return (
          <ChartContainer config={chartConfig} className={containerStyle}>
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area
                type="monotone"
                dataKey='value'
                fill={CHART_COLORS[0]}
                stroke={CHART_COLORS[0]}
                name='数值'
              />
            </AreaChart>
          </ChartContainer>
        )

      // 新增雷达图
      case "radar":
        return (
          <ChartContainer config={chartConfig} className={containerStyle}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chart.data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
              <Radar
                name="数值"
                dataKey="value"
                stroke={CHART_COLORS[0]}
                fill={CHART_COLORS[0]}
                fillOpacity={0.6}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
            </RadarChart>
          </ChartContainer>
        )

      // 新增散点图
      case "scatter":
        return (
          <ChartContainer config={chartConfig} className={containerStyle}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" type="category" />
              <YAxis dataKey="value" />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Scatter
                name="数值"
                data={chart.data}
                fill={CHART_COLORS[0]}
              />
            </ScatterChart>
          </ChartContainer>
        )

      // 新增仪表盘
      case "radialBar":
        return (
          <ChartContainer config={chartConfig} className={containerStyle}>
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
                label={{ fill: '#666', position: 'insideStart' }}
                background
                clockWise={true}
                dataKey="value"
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </RadialBar>
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
              <Tooltip content={<ChartTooltipContent />} />
            </RadialBarChart>
          </ChartContainer>
        )

      // 新增树形图
      case "treemap":
        return (
          <ChartContainer config={chartConfig} className={containerStyle}>
            <Treemap
              data={chart.data}
              dataKey="value"
              aspectRatio={4/3}
              stroke="#fff"
              fill={CHART_COLORS[0]}
            >
              <Tooltip content={<ChartTooltipContent />} />
            </Treemap>
          </ChartContainer>
        )

      // 新增漏斗图
      case "funnel":
        return (
          <ChartContainer config={chartConfig} className={containerStyle}>
            <FunnelChart>
              <Tooltip content={<ChartTooltipContent />} />
              <Funnel
                dataKey="value"
                data={chart.data}
                isAnimationActive
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ChartContainer>
        )

      // 新增复合图表
      case "composed":
        return (
          <ChartContainer config={chartConfig} className={containerStyle}>
            <ComposedChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="value" fill={CHART_COLORS[0]} name="主要数值" />
              <Line type="monotone" dataKey="secondaryValue" stroke={CHART_COLORS[1]} name="次要数值" />
              <Area type="monotone" dataKey="thirdValue" fill={CHART_COLORS[2]} stroke={CHART_COLORS[2]} name="第三数值" />
            </ComposedChart>
          </ChartContainer>
        )

      // 新增桑基图
      case "sankey":
        return (
          <ChartContainer config={chartConfig} className={containerStyle}>
            <Sankey
              data={chart.data}
              node={{
                fill: '#8884d8',
                stroke: '#fff',
              }}
              link={{
                stroke: '#77c878',
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

  // 保持原有的渲染逻辑
  return (
    <div className='space-y-6 p-6'>
      {/* 统计摘要卡片 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>统计摘要</CardTitle>
            <CardDescription>数据分析的关键指标</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {Object.entries(analysis.summary).map(([key, value]) => renderSummaryItem(key, value))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 图表展示 */}
      {analysis.charts?.map((chart, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{chart.title || "数据可视化"}</CardTitle>
              <CardDescription>图表分析</CardDescription>
            </CardHeader>
            <CardContent>{renderChart(chart)}</CardContent>
          </Card>
        </motion.div>
      ))}

      {/* 数据洞察 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: (analysis.charts?.length || 0) * 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>数据洞察</CardTitle>
            <CardDescription>关键发现与建议</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {analysis.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className='flex items-start gap-2 p-2 rounded bg-muted'
                >
                  <span className='text-primary'>💡</span>
                  <p>{insight}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default AnalysisResult
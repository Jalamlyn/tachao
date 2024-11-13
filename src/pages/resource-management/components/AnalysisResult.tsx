/**
 * @component AnalysisResult
 * @description 数据分析结果展示组件，用于展示数据分析的统计摘要、图表和洞察。
 * 
 * @example
 * ```tsx
 * const analysis = {
 *   summary: {
 *     totalCount: 100,
 *     averageValue: 50
 *   },
 *   charts: [{
 *     type: 'pie',
 *     title: '分布图',
 *     data: [{ name: 'A', value: 30 }]
 *   }],
 *   insights: ['数据呈现上升趋势']
 * };
 * 
 * <AnalysisResult analysis={analysis} />
 * ```
 * 
 * @typedef {Object} ChartData
 * @property {string} type - 图表类型，支持 'pie' | 'bar'
 * @property {string} title - 图表标题
 * @property {Array<{name: string, value: number}>} data - 图表数据
 * 
 * @typedef {Object} Analysis
 * @property {Object} summary - 统计摘要，包含各种统计指标
 * @property {ChartData[]} [charts] - 可选的图表数据数组
 * @property {string[]} insights - 数据洞察数组
 * 
 * @param {Object} props
 * @param {Analysis} props.analysis - 分析结果数据对象
 */

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Pie, PieChart, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from "framer-motion"

interface AnalysisResultProps {
  analysis: {
    summary: Record<string, number | string | Record<string, number> | Array<{ name: string; count: number }>>
    charts?: {
      type: string
      title: string
      data: Array<{ name: string; value: number }>
    }[]
    insights: string[]
  }
}

const chartConfig = {
  values: {
    label: "数值",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  const renderChart = (chart: { type: string; title: string; data: Array<{ name: string; value: number }> }) => {
    switch (chart.type.toLowerCase()) {
      case "pie":
        return (
          <ChartContainer config={chartConfig} className='aspect-[16/9] w-full'>
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
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ChartContainer>
        )
      case "bar":
        return (
          <ChartContainer config={chartConfig} className='aspect-[16/9] w-full'>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey='value' fill={`var(--color-values)`} name='数值' />
            </BarChart>
          </ChartContainer>
        )
      default:
        return null
    }
  }

  const renderSummaryItem = (
    key: string,
    value: number | string | Record<string, number> | Array<{ name: string; count: number }>
  ) => {
    if (Array.isArray(value)) {
      // 处理数组类型的数据
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='p-4 border rounded bg-white shadow-sm hover:shadow-md transition-shadow'
        >
          <p className='text-sm text-muted-foreground capitalize'>{key}</p>
          <div className='space-y-1'>
            {value.map((item, index) => (
              <div key={index} className='flex justify-between'>
                <span className='text-sm'>{item.name}</span>
                <span className='text-sm font-medium'>{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )
    } else if (typeof value === "object") {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='p-4 border rounded bg-white shadow-sm hover:shadow-md transition-shadow'
        >
          <p className='text-sm text-muted-foreground capitalize'>{key}</p>
          <div className='space-y-1'>
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className='flex justify-between'>
                <span className='text-sm'>{subKey}</span>
                <span className='text-sm font-medium'>{subValue}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='p-4 border rounded bg-white shadow-sm hover:shadow-md transition-shadow'
      >
        <p className='text-sm text-muted-foreground capitalize'>{key}</p>
        <p className='text-2xl font-bold'>{typeof value === "number" ? value.toLocaleString() : value}</p>
      </motion.div>
    )
  }

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
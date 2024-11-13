import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import ChartRenderer from "./ChartRenderer"
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table"

interface AnalysisResultProps {
  analysis: {
    summary: Record<string, number | string | Record<string, number> | Array<{ name: string; count: number }>>
    charts?: {
      type: string
      title: string
      data: any
    }[]
    tables?: {
      title: string
      columns: {
        key: string
        title: string
      }[]
      data: any[]
    }[]
    insights: string[]
  }
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  // 添加 renderSummaryItem 函数实现
  const renderSummaryItem = (
    key: string,
    value: number | string | Record<string, number> | Array<{ name: string; count: number }>
  ) => {
    if (typeof value === "number" || typeof value === "string") {
      return (
        <div key={key} className='p-4 bg-muted rounded-lg'>
          <div className='text-sm text-muted-foreground'>{key}</div>
          <div className='text-2xl font-semibold mt-1'>{value}</div>
        </div>
      )
    } else if (Array.isArray(value)) {
      return (
        <div key={key} className='p-4 bg-muted rounded-lg'>
          <div className='text-sm text-muted-foreground mb-2'>{key}</div>
          <div className='space-y-1'>
            {value.map((item, index) => (
              <div key={index} className='flex justify-between text-sm'>
                <span>{item.name}</span>
                <span className='font-medium'>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )
    } else if (typeof value === "object") {
      return (
        <div key={key} className='p-4 bg-muted rounded-lg'>
          <div className='text-sm text-muted-foreground mb-2'>{key}</div>
          <div className='space-y-1'>
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className='flex justify-between text-sm'>
                <span>{subKey}</span>
                <span className='font-medium'>{subValue}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
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
            <CardContent className='min-h-80'>
              <ChartRenderer chart={chart} />
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* 明细表格 */}
      {analysis.tables?.map((table, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: (analysis.charts?.length || 0) * 0.1 + index * 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{table.title || "数据明细"}</CardTitle>
              <CardDescription>详细数据记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {table.columns.map((column) => (
                        <TableCell key={column.key} className='font-medium'>
                          {column.title}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.data.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {table.columns.map((column) => (
                          <TableCell key={`${rowIndex}-${column.key}`}>{row[column.key]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* 数据洞察 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: (analysis.charts?.length || 0) * 0.1 + (analysis.tables?.length || 0) * 0.1 }}
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
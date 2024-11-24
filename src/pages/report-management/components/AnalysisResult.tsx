import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import ChartRenderer from "./ChartRenderer"
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { cn } from "@/theme/cn"
import { Tabs, Tab, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { MultiSourceAnalysisResult, MultiSourceSummaryItem } from "../types"

// 空状态组件
const EmptyState: React.FC = () => {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center min-h-[400px] p-8'
    >
      <div className='w-48 h-48 mb-8 relative'>
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Icon icon='hugeicons:ai-chat-02' className='w-full h-full text-primary/30' />
        </motion.div>
      </div>
      <h3 className='text-xl font-medium text-foreground mb-2'>还没有分析数据</h3>
      <p className='text-default-500 mb-8 text-center max-w-md'>使用 AI 助手来分析您的数据，生成图表和洞察报告</p>
    </motion.div>
  )
}

// 渲染多数据源统计摘要
const renderMultiSourceSummary = (summary: Record<string, MultiSourceSummaryItem>) => {
  return Object.entries(summary).map(([key, item]) => (
    <motion.div
      key={key}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="text-sm text-muted-foreground font-medium mb-2">
        {item.label}
        {item.sourceTitle && (
          <span className="ml-2 text-xs text-primary">
            来自: {item.sourceTitle}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
        {typeof item.value === 'object' ? JSON.stringify(item.value) : item.value}
      </div>
    </motion.div>
  ))
}

// 渲染多数据源图表
const renderMultiSourceChart = (chart: MultiSourceAnalysisResult['charts'][0]) => {
  return (
    <ChartRenderer
      chart={{
        ...chart,
        data: chart.data.map(item => ({
          ...item,
          name: item.sourceTitle ? `${item.name} (${item.sourceTitle})` : item.name
        }))
      }}
    />
  )
}

// 渲染多数据源洞察
const renderMultiSourceInsights = (insights: MultiSourceAnalysisResult['insights']) => {
  return insights.map((insight, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-border/50"
    >
      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10">
        💡
      </span>
      <div>
        <p className="text-foreground/90 leading-relaxed">{insight.content}</p>
        {insight.sourceIds && insight.sourceIds.length > 0 && (
          <div className="mt-2 flex gap-2">
            {insight.sourceIds.map(sourceId => (
              <span key={sourceId} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                {sourceId}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  ))
}

interface AnalysisResultProps {
  analysis: MultiSourceAnalysisResult
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  // 动画变体配置
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  // 检查数据是否为空
  if (!analysis || !analysis.summary || Object.keys(analysis.summary).length === 0) {
    return <EmptyState />
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 p-4">
      {/* 统计摘要卡片 */}
      <motion.div variants={itemVariants}>
        <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
          <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5'>
            <CardTitle className='text-xl font-bold'>统计摘要</CardTitle>
            <CardDescription>关键数据指标分析</CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {renderMultiSourceSummary(analysis.summary)}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 图表展示 - 使用 Tabs */}
      <AnimatePresence>
        {analysis.charts && analysis.charts.length > 0 && (
          <motion.div variants={itemVariants} layout>
            <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5'>
                <CardTitle className='text-xl font-bold'>数据可视化</CardTitle>
                <CardDescription>图表分析</CardDescription>
              </CardHeader>
              <CardContent className='p-6'>
                <Tabs>
                  {analysis.charts.map((chart, index) => (
                    <Tab key={index} title={chart.title}>
                      <div className='min-h-[400px] p-4'>
                        {renderMultiSourceChart(chart)}
                      </div>
                    </Tab>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 表格展示 */}
      <AnimatePresence>
        {analysis.tables && analysis.tables.length > 0 && (
          <motion.div variants={itemVariants} layout>
            <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5'>
                <CardTitle className='text-xl font-bold'>数据明细</CardTitle>
                <CardDescription>详细数据列表</CardDescription>
              </CardHeader>
              <CardContent className='p-6'>
                {analysis.tables.map((table, tableIndex) => (
                  <div key={tableIndex} className="space-y-4">
                    <h3 className="text-lg font-semibold">{table.title}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {table.columns.map((column, columnIndex) => (
                            <TableCell key={columnIndex} className="font-medium">
                              {column.title}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {table.data.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {table.columns.map((column, columnIndex) => (
                              <TableCell key={columnIndex}>
                                {row[column.key]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 数据洞察 */}
      <motion.div variants={itemVariants}>
        <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
          <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5'>
            <CardTitle className='text-xl font-bold'>数据洞察</CardTitle>
            <CardDescription>关键发现与建议</CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='space-y-3'>
              {renderMultiSourceInsights(analysis.insights)}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default AnalysisResult
import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import ChartRenderer from "./ChartRenderer"
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { cn } from "@/theme/cn"

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
    // 新增: 流程分析数据
    processAnalysis?: {
      summary?: {
        totalProcessNodes: number
        completedNodes: number
        completionRate: string
        averageProcessTime: string
      }
      nodeStatus?: Record<string, string>
      processDuration?: {
        total: string
        nodesDuration: Record<string, string>
      }
      approvers?: Record<string, number>
      processStatus?: Record<string, number>
    }
  }
}

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

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  // 渲染摘要项
  const renderSummaryItem = (
    key: string,
    value: number | string | Record<string, number> | Array<{ name: string; count: number }>
  ) => {
    if (typeof value === "number" || typeof value === "string") {
      return (
        <motion.div
          variants={itemVariants}
          className='relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'
        >
          <div className='text-sm text-muted-foreground font-medium mb-2'>{key}</div>
          <div className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70'>
            {value}
          </div>
        </motion.div>
      )
    } else if (Array.isArray(value)) {
      return (
        <motion.div
          variants={itemVariants}
          className='rounded-xl bg-gradient-to-br from-background to-muted p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'
        >
          <div className='text-sm text-muted-foreground font-medium mb-3'>{key}</div>
          <div className='space-y-2'>
            {value.map((item, index) => (
              <div key={index} className='flex justify-between items-center p-2 rounded-lg bg-background/50'>
                <span className='font-medium'>{item.name}</span>
                <span className='text-primary font-semibold'>{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )
    } else if (typeof value === "object") {
      return (
        <motion.div
          variants={itemVariants}
          className='rounded-xl bg-gradient-to-br from-background to-muted p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'
        >
          <div className='text-sm text-muted-foreground font-medium mb-3'>{key}</div>
          <div className='space-y-2'>
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className='flex justify-between items-center p-2 rounded-lg bg-background/50'>
                <span className='font-medium'>{subKey}</span>
                <span className='text-primary font-semibold'>{subValue}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )
    }
    return null
  }

  // 渲染表格单元格内容
  const renderTableCell = (key: string, value: any) => {
    // 如果是 orderNumber 列,渲染为链接
    if (key === "id") {
      const formId = `${value}`
      return (
        <a
          href={`/form/${formId}`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary hover:text-primary/80 hover:underline transition-colors duration-200'
        >
          {value}
        </a>
      )
    }
    // 其他列正常渲染
    return value
  }

  // 新增: 渲染流程分析卡片
  const renderProcessAnalysis = () => {
    if (!analysis.processAnalysis) return null

    const { summary, nodeStatus, processDuration, approvers, processStatus } = analysis.processAnalysis

    // 生成流程节点状态的图表数据
    const nodeStatusChartData = nodeStatus
      ? {
          type: "pie",
          title: "流程节点状态分布",
          data: Object.entries(nodeStatus).map(([name, status]) => ({
            name,
            value: status === "已完成" ? 1 : 0,
          })),
        }
      : null

    // 生成审批人工作量的图表数据
    const approversChartData = approvers
      ? {
          type: "bar",
          title: "审批人工作量统计",
          data: Object.entries(approvers).map(([name, count]) => ({
            name,
            value: count,
          })),
        }
      : null

    return (
      <motion.div variants={itemVariants}>
        <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
          <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5'>
            <CardTitle className='text-xl font-bold'>流程分析</CardTitle>
            <CardDescription>流程执行情况统计</CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='space-y-6'>
              {/* 流程概览 */}
              {summary && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <motion.div
                    variants={itemVariants}
                    className='rounded-xl bg-gradient-to-br from-background to-muted p-4 shadow'
                  >
                    <div className='text-sm text-muted-foreground'>总节点数</div>
                    <div className='text-2xl font-bold text-primary'>{summary.totalProcessNodes}</div>
                  </motion.div>
                  <motion.div
                    variants={itemVariants}
                    className='rounded-xl bg-gradient-to-br from-background to-muted p-4 shadow'
                  >
                    <div className='text-sm text-muted-foreground'>已完成节点</div>
                    <div className='text-2xl font-bold text-primary'>{summary.completedNodes}</div>
                  </motion.div>
                  <motion.div
                    variants={itemVariants}
                    className='rounded-xl bg-gradient-to-br from-background to-muted p-4 shadow'
                  >
                    <div className='text-sm text-muted-foreground'>完成率</div>
                    <div className='text-2xl font-bold text-primary'>{summary.completionRate}</div>
                  </motion.div>
                  <motion.div
                    variants={itemVariants}
                    className='rounded-xl bg-gradient-to-br from-background to-muted p-4 shadow'
                  >
                    <div className='text-sm text-muted-foreground'>平均处理时长</div>
                    <div className='text-2xl font-bold text-primary'>{summary.averageProcessTime}</div>
                  </motion.div>
                </div>
              )}

              {/* 流程节点状态图表 */}
              {nodeStatusChartData && (
                <div className='mt-6'>
                  <ChartRenderer chart={nodeStatusChartData} />
                </div>
              )}

              {/* 审批人工作量图表 */}
              {approversChartData && (
                <div className='mt-6'>
                  <ChartRenderer chart={approversChartData} />
                </div>
              )}

              {/* 流程耗时详情 */}
              {processDuration && (
                <div className='mt-6'>
                  <h3 className='text-lg font-semibold mb-3'>流程耗时分析</h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center p-2 rounded-lg bg-background/50'>
                      <span className='font-medium'>总耗时</span>
                      <span className='text-primary font-semibold'>{processDuration.total}</span>
                    </div>
                    {Object.entries(processDuration.nodesDuration).map(([node, duration]) => (
                      <div key={node} className='flex justify-between items-center p-2 rounded-lg bg-background/50'>
                        <span className='font-medium'>{node}</span>
                        <span className='text-primary font-semibold'>{duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial='hidden' animate='show' className='space-y-6 p-4'>
      {/* 统计摘要卡片 */}
      <motion.div variants={itemVariants}>
        <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
          <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5'>
            <CardTitle className='text-xl font-bold'>统计摘要</CardTitle>
            <CardDescription>关键数据指标分析</CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {Object.entries(analysis.summary).map(([key, value]) => renderSummaryItem(key, value))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 流程分析卡片 */}
      {renderProcessAnalysis()}

      {/* 图表展示 */}
      <AnimatePresence>
        {analysis.charts?.map((chart, index) => (
          <motion.div key={index} variants={itemVariants} layout>
            <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5'>
                <CardTitle className='text-xl font-bold'>{chart.title || "数据可视化"}</CardTitle>
                <CardDescription>图表分析与趋势</CardDescription>
              </CardHeader>
              <CardContent className='min-h-[400px] p-6'>
                <ChartRenderer chart={chart} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 明细表格 */}
      <AnimatePresence>
        {analysis.tables?.map((table, index) => (
          <motion.div key={index} variants={itemVariants} layout>
            <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5'>
                <CardTitle className='text-xl font-bold'>{table.title || "数据明细"}</CardTitle>
                <CardDescription>详细数据记录</CardDescription>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='rounded-xl border border-border/50 overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-muted/50'>
                        {table.columns.map((column) => (
                          <TableCell key={column.key} className='font-medium text-muted-foreground'>
                            {column.title}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.data.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className={cn(
                            "transition-colors hover:bg-muted/30",
                            rowIndex % 2 === 0 ? "bg-background" : "bg-muted/10"
                          )}
                        >
                          {table.columns.map((column) => (
                            <TableCell key={`${rowIndex}-${column.key}`}>
                              {renderTableCell(column.key, row[column.key])}
                            </TableCell>
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
              {analysis.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-border/50'
                >
                  <span className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary'>
                    💡
                  </span>
                  <p className='text-foreground/90 leading-relaxed'>{insight}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default AnalysisResult
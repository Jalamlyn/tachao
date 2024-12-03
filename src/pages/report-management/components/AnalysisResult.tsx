import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import ChartRenderer from "./ChartRenderer"
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { cn } from "@/theme/cn"
import { Tabs, Tab, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { MultiSourceAnalysisResult } from "../types"

// 空状态组件
const EmptyState: React.FC = () => {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center min-h-[400px] p-4 md:p-8'
    >
      <div className='w-32 h-32 md:w-48 md:h-48 mb-4 md:mb-8 relative'>
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
      <h3 className='text-lg md:text-xl font-medium text-foreground mb-2'>还没有分析数据</h3>
      <p className='text-default-500 mb-4 text-center max-w-md text-sm md:text-base'>
        使用 AI 助手来分析您的数据，生成图表和洞察报告
      </p>
    </motion.div>
  )
}

interface AnalysisResultProps {
  analysis?: MultiSourceAnalysisResult["analysis"]
}

const AnalysisResult: React.FC<AnalysisResultProps> = React.memo(({ analysis }) => {
  const isMobile = useMemo(() => window.innerWidth < 768, [])

  if (!analysis) {
    return <EmptyState />
  }

  const { summary, charts = [], insights = [], tables = [] } = analysis

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

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='show'
      className='space-y-4 md:space-y-6 p-2 md:p-4'
    >
      {/* 统计摘要卡片 */}
      <motion.div variants={itemVariants}>
        <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
          <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6'>
            <CardTitle className='text-lg md:text-xl font-bold'>统计摘要</CardTitle>
            <CardDescription className='text-sm md:text-base'>关键数据指标分析</CardDescription>
          </CardHeader>
          <CardContent className='p-3 md:p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4'>
              {Object.entries(summary).map(([key, item]) => (
                <motion.div
                  key={key}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className='relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'
                >
                  <div className='text-sm text-muted-foreground font-medium mb-2'>
                    {item.label}
                    {item.sourceTitle && <span className='ml-2 text-xs text-primary'>来自: {item.sourceTitle}</span>}
                  </div>
                  <div className='text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70'>
                    {typeof item.value === "object" ? JSON.stringify(item.value) : item.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 图表展示 */}
      <AnimatePresence>
        {charts && charts.length > 0 && (
          <motion.div variants={itemVariants} layout>
            <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6'>
                <CardTitle className='text-lg md:text-xl font-bold'>数据可视化</CardTitle>
                <CardDescription className='text-sm md:text-base'>图表分析</CardDescription>
              </CardHeader>
              <CardContent className='p-3 md:p-6'>
                <Tabs>
                  {charts.map((chart, index) => (
                    <Tab key={index} title={chart.title}>
                      <div className='w-full' style={{ minHeight: isMobile ? 360 : 460 }}>
                        <ChartRenderer chart={chart} />
                      </div>
                    </Tab>
                  ))}
                </Tabs>
                {isMobile && charts.length > 1 && (
                  <div className='text-xs text-center text-gray-500 mt-2'>左右滑动查看更多图表</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 表格展示 */}
      <AnimatePresence>
        {tables && tables.length > 0 && (
          <motion.div variants={itemVariants} layout>
            <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6'>
                <CardTitle className='text-lg md:text-xl font-bold'>数据明细</CardTitle>
                <CardDescription className='text-sm md:text-base'>详细数据列表</CardDescription>
              </CardHeader>
              <CardContent className='p-3 md:p-6'>
                {tables.map((table, tableIndex) => (
                  <div key={tableIndex} className='space-y-4'>
                    <h3 className='text-base md:text-lg font-semibold'>{table.title}</h3>
                    <div className='overflow-x-auto -mx-3 md:-mx-6'>
                      <div className='inline-block min-w-full align-middle p-3 md:p-6'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {table.columns.map((column, columnIndex) => (
                                <TableCell
                                  key={columnIndex}
                                  className='font-medium whitespace-nowrap text-sm md:text-base'
                                >
                                  {column.label}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {table.data.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {table.columns.map((column, columnIndex) => (
                                  <TableCell key={columnIndex} className='whitespace-nowrap text-sm md:text-base'>
                                    {row[column.key]}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
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
          <CardHeader className='bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6'>
            <CardTitle className='text-lg md:text-xl font-bold'>数据洞察</CardTitle>
            <CardDescription className='text-sm md:text-base'>关键发现与建议</CardDescription>
          </CardHeader>
          <CardContent className='p-3 md:p-6'>
            <div className='space-y-3'>
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='flex items-start gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-border/50'
                >
                  <span className='flex-shrink-0 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-primary/10'>
                    💡
                  </span>
                  <div>
                    <p className='text-foreground/90 leading-relaxed text-sm md:text-base'>{insight.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
})

AnalysisResult.displayName = "AnalysisResult"

export default AnalysisResult

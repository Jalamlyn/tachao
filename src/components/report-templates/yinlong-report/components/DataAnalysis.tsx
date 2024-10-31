import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { StatItem } from "@/types/yinlong"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DataAnalysisProps {
  data: StatItem[]
  activeView: 'manufacturer' | 'product' | 'project'
  onViewChange: (view: 'manufacturer' | 'product' | 'project') => void
}

const chartConfig = {
  outbound: {
    label: "出库数量",
    color: "hsl(var(--chart-1))",
  },
  inbound: {
    label: "入库数量",
    color: "hsl(var(--chart-2))",
  },
  amount: {
    label: "金额",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const DataAnalysis: React.FC<DataAnalysisProps> = ({
  data,
  activeView,
  onViewChange,
}) => {
  const viewOptions = [
    { value: 'manufacturer', label: '加工单位' },
    { value: 'product', label: '产品' },
    { value: 'project', label: '加工项目' },
  ]

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>统计分析</CardTitle>
          <Tabs value={activeView} onValueChange={onViewChange}>
            <TabsList>
              {viewOptions.map(option => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar
              dataKey="outbound"
              fill={`var(--color-outbound)`}
              name="出库数量"
            />
            <Bar
              dataKey="inbound"
              fill={`var(--color-inbound)`}
              name="入库数量"
            />
            <Bar
              dataKey="amount"
              fill={`var(--color-amount)`}
              name="金额"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default DataAnalysis
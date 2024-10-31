import React, { useState, useEffect, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icon } from "@iconify/react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getMetadata } from "@/service/apis/metadata"
import { jsonParse } from "@/utils"
import { SalesOrder } from "../../from-templates/sales-order/types/SalesOrder"

interface SalesOrderReportProps {
  reportId: string
  data: any
}

const chartConfig = {
  amount: {
    label: "订单金额",
    color: "hsl(var(--chart-1))",
  },
  count: {
    label: "订单数量",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const SalesOrderReport: React.FC<SalesOrderReportProps> = ({ reportId, data }) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("amount")

  useEffect(() => {
    async function fetchData() {
      const names = data?.dataSources?.map((item: string) => `form_${item}`)
      const res = await getMetadata(names)
      const orders: SalesOrder[] = res.data?.map((item: any) => jsonParse(item.value))
      setSalesOrders(orders)
      processChartData(orders)
    }
    fetchData()
  }, [data])

  const processChartData = (orders: SalesOrder[]) => {
    const monthlyData: { [key: string]: { count: number; amount: number } } = {}

    orders.forEach((order) => {
      const date = new Date(order.data.basicInfo.signDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, amount: 0 }
      }

      monthlyData[monthKey].count += 1
      monthlyData[monthKey].amount += order.data.totalAmount
    })

    const chartData = Object.entries(monthlyData).map(([date, data]) => ({
      date,
      count: data.count,
      amount: data.amount,
    }))

    setChartData(chartData.sort((a, b) => a.date.localeCompare(b.date)))
  }

  const total = useMemo(
    () => ({
      count: salesOrders.length,
      amount: salesOrders.reduce((sum, order) => sum + order.data.totalAmount, 0),
    }),
    [salesOrders]
  )

  const uniqueCustomers = useMemo(
    () => new Set(salesOrders.map((order) => order.data.customerInfo.customerId)).size,
    [salesOrders]
  )

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">销售订单统计报表 (ID: {reportId})</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">销售订单总金额</p>
              <p className="text-2xl font-bold">¥{total.amount.toFixed(2)}</p>
            </div>
            <Icon icon="mdi:cash-multiple" className="h-10 w-10 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">签单客户数</p>
              <p className="text-2xl font-bold">{uniqueCustomers}</p>
            </div>
            <Icon icon="mdi:account-group" className="h-10 w-10 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">销售订单签署数量</p>
              <p className="text-2xl font-bold">{total.count}</p>
            </div>
            <Icon icon="mdi:file-document-multiple" className="h-10 w-10 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>销售订单趋势</CardTitle>
          <CardDescription>{`${chartData[0]?.date} - ${chartData[chartData.length - 1]?.date}`}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                  })
                }}
              />
              <YAxis axisLine={false} tickLine={false} tickMargin={10} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            {activeChart === "amount" ? "订单金额" : "订单数量"}趋势
          </div>
          <div className="leading-none text-muted-foreground">
            显示最近几个月的{activeChart === "amount" ? "订单金额" : "订单数量"}趋势
          </div>
        </CardFooter>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>销售订单明细</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单编号</TableHead>
                <TableHead>客户名称</TableHead>
                <TableHead>签订日期</TableHead>
                <TableHead>总金额</TableHead>
                <TableHead>产品明细</TableHead>
                <TableHead>送货计划</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.data.basicInfo.orderNumber}</TableCell>
                  <TableCell>{order.data.customerInfo.customerName}</TableCell>
                  <TableCell>{order.data.basicInfo.signDate}</TableCell>
                  <TableCell>¥{order.data.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <details>
                      <summary className="cursor-pointer">查看产品明细</summary>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>产品名称</TableHead>
                            <TableHead>数量</TableHead>
                            <TableHead>单价</TableHead>
                            <TableHead>总价</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.data.productDetails.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell>{product.产品名称}</TableCell>
                              <TableCell>{product.quantity}</TableCell>
                              <TableCell>¥{parseFloat(product["销售单价(含税)/元"]).toFixed(2)}</TableCell>
                              <TableCell>¥{product.totalPrice.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </details>
                  </TableCell>
                  <TableCell>
                    <details>
                      <summary className="cursor-pointer">查看送货计划</summary>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>批次</TableHead>
                            <TableHead>计划日期</TableHead>
                            <TableHead>内容</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.data.deliveryPlan.plans.map((plan, index) => (
                            <TableRow key={index}>
                              <TableCell>{plan.batch}</TableCell>
                              <TableCell>{plan.plannedDate}</TableCell>
                              <TableCell>{plan.content}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </details>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesOrderReport
import React, { useState, useEffect, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Line, LineChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, AreaChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getMetadata } from "@/service/apis/metadata"
import { jsonParse } from "@/utils"
import { SalesOrder } from "../../from-templates/sales-order/types/SalesOrder"

interface SalesOrderProfitReportProps {
  reportId: string
  data: any
}

const chartConfig = {
  sales: {
    label: "销售额/元",
    color: "hsl(var(--chart-1))",
  },
  cost: {
    label: "成本/元",
    color: "hsl(var(--chart-2))",
  },
  profit: {
    label: "毛利率%",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const SalesOrderProfitReport: React.FC<SalesOrderProfitReportProps> = ({ reportId, data }) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [chartData, setChartData] = useState<any[]>([])

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
    const monthlyData: { [key: string]: { sales: number; cost: number; profit: number } } = {}

    orders.forEach((order) => {
      const date = new Date(order.data.basicInfo.signDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sales: 0, cost: 0, profit: 0 }
      }

      order.data.productDetails.forEach((product) => {
        const sales = product.quantity * parseFloat(product["销售单价(含税)/元"])
        const cost = product.quantity * parseFloat(product["成本单价/元"])
        monthlyData[monthKey].sales += sales
        monthlyData[monthKey].cost += cost
      })

      monthlyData[monthKey].profit = ((monthlyData[monthKey].sales - monthlyData[monthKey].cost) / monthlyData[monthKey].sales) * 100
    })

    const chartData = Object.entries(monthlyData).map(([date, data]) => ({
      date,
      sales: data.sales,
      cost: data.cost,
      profit: data.profit,
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
      <h2 className="text-2xl font-bold mb-4">销售订单毛利率分析报表 (ID: {reportId})</h2>
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
          <CardTitle>销售毛利率趋势</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[400px] w-full"
          >
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              stackOffset="expand"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                }}
              />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    className="w-[150px]"
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="profit"
                stackId="1"
                stroke={`var(--color-profit)`}
                fill={`var(--color-profit)`}
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="cost"
                stackId="1"
                stroke={`var(--color-cost)`}
                fill={`var(--color-cost)`}
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stackId="1"
                stroke={`var(--color-sales)`}
                fill={`var(--color-sales)`}
                fillOpacity={0.4}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>销售订单毛利率明细</CardTitle>
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

export default SalesOrderProfitReport
import React, { useState, useEffect } from "react"
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
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, BarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getMetadata } from "@/service/apis/metadata"
import { jsonParse } from "@/utils"
import { SalesOrder } from "../../from-templates/sales-order/types/SalesOrder"

interface ProductPriceFluctuationReportProps {
  reportId: string
  data: any
}

const chartConfig = {
  price: {
    label: "平均价格",
    color: "hsl(var(--chart-1))",
  },
  sales: {
    label: "销售数量",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const ProductPriceFluctuationReport: React.FC<ProductPriceFluctuationReportProps> = ({ reportId, data }) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")

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
    const productData: { [key: string]: { [key: string]: { price: number; sales: number } } } = {}

    orders.forEach((order) => {
      const date = new Date(order.data.basicInfo.signDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      order.data.productDetails.forEach((product) => {
        if (!productData[product.产品编码]) {
          productData[product.产品编码] = {}
        }
        if (!productData[product.产品编码][monthKey]) {
          productData[product.产品编码][monthKey] = { price: 0, sales: 0 }
        }
        productData[product.产品编码][monthKey].price += parseFloat(product["销售单价(含税)/元"]) * product.quantity
        productData[product.产品编码][monthKey].sales += product.quantity
      })
    })

    const firstProductCode = Object.keys(productData)[0]
    setSelectedProduct(firstProductCode)

    const chartData = Object.entries(productData[firstProductCode]).map(([date, data]) => ({
      date,
      price: data.price / data.sales,
      sales: data.sales,
    }))

    setChartData(chartData.sort((a, b) => a.date.localeCompare(b.date)))
  }

  const handleProductChange = (productCode: string) => {
    setSelectedProduct(productCode)
    const productChartData = Object.entries(
      salesOrders.reduce((acc: any, order) => {
        const date = new Date(order.data.basicInfo.signDate)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const product = order.data.productDetails.find((p) => p.产品编码 === productCode)
        if (product) {
          if (!acc[monthKey]) {
            acc[monthKey] = { price: 0, sales: 0 }
          }
          acc[monthKey].price += parseFloat(product["销售单价(含税)/元"]) * product.quantity
          acc[monthKey].sales += product.quantity
        }
        return acc
      }, {})
    ).map(([date, data]: [string, any]) => ({
      date,
      price: data.price / data.sales,
      sales: data.sales,
    }))

    setChartData(productChartData.sort((a, b) => a.date.localeCompare(b.date)))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">产品销售价格-波动统计/月 (ID: {reportId})</h2>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>产品选择</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full p-2 border rounded"
            value={selectedProduct}
            onChange={(e) => handleProductChange(e.target.value)}
          >
            {Array.from(new Set(salesOrders.flatMap(order => order.data.productDetails.map(product => product.产品编码)))).map((productCode) => (
              <option key={productCode} value={productCode}>
                {productCode}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>价格波动趋势</CardTitle>
          <CardDescription>{`${chartData[0]?.date} - ${chartData[chartData.length - 1]?.date}`}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
            <LineChart data={chartData}>
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
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
              <Line yAxisId="left" type="monotone" dataKey="price" stroke={`var(--color-price)`} activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="sales" stroke={`var(--color-sales)`} activeDot={{ r: 8 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            产品价格和销量趋势
          </div>
          <div className="leading-none text-muted-foreground">
            显示选定产品的月度价格和销量变化
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>产品销售价格波动统计表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>月份</TableHead>
                  <TableHead>平均价格</TableHead>
                  <TableHead>销售数量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.map((data) => (
                  <TableRow key={data.date}>
                    <TableCell>{data.date}</TableCell>
                    <TableCell>¥{data.price.toFixed(2)}</TableCell>
                    <TableCell>{data.sales}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductPriceFluctuationReport
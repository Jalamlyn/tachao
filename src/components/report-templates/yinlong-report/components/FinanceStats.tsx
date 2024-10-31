import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { FinanceStats as FinanceStatsType } from "@/types/yinlong"

interface FinanceStatsProps {
  stats: FinanceStatsType
}

const FinanceStats: React.FC<FinanceStatsProps> = ({ stats }) => {
  const items = [
    { label: "订单总金额", value: stats.totalAmount },
    { label: "已确认金额", value: stats.confirmedAmount },
    { label: "已支付金额", value: stats.paidAmount },
    { label: "待支付金额", value: stats.unpaidAmount },
    { label: "金额差异", value: stats.anomalyAmount, isAnomaly: true },
  ]

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>财务统计</CardTitle>
        <CardDescription>订单金额统计与分析</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {items.map((item, index) => (
            <div key={index} className="p-4 border rounded">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p
                className={`text-xl font-bold ${
                  item.isAnomaly
                    ? item.value > 0
                      ? "text-green-500"
                      : "text-red-500"
                    : ""
                }`}
              >
                {item.value > 0 && item.isAnomaly ? "+" : ""}¥
                {item.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default FinanceStats
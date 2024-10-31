import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@iconify/react"

interface StatisticsCardsProps {
  orderCount: number
  manufacturerCount: number
  anomalyCount: number
  completedCount: number
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  orderCount,
  manufacturerCount,
  anomalyCount,
  completedCount,
}) => {
  const stats = [
    {
      label: "总订单数",
      value: orderCount,
      icon: "mdi:file-document-multiple",
    },
    {
      label: "加工单位数",
      value: manufacturerCount,
      icon: "mdi:factory",
    },
    {
      label: "异常订单数",
      value: anomalyCount,
      icon: "mdi:alert-circle",
    },
    {
      label: "完成订单数",
      value: completedCount,
      icon: "mdi:check-circle",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <Icon icon={stat.icon} className="h-10 w-10 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatisticsCards
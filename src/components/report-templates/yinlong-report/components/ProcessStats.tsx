import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ProcessStats as ProcessStatsType } from "@/types/yinlong"

interface ProcessStatsProps {
  stats: ProcessStatsType
}

const ProcessStats: React.FC<ProcessStatsProps> = ({ stats }) => {
  const stages = {
    "仓库确认": stats.warehouseConfirm,
    "采购确认": stats.purchaseConfirm,
    "财务确认": stats.financeConfirm,
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>流程确认统计</CardTitle>
        <CardDescription>各阶段订单确认情况</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stages).map(([stage, count]) => (
            <div key={stage} className="p-4 border rounded">
              <p className="text-sm text-muted-foreground">{stage}</p>
              <p className="text-xl font-bold">
                {count}/{stats.total}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProcessStats
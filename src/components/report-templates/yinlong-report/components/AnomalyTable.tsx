import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AnomalyItem } from "@/types/yinlong"

interface AnomalyTableProps {
  anomalies: AnomalyItem[]
}

const AnomalyTable: React.FC<AnomalyTableProps> = ({ anomalies }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>异常订单统计</CardTitle>
        <CardDescription>出入库数量不一致的订单</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单编号</TableHead>
              <TableHead>加工单位</TableHead>
              <TableHead>产品名称</TableHead>
              <TableHead>出库数量</TableHead>
              <TableHead>入库数量</TableHead>
              <TableHead>差异</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anomalies.map((anomaly, index) => (
              <TableRow key={index}>
                <TableCell>
                  <a
                    href={`/forms/${anomaly.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {anomaly.orderNumber}
                  </a>
                </TableCell>
                <TableCell>{anomaly.manufacturer}</TableCell>
                <TableCell>{anomaly.productName}</TableCell>
                <TableCell>{anomaly.outboundQuantity}</TableCell>
                <TableCell>{anomaly.inboundQuantity}</TableCell>
                <TableCell
                  className={
                    anomaly.difference > 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {anomaly.difference > 0 ? "+" : ""}
                  {anomaly.difference}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default AnomalyTable
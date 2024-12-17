import { useEffect, useState } from "react"
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { getMetadata } from "@/service/apis/metadata"

const CostRecords = () => {
  const [records, setRecords] = useState([])

  useEffect(() => {
    fetchCostRecords()
  }, [])

  const fetchCostRecords = async () => {
    try {
      // 使用 getMetadata 方法读取费用记录
      const costRecords = await getMetadata(["ai-cost-records"])
      const parsedRecords = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []
      setRecords(parsedRecords)
    } catch (error) {
      console.error("Error fetching cost records:", error)
    }
  }

  return (
    <Card className='w-full'>
      <CardBody>
        <div className='flex items-center gap-2 mb-4'>
          <Icon icon='solar:card-transfer-bold-duotone' className='w-6 h-6 text-primary' />
          <h3 className='text-lg font-medium'>费用明细</h3>
        </div>
        <Table aria-label='费用明细表'>
          <TableHeader>
            <TableColumn>时间</TableColumn>
            <TableColumn>模型</TableColumn>
            <TableColumn>输入Token</TableColumn>
            <TableColumn>输出Token</TableColumn>
            <TableColumn>输入费用(塔币)</TableColumn>
            <TableColumn>输出费用(塔币)</TableColumn>
            <TableColumn>总费用(塔币)</TableColumn>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                <TableCell>{record.model === "ADVANCED" ? "高级模型" : "专家模型"}</TableCell>
                <TableCell>{record.promptTokenCount}</TableCell>
                <TableCell>{record.candidatesTokenCount}</TableCell>
                <TableCell>{record.inputCost.toFixed(4)}</TableCell>
                <TableCell>{record.outputCost.toFixed(4)}</TableCell>
                <TableCell>{record.totalCost.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  )
}

export default CostRecords

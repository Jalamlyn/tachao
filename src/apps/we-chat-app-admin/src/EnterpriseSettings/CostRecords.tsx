import { useEffect, useState } from "react"
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { getMetadata } from "@/service/apis/metadata"

const CostRecords = () => {
  const [records, setRecords] = useState([])
  const [currentPage, setCurrentPage] = useState(1) // 当前页码
  const [recordsPerPage] = useState(10) // 每页显示的记录数

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

  // 计算当前页显示的记录
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord)

  // 计算总页数
  const totalPages = Math.ceil(records.length / recordsPerPage)

  // 分页控件
  const Pagination = () => (
    <div className="flex justify-center items-center gap-2 mt-4">
      <Button
        isDisabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      >
        上一页
      </Button>
      {Array.from({ length: totalPages }, (_, index) => (
        <Button
          key={index + 1}
          isDisabled={currentPage === index + 1}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </Button>
      ))}
      <Button
        isDisabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      >
        下一页
      </Button>
    </div>
  )

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
            {currentRecords.map((record) => (
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
        <Pagination />
      </CardBody>
    </Card>
  )
}

export default CostRecords
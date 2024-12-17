import { useEffect, useState, useMemo } from "react"
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"
import { Pagination, Select, SelectItem } from "@nextui-org/react" // 引入 nextui 的 Pagination 和 Select 组件
import { Icon } from "@iconify/react"
import { getMetadata } from "@/service/apis/metadata"

const CostRecords = () => {
  const [records, setRecords] = useState([])
  const [currentPage, setCurrentPage] = useState(1) // 当前页码
  const [recordsPerPage, setRecordsPerPage] = useState(10) // 每页显示的记录数，默认10

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
  const currentRecords = recordsPerPage === -1 ? records : records.slice(indexOfFirstRecord, indexOfLastRecord)

  // 计算总页数
  const totalPages = recordsPerPage === -1 ? 1 : Math.ceil(records.length / recordsPerPage)

  // 统计功能
  const totalCost = useMemo(() => {
    return records.reduce((sum, record) => sum + record.totalCost, 0).toFixed(4)
  }, [records])

  const currentPageCost = useMemo(() => {
    return currentRecords.reduce((sum, record) => sum + record.totalCost, 0).toFixed(4)
  }, [currentRecords])

  const handleRecordsPerPageChange = (value) => {
    const newRecordsPerPage = value === "all" ? -1 : parseInt(value, 10)
    setRecordsPerPage(newRecordsPerPage)
    setCurrentPage(1) // 重置到第一页
  }

  return (
    <Card className='w-full'>
      <CardBody>
        <div className='flex items-center gap-2 mb-4'>
          <Icon icon='solar:card-transfer-bold-duotone' className='w-6 h-6 text-primary' />
          <h3 className='text-lg font-medium'>费用明细</h3>
        </div>
        {/* 统计信息 */}
        <div className='mb-4'>
          <p className='text-sm text-default-600'>
            总费用: <span className='font-medium text-default-800'>{totalCost} 塔币</span>
          </p>
          <p className='text-sm text-default-600'>
            当前页费用: <span className='font-medium text-default-800'>{currentPageCost} 塔币</span>
          </p>
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
        {/* 分页和每页记录数选择 */}
        <div className='flex justify-between items-center mt-4'>
          <Select
            size='sm'
            value={recordsPerPage === -1 ? "all" : recordsPerPage.toString()}
            onChange={(e) => handleRecordsPerPageChange(e.target.value)}
            className='w-[140px]'
            aria-label='选择每页显示条数'
          >
            <SelectItem value="10">10 条/页</SelectItem>
            <SelectItem value="20">20 条/页</SelectItem>
            <SelectItem value="50">50 条/页</SelectItem>
            <SelectItem value="100">100 条/页</SelectItem>
            <SelectItem value="all">所有记录</SelectItem>
          </Select>
          <Pagination
            total={totalPages}
            initialPage={1}
            page={currentPage}
            onChange={(page) => setCurrentPage(page)}
            showControls
            size='lg'
            isDisabled={recordsPerPage === -1} // 禁用分页控件
          />
        </div>
      </CardBody>
    </Card>
  )
}

export default CostRecords
import { useEffect, useState, useMemo } from "react"
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"
import { Pagination } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { getMetadata } from "@/service/apis/metadata"
import { Select, SelectItem } from "@nextui-org/react"

const CostRecords = ({ onTotalCostChange }) => {
  const [records, setRecords] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchCostRecords()
  }, [])

  const fetchCostRecords = async () => {
    try {
      const costRecords = await getMetadata(["ai-cost-records"])
      const parsedRecords = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []
      setRecords(parsedRecords)
    } catch (error) {
      console.error("Error fetching cost records:", error)
    }
  }

  const indexOfLastRecord = showAll ? records.length : currentPage * recordsPerPage
  const indexOfFirstRecord = showAll ? 0 : (currentPage - 1) * recordsPerPage
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord)

  const totalPages = Math.ceil(records.length / recordsPerPage)

  const totalCost = useMemo(() => {
    const cost = records.reduce((sum, record) => sum + record.totalCost, 0)
    // 当总消费发生变化时，通知父组件
    onTotalCostChange?.(cost)
    return cost.toFixed(4)
  }, [records, onTotalCostChange])

  const currentPageCost = useMemo(() => {
    return currentRecords.reduce((sum, record) => sum + record.totalCost, 0).toFixed(4)
  }, [currentRecords])

  const handlePageSizeChange = (value: string) => {
    if (value === "all") {
      setShowAll(true)
      setCurrentPage(1)
    } else {
      setShowAll(false)
      setRecordsPerPage(Number(value))
      setCurrentPage(1)
    }
  }

  const pageSizeOptions = [
    { value: "10", label: "10 条/页" },
    { value: "20", label: "20 条/页" },
    { value: "50", label: "50 条/页" },
    { value: "100", label: "100 条/页" },
    { value: "all", label: "显示全部" },
  ]

  return (
    <Card className='w-full'>
      <CardBody>
        <div className='flex items-center gap-2 mb-4'>
          <Icon icon='solar:card-transfer-bold-duotone' className='w-6 h-6 text-primary' />
          <h3 className='text-lg font-medium'>费用明细</h3>
        </div>
        <div className='mb-4'>
          <p className='text-sm text-default-600'>
            总费用: <span className='font-medium text-default-800'>{totalCost} 塔币</span>
          </p>
          <p className='text-sm text-default-600'>
            当前显示费用: <span className='font-medium text-default-800'>{currentPageCost} 塔币</span>
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
                <TableCell>{record.model === "ADVANCED" ? "初级模型" : "高级模型"}</TableCell>
                <TableCell>{record.promptTokenCount}</TableCell>
                <TableCell>{record.candidatesTokenCount}</TableCell>
                <TableCell>{record.inputCost?.toFixed(4)}</TableCell>
                <TableCell>{record.outputCost?.toFixed(4)}</TableCell>
                <TableCell>{record.totalCost?.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className='flex justify-between items-center px-4 py-3 bg-default-50 rounded-lg mt-4'>
          <div className='text-small text-default-600 flex items-center gap-1'>
            <Icon icon='mdi:file-document-outline' className='w-4 h-4' />共 {records.length} 条记录
          </div>
          <div className='flex gap-4 items-center'>
            <Select
              size='sm'
              value={showAll ? "all" : recordsPerPage.toString()}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              className='w-[140px]'
              classNames={{
                trigger: "h-unit-8 min-h-unit-8 py-0.5 shadow-sm hover:shadow transition-shadow duration-200",
                value: "text-small",
                listbox: "text-small",
              }}
              aria-label='选择每页显示条数'
            >
              {pageSizeOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className='data-[selected=true]:bg-primary-50 data-[selected=true]:text-primary'
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            {!showAll && (
              <Pagination
                total={Math.ceil(records.length / recordsPerPage)}
                page={currentPage}
                onChange={(page) => setCurrentPage(page)}
                showControls
              />
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default CostRecords
import { useEffect, useState, useMemo, forwardRef, useImperativeHandle } from "react"
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"
import { Pagination } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { getMetadata } from "@/service/apis/metadata"
import { Select, SelectItem } from "@nextui-org/react"
import { Chip } from "@nextui-org/react"
import { Tooltip } from "@nextui-org/react"

const CostRecords = forwardRef(({ onTotalCostChange }, ref) => {
  const [records, setRecords] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10)
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCostRecords()
  }, [])

  useImperativeHandle(ref, () => ({
    refresh: fetchCostRecords,
  }))

  const fetchCostRecords = async () => {
    setIsLoading(true)
    try {
      const costRecords = await getMetadata(["ai-cost-records"])
      const parsedRecords = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []
      setRecords(parsedRecords)
      return true
    } catch (error) {
      console.error("Error fetching cost records:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const indexOfLastRecord = showAll ? records.length : currentPage * recordsPerPage
  const indexOfFirstRecord = showAll ? 0 : (currentPage - 1) * recordsPerPage
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord)

  const totalPages = Math.ceil(records.length / recordsPerPage)

  const totalCost = useMemo(() => {
    const cost = records.reduce((sum, record) => {
      const recordCost = typeof record.totalCost === "number" ? record.totalCost : 0
      return sum + recordCost
    }, 0)
    onTotalCostChange?.(cost)
    return cost.toFixed(4)
  }, [records, onTotalCostChange])

  const currentPageCost = useMemo(() => {
    return currentRecords
      .reduce((sum, record) => {
        const recordCost = typeof record.totalCost === "number" ? record.totalCost : 0
        return sum + recordCost
      }, 0)
      .toFixed(4)
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

  const getRecordTypeChip = (type: string) => {
    const typeConfig = {
      token_usage: {
        label: "Token 消费",
        color: "secondary",
        icon: "solar:chat-square-code-bold-duotone",
      },
      subscription: {
        label: "套餐账号开通",
        color: "primary",
        icon: "solar:shield-star-bold-duotone",
      },
    }

    const config = typeConfig[type] || {
      label: "其他",
      color: "default",
      icon: "solar:card-transfer-bold-duotone",
    }

    return (
      <div className='flex items-center gap-2'>
        <Icon icon={config.icon} className='text-lg' />
        <Chip color={config.color} variant='flat'>
          {config.label}
        </Chip>
      </div>
    )
  }

  const renderCostDetails = (record) => {
    if (record.type === "token_usage" && record.detail?.tokenUsage) {
      const { tokenUsage } = record.detail
      return (
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-default-500'>输入 Token:</span>
            <span>{tokenUsage.promptTokenCount}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-default-500'>输出 Token:</span>
            <span>{tokenUsage.candidatesTokenCount}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-default-500'>输入费用:</span>
            <span>{tokenUsage.inputCost?.toFixed(4)} 塔币</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-default-500'>输出费用:</span>
            <span>{tokenUsage.outputCost?.toFixed(4)} 塔币</span>
          </div>
        </div>
      )
    }

    if (record.type === "subscription" && record.detail?.subscription) {
      const { subscription } = record.detail
      return (
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-default-500'>套餐:</span>
            <span>{subscription.plan}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-default-500'>时长:</span>
            <span>{subscription.duration} 个月</span>
          </div>
        </div>
      )
    }

    return <span className='text-default-400'>-</span>
  }

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
        <Table
          aria-label='费用明细表'
          isHeaderSticky
          classNames={{
            base: "max-h-[600px]",
            table: "min-h-[400px]",
          }}
          isStriped
        >
          <TableHeader>
            <TableColumn>时间</TableColumn>
            <TableColumn>类型</TableColumn>
            <TableColumn>详情</TableColumn>
            <TableColumn>消费用户</TableColumn>
            <TableColumn>费用(塔币)</TableColumn>
          </TableHeader>
          <TableBody
            items={currentRecords}
            isLoading={isLoading}
            loadingContent={
              <div className='w-full h-[400px] flex items-center justify-center'>
                <Icon icon='line-md:loading-twotone-loop' className='w-8 h-8 text-primary' />
              </div>
            }
          >
            {(record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                <TableCell>{getRecordTypeChip(record.type)}</TableCell>
                <TableCell>{renderCostDetails(record)}</TableCell>
                <TableCell>{record.userName}</TableCell>
                <TableCell>
                  <span className='font-medium'>{record.totalCost?.toFixed(4)} 塔币</span>
                </TableCell>
              </TableRow>
            )}
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
})

export default CostRecords

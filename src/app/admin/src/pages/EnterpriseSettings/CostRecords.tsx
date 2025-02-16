import { useEffect, useState, useMemo, forwardRef, useImperativeHandle } from "react"
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"
import { Pagination } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { getMetadata } from "@/service/apis/metadata"
import { Select, SelectItem } from "@nextui-org/react"
import { Chip } from "@nextui-org/react"
import { Tooltip, Input } from "@nextui-org/react"
import { costService } from "@/utils/costService"

const CostRecords = forwardRef(({ onTotalCostChange, searchQuery = "" }, ref) => {
  const [records, setRecords] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(50)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCostRecords()
    fetchCostTotal()
  }, [currentPage])

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      await fetchCostRecords()
      await fetchCostTotal()
      return true
    },
  }))

  const fetchCostTotal = async () => {
    try {
      const costTotal = await costService.getCostTotal()
      setTotalRecords(costTotal.totalRecords)
      setTotalCost(costTotal.totalCost)
      onTotalCostChange?.(costTotal.totalCost)
    } catch (error) {
      console.error("Error fetching cost total:", error)
    }
  }

  const fetchCostRecords = async () => {
    setIsLoading(true)
    try {
      const pageRecords = await costService.getPageRecords(currentPage)
      const filteredRecords = pageRecords.filter(
        (record) => !searchQuery || record.userName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setRecords(filteredRecords)
    } catch (error) {
      console.error("Error fetching cost records:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(totalRecords / recordsPerPage)

  const currentPageCost = useMemo(() => {
    return records
      .reduce((sum, record) => {
        const recordCost = typeof record.totalCost === "number" ? record.totalCost : 0
        return sum + recordCost
      }, 0)
      .toFixed(4)
  }, [records])

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
      pdf_to_markdown: {
        label: "文档转换",
        color: "warning",
        icon: "solar:file-text-bold-duotone",
      }
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
          {record.userInput && (
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-sm text-default-500'>用户输入:</span>
              <Tooltip content={record.userInput}>
                <span className='text-sm truncate max-w-[200px] cursor-help'>{record.userInput}</span>
              </Tooltip>
            </div>
          )}
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
            <span>{tokenUsage.inputCost?.toFixed(4)} 梦想币</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-default-500'>输出费用:</span>
            <span>{tokenUsage.outputCost?.toFixed(4)} 梦想币</span>
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

    if (record.type === "pdf_to_markdown" && record.detail?.pdfConversion) {
      const { pdfConversion } = record.detail
      return (
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-default-500'>文件名:</span>
            <span>{pdfConversion.fileName}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-default-500'>转换页数:</span>
            <span>{pdfConversion.successCount} 页</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-default-500'>单价:</span>
            <span>{pdfConversion.ratePerCount} 梦想币/页</span>
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
            总费用: <span className='font-medium text-default-800'>{totalCost.toFixed(4)} 梦想币</span>
          </p>
          <p className='text-sm text-default-600'>
            当前显示费用: <span className='font-medium text-default-800'>{currentPageCost} 梦想币</span>
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
            <TableColumn>费用(梦想币)</TableColumn>
          </TableHeader>
          <TableBody
            items={records}
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
                  <span className='font-medium'>{record.totalCost?.toFixed(4)} 梦想币</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className='flex justify-between items-center px-4 py-3 bg-default-50 rounded-lg mt-4'>
          <div className='text-small text-default-600 flex items-center gap-1'>
            <Icon icon='mdi:file-document-outline' className='w-4 h-4' />共 {totalRecords} 条记录
          </div>
          <Pagination total={totalPages} page={currentPage} onChange={(page) => setCurrentPage(page)} showControls />
        </div>
      </CardBody>
    </Card>
  )
})

export default CostRecords
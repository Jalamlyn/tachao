import React from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Tooltip,
  Pagination,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { MetadataDetail } from "@/hooks/metadata/types"

interface FormTypeTableProps {
  forms: MetadataDetail[]
  isLoading?: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

export const FormTypeTable: React.FC<FormTypeTableProps> = ({ forms, isLoading, page, pageSize, onPageChange }) => {
  // 计算分页数据
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedForms = forms.slice(start, end)
  const totalPages = Math.ceil(forms.length / pageSize)

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "success"
      case "draft":
        return "warning"
      case "rejected":
        return "danger"
      default:
        return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "已提交"
      case "draft":
        return "草稿"
      case "rejected":
        return "已拒绝"
      default:
        return status
    }
  }

  return (
    <Table
      aria-label='表单列表'
      classNames={{
        wrapper: "min-h-[400px]",
      }}
      bottomContent={
        forms.length > 0 ? (
          <div className='flex w-full justify-center'>
            <Pagination
              isCompact
              showControls
              showShadow
              color='primary'
              page={page}
              total={totalPages}
              onChange={onPageChange}
            />
          </div>
        ) : null
      }
    >
      <TableHeader>
        <TableColumn>标题</TableColumn>
        <TableColumn>订单号</TableColumn>
        <TableColumn>状态</TableColumn>
        <TableColumn>时间</TableColumn>
        <TableColumn>操作</TableColumn>
      </TableHeader>
      <TableBody items={paginatedForms}>
        {(form) => (
          <TableRow key={form.id}>
            <TableCell>
              <Tooltip content={`ID: ${form.id}`}>
                <span>{form.title}</span>
              </Tooltip>
            </TableCell>
            <TableCell>{form.indexFields?.orderNumber}</TableCell>
            <TableCell>
              <Chip color={getStatusColor(form.status)} variant='flat' className='capitalize'>
                {getStatusText(form.status)}
              </Chip>
            </TableCell>
            <TableCell>
              <div className='flex flex-col'>
                <span className='text-tiny text-default-500'>创建: {formatDate(form.indexFields?.createdAt)}</span>
                <span className='text-tiny text-default-400'>更新: {formatDate(form.updatedAt)}</span>
              </div>
            </TableCell>
            <TableCell>
              <Button
                size='sm'
                variant='flat'
                color='primary'
                startContent={<Icon icon='mdi:eye' className='w-4 h-4' />}
                onPress={() => window.open(`/form/${form.id}`, "_blank")}
              >
                查看
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

import React, { useState } from "react"
import { Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { MetadataTable } from "@/components/metadata-table"
import { useFormTypes } from "./hooks/useFormTypes"
import { MetadataDetail } from "@/hooks/metadata/types"
import { Column } from "@/components/metadata-table/types"
import { Tooltip, Chip } from "@nextui-org/react"
import message from "@/components/Message"

interface FormTypeTabsProps {
  forms: MetadataDetail[]
  isLoading?: boolean
}

export const FormTypeTabs: React.FC<FormTypeTabsProps> = ({ forms, isLoading }) => {
  const formTypes = useFormTypes(forms)
  const [selectedType, setSelectedType] = useState<string>("")

  const handleTabChange = (type: string) => {
    setSelectedType(type)
  }

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

  const columns: Column<MetadataDetail>[] = [
    {
      key: "title",
      title: "标题",
      render: (record) => (
        <Tooltip content={`ID: ${record.id}`}>
          <span>{record.title}</span>
        </Tooltip>
      ),
    },
    {
      key: "orderNumber",
      title: "订单号",
      render: (record) => record.indexFields?.orderNumber,
    },
    {
      key: "status",
      title: "状态",
      render: (record) => (
        <Chip color={getStatusColor(record.status)} variant='flat' className='capitalize'>
          {getStatusText(record.status)}
        </Chip>
      ),
    },
    {
      key: "date",
      title: "时间",
      render: (record) => (
        <div className='flex flex-col'>
          <span className='text-tiny text-default-500'>创建: {formatDate(record.indexFields?.createdAt)}</span>
          <span className='text-tiny text-default-400'>更新: {formatDate(record.updatedAt)}</span>
        </div>
      ),
    },
  ]

  return (
    <div className='flex flex-col gap-4'>
      <Tabs
        aria-label='表单类型'
        selectedKey={selectedType}
        onSelectionChange={(key) => handleTabChange(key as string)}
        className='w-full'
      >
        {formTypes.map((type) => (
          <Tab
            key={type.templateId}
            title={
              <div className='flex items-center gap-2'>
                <span>{type.label}</span>
                <span className='text-tiny'>({type.forms.length})</span>
              </div>
            }
          >
            <div className='flex flex-col gap-4'>
              <MetadataTable
                type='form'
                columns={columns}
                toolbar={{
                  showSearch: true,
                  showRefresh: true,
                  searchProps: {
                    placeholder: "搜索表单标题或订单号...",
                    fields: ["title", "indexFields.orderNumber"],
                  },
                }}
                pagination={{
                  defaultPageSize: 10,
                  pageSizeOptions: [10, 20, 50, 100],
                }}
                onError={(error) => message.error(error.message)}
                data={type.forms}
              />
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  )
}
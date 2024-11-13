import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { MetadataTable } from "@/components/metadata-table"
import CreateResourceButton from "./components/CreateResourceButton"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import message from "@/components/Message"
import type { MetadataDetail } from "@/hooks/useMetadata"

interface Resource extends MetadataDetail {
  indexFields: {
    appId: string
    type: string
    size: number
    fileName: string
  }
}

const ResourceManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const appId = import.meta.env.VITE_SHATA_AI_APP_ID

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
    ])
  }, [])

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const columns = [
    {
      key: "title",
      title: "资料名称",
      render: (record: Resource) => (
        <div className='flex items-center gap-2'>
          <Icon icon='mdi:file-excel' className='w-5 h-5 text-success' style={{ opacity: 0.8 }} />
          <div className='flex flex-col'>
            <span className='font-medium text-small'>{record.title}</span>
            <span className='text-tiny text-default-400'>{record.indexFields.fileName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "size",
      title: "大小",
      render: (record: Resource) => formatFileSize(record.indexFields.size),
    },
    {
      key: "date",
      title: "时间",
      render: (record: Resource) => (
        <div className='flex flex-col'>
          <span className='text-tiny text-default-500'>创建: {new Date(record.createdAt).toLocaleString()}</span>
          <span className='text-tiny text-default-400'>更新: {new Date(record.updatedAt).toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "actions",
      title: "操作",
      render: (record: Resource) => (
        <div className='flex gap-2 items-center justify-end'>
          <Button
            isIconOnly
            size='sm'
            variant='light'
            className='text-default-600 hover:text-primary transition-colors'
            onClick={() => navigate(`/we-chat-app/admin/resources/ai/${record.id}`)}
          >
            <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4' />
          </Button>
        </div>
      ),
    },
  ]

  const handleAnalyze = () => {
    navigate("/we-chat-app/admin/forms/analysis")
  }

  const pageActions = (
    <>
      <Button isIconOnly variant='light' onClick={handleAnalyze}>
        <Icon icon='mdi:refresh' className='w-5 h-5' />
      </Button>
      <Button
        onClick={handleAnalyze}
        color='secondary'
        startContent={<Icon icon='solar:chart-2-bold' className='w-4 h-4' />}
      >
        AI 数据分析
      </Button>
      <Button onClick={handleAnalyze} color='primary'>
        <Icon icon='mdi:file-document-plus' className='w-4 h-4 mr-2' />
        创建单据
      </Button>
    </>
  )

  return (
    <PageLayout title='资料管理' titleIcon='mdi:file-document' actions={pageActions}>
      <MetadataTable
        type='resource'
        columns={columns}
        toolbar={{
          showSearch: true,
          showRefresh: true,
          searchProps: {
            placeholder: "搜索资料名称或文件名...",
            fields: ["title", "indexFields.fileName"],
          },
        }}
        defaultActions={{
          showDelete: true
        }}
        onError={(error) => message.error(error.message)}
      />
    </PageLayout>
  )
}

export default ResourceManagement
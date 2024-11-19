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
      { label: "表格管理", href: "/we-chat-app/admin/resources" },
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
      title: "表格名称",
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
  ]

  const pageActions = (
    <>
      <CreateResourceButton appId={appId} isDisabled={false} />
    </>
  )

  return (
    <PageLayout title='表格管理' titleIcon='mdi:file-document' actions={pageActions}>
      <MetadataTable
        type='resource'
        columns={columns}
        toolbar={{
          showSearch: true,
          showRefresh: true,
          searchProps: {
            placeholder: "搜索表格名称或文件名...",
            fields: ["title", "indexFields.fileName"],
          },
        }}
        actions={[
          {
            key: "ai",
            label: "AI 分析",
            icon: "hugeicons:ai-chat-02",
            color: "primary",
            onClick: (record) => {
              navigate(`/we-chat-app/admin/resources/ai/${record.id}`)
            },
          },
        ]}
        onError={(error) => message.error(error.message)}
      />
    </PageLayout>
  )
}

export default ResourceManagement

import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { MetadataTable } from "@/components/metadata-table"
import { Column, Action } from "@/components/metadata-table/types"
import { MetadataDetail } from "@/hooks/useMetadata"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import message from "@/components/Message"
import { Chip, Tooltip } from "@nextui-org/react"

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "单据管理", href: "/we-chat-app/admin/forms" },
    ])
  }, [])

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
      key: "template",
      title: "模板",
      render: (record) => (
        <Tooltip content={`模板ID: ${record.template?.id}`}>
          <div className="flex items-center gap-2">
            <span>{record.template?.title}</span>
            <Chip size="sm" variant="flat" className="capitalize">
              {record.template?.type}
            </Chip>
          </div>
        </Tooltip>
      ),
    },
    {
      key: "status",
      title: "状态",
      render: (record) => (
        <Chip color={getStatusColor(record.status)} variant="flat" className="capitalize">
          {getStatusText(record.status)}
        </Chip>
      ),
    },
    {
      key: "date",
      title: "时间",
      render: (record) => (
        <div className="flex flex-col">
          <span className="text-tiny text-default-500">创建: {formatDate(record.indexFields?.createdAt)}</span>
          <span className="text-tiny text-default-400">更新: {formatDate(record.updatedAt)}</span>
        </div>
      ),
    },
  ]

  const actions: Action<MetadataDetail>[] = [
    {
      key: "view",
      label: "查看",
      icon: "mdi:eye",
      color: "primary",
      onClick: (record) => navigate(`/form/${record.id}`),
    },
  ]

  const handleAnalyze = () => {
    navigate("/we-chat-app/admin/forms/analysis")
  }

  const handleCreateDocument = () => {
    navigate("/form-preview/new")
  }

  const pageActions = (
    <>
      <Button
        onClick={handleAnalyze}
        color="secondary"
        startContent={<Icon icon="solar:chart-2-bold" className="w-4 h-4" />}
      >
        AI 数据分析
      </Button>
      <Button onClick={handleCreateDocument} color="primary">
        <Icon icon="mdi:file-document-plus" className="w-4 h-4 mr-2" />
        创建单据
      </Button>
    </>
  )

  return (
    <PageLayout title="单据管理" titleIcon="mdi:file-document" actions={pageActions}>
      <MetadataTable
        type="form"
        columns={columns}
        actions={actions}
        toolbar={{
          showSearch: true,
          showRefresh: true,
          searchProps: {
            placeholder: "搜索单据标题、模板名称或订单号...",
            fields: ["title", "template.title", "indexFields.orderNumber"],
          },
        }}
        onError={(error) => message.error(error.message)}
      />
    </PageLayout>
  )
}

export default FormManager
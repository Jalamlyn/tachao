import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip, Tooltip, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { MetadataTable } from "@/components/metadata-table"
import { Column, Action } from "@/components/metadata-table/types"
import { MetadataDetail } from "@/hooks/metadata/types"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import message from "@/components/Message"
import { useQueryMetadata, useQueryMetadataDetail } from "@/hooks/metadata/react-query"
import { ErrorBoundary } from "react-error-boundary"

// 错误回退组件
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="flex flex-col items-center justify-center p-4">
    <p className="text-danger mb-4">加载失败: {error.message}</p>
    <Button color="primary" onClick={resetErrorBoundary}>
      重试
    </Button>
  </div>
)

// 模板选择模态框组件
const TemplateSelectModal = ({ 
  isOpen, 
  onClose, 
  templates = [], 
  onSelect 
}: { 
  isOpen: boolean
  onClose: () => void
  templates: MetadataDetail[]
  onSelect: (templateId: string) => void 
}) => {
  const [selectedId, setSelectedId] = React.useState("")

  const handleTemplateClick = (templateId: string) => {
    setSelectedId(templateId)
  }

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId)
    } else {
      message.error("请先选择模板")
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>选择表单模板</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-3 gap-4">
            {templates?.map((template) => (
              <div
                key={template.id}
                data-template-id={template.id}
                className={`template-item p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                  selectedId === template.id ? "border-primary bg-primary/10" : ""
                }`}
                onClick={() => handleTemplateClick(template.id)}
              >
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:file-document-outline" className="w-5 h-5" />
                  <span className="font-medium truncate">{template.title}</span>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onClick={onClose}>
            取消
          </Button>
          <Button color="primary" onClick={handleConfirm}>
            确认
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)

  // 使用 React Query hooks
  const { items: templates } = useQueryMetadata("template", {
    suspense: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  })

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "表单管理", href: "/we-chat-app/admin/forms" },
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
      onClick: (record) => {
        window.open(`/form/${record.id}`, "_blank")
      },
    },
  ]

  const handleCreateDocument = () => {
    setIsCreateModalOpen(true)
  }

  const handleTemplateSelect = async (templateId: string) => {
    try {
      window.open(`/form-preview/${templateId}`, "_blank")
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Failed to load template:", error)
      message.error("加载模板失败")
    }
  }

  const pageActions = (
    <>
      <Button onClick={handleCreateDocument} color="primary">
        <Icon icon="mdi:file-document-plus" className="w-4 h-4 mr-2" />
        创建表单
      </Button>
    </>
  )

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // 重置错误状态
        window.location.reload()
      }}
    >
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <Spinner size="lg" />
          </div>
        }
      >
        <PageLayout title="表单管理" titleIcon="mdi:file-document" actions={pageActions}>
          <MetadataTable
            type="form"
            columns={columns}
            actions={actions}
            toolbar={{
              showSearch: true,
              showRefresh: true,
              searchProps: {
                placeholder: "搜索表单标题、模板名称或订单号...",
                fields: ["title", "template.title", "indexFields.orderNumber"],
              },
            }}
            onError={(error) => message.error(error.message)}
          />

          <TemplateSelectModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            templates={templates}
            onSelect={handleTemplateSelect}
          />
        </PageLayout>
      </React.Suspense>
    </ErrorBoundary>
  )
}

export default FormManager
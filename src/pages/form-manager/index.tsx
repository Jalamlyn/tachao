import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip, Tooltip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { MetadataTable } from "@/components/metadata-table"
import { Column, Action } from "@/components/metadata-table/types"
import { MetadataDetail } from "@/hooks/useMetadata"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import message from "@/components/Message"
import { useMetadata } from "@/hooks/useMetadata"
import { useAsyncButton } from "@/hooks/useAsyncButton"

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const selectedTemplateIdRef = useRef<string>("")
  const { items: templates, load: loadTemplates, getDetail: getTemplateDetail } = useMetadata("template")

  useEffect(() => {
    loadTemplates()
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
          <div className='flex items-center gap-2'>
            <span>{record.template?.title}</span>
            <Chip size='sm' variant='flat' className='capitalize'>
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

  const handleAnalyze = () => {
    navigate("/we-chat-app/admin/forms/analysis")
  }

  const handleCreateDocument = () => {
    setIsCreateModalOpen(true)
  }

  const handleModalClose = () => {
    setIsCreateModalOpen(false)
    selectedTemplateIdRef.current = ""
    // 清除所有选中状态
    const templates = document.querySelectorAll(".template-item")
    templates.forEach((template) => {
      template.classList.remove("border-primary", "bg-primary/10")
    })
  }

  const handleTemplateClick = (templateId: string) => {
    selectedTemplateIdRef.current = templateId

    // 使用 DOM 操作来更新视觉效果
    const templates = document.querySelectorAll(".template-item")
    templates.forEach((template) => {
      template.classList.remove("border-primary", "bg-primary/10")
    })

    const selectedTemplate = document.querySelector(`[data-template-id="${templateId}"]`)
    selectedTemplate?.classList.add("border-primary", "bg-primary/10")
  }

  const { isLoading: isTemplateLoading, handleClick: handleTemplateSelect } = useAsyncButton(
    async () => {
      const templateId = selectedTemplateIdRef.current
      if (!templateId) {
        message.error("请先选择模板")
        return
      }
      try {
        const template = await getTemplateDetail(templateId)
        if (template && template.data.rawConfig) {
          window.open(`/form-preview/${templateId}`, "_blank")
        } else {
          message.error("加载模板失败")
        }
      } catch (error) {
        console.error("Failed to load template:", error)
        throw error
      }
    },
    {
      errorMessage: "加载模板失败",
    }
  )

  const pageActions = (
    <>
      <Button onClick={handleAnalyze}>
        <Icon icon='mingcute:search-ai-line' className='w-4 h-4 mr-2' />
        AI 智能助手
      </Button>
      <Button onClick={handleCreateDocument} color='primary'>
        <Icon icon='mdi:file-document-plus' className='w-4 h-4 mr-2' />
        创建单据
      </Button>
    </>
  )

  return (
    <PageLayout title='单据管理' titleIcon='mdi:file-document' actions={pageActions}>
      <MetadataTable
        type='form'
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

      <Modal isOpen={isCreateModalOpen} onClose={handleModalClose} size='2xl'>
        <ModalContent>
          <ModalHeader>选择单据模板</ModalHeader>
          <ModalBody>
            <div className='grid grid-cols-3 gap-4'>
              {templates?.map((template) => (
                <div
                  key={template.id}
                  data-template-id={template.id}
                  className={`template-item p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors`}
                  onClick={() => handleTemplateClick(template.id)}
                >
                  <div className='flex items-center gap-2'>
                    <Icon icon='mdi:file-document-outline' className='w-5 h-5' />
                    <span className='font-medium truncate'>{template.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onClick={handleModalClose}>
              取消
            </Button>
            <Button color='primary' onClick={handleTemplateSelect} isLoading={isTemplateLoading}>
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default FormManager

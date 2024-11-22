import React from "react"
import { Modal, Button, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { useNavigate } from "react-router-dom"

interface TemplateInfo {
  id: string
  title: string
  formCount: number
}

interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
  // 保留原有属性以保持兼容性
  formCount?: number
  templateId?: string
  // 新增多模板支持
  templates?: TemplateInfo[]
  mode?: 'single' | 'multiple'
}

export function GuideModal({ isOpen, onClose, formCount, templateId, templates, mode = 'single' }: GuideModalProps) {
  const navigate = useNavigate()

  const renderSingleTemplateContent = () => {
    if (formCount === 0) {
      return {
        title: "暂无表单数据",
        content: (
          <div className='space-y-4'>
            <p className='text-default-600'>当前模板下还没有任何表单数据。</p>
            <p className='text-default-600'>建议您:</p>
            <ul className='list-disc pl-6 space-y-2 text-default-600'>
              <li>先创建一些表单收集数据</li>
              <li>有了数据后再使用AI智能助手或创建报表</li>
            </ul>
          </div>
        )
      }
    }

    return {
      title: "表单数量不足",
      content: (
        <div className='space-y-4'>
          <p className='text-default-600'>当前模板下只有 {formCount} 张表单,数据量较少不适合创建报表分析。</p>
          <p className='text-default-600'>建议您:</p>
          <ul className='list-disc pl-6 space-y-2 text-default-600'>
            <li>继续收集更多表单数据(建议至少10张)</li>
            <li>或使用AI智能助手直接分析现有数据</li>
          </ul>
        </div>
      )
    }
  }

  const renderMultiTemplateContent = (templates: TemplateInfo[]) => {
    const emptyTemplates = templates.filter(t => t.formCount === 0)
    const lowDataTemplates = templates.filter(t => t.formCount > 0 && t.formCount < 10)
    
    if (emptyTemplates.length > 0) {
      return {
        title: "部分模板暂无数据",
        content: (
          <div className='space-y-4'>
            <p className='text-default-600'>以下模板还没有任何表单数据:</p>
            <ul className='list-disc pl-6 space-y-2 text-default-600'>
              {emptyTemplates.map(t => (
                <li key={t.id}>
                  {t.title} (模板ID: {t.id})
                </li>
              ))}
            </ul>
            <p className='text-default-600'>建议您:</p>
            <ul className='list-disc pl-6 space-y-2 text-default-600'>
              <li>先为这些模板创建一些表单收集数据</li>
              <li>或者暂时移除这些没有数据的模板</li>
            </ul>
          </div>
        )
      }
    }

    if (lowDataTemplates.length > 0) {
      return {
        title: "部分模板数据量较少",
        content: (
          <div className='space-y-4'>
            <p className='text-default-600'>以下模板的表单数据较少:</p>
            <ul className='list-disc pl-6 space-y-2 text-default-600'>
              {lowDataTemplates.map(t => (
                <li key={t.id}>
                  {t.title}: {t.formCount} 张表单 (建议至少10张)
                </li>
              ))}
            </ul>
            <p className='text-default-600'>建议您:</p>
            <ul className='list-disc pl-6 space-y-2 text-default-600'>
              <li>继续收集更多表单数据</li>
              <li>或使用AI智能助手直接分析现有数据</li>
            </ul>
          </div>
        )
      }
    }

    return null
  }

  const renderSingleTemplateActions = () => {
    if (formCount === 0) {
      return (
        <>
          <Button variant='light' onPress={onClose} className='min-w-[80px]'>
            我知道了
          </Button>
          <Button
            color='primary'
            onPress={() => {
              onClose()
              navigate(`/we-chat-app/admin/forms?templateId=${templateId}`)
            }}
            className='min-w-[120px]'
          >
            去创建表单
          </Button>
        </>
      )
    }

    return (
      <>
        <Button variant='light' onPress={onClose} className='min-w-[80px]'>
          我知道了
        </Button>
        <Button
          color='primary'
          onPress={() => {
            onClose()
            navigate(`/we-chat-app/admin/reports/ai/create/${templateId}`)
          }}
          className='min-w-[120px]'
        >
          继续创建报表
        </Button>
        <Button
          color='secondary'
          onPress={() => {
            onClose()
            navigate(`/we-chat-app/admin/ai-assistant`)
          }}
          className='min-w-[120px]'
        >
          使用AI智能助手分析
        </Button>
      </>
    )
  }

  const renderMultiTemplateActions = (templates: TemplateInfo[]) => {
    const hasEmptyTemplates = templates.some(t => t.formCount === 0)
    
    return (
      <>
        <Button variant='light' onPress={onClose} className='min-w-[80px]'>
          返回修改
        </Button>
        {hasEmptyTemplates ? (
          <Button
            color='primary'
            onPress={() => {
              onClose()
              // 跳转到表单管理,带上空模板的ID
              const emptyIds = templates
                .filter(t => t.formCount === 0)
                .map(t => t.id)
                .join(',')
              navigate(`/we-chat-app/admin/forms?templateIds=${emptyIds}`)
            }}
            className='min-w-[120px]'
          >
            去创建表单
          </Button>
        ) : (
          <>
            <Button
              color='primary'
              onPress={() => {
                onClose()
                // 继续创建报表,使用所有选中的模板
                const templateIds = templates.map(t => t.id).join(',')
                navigate(`/we-chat-app/admin/reports/ai/create?templateIds=${templateIds}`)
              }}
              className='min-w-[120px]'
            >
              继续创建报表
            </Button>
            <Button
              color='secondary'
              onPress={() => {
                onClose()
                navigate('/we-chat-app/admin/ai-assistant')
              }}
              className='min-w-[120px]'
            >
              使用AI智能助手分析
            </Button>
          </>
        )}
      </>
    )
  }

  const content = mode === 'single' ? renderSingleTemplateContent() : (templates ? renderMultiTemplateContent(templates) : null)
  const actions = mode === 'single' ? renderSingleTemplateActions() : (templates ? renderMultiTemplateActions(templates) : null)

  if (!content) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: "max-w-md",
        header: "border-b",
        body: "py-6",
        footer: "border-t",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <h3 className='text-lg font-semibold'>{content.title}</h3>
        </ModalHeader>
        <ModalBody>{content.content}</ModalBody>
        <ModalFooter>{actions}</ModalFooter>
      </ModalContent>
    </Modal>
  )
}
import React from "react"
import { Modal, Button, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { useNavigate } from "react-router-dom"

interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
  formCount: number
  templateId: string
}

export function GuideModal({ isOpen, onClose, formCount, templateId }: GuideModalProps) {
  const navigate = useNavigate()

  const renderContent = () => {
    if (formCount === 0) {
      return (
        <div className="space-y-4">
          <p className="text-default-600">当前模板下还没有任何表单数据。</p>
          <p className="text-default-600">建议您:</p>
          <ul className="list-disc pl-6 space-y-2 text-default-600">
            <li>先创建一些表单收集数据</li>
            <li>有了数据后再使用AI智能助手或创建报表</li>
          </ul>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <p className="text-default-600">当前模板下只有 {formCount} 张表单,数据量较少不适合创建报表分析。</p>
        <p className="text-default-600">建议您:</p>
        <ul className="list-disc pl-6 space-y-2 text-default-600">
          <li>继续收集更多表单数据(建议至少10张)</li>
          <li>或使用AI智能助手直接分析现有数据</li>
        </ul>
      </div>
    )
  }

  const renderActions = () => {
    if (formCount === 0) {
      return (
        <>
          <Button 
            variant="light" 
            onPress={onClose}
            className="min-w-[80px]"
          >
            我知道了
          </Button>
          <Button 
            color="primary"
            onPress={() => {
              onClose()
              navigate(`/we-chat-app/admin/forms?templateId=${templateId}`)
            }}
            className="min-w-[120px]"
          >
            去创建表单
          </Button>
        </>
      )
    }

    return (
      <>
        <Button 
          variant="light" 
          onPress={onClose}
          className="min-w-[80px]"
        >
          我知道了
        </Button>
        <Button 
          color="primary"
          onPress={() => {
            onClose()
            navigate(`/we-chat-app/admin/reports/ai/create/${templateId}`)
          }}
          className="min-w-[120px]"
        >
          去AI助手分析
        </Button>
      </>
    )
  }

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
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">
            {formCount === 0 ? "暂无表单数据" : "表单数量不足"}
          </h3>
        </ModalHeader>
        <ModalBody>
          {renderContent()}
        </ModalBody>
        <ModalFooter>
          {renderActions()}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
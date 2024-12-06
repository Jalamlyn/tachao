import React, { useState, useEffect } from "react"
import { Icon } from "@iconify/react"
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@nextui-org/react"
import { useParams } from "react-router-dom"
import DynamicForm from "@/components/common/DynamicForm"
import type { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import message from "@/components/Message"
import { useMetadata } from "@/hooks/useMetadata"
import { parseFormConfig } from "@/utils/codeParser"
import ShareModal from "./ShareModal"

interface FormPreviewProps {
  config: DynamicFormConfig | null
  previewMode?: boolean
}

const FormPreview: React.FC<FormPreviewProps> = ({ config: propConfig, previewMode = false }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedConfig, setLoadedConfig] = useState<DynamicFormConfig | null>(null)
  const { templateId } = useParams<any>()
  const { getDetail } = useMetadata<{ config: DynamicFormConfig }>("template")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    const loadFormConfig = async () => {
      if (propConfig) {
        setLoadedConfig(propConfig)
        return
      }

      if (templateId) {
        setIsLoading(true)
        setError(null)
        try {
          const result = await getDetail(templateId)
          if (result && result.data.rawConfig) {
            const { config } = await parseFormConfig(result.data.rawConfig)
            if (!config.metadata) {
              config.metadata = {
                title: result.title,
              }
            }
            setLoadedConfig(config)
          } else {
            // setError("未找到表单配置")
          }
        } catch (err) {
          console.error("加载表单配置失败:", err)
          setError("加载表单配置失败")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadFormConfig()
  }, [templateId, propConfig, getDetail])

  const config = propConfig || loadedConfig
  const shareLink = `${window.location.origin}/form-preview/${config?.id || ""}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      message.success("链接已复制")
    } catch (err) {
      message.error("复制失败，请手动复制")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner
          label="加载中..."
          classNames={{
            wrapper: "w-12 h-12",
            label: "text-xl font-medium text-default-600 mt-4",
          }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-danger-50 rounded-xl p-8 text-center">
        <Icon icon="mdi:alert-circle" className="w-16 h-16 text-danger mb-4" />
        <p className="text-xl font-medium text-danger">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative h-full bg-background">
      {config ? (
        <div className="h-full">
          <div className="absolute top-4 right-4 z-10">
            <Button
              color="primary"
              variant="flat"
              onClick={() => setIsShareModalOpen(true)}
              startContent={<Icon icon="mdi:share" className="w-4 h-4" />}
            >
              分享
            </Button>
          </div>
          <div className="max-w-[1200px] mx-auto pt-2 bg-white h-screen">
            <DynamicForm previewMode={previewMode} config={config} templateId={templateId} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full bg-default-50">
          <Icon icon="mdi:form" className="w-20 h-20 text-default-400 mb-6" />
          <p className="text-xl font-medium text-default-600 mb-2">开始创建表单</p>
          <p className="text-default-500">请先生成表单模板来预览</p>
        </div>
      )}

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
          <ModalHeader className="flex flex-col gap-1">分享表单</ModalHeader>
          <ModalBody>
            <div className="flex items-center gap-2 bg-default-50 p-3 rounded-lg">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 p-2 bg-transparent border-none focus:outline-none text-default-700"
              />
              <Button
                color="primary"
                variant="flat"
                onClick={handleCopyLink}
                startContent={<Icon icon="mdi:content-copy" className="w-4 h-4" />}
              >
                复制
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        formId={config?.id || ""}
      />
    </div>
  )
}

export default FormPreview
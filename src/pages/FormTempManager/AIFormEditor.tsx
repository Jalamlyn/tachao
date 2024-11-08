import React, { useCallback, useState, useEffect, useRef } from "react"
import { Card, CardBody, ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Tooltip,
  Chip,
} from "@nextui-org/react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import FormPreview from "./components/FormPreview"
import { useFormState } from "./hooks/useFormState"
import AIFormAgent from "@/service/agents/AIFormAgent"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import MessageCard from "@/components/MessageCard"

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

const AIFormEditor: React.FC = () => {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const isEditMode = Boolean(templateId)
  const { updateBreadcrumbs } = useBreadcrumb()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<any[]>([])

  const { state: formState, setFormConfig, handleError, appendGenerationProcess } = useFormState()

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null)

  const { create: createTemplate, getDetail: getTemplateDetail, update: updateTemplate } = useMetadata("template")

  // ... 保持原有的 useEffect 和其他函数不变 ...

  return (
    <PageLayout
      title={isEditMode ? "AI 更新单据模板" : "AI 保存单据模板"}
      titleIcon='mdi:form-select'
      actions={pageActions}
    >
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100vh-200px)]"
      >
        <ResizablePanel defaultSize={30}>
          <Card className='w-full h-full shadow-sm'>
            <CardBody className='p-4 flex flex-col gap-4 h-full'>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageCard
                      avatar={message.role === "assistant" ? mo2 : user}
                      message={message.content}
                      role={message.role}
                      status='success'
                      className='mb-4'
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />

              <div className='flex items-end gap-2'>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='输入您的需求，例如 编辑 xxx 创建 xxx AI 会根据您的指令来创建和更改表单'
                  className='flex-grow'
                  classNames={{
                    input: "py-2 text-medium",
                    inputWrapper: "bg-default-100",
                  }}
                  minRows={1}
                  maxRows={4}
                  endContent={
                    <div className='flex items-center gap-2 pr-2'>
                      <Tooltip content='发送指令' placement='top'>
                        <Button
                          isIconOnly
                          className={!input || isLoading ? "" : "bg-primary"}
                          color={!input || isLoading ? "default" : "primary"}
                          isDisabled={!input || isLoading}
                          radius='full'
                          variant={!input || isLoading ? "flat" : "solid"}
                          onClick={handleSendMessage}
                          isLoading={isLoading}
                        >
                          {isLoading ? (
                            <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
                          ) : (
                            <Icon
                              className={!input ? "text-default-500" : "text-white"}
                              icon='solar:arrow-up-linear'
                              width={20}
                            />
                          )}
                        </Button>
                      </Tooltip>
                    </div>
                  }
                />
              </div>
            </CardBody>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <Card className='w-full h-full shadow-lg overflow-auto'>
            <CardBody className='p-4'>
              <AnimatePresence mode='wait'>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  {formState.formConfig ? (
                    <FormPreview config={formState.formConfig} />
                  ) : (
                    <div className='text-center py-12 text-gray-500'>
                      <Icon icon='mdi:form' className='w-12 h-12 mx-auto mb-4' />
                      <p>请输入您的需求,AI将为您生成表单</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardBody>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* 保持原有的 Modal 组件不变 */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} size='lg' placement='center'>
        {/* ... Modal 内容保持不变 ... */}
      </Modal>
    </PageLayout>
  )
}

export default AIFormEditor
import React, { useEffect } from "react"
import { Icon } from "@iconify/react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Tooltip } from "@nextui-org/react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import MessageList from "./components/MessageList"
import PrintPreview from "./components/PrintPreview"
import { useAIFormEditor } from "./hooks/useAIFormEditor"

const AIFormEditor: React.FC = () => {
  const { updateBreadcrumbs } = useBreadcrumb()
  const {
    isEditMode,
    input,
    setInput,
    messages,
    formState,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    isSaving,
    isLoading,
    handleSaveTemplate,
    handleSendMessage,
    handleCreateDocument,
    handleGoToTemplates,
  } = useAIFormEditor()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "单据模板管理", href: "/we-chat-app/admin/documents" },
      {
        label: isEditMode ? "编辑单据模板" : "创建单据模板",
        href: isEditMode ? `/we-chat-app/admin/documents/edit/${templateId}` : "/we-chat-app/admin/documents/create",
      },
    ])
  }, [isEditMode])

  const pageActions = (
    <Button
      color='primary'
      onClick={handleSaveTemplate}
      isDisabled={!formState.formConfig || isSaving}
      isLoading={isSaving}
      startContent={<Icon icon='mdi:content-save' className='w-4 h-4 mr-2' />}
    >
      {isEditMode ? "更新单据模板" : "保存单据模板"}
    </Button>
  )

  return (
    <PageLayout
      title={isEditMode ? "AI 更新单据模板" : "AI 保存单据模板"}
      titleIcon='mdi:form-select'
      actions={pageActions}
    >
      <div className='h-[calc(100vh-140px)] overflow-hidden'>
        <ResizablePanelGroup direction='horizontal' className='h-full'>
          <ResizablePanel defaultSize={30}>
            <div className='h-full flex flex-col'>
              <MessageList messages={messages} />
              <div className='flex items-end gap-2 p-4 bg-white'>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} className='bg-slate-100'>
            <div className='h-full overflow-auto'>
              <PrintPreview formConfig={formState.formConfig} rawConfig={formState.rawConfig} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} size='lg' placement='center'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:check-circle' className='w-6 h-6 text-success' />
              <span>模板{isEditMode ? "更新" : "保存"}成功</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <p className='text-gray-600'>恭喜！您的单据模板已经{isEditMode ? "更新" : "保存"}成功。现在您可以：</p>
              <div className='flex flex-col gap-2'>
                <div className='p-4 border rounded-lg bg-gray-50'>
                  <h3 className='font-medium mb-2'>创建新单据</h3>
                  <p className='text-sm text-gray-500 mb-4'>使用这个模板立即创建一个新的单据，开始记录您的业务数据。</p>
                  <Button
                    color='primary'
                    onClick={handleCreateDocument}
                    startContent={<Icon icon='mdi:file-document-plus' className='w-4 h-4' />}
                  >
                    创建单据
                  </Button>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h3 className='font-medium mb-2'>返回模板管理</h3>
                  <p className='text-sm text-gray-500 mb-4'>返回模板列表查看或管理您的所有单据模板。</p>
                  <Button
                    variant='bordered'
                    onClick={handleGoToTemplates}
                    startContent={<Icon icon='mdi:format-list-bulleted' className='w-4 h-4' />}
                  >
                    查看所有模板
                  </Button>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => setIsSuccessModalOpen(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default AIFormEditor
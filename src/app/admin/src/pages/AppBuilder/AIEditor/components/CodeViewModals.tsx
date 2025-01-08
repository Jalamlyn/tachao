import React, { useRef } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  ScrollShadow,
  Chip,
  Divider,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../../store/appCodeStore"
import message from "@/components/Message"

export const CodeViewModals: React.FC = observer(() => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".md")) {
      message.error("请上传 Markdown 文件")
      return
    }

    try {
      const content = await file.text()
      appCodeStore.viewState.importContent = content
    } catch (error) {
      console.error("Error reading file:", error)
      message.error("读取文件失败")
    }
  }

  const handleImport = async () => {
    if (!appCodeStore.viewState.importContent.trim()) {
      message.error("请输入或上传要导入的代码")
      return
    }

    appCodeStore.viewState.pendingImportContent = appCodeStore.viewState.importContent
    appCodeStore.viewState.showConfirmModal = true
  }

  const handleConfirmImport = async () => {
    appCodeStore.viewState.isImporting = true
    try {
      const result = await appCodeStore.importFromMarkdown(appCodeStore.viewState.pendingImportContent)
      if (result.success) {
        message.success("代码导入成功")
        appCodeStore.viewState.showImportModal = false
        appCodeStore.viewState.showConfirmModal = false
        appCodeStore.handleCodeSelect("app_entry")
      } else {
        message.error("导入失败: " + (result.errors || []).join(", "))
      }
    } catch (error) {
      console.error("Error importing code:", error)
      message.error("导入失败: " + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      appCodeStore.viewState.isImporting = false
      appCodeStore.viewState.importContent = ""
      appCodeStore.viewState.pendingImportContent = ""
    }
  }

  const handleDeleteSelected = async () => {
    if (!appCodeStore?.viewState?.selectedModules?.length) return

    try {
      await appCodeStore.deleteModules(appCodeStore.viewState.selectedModules)
      message.success("模块删除成功")
      appCodeStore.viewState.selectedModules = []
      appCodeStore.viewState.showDeleteConfirm = false
    } catch (error) {
      message.error("删除失败: " + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  return (
    <>
      <input type='file' ref={fileInputRef} className='hidden' accept='.md' onChange={handleFileUpload} />

      {/* 导入模态框 */}
      <Modal
        isOpen={appCodeStore.viewState.showImportModal}
        onClose={() => {
          appCodeStore.viewState.showImportModal = false
          appCodeStore.viewState.importContent = ""
        }}
        size='2xl'
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>导入代码</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <div className='flex justify-center'>
                <Button
                  color='primary'
                  variant='flat'
                  startContent={<Icon icon='mdi:file-upload' className='w-4 h-4' />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  上传 Markdown 文件
                </Button>
              </div>
              <div className='text-center text-small text-default-500'>或者</div>
              <Textarea
                label='粘贴 Markdown 内容'
                placeholder='在此粘贴要导入的 Markdown 内容...'
                value={appCodeStore.viewState.importContent}
                onChange={(e) => (appCodeStore.viewState.importContent = e.target.value)}
                minRows={10}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='flat'
              onPress={() => {
                appCodeStore.viewState.showImportModal = false
                appCodeStore.viewState.importContent = ""
              }}
            >
              取消
            </Button>
            <Button color='primary' onPress={handleImport} isLoading={appCodeStore.viewState.isImporting}>
              导入
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 确认导入模态框 */}
      <Modal
        isOpen={appCodeStore.viewState.showConfirmModal}
        onClose={() => (appCodeStore.viewState.showConfirmModal = false)}
        size='sm'
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认导入</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-2'>
              <p className='text-danger'>警告：导入将会覆盖当前所有代码！</p>
              <p className='text-default-500'>此操作不可撤销，是否确认继续？</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onPress={() => (appCodeStore.viewState.showConfirmModal = false)}>
              取消
            </Button>
            <Button color='danger' onPress={handleConfirmImport} isLoading={appCodeStore.viewState.isImporting}>
              确认覆盖
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 版本信息模态框 */}
      <Modal
        isOpen={appCodeStore.viewState.showVersionInfo}
        onClose={() => (appCodeStore.viewState.showVersionInfo = false)}
        size='lg'
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>版本信息</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-small font-semibold'>当前版本</p>
                  <p className='text-tiny text-default-500'>
                    {appCodeStore.currentVersion?.timestamp
                      ? new Date(appCodeStore.currentVersion.timestamp).toLocaleString()
                      : "无"}
                  </p>
                </div>
                <Chip color={appCodeStore.isViewingHistory ? "warning" : "success"} variant='flat'>
                  {appCodeStore.isViewingHistory ? "历史版本" : "最新版本"}
                </Chip>
              </div>
              <Divider />
              <div>
                <p className='text-small font-semibold mb-2'>版本历史</p>
                <ScrollShadow className='h-[300px]'>
                  <div className='space-y-2'>
                    {appCodeStore.versions.map((version, index) => (
                      <div
                        key={version.timestamp}
                        className={`p-3 rounded-lg transition-colors ${
                          index === appCodeStore.currentIndex
                            ? "bg-primary text-white"
                            : "bg-default-100 hover:bg-default-200"
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-small'>版本 {index + 1}</p>
                            <p className='text-tiny opacity-80'>{new Date(version.timestamp).toLocaleString()}</p>
                          </div>
                          {index === appCodeStore.currentIndex && <Icon icon='mdi:check-circle' className='w-5 h-5' />}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollShadow>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onPress={() => (appCodeStore.viewState.showVersionInfo = false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        isOpen={appCodeStore.viewState.showDeleteConfirm}
        onClose={() => (appCodeStore.viewState.showDeleteConfirm = false)}
        size='sm'
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-2'>
              <p className='text-danger'>
                警告：此操作将删除选中的 {appCodeStore?.viewState?.selectedModules?.length} 个模块！
              </p>
              <p className='text-default-500'>删除后可以通过版本回退恢复，是否确认继续？</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onPress={() => (appCodeStore.viewState.showDeleteConfirm = false)}>
              取消
            </Button>
            <Button color='danger' onPress={handleDeleteSelected}>
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
})

export default CodeViewModals

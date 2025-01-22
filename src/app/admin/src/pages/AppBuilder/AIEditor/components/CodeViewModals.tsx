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

  const handleExportAll = () => {
    try {
      appCodeStore.downloadMarkdown()
      message.success("代码导出成功")
      appCodeStore.viewState.showExportModal = false
    } catch (error) {
      console.error("Error exporting code:", error)
      message.error("代码导出失败")
    }
  }

  const handleExportSelected = () => {
    try {
      appCodeStore.downloadMarkdown(appCodeStore.viewState.selectedModules)
      message.success("选中模块导出成功")
      appCodeStore.viewState.showExportModal = false
    } catch (error) {
      console.error("Error exporting selected code:", error)
      message.error("导出失败")
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

      {/* 导出选择模态框 */}
      <Modal
        isOpen={appCodeStore.viewState.showExportModal}
        onClose={() => (appCodeStore.viewState.showExportModal = false)}
        size='lg'
        classNames={{
          base: "bg-gradient-to-b from-white to-default-50",
          header: "border-b-1 border-default-100",
          body: "py-6",
          closeButton: "hover:bg-default-100",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <div className='p-2 rounded-lg bg-primary/10'>
                <Icon icon='solar:export-bold' className='w-5 h-5 text-primary' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>选择导出范围</h3>
                <p className='text-small text-default-500'>请选择要导出的模块范围</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4 px-2'>
              <div className='grid grid-cols-1 gap-4'>
                {/* 导出全部选项 */}
                <button
                  onClick={handleExportAll}
                  className='group relative flex items-center gap-4 p-4 rounded-xl border-2 border-default-200 hover:border-primary transition-colors duration-200'
                >
                  <div className='flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors'>
                    <Icon icon='solar:documents-minimalistic-bold' className='w-6 h-6' />
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-medium text-foreground'>导出全部模块</h4>
                    <p className='text-small text-default-500'>导出应用中的所有模块代码，包括入口文件</p>
                  </div>
                  <Icon
                    icon='solar:alt-arrow-right-bold'
                    className='w-5 h-5 text-default-400 group-hover:text-primary transition-colors'
                  />
                </button>

                {/* 导出选中选项 */}
                <button
                  onClick={handleExportSelected}
                  className='group relative flex items-center gap-4 p-4 rounded-xl border-2 border-default-200 hover:border-primary transition-colors duration-200'
                >
                  <div className='flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors'>
                    <Icon icon='solar:checklist-minimalistic-bold' className='w-6 h-6' />
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-medium text-foreground'>
                      导出选中的 {appCodeStore?.viewState?.selectedModules?.length} 个模块
                    </h4>
                    <p className='text-small text-default-500'>仅导出已选中的特定模块代码</p>
                    {appCodeStore?.viewState?.selectedModules?.length > 0 && (
                      <div className='mt-2 flex flex-wrap gap-1'>
                        {appCodeStore.getSelectedModulesInfo().map((module) => (
                          <Chip
                            key={module.id}
                            size='sm'
                            variant='flat'
                            color='primary'
                            classNames={{
                              base: "bg-primary/10 text-primary",
                            }}
                          >
                            {module.title || module.name}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>
                  <Icon
                    icon='solar:alt-arrow-right-bold'
                    className='w-5 h-5 text-default-400 group-hover:text-primary transition-colors'
                  />
                </button>
              </div>

              <div className='flex items-center gap-2 p-2 rounded-lg bg-default-100'>
                <Icon icon='solar:info-circle-bold' className='w-4 h-4 text-default-400' />
                <span className='text-small text-default-500'>
                  导出的代码将以 Markdown 格式保存，可用于后续导入或分享
                </span>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

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

import { Icon } from "@iconify/react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"

export const renderSaveModal = (
  isSuccessModalOpen,
  setIsSuccessModalOpen,
  isEditMode,
  handleCreateDocument,
  handleGoToTemplates
) => {
  return (
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
            <p className='text-gray-600'>恭喜！您的表单模板已经{isEditMode ? "更新" : "保存"}成功。现在您可以：</p>
            <div className='flex flex-col gap-2'>
              <div className='p-4 border rounded-lg bg-gray-50'>
                <h3 className='font-medium mb-2'>创建新表单</h3>
                <p className='text-sm text-gray-500 mb-4'>使用这个模板立即创建一个新的表单，开始记录您的业务数据。</p>
                <Button
                  color='primary'
                  onClick={handleCreateDocument}
                  startContent={<Icon icon='mdi:file-document-plus' className='w-4 h-4' />}
                >
                  创建表单
                </Button>
              </div>
              <div className='p-4 border rounded-lg'>
                <h3 className='font-medium mb-2'>返回模板管理</h3>
                <p className='text-sm text-gray-500 mb-4'>返回模板列表查看或管理您的所有表单模板。</p>
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
  )
}

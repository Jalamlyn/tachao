import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"

export const renderTitleModal = (isTitleModalOpen, handleTitleCancel, newTitle, handleTitleConfirm, setNewTitle) => {
  return (
    <Modal isOpen={isTitleModalOpen} onClose={handleTitleCancel} size='sm'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>输入表单模板标题</ModalHeader>
        <ModalBody>
          <Input
            autoFocus
            label='标题'
            placeholder='请输入表单模板标题'
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value)
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && newTitle.trim()) {
                handleTitleConfirm()
              }
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color='danger' variant='light' onPress={handleTitleCancel}>
            取消
          </Button>
          <Button color='primary' onPress={handleTitleConfirm} isDisabled={!newTitle.trim()}>
            确认
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

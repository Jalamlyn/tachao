import { useState } from "react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"

// 新增: 版本管理相关组件
export const SaveVersionModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      message.error("请输入版本名称")
      return
    }

    try {
      setIsSaving(true)
      await onSave(name, description)
      onClose()
      setName("")
      setDescription("")
    } catch (error) {
      message.error("保存版本失败: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>保存版本</ModalHeader>
        <ModalBody>
          <div className='space-y-4'>
            <Input
              label='版本名称'
              placeholder='输入版本名称...'
              value={name}
              onChange={(e) => setName(e.target.value)}
              isRequired
              isDisabled={isSaving}
            />
            <Textarea
              label='版本说明'
              placeholder='输入版本说明...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={3}
              isDisabled={isSaving}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='flat' onPress={onClose} isDisabled={isSaving}>
            取消
          </Button>
          <Button color='primary' onPress={handleSave} isLoading={isSaving} isDisabled={!name.trim() || isSaving}>
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
export const VersionListModal = ({ isOpen, onClose, versions, onPublish, onDelete }) => {
  const [versionToDelete, setVersionToDelete] = useState(null)

  const handleDelete = async (version) => {
    try {
      await onDelete(version)
      setVersionToDelete(null)
    } catch (error) {
      message.error("删除失败: " + error.message)
    }
  }

  return (
    <Modal scrollBehavior='inside' isOpen={isOpen} onClose={onClose} size='2xl'>
      <ModalContent>
        <ModalHeader>版本列表</ModalHeader>
        <ModalBody>
          <div className='space-y-4'>
            {versions.map((version) => (
              <div key={version.id} className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <h3 className='font-medium'>{version.name}</h3>
                  <p className='text-small text-default-500'>{version.description}</p>
                  <div className='flex items-center gap-2 mt-1 text-tiny text-default-400'>
                    <span>创建于 {new Date(version.createdAt).toLocaleString()}</span>
                    <span>·</span>
                    <span>创建者: {version.createdBy.name}</span>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    color='primary'
                    variant='flat'
                    onPress={() => onPublish(version)}
                    startContent={<Icon icon='mdi:rocket-launch' className='w-4 h-4' />}
                  >
                    发布此版本
                  </Button>
                  <Button
                    color='danger'
                    variant='flat'
                    onPress={() => setVersionToDelete(version)}
                    startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='flat' onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* 删除确认对话框 */}
      <Modal isOpen={!!versionToDelete} onClose={() => setVersionToDelete(null)}>
        <ModalContent>
          <ModalHeader>确认删除</ModalHeader>
          <ModalBody>
            <p>确定要删除版本 "{versionToDelete?.name}" 吗？此操作不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onPress={() => setVersionToDelete(null)}>
              取消
            </Button>
            <Button color='danger' onPress={() => handleDelete(versionToDelete)}>
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  )
}

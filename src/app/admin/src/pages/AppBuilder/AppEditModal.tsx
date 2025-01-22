import { useEffect, useState } from "react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, ButtonGroup } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { appCodeStore } from "./store/appCodeStore"

// 新增: 版本管理相关组件
export const SaveVersionModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const changes = appCodeStore.getChangeMessages()
      const defaultDescription = changes
        .map((msg) => `${msg.type}(${msg.scope}): ${msg.subject}\n${msg.details.map((d) => `- ${d}`).join("\n")}`)
        .join("\n\n")
      setDescription(defaultDescription)
    }
  }, [isOpen])
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

export const VersionListModal = ({ isOpen, onClose, versions, onPublish, onDelete, onPull }) => {
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
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-lg font-medium'>{version.name}</h3>
                  </div>

                  <div className='space-y-1 text-sm text-default-600'>
                    {version.description.split("\n").map((line, i) => {
                      if (line.includes(":")) {
                        const [type, content] = line.split(":")
                        return (
                          <div key={i} className='flex gap-2'>
                            <span className='font-medium text-primary-600'>{type}:</span>
                            <span>{content}</span>
                          </div>
                        )
                      }
                      return (
                        <div key={i} className='pl-4'>
                          - {line}
                        </div>
                      )
                    })}
                  </div>

                  <div className='flex items-center gap-3 text-tiny text-default-400'>
                    <span className='flex items-center gap-1'>
                      <Icon icon='mdi:clock-outline' className='w-4 h-4' />
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Icon icon='mdi:account' className='w-4 h-4' />
                      {version.createdBy.name}
                    </span>
                  </div>
                </div>
                <ButtonGroup variant="flat">
                  {/* 拉取代码按钮 */}
                  <Button
                    color="secondary"
                    onPress={() => onPull(version)}
                    startContent={<Icon icon="solar:download-minimalistic-bold" className="w-4 h-4" />}
                    className="min-w-[100px]"
                  >
                    拉取代码
                  </Button>
                  
                  {/* 发布版本按钮 */}
                  <Button
                    color="primary"
                    onPress={() => onPublish(version)}
                    startContent={<Icon icon="mdi:rocket-launch" className="w-4 h-4" />}
                    className="min-w-[100px]"
                  >
                    发布此版本
                  </Button>
                  
                  {/* 删除按钮 */}
                  <Button
                    color="danger"
                    onPress={() => setVersionToDelete(version)}
                    startContent={<Icon icon="mdi:delete" className="w-4 h-4" />}
                    className="min-w-[80px]"
                  >
                    删除
                  </Button>
                </ButtonGroup>
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
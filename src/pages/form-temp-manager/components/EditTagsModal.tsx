import React, { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useTagManagement } from "@/hooks/useTagManagement"
import { Template } from "./TemplateGallery"
export const EditTagsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  template: Template | null
  tagsIndex: any
  onUpdateTags: (templateId: string, tagIds: string[]) => Promise<void>
}> = ({ isOpen, onClose, template, tagsIndex, onUpdateTags }) => {
  const { getItemTags } = useTagManagement("template")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  React.useEffect(() => {
    if (template && tagsIndex) {
      const currentTags = getItemTags(template.id)
      setSelectedTags(currentTags.map((tag) => tag.id))
    }
  }, [template, tagsIndex, getItemTags])

  const handleConfirm = async () => {
    if (!template) return
    setIsSubmitting(true)
    try {
      await onUpdateTags(template.id, selectedTags)
      onClose()
    } catch (error) {
      console.error("Error updating tags:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:tag-multiple' className='w-6 h-6' />
            <span>编辑标签 - {template?.title}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <ScrollShadow className='max-h-[400px]'>
            <div className='space-y-4 p-4'>
              {tagsIndex?.tags
                .filter((tag: any) => tag.type === "template")
                .map((tag: any) => (
                  <div key={tag.id} className='flex items-center gap-3'>
                    <Chip
                      startContent={selectedTags.includes(tag.id) && <Icon icon='mdi:tag' className='w-3 h-3 ml-2' />}
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                        )
                      }}
                      className={`cursor-pointer transition-transform hover:scale-105 bg-${tag.color}-500 text-white`}
                    >
                      {tag.name}
                    </Chip>
                  </div>
                ))}
            </div>
          </ScrollShadow>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' variant='light' onPress={onClose}>
            取消
          </Button>
          <Button color='primary' onPress={handleConfirm} isLoading={isSubmitting}>
            确认
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

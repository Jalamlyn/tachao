import React, { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { TagsIndex } from "@/types/tag"

interface Item {
  id: string
  title: string
  [key: string]: any
}

export interface EditTagsModalProps {
  isOpen: boolean
  onClose: () => void
  item: Item | null
  type: "template" | "report" | string
  tagsIndex: TagsIndex | null
  onUpdateTags: (itemId: string, tagIds: string[]) => Promise<void>
}

export const EditTagsModal: React.FC<EditTagsModalProps> = ({
  isOpen,
  onClose,
  item,
  type,
  tagsIndex,
  onUpdateTags,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 当模态框打开时，初始化已选标签
  React.useEffect(() => {
    if (item && tagsIndex) {
      const currentTags = tagsIndex.relations[type]?.byItem[item.id] || []
      setSelectedTags(currentTags)
    }
  }, [item, tagsIndex, type])

  const handleConfirm = async () => {
    if (!item) return
    setIsSubmitting(true)
    try {
      await onUpdateTags(item.id, selectedTags)
      onClose()
    } catch (error) {
      console.error("Error updating tags:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTagColor = (tagId: string): string => {
    const tag = tagsIndex?.tags.find((t) => t.id === tagId)
    return tag?.color || "default"
  }

  const getTagName = (tagId: string): string => {
    const tag = tagsIndex?.tags.find((t) => t.id === tagId)
    return tag?.name || "未知标签"
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:tag-multiple' className='w-6 h-6' />
            <span>编辑标签 - {item?.title}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <ScrollShadow className='max-h-[400px]'>
            <div className='space-y-4 p-4'>
              {tagsIndex?.tags
                .filter((tag) => tag.type === type)
                .map((tag) => (
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

              {(!tagsIndex?.tags.length || !tagsIndex?.tags.filter((tag) => tag.type === type).length) && (
                <div className='flex flex-col items-center justify-center p-8 text-default-500'>
                  <Icon icon='mdi:tag-off' className='w-12 h-12 mb-4 text-default-300' />
                  <p>暂无可用标签</p>
                </div>
              )}
            </div>
          </ScrollShadow>

          {selectedTags.length > 0 && (
            <div className='mt-4 p-4 bg-default-50 rounded-lg'>
              <p className='text-sm text-default-600 mb-2'>已选标签：</p>
              <div className='flex flex-wrap gap-2'>
                {selectedTags.map((tagId) => (
                  <Chip
                    key={tagId}
                    onClose={() => setSelectedTags((prev) => prev.filter((id) => id !== tagId))}
                    variant='flat'
                    color={getTagColor(tagId) as any}
                  >
                    {getTagName(tagId)}
                  </Chip>
                ))}
              </div>
            </div>
          )}
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

export default EditTagsModal
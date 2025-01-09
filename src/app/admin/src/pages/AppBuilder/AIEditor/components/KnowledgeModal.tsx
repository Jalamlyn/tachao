import React, { useState, useMemo } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  useDisclosure,
  Tooltip,
  Chip,
  Divider,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import { knowledgeStore } from "./KnowledgeStore"
import message from "@/components/Message"

interface KnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = observer(({ isOpen, onClose }) => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  // 使用计算值，MobX 会自动追踪依赖
  const filteredKnowledge = useMemo(() => {
    if (!searchQuery.trim()) {
      return knowledgeStore.knowledgeList
    }
    return knowledgeStore.searchKnowledge(searchQuery)
  }, [searchQuery])

  const handleAddKnowledge = () => {
    if (!title.trim() || !content.trim()) {
      message.error("标题和内容不能为空")
      return
    }

    try {
      if (editingId) {
        knowledgeStore.updateKnowledge(editingId, { title, content })
        message.success("知识更新成功")
      } else {
        const newId = knowledgeStore.addKnowledge(null, title, content)
        message.success("知识添加成功")
      }
      resetForm()
    } catch (error) {
      message.error("操作失败：" + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const handleEdit = (id: string) => {
    const item = knowledgeStore.knowledge[id]
    if (item) {
      setEditingId(id)
      setTitle(item.title)
      setContent(item.content)
    }
  }

  const handleDelete = (id: string) => {
    try {
      knowledgeStore.removeKnowledge(id)
      message.success("知识已删除")
      if (editingId === id) {
        resetForm()
      }
    } catch (error) {
      message.error("删除失败：" + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setTitle("")
    setContent("")
  }

  const columns = [
    { name: "ID", uid: "id" },
    { name: "标题", uid: "title" },
    { name: "内容预览", uid: "content" },
    { name: "更新时间", uid: "updatedAt" },
    { name: "操作", uid: "actions" },
  ]

  const renderCell = (item: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "id":
        return (
          <div className='flex items-center gap-2'>
            <Icon icon='solar:document-text-linear' className='text-default-400' />
            <Tooltip content="点击复制ID">
              <span 
                className='text-sm cursor-pointer hover:text-primary'
                onClick={() => {
                  navigator.clipboard.writeText(item.id)
                  message.success("ID已复制到剪贴板")
                }}
              >
                {item.id}
              </span>
            </Tooltip>
          </div>
        )
      case "title":
        return <div className='font-medium'>{item.title}</div>
      case "content":
        return <div className='text-sm text-default-500 max-w-[300px] truncate'>{item.content}</div>
      case "updatedAt":
        return <div className='text-sm text-default-400'>{new Date(item.updatedAt).toLocaleString()}</div>
      case "actions":
        return (
          <div className='flex items-center gap-2'>
            <Tooltip content='编辑'>
              <Button isIconOnly size='sm' variant='light' onPress={() => handleEdit(item.id)}>
                <Icon icon='solar:pen-linear' className='text-default-400' />
              </Button>
            </Tooltip>
            <Tooltip content='删除' color='danger'>
              <Button isIconOnly size='sm' variant='light' color='danger' onPress={() => handleDelete(item.id)}>
                <Icon icon='solar:trash-bin-trash-linear' />
              </Button>
            </Tooltip>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Modal
      scrollBehavior='inside'
      isOpen={isOpen}
      onClose={() => {
        resetForm()
        onClose()
      }}
      size='3xl'
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='solar:book-linear' className='w-6 h-6 text-primary' />
            <span>知识管理</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='space-y-4'>
            <Input 
              label='标题' 
              placeholder='输入标题...' 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
            <Textarea
              label='知识内容'
              placeholder='输入知识内容...'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minRows={3}
            />
            <div className='flex justify-end gap-2'>
              {editingId && (
                <Button
                  color='danger'
                  variant='light'
                  onPress={resetForm}
                  startContent={<Icon icon='solar:close-circle-linear' />}
                >
                  取消编辑
                </Button>
              )}
              <Button
                color='primary'
                onPress={handleAddKnowledge}
                startContent={<Icon icon={editingId ? "solar:pen-linear" : "solar:add-circle-linear"} />}
              >
                {editingId ? "更新知识" : "添加知识"}
              </Button>
            </div>

            <Divider />

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-lg font-medium'>知识列表</span>
                <Input
                  size='sm'
                  placeholder='搜索知识...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<Icon icon='solar:magnifer-linear' className='text-default-400' />}
                  className='w-64'
                />
              </div>

              <Table aria-label='知识列表'>
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={filteredKnowledge}>
                  {(item) => (
                    <TableRow key={item.id}>
                      {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            variant='light'
            onPress={() => {
              resetForm()
              onClose()
            }}
          >
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

export default KnowledgeModal
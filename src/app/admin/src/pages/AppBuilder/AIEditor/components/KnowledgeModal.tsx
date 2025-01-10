import React, { useState } from "react"
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
  Tooltip,
  Divider,
  Switch,
  Progress,
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

  const knowledgeList = searchQuery.trim() 
    ? knowledgeStore.searchKnowledge(searchQuery)
    : knowledgeStore.knowledgeList

  const handleAddKnowledge = () => {
    if (!title.trim() || !content.trim()) {
      message.error("标题和内容不能为空")
      return
    }

    try {
      knowledgeStore.addKnowledge(null, title, content)
      message.success("知识添加成功")
      setTitle("")
      setContent("")
    } catch (error) {
      message.error("操作失败：" + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const handleDelete = (id: string) => {
    try {
      knowledgeStore.removeKnowledge(id)
      message.success("知识已删除")
    } catch (error) {
      message.error("删除失败：" + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const handleToggleSelection = (id: string) => {
    const success = knowledgeStore.toggleKnowledgeSelection(id)
    if (!success) {
      message.error("选择失败：添加此知识会超过100KB的大小限制")
    }
  }

  const usageProgress = (knowledgeStore.selectedKnowledgeSize / knowledgeStore.sizeLimit) * 100

  const columns = [
    { name: "ID", uid: "id" },
    { name: "标题", uid: "title" },
    { name: "内容预览", uid: "content" },
    { name: "更新时间", uid: "updatedAt" },
    { name: "大小", uid: "size" },
    { name: "选择", uid: "select" },
    { name: "操作", uid: "actions" },
  ]

  const renderCell = (item: any, columnKey: React.Key) => {
    const itemSize = new Blob([item.title, item.content]).size

    switch (columnKey) {
      case "id":
        return (
          <div className='flex items-center gap-2'>
            <Icon icon='solar:document-text-linear' className='text-default-400 w-5 h-5' />
            <Tooltip content='点击复制ID'>
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
      case "size":
        return <div className='text-sm'>{knowledgeStore.formatSize(itemSize)}</div>
      case "select":
        return <Switch isSelected={item.isSelected} onValueChange={() => handleToggleSelection(item.id)} size='sm' />
      case "actions":
        return (
          <div className='flex items-center gap-2'>
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
      onClose={onClose}
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
            <Input label='标题' placeholder='输入标题...' value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea
              label='知识内容'
              placeholder='输入知识内容...'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minRows={3}
            />
            <div className='flex justify-end gap-2'>
              <Button
                color='primary'
                onPress={handleAddKnowledge}
                startContent={<Icon icon="solar:add-circle-linear" />}
              >
                添加知识
              </Button>
            </div>

            <Divider />

            <div className='space-y-4'>
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

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm text-default-500'>
                    已选择大小：{knowledgeStore.formatSize(knowledgeStore.selectedKnowledgeSize)} /{" "}
                    {knowledgeStore.formatSize(knowledgeStore.sizeLimit)}
                  </div>
                  <div className='w-1/2'>
                    <Progress
                      size='sm'
                      value={usageProgress}
                      color={usageProgress > 90 ? "danger" : usageProgress > 70 ? "warning" : "primary"}
                    />
                  </div>
                </div>
                {knowledgeStore.isOverSizeLimit && (
                  <div className='text-danger text-sm'>
                    警告：已超过大小限制（100KB），部分知识将不会被包含在上下文中
                  </div>
                )}
              </div>

              <Table aria-label='知识列表'>
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn
                      className='min-w-20'
                      key={column.uid}
                      align={column.uid === "actions" ? "center" : "start"}
                    >
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={knowledgeList}>
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
            onPress={onClose}
          >
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

export default KnowledgeModal
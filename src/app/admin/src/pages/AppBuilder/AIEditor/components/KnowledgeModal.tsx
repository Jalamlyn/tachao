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
  Card,
  Chip,
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

  const knowledgeList = searchQuery.trim() ? knowledgeStore.searchKnowledge(searchQuery) : knowledgeStore.knowledgeList

  const handleAddKnowledge = () => {
    if (!title.trim() || !content.trim()) {
      message.error("标题和内容不能为空")
      return
    }

    try {
      if (editingId) {
        knowledgeStore.updateKnowledge(editingId, { title, content })
        message.success("知识更新成功")
        setEditingId(null)
      } else {
        knowledgeStore.addKnowledge(null, title, content)
        message.success("知识添加成功")
      }
      setTitle("")
      setContent("")
    } catch (error) {
      message.error("操作失败：" + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const handleEdit = (id: string) => {
    const item = knowledgeList.find((item) => item.id === id)
    if (item) {
      setEditingId(id)
      setTitle(item.title)
      setContent(item.content)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setTitle("")
    setContent("")
  }

  const handleDelete = (id: string) => {
    try {
      knowledgeStore.removeKnowledge(id)
      if (editingId === id) {
        handleCancelEdit()
      }
      message.success("知识已删除")
    } catch (error) {
      message.error("删除失败：" + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const handleToggleSelection = (id: string) => {
    const success = knowledgeStore.toggleKnowledgeSelection(id)
    if (!success) {
      message.error("选择失败：添加此知识会超过100KB的大小限制")
    } else {
      const item = knowledgeList.find((i) => i.id === id)
      if (item) {
        message.success(item.isSelected ? "AI 已取消学习此知识" : "AI 已成功学习此知识，将在对话中参考使用")
      }
    }
  }

  const usageProgress = (knowledgeStore.selectedKnowledgeSize / knowledgeStore.sizeLimit) * 100

  const columns = [
    { name: "ID", uid: "id" },
    { name: "标题", uid: "title" },
    { name: "内容预览", uid: "content" },
    { name: "更新时间", uid: "updatedAt" },
    { name: "大小", uid: "size" },
    { name: "AI学习状态", uid: "select" },
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
        return (
          <div className='flex items-center gap-2'>
            <Switch isSelected={item.isSelected} onValueChange={() => handleToggleSelection(item.id)} size='sm' />
            {item.isSelected && (
              <Tooltip content='AI 已学习此知识，将在对话中参考使用'>
                <span className='text-primary text-sm flex items-center gap-1'>
                  <Icon icon='solar:brain-linear' className='w-4 h-4' />
                  <Chip size='sm' color='success' className='text-white'>
                    已学习
                  </Chip>
                </span>
              </Tooltip>
            )}
          </div>
        )
      case "actions":
        return (
          <div className='flex items-center gap-2'>
            <Tooltip content='编辑'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                color='primary'
                onPress={() => handleEdit(item.id)}
                className={editingId === item.id ? "bg-primary/20" : ""}
              >
                <Icon icon='solar:pen-2-linear' />
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
    <Modal scrollBehavior='inside' isOpen={isOpen} onClose={onClose} size='3xl'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='solar:book-linear' className='w-6 h-6 text-primary' />
            <span>知识管理</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='space-y-4'>
            {/* 知识库说明卡片 */}
            <Card className='bg-default-50 p-3'>
              <div className='flex items-start gap-2'>
                <Icon icon='solar:info-circle-linear' className='text-primary w-5 h-5 mt-0.5' />
                <div className='text-sm'>
                  <p className='font-medium mb-1'>知识库使用说明：</p>
                  <ul className='text-default-500 space-y-1'>
                    <li>• 选中的知识将被 AI 助手实时学习和参考</li>
                    <li>• AI 会在对话中结合这些知识提供更准确的回答</li>
                    <li>• 您可以随时调整选中的知识来优化 AI 的表现</li>
                    <li>• 选中状态变化时会收到即时反馈提示</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Input
              label={editingId ? "编辑标题" : "标题"}
              placeholder='输入标题...'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label={editingId ? "编辑内容" : "知识内容"}
              placeholder='输入知识内容...'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minRows={3}
            />
            <div className='flex justify-end gap-2'>
              {editingId && (
                <Button
                  variant='light'
                  onPress={handleCancelEdit}
                  startContent={<Icon icon='solar:close-circle-linear' />}
                >
                  取消编辑
                </Button>
              )}
              <Button
                color='primary'
                onPress={handleAddKnowledge}
                startContent={<Icon icon={editingId ? "solar:pen-2-linear" : "solar:add-circle-linear"} />}
              >
                {editingId ? "保存修改" : "添加知识"}
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
                    AI 已学习内容大小：{knowledgeStore.formatSize(knowledgeStore.selectedKnowledgeSize)} /{" "}
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
                    警告：已超过大小限制（100KB），部分知识将不会被 AI 学习和使用
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
          <Button color='danger' variant='light' onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

export default KnowledgeModal

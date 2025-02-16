import React, { useState, useRef } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Tooltip,
  Switch,
  Progress,
  Card,
  Chip,
  ButtonGroup,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import { knowledgeStore } from "./KnowledgeStore"
import message from "@/components/Message"
import KnowledgeEditModal from "./KnowledgeEditModal"
import GuideCard from "@/app/admin/src/components/GuideCard"
import { toMarkdown } from "@/service/chat/chat-to-markdown"

interface KnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = observer(({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<{
    id: string
    title: string
    content: string
  } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const knowledgeList = searchQuery.trim() ? knowledgeStore.searchKnowledge(searchQuery) : knowledgeStore.knowledgeList

  const handleEdit = (id: string) => {
    const item = knowledgeList.find((item) => item.id === id)
    if (item) {
      setEditingItem({
        id: item.id,
        title: item.title,
        content: item.content,
      })
      setShowEditModal(true)
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
    } else {
      const item = knowledgeList.find((i) => i.id === id)
      if (item) {
        message.success(item.isSelected ? "AI 已取消学习此知识" : "AI 已成功学习此知识，将在对话中参考使用")
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      message.error("仅支持 PDF 和 Word 文档格式")
      return
    }

    // 检查文件大小 (10MB 限制)
    if (file.size > 10 * 1024 * 1024) {
      message.error("文件大小不能超过 10MB")
      return
    }

    try {
      setIsUploading(true)
      const mid = message.loading("正在处理文档...", 0)

      // 调用转换服务
      const res = await toMarkdown(file)

      // 提取文件名作为标题（去除扩展名）
      const title = file.name.replace(/\.[^/.]+$/, "")

      // 添加到知识库
      await knowledgeStore.addKnowledge(null, title, res.result.markdown)
      message.closeLoading(mid, "success")
      message.success("文档已成功添加到知识库")

      // 清理文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("文档处理失败:", error)
      message.error("文档处理失败：" + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      setIsUploading(false)
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
                  <Chip color='success' className='text-white' size='sm'>
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
              <Button isIconOnly size='sm' variant='light' color='primary' onPress={() => handleEdit(item.id)}>
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
    <>
      <input type='file' ref={fileInputRef} className='hidden' accept='.pdf,.doc,.docx' onChange={handleFileUpload} />
      <Modal scrollBehavior='inside' isOpen={isOpen} onClose={onClose} size='3xl'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center justify-between w-full'>
              <div className='flex items-center gap-2'>
                <Icon icon='solar:book-linear' className='w-6 h-6 text-primary' />
                <span>知识管理</span>
              </div>
              <div className='flex gap-2'>
                <ButtonGroup>
                  <Button
                    size='sm'
                    color='primary'
                    variant='flat'
                    startContent={<Icon icon='solar:upload-linear' />}
                    onPress={() => fileInputRef.current?.click()}
                    isLoading={isUploading}
                  >
                    上传文档
                  </Button>
                  <Button
                    size='sm'
                    color='primary'
                    variant='flat'
                    startContent={<Icon icon='solar:add-circle-linear' />}
                    onPress={() => {
                      setEditingItem(null)
                      setShowEditModal(true)
                    }}
                  >
                    添加知识
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              {/* 数据安全说明 */}
              <GuideCard
                guideId='knowledge-security-guide'
                icon='solar:shield-keyhole-minimalistic-linear'
                title='数据安全说明'
                color='success'
                content={
                  <ul className='space-y-1'>
                    <li>• 所有知识内容仅存储在您的浏览器本地</li>
                    <li>• 数据不会上传到云端，确保信息安全</li>
                    <li>• 建议定期导出备份重要知识</li>
                  </ul>
                }
              />

              {/* 知识库使用说明 */}
              <GuideCard
                guideId='knowledge-usage-guide'
                icon='solar:info-circle-linear'
                title='知识库使用说明'
                color='primary'
                content={
                  <ul className='space-y-1'>
                    <li>• 选中的知识将被 AI 助手实时学习和参考</li>
                    <li>• AI 会在对话中结合这些知识提供更准确的回答</li>
                    <li>• 您可以随时调整选中的知识来优化 AI 的表现</li>
                    <li>• 选中状态变化时会收到即时反馈提示</li>
                  </ul>
                }
              />

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
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onPress={onClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <KnowledgeEditModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} editingItem={editingItem} />
    </>
  )
})

export default KnowledgeModal

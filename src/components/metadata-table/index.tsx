import React, { useCallback } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useMetadataTable } from "./useMetadataTable"
import type { MetadataTableProps, Column, Action } from "./types"
import { MetadataDetail } from "@/hooks/useMetadata"
import { useNavigate } from "react-router-dom"
import message from "@/components/Message"

export function MetadataTable<T extends MetadataDetail>({
  type,
  columns,
  toolbar,
  actions,
  emptyContent,
  onDataChange,
  onError,
  defaultActions,
}: MetadataTableProps<T>) {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [recordToDelete, setRecordToDelete] = React.useState<T | null>(null)

  // 使用 hook 管理状态
  const { data, loading, searchValue, handleSearch, handleRefresh, handleDelete } = useMetadataTable<T>({
    type,
    searchFields: toolbar?.searchProps?.fields,
    onDataChange,
    onError,
  })

  // 处理删除确认
  const handleDeleteClick = useCallback((record: T) => {
    setRecordToDelete(record)
    onOpen()
  }, [])

  // 确认删除
  const confirmDelete = useCallback(async () => {
    if (recordToDelete) {
      try {
        await handleDelete(recordToDelete.id)
        onClose()
        setRecordToDelete(null)
        message.success("删除成功")
      } catch (error) {
        message.error("删除失败")
      }
    }
  }, [recordToDelete, handleDelete])

  // 处理 AI 编辑
  const handleAIEdit = useCallback(
    (record: T) => {
      if (defaultActions?.onAIEdit) {
        defaultActions.onAIEdit(record)
      } else {
        navigate(`/we-chat-app/admin/resources/ai/${record.id}`)
      }
    },
    [defaultActions, navigate]
  )

  // 渲染工具栏
  const renderToolbar = () => {
    if (!toolbar) return null

    return (
      <div className='flex justify-between items-center mb-4'>
        <div className='flex items-center gap-2'>
          {toolbar.showSearch && (
            <Input
              isClearable
              className='w-full max-w-xs'
              placeholder={toolbar.searchProps?.placeholder || "搜索..."}
              startContent={<Icon icon='mdi:search' className='text-default-400 pointer-events-none flex-shrink-0' />}
              value={searchValue}
              onClear={() => handleSearch("")}
              onValueChange={handleSearch}
              variant='bordered'
            />
          )}
        </div>
        <div className='flex items-center gap-2'>
          {toolbar.extra}
          {toolbar.showRefresh && (
            <Button isIconOnly variant='light' onClick={handleRefresh} isLoading={loading}>
              <Icon icon='mdi:refresh' className='w-5 h-5' />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // 渲染操作按钮
  const renderActions = (record: T) => {
    const defaultActionButtons = []

    // AI 编辑按钮
    if (defaultActions?.showAIEdit) {
      defaultActionButtons.push(
        <Tooltip key='ai-edit' content='AI 分析'>
          <Button
            isIconOnly
            size='sm'
            variant='light'
            className='text-default-600 hover:text-primary transition-colors'
            onClick={() => handleAIEdit(record)}
          >
            <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4' />
          </Button>
        </Tooltip>
      )
    }

    // 删除按钮
    if (defaultActions?.showDelete) {
      defaultActionButtons.push(
        <Tooltip key='delete' content='删除' color='danger'>
          <Button
            isIconOnly
            size='sm'
            variant='light'
            className='text-danger-500 hover:text-danger-600 transition-colors'
            onClick={() => handleDeleteClick(record)}
          >
            <Icon icon='mdi:delete' className='w-4 h-4' />
          </Button>
        </Tooltip>
      )
    }

    // 自定义操作按钮
    const customActionButtons = actions?.map((action) => (
      <Tooltip key={action.key} content={action.label}>
        <Button
          isIconOnly
          size='sm'
          variant='light'
          color={action.color}
          onClick={() => action.onClick(record)}
        >
          <Icon icon={action.icon} className='w-4 h-4' />
        </Button>
      </Tooltip>
    ))

    return (
      <div className='flex gap-2 items-center justify-end'>
        {defaultActionButtons}
        {customActionButtons}
      </div>
    )
  }

  return (
    <div className='metadata-table space-y-4'>
      {/* 工具栏 */}
      {renderToolbar()}

      {/* 表格 */}
      <Table
        aria-label={`${type} table`}
        classNames={{
          wrapper: "min-h-[222px]",
        }}
        loadingContent={
          <div className='flex justify-center items-center h-32'>
            <Icon icon='mdi:loading' className='w-8 h-8 animate-spin' />
          </div>
        }
        loadingState={loading ? "loading" : "idle"}
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.key} className='text-sm'>
              {column.title}
            </TableColumn>
          ))}
          {(actions?.length || defaultActions?.showDelete || defaultActions?.showAIEdit) && (
            <TableColumn className='text-sm text-center'>操作</TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={data}
          emptyContent={
            emptyContent || (
              <div className='text-center text-default-400 py-6'>
                <Icon icon='mdi:file-search' className='w-8 h-8 mx-auto mb-2' />
                <p>暂无数据</p>
              </div>
            )
          }
        >
          {(item) => (
            <TableRow key={item.id} className='hover:bg-default-100 transition-colors'>
              {(columnKey) => (
                <TableCell>
                  {columnKey === "actions"
                    ? renderActions(item)
                    : (columns.find((col) => col.key === columnKey)?.render?.(item) ?? item[columnKey as keyof T])}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 删除确认对话框 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
          <ModalBody>
            <p>确定要删除 "{recordToDelete?.title}" 吗？此操作不可恢复。</p>
          </ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onClose}>
              取消
            </Button>
            <Button color='danger' onPress={confirmDelete}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
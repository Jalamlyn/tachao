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
import { motion, AnimatePresence } from "framer-motion"

export function MetadataTable<T extends MetadataDetail>({
  type,
  columns,
  toolbar,
  actions = [],
  emptyContent,
  onDataChange,
  onError,
}: MetadataTableProps<T>) {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [recordToDelete, setRecordToDelete] = React.useState<T | null>(null)

  const { data, loading, searchValue, handleSearch, handleRefresh, handleDelete } = useMetadataTable<T>({
    type,
    searchFields: toolbar?.searchProps?.fields,
    onDataChange,
    onError,
  })

  const handleDeleteClick = useCallback((record: T) => {
    setRecordToDelete(record)
    onOpen()
  }, [])

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

  const handleAIEdit = useCallback(
    (record: T) => {
      navigate(`/we-chat-app/admin/${type}/ai/${record.id}`)
    },
    [navigate, type]
  )

  const renderToolbar = () => {
    if (!toolbar) return null

    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex justify-between items-center mb-6 bg-default-50 p-4 rounded-lg shadow-sm'
      >
        <div className='flex items-center gap-3'>
          {toolbar.showSearch && (
            <Input
              isClearable
              className='w-full max-w-xs'
              placeholder={toolbar.searchProps?.placeholder || "搜索..."}
              startContent={
                <Icon icon='mingcute:search-ai-line' className='text-default-400 pointer-events-none flex-shrink-0' />
              }
              value={searchValue}
              onClear={() => handleSearch("")}
              onValueChange={handleSearch}
              variant='bordered'
              classNames={{
                input: "text-small",
                inputWrapper: "h-10 shadow-sm hover:shadow transition-shadow duration-200",
              }}
            />
          )}
        </div>
        <div className='flex items-center gap-2'>
          {toolbar.extra}
          {toolbar.showRefresh && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                isIconOnly 
                variant='light' 
                onClick={handleRefresh} 
                isLoading={loading}
                className="bg-default-100 shadow-sm hover:shadow transition-shadow duration-200"
              >
                <Icon icon='mdi:refresh' className='w-5 h-5' />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  const renderActions = (record: T) => {
    // 合并默认删除操作和自定义操作
    const allActions: Action<T>[] = [
      ...actions,
      {
        key: 'delete',
        label: '删除',
        icon: 'mdi:delete',
        color: 'danger',
        onClick: () => handleDeleteClick(record)
      }
    ]

    return (
      <div className='flex gap-2 items-center justify-end'>
        {allActions.map((action) => (
          <Tooltip key={action.key} content={action.label}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                isIconOnly 
                size='sm' 
                variant='light' 
                color={action.color}
                className='shadow-sm hover:shadow transition-shadow duration-200'
                onClick={() => action.onClick(record)}
              >
                <Icon icon={action.icon} className='w-4 h-4' />
              </Button>
            </motion.div>
          </Tooltip>
        ))}
      </div>
    )
  }

  return (
    <div className='metadata-table space-y-4'>
      {renderToolbar()}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Table
          aria-label={`${type} table`}
          classNames={{
            wrapper: "min-h-[222px] shadow-sm rounded-lg overflow-hidden",
            th: "bg-default-100 text-default-800 text-xs uppercase tracking-wider",
            td: "text-sm",
          }}
          loadingContent={
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex flex-col justify-center items-center h-32 space-y-4'
            >
              <Icon icon='mdi:loading' className='w-8 h-8 animate-spin text-primary' />
              <p className="text-default-500">加载中...</p>
            </motion.div>
          }
          loadingState={loading ? "loading" : "idle"}
        >
          <TableHeader>
            {columns.map((column) => (
              <TableColumn key={column.key} className='text-sm'>
                {column.title}
              </TableColumn>
            ))}
            {actions && <TableColumn className='text-sm text-center'>操作</TableColumn>}
          </TableHeader>
          <TableBody
            items={data}
            emptyContent={
              emptyContent || (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-center text-default-400 py-8'
                >
                  <Icon icon='mdi:file-search' className='w-12 h-12 mx-auto mb-4 opacity-50' />
                  <p className="text-lg font-medium mb-2">暂无数据</p>
                  <p className="text-sm text-default-400">试试添加一些数据吧</p>
                </motion.div>
              )
            }
          >
            {(item) => (
              <TableRow 
                key={item.id} 
                className='hover:bg-default-50 transition-colors duration-150 cursor-pointer'
              >
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
      </motion.div>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        classNames={{
          base: "bg-default-50 dark:bg-default-100",
          header: "border-b border-default-200",
          body: "py-6",
          footer: "border-t border-default-200",
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          }
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
          <ModalBody>
            <p>确定要删除 "{recordToDelete?.title}" 吗？此操作不可恢复。</p>
          </ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onClose}>
              取消
            </Button>
            <Button 
              color='danger' 
              onPress={confirmDelete}
              className="shadow-lg shadow-danger-500/20"
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
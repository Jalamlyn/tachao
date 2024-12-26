import React, { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "@nextui-org/react"
import { useMetadata } from "@/hooks/useMetadata"
import SimpleDataTable from "@/components/common/simple-data-table/SimpleDataTable"
import message from "@/components/Message"
import { ResourceSelectModalProps } from "./types"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"

const ResourceSelectModal: React.FC<ResourceSelectModalProps> = ({
  open,
  onClose,
  onSelect,
  resourceTitle,
  fields,
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const { load: loadResources, getDetail: getResourceDetail } = useMetadata("resource")

  useEffect(() => {
    if (open) {
      loadData()
    } else {
      setSelectedRows([])
    }
  }, [open])

  const loadData = async () => {
    setLoading(true)
    try {
      const resources = await loadResources()
      const resource = resources.find((r) => r.title === resourceTitle)
      if (resource) {
        const detail = await getResourceDetail(resource.id)
        setData(detail?.data || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      message.error("加载数据失败")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (selectedRows.length === 0) {
      message.warning("请选择一条记录")
      return
    }
    onSelect(selectedRows[0])
    onClose()
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size='2xl'
      classNames={{
        base: "rounded-xl",
        header: "border-b border-gray-100 px-6",
        body: "p-0",
        footer: "border-t border-gray-100 px-6",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex items-center gap-2'>
          <Icon icon='mdi:database-search' className='w-5 h-5 text-primary-500' />
          <span>选择{resourceTitle}</span>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <Spinner label='加载中...' color='primary' labelColor='primary' />
            </div>
          ) : (
            <div className='px-6 py-4'>
              <SimpleDataTable
                resourceId={resourceTitle}
                data={data}
                columns={fields.map((field) => ({
                  header: field.label,
                  accessorKey: field.key,
                }))}
                selectionMode='single'
                onSelectionChange={(rows) => setSelectedRows(rows)}
                className='border-none shadow-none'
              />
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant='light'
            onPress={onClose}
            className={cn("font-medium", "hover:bg-gray-100", "transition-colors duration-200")}
          >
            取消
          </Button>
          <Button
            color='primary'
            onPress={handleConfirm}
            className='font-medium'
            startContent={<Icon icon='mdi:check' className='w-4 h-4' />}
          >
            确认选择
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ResourceSelectModal

import React, { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, Spinner } from "@nextui-org/react"
import { useMetadata } from "@/hooks/useMetadata"
import SimpleDataTable from "@/components/common/simple-data-table/SimpleDataTable"
import message from "@/components/Message"
import { ResourceSelectModalProps } from "./types"

const ResourceSelectModal: React.FC<ResourceSelectModalProps> = ({
  open,
  onClose,
  onSelect,
  resourceTitle,
  fields
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const { load: loadResources, getDetail: getResourceDetail } = useMetadata("resource")

  // 加载数据
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    setLoading(true)
    try {
      const resources = await loadResources()
      const resource = resources.find(r => r.title === resourceTitle)
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

  return (
    <Modal 
      isOpen={open} 
      onClose={onClose}
      size="2xl"
    >
      <ModalContent>
        <ModalHeader>选择{resourceTitle}</ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner label="加载中..." />
            </div>
          ) : (
            <SimpleDataTable
              data={data}
              columns={fields.map(field => ({
                header: field.label,
                accessorKey: field.key
              }))}
              selectionMode="single"
              onSelectionChange={rows => {
                if (rows.length > 0) {
                  onSelect(rows[0])
                }
              }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ResourceSelectModal
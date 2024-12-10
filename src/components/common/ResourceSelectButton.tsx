import React, { useState, useCallback } from "react"
import { Button } from "@nextui-org/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getMetadata } from "@/service/apis/api"
import { Icon } from "@iconify/react"
import SimpleDataTable from "./simple-data-table/SimpleDataTable"

interface ResourceSelectButtonProps {
  resourceName: string
  appId: string
  onSelect?: (selectedRows: any[]) => void
  buttonText?: string
  buttonProps?: React.ComponentProps<typeof Button>
  loading?: boolean
  selectionMode?: "single" | "multiple"
}

const ResourceSelectButton: React.FC<ResourceSelectButtonProps> = ({
  resourceName,
  onSelect,
  buttonText = "选择资料",
  buttonProps,
  loading = false,
  selectionMode = "multiple",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [resourceData, setResourceData] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)

  const fetchResourceData = useCallback(async () => {
    if (!resourceName) return

    setIsLoading(true)
    try {
      const response = await getMetadata([resourceName])
      if (response.data && response.data.length > 0 && response.data[0].value) {
        const { data } = JSON.parse(response.data[0].value)
        setResourceData(data)
      }
    } catch (error) {
      console.error("Error fetching resource data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [resourceName])

  const handleOpenDialog = async () => {
    setIsButtonLoading(true)
    try {
      await fetchResourceData()
      setIsOpen(true)
    } finally {
      setIsButtonLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setIsOpen(false)
    setSelectedRows([])
  }

  const handleConfirm = () => {
    if (onSelect) {
      onSelect(selectedRows)
    }
    handleCloseDialog()
  }

  const handleSelectionChange = (rows: any[]) => {
    setSelectedRows(rows)
  }

  // 根据数据生成列配置
  const generateColumns = (data: any[]) => {
    if (!data.length) return []

    const firstItem = data[0]
    return Object.keys(firstItem).map((key) => ({
      id: key,
      accessorKey: key,
      header: key,
      cell: (info: any) => info.getValue(),
    }))
  }

  return (
    <>
      <Button
        type='button'
        variant='light'
        onClick={handleOpenDialog}
        className='gap-2'
        isLoading={loading || isButtonLoading}
        {...buttonProps}
      >
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>选择{resourceName}数据</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <Icon icon='mdi:loading' className='w-8 h-8 animate-spin' />
            </div>
          ) : (
            <div className='max-w-4xl overflow-x-scroll'>
              <SimpleDataTable
                data={resourceData}
                columns={generateColumns(resourceData)}
                onSelectionChange={handleSelectionChange}
                className='max-h-[600px]'
                selectionMode={selectionMode}
              />
            </div>
          )}

          <DialogFooter className='gap-2'>
            <Button variant='light' color='danger' onClick={handleCloseDialog}>
              取消
            </Button>
            <Button color='primary' onClick={handleConfirm} disabled={selectedRows.length === 0}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ResourceSelectButton

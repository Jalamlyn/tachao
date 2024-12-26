"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useMetadata } from "@/hooks/useMetadata"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ResourceForm from "./ResourceForm"
import message from "@/components/Message"
import * as XLSX from "xlsx"
import { Spinner } from "@nextui-org/react"
import { processMultiLevelHeaders } from "./ResourceDataTableColumns"
import { createActionsColumn } from "./ResourceDataTableActions"
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils"
import { ResourceDataTableToolbar } from "./ResourceDataTableToolbar"
import { ResourceDataTableBody } from "./ResourceDataTableBody"
import { ResourceDataTablePagination } from "./ResourceDataTablePagination"
import AddColumnsModal from "./AddColumnsModal"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"

// 新增空状态组件
const EmptyStatePrompt = ({ onAddColumns }: { onAddColumns: () => void }) => (
  <div className='flex flex-col items-center justify-center py-12'>
    <div className='text-4xl mb-4'>📊</div>
    <h3 className='text-lg font-medium mb-2'>还没有定义数据列</h3>
    <p className='text-gray-500 mb-4'>请先添加数据列以开始管理您的数据</p>
    <Button onClick={onAddColumns} className='bg-primary hover:bg-primary/90'>
      <Plus className='mr-2 h-4 w-4' />
      添加数据列
    </Button>
  </div>
)

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const ResourceDataTable: React.FC = ({ id }) => {
  const { getDetail, update, remove } = useMetadata("resource")
  const [resource, setResource] = useState<any>(null)
  const [columns, setColumns] = useState<ColumnDef<any>[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showDeleteColumnAlert, setShowDeleteColumnAlert] = useState<string | null>(null)
  const [isAddColumnsModalOpen, setIsAddColumnsModalOpen] = useState(false)

  const hasColumns = React.useMemo(() => {
    if (!resource?.indexFields) return false
    return resource.indexFields.displayFields?.length > 0 || Object.keys(resource.indexFields?.rawData || {}).length > 0
  }, [resource])

  const fetchResources = useCallback(async () => {
    if (!id) return
    try {
      const resourceDetail = await getDetail(id)
      if (resourceDetail) {
        setResource(resourceDetail)
      }
    } catch (error) {
      console.error("Error fetching resource data:", error)
      message.error("获取资源数据失败")
    }
  }, [id, getDetail])

  const handleSave = async (formData: any) => {
    if (!resource || !hasColumns) return

    setIsLoading(true)
    try {
      let newData
      if (editingRow) {
        newData = resource.data.map((item: any) =>
          item.dataid === editingRow.dataid ? { ...item, ...formData } : item
        )
      } else {
        newData = [...resource.data, { ...formData, dataid: `${Date.now()}` }]
      }

      const updatedResource = await update(resource.id, {
        ...resource,
        data: newData,
      })

      if (updatedResource) {
        setResource(updatedResource)
        setIsModalOpen(false)
        setEditingRow(null)
        message.success(editingRow ? "更新成功" : "新增数据成功")
      }
    } catch (error) {
      console.error("Error saving data:", error)
      message.error(editingRow ? "更新失败" : "新增数据失败")
    } finally {
      setIsLoading(false)
    }
  }

  // 其他现有方法保持不变...
  const handleEdit = (row: any) => {
    setEditingRow(row)
    setIsModalOpen(true)
  }

  const handleDelete = async (row: any) => {
    if (!resource) return

    setIsLoading(true)
    try {
      const newData = resource.data.filter((item: any) => item !== row)
      const updatedResource = await update(resource.id, {
        ...resource,
        data: newData,
      })

      if (updatedResource) {
        setResource(updatedResource)
        message.success("删除成功")
      }
    } catch (error) {
      console.error("Error deleting data:", error)
      message.error("删除失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchDelete = async () => {
    if (!resource) return
    setShowDeleteAlert(true)
  }

  const confirmBatchDelete = async () => {
    if (!resource) return

    setIsLoading(true)
    try {
      const selectedRows = table.getSelectedRowModel().rows
      const selectedIds = selectedRows.map((row) => row.original)
      const newData = resource.data.filter((item: any) => !selectedIds.includes(item))

      const updatedResource = await update(resource.id, {
        ...resource,
        data: newData,
      })

      if (updatedResource) {
        setResource(updatedResource)
        setRowSelection({})
        message.success("批量删除成功")
      }
    } catch (error) {
      console.error("Error batch deleting data:", error)
      message.error("批量删除失败")
    } finally {
      setIsLoading(false)
      setShowDeleteAlert(false)
    }
  }

  const handleAddColumns = async (newColumns: string[]) => {
    if (!resource) return

    try {
      // 准备新的rawData
      const newRawData = {
        ...(resource.indexFields?.rawData || {}),
        ...newColumns.reduce(
          (acc, col) => ({
            ...acc,
            [col]: {
              type: "string", // 默认类型
              required: false, // 默认不必填
            },
          }),
          {}
        ),
      }

      // 准备新的data
      const newData = resource.data.map((item: any) => {
        const newItem = { ...item }
        newColumns.forEach((col) => {
          newItem[col] = ""
        })
        return newItem
      })

      // 更新resource，同时更新rawData和data
      const updatedResource = await update(resource.id, {
        ...resource,
        data: newData,
        indexFields: {
          ...resource.indexFields,
          rawData: newRawData,
        },
      })

      if (updatedResource) {
        setResource(updatedResource)
        message.success("添加列成功")
      }
    } catch (error) {
      console.error("Error adding columns:", error)
      message.error("添加列失败")
    }
  }

  const handleDeleteColumn = (columnId: string) => {
    setShowDeleteColumnAlert(columnId)
  }

  const confirmDeleteColumn = async () => {
    if (!resource || !showDeleteColumnAlert) return

    try {
      const newData = resource.data.map((item: any) => {
        const newItem = { ...item }
        delete newItem[showDeleteColumnAlert]
        return newItem
      })

      const updatedResource = await update(resource.id, {
        ...resource,
        data: newData,
      })

      if (updatedResource) {
        setResource(updatedResource)
        message.success("删除列成功")
      }
    } catch (error) {
      console.error("Error deleting column:", error)
      message.error("删除列失败")
    } finally {
      setShowDeleteColumnAlert(null)
    }
  }

  const handleExportExcel = (type: "all" | "selected") => {
    try {
      if (!resource?.data || resource.data.length === 0) {
        message.warning("没有可导出的数据")
        return
      }

      let exportData
      if (type === "selected") {
        const selectedRows = table.getSelectedRowModel().rows
        if (selectedRows.length === 0) {
          message.warning("请先选择要导出的数据")
          return
        }
        exportData = selectedRows.map((row) => row.original)
      } else {
        exportData = resource.data
      }

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
      XLSX.writeFile(wb, `${resource.name || "export"}.xlsx`)
      message.success("导出成功")
    } catch (error) {
      console.error("Error exporting data:", error)
      message.error("导出失败")
    }
  }

  useEffect(() => {
    if (id) {
      fetchResources()
    }
  }, [id, fetchResources])

  useEffect(() => {
    if (resource) {
      let dynamicColumns = []

      if (resource.indexFields?.displayFields) {
        dynamicColumns = resource.indexFields.displayFields.map((field) => ({
          accessorKey: field.key,
          header: field.label,
          cell: (info: any) => info.getValue(),
          size: 180,
          enablePinning: true,
          enableSorting: true,
        }))
      } else if (resource.data && resource.data.length > 0) {
        const keys = Object.keys(resource.data[0])
        dynamicColumns = processMultiLevelHeaders(keys, handleEdit)
      } else if (resource.indexFields?.rawData) {
        const keys = Object.keys(resource.indexFields.rawData)
        dynamicColumns = keys.map((key) => ({
          accessorKey: key,
          header: key,
          cell: (info: any) => info.getValue(),
          size: 180,
          enablePinning: true,
          enableSorting: true,
        }))
      }

      setColumns([
        {
          id: "select",
          header: ({ table }) => (
            <div className='flex justify-center items-center pr-3'>
              <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className='flex justify-center items-center pr-3'>
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
          size: 40,
          enablePinning: true,
        },
        ...dynamicColumns,
        createActionsColumn(handleEdit, handleDelete),
      ])
    }
  }, [resource])

  const table = useReactTable({
    initialState: {
      columnPinning: {
        left: ["select"],
        right: ["actions"],
      },
      pagination: {
        pageSize: 20,
      },
    },
    data: resource?.data || [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    enableSorting: true,
    enableMultiSort: true,
    enableRowSelection: true,
  })

  if (!resource) {
    return (
      <div className='full-screen flex items-center justify-center h-screen'>
        <Spinner label='加载中...'></Spinner>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>{resource.name}</h1>
      </div>

      {!hasColumns ? (
        <EmptyStatePrompt onAddColumns={() => setIsAddColumnsModalOpen(true)} />
      ) : (
        <>
          <ResourceDataTableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            onAddNew={() => {
              setEditingRow(null)
              setIsModalOpen(true)
            }}
            onExport={handleExportExcel}
            onBatchDelete={handleBatchDelete}
            hasSelection={Object.keys(rowSelection).length > 0}
            onAddColumns={() => setIsAddColumnsModalOpen(true)}
            onDeleteColumn={handleDeleteColumn}
            showAddNew={hasColumns}
          />
          <ResourceDataTableBody table={table} columns={columns} />
          <ResourceDataTablePagination table={table} />
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='w-full max-w-4xl p-0'>
          <DialogHeader className='px-6 py-4 border-b'>
            <DialogTitle>{editingRow ? "编辑数据" : "新增数据"}</DialogTitle>
          </DialogHeader>
          <div className='flex-1 overflow-hidden'>
            <ResourceForm
              initialData={editingRow}
              resource={resource}
              columns={columns.filter((col) => col.id !== "select" && col.id !== "actions")}
              onSubmit={handleSave}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除选中的数据，删除后将无法恢复。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='hover:bg-gray-100 transition-colors'>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBatchDelete} className='bg-red-600 hover:bg-red-700 transition-colors'>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!showDeleteColumnAlert} onOpenChange={(open) => !open && setShowDeleteColumnAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除列</AlertDialogTitle>
            <AlertDialogDescription>
              删除列 "{showDeleteColumnAlert}" 将会删除所有数据中的相关信息，此操作不可恢复。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='hover:bg-gray-100 transition-colors'>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteColumn} className='bg-red-600 hover:bg-red-700 transition-colors'>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddColumnsModal
        isOpen={isAddColumnsModalOpen}
        onClose={() => setIsAddColumnsModalOpen(false)}
        onConfirm={handleAddColumns}
      />
    </div>
  )
}

export default ResourceDataTable

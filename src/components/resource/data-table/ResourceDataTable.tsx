"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { getMetadata, setMetadata } from "@/service/apis/api"
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

const ResourceDataTable: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const appId = searchParams.get("appId")

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

  const fetchResources = useCallback(async () => {
    if (!appId) return
    try {
      const response = await getMetadata(["resources"], appId)
      if (response.data && response.data.length > 0 && response.data[0].value) {
        const resourcesData = JSON.parse(response.data[0].value)
        const currentResource = resourcesData.find((r: any) => r.id === id)
        if (currentResource) {
          const resourceDataResponse = await getMetadata([currentResource.name], appId)
          if (resourceDataResponse.data && resourceDataResponse.data.length > 0 && resourceDataResponse.data[0].value) {
            setResource({
              ...currentResource,
              data: JSON.parse(resourceDataResponse.data[0].value),
            })
          }
        }
      }
    } catch (error) {
      console.error("Error fetching resource data:", error)
      message.error("获取资源数据失败")
    }
  }, [appId, id])

  const handleSave = async (formData: any) => {
    if (!resource || !appId) return

    setIsLoading(true)
    try {
      const newData = [...resource.data]

      if (editingRow) {
        const index = newData.findIndex((item: any) => item === editingRow)
        if (index !== -1) {
          newData[index] = formData
        }
      } else {
        newData.push(formData)
      }

      await setMetadata(resource.name, JSON.stringify(newData), appId)
      setResource({ ...resource, data: newData })
      message.success(editingRow ? "更新成功" : "添加成功")
      setIsModalOpen(false)
      setEditingRow(null)
    } catch (error) {
      console.error("Error saving data:", error)
      message.error(editingRow ? "更新失败" : "添加失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (row: any) => {
    setEditingRow(row)
    setIsModalOpen(true)
  }

  const handleDelete = async (row: any) => {
    if (!resource || !appId) return

    setIsLoading(true)
    try {
      const newData = resource.data.filter((item: any) => item !== row)
      await setMetadata(resource.name, JSON.stringify(newData), appId)
      setResource({ ...resource, data: newData })
      message.success("删除成功")
    } catch (error) {
      console.error("Error deleting data:", error)
      message.error("删除失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchDelete = async () => {
    if (!resource || !appId) return
    setShowDeleteAlert(true)
  }

  const confirmBatchDelete = async () => {
    if (!resource || !appId) return

    setIsLoading(true)
    try {
      const selectedRows = table.getSelectedRowModel().rows
      const selectedIds = selectedRows.map((row) => row.original)
      const newData = resource.data.filter((item: any) => !selectedIds.includes(item))

      await setMetadata(resource.name, JSON.stringify(newData), appId)
      setResource({ ...resource, data: newData })
      setRowSelection({})
      message.success("批量删除成功")
    } catch (error) {
      console.error("Error batch deleting data:", error)
      message.error("批量删除失败")
    } finally {
      setIsLoading(false)
      setShowDeleteAlert(false)
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
    if (id && appId) {
      fetchResources()
    }
  }, [id, appId, fetchResources])

  useEffect(() => {
    if (resource?.data && resource.data.length > 0) {
      const keys = Object.keys(resource.data[0])
      const dynamicColumns = [
        ...processMultiLevelHeaders(keys, handleEdit),
        createActionsColumn(handleEdit, handleDelete),
      ]
      setColumns(dynamicColumns)
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
    <div className='w-full p-6'>
      {/* 添加标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{resource.name}</h1>
        <p className="text-sm text-gray-500 mt-1">数据管理</p>
      </div>

      <ResourceDataTableToolbar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onAddNew={() => setIsModalOpen(true)}
        onExport={handleExportExcel}
        onBatchDelete={handleBatchDelete}
        hasSelection={Object.keys(rowSelection).length > 0}
      />
      <ResourceDataTableBody table={table} columns={columns} />
      <ResourceDataTablePagination table={table} />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='w-full max-w-4xl p-0'>
          <DialogHeader className='px-6 py-4 border-b'>
            <DialogTitle>{editingRow ? "编辑数据" : "新增数据"}</DialogTitle>
          </DialogHeader>
          <div className='flex-1 overflow-hidden'>
            <ResourceForm
              initialData={editingRow}
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
    </div>
  )
}

export default ResourceDataTable
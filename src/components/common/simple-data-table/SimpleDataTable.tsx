"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import {
  ColumnFiltersState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SimpleDataTableSearch from "./SimpleDataTableSearch"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as XLSX from "xlsx"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { useMetadata } from "@/hooks/useMetadata"

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

interface SimpleDataTableProps<T> {
  data: T[]
  columns: any[]
  onSelectionChange?: (selectedRows: T[]) => void
  className?: string
  selectionMode?: "single" | "multiple"
  resourceId?: string
  displayFields?: Array<{ key: string; label: string }>
  onSuccess?: () => void
}

function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!)

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <Checkbox
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
      onCheckedChange={rest.onChange}
      checked={rest.checked as boolean}
    />
  )
}

export function SimpleDataTable<T>({
  data,
  columns,
  onSelectionChange,
  className = "",
  selectionMode = "multiple",
  resourceId,
  displayFields,
  onSuccess,
}: SimpleDataTableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [tableHeight, setTableHeight] = useState("400px")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [resourceExists, setResourceExists] = useState<boolean | null>(null)
  const { create, getDetail } = useMetadata("resource")

  useEffect(() => {
    if (resourceId) {
      checkResourceExists()
    }
  }, [resourceId])

  const checkResourceExists = async () => {
    if (!resourceId) return
    try {
      const resource = await getDetail(resourceId)
      setResourceExists(!!resource)
    } catch (error) {
      console.error("Check resource error:", error)
      setResourceExists(false)
    }
  }

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original as T)
      onSelectionChange(selectedRows)
    }
  }, [rowSelection])

  const handleCreateResource = async () => {
    if (!resourceId) {
      message.error("资源ID不能为空")
      return
    }
    const existingResource = await getDetail(resourceId)
    if (existingResource) {
      message.error(`资源 ${resourceId} 已存在，请前往修改或使用其他ID`)
      return
    }

    try {
      const resourceData = {
        id: resourceId,
        title: resourceId,
        data: [],
        status: "active",
        indexFields: {
          type: "excel",
          rawData: displayFields?.reduce(
            (acc, field) => {
              acc[field.label] = "-"
              return acc
            },
            {} as Record<string, string>
          ),
          ...(displayFields && {
            displayFields: displayFields.map((field) => ({
              key: field.key,
              label: field.label,
            })),
          }),
        },
      }

      await create(resourceData)
      message.success("创建成功")
      setResourceExists(true)

      // 触发成功回调以刷新数据
      onSuccess?.()

      // 打开确认对话框
      setIsConfirmOpen(true)
    } catch (error) {
      console.error("Create resource error:", error)
      message.error("创建失败")
    }
  }

  const handleConfirmNavigation = () => {
    window.open(`/we-chat-app/admin/resources/${resourceId}`, "_blank")
    setIsConfirmOpen(false)
  }

  const handleExportTemplate = () => {
    try {
      const headers = displayFields
        ? displayFields.map((field) => field.label)
        : columns.map((col) => col.header || col.title)

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([headers])

      const colWidth = headers.map(() => ({ wch: 15 }))
      ws["!cols"] = colWidth

      XLSX.utils.book_append_sheet(wb, ws, "Sheet1")

      const fileName = `template_${resourceId || "data"}.xlsx`

      XLSX.writeFile(wb, fileName)
      message.success("模板导出成功")
    } catch (error) {
      console.error("Export template error:", error)
      message.error("模板导出失败")
    }
  }

  const selectionColumn = {
    id: "select",
    header: ({ table }: any) =>
      selectionMode === "multiple" ? (
        <IndeterminateCheckbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
          }}
          aria-label='Select all'
        />
      ) : null,
    cell: ({ row }: any) => (
      <IndeterminateCheckbox
        checked={row.getIsSelected()}
        indeterminate={selectionMode === "multiple" ? row.getIsSomeSelected() : false}
        onChange={(value) => {
          if (selectionMode === "single") {
            table.toggleAllRowsSelected(false)
          }
          row.toggleSelected(!!value)
        }}
        aria-label='Select row'
        disabled={!row.getCanSelect()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const allColumns = [selectionColumn, ...columns]

  const table = useReactTable({
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    data,
    columns: allColumns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: selectionMode === "multiple",
  })

  const handleRowClick = (e: React.MouseEvent, row: any) => {
    if ((e.target as HTMLElement).closest('[aria-label="Select row"]')) {
      return
    }

    if (selectionMode === "single") {
      table.toggleAllRowsSelected(false)
    }
    row.toggleSelected(!row.getIsSelected())
  }

  const renderEmptyState = () => {
    if (!resourceId) {
      return (
        <div className='flex flex-col items-center justify-center h-full space-y-4'>
          <Icon icon="mdi:table-empty" className='w-16 h-16 text-gray-300' />
          <div className='text-center space-y-2'>
            <h3 className='text-lg font-medium text-gray-900'>暂无数据记录</h3>
            <p className='text-sm text-gray-500 max-w-sm'>该表格暂时没有任何数据记录</p>
          </div>
        </div>
      )
    }

    return (
      <div className='flex flex-col items-center justify-center h-full space-y-4'>
        <Icon 
          icon={resourceExists ? "mdi:file-document-plus" : "mdi:file-plus"} 
          className='w-16 h-16 text-gray-300' 
        />
        <div className='text-center space-y-2'>
          <h3 className='text-lg font-medium text-gray-900'>
            {resourceExists ? '暂无数据记录' : '创建资料'}
          </h3>
          <p className='text-sm text-gray-500 max-w-sm'>
            {resourceExists 
              ? '您可以通过导入Excel文件或手动添加的方式创建新的数据记录'
              : '该资料尚未创建，请先创建资料后再添加数据'}
          </p>
        </div>
        <div className='flex gap-2 mt-4'>
          <Button 
            size='sm'
            variant='outline'
            onClick={handleCreateResource}
            className='flex items-center gap-2'
            disabled={resourceExists}
          >
            <Icon icon='mdi:plus' className='w-4 h-4' />
            创建资料
          </Button>
          <Button 
            size='sm'
            variant='outline'
            onClick={handleExportTemplate}
            className='flex items-center gap-2'
          >
            <Icon icon='mdi:file-download-outline' className='w-4 h-4' />
            导出模板
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className='flex items-center justify-between p-2'>
        <SimpleDataTableSearch
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className='max-w-sm'
        />
        
        {resourceId && data.length === 0 && (
          <div className='flex gap-2'>
            <Button size='sm' variant='outline' onClick={handleCreateResource} className='flex items-center gap-2'>
              <Icon icon='mdi:plus' className='w-4 h-4' />
              创建资料
            </Button>
            <Button size='sm' variant='outline' onClick={handleExportTemplate} className='flex items-center gap-2'>
              <Icon icon='mdi:file-download-outline' className='w-4 h-4' />
              导出模板
            </Button>
          </div>
        )}
      </div>

      <div className='flex-1 border rounded-md shadow-sm overflow-hidden'>
        <ScrollArea className='h-[400px]'>
          <Table>
            <TableHeader className='sticky top-0 z-10 bg-white'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='h-10 px-4 text-xs font-medium text-gray-500'>
                      {header.isPlaceholder
                        ? null
                        : typeof header.column.columnDef.header === "function"
                          ? header.column.columnDef.header(header.getContext())
                          : header.column.columnDef.header}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className='hover:bg-gray-50/50 transition-colors cursor-pointer h-10'
                    onClick={(e) => handleRowClick(e, row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='px-4 py-2'>
                        {cell.column.columnDef.cell?.(cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className='h-[400px]'>
                    {renderEmptyState()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <div className='flex items-center justify-between p-2 bg-white'>
        <div className='flex-1 text-sm text-gray-500'>
          {table.getFilteredSelectedRowModel().rows.length} 条已选择 / 共 {table.getFilteredRowModel().rows.length} 条
        </div>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建成功</DialogTitle>
            <DialogDescription>是否立即前往新增资料数据？</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsConfirmOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmNavigation}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SimpleDataTable
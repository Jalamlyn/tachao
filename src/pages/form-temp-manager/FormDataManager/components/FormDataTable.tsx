import React, { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@iconify/react"
import { Spinner } from "@nextui-org/react"
import * as XLSX from "xlsx"
import message from "@/components/Message"
import { generateColumns, flattenObject } from "./utils"
import { renderDeleteAlert } from "./renderDeleteAlert"
import { renderDataTable } from "./renderDataTable"
import { renderToolbar } from "./renderToolbar"
import { getHandleExportExcel } from "./getHandle"

interface FormDataTableProps {
  data: any[]
  isLoading?: boolean
  onSelectionChange?: (selectedRows: string[]) => void
  onRefresh?: () => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
}

const FormDataTable: React.FC<FormDataTableProps> = ({
  data,
  isLoading = false,
  onSelectionChange,
  onEdit,
  onDelete,
}) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showSingleDeleteAlert, setShowSingleDeleteAlert] = useState(false)
  const [deletingRow, setDeletingRow] = useState<any>(null)

  const columns = React.useMemo(() => {
    if (!data || data.length === 0) return []

    // 选择列配置
    const selectColumn: ColumnDef<any> = {
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
            className='flex justify-center items-center'
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
    }

    // 操作列配置
    const actionColumn: ColumnDef<any> = {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>打开菜单</span>
              <Icon icon='lucide:more-horizontal' className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Icon icon='lucide:pencil' className='mr-2 h-4 w-4' />
              编辑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSingleDelete(row.original)} className='text-red-600'>
              <Icon icon='lucide:trash' className='mr-2 h-4 w-4' />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enablePinning: true,
    }

    // 生成数据列配置
    const dataColumns = generateColumns(data[0])

    return [selectColumn, ...dataColumns, actionColumn]
  }, [data])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
      columnPinning: {
        left: ["select"],
        right: ["actions"],
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedIds = Object.keys(rowSelection).map((index) => data[parseInt(index)].id)
      onSelectionChange(selectedIds)
    }
  }, [rowSelection, data, onSelectionChange])

  const handleEdit = (row: any) => {
    if (onEdit) {
      onEdit(row)
    }
  }

  const handleSingleDelete = (row: any) => {
    setDeletingRow(row)
    setShowSingleDeleteAlert(true)
  }

  const handleBatchDelete = () => {
    setShowDeleteAlert(true)
  }

  const confirmSingleDelete = async () => {
    if (deletingRow && onDelete) {
      await onDelete(deletingRow)
      setShowSingleDeleteAlert(false)
      setDeletingRow(null)
    }
  }

  const confirmBatchDelete = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    for (const row of selectedRows) {
      if (onDelete) {
        await onDelete(row.original)
      }
    }
    setShowDeleteAlert(false)
    setRowSelection({})
  }

  const handleExportExcel = getHandleExportExcel(table, message, data, flattenObject, XLSX)

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[400px]'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {renderToolbar(globalFilter, setGlobalFilter, rowSelection, handleBatchDelete, handleExportExcel)}
      {renderDataTable(table, columns)}
      {renderDeleteAlert(
        showDeleteAlert,
        setShowDeleteAlert,
        confirmBatchDelete,
        showSingleDeleteAlert,
        setShowSingleDeleteAlert,
        confirmSingleDelete
      )}
    </div>
  )
}

export default FormDataTable

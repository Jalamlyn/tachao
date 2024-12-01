import React, { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@iconify/react"
import { Spinner } from "@nextui-org/react"
import { Download, ChevronDown, Trash2 } from "lucide-react"
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
import * as XLSX from "xlsx"
import message from "@/components/Message"
import { getPinningStyles, generateColumns, flattenObject } from "./utils"

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
  onRefresh,
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

  const handleExportExcel = (type: "all" | "selected") => {
    try {
      let exportData
      if (type === "selected") {
        const selectedRows = table.getSelectedRowModel().rows
        if (selectedRows.length === 0) {
          message.warning("请先选择要导出的数据")
          return
        }
        exportData = selectedRows.map((row) => row.original)
      } else {
        exportData = data
      }

      // 展平嵌套数据
      const flattenedData = exportData.map((item) => flattenObject(item))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(flattenedData)
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
      XLSX.writeFile(wb, "export.xlsx")
    } catch (error) {
      console.error("Export failed:", error)
      message.error("导出失败")
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[400px]'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* 工具栏 */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 items-center space-x-2'>
          <Input
            placeholder='搜索...'
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className='max-w-sm'
          />
        </div>
        <div className='flex items-center space-x-2'>
          {Object.keys(rowSelection).length > 0 && (
            <Button variant='outline' className='text-red-600' onClick={handleBatchDelete}>
              <Trash2 className='mr-2 h-4 w-4' />
              批量删除
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                <Download className='mr-2 h-4 w-4' />
                导出
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleExportExcel("all")}>导出所有数据</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportExcel("selected")}
                disabled={!Object.keys(rowSelection).length}
              >
                导出选中数据
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 表格 */}
      <div className='rounded-md border overflow-x-auto'>
        <Table>
          <TableHeader className='sticky top-0 z-10 bg-gray-100 border-b border-gray-200'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={getPinningStyles(header.column)}
                    className='border-r border-gray-200 last:border-r-0'
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className='border-b border-gray-200'
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className='border-r border-gray-200 last:border-r-0'
                      key={cell.id}
                      style={getPinningStyles(cell.column)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <div className='flex items-center justify-between space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} 行选中
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            上一页
          </Button>
          <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            下一页
          </Button>
        </div>
      </div>

      {/* 批量删除确认对话框 */}
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
            <AlertDialogAction
              onClick={confirmBatchDelete}
              className='bg-red-600 hover:bg-red-700 text-white transition-colors'
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 单个删除确认对话框 */}
      <AlertDialog open={showSingleDeleteAlert} onOpenChange={setShowSingleDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>此操作将永久删除该条数据，删除后将无法恢复。确定要继续吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='hover:bg-gray-100 transition-colors'>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSingleDelete}
              className='bg-red-600 hover:bg-red-700 text-white transition-colors'
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default FormDataTable
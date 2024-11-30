import React, { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icon } from "@iconify/react"
import { Spinner } from "@nextui-org/react"
import { Download, ChevronDown, Trash2 } from "lucide-react"

interface FormDataTableProps {
  data: any[]
  isLoading?: boolean
  onSelectionChange?: (selectedRows: string[]) => void
  onRefresh?: () => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
}

// 辅助函数：获取对象的值，支持嵌套路径
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

// 辅助函数：生成多级表头配置
const generateColumns = (
  obj: any,
  parentKey: string = '',
  level: number = 0
): ColumnDef<any>[] => {
  if (typeof obj !== 'object' || obj === null) {
    return []
  }

  return Object.entries(obj).reduce((acc: ColumnDef<any>[], [key, value]) => {
    const currentPath = parentKey ? `${parentKey}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 如果是对象，创建一个分组列
      const subColumns = generateColumns(value, currentPath, level + 1)
      if (subColumns.length > 0) {
        acc.push({
          id: currentPath,
          header: key,
          columns: subColumns,
        })
      }
    } else {
      // 如果是基础类型，创建一个普通列
      acc.push({
        accessorFn: (row) => getNestedValue(row, currentPath),
        id: currentPath,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent"
          >
            {key}
            <Icon
              icon={
                column.getIsSorted() === "asc"
                  ? "lucide:chevron-up"
                  : column.getIsSorted() === "desc"
                  ? "lucide:chevron-down"
                  : "lucide:chevrons-up-down"
              }
              className="ml-2 h-4 w-4"
            />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = getValue()
          if (Array.isArray(value)) {
            return `[${value.length} items]`
          }
          return value?.toString() || '-'
        },
      })
    }
    return acc
  }, [])
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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const columns = React.useMemo(() => {
    if (!data || data.length === 0) return []

    // 选择列配置
    const selectColumn: ColumnDef<any> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    // 操作列配置
    const actionColumn: ColumnDef<any> = {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">打开菜单</span>
              <Icon icon="lucide:more-horizontal" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
              <Icon icon="lucide:pencil" className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(row.original)}
              className="text-red-600"
            >
              <Icon icon="lucide:trash" className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }

    // 生成数据列配置
    const dataColumns = generateColumns(data[0])

    return [selectColumn, ...dataColumns, actionColumn]
  }, [data, onEdit, onDelete])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedIds = Object.keys(rowSelection).map(
        (index) => data[parseInt(index)].id
      )
      onSelectionChange(selectedIds)
    }
  }, [rowSelection, data, onSelectionChange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spinner label="加载中..." />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="搜索..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          {Object.keys(rowSelection).length > 0 && (
            <Button
              variant="outline"
              className="text-red-600"
              onClick={() => {
                // 实现批量删除
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              批量删除
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                导出
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>导出所有数据</DropdownMenuItem>
              <DropdownMenuItem disabled={!Object.keys(rowSelection).length}>
                导出选中数据
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                显示列
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <ScrollArea className="h-[200px]">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="text-center"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} 条已选择，共{" "}
          {table.getFilteredRowModel().rows.length} 条
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FormDataTable
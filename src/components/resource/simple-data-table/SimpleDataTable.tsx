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
import SimpleDataTableSearch from "./SimpleDataTableSearch"
import { ScrollArea } from "@/components/ui/scroll-area"

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
}: SimpleDataTableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [tableHeight, setTableHeight] = useState("400px") // 设置固定高度

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original as T)
      onSelectionChange(selectedRows)
    }
  }, [rowSelection])

  // 添加选择列
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

  // 处理行点击事件
  const handleRowClick = (e: React.MouseEvent, row: any) => {
    if ((e.target as HTMLElement).closest('[aria-label="Select row"]')) {
      return
    }

    if (selectionMode === "single") {
      table.toggleAllRowsSelected(false)
    }
    row.toggleSelected(!row.getIsSelected())
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* 搜索框 */}
      <div className='flex items-center justify-between p-2'>
        <SimpleDataTableSearch
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className='max-w-sm'
        />
      </div>

      {/* 表格区域 */}
      <div className='flex-1 border rounded-md shadow-sm overflow-hidden'>
        <ScrollArea className='h-[400px]'>
          {" "}
          {/* 固定高度的滚动区域 */}
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
                  <TableCell colSpan={columns.length + 1} className='h-24 text-center text-gray-500'>
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* 分页信息 */}
      <div className='flex items-center justify-between p-2 bg-white'>
        <div className='flex-1 text-sm text-gray-500'>
          {table.getFilteredSelectedRowModel().rows.length} 条已选择 / 共 {table.getFilteredRowModel().rows.length} 条
        </div>
      </div>
    </div>
  )
}

export default SimpleDataTable

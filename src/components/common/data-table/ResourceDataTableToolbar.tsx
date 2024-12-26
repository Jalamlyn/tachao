import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download, ChevronDown, Trash2, Columns } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table } from "@tanstack/react-table"
import DebouncedInput from "./ResourceDataTableSearch"

interface ResourceDataTableToolbarProps<TData> {
  table: Table<TData>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  onAddNew: () => void
  onExport: (type: "all" | "selected") => void
  onBatchDelete: () => void
  hasSelection: boolean
  onAddColumns: () => void
  onDeleteColumn: (columnId: string) => void
  showAddNew?: boolean
}

export function ResourceDataTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  onAddNew,
  onExport,
  onBatchDelete,
  hasSelection,
  onAddColumns,
  onDeleteColumn,
  showAddNew = true,
}: ResourceDataTableToolbarProps<TData>) {
  return (
    <div className='flex items-center justify-between py-4 gap-4'>
      <DebouncedInput
        value={globalFilter ?? ""}
        onChange={(value) => setGlobalFilter(String(value))}
        className='flex-1'
        useButton={true}
      />
      <div className='flex justify-center items-center gap-4'>
        {showAddNew && (
          <Button onClick={onAddNew}>
            <Plus className='mr-2 h-4 w-4' />
            新增数据
          </Button>
        )}

        {hasSelection && (
          <Button
            variant='outline'
            onClick={onBatchDelete}
            className='border-red-600 text-red-600 hover:bg-red-50 transition-colors'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            批量删除
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='secondary'>
              <Download className='mr-2 h-4 w-4' />
              导出Excel
              <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[160px]'>
            <DropdownMenuItem onClick={() => onExport("all")} className='cursor-pointer hover:bg-indigo-50'>
              导出全部
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onExport("selected")}
              className='cursor-pointer hover:bg-indigo-50'
              disabled={!hasSelection}
            >
              导出选中项
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='secondary'>
              <Columns className='mr-2 h-4 w-4' />
              列管理
              <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-[200px]'>
            <DropdownMenuItem onClick={onAddColumns} className='cursor-pointer hover:bg-indigo-50 text-primary'>
              <Plus className='mr-2 h-4 w-4' />
              添加新列
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ScrollArea className='h-[300px] rounded-md'>
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide() && column.id !== "select" && column.id !== "actions")
                .map((column) => {
                  return (
                    <div key={column.id} className='flex items-center justify-between px-2 py-2 hover:bg-gray-50'>
                      <DropdownMenuCheckboxItem
                        className='flex-1 capitalize pl-8'
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteColumn(column.id)
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  )
                })}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
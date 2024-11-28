import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download, ChevronDown, Trash2 } from "lucide-react"
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
}

export function ResourceDataTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  onAddNew,
  onExport,
  onBatchDelete,
  hasSelection,
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
        <Button onClick={onAddNew}>
          <Plus className='mr-2 h-4 w-4' />
          新增
        </Button>

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
            <Button variant="secondary">
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
              列设置 <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-[200px]'>
            <ScrollArea className='h-[300px] rounded-md'>
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize px-2 pl-8 py-2 hover:bg-gray-50'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
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
  )
}

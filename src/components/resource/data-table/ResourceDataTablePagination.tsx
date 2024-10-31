import React from "react"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

interface ResourceDataTablePaginationProps<TData> {
  table: Table<TData>
}

export function ResourceDataTablePagination<TData>({ table }: ResourceDataTablePaginationProps<TData>) {
  return (
    <div className='flex items-center justify-end space-x-2 py-4'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} 行选中
      </div>
      <div className='space-x-2'>
        <Button
          className='mr-2'
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          前一页
        </Button>
        <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          后一页
        </Button>
      </div>
    </div>
  )
}

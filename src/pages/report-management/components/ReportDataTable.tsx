import React from "react"
import { Spinner } from "@nextui-org/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/theme/cn"

interface ReportDataTableProps {
  columns: any[]
  data: any[]
  isLoading: boolean
}

export function ReportDataTable({ columns, data, isLoading }: ReportDataTableProps) {
  if (isLoading) {
    return (
      <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  if (!columns.length || !data.length) {
    return (
      <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
        <span>暂无数据</span>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-lg shadow'>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead className='min-w-24 bg-slate-50' key={column.accessorKey}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row: any, rowIndex: number) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column.accessorKey}`}>
                  {column.cell(row[column.accessorKey])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
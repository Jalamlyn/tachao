import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableProps {
  data: any[]
  columns: {
    header: string
    accessorKey: string
  }[]
}

const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  if (!data || data.length === 0) {
    return (
      <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
        <p>暂无数据</p>
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
                <TableCell key={`${rowIndex}-${column.accessorKey}`}>{row[column.accessorKey]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable
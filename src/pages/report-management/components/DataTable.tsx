import React from "react"
import { Spinner } from "@nextui-org/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableProps {
  columns: Array<{
    accessorKey: string
    header: string
    cell: (value: any) => React.ReactNode
  }>
  flattenedData: any[]
  isLoading?: boolean
}

const DataTable: React.FC<DataTableProps> = ({ columns, flattenedData, isLoading = false }) => {
  if (isLoading || !columns.length || !flattenedData.length) {
    return (
      <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
        <Spinner label='加载中...' />
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
          {flattenedData.map((row: any, rowIndex: number) => (
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

export default DataTable
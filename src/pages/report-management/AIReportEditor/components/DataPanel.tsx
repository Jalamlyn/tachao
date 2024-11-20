import React from "react"
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { cn } from "@/theme/cn"

interface DataPanelProps {
  columns: any[]
  flattenedData: any[]
  selectedTab: string
  onTabChange: (tab: string) => void
}

const DataPanel: React.FC<DataPanelProps> = ({ columns, flattenedData, selectedTab, onTabChange }) => {
  if (!columns.length || !flattenedData.length) {
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
              <TableCell className='min-w-24 bg-slate-50' key={column.accessorKey}>
                {column.header}
              </TableCell>
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

export default DataPanel
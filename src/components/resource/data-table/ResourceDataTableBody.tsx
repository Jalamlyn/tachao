import React from "react"
import { Table as TableType } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { flexRender } from "@tanstack/react-table"
import { getCommonPinningStyles } from "./ResourceDataTableStyles"

interface ResourceDataTableBodyProps<TData> {
  table: TableType<TData>
  columns: any[]
}

export function ResourceDataTableBody<TData>({ table, columns }: ResourceDataTableBodyProps<TData>) {
  return (
    <div className='rounded-md border overflow-x-auto relative'>
      <Table>
        <TableHeader className='sticky top-0 z-10 bg-gray-100'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='hover:bg-gray-100/60'>
              {headerGroup.headers.map((header) => {
                const { column } = header
                const pinningStyles = getCommonPinningStyles(column)
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      ...pinningStyles,
                      position: pinningStyles.position === "sticky" ? "sticky" : "relative",
                      backgroundColor: pinningStyles.position === "sticky" ? "#f3f4f6" : undefined,
                    }}
                    className='h-12'
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "select-none transition-colors hover:bg-gray-100/80 rounded px-2"
                            : "",
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className='hover:bg-gray-50'>
                {row.getVisibleCells().map((cell) => {
                  const { column } = cell
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        ...getCommonPinningStyles(column),
                        backgroundColor: column.getIsPinned() ? "#ffffff" : undefined,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
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
  )
}

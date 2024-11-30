import React, { useState, useMemo } from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils"
import { ResourceDataTableToolbar } from "@/components/common/data-table/ResourceDataTableToolbar"
import { ResourceDataTableBody } from "@/components/common/data-table/ResourceDataTableBody"
import { ResourceDataTablePagination } from "@/components/common/data-table/ResourceDataTablePagination"
import { processMultiLevelHeaders } from "@/components/common/data-table/ResourceDataTableColumns"
import { createActionsColumn } from "@/components/common/data-table/ResourceDataTableActions"
import { Spinner } from "@nextui-org/react"

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

interface FormDataTableProps {
  data: any[]
  isLoading?: boolean
  onSelectionChange?: (selectedRows: string[]) => void
  onRefresh?: () => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
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

  // 生成列配置
  const columns = useMemo(() => {
    if (!data || data.length === 0) return []
    
    const keys = Object.keys(data[0])
    return [
      ...processMultiLevelHeaders(keys, onEdit || (() => {})),
      createActionsColumn(onEdit || (() => {}), onDelete || (() => {})),
    ]
  }, [data, onEdit, onDelete])

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (newSelection) => {
      setRowSelection(newSelection)
      if (onSelectionChange) {
        const selectedIds = Object.keys(newSelection).map((index) => data[parseInt(index)].id)
        onSelectionChange(selectedIds)
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    enableMultiSort: true,
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[400px]'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <ResourceDataTableToolbar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onAddNew={() => {}}
        onExport={(type) => {}}
        onBatchDelete={() => {}}
        hasSelection={Object.keys(rowSelection).length > 0}
      />
      <ResourceDataTableBody table={table} columns={columns} />
      <ResourceDataTablePagination table={table} />
    </div>
  )
}

export default FormDataTable
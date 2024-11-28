import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUp, ArrowDown, ArrowLeftToLine, ArrowRightToLine, X, Copy, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import message from "@/components/Message"

const columnHelper = createColumnHelper<any>()

export const processMultiLevelHeaders = (keys: string[], handleEdit: (row: any) => void): ColumnDef<any>[] => {
  const columnGroups: { [key: string]: { keys: string[]; subHeaders: string[] } } = {}
  const singleColumns: ColumnDef<any>[] = []

  singleColumns.push({
    id: "select",
    header: ({ table }) => (
      <div className='flex justify-center items-center pr-3'>
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex justify-center items-center pr-3'>
        <Checkbox
          className='flex justify-center items-center'
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
    enablePinning: true,
  })

  const handleCopyColumnName = (e: React.MouseEvent, columnName: string) => {
    e.stopPropagation() // 阻止事件冒泡，防止触发排序
    navigator.clipboard.writeText(columnName).catch(() => message.error("复制失败"))
  }

  const renderColumnHeader = (column: any, label: string) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='h-8 px-2 hover:bg-gray-100 hover:text-black transition-colors flex items-center gap-1'
          >
            <span className='font-medium'>{label}</span>
            <ChevronDown className='h-3.5 w-3.5 text-gray-500' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-[160px]'>
          {column.getCanSort() && (
            <>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(false)}
                className='flex items-center cursor-pointer hover:bg-gray-50'
              >
                <ArrowUp className='mr-2 h-4 w-4' />
                <span>升序排序</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(true)}
                className='flex items-center cursor-pointer hover:bg-gray-50'
              >
                <ArrowDown className='mr-2 h-4 w-4' />
                <span>降序排序</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {column.getCanPin() && (
            <>
              {column.getIsPinned() !== "left" && (
                <DropdownMenuItem
                  onClick={() => column.pin("left")}
                  className='flex items-center cursor-pointer hover:bg-gray-50'
                >
                  <ArrowLeftToLine className='mr-2 h-4 w-4' />
                  <span>固定到左侧</span>
                </DropdownMenuItem>
              )}

              {column.getIsPinned() && (
                <DropdownMenuItem
                  onClick={() => column.pin(false)}
                  className='flex items-center cursor-pointer hover:bg-gray-50'
                >
                  <X className='mr-2 h-4 w-4' />
                  <span>取消固定</span>
                </DropdownMenuItem>
              )}

              {column.getIsPinned() !== "right" && (
                <DropdownMenuItem
                  onClick={() => column.pin("right")}
                  className='flex items-center cursor-pointer hover:bg-gray-50'
                >
                  <ArrowRightToLine className='mr-2 h-4 w-4' />
                  <span>固定到右侧</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            onClick={(e) => handleCopyColumnName(e, label)}
            className='flex items-center cursor-pointer hover:bg-gray-50'
          >
            <Copy className='mr-2 h-4 w-4' />
            <span>复制列名</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  keys.forEach((key) => {
    if (key.includes("-")) {
      const [groupName, subHeader] = key.split("-")
      if (!columnGroups[groupName]) {
        columnGroups[groupName] = { keys: [], subHeaders: [] }
      }
      columnGroups[groupName].keys.push(key)
      columnGroups[groupName].subHeaders.push(subHeader)
    } else {
      singleColumns.push(
        columnHelper.accessor(key, {
          header: ({ column }) => renderColumnHeader(column, key),
          cell: (info) => info.getValue(),
          size: 180,
          enablePinning: true,
          enableSorting: true,
        })
      )
    }
  })

  const groupedColumns = Object.entries(columnGroups).map(([groupName, group]) =>
    columnHelper.group({
      header: groupName,
      columns: group.keys.map((key, index) =>
        columnHelper.accessor(key, {
          header: ({ column }) => renderColumnHeader(column, group.subHeaders[index]),
          cell: (info) => info.getValue(),
          size: 180,
          enablePinning: true,
          enableSorting: true,
        })
      ),
    })
  )

  return [...singleColumns, ...groupedColumns]
}

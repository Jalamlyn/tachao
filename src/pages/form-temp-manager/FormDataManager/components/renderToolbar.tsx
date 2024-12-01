import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Download, ChevronDown, Trash2 } from "lucide-react"
export const renderToolbar = (globalFilter, setGlobalFilter, rowSelection, handleBatchDelete, handleExportExcel) => {
  return (
    <>
      {/* 工具栏 */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 items-center space-x-2'>
          <Input
            placeholder='搜索...'
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className='max-w-sm'
          />
        </div>
        <div className='flex items-center space-x-2'>
          {Object.keys(rowSelection).length > 0 && (
            <Button variant='outline' className='text-red-600' onClick={handleBatchDelete}>
              <Trash2 className='mr-2 h-4 w-4' />
              批量删除
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                <Download className='mr-2 h-4 w-4' />
                导出
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleExportExcel("all")}>导出所有数据</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportExcel("selected")}
                disabled={!Object.keys(rowSelection).length}
              >
                导出选中数据
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}

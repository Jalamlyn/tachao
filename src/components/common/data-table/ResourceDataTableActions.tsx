import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"

export const createActionsColumn = (handleEdit: (row: any) => void, handleDelete: (row: any) => void): ColumnDef<any> => ({
  id: "actions",
  header: "操作",
  cell: ({ row }) => {
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">打开菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem 
              onClick={() => handleEdit(row.original)}
              className="flex items-center cursor-pointer text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>编辑</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteAlert(true)}
              className="flex items-center cursor-pointer text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>删除</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                此操作将永久删除该条数据，删除后将无法恢复。确定要继续吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:bg-gray-100 transition-colors">取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDelete(row.original)
                  setShowDeleteAlert(false)
                }}
                className="bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  },
  size: 40,
  enablePinning: true,
  enableSorting: false,
})
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
export const renderDeleteAlert = (
  showDeleteAlert,
  setShowDeleteAlert,
  confirmBatchDelete,
  showSingleDeleteAlert,
  setShowSingleDeleteAlert,
  confirmSingleDelete
) => {
  return (
    <>
      {/* 批量删除确认对话框 */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除选中的数据，删除后将无法恢复。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='hover:bg-gray-100 transition-colors'>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBatchDelete}
              className='bg-red-600 hover:bg-red-700 text-white transition-colors'
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 单个删除确认对话框 */}
      <AlertDialog open={showSingleDeleteAlert} onOpenChange={setShowSingleDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>此操作将永久删除该条数据，删除后将无法恢复。确定要继续吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='hover:bg-gray-100 transition-colors'>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSingleDelete}
              className='bg-red-600 hover:bg-red-700 text-white transition-colors'
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

import React, { useRef, useCallback } from "react"
import { Button, Tooltip, Divider } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import Editor from "@monaco-editor/react"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../../store/appCodeStore"
import message from "@/components/Message"

interface CodeEditorProps {
  isFullWidth: boolean
  onFullWidthChange: (isFullWidth: boolean) => void
}

export const CodeEditor: React.FC<CodeEditorProps> = observer(({ isFullWidth, onFullWidthChange }) => {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  const handleExportCode = useCallback(() => {
    try {
      appCodeStore.downloadMarkdown()
      message.success("代码导出成功")
    } catch (error) {
      console.error("Error exporting code:", error)
      message.error("代码导出失败")
    }
  }, [])

  const handleCopyCode = useCallback(() => {
    try {
      const currentCode = appCodeStore.viewState.editedCode
      if (!currentCode.trim()) {
        message.warning("当前没有可复制的代码")
        return
      }
      
      navigator.clipboard.writeText(currentCode).then(() => {
        message.success("代码已复制到剪贴板")
      }).catch((error) => {
        console.error("Error copying code:", error)
        message.error("复制失败，请重试")
      })
    } catch (error) {
      console.error("Error copying code:", error)
      message.error("复制失败，请重试")
    }
  }, [])

  return (
    <div className='flex-1 relative mt-2'>
      <div className='flex items-center gap-2'>
        <Tooltip content='复制代码'>
          <Button 
            className='ml-2' 
            size='sm' 
            variant='flat' 
            isIconOnly 
            onPress={handleCopyCode}
            isDisabled={!appCodeStore.viewState.selectedCodeId}
          >
            <Icon icon='mdi:content-copy' className='w-4 h-4' />
          </Button>
        </Tooltip>
        <Tooltip content='导出代码'>
          <Button className='ml-2' size='sm' variant='flat' isIconOnly onPress={handleExportCode}>
            <Icon icon='mdi:download' className='w-4 h-4' />
          </Button>
        </Tooltip>
        <Tooltip content='导入代码'>
          <Button size='sm' variant='flat' isIconOnly onClick={() => (appCodeStore.viewState.showImportModal = true)}>
            <Icon icon='mdi:upload' className='w-4 h-4' />
          </Button>
        </Tooltip>
        <Divider orientation='vertical' className='h-6' />
        <Tooltip content='版本信息'>
          <Button size='sm' variant='flat' isIconOnly onClick={() => (appCodeStore.viewState.showVersionInfo = true)}>
            <Icon icon='mdi:history' className='w-4 h-4' />
          </Button>
        </Tooltip>
        <Divider orientation='vertical' className='h-6' />
        <Tooltip content={isFullWidth ? "退出全屏" : "全屏编辑"}>
          <Button size='sm' variant='flat' isIconOnly onClick={() => onFullWidthChange(!isFullWidth)}>
            <Icon icon={isFullWidth ? "mdi:fullscreen-exit" : "mdi:fullscreen"} className='w-4 h-4' />
          </Button>
        </Tooltip>
        <Divider orientation='vertical' className='h-6' />
        {appCodeStore.viewState.isEditing ? (
          <div className='space-x-2'>
            <Button
              size='sm'
              color='primary'
              onClick={() => appCodeStore.handleSaveEdit()}
              startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}
            >
              保存
            </Button>
            <Button
              size='sm'
              variant='flat'
              onClick={() => appCodeStore.handleCancelEdit()}
              startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
            >
              取消
            </Button>
          </div>
        ) : (
          <Button
            size='sm'
            color='primary'
            onClick={() => appCodeStore.setEditMode(true)}
            startContent={<Icon icon='mdi:pencil' className='w-4 h-4' />}
            isDisabled={!appCodeStore.viewState.selectedCodeId}
          >
            编辑
          </Button>
        )}
      </div>

      <div className='h-[calc(100vh-250px)] pt-4'>
        <Editor
          height='100%'
          width='100%'
          language='javascript'
          value={appCodeStore.viewState.editedCode}
          options={{
            readOnly: !appCodeStore.viewState.isEditing,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: true,
            formatOnPaste: true,
            formatOnType: true,
            find: {
              addExtraSpaceOnTop: false,
              autoFindInSelection: "never",
              seedSearchStringFromSelection: "never",
            },
          }}
          theme='vs-dark'
          onChange={(value) => {
            if (appCodeStore.viewState.isEditing) {
              appCodeStore.updateEditedCode(value || "")
            }
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  )
})

export default CodeEditor
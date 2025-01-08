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
  const lastClickTimeRef = useRef<number>(0)
  const lastClickLineRef = useRef<number>(0)

  const handleLineNumberDoubleClick = useCallback((lineNumber: number) => {
    if (!editorRef.current) return

    const model = editorRef.current.getModel()
    if (!model) return

    const line = model.getLineContent(lineNumber)
    const indentation = line.match(/^\s*/)?.[0] || ""

    if (line.trim().startsWith("debugger;")) {
      const range = {
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber + 1,
        endColumn: 1,
      }

      const newLine = indentation

      model.pushEditOperations(
        [],
        [
          {
            range,
            text: newLine,
          },
        ],
        null
      )
    } else {
      const range = {
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: 1,
      }
      const debuggerLine = `${indentation}debugger;\n${indentation}`
      model.pushEditOperations(
        [],
        [
          {
            range,
            text: debuggerLine,
          },
        ],
        null
      )
    }
  }, [])

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor

    editor.onMouseDown((e: any) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
        const lineNumber = e.target.position.lineNumber
        const now = Date.now()

        if (now - lastClickTimeRef.current < 300 && lastClickLineRef.current === lineNumber) {
          handleLineNumberDoubleClick(lineNumber)
        }

        lastClickTimeRef.current = now
        lastClickLineRef.current = lineNumber
      }
    })
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

  return (
    <div className='flex-1 relative mt-2'>
      <div className='flex items-center gap-2'>
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

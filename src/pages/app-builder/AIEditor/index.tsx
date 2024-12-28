import React, { useState, useEffect } from "react"
import { ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable"
import message from "@/components/Message"
import Editor from "@monaco-editor/react"
import AIFormAgent from "@/service/agents/AIFormAgent"
import { renderLeftPanel } from "./render/renderLeftPanel"
import { renderRightPanel } from "./render/renderRightPanel"
import { AI_LEVELS, AIEditorProps } from "./type"
import { versionStore } from "../store/versionStore"

export const extractShataAIFormContent = (content: string): string => {
  if (!content) {
    return ""
  }
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content?.match(regex)
  return match ? match[1].trim() : content
}

const wrapWithShataAIForm = (content: string): string => {
  return `<shata-ai-code>\n${content}\n</shata-ai-code>`
}

const AIEditor: React.FC<AIEditorProps> = ({
  imageUpload = true,
  excelUpload = true,
  parseConfig,
  messages,
  selectedTab,
  onTabChange,
  onCommandResult,
  onClearMessages,
  agent,
  versionControl,
  renderPreview,
  renderDataView,
  showDataTab = false,
  showCodeTab = false,
  previewTabName = "预览",
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCode, setEditedCode] = useState("")

  // 在应用开发场景中，始终使用专家模型
  const selectedAILevel: keyof typeof AI_LEVELS = "EXPERT"

  useEffect(() => {
    const currentContent = versionStore.getCurrentContent()
    setEditedCode(extractShataAIFormContent(currentContent))
  }, [versionControl.currentIndex])

  const handleSaveEdit = async () => {
    try {
      const wrappedCode = wrapWithShataAIForm(editedCode)
      onCommandResult({
        success: true,
        rawConfig: wrappedCode,
        appCode: extractShataAIFormContent(wrappedCode),
      })
      setIsEditing(false)
      message.success("保存成功")
    } catch (error) {
      console.error("Error saving edit:", error)
      message.error("配置格式有误，请检查")
    }
  }

  const handleCancelEdit = () => {
    const currentContent = versionStore.getCurrentContent()
    setEditedCode(extractShataAIFormContent(currentContent))
    setIsEditing(false)
  }

  const handleClearMessages = () => {
    if (onClearMessages) {
      onClearMessages()
      message.success("对话已清空")
    }
  }

  const renderCodeEditor = (content: string, isEditing: boolean) => {
    return (
      <Editor
        height='100%'
        language='javascript'
        value={extractShataAIFormContent(content)}
        options={{
          readOnly: !isEditing,
          minimap: { enabled: false },
          fontSize: "14",
          lineNumbers: "on",
          wordWrap: "on",
        }}
        theme='vs-dark'
        onChange={(value) => {
          if (isEditing) {
            setEditedCode(value || "")
            setIsEditing(true)
          }
        }}
      />
    )
  }

  return (
    <div className='h-[calc(100vh-140px)] overflow-hidden'>
      <ResizablePanelGroup direction='horizontal' className='h-full p-2'>
        {renderLeftPanel(
          selectedAILevel,
          () => {}, // 移除模型选择功能
          handleClearMessages,
          messages,
          imageUpload,
          excelUpload,
          agent,
          onCommandResult
        )}
        <ResizableHandle withHandle />
        {renderRightPanel(
          versionControl,
          selectedTab,
          onTabChange,
          renderPreview,
          showDataTab,
          previewTabName,
          renderCodeEditor,
          versionStore.getCurrentVersion(),
          showCodeTab,
          renderDataView,
          isEditing,
          editedCode,
          setIsEditing,
          handleSaveEdit,
          handleCancelEdit
        )}
      </ResizablePanelGroup>
    </div>
  )
}

export default AIEditor
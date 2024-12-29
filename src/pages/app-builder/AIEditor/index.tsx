import React, { useState, useEffect } from "react"
import { ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable"
import message from "@/components/Message"
import Editor from "@monaco-editor/react"
import AIFormAgent from "@/service/agents/AIFormAgent"
import { renderLeftPanel } from "./render/renderLeftPanel"
import { renderRightPanel } from "./render/renderRightPanel"
import { AI_LEVELS, AIEditorProps } from "./type"
import { versionStore } from "../store/versionStore"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem } from "@nextui-org/react"
import { useParams } from "react-router-dom"

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
  onStop,
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
  codeItems = [],
  selectedCodeId,
  onCodeSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCode, setEditedCode] = useState("")
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // 在应用开发场景中，始终使用专家模型
  const selectedAILevel: keyof typeof AI_LEVELS = "EXPERT"

  useEffect(() => {
    if (selectedCodeId) {
      const selectedItem = codeItems.find((item) => item.id === selectedCodeId)
      if (selectedItem) {
        setEditedCode(selectedItem.code)
      }
    }
  }, [selectedCodeId])

  const handleSaveEdit = async () => {
    try {
      const selectedItem = codeItems.find((item) => item.id === selectedCodeId)
      if (!selectedItem) return

      if (selectedItem.type === "app") {
        const wrappedCode = wrapWithShataAIForm(editedCode)
        onCommandResult({
          success: true,
          rawConfig: wrappedCode,
          appCode: extractShataAIFormContent(wrappedCode),
        })
      } else {
        onCommandResult({
          success: true,
          pages: {
            [selectedItem.id]: {
              code: editedCode,
              title: selectedItem.title,
              updatedAt: new Date().toISOString(),
            },
          },
        })
      }

      setIsEditing(false)
      message.success("保存成功")
    } catch (error) {
      console.error("Error saving edit:", error)
      message.error("配置格式有误，请检查")
    }
  }

  const handleCancelEdit = () => {
    const selectedItem = codeItems.find((item) => item.id === selectedCodeId)
    if (selectedItem) {
      setEditedCode(selectedItem.code)
    }
    setIsEditing(false)
  }

  const renderCodeEditor = (content: string, isEditing: boolean) => {
    return (
      <div className="h-full w-full">
        <Editor
          height="100%"
          width="100%"
          language="javascript"
          value={content}
          options={{
            readOnly: !isEditing,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
          }}
          theme="vs-dark"
          onChange={(value) => {
            if (isEditing) {
              setEditedCode(value || "")
            }
          }}
        />
      </div>
    )
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      {renderLeftPanel(
        onStop,
        selectedAILevel,
        () => {},
        onClearMessages,
        messages,
        imageUpload,
        excelUpload,
        agent,
        onCommandResult,
        versionControl
      )}
      <ResizableHandle />
      {renderRightPanel(
        versionControl,
        selectedTab,
        onTabChange,
        renderPreview,
        showDataTab,
        previewTabName,
        renderCodeEditor,
        selectedCodeId ? codeItems.find((item) => item.id === selectedCodeId) : null,
        showCodeTab,
        renderDataView,
        isEditing,
        editedCode,
        setIsEditing,
        handleSaveEdit,
        handleCancelEdit,
        codeItems,
        selectedCodeId,
        onCodeSelect
      )}
    </ResizablePanelGroup>
  )
}

export default AIEditor
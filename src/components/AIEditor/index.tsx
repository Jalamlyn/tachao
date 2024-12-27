import React, { useState, useEffect } from "react"
import { ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable"
import message from "@/components/Message"
import Editor from "@monaco-editor/react"
import AIFormAgent from "@/service/agents/AIFormAgent"
import { renderLeftPanel } from "./render/renderLeftPanel"
import { renderRightPanel } from "./render/renderRightPanel"
import { AI_LEVELS, AIEditorProps } from "./type"
import { codeStore } from "@/pages/form-temp-manager/components/codeStore"

export const extractShataAIFormContent = (content: string): string => {
  if (!content) {
    return "尚未编写任何代码"
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
  const [currentVersion, setCurrentVersion] = useState(versionControl.getCurrentVersion())
  const [isEditing, setIsEditing] = useState(false)
  const [editedCode, setEditedCode] = useState("")
  const [selectedAILevel, setSelectedAILevel] = useState<keyof typeof AI_LEVELS>(
    (sessionStorage.getItem("aiLevel") as keyof typeof AI_LEVELS) || "ADVANCED"
  )

  useEffect(() => {
    const updateVersionState = () => {
      const version = versionControl.getCurrentVersion()
      setCurrentVersion(version)
      setIsEditing(false)
      const rawConfig = version?.rawConfig || ""
      setEditedCode(extractShataAIFormContent(rawConfig))

      // 同步更新 AIFormAgent 的状态
      AIFormAgent.setRawConfig(rawConfig, versionControl.currentIndex)
    }
    updateVersionState()
  }, [versionControl.currentIndex])

  const handleAILevelChange = (level: keyof typeof AI_LEVELS) => {
    setSelectedAILevel(level)
    sessionStorage.setItem("aiLevel", AI_LEVELS[level].value)
  }

  const handleSaveEdit = async () => {
    //debugger 手动保存按钮触发的逻辑
    try {
      const parser = parseConfig || AIFormAgent.parseConfig
      const wrappedCode = wrapWithShataAIForm(editedCode)
      const parsedConfig = await parser(wrappedCode)

      const newVersion = {
        formConfig: parsedConfig.config,
        rawConfig: wrappedCode,
      }

      versionControl.addVersion(newVersion)
      codeStore.code = wrappedCode
      onCommandResult({
        success: true,
        config: parsedConfig.config,
        rawConfig: wrappedCode,
      })
      setIsEditing(false)
      message.success("保存成功")
    } catch (error) {
      console.error("Error saving edit:", error)
      message.error("配置格式有误，请检查")
    }
  }

  const handleCancelEdit = () => {
    const rawConfig = currentVersion?.rawConfig || ""
    setEditedCode(extractShataAIFormContent(rawConfig))
    setIsEditing(false)
  }

  const handleClearMessages = () => {
    if (onClearMessages) {
      onClearMessages()
      message.success("对话已清空")
    }
  }

  const renderCodeEditor = (content: string, isEditing: boolean) => (
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

  return (
    <div className='h-[calc(100vh-140px)] overflow-hidden'>
      <ResizablePanelGroup direction='horizontal' className='h-full p-2'>
        {renderLeftPanel(
          selectedAILevel,
          handleAILevelChange,
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
          currentVersion,
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

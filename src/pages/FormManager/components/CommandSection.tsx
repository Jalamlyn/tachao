import React from "react"
import { motion } from "framer-motion"
import CommandInput from "@/components/CommandInput"
import TemplateSelect from "./TemplateSelect"
import AIFormAgent from "@/service/agents/AIFormAgent"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { Progress } from "@nextui-org/react"

interface Template {
  id: string
  title: string
}

interface CommandSectionProps {
  disabled: boolean
  selectedTemplate: string
  templates: Template[]
  onTemplateChange: (templateId: string) => void
  className?: string
  isGenerating: boolean
  generationProgress: number
  error: string | null
  onAIResponse: (result: any) => void
  onProgressUpdate: (progress: number) => void
  onChunk: (chunk: string) => void
}

const CommandSection: React.FC<CommandSectionProps> = ({
  disabled,
  selectedTemplate,
  templates,
  onTemplateChange,
  className,
  isGenerating,
  generationProgress,
  error,
  onAIResponse,
  onProgressUpdate,
  onChunk,
}) => {
  // 处理AI生成过程中的进度更新
  const handleChunk = (chunk: string) => {
    // 调用父组件传入的 onChunk
    onChunk(chunk)
    // 根据chunk的长度估算进度
    const progress = Math.min(generationProgress + 10, 90)
    onProgressUpdate(progress)
  }

  // 处理AI命令
  const handleCommand = async (command: string) => {
    try {
      const result = await AIFormAgent.processCommand(command, handleChunk)
      if (result) {
        onAIResponse(result)
        onProgressUpdate(100)
      }
    } catch (error) {
      console.error("Error in AI form generation:", error)
      throw error
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`space-y-4 ${className}`}>
      <TemplateSelect value={selectedTemplate} templates={templates} onChange={onTemplateChange} />

      {isGenerating && (
        <div className='w-full space-y-2'>
          <Progress size='sm' value={generationProgress} color='primary' className='max-w-md' />
          <p className='text-sm text-gray-500'>正在生成表单... {generationProgress}%</p>
        </div>
      )}

      {error && <div className='text-red-500 text-sm bg-red-50 p-2 rounded'>{error}</div>}

      <CommandInput 
        disabled={disabled} 
        onCommand={handleCommand}
        onChunk={handleChunk}
      />
    </motion.div>
  )
}

export default CommandSection
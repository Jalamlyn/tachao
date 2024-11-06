import React, { useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import FormPreview from "./components/FormPreview"
import CommandInput from "@/components/CommandInput"

import { useFormState } from "./hooks/useFormState"
import { useTemplates } from "./hooks/useTemplates"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import message from "@/components/Message"
import { Progress } from "@nextui-org/react"
import AIFormAgent from "@/service/agents/AIFormAgent"

const DynamicFormTestPage: React.FC = () => {
  const [generationProcess, setGenerationProcess] = React.useState('')
  const [formConfig, setFormConfig] = React.useState(null)
  
  const handleCommand = async (prompt: string) => {
    setGenerationProcess('') // 清空之前的内容
    
    try {
      const result = await AIFormAgent.createForm(
        prompt,
        (chunk) => setGenerationProcess(prev => prev + chunk)
      )
      
      if (result) {
        setFormConfig(result.config)
        message.success('表单生成成功')
      }
      
    } catch (error) {
      console.error(error)
      message.error('生成失败')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button onClick={() => setFormConfig(null)}>
              <Icon icon="mdi:refresh" className="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FormPreview config={formConfig} />
            </motion.div>
          </AnimatePresence>

          <div className="mt-6">
            <CommandInput onCommand={handleCommand} />
          </div>

          {/* AI 生成过程显示区域 */}
          <AnimatePresence>
            {generationProcess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">AI 生成过程</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm">{generationProcess}</pre>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

export default DynamicFormTestPage
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import message from "@/components/Message"
import DynamicForm from "@/components/common/DynamicForm"
import { motion } from "framer-motion"

const DynamicFormTestPage: React.FC = () => {
  const [configInput, setConfigInput] = useState("")
  const [formConfig, setFormConfig] = useState<any>(null)

  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigInput(e.target.value)
  }

  const handleParseConfig = () => {
    try {
      // 使用 Function 构造器来安全地执行字符串代码
      const createConfig = new Function(`return ${configInput}`)
      const config = createConfig()
      setFormConfig(config)
    } catch (error) {
      console.error("配置解析错误:", error)
      message.error("请检查输入的配置格式是否正确")
    }
  }

  const handleSubmit = async (values: any) => {
    console.log("表单提交的值:", values)
    message.success("表单数据已打印到控制台")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>动态表单测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">表单配置</label>
                <Textarea
                  value={configInput}
                  onChange={handleConfigChange}
                  placeholder="请输入表单配置对象..."
                  className="min-h-[200px] font-mono"
                />
              </div>
              <Button onClick={handleParseConfig}>解析配置</Button>
            </CardContent>
          </Card>
        </motion.div>

        {formConfig && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle>表单预览</CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicForm
                  config={formConfig}
                  onSubmit={handleSubmit}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default DynamicFormTestPage
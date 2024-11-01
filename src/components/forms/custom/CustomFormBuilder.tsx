import React, { useState, useEffect } from "react"
import { Card, CardBody, Button, Select, SelectItem, Textarea } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import DynamicForm from "../../common/DynamicForm"
import { useFormMetadata } from "../../from-templates/hook/useFormMetadata"
import chatMoV2 from "@/service/chat/chat-deepseek"
import message from "@/components/Message"
import { DynamicFormConfig } from "../../common/DynamicForm/types"
import { leaveRequestConfig } from "../../from-templates/leave-request/config"

interface Version {
  code: number
  config: DynamicFormConfig
  createdAt: string
  description: string
}

const CustomFormBuilder: React.FC = () => {
  const [command, setCommand] = useState("")
  const [formConfig, setFormConfig] = useState<DynamicFormConfig | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { addForm } = useFormMetadata()

  const generateFormConfig = async () => {
    if (!command.trim()) {
      message.error("请输入表单描述")
      return
    }

    setIsGenerating(true)
    try {
      let aiResponse = ""
      await chatMoV2(
        [
          {
            role: "system",
            content: "你是一个表单配置生成助手，根据用户的描述生成符合 DynamicFormConfig 类型的配置对象。",
          },
          {
            role: "user",
            content: command,
          },
        ],
        (chunk) => {
          aiResponse += chunk
        },
        () => {},
        true,
        0.7
      )

      try {
        const config = JSON.parse(aiResponse)
        setFormConfig(config)
        addNewVersion(config)
      } catch (error) {
        message.error("生成的配置格式不正确")
        console.error("Config parsing error:", error)
      }
    } catch (error) {
      message.error("生成表单配置失败")
      console.error("AI generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateLeaveRequestConfig = () => {
    try {
      setFormConfig(leaveRequestConfig)
      addNewVersion(leaveRequestConfig)
      message.success("已生成请假单配置")
    } catch (error) {
      message.error("生成请假单配置失败")
      console.error("Leave request config error:", error)
    }
  }

  const addNewVersion = (config: DynamicFormConfig) => {
    const newVersion: Version = {
      code: versions.length + 1,
      config,
      createdAt: new Date().toISOString(),
      description: `版本 ${versions.length + 1}`,
    }
    setVersions([...versions, newVersion])
    setSelectedVersion(String(newVersion.code))
  }

  const handleVersionChange = (versionCode: string) => {
    setSelectedVersion(versionCode)
    const version = versions.find((v) => String(v.code) === versionCode)
    if (version) {
      setFormConfig(version.config)
    }
  }

  const handleSave = async () => {
    if (!formConfig) return

    try {
      const newForm = {
        id: `custom_${Date.now()}`,
        templateId: "custom",
        title: "自定义表单",
        data: {
          config: formConfig,
          versions,
        },
        status: "draft",
      }

      const result = await addForm(newForm)
      if (result) {
        message.success("保存成功")
      } else {
        message.error("保存失败")
      }
    } catch (error) {
      message.error("保存失败")
      console.error("Save error:", error)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex gap-4">
            <Textarea
              label="表单描述"
              placeholder="请描述您想要创建的表单..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="flex-1"
            />
            <div className="flex flex-col gap-2 self-end">
              <Button
                color="primary"
                isLoading={isGenerating}
                onClick={generateFormConfig}
                className="self-end"
              >
                生成配置
              </Button>
              <Button
                color="secondary"
                onClick={generateLeaveRequestConfig}
                className="self-end"
              >
                使用请假单配置
              </Button>
            </div>
          </div>
          {versions.length > 0 && (
            <Select
              label="选择版本"
              selectedKeys={[selectedVersion]}
              onChange={(e) => handleVersionChange(e.target.value)}
            >
              {versions.map((version) => (
                <SelectItem key={version.code} value={version.code}>
                  {version.description} ({new Date(version.createdAt).toLocaleString()})
                </SelectItem>
              ))}
            </Select>
          )}
        </CardBody>
      </Card>

      {formConfig && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardBody>
              <div className="flex justify-end mb-4">
                <Button color="primary" onClick={handleSave}>
                  保存表单
                </Button>
              </div>
              <DynamicForm config={formConfig} />
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default CustomFormBuilder
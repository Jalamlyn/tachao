import React, { useState } from "react"
import { Select, SelectItem, Button, Card, CardBody } from "@nextui-org/react"
import { formTemplates } from "../from-templates/formTemplateConfig"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"

const CreateFormRenderer: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSaveForm = () => {
    setSelectedTemplateId(null)
  }

  const handleTemplateChange = (templateId: string) => {
    console.log("[CreateFormRenderer] Template changed to:", templateId)
    setSelectedTemplateId(templateId)
  }

  const handleCreateCustomForm = () => {
    navigate("/forms/custom/create")
  }

  const handleCreateTemplate = () => {
    navigate("/we-chat-app/admin/documents/create")
  }

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <Card className="w-full max-w-2xl bg-gradient-to-br from-blue-50 to-purple-50">
        <CardBody className="flex flex-col items-center gap-6 p-8">
          <div className="rounded-full bg-primary/10 p-4">
            <Icon icon="solar:file-text-bold-duotone" className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">还没有可用的表单模板</h3>
            <p className="text-sm text-foreground-500">
              创建一个表单模板来开始。您可以使用我们的 AI 助手来帮助您快速创建模板。
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              color="primary"
              variant="shadow"
              startContent={<Icon icon="solar:wand-star-bold-duotone" className="h-5 w-5" />}
              onClick={handleCreateTemplate}
              className="font-medium"
            >
              使用 AI 创建模板
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )

  const renderTemplateSelector = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center mb-4">
        <Select
          label="选择表单模板"
          placeholder="请选择表单模板"
          className="flex-1 mr-4"
          onChange={(e) => handleTemplateChange(e.target.value)}
          selectedKeys={selectedTemplateId ? [selectedTemplateId] : []}
        >
          <SelectItem key="official-header" className="text-primary font-semibold" isReadOnly>
            官方模板
          </SelectItem>
          {formTemplates.filter(t => !t.isCustom).map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
          <SelectItem key="custom-header" className="text-primary font-semibold" isReadOnly>
            自定义模板
          </SelectItem>
          {formTemplates.filter(t => t.isCustom).map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </Select>
        <Button
          color="primary"
          variant="flat"
          onClick={handleCreateCustomForm}
          startContent={<Icon icon="mdi:plus" className="w-5 h-5" />}
        >
          创建自定义表单
        </Button>
      </div>
    </motion.div>
  )

  const renderFormComponent = () => {
    if (!selectedTemplateId) return null

    const template = formTemplates.find((t) => t.id === selectedTemplateId)
    if (!template) {
      console.error("[CreateFormRenderer] Template not found for id:", selectedTemplateId)
      return null
    }

    console.log("[CreateFormRenderer] Rendering form component for template:", template.name)
    const FormComponent = template.component

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <FormComponent onFormSaved={handleSaveForm} />
      </motion.div>
    )
  }

  return (
    <div className="p-4 min-h-screen">
      <div className="rounded-lg p-4">
        <AnimatePresence mode="wait">
          {formTemplates.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {renderTemplateSelector()}
              {renderFormComponent()}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CreateFormRenderer
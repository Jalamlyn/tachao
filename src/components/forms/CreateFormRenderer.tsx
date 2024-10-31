import React, { useState } from "react"
import { Select, SelectItem } from "@nextui-org/react"
import { formTemplates } from "../from-templates/formTemplateConfig"
import { motion } from "framer-motion"

const CreateFormRenderer: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const handleSaveForm = () => {
    setSelectedTemplateId(null)
  }

  const handleTemplateChange = (templateId: string) => {
    console.log("[CreateFormRenderer] Template changed to:", templateId)
    setSelectedTemplateId(templateId)
  }

  const renderTemplateSelector = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Select
        label='选择单据模板'
        placeholder='请选择单据模板'
        className='mb-4'
        onChange={(e) => handleTemplateChange(e.target.value)}
        selectedKeys={selectedTemplateId ? [selectedTemplateId] : []}
      >
        {formTemplates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
          </SelectItem>
        ))}
      </Select>
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
    <div className='p-4 min-h-screen'>
      <div className='rounded-lg p-4'>
        {renderTemplateSelector()}
        {renderFormComponent()}
      </div>
    </div>
  )
}

export default CreateFormRenderer

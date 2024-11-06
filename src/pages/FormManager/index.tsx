import React, { useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react"

import FormPreview from "./components/FormPreview"
import TemplateGallery from "./components/TemplateGallery"
import { useFormState } from "./hooks/useFormState"
import { useTemplates } from "./hooks/useTemplates"

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const {
    state: formState,
    setFormConfig,
    setSelectedTemplate,
  } = useFormState()

  const { templates, handleTemplateChange } = useTemplates()

  const onTemplateSelect = async (templateId: string) => {
    try {
      setSelectedTemplate(templateId)
      const config = await handleTemplateChange(templateId)
      if (config) {
        setFormConfig(config)
      } else {
        setFormConfig(null)
      }
    } catch (error) {
      console.error("Error loading template:", error)
    }
  }

  const handleCreateTemplate = () => {
    navigate("/we-chat-app/admin/documents/create")
  }

  return (
    <div className='container mx-auto py-8'>
      <Card>
        <CardHeader className='flex justify-between items-center'>
          <div className='flex flex-col gap-2'>
            <Breadcrumbs>
              <BreadcrumbItem href='/we-chat-app/admin'>首页</BreadcrumbItem>
              <BreadcrumbItem>单据管理</BreadcrumbItem>
            </Breadcrumbs>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:form-select' className='w-6 h-6' />
              <h2 className='text-2xl font-bold'>单据模板管理</h2>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button onClick={handleCreateTemplate}>
              <Icon icon='mdi:plus' className='w-4 h-4 mr-2' />
              创建模板
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode='wait'>
            {formState.formConfig ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='border rounded-lg p-6'
              >
                <FormPreview config={formState.formConfig} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='text-center py-12 text-gray-500'
              >
                <Icon icon='mdi:form' className='w-12 h-12 mx-auto mb-4' />
                <p>请选择一个表单模板</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className='mt-6'>
            <TemplateGallery
              templates={templates}
              onTemplateSelect={onTemplateSelect}
              className='transition-all duration-300'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FormManager
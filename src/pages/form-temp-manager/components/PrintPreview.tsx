import React from "react"
import FormPreview from "../component.FormPreview"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"

interface PrintPreviewProps {
  formConfig: DynamicFormConfig | null
  rawConfig: string | null
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ formConfig, rawConfig }) => {
  if (!formConfig) {
    return (
      <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
        <Icon icon='mdi:form' className='w-12 h-12 mx-auto mb-4' />
        <p>请输入您的需求,AI将为您开发表单</p>
      </div>
    )
  }

  return <FormPreview previewMode config={formConfig} />
}

export default PrintPreview
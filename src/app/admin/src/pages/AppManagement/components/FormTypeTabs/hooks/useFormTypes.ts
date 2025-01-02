import { useState, useEffect } from "react"
import { MetadataDetail } from "@/hooks/metadata/types"

export interface FormType {
  templateId: string
  label: string
  forms: MetadataDetail[]
}

export const useFormTypes = (forms: MetadataDetail[]) => {
  const [formTypes, setFormTypes] = useState<FormType[]>([])

  useEffect(() => {
    const types = new Map<string, FormType>()
    
    forms.forEach(form => {
      const templateId = form.template?.id || "uncategorized"
      const templateTitle = form.template?.title || "未分类表单"
      
      if (!types.has(templateId)) {
        types.set(templateId, {
          templateId,
          label: templateTitle,
          forms: []
        })
      }
      types.get(templateId)!.forms.push(form)
    })

    setFormTypes(Array.from(types.values()))
  }, [forms])

  return formTypes
}
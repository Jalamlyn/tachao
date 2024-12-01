import { useState, useEffect } from "react"
import { MetadataDetail } from "@/hooks/metadata/types"
import { FormType } from "../types"

export const useFormTypes = (forms: MetadataDetail[]) => {
  const [formTypes, setFormTypes] = useState<FormType[]>([])

  useEffect(() => {
    const types = new Map<string, FormType>()
    
    forms.forEach(form => {
      const type = form.type || "default"
      if (!types.has(type)) {
        types.set(type, {
          type,
          label: type === "default" ? "默认分类" : type,
          forms: []
        })
      }
      types.get(type)!.forms.push(form)
    })

    setFormTypes(Array.from(types.values()))
  }, [forms])

  return formTypes
}
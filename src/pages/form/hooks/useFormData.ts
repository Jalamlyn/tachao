import { useCallback } from "react"
import { useMetadata } from "@/hooks/useMetadata"

export const useFormData = () => {
  const { getDetail: getFormDetail } = useMetadata("form")
  const { getDetail: getTemplateDetail } = useMetadata("template")

  const loadFormData = useCallback(
    async (formId: string) => {
      try {
        const formDetail = await getFormDetail(formId)
        if (!formDetail) {
          throw new Error("未找到表单数据")
        }
        const formTemplateId = formDetail.templateId
        if (!formTemplateId) {
          throw new Error("未找到模板ID")
        }

        const template = await getTemplateDetail(formTemplateId)

        if (!template) {
          throw new Error("未找到模板配置")
        }

        return {
          formData: formDetail.data,
          formConfig: template.data.rawConfig,
          templateId: formTemplateId,
        }
      } catch (error) {
        throw error
      }
    },
    [getFormDetail, getTemplateDetail]
  )

  return { loadFormData }
}

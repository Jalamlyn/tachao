import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { message } from "@/components/Message"
import { OutsourcingOrderFormValues } from "../schema"
import { useFormMetadata } from "../../hook/useFormMetadata"

export const useFormSubmit = (
  form: UseFormReturn<OutsourcingOrderFormValues>,
  formId: string,
  onFormSaved?: () => void
) => {
  const { addForm, updateForm } = useFormMetadata()
  const [isSaving, setIsSaving] = useState(false)

  const onSubmit = async (values: OutsourcingOrderFormValues) => {
    try {
      setIsSaving(true)
      if (formId && formId !== "create") {
        await updateForm(values)
        message.success("表单更新成功")
      } else {
        await addForm(values)
        message.success("表单创建成功")
      }
      if (onFormSaved) {
        onFormSaved()
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      message.error("提交表单失败")
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isSaving,
    onSubmit,
  }
}
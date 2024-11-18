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
      } else {
        await addForm(values)
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
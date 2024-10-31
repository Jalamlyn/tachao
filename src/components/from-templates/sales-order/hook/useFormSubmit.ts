import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { message } from "@/components/Message"
import { SalesOrder } from "../types/SalesOrder"
import { FORM_MESSAGES } from "..//constants"
import { useFormMetadata } from "../../hook/useFormMetadata"

export const useFormSubmit = (form: UseFormReturn<any>, formId: string, onFormSaved?: () => void) => {
  const { addForm, updateForm } = useFormMetadata()
  const [isSaving, setIsSaving] = useState(false)

  const onSubmit = async (values: any) => {
    try {
      setIsSaving(true)
      if (formId && formId !== "create") {
        await updateForm(values as SalesOrder)
      } else {
        await addForm(values as SalesOrder)
      }
      if (onFormSaved) {
        onFormSaved()
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      message.error(FORM_MESSAGES.SUBMIT_ERROR)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isSaving,
    onSubmit,
  }
}

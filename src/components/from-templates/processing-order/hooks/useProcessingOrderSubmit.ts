import { useState, useCallback } from "react"
import { UseFormReturn } from "react-hook-form"
import { ProcessingOrder } from "../types/ProcessingOrder"
import { message } from "@/components/Message"

interface UseProcessingOrderSubmitProps {
  form: UseFormReturn<any>
  formId: string
  validateForm: () => boolean
  addForm: (form: ProcessingOrder) => Promise<void>
  updateForm: (form: ProcessingOrder) => Promise<void>
  onFormSaved?: () => void
  onSavingStateChange?: (saving: boolean) => void
}

export const useProcessingOrderSubmit = ({
  form,
  formId,
  validateForm,
  addForm,
  updateForm,
  onFormSaved,
  onSavingStateChange,
}: UseProcessingOrderSubmitProps) => {
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = useCallback(
    async (values: any) => {
      try {
        if (!validateForm()) {
          message.error("表单验证失败，请检查错误信息")
          return
        }

        setIsSaving(true)
        onSavingStateChange?.(true)

        if (formId && formId !== "create") {
          await updateForm(values as ProcessingOrder)
          message.success("表单更新成功")
        } else {
          await addForm(values as ProcessingOrder)
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
        onSavingStateChange?.(false)
      }
    },
    [formId, validateForm, addForm, updateForm, onFormSaved, onSavingStateChange]
  )

  return {
    isSaving,
    handleSubmit,
  }
}
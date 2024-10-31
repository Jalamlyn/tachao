import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { message } from "@/components/Message"
import { useFormMetadata } from "../../hook/useFormMetadata"
import { deliveryOrderSchema, DeliveryOrderFormValues } from "../schema"
import { INITIAL_FORM_VALUES } from "../constants/deliveryOrderConstants"
import { getCurrentAccountInfo } from "@/service/apis/user"

export const useDeliveryOrderForm = (formId: string, onFormSaved?: () => void) => {
  const { getFormById, addForm, updateForm } = useFormMetadata()
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isInitializing] = useState(formId === "create")

  const form = useForm<DeliveryOrderFormValues>({
    resolver: zodResolver(deliveryOrderSchema),
    defaultValues: INITIAL_FORM_VALUES,
  })

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      setLoading(true)
      if (formId && formId !== "create") {
        const formData = await getFormById(formId)
        if (formData) {
          form.reset(formData as DeliveryOrderFormValues)
        }
      }
    } catch (error) {
      console.error("Error fetching form:", error)
      message.error("获取表单数据失败")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: DeliveryOrderFormValues) => {
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

  const handleConfirmStep = async (step: string) => {
    try {
      const currentUser = await getCurrentAccountInfo()
      const confirmations = form.getValues("data.processConfirmations") || {}

      form.setValue(`data.processConfirmations.${step}`, {
        ...confirmations[step],
        confirmed: true,
        confirmer: currentUser.name || currentUser.email || "Unknown User",
        confirmationDate: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error confirming step:", error)
      message.error("确认步骤失败")
    }
  }

  const handleCancelConfirmation = (step: string) => {
    try {
      const confirmations = form.getValues("data.processConfirmations") || {}

      form.setValue(`data.processConfirmations.${step}`, {
        ...confirmations[step],
        confirmed: false,
        confirmer: "",
        confirmationDate: "",
      })
    } catch (error) {
      console.error("Error canceling confirmation:", error)
      message.error("取消确认失败")
    }
  }

  return {
    form,
    loading,
    isSaving,
    isInitializing,
    onSubmit,
    fetchForm,
    handleConfirmStep,
    handleCancelConfirmation,
  }
}

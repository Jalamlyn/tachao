import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { message } from '@/components/Message'
import { useFormMetadata } from '../../hook/useFormMetadata'
import { salesOrderSchema, SalesOrderFormValues } from '../schema'
import { INITIAL_FORM_VALUES } from '../constants/salesOrderConstants'

export const useSalesOrderForm = (formId: string, onFormSaved?: () => void) => {
  const { getFormById, addForm, updateForm } = useFormMetadata()
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema),
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
          form.reset(formData as SalesOrderFormValues)
        }
      }
    } catch (error) {
      console.error("Error fetching form:", error)
      message.error("获取表单数据失败")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: SalesOrderFormValues) => {
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
    form,
    loading,
    isSaving,
    onSubmit,
    fetchForm,
  }
}
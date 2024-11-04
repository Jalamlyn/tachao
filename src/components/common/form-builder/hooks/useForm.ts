import { useState, useEffect } from 'react'
import { useMetadata } from '@/components/from-templates/hook/useMetadata'
import { FormBuilderConfig } from '../types'
import message from '@/components/Message'

interface UseFormProps {
  config: FormBuilderConfig
  id?: string
}

interface UseFormReturn {
  formData: any
  loading: boolean
  submitting: boolean
  setFormData: (data: any) => void
  handleSubmit: () => Promise<void>
  handleValidate: () => Promise<boolean>
}

export function useForm({ config, id }: UseFormProps): UseFormReturn {
  const [formData, setFormData] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)

  const {
    getDetail,
    create,
    update,
    loading
  } = useMetadata<any>('forms')

  // 加载表单数据
  useEffect(() => {
    const loadFormData = async () => {
      if (id) {
        const detail = await getDetail(id)
        if (detail) {
          setFormData(detail.data)
        }
      }
    }
    loadFormData()
  }, [id, getDetail])

  // 验证表单
  const handleValidate = async () => {
    if (config.handlers?.onValidate) {
      return await config.handlers.onValidate(formData)
    }

    // 默认验证逻辑
    const validateField = (field: any) => {
      if (!field.rules) return true
      
      for (const rule of field.rules) {
        if (rule.required && !formData[field.name]) {
          message.error(`${field.label}不能为空`)
          return false
        }
        if (rule.pattern && !rule.pattern.test(formData[field.name])) {
          message.error(rule.message || `${field.label}格式不正确`)
          return false
        }
        if (rule.validator && !rule.validator(formData[field.name])) {
          message.error(rule.message || `${field.label}验证失败`)
          return false
        }
      }
      return true
    }

    // 验证基本信息字段
    for (const field of config.basicInfo.fields) {
      if (!validateField(field)) return false
    }

    // 验证表格字段
    if (config.tables) {
      for (const table of config.tables.tables) {
        const tableData = formData[table.name] || []
        for (const row of tableData) {
          for (const column of table.columns) {
            if (!validateField({ ...column, name: column.name })) return false
          }
        }
      }
    }

    return true
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      // 验证
      const isValid = await handleValidate()
      if (!isValid) return

      // 自定义提交处理
      if (config.handlers?.onSubmit) {
        await config.handlers.onSubmit(formData)
        return
      }

      // 默认提交处理
      const submitData = {
        title: config.title,
        type: 'form',
        status: 'active',
        data: formData
      }

      if (id) {
        await update(id, submitData)
      } else {
        await create(submitData)
      }

      message.success('提交成功')
    } catch (error) {
      console.error('表单提交失败:', error)
      message.error('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    formData,
    loading,
    submitting,
    setFormData,
    handleSubmit,
    handleValidate
  }
}
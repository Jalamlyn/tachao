import React, { useState, useEffect } from 'react'
import { useForm } from './hooks/useForm'
import { FormBuilderProps, FormBuilderConfig } from './types'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useReactToPrint } from 'react-to-print'
import { Button } from '@nextui-org/button'
import { Icon } from '@iconify/react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal"
import OrderNumberField from '@/components/common/OrderNumberField'
import { getDefaultConfig, mergeConfig } from './defaultConfig'

const FormBuilder: React.FC<FormBuilderProps> = ({ config: userConfig, id }) => {
  const [mergedConfig, setMergedConfig] = useState<FormBuilderConfig>(userConfig)

  useEffect(() => {
    const initConfig = async () => {
      const defaultConfig = await getDefaultConfig()
      setMergedConfig(mergeConfig(defaultConfig, userConfig))
    }
    initConfig()
  }, [userConfig])

  const {
    formData,
    loading,
    submitting,
    setFormData,
    handleSubmit,
  } = useForm({ config: mergedConfig, id })

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const printContentRef = React.useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => printContentRef.current,
    pageStyle: `
      @page {
        size: ${mergedConfig.print?.pageSize || 'A4'} ${mergedConfig.print?.orientation || 'portrait'};
        margin: ${mergedConfig.print?.margins?.top || 20}mm ${mergedConfig.print?.margins?.right || 20}mm ${mergedConfig.print?.margins?.bottom || 20}mm ${mergedConfig.print?.margins?.left || 20}mm;
      }
    `,
    onAfterPrint: () => {
      setIsPrintModalOpen(false)
    }
  })

  const handleFieldChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value })
    if (mergedConfig.handlers?.onChange) {
      mergedConfig.handlers.onChange({ ...formData, [name]: value })
    }
  }

  const renderField = (field: any) => {
    const value = formData[field.name] || field.defaultValue || ''
    const isReadOnly = mergedConfig.mode === 'read'

    // 处理自定义组件
    if (field.type === 'custom') {
      switch (field.component) {
        case 'OrderNumberField':
          return (
            <OrderNumberField
              form={{ 
                setValue: (name: string, value: any) => handleFieldChange(name, value),
                getValues: (name: string) => formData[name],
                control: { 
                  // 提供一个简单的control实现以兼容OrderNumberField
                  _defaultValues: formData,
                  _formState: {},
                  _names: { mount: new Set(), unMount: new Set(), array: new Set() },
                  _subjects: { watch: { next: () => {} }, array: { next: () => {} }, state: { next: () => {} } },
                  _getWatch: () => ({}),
                  _watchInternal: () => () => {},
                  _updateValid: () => {},
                  _updateFieldArray: () => {},
                  _getDirty: () => ({}),
                  _updateFormState: () => {},
                  _subjects: { watch: { next: () => {} }, array: { next: () => {} }, state: { next: () => {} } },
                }
              }}
              fieldName={field.name}
              prefix={field.props?.prefix}
              disabled={isReadOnly || field.disabled}
            />
          )
        default:
          return null
      }
    }

    switch (field.type) {
      case 'text':
        return (
          <Input
            {...field.props}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isReadOnly || field.disabled}
          />
        )
      case 'textarea':
        return (
          <Textarea
            {...field.props}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isReadOnly || field.disabled}
          />
        )
      // 其他字段类型的渲染逻辑保持不变...
      default:
        return null
    }
  }

  // 其他渲染逻辑保持不变...
  // renderPrintContent 和其他现有代码保持不变...

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    // 原有的JSX结构保持不变...
    <div className="space-y-4">
      {/* 原有的渲染逻辑保持不变... */}
    </div>
  )
}

export default FormBuilder
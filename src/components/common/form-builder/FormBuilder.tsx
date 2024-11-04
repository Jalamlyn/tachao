import React from 'react'
import { useForm } from './hooks/useForm'
import { FormBuilderProps } from './types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useReactToPrint } from 'react-to-print'

const FormBuilder: React.FC<FormBuilderProps> = ({ config, id }) => {
  const {
    formData,
    loading,
    submitting,
    setFormData,
    handleSubmit,
  } = useForm({ config, id })

  const contentRef = React.useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    pageStyle: `
      @page {
        size: ${config.print?.pageSize || 'A4'} ${config.print?.orientation || 'portrait'};
        margin: ${config.print?.margins?.top || 20}mm ${config.print?.margins?.right || 20}mm ${config.print?.margins?.bottom || 20}mm ${config.print?.margins?.left || 20}mm;
      }
    `
  })

  const handleFieldChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value })
    if (config.handlers?.onChange) {
      config.handlers.onChange({ ...formData, [name]: value })
    }
  }

  const renderField = (field: any) => {
    const value = formData[field.name] || field.defaultValue || ''
    const isReadOnly = config.mode === 'read'

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
      // 其他字段类型的渲染逻辑...
      default:
        return null
    }
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div className="space-y-4">
      <div ref={contentRef}>
        {/* 基本信息部分 */}
        <Card className="p-4">
          <h2 className="text-lg font-bold mb-4">{config.basicInfo.title || '基本信息'}</h2>
          <div className="grid grid-cols-2 gap-4">
            {config.basicInfo.fields.map((field, index) => (
              <div key={index} className="space-y-2">
                <Label>{field.label}</Label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </Card>

        {/* 表格部分 */}
        {config.tables && (
          <Card className="p-4 mt-4">
            <h2 className="text-lg font-bold mb-4">{config.tables.title || '表格数据'}</h2>
            {/* 表格渲染逻辑... */}
          </Card>
        )}

        {/* 流程部分 */}
        {config.process && (
          <Card className="p-4 mt-4">
            <h2 className="text-lg font-bold mb-4">{config.process.title || '流程信息'}</h2>
            {/* 流程渲染逻辑... */}
          </Card>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-2">
        <Button onClick={handlePrint}>
          打印
        </Button>
        {config.mode !== 'read' && (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '提交中...' : '提交'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default FormBuilder
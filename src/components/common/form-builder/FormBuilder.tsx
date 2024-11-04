import React, { useState } from 'react'
import { useForm } from './hooks/useForm'
import { FormBuilderProps } from './types'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useReactToPrint } from 'react-to-print'
import { Button } from '@nextui-org/button'
import { Icon } from '@iconify/react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal"

const FormBuilder: React.FC<FormBuilderProps> = ({ config, id }) => {
  const {
    formData,
    loading,
    submitting,
    setFormData,
    handleSubmit,
  } = useForm({ config, id })

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const printContentRef = React.useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => printContentRef.current,
    pageStyle: `
      @page {
        size: ${config.print?.pageSize || 'A4'} ${config.print?.orientation || 'portrait'};
        margin: ${config.print?.margins?.top || 20}mm ${config.print?.margins?.right || 20}mm ${config.print?.margins?.bottom || 20}mm ${config.print?.margins?.left || 20}mm;
      }
    `,
    onAfterPrint: () => {
      setIsPrintModalOpen(false)
    }
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

  const renderPrintContent = () => {
    return (
      <div ref={printContentRef} className="p-8 bg-white min-h-[297mm]">
        {/* 打印页眉 */}
        {config.print?.header?.content && (
          <div style={{ height: `${config.print.header.height || 20}mm` }}>
            {config.print.header.content}
          </div>
        )}

        {/* 基本信息部分 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{config.basicInfo.title || '基本信息'}</h2>
          <div className="grid grid-cols-2 gap-4">
            {config.basicInfo.fields.map((field, index) => (
              field.printable !== false && (
                <div key={index} className="flex items-start">
                  <span className="font-medium min-w-[120px]">{field.label}：</span>
                  <span>{formData[field.name] || field.defaultValue || '-'}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* 表格部分 */}
        {config.tables && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{config.tables.title || '表格数据'}</h2>
            {/* 表格打印渲染逻辑... */}
          </div>
        )}

        {/* 流程部分 */}
        {config.process && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{config.process.title || '流程信息'}</h2>
            {/* 流程打印渲染逻辑... */}
          </div>
        )}

        {/* 打印页脚 */}
        {config.print?.footer?.content && (
          <div style={{ height: `${config.print.footer.height || 20}mm` }}>
            {config.print.footer.content}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div className="space-y-4">
      <div>
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
        <Button 
          color="primary"
          variant="flat"
          onPress={() => setIsPrintModalOpen(true)}
          startContent={<Icon icon="mdi:printer" className="w-5 h-5" />}
        >
          打印预览
        </Button>
        {config.mode !== 'read' && (
          <Button 
            color="primary"
            isLoading={submitting}
            onPress={handleSubmit}
            startContent={!submitting && <Icon icon="mdi:content-save" className="w-5 h-5" />}
          >
            {submitting ? '提交中...' : '提交'}
          </Button>
        )}
      </div>

      {/* 打印预览模态框 */}
      <Modal 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)}
        size="full"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            打印预览
          </ModalHeader>
          <ModalBody>
            {renderPrintContent()}
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsPrintModalOpen(false)}
              startContent={<Icon icon="mdi:close" className="w-5 h-5" />}
            >
              关闭
            </Button>
            <Button
              color="primary"
              onPress={handlePrint}
              startContent={<Icon icon="mdi:printer" className="w-5 h-5" />}
            >
              打印
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default FormBuilder
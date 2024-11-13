import React, { useState, useRef, useCallback, useEffect } from "react"
import { Form } from "@/components/ui/form"
import { Button, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { DynamicFormProps } from "./types"
import { useDynamicForm } from "./hooks/useDynamicForm"
import DynamicFormFields from "./components/DynamicFormFields"
import DynamicTable from "./components/DynamicTable"
import DynamicProcessConfirm from "./components/ProcessConfirm"
import OrderNumberField from "../OrderNumberField"
import message from "@/components/Message"
import { useMetadata } from "@/hooks/useMetadata"
import PrintableTemplate from "./components/PrintableTemplate"
import { useReactToPrint } from "react-to-print"
import { cn } from "@/theme/cn"
import { defaultFormConfig } from "./defaultConfig"
import { merge } from "lodash"

const DynamicForm: React.FC<DynamicFormProps> = ({
  config: userConfig,
  id,
  onSubmit,
  onCancel,
  templateId,
  initialValues,
  previewMode = false,
}) => {
  // 合并默认配置和用户配置
  const config = merge({}, defaultFormConfig, userConfig)

  // 添加状态管理
  const [isLoading, setIsLoading] = useState(false)
  const { getDetail, create: createMetadata, update: updateMetadata } = useMetadata("form")
  const { getDetail: getTemplateDetail } = useMetadata("template")
  const [formValues, setFormValues] = useState<any>(null)

  useEffect(() => {
    const loadFormData = async () => {
      if (initialValues) {
        setFormValues(initialValues)
        return
      }

      if (id) {
        setIsLoading(true)
        try {
          const formData = await getDetail(id)
          if (formData) {
            setFormValues(formData.data)
          }
        } catch (error) {
          console.error("Failed to load form data:", error)
          message.error("加载表单数据失败")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadFormData()
  }, [id, getDetail, initialValues])

  const { form, submitForm } = useDynamicForm(config, initialValues)
  const [isEditing, setIsEditing] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    required?: string[]
    invalid?: string[]
    other?: string[]
  }>({})
  const printRef = useRef<HTMLDivElement>(null)
  const printId = useRef<string>()

  useEffect(() => {
    if (config.watch) {
      const unsubscribe = config.watch(form)
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        }
      }
    }
  }, [config.watch, form])

  const getTemplateInfo = async (templateId: string | undefined) => {
    if (!templateId) return null

    try {
      const template = await getTemplateDetail(templateId)
      if (!template) return null

      return {
        id: template.id,
        title: template.title,
        type: template.type || "custom",
      }
    } catch (error) {
      console.error("Failed to get template info:", error)
      return null
    }
  }

  const prepareFormData = (formValues: any, templateInfo: any) => {
    const orderNumberFieldName = config.orderNumberConfig?.fieldName || "orderNumber"
    const orderNumber = formValues[orderNumberFieldName]

    return {
      title: orderNumber || config.metadata.title,
      status: "submitted",
      data: formValues,
      templateId: templateId,
      template: templateInfo,
      indexFields: {
        templateId: templateId,
        templateTitle: templateInfo?.title,
        templateType: templateInfo?.type,
        orderNumber: orderNumber,
        createdAt: new Date().toISOString(),
      },
    }
  }

  const handleValidationErrors = (errors?: string[]) => {
    if (!errors?.length) return

    setValidationErrors({
      required: errors.filter((err) => err.includes("不能为空")),
      invalid: errors.filter((err) => err.includes("格式错误") || err.includes("不能早于")),
      other: errors.filter((err) => !err.includes("不能为空") && !err.includes("格式错误")),
    })

    message.error(
      <div className='space-y-2'>
        {errors.map((error, index) => (
          <div key={index} className='flex items-center gap-2'>
            <Icon icon='mdi:alert-circle' className='w-4 h-4' />
            <span>{error}</span>
          </div>
        ))}
      </div>
    )
  }

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: config.metadata.title || "表单打印",
    onBeforePrint: () => {
      return new Promise((resolve) => {
        const values = form.getValues()
        if (!values) {
          message.error("没有可打印的内容")
          resolve(false)
          return
        }
        printId.current = message.loading("正在准备打印...")
        setTimeout(resolve, 500)
      })
    },
    onAfterPrint: () => {
      message.closeLoading(printId.current)
      message.success("打印完成")
    },
    onPrintError: (error) => {
      message.closeLoading(printId.current)
      console.error("Print error:", error)
      message.error("打印失败，请重试")
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        html, body {
          height: 100vh;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden;
        }
      }
    `,
  })

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      try {
        const { success, validationResult, values, error } = await submitForm(form.getValues())

        if (!success) {
          if (validationResult) {
            handleValidationErrors(validationResult.errors)
          }
          return
        }

        if (onSubmit) {
          await onSubmit(validationResult!, values)
          return
        }

        const templateInfo = await getTemplateInfo(templateId)
        const formData = prepareFormData(values, templateInfo)

        if (previewMode) {
          message.success("表单校验通过，预览模式下无法保存数据")
          return
        }

        if (id) {
          const result = await updateMetadata(id, formData)
          if (result) {
            message.success("更新成功")
            setIsEditing(false)
          } else {
            throw new Error("更新失败")
          }
        } else {
          const result = await createMetadata(formData)
          if (result) {
            message.success("创建成功")
            setIsEditing(false)
          } else {
            throw new Error("创建失败")
          }
        }
      } catch (error) {
        console.error("Form submission error:", error)
        message.error("提交失败，请重试")
      }
    },
    [form, id, onSubmit, templateId, updateMetadata, createMetadata]
  )

  const { metadata, renderConfig } = config

  const orderNumberConfig = {
    prefix: config.orderNumberConfig?.prefix || "ORDER",
    fieldName: config.orderNumberConfig?.fieldName || "orderNumber",
    label: config.orderNumberConfig?.label || "订单编号",
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="max-w-[1200px] mx-auto space-y-6">
        {/* 表单标题区域 */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{metadata.title}</h1>
              {metadata.description && (
                <p className="mt-1 text-sm text-gray-500">{metadata.description}</p>
              )}
            </div>
            <div className="flex gap-3">
              {metadata.permissions?.print && (
                <Button 
                  variant="flat"
                  className="bg-white border border-gray-200 hover:bg-gray-50"
                  onClick={handlePrint}
                >
                  <Icon icon="mdi:printer" className="w-4 h-4" />
                  <span className="ml-2">打印</span>
                </Button>
              )}
              {metadata.permissions?.edit && (
                <Button
                  variant="flat" 
                  className={cn(
                    "bg-white border",
                    isEditing 
                      ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                      : "border-blue-200 text-blue-600 hover:bg-blue-50"
                  )}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Icon 
                    icon={isEditing ? "mdi:pencil-off" : "mdi:pencil"} 
                    className="w-4 h-4" 
                  />
                  <span className="ml-2">
                    {isEditing ? "取消编辑" : "编辑"}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 基本信息区域 */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-6">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrderNumberField
              form={form}
              prefix={orderNumberConfig.prefix}
              fieldName={orderNumberConfig.fieldName}
              label={orderNumberConfig.label}
              disabled={!isEditing}
            />
          </div>
          <DynamicFormFields 
            fields={renderConfig.basicFields} 
            form={form} 
            isEditable={isEditing} 
          />
        </div>

        {/* 表格区域 */}
        {renderConfig.table && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-6">明细信息</h2>
            <DynamicTable 
              config={renderConfig.table} 
              form={form} 
              isEditable={isEditing} 
              fieldName='tableData' 
            />
          </div>
        )}

        {/* 流程确认区域 */}
        {renderConfig.processSteps && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-6">流程确认</h2>
            <DynamicProcessConfirm 
              steps={renderConfig.processSteps} 
              form={form} 
              isEditable={isEditing} 
            />
          </div>
        )}

        {/* 操作按钮 */}
        {isEditing && (
          <div className="flex flex-col md:flex-row justify-end gap-4 pt-4">
            {onCancel && (
              <Button 
                variant="flat" 
                color="default" 
                onClick={onCancel}
                className="w-full md:w-auto order-2 md:order-1"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
                <span className="ml-2">取消</span>
              </Button>
            )}
            <Button 
              type="submit" 
              color="primary"
              className="w-full md:w-auto order-1 md:order-2"
            >
              <Icon icon="mdi:content-save" className="w-4 h-4" />
              <span className="ml-2">保存</span>
            </Button>
          </div>
        )}

        {/* 隐藏的打印内容 */}
        <div style={{ display: "none" }}>
          <PrintableTemplate ref={printRef} config={config} data={form.getValues()} />
        </div>
      </form>
    </Form>
  )
}

export default DynamicForm
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
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import PrintableTemplate from "./components/PrintableTemplate"
import { useReactToPrint } from "react-to-print"
import { cn } from "@/theme/cn"
import { defaultFormConfig } from "./defaultConfig"
import { merge } from "lodash"

const DynamicForm: React.FC<DynamicFormProps> = ({ config: userConfig, id, onSubmit, onCancel, templateId }) => {
  // 合并默认配置和用户配置
  const config = merge({}, defaultFormConfig, userConfig)

  // 添加状态管理
  const [isLoading, setIsLoading] = useState(false)
  const [initialValues, setInitialValues] = useState<any>(null)
  const { getDetail, create: createMetadata, update: updateMetadata } = useMetadata("form")

  // 获取模板详情
  const getTemplateDetail = useCallback(async (templateId: string) => {
    try {
      const { getDetail: getTemplateDetail } = useMetadata("template")
      const template = await getTemplateDetail(templateId)
      if (!template) {
        throw new Error("Template not found")
      }
      return {
        id: template.id,
        title: template.title,
        type: template.type || "custom",
        data: template.data,
      }
    } catch (error) {
      console.error("Failed to get template detail:", error)
      message.error("获取模板详情失败")
      return null
    }
  }, [])

  // 加载表单数据
  useEffect(() => {
    const loadFormData = async () => {
      if (id) {
        setIsLoading(true)
        try {
          const formData = await getDetail(id)
          if (formData) {
            setInitialValues(formData.data)
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
  }, [id, getDetail])

  const { form, handleSubmit, validateForm } = useDynamicForm(config, initialValues)
  const [isEditing, setIsEditing] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    required?: string[]
    invalid?: string[]
    other?: string[]
  }>({})
  const printRef = useRef<HTMLDivElement>(null)
  const printId = useRef<string>()

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
        // 1. 先执行表单验证
        const validationResult = await validateForm()
        
        // 2. 如果验证不通过,显示错误信息并返回
        if (!validationResult.valid) {
          if (validationResult.errors?.length > 0) {
            // 设置验证错误状态
            setValidationErrors({
              required: validationResult.errors.filter(err => err.includes('不能为空')),
              invalid: validationResult.errors.filter(err => 
                err.includes('格式错误') || err.includes('不能早于')),
              other: validationResult.errors.filter(err => 
                !err.includes('不能为空') && !err.includes('格式错误'))
            })

            // 显示错误消息
            message.error(
              <div className="space-y-2">
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Icon icon='mdi:alert-circle' className='w-4 h-4' />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )
            return
          }
        }

        // 3. 如果有警告信息,显示警告对话框
        if (validationResult.warnings?.length > 0) {
          const warningId = Math.random().toString(36).substr(2, 9)
          message.warning(
            <div className="space-y-4">
              <div className="space-y-2">
                {validationResult.warnings.map((warning, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Icon icon='mdi:alert' className='w-4 h-4' />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="light"
                  onClick={() => message.dismiss(warningId)}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  onClick={async () => {
                    message.dismiss(warningId)
                    await handleSubmit(async (values) => {
                      if (onSubmit) {
                        await onSubmit(values)
                        message.success("提交成功")
                        setIsEditing(false)
                        return
                      }

                      // 获取模板信息
                      let templateInfo = null
                      if (templateId) {
                        try {
                          const template = await getTemplateDetail(templateId)
                          if (template) {
                            templateInfo = {
                              id: template.id,
                              title: template.title,
                              type: template.type,
                            }
                          }
                        } catch (error) {
                          console.error("Failed to get template info:", error)
                        }
                      }

                      const orderNumberFieldName = config.orderNumberConfig?.fieldName || "orderNumber"
                      const orderNumber = values[orderNumberFieldName]

                      const formData = {
                        title: orderNumber || config.metadata.title,
                        status: "submitted",
                        data: values,
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
                    })()
                  }}
                >
                  继续提交
                </Button>
              </div>
            </div>,
            { id: warningId, duration: 0 }
          )
          return
        }

        // 4. 验证通过,执行提交
        await handleSubmit(async (values) => {
          if (onSubmit) {
            await onSubmit(values)
            message.success("提交成功")
            setIsEditing(false)
            return
          }

          // 获取模板信息
          let templateInfo = null
          if (templateId) {
            try {
              const template = await getTemplateDetail(templateId)
              if (template) {
                templateInfo = {
                  id: template.id,
                  title: template.title,
                  type: template.type,
                }
              }
            } catch (error) {
              console.error("Failed to get template info:", error)
            }
          }

          const orderNumberFieldName = config.orderNumberConfig?.fieldName || "orderNumber"
          const orderNumber = values[orderNumberFieldName]

          const formData = {
            title: orderNumber || config.metadata.title,
            status: "submitted",
            data: values,
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
        })()
      } catch (error) {
        console.error("Form submission error:", error)
        message.error("提交失败，请重试")
      }
    },
    [config, handleSubmit, id, onSubmit, updateMetadata, createMetadata, templateId, getTemplateDetail, validateForm]
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
      <form onSubmit={handleFormSubmit} className='space-y-6 md:space-y-8'>
        {/* 表单标题 */}
        <div className='flex flex-col md:flex-row md:justify-between md:items-center border-b pb-4 gap-4'>
          <div>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900 break-all'>{metadata.title}</h1>
            {metadata.description && <p className='text-gray-500 mt-1 text-sm break-all'>{metadata.description}</p>}
          </div>
          <div className='flex gap-2 flex-wrap'>
            {metadata.permissions?.print && (
              <Button variant='flat' color='primary' onClick={handlePrint} className='w-full md:w-auto'>
                <Icon icon='mdi:printer' className='w-4 h-4' />
                <span className='hidden md:inline ml-1'>打印</span>
              </Button>
            )}
            {metadata.permissions?.edit && (
              <Button
                variant='flat'
                color={isEditing ? "warning" : "primary"}
                className='w-full md:w-auto'
                onClick={() => setIsEditing(!isEditing)}
              >
                <Icon icon={isEditing ? "mdi:pencil-off" : "mdi:pencil"} className='w-4 h-4' />
                <span className='hidden md:inline ml-1'>{isEditing ? "取消编辑" : "编辑"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div
          className={cn(
            "bg-white rounded-lg p-4 md:p-6 shadow-sm",
            "border border-gray-100",
            "hover:border-gray-200 transition-colors"
          )}
        >
          <h2 className='text-lg font-semibold text-gray-900 mb-4 md:mb-6 pb-2 border-b break-all'>基本信息</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-2'>
            <OrderNumberField
              form={form}
              prefix={orderNumberConfig.prefix}
              fieldName={orderNumberConfig.fieldName}
              label={orderNumberConfig.label}
              disabled={!isEditing}
            />
          </div>
          <DynamicFormFields fields={renderConfig.basicFields} form={form} isEditable={isEditing} />
        </div>

        {/* 表格 */}
        {renderConfig.table && (
          <div
            className={cn(
              "bg-white rounded-lg p-4 md:p-6 shadow-sm",
              "border border-gray-100",
              "hover:border-gray-200 transition-colors"
            )}
          >
            <h2 className='text-lg font-semibold text-gray-900 mb-4 md:mb-6 pb-2 border-b break-all'>明细信息</h2>
            <DynamicTable config={renderConfig.table} form={form} isEditable={isEditing} fieldName='tableData' />
          </div>
        )}

        {/* 流程确认 */}
        {renderConfig.processSteps && (
          <div
            className={cn(
              "bg-white rounded-lg p-4 md:p-6 shadow-sm",
              "border border-gray-100",
              "hover:border-gray-200 transition-colors"
            )}
          >
            <h2 className='text-lg font-semibold text-gray-900 mb-4 md:mb-6 pb-2 border-b break-all'>流程确认</h2>
            <DynamicProcessConfirm steps={renderConfig.processSteps} form={form} isEditable={isEditing} />
          </div>
        )}

        {/* 操作按钮 */}
        {isEditing && (
          <div className='flex flex-col md:flex-row md:justify-end gap-4 pt-4 border-t'>
            {onCancel && (
              <Button variant='flat' color='default' onClick={onCancel} className='w-full md:w-auto order-2 md:order-1'>
                <Icon icon='mdi:close' className='w-4 h-4' />
                <span className='hidden md:inline ml-1'>取消</span>
              </Button>
            )}
            <Button type='submit' color='primary' className='w-full md:w-auto order-1 md:order-2'>
              <Icon icon='mdi:content-save' className='w-4 h-4' />
              <span className='hidden md:inline ml-1'>保存</span>
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
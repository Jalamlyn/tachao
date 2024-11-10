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

  // 新增：使用useEffect来设置watch函数
  useEffect(() => {
    if (config.watch) {
      const unsubscribe = config.watch(form);
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [config.watch, form]);

  // 获取模板信息的函数
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

  // 准备表单数据的函数
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

  // 处理验证错误的函数
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
        // 提交处理
        const { success, validationResult, values, error } = await submitForm(form.getValues())

        if (!success) {
          if (validationResult) {
            handleValidationErrors(validationResult.errors)
          }
          return
        }

        // 如果有外部提交处理函数
        if (onSubmit) {
          await onSubmit(validationResult!, values)
          return
        }

        // 获取模板信息
        const templateInfo = await getTemplateInfo(templateId)

        // 准备表单数据
        const formData = prepareFormData(values, templateInfo)

        //如果是预览模式, 只显示校验成功消息, 不执行实际提交
        if (previewMode) {
          message.success("表单校验通过，预览模式下无法保存数据")
          return
        }

        // 提交到服务器
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
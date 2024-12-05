import React, { useState, useRef, useCallback, useEffect } from "react"
import { Form } from "@/components/ui/form"
import { Button, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { DynamicFormProps, TableGroup } from "./types"
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
import styles from "./styles/DynamicForm.module.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DynamicForm: React.FC<DynamicFormProps> = ({
  config: userConfig,
  id,
  onSubmit,
  onCancel,
  templateId,
  initialValues,
  previewMode = false,
}) => {
  const config = merge({}, defaultFormConfig, userConfig)
  const [isLoading, setIsLoading] = useState(false)
  const { getDetail, create: createMetadata, update: updateMetadata } = useMetadata("form")
  const { getDetail: getTemplateDetail } = useMetadata("template")
  const [isUpdating, setIsUpdating] = useState(0)
  const [formValues, setFormValues] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<{
    required?: Array<{ field: string; message: string }>
    invalid?: Array<{ field: string; message: string }>
    other?: Array<{ field: string; message: string }>
  }>({})
  const [selectedTable, setSelectedTable] = useState<string>("")

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

  useEffect(() => {
    // 设置默认选中的表格
    if (config.renderConfig.tables && config.renderConfig.tables.length > 0) {
      setSelectedTable(config.renderConfig.tables[0].key)
    }
  }, [config.renderConfig.tables])

  const { form, submitForm } = useDynamicForm(config, initialValues)
  const [isEditing, setIsEditing] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const printId = useRef<string>()

  useEffect(() => {
    if (config.watch) {
      const unsubscribe = config.watch(form)
      return () => {
        if (typeof unsubscribe === "function") {
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

    const fieldErrors = form.formState.errors
    Object.entries(fieldErrors).forEach(([field, error]) => {
      form.setError(field, {
        type: "custom",
        message: error.message || String(error),
      })
    })

    const errorContent = (
      <div className='space-y-2'>
        {errors.map((error, index) => (
          <div key={index} className='flex items-center gap-2'>
            <Icon icon='mdi:alert-circle' className='w-4 h-4 text-red-500' />
            <span>{error}</span>
          </div>
        ))}
      </div>
    )

    message.error(errorContent)
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
            if (validationResult.fields) {
              Object.entries(validationResult.fields).forEach(([field, error]) => {
                form.setError(field, {
                  type: "custom",
                  message: error,
                })
              })
            }

            if (validationResult.categorizedErrors) {
              setValidationErrors(validationResult.categorizedErrors)
            }

            handleValidationErrors(validationResult.errors)
          }
          return
        }

        if (onSubmit) {
          await onSubmit(validationResult!, values)
          form.reset()
          return
        }

        const templateInfo = await getTemplateInfo(templateId)
        const formData = prepareFormData(values, templateInfo)

        if (previewMode) {
          return
        }

        if (id) {
          const result = await updateMetadata(id, formData)
          if (result) {
            setIsEditing(false)
            form.reset()
          } else {
            throw new Error("更新失败")
          }
        } else {
          const result = await createMetadata(formData)
          if (result) {
            setIsEditing(false)
            form.reset()
          } else {
            throw new Error("创建失败")
          }
        }
        setIsUpdating(new Date().getTime())
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

  const renderTables = () => {
    // 如果有旧版的单表格配置，使用旧版配置
    if (renderConfig.table) {
      return (
        <div className={cn(styles["form-card"])}>
          <h2 className={cn(styles["form-title"])}>明细信息</h2>
          <DynamicTable config={renderConfig.table} form={form} isEditable={isEditing} fieldName='tableData' />
        </div>
      )
    }

    // 如果有新版的多表格配置，使用新版配置
    if (renderConfig.tables && renderConfig.tables.length > 0) {
      return (
        <div className={cn(styles["form-card"])}>
          <h2 className={cn(styles["form-title"])}>明细信息</h2>
          <Tabs value={selectedTable} onValueChange={setSelectedTable}>
            <TabsList>
              {renderConfig.tables.map((table: TableGroup) => (
                <TabsTrigger key={table.key} value={table.key}>
                  {table.icon && <span className='text-xl'>{table.icon}</span>}
                  <span>{table.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {renderConfig.tables.map((table: TableGroup) => (
              <TabsContent key={table.key} value={table.key}>
                {table.description && <p className='text-sm text-gray-500 mb-4'>{table.description}</p>}
                <DynamicTable
                  config={table.config}
                  form={form}
                  isEditable={isEditing}
                  fieldName={`tableData.${table.key}`}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )
    }

    return null
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className={cn(styles["dynamic-form"], "space-y-6 md:space-y-8 pb-2")}>
        {/* 表单标题 */}
        <div
          className={cn(styles["form-card"], "flex flex-col md:flex-row md:justify-between md:items-center pb-4 gap-4")}
        >
          <div>
            <h1 className={cn(styles["form-title"])}>{metadata.title}</h1>
            <div className='mb-2 flex items-center'>
              <span className='text-xs text-gray-600'>表单编号：</span>
              <OrderNumberField
                form={form}
                prefix={orderNumberConfig.prefix}
                fieldName={orderNumberConfig.fieldName}
                label={orderNumberConfig.label}
                disabled={!isEditing}
                isUpdating={isUpdating}
              />
            </div>
          </div>
          <div className='flex gap-2 flex-wrap'>
            {metadata.permissions?.print && (
              <Button
                variant='flat'
                color='primary'
                onClick={handlePrint}
                className={cn(styles["button"], styles["button-primary"], "w-full md:w-auto")}
              >
                <Icon icon='mdi:printer' className='w-4 h-4' />
                <span className='hidden md:inline ml-1'>打印</span>
              </Button>
            )}
            {metadata.permissions?.edit && (
              <Button
                variant='bordered'
                color={isEditing ? "warning" : "primary"}
                className={cn(styles["button"], "w-full md:w-auto")}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Icon icon={isEditing ? "mdi:pencil-off" : "mdi:pencil"} className='w-4 h-4' />
                <span className='hidden md:inline ml-1'>{isEditing ? "取消填写" : "填写表单"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div className={cn(styles["form-card"])}>
          <h2 className={cn(styles["form-title"])}>基本信息</h2>
          <DynamicFormFields fields={renderConfig.basicFields} form={form} isEditable={isEditing} />
        </div>

        {/* 表格 */}
        {renderTables()}

        {/* 流程确认 */}
        {renderConfig.processSteps && (
          <div className={cn(styles["form-card"])}>
            <h2 className={cn(styles["form-title"])}>流程确认</h2>
            <DynamicProcessConfirm steps={renderConfig.processSteps} form={form} isEditable={isEditing} />
          </div>
        )}

        {/* 操作按钮 */}
        {isEditing && (
          <div className={cn(styles["form-card"], "flex flex-col md:flex-row md:justify-end gap-4 pt-4 border-t")}>
            {onCancel && (
              <Button
                variant='flat'
                color='default'
                onClick={onCancel}
                className={cn(styles["button"], "w-full md:w-auto order-2 md:order-1")}
              >
                <Icon icon='mdi:close' className='w-4 h-4' />
                <span className='hidden md:inline ml-1'>取消</span>
              </Button>
            )}
            <Button
              type='submit'
              color='primary'
              className={cn(styles["button"], styles["button-primary"], "w-full md:w-auto order-1 md:order-2")}
            >
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
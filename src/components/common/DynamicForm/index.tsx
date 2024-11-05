import React, { useState, useRef, useCallback } from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { DynamicFormProps } from "./types"
import { useDynamicForm } from "./hooks/useDynamicForm"
import DynamicFormFields from "./components/DynamicFormFields"
import DynamicTable from "./components/Table"
import DynamicProcessConfirm from "./components/ProcessConfirm"
import OrderNumberField from "../OrderNumberField"
import message from "@/components/Message"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import PrintableTemplate from "./components/PrintableTemplate"
import { useReactToPrint } from "react-to-print"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ValidationManager } from "./validation/ValidationManager"
import { cn } from "@/theme/cn"

const DynamicForm: React.FC<DynamicFormProps> = ({ config, id, onSubmit, onCancel }) => {
  const { form, handleSubmit, validateForm } = useDynamicForm(config)
  const [isEditing, setIsEditing] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    required?: string[]
    invalid?: string[]
    other?: string[]
  }>({})
  const printRef = useRef<HTMLDivElement>(null)
  const printId = useRef<string>()

  // 使用 useMetadata hook 处理数据
  const { create: createMetadata, update: updateMetadata } = useMetadata(config.metadata?.type || "form")

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
      setShowPrintPreview(false)
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
        await handleSubmit(async (values) => {
          const validationResult = await ValidationManager.validateForm(values, config)
          if (!validationResult.valid) {
            if (validationResult.categorizedErrors) {
              setValidationErrors(validationResult.categorizedErrors)
            }
            return
          } else {
            setValidationErrors({})
          }

          if (validationResult.warnings && validationResult.warnings.length > 0) {
            const confirmed = window.confirm(`警告:\n${validationResult.warnings.join("\n")}\n\n是否继续提交？`)
            if (!confirmed) {
              return
            }
          }

          if (onSubmit) {
            await onSubmit(values)
            message.success("提交成功")
            setIsEditing(false)
            return
          }

          const orderNumberFieldName = config.orderNumberConfig?.fieldName || "orderNumber"
          const orderNumber = values[orderNumberFieldName]

          if (id) {
            const result = await updateMetadata(id, {
              title: orderNumber || config.metadata.title,
              status: "submitted",
              data: values,
            })
            if (result) {
              message.success("更新成功")
              setIsEditing(false)
            } else {
              throw new Error("更新失败")
            }
          } else {
            const result = await createMetadata({
              title: orderNumber || config.metadata.title,
              status: "submitted",
              data: values,
            })
            if (result) {
              message.success("创建成功")
              setIsEditing(false)
            } else {
              throw new Error("创建失败")
            }
          }
        })
      } catch (error) {
        console.error("Form submission error:", error)
        message.error("提交失败，请重试")
      }
    },
    [config, handleSubmit, id, onSubmit, updateMetadata, createMetadata]
  )

  const { metadata, renderConfig } = config

  const orderNumberConfig = {
    prefix: config.orderNumberConfig?.prefix || "ORDER",
    fieldName: config.orderNumberConfig?.fieldName || "orderNumber",
    label: config.orderNumberConfig?.label || "订单编号",
  }

  const renderValidationErrors = () => {
    if (!Object.keys(validationErrors).length) return null

    return (
      <div className="space-y-4 mb-6">
        {validationErrors.required && validationErrors.required.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle className="flex items-center gap-2">
              <Icon icon="mdi:alert-circle" className="w-5 h-5" />
              必填项未填写
            </AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2">
                {validationErrors.required.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validationErrors.invalid && validationErrors.invalid.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle className="flex items-center gap-2">
              <Icon icon="mdi:alert-circle" className="w-5 h-5" />
              格式错误
            </AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2">
                {validationErrors.invalid.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validationErrors.other && validationErrors.other.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle className="flex items-center gap-2">
              <Icon icon="mdi:alert-circle" className="w-5 h-5" />
              其他错误
            </AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2">
                {validationErrors.other.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* 表单标题 */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{metadata.title}</h1>
            {metadata.description && (
              <p className="text-gray-500 mt-1 text-sm">{metadata.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {metadata.permissions?.print && (
              <Button
                variant="flat"
                color="primary"
                onClick={() => setShowPrintPreview(true)}
                className="gap-2 font-medium"
              >
                <Icon icon="mdi:printer" className="w-4 h-4" />
                打印预览
              </Button>
            )}
            {metadata.permissions?.edit && (
              <Button
                variant="flat"
                color={isEditing ? "warning" : "primary"}
                className="gap-2 font-medium"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Icon icon={isEditing ? "mdi:pencil-off" : "mdi:pencil"} className="w-4 h-4" />
                {isEditing ? "取消编辑" : "编辑"}
              </Button>
            )}
          </div>
        </div>

        {/* 验证错误信息展示 */}
        {renderValidationErrors()}

        {/* 基本信息 */}
        <div className={cn(
          "bg-white rounded-lg p-6 shadow-sm",
          "border border-gray-100",
          "hover:border-gray-200 transition-colors"
        )}>
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">基本信息</h2>
          <div className="grid grid-cols-2 gap-6 mb-2">
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
          <div className={cn(
            "bg-white rounded-lg p-6 shadow-sm",
            "border border-gray-100",
            "hover:border-gray-200 transition-colors"
          )}>
            <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">明细信息</h2>
            <DynamicTable config={renderConfig.table} form={form} isEditable={isEditing} fieldName="tableData" />
          </div>
        )}

        {/* 流程确认 */}
        {renderConfig.processSteps && (
          <div className={cn(
            "bg-white rounded-lg p-6 shadow-sm",
            "border border-gray-100",
            "hover:border-gray-200 transition-colors"
          )}>
            <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">流程确认</h2>
            <DynamicProcessConfirm steps={renderConfig.processSteps} form={form} isEditable={isEditing} />
          </div>
        )}

        {/* 操作按钮 */}
        {isEditing && (
          <div className="flex justify-end gap-4 pt-4 border-t">
            {onCancel && (
              <Button
                variant="flat"
                color="default"
                onClick={onCancel}
                className="gap-2 font-medium"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
                取消
              </Button>
            )}
            <Button 
              type="submit" 
              color="primary"
              className="gap-2 font-medium shadow-sm hover:shadow-md transition-shadow"
            >
              <Icon icon="mdi:content-save" className="w-4 h-4" />
              保存
            </Button>
          </div>
        )}
      </form>

      {/* 打印预览对话框 */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">打印预览</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <PrintableTemplate ref={printRef} config={config} data={form.getValues()} />
          </div>
          <DialogFooter className="flex justify-between items-center border-t pt-4">
            <Button variant="flat" color="default" onClick={() => setShowPrintPreview(false)}>
              关闭
            </Button>
            <Button onClick={handlePrint} className="gap-2" color="primary">
              <Icon icon="mdi:printer" className="w-4 h-4" />
              打印
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  )
}

export default DynamicForm
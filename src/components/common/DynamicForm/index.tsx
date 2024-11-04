import React, { useState, useRef, useCallback } from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { DynamicFormProps } from "./types"
import { useDynamicForm } from "./hooks/useDynamicForm"
import DynamicFormFields from "./components/DynamicFormFields"
import DynamicTable from "./components/DynamicTable"
import DynamicProcessConfirm from "./components/DynamicProcessConfirm"
import OrderNumberField from "../OrderNumberField"
import message from "@/components/Message"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import PrintableTemplate from "./components/PrintableTemplate"
import { useReactToPrint } from "react-to-print"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const DynamicForm: React.FC<DynamicFormProps> = ({ config, id, onSubmit, onCancel }) => {
  const { form, handleSubmit, validateForm } = useDynamicForm(config)
  const [isEditing, setIsEditing] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    required?: string[];
    invalid?: string[];
    other?: string[];
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

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // 使用 handleSubmit 包装提交函数,并在提交前进行校验
      await handleSubmit(async (values) => {
        // 先进行表单校验
        const validationResult = await validateForm({ mode: 'submit' })
        if (!validationResult.valid) {
          if (validationResult.categorizedErrors) {
            setValidationErrors(validationResult.categorizedErrors)
          }
          return
        } else {
          setValidationErrors({})
        }

        // 如果有警告信息，显示确认对话框
        if (validationResult.warnings && validationResult.warnings.length > 0) {
          const confirmed = window.confirm(
            `警告:\n${validationResult.warnings.join("\n")}\n\n是否继续提交？`
          )
          if (!confirmed) {
            return
          }
        }

        // 如果提供了自定义的 onSubmit，优先使用它
        if (onSubmit) {
          await onSubmit(values)
          message.success("提交成功")
          setIsEditing(false)
          return
        }

        // 获取订单编号作为唯一标识
        const orderNumberFieldName = config.orderNumberConfig?.fieldName || "orderNumber"
        const orderNumber = values[orderNumberFieldName]

        // 使用内置的提交处理
        if (id) {
          // 更新现有数据
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
          // 创建新数据
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
  }, [config.metadata.title, config.orderNumberConfig?.fieldName, handleSubmit, id, onSubmit, updateMetadata, createMetadata, validateForm])

  // 动画配置
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const { metadata, renderConfig } = config

  // 默认的订单编号配置
  const orderNumberConfig = {
    prefix: config.orderNumberConfig?.prefix || "ORDER",
    fieldName: config.orderNumberConfig?.fieldName || "orderNumber",
    label: config.orderNumberConfig?.label || "订单编号",
  }

  // 渲染验证错误信息
  const renderValidationErrors = () => {
    if (!Object.keys(validationErrors).length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-4 mb-6"
      >
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
      </motion.div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className='space-y-8'>
        {/* 表单标题 */}
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold'>{metadata.title}</h1>
            {metadata.description && <p className='text-gray-500 mt-1'>{metadata.description}</p>}
          </div>
          <div className='flex gap-2'>
            {metadata.permissions?.print && (
              <Button
                variant='flat'
                color='primary'
                onClick={() => setShowPrintPreview(true)}
                startContent={<Icon icon='mdi:printer' className='w-4 h-4' />}
              >
                打印预览
              </Button>
            )}
            {metadata.permissions?.edit && (
              <Button
                variant='flat'
                color={isEditing ? 'warning' : 'primary'}
                startContent={<Icon icon={isEditing ? 'mdi:pencil-off' : 'mdi:pencil'} className='w-4 h-4' />}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '取消编辑' : '编辑'}
              </Button>
            )}
          </div>
        </div>

        {/* 验证错误信息展示 */}
        {renderValidationErrors()}

        {/* 基本信息 */}
        <motion.div
          variants={sectionVariants}
          initial='hidden'
          animate='visible'
          className='bg-white rounded-lg p-6 shadow-sm'
        >
          <h2 className='text-lg font-semibold mb-6'>基本信息</h2>
          <div className='grid grid-cols-2 gap-6 mb-2'>
            {/* 默认添加订单编号字段 */}
            <OrderNumberField
              form={form}
              prefix={orderNumberConfig.prefix}
              fieldName={orderNumberConfig.fieldName}
              label={orderNumberConfig.label}
              disabled={!isEditing}
            />
          </div>
          <DynamicFormFields fields={renderConfig.basicFields} form={form} isEditable={isEditing} />
        </motion.div>

        {/* 表格 */}
        {renderConfig.table && (
          <motion.div
            variants={sectionVariants}
            initial='hidden'
            animate='visible'
            className='bg-white rounded-lg p-6 shadow-sm'
          >
            <h2 className='text-lg font-semibold mb-6'>明细信息</h2>
            <DynamicTable
              config={renderConfig.table}
              form={form}
              isEditable={isEditing}
              fieldName='tableData'
            />
          </motion.div>
        )}

        {/* 流程确认 */}
        {renderConfig.processSteps && (
          <motion.div
            variants={sectionVariants}
            initial='hidden'
            animate='visible'
            className='bg-white rounded-lg p-6 shadow-sm'
          >
            <h2 className='text-lg font-semibold mb-6'>流程确认</h2>
            <DynamicProcessConfirm
              steps={renderConfig.processSteps}
              form={form}
              isEditable={isEditing}
            />
          </motion.div>
        )}

        {/* 操作按钮 */}
        {isEditing && (
          <motion.div variants={sectionVariants} initial='hidden' animate='visible' className='flex justify-end gap-4'>
            {onCancel && (
              <Button
                variant='flat'
                color='default'
                onClick={onCancel}
                startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
              >
                取消
              </Button>
            )}
            <Button type='submit' color='primary' startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}>
              保存
            </Button>
          </motion.div>
        )}
      </form>

      {/* 打印预览对话框 */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>打印预览</DialogTitle>
          </DialogHeader>
          <div className='max-h-[60vh] overflow-y-auto'>
            <PrintableTemplate ref={printRef} config={config} data={form.getValues()} />
          </div>
          <DialogFooter className='flex justify-between items-center'>
            <Button variant='flat' color='default' onClick={() => setShowPrintPreview(false)}>
              关闭
            </Button>
            <Button onClick={handlePrint} className='gap-2' color='primary'>
              <Icon icon='mdi:printer' className='w-4 h-4' />
              打印
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  )
}

export default DynamicForm
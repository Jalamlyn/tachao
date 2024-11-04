import React, { useRef, useState } from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { DynamicFormProps } from "./types"
import { useDynamicForm } from "./hooks/useDynamicForm"
import DynamicFormFields from "./components/DynamicFormFields"
import DynamicTable from "./components/DynamicTable"
import DynamicProcessConfirm from "./components/DynamicProcessConfirm"
import PrintableContent from "./components/PrintableContent"
import { useReactToPrint } from "react-to-print"
import message from "@/components/Message"
import OrderNumberField from "../OrderNumberField"
import { useMetadata } from "../../from-templates/hook/useMetadata"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { merge } from "lodash"

// 默认配置
const defaultConfig = {
  // 表单基础配置
  form: {
    layout: "vertical" as const,
    labelWidth: "120px",
    submitButton: {
      text: "保存",
      position: "right" as const,
    },
  },
  // 工具栏配置
  toolbar: {
    print: {
      enabled: true,
      text: "打印预览",
      icon: "mdi:printer",
    },
    save: {
      enabled: true,
      text: "保存",
      icon: "mdi:content-save",
    },
    edit: {
      enabled: true,
      text: "编辑",
      icon: "mdi:pencil",
    },
  },
  // 打印配置
  print: {
    documentTitle: "表单打印",
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
    template: {
      header: {
        title: "",
        subtitle: "",
        logo: "",
      },
      content: {
        fields: [],
        layout: "form" as const,
        columns: 2,
      },
      footer: {
        showPageNumber: true,
        showDate: true,
        customText: "",
      },
    },
  },
  // 订单号字段配置
  orderNumberField: {
    enabled: true,
    prefix: "ORDER",
    fieldName: "orderNumber",
    label: "订单编号",
  },
}

const DynamicForm: React.FC<DynamicFormProps> = ({ config, id }) => {
  // 合并配置
  const mergedConfig = merge({}, defaultConfig, config)

  const { form, loading } = useDynamicForm(mergedConfig)
  const printRef = useRef<HTMLDivElement>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const { create, update } = useMetadata("form")

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: mergedConfig.print?.documentTitle || "表单打印",
    pageStyle: mergedConfig.print?.pageStyle,
    onBeforePrint: async () => {
      return new Promise((resolve) => {
        const printId = message.loading("正在准备打印...")
        setTimeout(() => {
          message.closeLoading(printId)
          resolve()
        }, 500)
      })
    },
    onAfterPrint: () => {
      message.success("打印完成")
      setShowPrintPreview(false)
    },
    onPrintError: (error) => {
      console.error("Print error:", error)
      message.error("打印失败，请重试")
    },
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const values = form.getValues()

      if (id) {
        // 更新表单
        await update(id, {
          ...values,
          id,
          updatedAt: new Date().toISOString(),
        })
        message.success("表单更新成功")
        setIsEditMode(false)
      } else {
        // 创建新表单
        await create({
          ...values,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        message.success("表单创建成功")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      message.error("提交表单失败")
    }
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Icon icon='mdi:loading' className='w-8 h-8 animate-spin' />
      </div>
    )
  }

  const currentIsEditable = isEditMode

  return (
    <Form {...form}>
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleFormSubmit}
        className='space-y-8'
      >
        <AnimatePresence>
          {/* Order Number Field */}
          {mergedConfig.orderNumberField?.enabled && (
            <motion.div variants={sectionVariants}>
              <OrderNumberField
                form={form}
                prefix={mergedConfig.orderNumberField.prefix}
                fieldName={mergedConfig.orderNumberField.fieldName}
                label={mergedConfig.orderNumberField.label}
                disabled={!currentIsEditable}
              />
            </motion.div>
          )}

          {/* Form Fields */}
          {Object.entries(mergedConfig.formFields || {}).map(([section, fields]) => (
            <motion.div key={section} variants={sectionVariants} className='bg-white rounded-lg p-6 shadow-sm'>
              <h2 className='text-lg font-semibold mb-6'>{section}</h2>
              <DynamicFormFields fields={fields} form={form} isEditable={currentIsEditable} />
            </motion.div>
          ))}

          {/* Table */}
          {mergedConfig.table && (
            <motion.div variants={sectionVariants} className='bg-white rounded-lg p-6 shadow-sm overflow-hidden'>
              <DynamicTable
                config={mergedConfig.table}
                form={form}
                isEditable={currentIsEditable}
                fieldName='tableData'
              />
            </motion.div>
          )}

          {/* Process Steps */}
          {mergedConfig.processSteps && (
            <motion.div variants={sectionVariants} className='bg-white rounded-lg p-6 shadow-sm'>
              <DynamicProcessConfirm steps={mergedConfig.processSteps} form={form} isEditable={currentIsEditable} />
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            variants={sectionVariants}
            className={`flex ${
              mergedConfig.form?.submitButton?.position === "center"
                ? "justify-center"
                : mergedConfig.form?.submitButton?.position === "right"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div className='flex gap-4'>
              {/* Edit Button */}
              {mergedConfig.toolbar.edit.enabled && (
                <Button
                  color='primary'
                  variant='flat'
                  onClick={toggleEditMode}
                  startContent={<Icon icon={isEditMode ? "mdi:close" : "mdi:pencil"} className='w-4 h-4' />}
                >
                  {isEditMode ? "取消编辑" : "编辑"}
                </Button>
              )}

              {/* Submit Button */}
              {currentIsEditable && mergedConfig.toolbar.save.enabled && (
                <Button
                  type='submit'
                  color='primary'
                  startContent={<Icon icon={mergedConfig.toolbar.save.icon} className='w-4 h-4' />}
                >
                  {mergedConfig.toolbar.save.text}
                </Button>
              )}

              {/* Print Button */}
              {mergedConfig.toolbar.print.enabled && (
                <Button
                  color='primary'
                  variant='flat'
                  onClick={() => setShowPrintPreview(true)}
                  startContent={<Icon icon={mergedConfig.toolbar.print.icon} className='w-4 h-4' />}
                >
                  {mergedConfig.toolbar.print.text}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.form>

      {/* Print Preview Dialog */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>打印预览</DialogTitle>
          </DialogHeader>
          <div className='max-h-[60vh] overflow-y-auto'>
            <PrintableContent ref={printRef} formData={form.getValues()} />
          </div>
          <DialogFooter className='flex justify-between items-center'>
            <Button variant='outline' onClick={() => setShowPrintPreview(false)}>
              关闭
            </Button>
            <Button onClick={handlePrint} className='gap-2'>
              <Icon icon='mdi:printer' className='w-4 h-4' />
              打印
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  )
}

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

export default DynamicForm
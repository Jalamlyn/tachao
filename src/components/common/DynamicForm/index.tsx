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

const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  id,
}) => {
  const { form, loading } = useDynamicForm(config)
  const printRef = useRef<HTMLDivElement>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const { create, update } = useMetadata('form')

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: config.print?.documentTitle || "表单打印",
    pageStyle: config.print?.pageStyle,
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
      // 执行表单验证
      const result = await form.trigger()
      if (!result) {
        const errors = Object.entries(form.formState.errors)
          .map(([key, error]) => {
            const fieldName = key.split('.').pop() // 获取字段名
            const fieldConfig = Object.values(config.formFields || {})
              .flat()
              .find((field: any) => field.name === fieldName)
            const label = fieldConfig?.label || fieldName
            const errorMessage = typeof error.message === 'string' ? error.message : '验证失败'
            return `${label}: ${errorMessage}`
          })
          .filter(Boolean)
        
        if (errors.length > 0) {
          message.error(
            <div className='space-y-1'>
              <div className='font-medium'>表单验证失败:</div>
              {errors.map((error, index) => (
                <div key={index} className='flex items-start text-sm'>
                  <span className='mr-2'>•</span>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )
          return
        }
      }

      const values = form.getValues()

      if (id) {
        // 更新表单
        await update(id, {
          ...values,
          id,
          updatedAt: new Date().toISOString()
        })
        message.success("表单更新成功")
        setIsEditMode(false)
      } else {
        // 创建新表单
        await create({
          ...values,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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

  const currentIsEditable = id ? isEditMode : true

  return (
    <Form {...form}>
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleFormSubmit}
        className="space-y-8"
      >
        <AnimatePresence>
          {/* Order Number Field */}
          {config.orderNumberField && (
            <motion.div variants={sectionVariants}>
              <OrderNumberField
                form={form}
                prefix={config.orderNumberField.prefix}
                fieldName={config.orderNumberField.fieldName || "orderNumber"}
                label={config.orderNumberField.label}
                disabled={!currentIsEditable}
              />
            </motion.div>
          )}

          {/* Form Fields */}
          {Object.entries(config.formFields).map(([section, fields]) => (
            <motion.div
              key={section}
              variants={sectionVariants}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-6">{section}</h2>
              <DynamicFormFields fields={fields} form={form} isEditable={currentIsEditable} />
            </motion.div>
          ))}

          {/* Table */}
          {config.table && (
            <motion.div
              variants={sectionVariants}
              className="bg-white rounded-lg p-6 shadow-sm overflow-hidden"
            >
              <DynamicTable
                config={config.table}
                form={form}
                isEditable={currentIsEditable}
                fieldName="tableData"
              />
            </motion.div>
          )}

          {/* Process Steps */}
          {config.processSteps && (
            <motion.div variants={sectionVariants} className="bg-white rounded-lg p-6 shadow-sm">
              <DynamicProcessConfirm
                steps={config.processSteps}
                form={form}
                isEditable={currentIsEditable}
              />
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            variants={sectionVariants}
            className={`flex ${
              config.form?.submitButton?.position === "center"
                ? "justify-center"
                : config.form?.submitButton?.position === "right"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div className="flex gap-4">
              {/* Edit Button */}
              {id && !currentIsEditable && (
                <Button
                  color="primary"
                  variant="flat"
                  onClick={toggleEditMode}
                  startContent={<Icon icon="mdi:pencil" className="w-4 h-4" />}
                >
                  编辑
                </Button>
              )}

              {/* Submit Button */}
              {currentIsEditable && (
                <Button
                  type="submit"
                  color="primary"
                  startContent={<Icon icon="mdi:content-save" className="w-4 h-4" />}
                >
                  {config.form?.submitButton?.text || (id ? "保存" : "创建")}
                </Button>
              )}

              {/* Print Button */}
              {!currentIsEditable && (
                <Button
                  color="primary"
                  variant="flat"
                  onClick={() => setShowPrintPreview(true)}
                  startContent={<Icon icon="mdi:printer" className="w-4 h-4" />}
                >
                  打印预览
                </Button>
              )}

              {/* Cancel Edit Button */}
              {id && currentIsEditable && (
                <Button
                  color="danger"
                  variant="flat"
                  onClick={toggleEditMode}
                  startContent={<Icon icon="mdi:close" className="w-4 h-4" />}
                >
                  取消编辑
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
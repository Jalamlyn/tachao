import React, { useRef } from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { DynamicFormProps } from "./types"
import { useDynamicForm } from "./hooks/useDynamicForm"
import DynamicFormFields from "./components/DynamicFormFields"
import DynamicTable from "./components/DynamicTable"
import DynamicProcessConfirm from "./components/DynamicProcessConfirm"
import { useReactToPrint } from "react-to-print"
import message from "@/components/Message"

const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  initialValues,
  onSubmit,
  onValuesChange,
  isEditable = true,
}) => {
  const { form, handleSubmit } = useDynamicForm(config, initialValues, onValuesChange)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: config.print?.documentTitle,
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
    },
    onPrintError: (error) => {
      console.error("Print error:", error)
      message.error("打印失败，请重试")
    },
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      try {
        const values = form.getValues()
        await onSubmit(values)
      } catch (error) {
        console.error("Form submission error:", error)
        throw error
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
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

  return (
    <Form {...form}>
      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleFormSubmit}
        className="space-y-8"
      >
        <AnimatePresence>
          {/* Form Fields */}
          {Object.entries(config.formFields).map(([section, fields]) => (
            <motion.div
              key={section}
              variants={sectionVariants}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-6">{section}</h2>
              <DynamicFormFields fields={fields} form={form} isEditable={isEditable} />
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
                isEditable={isEditable}
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
                isEditable={isEditable}
              />
            </motion.div>
          )}

          {/* Print Content */}
          {config.print && (
            <div style={{ display: "none" }}>
              <div ref={printRef}>
                {config.print.template && (
                  <div className="p-8">
                    {/* Header */}
                    {config.print.template.header && (
                      <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold">{config.print.template.header.title}</h1>
                        {config.print.template.header.subtitle && (
                          <div className="mt-2">{config.print.template.header.subtitle}</div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    {config.print.template.content && (
                      <div
                        className={`grid gap-4 ${
                          config.print.template.content.columns
                            ? `grid-cols-${config.print.template.content.columns}`
                            : "grid-cols-1"
                        }`}
                      >
                        {config.print.template.content.fields?.map((fieldName) => {
                          const value = form.getValues(fieldName)
                          return (
                            <div key={fieldName} className="flex justify-between">
                              <span className="font-medium">{fieldName}:</span>
                              <span>{value}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Footer */}
                    {config.print.template.footer && (
                      <div className="mt-8 text-sm">
                        {config.print.template.footer.customText && (
                          <div>{config.print.template.footer.customText}</div>
                        )}
                        {config.print.template.footer.showDate && (
                          <div className="mt-2">
                            日期：{new Date().toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {isEditable && onSubmit && (
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
                <Button type="submit" className="gap-2">
                  <Icon icon="mdi:content-save" className="w-4 h-4" />
                  {config.form?.submitButton?.text || "保存"}
                </Button>
                {config.print && (
                  <Button type="button" variant="outline" onClick={handlePrint} className="gap-2">
                    <Icon icon="mdi:printer" className="w-4 h-4" />
                    打印
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </Form>
  )
}

export default DynamicForm
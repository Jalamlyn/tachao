import React from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { DynamicFormProps } from "./types"
import { useDynamicForm } from "./hooks/useDynamicForm"
import DynamicFormFields from "./components/DynamicFormFields"
import DynamicTable from "./components/DynamicTable"
import DynamicProcessConfirm from "./components/DynamicProcessConfirm"

const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  initialValues,
  onSubmit,
  onValuesChange,
  isEditable = true,
}) => {
  const { form, handleSubmit } = useDynamicForm(config, initialValues, onValuesChange)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      await handleSubmit(onSubmit)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
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
        {/* Render form sections */}
        <AnimatePresence>
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
        </AnimatePresence>

        {/* Render table if exists */}
        {config.table && (
          <motion.div
            variants={sectionVariants}
            className="bg-white rounded-lg p-6 shadow-sm overflow-hidden"
          >
            <DynamicTable config={config.table} form={form} isEditable={isEditable} fieldName="tableData" />
          </motion.div>
        )}

        {/* Render process steps if exists */}
        {config.processSteps && (
          <motion.div
            variants={sectionVariants}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <DynamicProcessConfirm steps={config.processSteps} form={form} isEditable={isEditable} />
          </motion.div>
        )}

        {/* Submit button */}
        {isEditable && onSubmit && (
          <motion.div
            variants={sectionVariants}
            className="flex justify-end sticky bottom-4 z-10"
          >
            <Button
              type="submit"
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <Icon icon="mdi:content-save" className="w-4 h-4" />
              保存
            </Button>
          </motion.div>
        )}
      </motion.form>
    </Form>
  )
}

export default DynamicForm
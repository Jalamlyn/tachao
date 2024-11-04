import React from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { DynamicFormProps } from "./types"
import { useDynamicForm } from "./hooks/useDynamicForm"
import DynamicFormFields from "./components/DynamicFormFields"
import DynamicTable from "./components/DynamicTable"
import DynamicProcessConfirm from "./components/DynamicProcessConfirm"
import message from "@/components/Message"

const DynamicForm: React.FC<DynamicFormProps> = ({ config, id, onSubmit, onCancel }) => {
  const { form } = useDynamicForm(config)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const values = form.getValues()
      if (onSubmit) {
        await onSubmit(values)
        message.success("提交成功")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      message.error("提交失败")
    }
  }

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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 表单标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{metadata.title}</h1>
            {metadata.description && (
              <p className="text-gray-500 mt-1">{metadata.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {metadata.permissions?.print && (
              <Button
                variant="flat"
                color="primary"
                startContent={<Icon icon="mdi:printer" className="w-4 h-4" />}
              >
                打印
              </Button>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold mb-6">基本信息</h2>
          <DynamicFormFields
            fields={renderConfig.basicFields}
            form={form}
            isEditable={metadata.permissions?.edit}
          />
        </motion.div>

        {/* 表格 */}
        {renderConfig.table && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-6">明细信息</h2>
            <DynamicTable
              config={renderConfig.table}
              form={form}
              isEditable={metadata.permissions?.edit}
              fieldName="tableData"
            />
          </motion.div>
        )}

        {/* 流程确认 */}
        {renderConfig.processSteps && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-6">流程确认</h2>
            <DynamicProcessConfirm
              steps={renderConfig.processSteps}
              form={form}
              isEditable={metadata.permissions?.edit}
            />
          </motion.div>
        )}

        {/* 操作按钮 */}
        {metadata.permissions?.edit && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-end gap-4"
          >
            {onCancel && (
              <Button
                variant="flat"
                color="default"
                onClick={onCancel}
                startContent={<Icon icon="mdi:close" className="w-4 h-4" />}
              >
                取消
              </Button>
            )}
            <Button
              type="submit"
              color="primary"
              startContent={<Icon icon="mdi:content-save" className="w-4 h-4" />}
            >
              保存
            </Button>
          </motion.div>
        )}
      </form>
    </Form>
  )
}

export default DynamicForm
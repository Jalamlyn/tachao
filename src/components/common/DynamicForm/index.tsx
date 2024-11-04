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
import OrderNumberField from "../OrderNumberField"
import message from "@/components/Message"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"

const DynamicForm: React.FC<DynamicFormProps> = ({ config, id, onSubmit, onCancel }) => {
  const { form } = useDynamicForm(config)
  
  // 使用 useMetadata hook 处理数据
  const { create: createMetadata, update: updateMetadata } = useMetadata(
    config.metadata?.type || "form"
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const values = form.getValues()
      
      // 获取订单编号作为唯一标识
      const orderNumberFieldName = config.orderNumberConfig?.fieldName || "orderNumber"
      const orderNumber = values[orderNumberFieldName]
      
      // 如果提供了自定义的 onSubmit，优先使用它
      if (onSubmit) {
        await onSubmit(values)
        message.success("提交成功")
        return
      }

      // 使用内置的提交处理
      if (id) {
        // 更新现有数据
        const result = await updateMetadata(id, {
          title: orderNumber || config.metadata.title, // 使用订单编号作为标题
          status: "submitted",
          data: values
        })
        if (result) {
          message.success("更新成功")
        } else {
          throw new Error("更新失败")
        }
      } else {
        // 创建新数据
        const result = await createMetadata({
          title: orderNumber || config.metadata.title, // 使用订单编号作为标题
          status: "submitted",
          data: values
        })
        if (result) {
          message.success("创建成功")
        } else {
          throw new Error("创建失败")
        }
      }
    } catch (error) {
      console.error("Form submission error:", error)
      message.error(error instanceof Error ? error.message : "提交失败")
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

  // 默认的订单编号配置
  const orderNumberConfig = {
    prefix: config.orderNumberConfig?.prefix || "ORDER",
    fieldName: config.orderNumberConfig?.fieldName || "orderNumber",
    label: config.orderNumberConfig?.label || "订单编号"
  }

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
          <div className="grid grid-cols-2 gap-6">
            {/* 默认添加订单编号字段 */}
            <OrderNumberField
              form={form}
              prefix={orderNumberConfig.prefix}
              fieldName={orderNumberConfig.fieldName}
              label={orderNumberConfig.label}
              disabled={!metadata.permissions?.edit}
            />
          </div>
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
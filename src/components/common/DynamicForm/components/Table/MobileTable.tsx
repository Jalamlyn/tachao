import React from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { TableColumn } from "../../types"
import TableCell from "./TableCell"
import { UseFormReturn } from "react-hook-form"

interface MobileTableProps {
  columns: TableColumn[]
  fieldName: string
  form: UseFormReturn<any>
  isEditable?: boolean
  fields: any[]
  onDelete?: (index: number) => void
  onValueChange?: (rowIndex: number, columnKey: string, value: any) => void
}

const MobileTable: React.FC<MobileTableProps> = ({
  columns,
  fieldName,
  form,
  isEditable = true,
  fields,
  onDelete,
  onValueChange,
}) => {
  // 动画配置
  const cardVariants = {
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
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 md:hidden"
    >
      <AnimatePresence mode="popLayout">
        {fields.map((field, rowIndex) => (
          <motion.div
            key={field.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className="bg-white rounded-lg shadow-sm p-4 space-y-3"
          >
            {columns.map((column) => (
              <div key={column.key} className="space-y-1">
                <div className="text-sm font-medium text-gray-500">{column.title}</div>
                <div>
                  <TableCell
                    column={column}
                    rowIndex={rowIndex}
                    fieldName={fieldName}
                    form={form}
                    isEditable={isEditable}
                    onValueChange={(value) => onValueChange?.(rowIndex, column.key, value)}
                  />
                </div>
              </div>
            ))}
            {isEditable && (
              <div className="pt-2 flex justify-end">
                <Button
                  isIconOnly
                  color="danger"
                  variant="light"
                  size="sm"
                  onClick={() => onDelete?.(rowIndex)}
                >
                  <Icon icon="mdi:delete" className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default MobileTable
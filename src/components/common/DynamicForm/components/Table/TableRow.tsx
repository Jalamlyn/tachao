import React from "react"
import { TableCell as UITableCell, TableRow as UITableRow } from "@/components/ui/table"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { TableColumn } from "../../types"
import TableCell from "./TableCell"
import { UseFormReturn } from "react-hook-form"

interface TableRowProps {
  columns: TableColumn[]
  rowIndex: number
  fieldName: string
  form: UseFormReturn<any>
  isEditable?: boolean
  onDelete?: () => void
  onValueChange?: (columnKey: string, value: any) => void
}

const TableRow: React.FC<TableRowProps> = ({
  columns,
  rowIndex,
  fieldName,
  form,
  isEditable = true,
  onDelete,
  onValueChange,
}) => {
  // 动画配置
  const rowVariants = {
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

  return (
    <motion.tr
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      component={UITableRow}
    >
      {columns.map((column) => (
        <UITableCell key={column.key}>
          <TableCell
            column={column}
            rowIndex={rowIndex}
            fieldName={fieldName}
            form={form}
            isEditable={isEditable}
            onValueChange={(value) => onValueChange?.(column.key, value)}
          />
        </UITableCell>
      ))}
      {isEditable && (
        <UITableCell>
          <Button
            isIconOnly
            color="danger"
            variant="light"
            size="sm"
            onClick={onDelete}
          >
            <Icon icon="mdi:delete" className="w-4 h-4" />
          </Button>
        </UITableCell>
      )}
    </motion.tr>
  )
}

export default TableRow
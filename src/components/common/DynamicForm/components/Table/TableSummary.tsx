import React from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { TableSummary as TableSummaryType } from "../../types"

interface TableSummaryProps {
  summary: TableSummaryType
  data: any[]
  columnsCount: number
  isEditable?: boolean
}

const TableSummary: React.FC<TableSummaryProps> = ({
  summary,
  data,
  columnsCount,
  isEditable = true,
}) => {
  // 动画配置
  const summaryVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  }

  const calculateSummary = (field: string, calculate: (records: any[]) => number | string) => {
    try {
      return calculate(data)
    } catch (error) {
      console.error(`Error calculating summary for ${field}:`, error)
      return 0
    }
  }

  return (
    <motion.tr
      variants={summaryVariants}
      initial="hidden"
      animate="visible"
      component={TableRow}
    >
      <TableCell colSpan={columnsCount + (isEditable ? 1 : 0)}>
        <div className="space-y-2">
          {Object.entries(summary.fields).map(([key, { label, calculate }]) => {
            const value = calculateSummary(key, calculate)
            
            return (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{label}:</span>
                <span className="font-mono">
                  {typeof value === "number" ? value.toFixed(2) : value}
                </span>
              </div>
            )
          })}
        </div>
      </TableCell>
    </motion.tr>
  )
}

export default TableSummary
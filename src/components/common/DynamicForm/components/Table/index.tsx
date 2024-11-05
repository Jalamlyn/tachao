import React, { useCallback } from "react"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { TableConfig } from "../../types"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import TableRow from "./TableRow"
import TableSummary from "./TableSummary"
import MobileTable from "./MobileTable"

interface DynamicTableProps {
  config: TableConfig
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName: string
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  config,
  form,
  isEditable = true,
  fieldName,
}) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName,
  })

  // 添加新行
  const handleAddRow = useCallback(() => {
    const newRow = config.columns.reduce((acc, column) => {
      switch (column.type) {
        case "number":
          acc[column.key] = 0
          break
        case "select":
          acc[column.key] = column.options?.[0]?.value || ""
          break
        case "date":
        case "datetime":
          acc[column.key] = ""
          break
        default:
          acc[column.key] = ""
      }
      return acc
    }, {} as Record<string, any>)

    append(newRow)
  }, [config.columns, append])

  // 删除行
  const handleDeleteRow = useCallback(
    (index: number) => {
      remove(index)
    },
    [remove]
  )

  // 处理字段值变化
  const handleValueChange = useCallback(
    (rowIndex: number, columnKey: string, value: any) => {
      if (config.rowCalculations) {
        const row = form.getValues(`${fieldName}.${rowIndex}`)
        Object.entries(config.rowCalculations).forEach(([field, calculate]) => {
          try {
            const calculatedValue = calculate({ ...row, [columnKey]: value })
            form.setValue(`${fieldName}.${rowIndex}.${field}`, calculatedValue)
          } catch (error) {
            console.error(`Error calculating field ${field}:`, error)
          }
        })
      }
    },
    [config.rowCalculations, fieldName, form]
  )

  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* 桌面端表格 */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((column) => (
                <TableHead key={column.key} style={{ width: column.width }}>
                  {column.title}
                </TableHead>
              ))}
              {isEditable && <TableHead>操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow
                key={field.id}
                columns={config.columns}
                rowIndex={index}
                fieldName={fieldName}
                form={form}
                isEditable={isEditable}
                onDelete={() => handleDeleteRow(index)}
                onValueChange={(columnKey, value) =>
                  handleValueChange(index, columnKey, value)
                }
              />
            ))}
            {config.summary && (
              <TableSummary
                summary={config.summary}
                data={form.getValues(fieldName) || []}
                columnsCount={config.columns.length}
                isEditable={isEditable}
              />
            )}
          </TableBody>
        </Table>
      </div>

      {/* 移动端表格 */}
      <MobileTable
        columns={config.columns}
        fieldName={fieldName}
        form={form}
        isEditable={isEditable}
        fields={fields}
        onDelete={handleDeleteRow}
        onValueChange={handleValueChange}
      />

      {/* 添加行按钮 */}
      {isEditable && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onClick={handleAddRow}
            startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
            className="w-full md:w-auto"
          >
            添加行
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default DynamicTable
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { TableConfig } from "../../types"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import DTableRow from "./TableRow"
import TableSummary from "./TableSummary"
import MobileTable from "./MobileTable"
import message from "@/components/Message"

interface DynamicTableProps {
  config: TableConfig
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName: string
}

const DynamicTable: React.FC<DynamicTableProps> = ({ config, form, isEditable = true, fieldName }) => {
  // 使用 ref 来存储删除的行，以便在需要时恢复
  const deletedRowsRef = useRef<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName,
    keyName: "id"
  })

  // 监控字段变化
  useEffect(() => {
    console.log('Current table fields:', fields)
  }, [fields])

  // 生成新行数据
  const generateNewRow = useCallback(() => {
    return config.columns.reduce((acc, column) => {
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
  }, [config.columns])

  // 添加新行
  const handleAddRow = useCallback(async () => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      
      // 检查是否有最大行数限制
      const maxRows = config.maxRows || 100
      if (fields.length >= maxRows) {
        message.warning(`最多只能添加${maxRows}行`)
        return
      }

      const newRow = {
        ...generateNewRow(),
        id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        rowIndex: fields.length + 1
      }

      console.log('Adding new row:', newRow)
      await append(newRow)
      await form.trigger(`${fieldName}`)

    } finally {
      setIsProcessing(false)
    }
  }, [config.maxRows, fields.length, generateNewRow, append, form, fieldName, isProcessing])

  // 删除行
  const handleDeleteRow = useCallback(
    async (index: number) => {
      if (isProcessing) return

      try {
        setIsProcessing(true)
        console.log('Deleting row at index:', index)
        
        // 保存被删除的行数据
        const deletedRow = fields[index]
        deletedRowsRef.current.push(deletedRow)

        // 如果保存的删除历史过多，只保留最近的50条
        if (deletedRowsRef.current.length > 50) {
          deletedRowsRef.current = deletedRowsRef.current.slice(-50)
        }

        await remove(index)
        await form.trigger(`${fieldName}`)

        // 更新所有行的索引
        const currentValues = form.getValues(fieldName)
        if (currentValues) {
          currentValues.forEach((row: any, idx: number) => {
            if (row) {
              form.setValue(`${fieldName}.${idx}.rowIndex`, idx + 1)
            }
          })
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [remove, form, fieldName, fields, isProcessing]
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
    <motion.div variants={containerVariants} initial='hidden' animate='visible'>
      {/* 桌面端表格 */}
      <div className='hidden md:block overflow-x-auto rounded-lg border border-gray-200'>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50/80">
              {config.columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  style={{ width: column.width }}
                  className="py-3 px-4 text-sm font-medium text-gray-700"
                >
                  {column.title}
                </TableHead>
              ))}
              {isEditable && <TableHead className="w-[100px]">操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 ? (
              <TableRow>
                <td 
                  colSpan={config.columns.length + (isEditable ? 1 : 0)}
                  className="text-center py-8 text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon icon="mdi:table-empty" className="w-8 h-8 text-gray-400" />
                    <span>暂无数据</span>
                  </div>
                </td>
              </TableRow>
            ) : (
              fields.map((field, index) => (
                <DTableRow
                  key={field.id}
                  columns={config.columns}
                  rowIndex={index}
                  fieldName={fieldName}
                  form={form}
                  isEditable={isEditable}
                  onDelete={() => handleDeleteRow(index)}
                  onValueChange={(columnKey, value) => handleValueChange(index, columnKey, value)}
                />
              ))
            )}
            {config.summary && fields.length > 0 && (
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
      <div className="md:hidden">
        <MobileTable
          columns={config.columns}
          fieldName={fieldName}
          form={form}
          isEditable={isEditable}
          fields={fields}
          onDelete={handleDeleteRow}
          onValueChange={handleValueChange}
        />
      </div>

      {/* 添加行按钮 */}
      {isEditable && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-4 flex justify-center md:justify-start"
        >
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onClick={handleAddRow}
            startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
            className="w-full md:w-auto shadow-sm hover:shadow-md transition-shadow"
            isDisabled={isProcessing}
          >
            添加行
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default React.memo(DynamicTable)
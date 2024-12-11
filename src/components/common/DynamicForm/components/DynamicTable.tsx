import React, { useState, useCallback, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import ResourceSelectButton from "../../ResourceSelectButton"
import { TableConfig } from "../types"
import { UseFormReturn, useFieldArray, useWatch } from "react-hook-form"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { motion } from "framer-motion"
import { debounce } from "lodash"
import styles from "../styles/DynamicForm.module.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import message from "@/components/Message"
import { createTableRenderer } from "./TableFields/renders"

interface DynamicTableProps {
  config: TableConfig
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName: string
}

const DynamicTable: React.FC<DynamicTableProps> = ({ config, form, isEditable = true, fieldName }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName,
  })

  const [hasScroll, setHasScroll] = useState(false)

  // 检查是否需要显示滚动阴影
  useEffect(() => {
    const tabsList = document.querySelector(`.${styles["tabs-list-scroll"]}`)
    if (tabsList) {
      const checkScroll = () => {
        setHasScroll(tabsList.scrollWidth > tabsList.clientWidth)
      }
      checkScroll()
      window.addEventListener("resize", checkScroll)
      return () => window.removeEventListener("resize", checkScroll)
    }
  }, [config.columns])

  const tableData = useWatch({
    control: form.control,
    name: fieldName,
    defaultValue: [],
  })

  // 处理资源选择后的字段映射
  const handleResourceSelect = useCallback(
    (rowIndex: number, columnKey: string, selected: any) => {
      if (!selected || !selected[0]) return

      const resource = selected[0]
      const column = config.columns.find((col) => col.key === columnKey)

      if (column?.resourceConfig?.fieldMapping) {
        Object.entries(column.resourceConfig.fieldMapping).forEach(([targetField, mapping]) => {
          // 找到目标列配置
          const targetColumn = config.columns.find((col) => col.key === targetField)
          if (!targetColumn) return

          // 设置映射标记
          targetColumn.isMappedField = true
          targetColumn.mappedFrom = `${columnKey}.${typeof mapping === "string" ? mapping : mapping.field}`
          targetColumn.editable = false

          if (typeof mapping === "string") {
            // 简单映射
            const value = resource[mapping]
            if (value !== undefined) {
              form.setValue(`${fieldName}.${rowIndex}.${targetField}`, value)
            }
          } else {
            // 复杂映射
            if (mapping.condition && !mapping.condition(resource)) {
              return
            }

            if (mapping.fields) {
              // 多字段组合
              const values = mapping.fields.map((field) => resource[field])
              const value = mapping.transform ? mapping.transform(values) : values.join(" ")
              form.setValue(`${fieldName}.${rowIndex}.${targetField}`, value)
            } else {
              // 单字段转换
              const value = resource[mapping.field]
              const transformedValue = mapping.transform ? mapping.transform(value) : value
              if (transformedValue !== undefined) {
                form.setValue(`${fieldName}.${rowIndex}.${targetField}`, transformedValue)
              }
            }
          }
        })
      }
    },
    [config.columns, fieldName, form]
  )

  // 添加默认值初始化逻辑
  const handleAddRow = useCallback(() => {
    const newRow = config.columns.reduce(
      (acc, column) => {
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
          case "resource":
            acc[column.key] = null
            break
          default:
            acc[column.key] = ""
        }
        return acc
      },
      {} as Record<string, any>
    )

    append(newRow)
  }, [config.columns, append])

  const handleDeleteRow = useCallback(
    (index: number) => {
      remove(index)
    },
    [remove]
  )

  // 渲染单元格
  const renderCell = (column: TableConfig["columns"][0], rowIndex: number) => {
    const cellFieldName = `${fieldName}.${rowIndex}.${column.key}`
    const isFieldEditable = isEditable && column.editable !== false && !column.isMappedField

    if (column.render) {
      const record = tableData[rowIndex] || {}
      return column.render(form.getValues(cellFieldName), record, rowIndex)
    }

    if (column.type === "resource") {
      return (
        <div className='flex items-center gap-2'>
          <FormField
            control={form.control}
            name={cellFieldName}
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormControl>
                  <Input {...field} readOnly className={cn("min-w-[120px] border-0 focus:ring-0 bg-transparent")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isFieldEditable && column.resourceConfig && (
            <ResourceSelectButton
              resourceName={column.resourceConfig.resourceId}
              selectionMode='single'
              onSelect={(selected) => {
                if (selected.length > 0) {
                  form.setValue(cellFieldName, selected[0])
                  // 处理字段映射
                  handleResourceSelect(rowIndex, column.key, selected)
                }
              }}
              buttonText='选择'
              buttonProps={{
                size: "sm",
                className: "px-2 py-1 h-8",
              }}
            />
          )}
        </div>
      )
    }

    // 使用新的表格渲染器
    const renderer = createTableRenderer(column.type)
    return renderer({
      column,
      rowIndex,
      tableProps: {
        form,
        isEditable,
        onChange: (field, value) => {
          // 处理onChange回调
        },
        fieldName,
      },
    })
  }

  const renderSummaryCell = (column: TableConfig["columns"][0]) => {
    if (column.key === config.columns[0].key) {
      return <div className='font-medium'>{config.summary?.label || "合计"}</div>
    }

    if (!column.summary?.render) {
      return null
    }

    return column.summary.render(tableData || [])
  }

  return (
    <div>
      {config.toolbar}

      <div className='hidden md:block overflow-x-auto'>
        <div className='min-w-full inline-block align-middle'>
          <div className='overflow-x-auto border rounded-lg'>
            <Table>
              <TableHeader className='bg-gray-100'>
                <TableRow>
                  {config.columns.map((column) => (
                    <TableHead
                      key={column.key}
                      style={{
                        width: column.width,
                        minWidth: column.width || "80px",
                      }}
                      className='border border-gray-200 whitespace-nowrap'
                    >
                      <div className='flex items-center gap-1'>
                        {column.title}
                        {column.isMappedField && (
                          <Icon icon='mdi:link-variant' className='text-gray-400' title='自动填充字段' />
                        )}
                      </div>
                    </TableHead>
                  ))}
                  {isEditable && <TableHead className='border border-gray-200 w-[80px]'>操作</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, rowIndex) => (
                  <TableRow key={field.id}>
                    {config.columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn("border border-gray-200", column.isMappedField && "bg-gray-50")}
                        style={{
                          minWidth: column.width || "80px",
                        }}
                      >
                        {renderCell(column, rowIndex)}
                      </TableCell>
                    ))}
                    {isEditable && (
                      <TableCell className='border border-gray-200 w-[80px]'>
                        <Button
                          isIconOnly
                          color='danger'
                          variant='light'
                          size='sm'
                          onClick={() => handleDeleteRow(rowIndex)}
                        >
                          <Icon icon='mdi:delete' className='w-4 h-4' />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {config.summary?.show && (
                  <TableRow className={cn("bg-default-50", config.summary.className)} style={config.summary.style}>
                    {config.columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className='border border-gray-200'
                        style={{
                          minWidth: column.width || "80px",
                        }}
                      >
                        {renderSummaryCell(column)}
                      </TableCell>
                    ))}
                    {isEditable && <TableCell className='border border-gray-200 w-[80px]' />}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {isEditable && (
        <motion.div className='mt-4' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            color='primary'
            variant='flat'
            size='sm'
            onClick={handleAddRow}
            startContent={<Icon icon='mdi:plus' className='w-4 h-4' />}
            className='w-full md:w-auto'
          >
            添加行
          </Button>
        </motion.div>
      )}
    </div>
  )
}

export default DynamicTable
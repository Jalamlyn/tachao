import React, { useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import ResourceSelectButton from "../../ResourceSelectButton"
import { TableConfig } from "../types"
import { UseFormReturn, useFieldArray, useWatch } from "react-hook-form"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/theme/cn"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { debounce } from "lodash"
import styles from "../styles/DynamicForm.module.css"

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

  const tableData = useWatch({
    control: form.control,
    name: fieldName,
    defaultValue: [],
  })

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

  const renderCell = (column: TableConfig["columns"][0], rowIndex: number) => {
    const cellFieldName = `${fieldName}.${rowIndex}.${column.key}`
    const isFieldEditable = isEditable && column.editable !== false

    if (column.render) {
      return column.render(form.getValues(cellFieldName), tableData[rowIndex], rowIndex)
    }

    switch (column.type) {
      case "resource":
        return (
          <div className='flex items-center gap-2'>
            <FormField
              control={form.control}
              name={cellFieldName}
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!isFieldEditable}
                      className={cn(
                        "min-w-[120px] border-0 focus:ring-0 bg-transparent"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isFieldEditable && column.resourceConfig && (
              <ResourceSelectButton
                resourceName={column.resourceConfig.resourceTitle}
                selectionMode="single"
                onSelect={(selected) => {
                  if (selected.length > 0) {
                    form.setValue(cellFieldName, selected[0])
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

      case "date":
      case "datetime":
        return (
          <FormField
            control={form.control}
            name={cellFieldName}
            render={({ field }) => (
              <FormItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal border-0",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!isFieldEditable}
                      >
                        {field.value ? format(new Date(field.value), "PPP") : <span>选择日期</span>}
                        <Icon icon='mdi:calendar' className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date?.toISOString())
                        form.trigger(cellFieldName)
                      }}
                      disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "textarea":
        return (
          <FormField
            control={form.control}
            name={cellFieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={!isFieldEditable}
                    className={cn(
                      "min-h-[100px] md:min-h-[60px] border-0 focus:ring-0 bg-transparent"
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "select":
        return (
          <FormField
            control={form.control}
            name={cellFieldName}
            render={({ field }) => (
              <FormItem>
                <Select
                  disabled={!isFieldEditable}
                  onValueChange={(value) => {
                    field.onChange(value)
                    form.trigger(cellFieldName)
                  }}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        "border-0 focus:ring-0 bg-transparent"
                      )}
                    >
                      <SelectValue placeholder={column.placeholder || "请选择"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {column.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "number":
        return (
          <FormField
            control={form.control}
            name={cellFieldName}
            render={({ field }) => (
              <FormItem className='relative group'>
                <FormControl>
                  <Input
                    {...field}
                    type='number'
                    disabled={!isFieldEditable}
                    className={cn(
                      "text-right font-mono border-0 focus:ring-0 bg-transparent",
                      "group-hover:bg-blue-100/50"
                    )}
                    onChange={(e) => {
                      field.onChange(e)
                      form.trigger(cellFieldName)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      default:
        return (
          <FormField
            control={form.control}
            name={cellFieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isFieldEditable}
                    className={cn(
                      "border-0 focus:ring-0 bg-transparent"
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
    }
  }

  const calculateSummary = () => {
    if (!config.summary?.show) return null

    const summaryData = config.columns.reduce(
      (acc, column) => {
        if (column.summary?.calculate) {
          acc[column.key] = column.summary.calculate(tableData)
        }
        return acc
      },
      {} as Record<string, any>
    )

    return summaryData
  }

  const renderSummaryCell = (column: TableConfig["columns"][0]) => {
    if (column.key === config.columns[0].key) {
      return <div className='font-medium'>{config.summary?.label || "合计"}</div>
    }

    const summaryData = calculateSummary()
    if (!summaryData || !column.summary?.calculate) {
      return null
    }

    const value = summaryData[column.key]

    if (column.summary.render) {
      return column.summary.render(value)
    }

    if (column.type === "number") {
      return <div className='text-right font-mono'>{value}</div>
    }

    return value
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
                        minWidth: column.width || '80px'
                      }} 
                      className='border border-gray-200 whitespace-nowrap'
                    >
                      <div className='flex items-center gap-1'>
                        {column.title}
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
                        className='border border-gray-200'
                        style={{
                          minWidth: column.width || '80px'
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
                          minWidth: column.width || '80px'
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

      <div className='space-y-4 md:hidden'>
        {fields.map((field, rowIndex) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='bg-white rounded-lg shadow-sm p-4 space-y-3'
          >
            {config.columns.map((column) => (
              <div key={column.key} className='space-y-1'>
                <div className='flex items-center gap-1 text-sm font-medium text-gray-500'>
                  {column.title}
                </div>
                <div>{renderCell(column, rowIndex)}</div>
              </div>
            ))}
            {isEditable && (
              <div className='pt-2 flex justify-end'>
                <Button isIconOnly color='danger' variant='light' size='sm' onClick={() => handleDeleteRow(rowIndex)}>
                  <Icon icon='mdi:delete' className='w-4 h-4' />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
        {config.summary?.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("bg-default-50 rounded-lg p-4 space-y-3", config.summary.className)}
            style={config.summary.style}
          >
            {config.columns.map((column) => (
              <div key={column.key} className='space-y-1'>
                <div className='text-sm font-medium text-gray-500'>{column.title}</div>
                <div>{renderSummaryCell(column)}</div>
              </div>
            ))}
          </motion.div>
        )}
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
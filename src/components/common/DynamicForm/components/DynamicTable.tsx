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

  const handleDeleteRow = useCallback(
    (index: number) => {
      remove(index)
    },
    [remove]
  )

  const defaultCalculations = {
    amount: (row: any) => {
      const quantity = Number(row.quantity) || 0
      const unitPrice = Number(row.unitPrice) || 0
      return Number((quantity * unitPrice).toFixed(2))
    },
  }

  const calculations = {
    ...defaultCalculations,
    ...(config.rowCalculations || {}),
  }

  const handleCalculateField = useCallback(
    (row: any, index: number, changedField: string) => {
      if (config.rowCalculations) {
        Object.entries(config.rowCalculations).forEach(([field, calculate]) => {
          try {
            const value = calculate(row)
            form.setValue(`${fieldName}.${index}.${field}`, value)
          } catch (error) {
            console.error(`Error calculating field ${field}:`, error)
          }
        })
      }
    },
    [config.rowCalculations, fieldName, form]
  )

  const calculateSummary = useCallback(
    (field: string, calculate: (records: any[]) => number | string) => {
      if (calculate) {
        return calculate(tableData)
      } else {
        return 0
      }
    },
    [tableData]
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
                    <Input {...field} disabled={!isFieldEditable} className='min-w-[120px]' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isFieldEditable && column.resourceConfig && (
              <ResourceSelectButton
                resourceName={column.resourceConfig.resourceName}
                appId={column.resourceConfig.appId}
                selectionMode={column.resourceConfig.selectionMode}
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
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                      onSelect={(date) => field.onChange(date?.toISOString())}
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
                  <Textarea {...field} disabled={!isFieldEditable} className='min-h-[100px] md:min-h-[60px]' />
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
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
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
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type='number'
                    disabled={!isFieldEditable}
                    className='text-right font-mono'
                    onChange={(e) => {
                      field.onChange(e)
                      const row = form.getValues(`${fieldName}.${rowIndex}`)
                      handleCalculateField(row, rowIndex, column.key)
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
                  <Input {...field} disabled={!isFieldEditable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
    }
  }

  const renderSummary = () => {
    if (!config.summary) return null

    return (
      <TableRow>
        <TableCell colSpan={config.columns.length + (isEditable ? 1 : 0)}>
          <div className='space-y-2'>
            {Object.entries(config.summary.fields).map(([key, { label, calculate }]) => {
              const value = calculateSummary(key, calculate)

              return (
                <div key={key} className='flex justify-between'>
                  <span>{label}:</span>
                  <span>{typeof value === "number" ? value.toFixed(2) : value}</span>
                </div>
              )
            })}
          </div>
        </TableCell>
      </TableRow>
    )
  }

  const renderMobileTable = () => {
    return (
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
                <div className='text-sm font-medium text-gray-500'>{column.title}</div>
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
      </div>
    )
  }

  return (
    <div>
      {config.toolbar}

      <div className='hidden md:block overflow-x-auto'>
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
            {fields.map((field, rowIndex) => (
              <TableRow key={field.id}>
                {config.columns.map((column) => (
                  <TableCell key={column.key}>{renderCell(column, rowIndex)}</TableCell>
                ))}
                {isEditable && (
                  <TableCell>
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
            {renderSummary()}
          </TableBody>
        </Table>
      </div>

      {renderMobileTable()}

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

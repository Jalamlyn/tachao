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

interface DynamicTableProps {
  config: TableConfig
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName: string
}

const DynamicTable: React.FC<DynamicTableProps> = ({ config, form, isEditable = true, fieldName }) => {
  // 使用 useFieldArray 来管理动态表格数据
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName
  });

  // 使用 useWatch 来监听表格数据变化
  const tableData = useWatch({
    control: form.control,
    name: fieldName,
    defaultValue: []
  });

  // 使用 useCallback 优化添加行的函数
  const handleAddRow = useCallback(() => {
    const newRow = config.columns.reduce((acc, column) => {
      acc[column.key] = ""
      return acc
    }, {} as Record<string, any>)
    
    append(newRow)
  }, [config.columns, append])

  // 使用 useCallback 优化删除行的函数
  const handleDeleteRow = useCallback((index: number) => {
    remove(index)
  }, [remove])

  // 默认的计算函数
  const defaultCalculations = {
    amount: (row: any) => {
      const quantity = Number(row.quantity) || 0
      const unitPrice = Number(row.unitPrice) || 0
      return Number((quantity * unitPrice).toFixed(2))
    }
  }

  // 合并默认计算函数和配置的计算函数
  const calculations = {
    ...defaultCalculations,
    ...(config.rowCalculations || {})
  }

  const handleCalculateField = useCallback((row: any, index: number, changedField: string) => {
    // 检查是否有依赖关系需要计算
    if (config.dependencies) {
      Object.entries(config.dependencies).forEach(([field, dependency]) => {
        if (dependency.dependsOn?.includes(changedField)) {
          try {
            // 优先使用配置的计算函数
            const calculate = dependency.calculate || calculations[field]
            if (typeof calculate === 'function') {
              const value = calculate(row)
              form.setValue(`${fieldName}.${index}.${field}`, value)
            }
          } catch (error) {
            console.error(`Error calculating field ${field}:`, error)
          }
        }
      })
    }
  }, [config.dependencies, calculations, fieldName, form])

  const calculateSummary = useCallback((field: string, calculate: (records: any[]) => number | string) => {
    try {
      return calculate(tableData)
    } catch (error) {
      console.error(`Error calculating summary for ${field}:`, error)
      return 0
    }
  }, [tableData])

  const renderCell = (column: TableConfig["columns"][0], rowIndex: number) => {
    const cellFieldName = `${fieldName}.${rowIndex}.${column.key}`

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
                    <Input {...field} disabled={!isEditable || !column.editable} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEditable && column.editable && column.resourceConfig && (
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
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!isEditable || !column.editable}
                      >
                        {field.value ? format(new Date(field.value), "PPP") : <span>选择日期</span>}
                        <Icon icon="mdi:calendar" className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2000-01-01")
                      }
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
                    disabled={!isEditable || !column.editable}
                    className="min-h-[100px]"
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
                <FormControl>
                  <select
                    {...field}
                    disabled={!isEditable || !column.editable}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">{column.placeholder || "请选择"}</option>
                    {column.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
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
                    type="number"
                    disabled={!isEditable || !column.editable}
                    className="text-right font-mono"
                    onChange={(e) => {
                      field.onChange(e)
                      handleCalculateField(tableData[rowIndex], rowIndex, column.key)
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
                  <Input {...field} disabled={!isEditable || !column.editable} />
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
                  <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                </div>
              )
            })}
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div>
      {config.toolbar}
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
                    color="danger"
                    variant="light"
                    size="sm"
                    onClick={() => handleDeleteRow(rowIndex)}
                  >
                    <Icon icon="mdi:delete" className="w-4 h-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          {renderSummary()}
        </TableBody>
      </Table>
      {isEditable && (
        <div className="mt-4">
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onClick={handleAddRow}
            startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
          >
            添加行
          </Button>
        </div>
      )}
    </div>
  )
}

export default DynamicTable
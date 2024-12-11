import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, FormControl, FormItem } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/theme/cn"
import { TableColumn, TableRenderProps } from "../../../types"

interface TableCellProps {
  column: TableColumn
  rowIndex: number
  tableProps: TableRenderProps
}

// 渲染Select类型的单元格
const renderTableSelect = ({ column, rowIndex, tableProps }: TableCellProps) => {
  const cellFieldName = `${tableProps.fieldName}.${rowIndex}.${column.key}`
  const { form, isEditable, onChange } = tableProps

  return (
    <FormField
      control={form.control}
      name={cellFieldName}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <Select
              disabled={!isEditable || column.disabled}
              onValueChange={(value) => {
                field.onChange(value)
                onChange?.(cellFieldName, value)
              }}
              value={field.value}
              defaultValue={field.value}
            >
              <SelectTrigger
                className={cn(
                  "w-full min-h-[2rem] h-8 px-2",
                  "border-0 focus:ring-0 bg-transparent",
                  "data-[placeholder]:text-gray-400"
                )}
              >
                <SelectValue placeholder={column.placeholder || "请选择"} />
              </SelectTrigger>
              <SelectContent>
                {(typeof column.options === "function" ? column.options(form) : column.options || []).map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      "cursor-pointer transition-colors",
                      "hover:bg-blue-50 hover:text-blue-600",
                      "focus:bg-blue-50 focus:text-blue-600",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  )
}

// 渲染Date类型的单元格
const renderTableDate = ({ column, rowIndex, tableProps }: TableCellProps) => {
  const cellFieldName = `${tableProps.fieldName}.${rowIndex}.${column.key}`
  const { form, isEditable, onChange } = tableProps

  return (
    <FormField
      control={form.control}
      name={cellFieldName}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="bordered"
                  className={cn(
                    "w-full min-h-[2rem] h-8 px-2 justify-start font-normal",
                    "border-0 focus:ring-0 bg-transparent",
                    !field.value && "text-gray-400"
                  )}
                  disabled={!isEditable || column.disabled}
                >
                  {field.value ? format(new Date(field.value), "PPP") : <span>{column.placeholder || "选择日期"}</span>}
                  <Icon icon="mdi:calendar" className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    const value = date?.toISOString()
                    field.onChange(value)
                    onChange?.(cellFieldName, value)
                  }}
                  disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormControl>
        </FormItem>
      )}
    />
  )
}

// 渲染默认Input类型的单元格
const renderTableInput = ({ column, rowIndex, tableProps }: TableCellProps) => {
  const cellFieldName = `${tableProps.fieldName}.${rowIndex}.${column.key}`
  const { form, isEditable, onChange } = tableProps

  return (
    <FormField
      control={form.control}
      name={cellFieldName}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <Input
              {...field}
              type={column.type}
              disabled={!isEditable || column.disabled}
              className={cn(
                "min-h-[2rem] h-8 px-2",
                "border-0 focus:ring-0 bg-transparent",
                column.type === "number" && "text-right font-mono",
                "placeholder:text-gray-400"
              )}
              placeholder={column.placeholder}
              onChange={(e) => {
                field.onChange(e)
                onChange?.(cellFieldName, e.target.value)
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}

// 创建表格渲染器
export const createTableRenderer = (type: string) => {
  switch (type) {
    case "select":
      return renderTableSelect
    case "date":
    case "datetime":
      return renderTableDate
    default:
      return renderTableInput
  }
}
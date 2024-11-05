import React from "react"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@nextui-org/react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"
import { Textarea } from "@/components/ui/textarea"
import { TableColumn } from "../../types"
import { UseFormReturn } from "react-hook-form"

interface TableCellProps {
  column: TableColumn
  rowIndex: number
  fieldName: string
  form: UseFormReturn<any>
  isEditable?: boolean
  onValueChange?: (value: any) => void
}

const TableCell: React.FC<TableCellProps> = ({
  column,
  rowIndex,
  fieldName,
  form,
  isEditable = true,
  onValueChange,
}) => {
  const cellFieldName = `${fieldName}.${rowIndex}.${column.key}`
  const isFieldEditable = isEditable && column.editable !== false

  const handleValueChange = (value: any) => {
    if (onValueChange) {
      onValueChange(value)
    }
  }

  // 基础输入组件
  const renderBasicInput = (type: string, field: any) => (
    <Input
      {...field}
      type={type}
      className={cn(
        type === "number" ? "text-right font-mono" : "",
        "w-full rounded-md"
      )}
      onChange={(e) => {
        field.onChange(e)
        handleValueChange(e.target.value)
      }}
      disabled={!isFieldEditable}
    />
  )

  // 日期选择组件
  const renderDateInput = (field: any) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="bordered"
          className={cn(
            "w-full pl-3 text-left font-normal",
            !field.value && "text-muted-foreground"
          )}
          disabled={!isFieldEditable}
        >
          {field.value ? format(new Date(field.value), "PPP") : <span>选择日期</span>}
          <Icon icon="mdi:calendar" className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={field.value ? new Date(field.value) : undefined}
          onSelect={(date) => {
            field.onChange(date?.toISOString())
            handleValueChange(date?.toISOString())
          }}
          disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )

  // 选择框组件
  const renderSelect = (field: any) => (
    <select
      {...field}
      disabled={!isFieldEditable}
      className="w-full rounded-md border border-gray-300 px-3 py-2"
      onChange={(e) => {
        field.onChange(e)
        handleValueChange(e.target.value)
      }}
    >
      <option value="">{column.placeholder || "请选择"}</option>
      {column.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  // 文本域组件
  const renderTextarea = (field: any) => (
    <Textarea
      {...field}
      disabled={!isFieldEditable}
      className="min-h-[100px] md:min-h-[60px]"
      onChange={(e) => {
        field.onChange(e)
        handleValueChange(e.target.value)
      }}
    />
  )

  return (
    <FormField
      control={form.control}
      name={cellFieldName}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            {(() => {
              switch (column.type) {
                case "date":
                case "datetime":
                  return renderDateInput(field)
                case "select":
                  return renderSelect(field)
                case "textarea":
                  return renderTextarea(field)
                case "number":
                  return renderBasicInput("number", field)
                default:
                  return renderBasicInput("text", field)
              }
            })()}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default TableCell
import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { FormField as DynamicFormField } from "../types"

// 动画配置
const animations = {
  fieldVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
}

// 通用的表单字段包装器组件
const FormFieldWrapper: React.FC<{
  name: string
  label: string
  children: (field: any) => React.ReactNode
  form: UseFormReturn<any>
  isEditable?: boolean
  disabled?: boolean
}> = ({ name, label, children, form, isEditable = true, disabled }) => {
  return (
    <motion.div variants={animations.fieldVariants} initial="hidden" animate="visible">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {children({ ...field, disabled: !isEditable || disabled })}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  )
}

// 基础输入组件
const BasicInput: React.FC<{ type: string; field: any }> = ({ type, field }) => (
  <Input {...field} type={type} className={type === "number" ? "text-right font-mono" : ""} />
)

// 日期选择组件
const DateInput: React.FC<{ field: any }> = ({ field }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant={"outline"}
        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
        disabled={field.disabled}
      >
        {field.value ? format(new Date(field.value), "PPP") : <span>选择日期</span>}
        <Icon icon="mdi:calendar" className="ml-auto h-4 w-4 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={field.value ? new Date(field.value) : undefined}
        onSelect={(date) => field.onChange(date?.toISOString())}
        disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
        initialFocus
      />
    </PopoverContent>
  </Popover>
)

interface DynamicFormFieldsProps {
  fields: DynamicFormField[]
  form: UseFormReturn<any>
  isEditable?: boolean
}

const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({ fields, form, isEditable = true }) => {
  const renderField = (field: DynamicFormField) => {
    if (field.hidden) return null

    // 基础输入类型映射
    const basicInputTypes = ["text", "password", "email", "tel", "url"]
    if (basicInputTypes.includes(field.type)) {
      return (
        <FormFieldWrapper
          name={field.name}
          label={field.label}
          form={form}
          isEditable={isEditable}
          disabled={field.disabled}
        >
          {(formField) => <BasicInput type={field.type} field={formField} />}
        </FormFieldWrapper>
      )
    }

    switch (field.type) {
      case "textarea":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
          >
            {(formField) => <Textarea {...formField} placeholder={field.placeholder} />}
          </FormFieldWrapper>
        )

      case "number":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
          >
            {(formField) => (
              <Input
                {...formField}
                type="number"
                className="text-right font-mono"
                placeholder={field.placeholder}
              />
            )}
          </FormFieldWrapper>
        )

      case "date":
      case "datetime":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
          >
            {(formField) => <DateInput field={formField} />}
          </FormFieldWrapper>
        )

      case "select":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
          >
            {(formField) => (
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                {...formField}
                disabled={!isEditable || field.disabled}
              >
                <option value="">{field.placeholder || "请选择"}</option>
                {(field as any).options?.map((option: any) => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </FormFieldWrapper>
        )

      case "file":
      case "image":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
          >
            {(formField) => (
              <Input
                type="file"
                accept={field.accept}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file && field.onUpload) {
                    await field.onUpload(file)
                  }
                  formField.onChange(e)
                }}
                disabled={!isEditable || field.disabled}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                  file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            )}
          </FormFieldWrapper>
        )

      case "custom":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
          >
            {(formField) =>
              field.render({
                field: formField,
                form,
                isEditable,
              })
            }
          </FormFieldWrapper>
        )

      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field) => (
        <div key={field.name}>{renderField(field)}</div>
      ))}
    </div>
  )
}

export default DynamicFormFields
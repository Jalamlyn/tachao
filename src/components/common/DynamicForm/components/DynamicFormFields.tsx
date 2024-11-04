import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@nextui-org/react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { FormField as DynamicFormField } from "../types"
import OrderNumberField from "@/components/common/OrderNumberField"

// 动画配置
const animations = {
  fieldVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
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
  showWhen?: {
    field: string
    value: any
    operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'contains'
  }
}> = ({ name, label, children, form, isEditable = true, disabled, showWhen }) => {
  // 处理条件显示逻辑
  const shouldShow = React.useMemo(() => {
    if (!showWhen) return true

    const dependentValue = form.watch(showWhen.field)
    
    switch (showWhen.operator) {
      case 'neq':
        return dependentValue !== showWhen.value
      case 'gt':
        return dependentValue > showWhen.value
      case 'lt':
        return dependentValue < showWhen.value
      case 'contains':
        return dependentValue?.includes?.(showWhen.value)
      case 'eq':
      default:
        return dependentValue === showWhen.value
    }
  }, [form, showWhen])

  if (!shouldShow) return null

  return (
    <motion.div variants={animations.fieldVariants} initial="hidden" animate="visible">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-sm font-medium">{label}</FormLabel>
            <FormControl>
              {children({ ...field, disabled: !isEditable || disabled })}
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </motion.div>
  )
}

// 基础输入组件
const BasicInput: React.FC<{ type: string; field: any }> = ({ type, field }) => (
  <Input {...field} type={type} className={cn(
    type === "number" ? "text-right font-mono" : "",
    "w-full rounded-md"
  )} />
)

// 日期选择组件
const DateInput: React.FC<{ field: any }> = ({ field }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="bordered"
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
  orderNumberFieldConfig?: {
    prefix?: string
    fieldName: string
    label?: string
  }
}

const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({ 
  fields, 
  form, 
  isEditable = true,
  orderNumberFieldConfig 
}) => {
  const renderField = (field: DynamicFormField) => {
    if (field.hidden) return null

    // 如果是第一个字段且存在 orderNumberFieldConfig，则在其旁边渲染 OrderNumberField
    const isFirstField = fields.indexOf(field) === 0
    const shouldRenderOrderNumber = isFirstField && orderNumberFieldConfig

    // 基础输入类型映射
    const basicInputTypes = ["text", "password", "email", "tel", "url"]
    if (basicInputTypes.includes(field.type)) {
      return (
        <div className={shouldRenderOrderNumber ? "grid grid-cols-1 md:grid-cols-2 gap-4" : undefined}>
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            showWhen={field.showWhen}
          >
            {(formField) => <BasicInput type={field.type} field={formField} />}
          </FormFieldWrapper>
          {shouldRenderOrderNumber && (
            <OrderNumberField
              form={form}
              prefix={orderNumberFieldConfig.prefix}
              fieldName={orderNumberFieldConfig.fieldName}
              label={orderNumberFieldConfig.label}
              disabled={!isEditable}
            />
          )}
        </div>
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
            showWhen={field.showWhen}
          >
            {(formField) => (
              <Textarea
                {...formField}
                placeholder={field.placeholder}
                className="min-h-[100px] md:min-h-[80px]"
              />
            )}
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
            showWhen={field.showWhen}
          >
            {(formField) => (
              <Input
                {...formField}
                type="number"
                className="text-right font-mono w-full"
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
            showWhen={field.showWhen}
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
            showWhen={field.showWhen}
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
            showWhen={field.showWhen}
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
                  hover:file:bg-blue-100 w-full"
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
            showWhen={field.showWhen}
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
    <motion.div
      variants={animations.containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
    >
      {fields.map((field) => (
        <div key={field.name} className="w-full">{renderField(field)}</div>
      ))}
    </motion.div>
  )
}

export default DynamicFormFields
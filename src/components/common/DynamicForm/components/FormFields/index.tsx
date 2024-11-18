import React from "react"
import { UseFormReturn } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { FormField as DynamicFormField } from "../../types"
import FormFieldWrapper from "./FormFieldWrapper"
import BasicInput from "./BasicInput"
import DateInput from "./DateInput"
import { cn } from "@/theme/cn"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"

// 新增: 获取选项的工具函数
const getOptions = (field: DynamicFormField, form: UseFormReturn<any>) => {
  console.log("[DynamicForm] Getting options for field:", field.name)
  
  if (typeof field.options === "function") {
    const options = field.options(form)
    console.log("[DynamicForm] Dynamic options:", options)
    return Array.isArray(options) ? options : []
  }
  
  console.log("[DynamicForm] Static options:", field.options)
  return field.options || []
}

interface DynamicFormFieldsProps {
  fields: DynamicFormField[]
  form: UseFormReturn<any>
  isEditable?: boolean
}

const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({
  fields,
  form,
  isEditable = true,
}) => {
  const renderField = (field: DynamicFormField) => {
    if (field.hidden) return null

    // 基础输入类型映射
    const basicInputTypes = ["text", "password", "email", "tel", "url"]
    if (basicInputTypes.includes(field.type)) {
      return (
        <div className={cn(
          "form-field-container"
        )}>
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            tooltip={field.tooltip}
          >
            {(formField) => <BasicInput type={field.type} field={formField} />}
          </FormFieldWrapper>
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
            tooltip={field.tooltip}
          >
            {(formField) => (
              <Textarea
                {...formField}
                placeholder={field.placeholder}
                className={cn(
                  "min-h-[100px] md:min-h-[80px]",
                  "w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                  "resize-none transition-colors",
                  "placeholder:text-gray-400"
                )}
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
            tooltip={field.tooltip}
          >
            {(formField) => (
              <Input
                {...formField}
                type="number"
                className={cn(
                  "text-right font-mono w-full",
                  "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                  "transition-colors",
                  "placeholder:text-gray-400"
                )}
                placeholder={field.placeholder}
                onChange={(e) => {
                  formField.onChange(e);
                  // 触发表单更新
                  form.trigger(field.name);
                }}
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
            tooltip={field.tooltip}
          >
            {(formField) => (
              <DateInput
                field={formField}
                onChange={(date) => {
                  formField.onChange(date);
                  // 触发表单更新
                  form.trigger(field.name);
                }}
              />
            )}
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
            tooltip={field.tooltip}
          >
            {(formField) => (
              <Select
                disabled={!isEditable || field.disabled}
                onValueChange={(value) => {
                  formField.onChange(value);
                  // 触发表单更新
                  form.trigger(field.name);
                }}
                value={formField.value || ""}
              >
                <SelectTrigger className={cn(
                  "w-full",
                  "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                  "transition-colors",
                  "placeholder:text-gray-400"
                )}>
                  <SelectValue placeholder={field.placeholder || "请选择"} />
                </SelectTrigger>
                <SelectContent>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {getOptions(field, form).map((option) => (
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
                  </motion.div>
                </SelectContent>
              </Select>
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
            tooltip={field.tooltip}
          >
            {(formField) => (
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={field.accept}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    if (field.onUpload) {
                      try {
                        await field.onUpload(file)
                        formField.onChange(file)
                      } catch (error) {
                        console.error("File upload error:", error)
                        message.error("文件上传失败")
                      }
                    } else {
                      formField.onChange(file)
                    }
                  }}
                  disabled={!isEditable || field.disabled}
                  className="hidden"
                  id={field.name}
                />
                <Button
                  as="label"
                  htmlFor={field.name}
                  variant="bordered"
                  size="sm"
                  isDisabled={!isEditable || field.disabled}
                  startContent={<Icon icon="mdi:upload" className="w-4 h-4" />}
                  className={cn(
                    "font-medium",
                    "hover:bg-blue-50 hover:text-blue-600",
                    "transition-colors duration-200"
                  )}
                >
                  {field.placeholder || "选择文件"}
                </Button>
                {formField.value && (
                  <>
                    <span className="text-sm text-gray-500 truncate flex-1">
                      {formField.value instanceof File ? formField.value.name : formField.value}
                    </span>
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      color="danger"
                      onClick={() => formField.onChange(null)}
                      isDisabled={!isEditable || field.disabled}
                    >
                      <Icon icon="mdi:close" className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
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
            tooltip={field.tooltip}
          >
            {(formField) =>
              field?.render({
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
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
      "form-fields-container"
    )}>
      {fields.map((field) => (
        <div key={field.name} className={cn(
          "w-full",
          "form-field-wrapper",
          "hover:bg-gray-50/50 rounded-lg p-2 -m-2",
          "transition-colors duration-200"
        )}>
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}

export default DynamicFormFields
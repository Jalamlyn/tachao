import React from "react"
import { UseFormReturn } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { FormField as DynamicFormField } from "../../types"
import FormFieldWrapper from "./FormFieldWrapper"
import BasicInput from "./BasicInput"
import DateInput from "./DateInput"
import OrderNumberField from "@/components/common/OrderNumberField"
import { cn } from "@/theme/cn"

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
  orderNumberFieldConfig,
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
        <div className={cn(
          shouldRenderOrderNumber ? "grid grid-cols-1 md:grid-cols-2 gap-4" : undefined,
          "form-field-container"
        )}>
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
            showWhen={field.showWhen}
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
                className={cn(
                  "w-full rounded-md",
                  "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                  "transition-colors",
                  "py-2 px-3",
                  "text-gray-900",
                  "placeholder:text-gray-400",
                  "disabled:bg-gray-50 disabled:text-gray-500"
                )}
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
                className={cn(
                  "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0",
                  "file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700",
                  "hover:file:bg-blue-100",
                  "w-full",
                  "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                  "transition-colors"
                )}
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
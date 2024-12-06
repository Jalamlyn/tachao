import React, { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { FormField as DynamicFormField } from "../../types"
import FormFieldWrapper from "./FormFieldWrapper"
import BasicInput from "./BasicInput"
import DateInput from "./DateInput"
import { cn } from "@/theme/cn"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import SignaturePad from "@/components/common/SignaturePad"
import ResourceFieldGroup from "@/components/common/ResourceFieldGroup"
import { RadioGroup, Radio } from "@nextui-org/react"
import { Checkbox, CheckboxGroup } from "@nextui-org/react"
import { Switch } from "@nextui-org/react"
import { Slider } from "@nextui-org/react"

interface DynamicFormFieldsProps {
  fields: DynamicFormField[]
  form: UseFormReturn<any>
  isEditable?: boolean
  onChange?: (fieldName: string, value: any) => void
}

const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({ fields, form, isEditable, onChange }) => {
  const [manualInputModes, setManualInputModes] = useState<Record<string, boolean>>({})

  const toggleManualInput = (fieldName: string) => {
    setManualInputModes(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
    // 切换时清空字段值
    form.setValue(fieldName, {})
  }

  const renderField = (field: DynamicFormField) => {
    if (field.hidden) return null

    // 基础输入类型映射
    const basicInputTypes = ["text", "password", "email", "tel", "url"]
    if (basicInputTypes.includes(field.type)) {
      return (
        <div className={cn("form-field-container")}>
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            tooltip={field.tooltip}
            required={field.required}
          >
            {(formField) => (
              <BasicInput
                type={field.type}
                field={{
                  ...formField,
                  onChange: (e: any) => {
                    formField.onChange(e)
                    onChange?.(field.name, e.target.value)
                  },
                }}
              />
            )}
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
            required={field.required}
          >
            {(formField) => (
              <Textarea
                {...formField}
                onChange={(e) => {
                  formField.onChange(e)
                  onChange?.(field.name, e.target.value)
                }}
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
            required={field.required}
          >
            {(formField) => (
              <Input
                {...formField}
                type='number'
                onChange={(e) => {
                  formField.onChange(e)
                  onChange?.(field.name, e.target.value)
                }}
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
            tooltip={field.tooltip}
            required={field.required}
          >
            {(formField) => (
              <DateInput
                field={{
                  ...formField,
                  onChange: (value: any) => {
                    formField.onChange(value)
                    onChange?.(field.name, value)
                  },
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
            required={field.required}
          >
            {(formField) => (
              <Select
                disabled={!isEditable || field.disabled}
                onValueChange={(value) => {
                  formField.onChange(value)
                  onChange?.(field.name, value)
                }}
                value={formField.value || ""}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                    "transition-colors",
                    "placeholder:text-gray-400"
                  )}
                >
                  <SelectValue placeholder={field.placeholder || "请选择"} />
                </SelectTrigger>
                <SelectContent>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(typeof field.options === "function" ? field.options(form) : field.options || []).map((option) => (
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

      case "radio":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            tooltip={field.tooltip}
            required={field.required}
          >
            {(formField) => (
              <RadioGroup
                orientation={field.layout || "horizontal"}
                value={formField.value}
                onValueChange={(value) => {
                  formField.onChange(value)
                  onChange?.(field.name, value)
                }}
                isDisabled={!isEditable || field.disabled}
              >
                {(typeof field.options === "function" ? field.options(form) : field.options || []).map((option) => (
                  <Radio key={option.value} value={option.value} isDisabled={option.disabled}>
                    {option.label}
                  </Radio>
                ))}
              </RadioGroup>
            )}
          </FormFieldWrapper>
        )

      case "checkbox":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            tooltip={field.tooltip}
            required={field.required}
          >
            {(formField) => (
              <CheckboxGroup
                orientation={field.layout || "horizontal"}
                value={formField.value || []}
                onValueChange={(value) => {
                  formField.onChange(value)
                  onChange?.(field.name, value)
                }}
                isDisabled={!isEditable || field.disabled}
              >
                {(typeof field.options === "function" ? field.options(form) : field.options || []).map((option) => (
                  <Checkbox key={option.value} value={option.value} isDisabled={option.disabled}>
                    {option.label}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            )}
          </FormFieldWrapper>
        )

      case "switch":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            tooltip={field.tooltip}
            required={field.required}
          >
            {(formField) => (
              <div className="flex items-center gap-2">
                <Switch
                  isSelected={formField.value}
                  onValueChange={(checked) => {
                    formField.onChange(checked)
                    onChange?.(field.name, checked)
                  }}
                  isDisabled={!isEditable || field.disabled}
                />
                {formField.value ? field.checkedLabel : field.uncheckedLabel}
              </div>
            )}
          </FormFieldWrapper>
        )

      case "slider":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            tooltip={field.tooltip}
            required={field.required}
          >
            {(formField) => (
              <div className="w-full px-2">
                <Slider
                  value={formField.value}
                  onChange={(value) => {
                    formField.onChange(value)
                    onChange?.(field.name, value)
                  }}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  isDisabled={!isEditable || field.disabled}
                  className="max-w-md"
                />
              </div>
            )}
          </FormFieldWrapper>
        )

      case "resource":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            tooltip={field.tooltip}
            required={field.required}
          >
            {(formField) => (
              <div className="space-y-2">
                {field.resourceConfig?.allowManualInput && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="light"
                      color={manualInputModes[field.name] ? "primary" : "default"}
                      onPress={() => toggleManualInput(field.name)}
                      startContent={
                        <Icon
                          icon={manualInputModes[field.name] ? "mdi:keyboard" : "mdi:database-search"}
                          className="w-4 h-4"
                        />
                      }
                    >
                      {manualInputModes[field.name] ? "切换到选择模式" : "切换到手动输入"}
                    </Button>
                  </div>
                )}
                {manualInputModes[field.name] && field.resourceConfig?.allowManualInput ? (
                  <div className="space-y-3 p-3 border rounded-lg">
                    {field.resourceConfig.manualInputFields?.map((inputField) => (
                      <div key={inputField.key} className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          {inputField.label}
                          {inputField.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Input
                          type={inputField.type || "text"}
                          value={formField.value?.[inputField.key] || ""}
                          onChange={(e) => {
                            const newValue = {
                              ...formField.value,
                              [inputField.key]: e.target.value,
                            }
                            formField.onChange(newValue)
                            onChange?.(field.name, newValue)
                          }}
                          className="w-full"
                          required={inputField.required}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ResourceFieldGroup
                    resourceTitle={field.resourceConfig?.resourceTitle || ""}
                    value={formField.value}
                    onChange={(value) => {
                      formField.onChange(value)
                      onChange?.(field.name, value)
                    }}
                    disabled={!isEditable || field.disabled}
                    onDataSelect={(data) => {
                      console.log("Selected data:", data)
                    }}
                    form={form}
                  />
                )}
              </div>
            )}
          </FormFieldWrapper>
        )

      case "signature":
        return (
          <FormFieldWrapper
            name={field.name}
            label={field.label}
            form={form}
            isEditable={isEditable}
            disabled={field.disabled}
            tooltip={field.tooltip}
            required={field.required}
          >
            {(formField) => (
              <SignaturePad
                width={field.width}
                height={field.height}
                lineWidth={field.lineWidth}
                lineColor={field.lineColor}
                disabled={!isEditable || field.disabled}
                className={field.className}
                value={formField.value}
                onChange={(value) => {
                  formField.onChange(value)
                  onChange?.(field.name, value)
                }}
              />
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
            required={field.required}
          >
            {(formField) => (
              <div className='flex items-center gap-2'>
                <Input
                  type='file'
                  accept={field.accept}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    if (field.onUpload) {
                      try {
                        await field.onUpload(file)
                        formField.onChange(file)
                        onChange?.(field.name, file)
                      } catch (error) {
                        console.error("File upload error:", error)
                        message.error("文件上传失败")
                      }
                    } else {
                      formField.onChange(file)
                      onChange?.(field.name, file)
                    }
                  }}
                  disabled={!isEditable || field.disabled}
                  className='hidden'
                  id={field.name}
                />
                <Button
                  as='label'
                  htmlFor={field.name}
                  variant='bordered'
                  size='sm'
                  isDisabled={!isEditable || field.disabled}
                  startContent={<Icon icon='mdi:upload' className='w-4 h-4' />}
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
                    <span className='text-sm text-gray-500 truncate flex-1'>
                      {formField.value instanceof File ? formField.value.name : formField.value}
                    </span>
                    <Button
                      isIconOnly
                      variant='light'
                      size='sm'
                      color='danger'
                      onClick={() => {
                        formField.onChange(null)
                        onChange?.(field.name, null)
                      }}
                      isDisabled={!isEditable || field.disabled}
                    >
                      <Icon icon='mdi:close' className='w-4 h-4' />
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
            required={field.required}
          >
            {(formField) =>
              field?.render({
                field: {
                  ...formField,
                  onChange: (value: any) => {
                    formField.onChange(value)
                    onChange?.(field.name, value)
                  },
                },
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
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6", "form-fields-container")}>
      {fields.map((field) => (
        <div
          key={field.name}
          className={cn(
            "w-full",
            "form-field-wrapper",
            "hover:bg-gray-50/50 rounded-lg p-2 -m-2",
            "transition-colors duration-200",
            field.type === "resource" && "md:col-span-2"
          )}
        >
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}

export default DynamicFormFields
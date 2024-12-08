import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Input } from "@/components/ui/input"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"

export const renderResource = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  const [manualInputMode, setManualInputMode] = React.useState(false)

  const toggleManualInput = () => {
    setManualInputMode(!manualInputMode)
    form.setValue(field.name, {})
  }

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
        <div className='space-y-4'>
          {field.resourceConfig?.allowManualInput && (
            <div className='flex justify-end'>
              <Button
                size='sm'
                variant='light'
                color={manualInputMode ? "primary" : "default"}
                onPress={toggleManualInput}
                startContent={
                  <Icon
                    icon={manualInputMode ? "mdi:database-search" : "mdi:keyboard"}
                    className='w-4 h-4'
                  />
                }
              >
                {manualInputMode ? "切换到选择模式" : "切换到手动输入"}
              </Button>
            </div>
          )}

          {manualInputMode ? (
            <div className='space-y-3 p-4 border rounded-lg bg-gray-50/50'>
              {field.resourceConfig?.manualInputFields?.map((inputField) => (
                <div key={inputField.key} className='space-y-1'>
                  <label className='text-sm font-medium text-gray-700'>
                    {inputField.label}
                    {inputField.required && <span className='text-red-500 ml-1'>*</span>}
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
                    className='w-full'
                    required={inputField.required}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Input
                {...formField}
                disabled={!isEditable || field.disabled}
                className={cn(
                  "min-w-[120px] border-0 focus:ring-0 bg-transparent",
                  field.className
                )}
              />
              {isEditable && field.resourceConfig && (
                <ResourceSelectButton
                  resourceName={field.resourceConfig.resourceTitle}
                  selectionMode="single"
                  onSelect={(selected) => {
                    if (selected.length > 0) {
                      formField.onChange(selected[0])
                      onChange?.(field.name, selected[0])
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
          )}
        </div>
      )}
    </FormFieldWrapper>
  )
}
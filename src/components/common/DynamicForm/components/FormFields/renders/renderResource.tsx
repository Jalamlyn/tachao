import React, { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Input } from "@/components/ui/input"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { Spinner } from "@nextui-org/react"

export const renderResource = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  const [manualInputMode, setManualInputMode] = React.useState(false)
  const [loading, setLoading] = useState(false)

  const toggleManualInput = () => {
    setManualInputMode(!manualInputMode)
    form.setValue(field.name, {})
  }

  // 监听值变化,如果是dataid则加载数据
  useEffect(() => {
    const value = form.watch(field.name)

    // 如果配置了使用dataid且有loadDataById方法
    if (
      field.resourceConfig?.useDataId &&
      field.resourceConfig?.loadDataById &&
      value?.dataid &&
      !value?.id // 只有dataid没有完整数据时才加载
    ) {
      setLoading(true)

      field.resourceConfig
        .loadDataById(value.dataid)
        .then((data) => {
          // 更新表单显示值,保持完整对象格式
          form.setValue(field.name, data)
        })
        .catch((err) => {
          console.error("Failed to load resource data:", err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [form.watch(field.name)])
  debugger
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
                  <Icon icon={manualInputMode ? "mdi:database-search" : "mdi:keyboard"} className='w-4 h-4' />
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
                className={cn("min-w-[120px] border-0 focus:ring-0 bg-transparent", field.className)}
              />
              {isEditable && field.resourceConfig && (
                <ResourceSelectButton
                  resourceName={field.resourceConfig.resourceTitle}
                  selectionMode='single'
                  onSelect={(selected) => {
                    if (selected.length > 0) {
                      // 如果使用dataid模式且没有完整数据,只保存dataid
                      if (field.resourceConfig?.useDataId && !selected[0].id) {
                        formField.onChange({
                          dataid: selected[0].dataid,
                          name: selected[0].name || selected[0].title,
                        })
                      } else {
                        // 有完整数据或非dataid模式,保存完整对象
                        formField.onChange(selected[0])
                      }
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
              {loading && <Spinner size='sm' />}
            </div>
          )}
        </div>
      )}
    </FormFieldWrapper>
  )
}

import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Input } from "@/components/ui/input"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import { cn } from "@/theme/cn"

export const renderUpload = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
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
              "transition-colors duration-200",
              field.className
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
}
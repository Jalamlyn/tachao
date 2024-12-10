import React, { useState, useCallback, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Input } from "@/components/ui/input"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import message from "@/components/Message"
import { useMetadata } from "@/hooks/metadata"

export const renderResource = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  const [loading, setLoading] = useState(false)
  const { getDetail } = useMetadata(field.resourceConfig?.resourceId || "")

  // 监听值变化,如果是dataid则加载数据
  useEffect(() => {
    const loadData = async () => {
      const value = form.watch(field.name)
      if (field.resourceConfig?.resourceId && value?.dataid) {
        setLoading(true)
        try {
          const { data } = await getDetail(value.dataid)
          if (data) {
            form.setValue(field.name, {
              ...value,
              displayData: data
            })
          }
        } catch (error) {
          console.error("Failed to load resource data:", error)
          message.error("加载资源数据失败")
        } finally {
          setLoading(false)
        }
      }
    }
    loadData()
  }, [form.watch(field.name)])

  const handleClear = () => {
    if (!isEditable) return
    form.setValue(field.name, undefined)
    onChange?.(field.name, undefined)
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
      {(formField) => {
        const value = formField.value
        const displayData = value?.displayData
        const isMultiple = field.resourceConfig?.multiple
        const displayMode = field.resourceConfig?.displayMode || "card"
        const isFieldEditable = isEditable && !field.disabled

        if (!displayData) {
          return (
            <div className={cn(
              'min-h-[120px] border-2 border-dashed border-gray-200 rounded-lg transition-colors duration-200',
              isFieldEditable ? 'hover:border-gray-300 cursor-pointer' : 'opacity-50 cursor-not-allowed'
            )}>
              <div className='h-full flex flex-col items-center justify-center p-6'>
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                    <span>加载中...</span>
                  </div>
                ) : isFieldEditable ? (
                  <ResourceSelectButton
                    resourceName={field.resourceConfig?.resourceId || ""}
                    selectionMode={isMultiple ? "multiple" : "single"}
                    onSelect={(selected) => {
                      if (selected.length > 0) {
                        const dataids = selected.map((item) => item.dataid)
                        formField.onChange({
                          dataid: isMultiple ? dataids : dataids[0],
                          displayData: isMultiple ? selected : selected[0],
                        })
                        onChange?.(field.name, {
                          dataid: isMultiple ? dataids : dataids[0],
                          displayData: isMultiple ? selected : selected[0],
                        })
                      }
                    }}
                    buttonText='选择'
                    buttonProps={{
                      size: "lg",
                      variant: "light",
                      className: "w-full flex items-center justify-center gap-2",
                      startContent: <Icon icon='material-symbols:add-circle-outline' className='text-xl' />,
                      isDisabled: !isFieldEditable
                    }}
                  />
                ) : (
                  <div className="text-gray-500 flex items-center gap-2">
                    <Icon icon="mdi:lock" className="w-5 h-5" />
                    <span>请点击"填写表单"按钮开始编辑</span>
                  </div>
                )}
              </div>
            </div>
          )
        }

        return (
          <div className='space-y-4'>
            <div className='space-y-4'>
              {displayMode === "card" ? (
                <div className='grid grid-cols-1 gap-4'>
                  {(isMultiple ? displayData : [displayData]).map((item: any, index: number) => (
                    <div 
                      key={index} 
                      className={cn(
                        'border rounded-lg p-4 bg-white',
                        !isFieldEditable && 'opacity-50'
                      )}
                    >
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {(
                          field.resourceConfig?.displayFields || 
                          Object.keys(item).map((key) => ({ key, label: key }))
                        ).map((displayField) => (
                          <div key={displayField.key} className='space-y-1'>
                            <span className='text-sm font-medium text-gray-500'>{displayField.label}</span>
                            <div className='text-sm'>
                              {displayField.render
                                ? displayField.render(item[displayField.key])
                                : String(item[displayField.key] || "-")}
                            </div>
                          </div>
                        ))}
                      </div>
                      {isFieldEditable && (
                        <div className='mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2'>
                          <ResourceSelectButton
                            resourceName={field.resourceConfig?.resourceId || ""}
                            selectionMode={isMultiple ? "multiple" : "single"}
                            onSelect={(selected) => {
                              if (selected.length > 0) {
                                const dataids = selected.map((item) => item.dataid)
                                formField.onChange({
                                  dataid: isMultiple ? dataids : dataids[0],
                                  displayData: isMultiple ? selected : selected[0],
                                })
                                onChange?.(field.name, {
                                  dataid: isMultiple ? dataids : dataids[0],
                                  displayData: isMultiple ? selected : selected[0],
                                })
                              }
                            }}
                            buttonText='更换'
                            buttonProps={{
                              size: "sm",
                              variant: "light",
                              className: "min-w-[80px] md:min-w-[100px]",
                              startContent: <Icon icon='material-symbols:sync' className='text-lg' />,
                              isDisabled: !isFieldEditable
                            }}
                          />
                          <Button
                            size='sm'
                            variant='light'
                            color='danger'
                            className='min-w-[80px] md:min-w-[100px]'
                            onClick={handleClear}
                            isDisabled={!isFieldEditable}
                            startContent={<Icon icon='material-symbols:remove' className='text-lg' />}
                          >
                            移除
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <div className='min-w-[400px]'>
                    <table className={cn(
                      'w-full border-collapse',
                      !isFieldEditable && 'opacity-50'
                    )}>
                      <thead>
                        <tr className='bg-gray-50'>
                          {(
                            field.resourceConfig?.displayFields ||
                            Object.keys(isMultiple ? displayData[0] : displayData).map((key) => ({ key, label: key }))
                          ).map((displayField) => (
                            <th
                              key={displayField.key}
                              className='p-2 text-left text-sm font-medium text-gray-500 border border-gray-200'
                              style={{ width: displayField.width }}
                            >
                              {displayField.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(isMultiple ? displayData : [displayData]).map((item: any, index: number) => (
                          <tr key={index} className='hover:bg-gray-50'>
                            {(
                              field.resourceConfig?.displayFields ||
                              Object.keys(item).map((key) => ({ key, label: key }))
                            ).map((displayField) => (
                              <td key={displayField.key} className='p-2 text-sm border border-gray-200'>
                                {displayField.render
                                  ? displayField.render(item[displayField.key])
                                  : String(item[displayField.key] || "-")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {isFieldEditable && (
                      <div className='mt-4 flex justify-end gap-2'>
                        <ResourceSelectButton
                          resourceName={field.resourceConfig?.resourceId || ""}
                          selectionMode={isMultiple ? "multiple" : "single"}
                          onSelect={(selected) => {
                            if (selected.length > 0) {
                              const dataids = selected.map((item) => item.dataid)
                              formField.onChange({
                                dataid: isMultiple ? dataids : dataids[0],
                                displayData: isMultiple ? selected : selected[0],
                              })
                              onChange?.(field.name, {
                                dataid: isMultiple ? dataids : dataids[0],
                                displayData: isMultiple ? selected : selected[0],
                              })
                            }
                          }}
                          buttonText='更换'
                          buttonProps={{
                            size: "sm",
                            variant: "light",
                            className: "min-w-[80px] md:min-w-[100px]",
                            startContent: <Icon icon='material-symbols:sync' className='text-lg' />,
                            isDisabled: !isFieldEditable
                          }}
                        />
                        <Button
                          size='sm'
                          variant='light'
                          color='danger'
                          className='min-w-[80px] md:min-w-[100px]'
                          onClick={handleClear}
                          isDisabled={!isFieldEditable}
                          startContent={<Icon icon='material-symbols:remove' className='text-lg' />}
                        >
                          移除
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }}
    </FormFieldWrapper>
  )
}
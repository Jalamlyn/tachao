import React, { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, ResourceValue } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Card, CardBody } from "@nextui-org/react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import { Spinner } from "@nextui-org/react"

export const renderResource = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  const [loading, setLoading] = useState(false)

  // 监听值变化,如果是dataid则加载数据
  useEffect(() => {
    const value = form.watch(field.name) as ResourceValue

    if (
      field.resourceConfig?.loadDataById &&
      value?.dataid &&
      !value?.displayData // 只有dataid没有完整数据时才加载
    ) {
      setLoading(true)

      field.resourceConfig
        .loadDataById(value.dataid)
        .then((data) => {
          // 更新表单显示值,保持完整对象格式
          form.setValue(field.name, {
            dataid: value.dataid,
            displayData: data
          })
        })
        .catch((err) => {
          console.error("Failed to load resource data:", err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [form.watch(field.name)])

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
        const value = formField.value as ResourceValue
        const displayData = value?.displayData
        const isMultiple = field.resourceConfig?.multiple
        const displayMode = field.resourceConfig?.displayMode || 'card'

        return (
          <div className='space-y-4'>
            {/* 选择按钮 */}
            <div className='flex items-center gap-2'>
              <ResourceSelectButton
                resourceName={field.resourceConfig?.resourceTitle || ''}
                selectionMode={isMultiple ? 'multiple' : 'single'}
                onSelect={(selected) => {
                  if (selected.length > 0) {
                    const dataids = selected.map(item => item.dataid)
                    formField.onChange({
                      dataid: isMultiple ? dataids : dataids[0],
                      displayData: isMultiple ? selected : selected[0]
                    })
                    onChange?.(field.name, {
                      dataid: isMultiple ? dataids : dataids[0],
                      displayData: isMultiple ? selected : selected[0]
                    })
                  }
                }}
                buttonText='选择'
                buttonProps={{
                  size: "sm",
                  className: "px-2 py-1 h-8",
                }}
              />
              {loading && <Spinner size='sm' />}
            </div>

            {/* 显示数据 */}
            {displayData && (
              <div className='space-y-4'>
                {displayMode === 'card' ? (
                  // 卡片模式
                  <div className='grid grid-cols-1 gap-4'>
                    {(isMultiple ? displayData : [displayData]).map((item: any, index: number) => (
                      <Card key={index} className='w-full'>
                        <CardBody className='p-4'>
                          <div className='grid grid-cols-2 gap-4'>
                            {(field.resourceConfig?.displayFields || Object.keys(item).map(key => ({ key, label: key }))).map((displayField) => (
                              <div key={displayField.key} className='space-y-1'>
                                <span className='text-sm font-medium text-gray-500'>{displayField.label}</span>
                                <div className='text-sm'>
                                  {displayField.render ? 
                                    displayField.render(item[displayField.key]) : 
                                    String(item[displayField.key] || '-')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // 表格模式
                  <div className='overflow-x-auto'>
                    <table className='w-full min-w-[400px] border-collapse'>
                      <thead>
                        <tr className='bg-gray-50'>
                          {(field.resourceConfig?.displayFields || Object.keys(isMultiple ? displayData[0] : displayData).map(key => ({ key, label: key }))).map((displayField) => (
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
                            {(field.resourceConfig?.displayFields || Object.keys(item).map(key => ({ key, label: key }))).map((displayField) => (
                              <td key={displayField.key} className='p-2 text-sm border border-gray-200'>
                                {displayField.render ? 
                                  displayField.render(item[displayField.key]) : 
                                  String(item[displayField.key] || '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      }}
    </FormFieldWrapper>
  )
}
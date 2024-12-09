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

  const handleClear = () => {
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
        const value = formField.value as ResourceValue
        const displayData = value?.displayData
        const isMultiple = field.resourceConfig?.multiple
        const displayMode = field.resourceConfig?.displayMode || 'card'

        if (!displayData) {
          return (
            <div className="min-h-[120px] border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200">
              <div className="h-full flex flex-col items-center justify-center p-6 cursor-pointer">
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <ResourceSelectButton
                    resourceName={field.resourceConfig?.resourceId || ''}
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
                    buttonText="点击选择资源"
                    buttonProps={{
                      size: "lg",
                      variant: "light",
                      className: "w-full flex items-center justify-center gap-2",
                      startContent: <Icon icon="material-symbols:add-circle-outline" className="text-xl" />
                    }}
                  />
                )}
                <p className="mt-2 text-sm text-gray-500">
                  {isMultiple ? "可以选择多个资源" : "请选择一个资源"}
                </p>
              </div>
            </div>
          )
        }

        return (
          <div className='space-y-4'>
            {/* 显示数据 */}
            <div className='space-y-4'>
              {displayMode === 'card' ? (
                // 卡片模式
                <div className='grid grid-cols-1 gap-4'>
                  {(isMultiple ? displayData : [displayData]).map((item: any, index: number) => (
                    <Card key={index} className='w-full relative group'>
                      {/* 操作按钮组 */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                        <ResourceSelectButton
                          resourceName={field.resourceConfig?.resourceId || ''}
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
                          buttonText="编辑"
                          buttonProps={{
                            size: "sm",
                            variant: "flat",
                            className: "px-2 py-1 h-8",
                            startContent: <Icon icon="material-symbols:edit-outline" className="text-lg" />
                          }}
                        />
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          className="px-2 py-1 h-8"
                          onClick={handleClear}
                          startContent={<Icon icon="material-symbols:delete-outline" className="text-lg" />}
                        >
                          删除
                        </Button>
                      </div>
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
                <div className='overflow-x-auto relative'>
                  {/* 操作按钮组 */}
                  <div className="absolute right-2 top-2 opacity-0 hover:opacity-100 transition-opacity duration-200 flex gap-2 z-10">
                    <ResourceSelectButton
                      resourceName={field.resourceConfig?.resourceId || ''}
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
                      buttonText="编辑"
                      buttonProps={{
                        size: "sm",
                        variant: "flat",
                        className: "px-2 py-1 h-8",
                        startContent: <Icon icon="material-symbols:edit-outline" className="text-lg" />
                      }}
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      className="px-2 py-1 h-8"
                      onClick={handleClear}
                      startContent={<Icon icon="material-symbols:delete-outline" className="text-lg" />}
                    >
                      删除
                    </Button>
                  </div>
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
          </div>
        )
      }}
    </FormFieldWrapper>
  )
}
import React, { useState, useCallback, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, ResourceValue } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Card, CardBody } from "@nextui-org/react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import { Spinner } from "@nextui-org/react"
import { apiService } from "@/service/apis/api"
import message from "@/components/Message"

// 统一的资源加载服务
const ResourceService = {
  async loadResourceData(resourceId: string, dataid: string | string[]) {
    try {
      const response = await apiService.post(`/public/data/${resourceId}/find`, {
        filter: {
          dataid: Array.isArray(dataid) ? { $in: dataid } : dataid
        }
      })
      return Array.isArray(dataid) ? response.data : response.data[0]
    } catch (error) {
      console.error("Failed to load resource data:", error)
      throw error
    }
  }
}

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

    if (value?.dataid && !value?.displayData) {
      const loadData = async () => {
        setLoading(true)
        try {
          // 优先使用配置的loadDataById（向后兼容）
          const data = field.resourceConfig?.loadDataById
            ? await field.resourceConfig.loadDataById(value.dataid)
            : await ResourceService.loadResourceData(field.resourceConfig?.resourceId!, value.dataid)

          // 更新表单显示值,保持完整对象格式
          form.setValue(field.name, {
            dataid: value.dataid,
            displayData: data
          })
        } catch (error) {
          console.error("Failed to load resource data:", error)
          message.error("加载资源数据失败")
        } finally {
          setLoading(false)
        }
      }

      if (field.resourceConfig?.resourceId || field.resourceConfig?.loadDataById) {
        loadData()
      }
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
        const displayMode = field.resourceConfig?.displayMode || "card"

        if (!displayData) {
          return (
            <div className='min-h-[120px] border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200'>
              <div className='h-full flex flex-col items-center justify-center p-6 cursor-pointer'>
                {loading ? (
                  <Spinner size='sm' />
                ) : (
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
                    }}
                  />
                )}
              </div>
            </div>
          )
        }

        return (
          <div className='space-y-4'>
            {/* 显示数据 */}
            <div className='space-y-4'>
              {displayMode === "card" ? (
                // 卡片模式
                <div className='grid grid-cols-1 gap-4'>
                  {(isMultiple ? displayData : [displayData]).map((item: any, index: number) => (
                    <Card key={index} className='w-full'>
                      <CardBody className='p-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          {(
                            field.resourceConfig?.displayFields || Object.keys(item).map((key) => ({ key, label: key }))
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
                        {/* 操作按钮 - 固定在底部 */}
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
                              size: "md",
                              variant: "light",
                              className: "min-w-[80px] md:min-w-[100px]",
                              startContent: <Icon icon='material-symbols:sync' className='text-lg' />,
                            }}
                          />
                          <Button
                            size='md'
                            variant='light'
                            color='danger'
                            className='min-w-[80px] md:min-w-[100px]'
                            onClick={handleClear}
                            startContent={<Icon icon='material-symbols:remove' className='text-lg' />}
                          >
                            移除
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                // 表格模式
                <div className='overflow-x-auto'>
                  <div className='min-w-[400px]'>
                    <table className='w-full border-collapse'>
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
                    {/* 表格模式下的操作按钮 */}
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
                          size: "md",
                          variant: "light",
                          className: "min-w-[80px] md:min-w-[100px]",
                          startContent: <Icon icon='material-symbols:sync' className='text-lg' />,
                        }}
                      />
                      <Button
                        size='md'
                        variant='light'
                        color='danger'
                        className='min-w-[80px] md:min-w-[100px]'
                        onClick={handleClear}
                        startContent={<Icon icon='material-symbols:remove' className='text-lg' />}
                      >
                        移除
                      </Button>
                    </div>
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
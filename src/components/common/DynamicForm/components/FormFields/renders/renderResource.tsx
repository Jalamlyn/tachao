import React, { useState, useCallback, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, ResourceValue } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Card, CardBody } from "@nextui-org/react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import { Spinner } from "@nextui-org/react"
import { useMetadata } from "@/hooks/metadata"
import message from "@/components/Message"

export const renderResource = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  const [loading, setLoading] = useState(false)
  const [resourceData, setResourceData] = useState<any>(null)
  const { getDetail } = useMetadata("resource")
  const value = form.watch(field.name) as ResourceValue
  const isMultiple = field.resourceConfig?.multiple

  // 从缓存获取资源数据
  const getResourceFromCache = (resourceId: string, dataid: string) => {
    try {
      const key = `resource_${resourceId}_${dataid}`
      const cached = sessionStorage.getItem(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error("Error getting resource from cache:", error)
      return null
    }
  }

  // 设置缓存
  const setResourceCache = (resourceId: string, dataid: string, data: any) => {
    const key = `resource_${resourceId}_${dataid}`
    sessionStorage.setItem(key, JSON.stringify(data))
  }

  // 加载资源数据
  useEffect(() => {
    const loadResourceData = async () => {
      if (!field.resourceConfig?.resourceId || !value?.dataid) return

      setLoading(true)
      try {
        const dataids = Array.isArray(value.dataid) ? value.dataid : [value.dataid]
        const loadedData = { data: [] }

        for (const dataid of dataids) {
          // 先查缓存
          const cached = getResourceFromCache(field.resourceConfig.resourceId, dataid)
          if (cached) {
            loadedData.data.push(cached)
            continue
          }

          // 缓存未命中则请求
          const data = await getDetail(field.resourceConfig.resourceId)
          if (data) {
            const row = data.data.find((row: any) => row.dataid === dataid)
            if (row) {
              setResourceCache(field.resourceConfig.resourceId, dataid, row)
              loadedData.data.push(row)
            }
          }
        }

        setResourceData(loadedData)
      } catch (error) {
        console.error("Failed to load resource:", error)
        message.error("加载资源失败")
      } finally {
        setLoading(false)
      }
    }

    loadResourceData()
  }, [field.resourceConfig?.resourceId, value?.dataid])

  const handleClear = () => {
    form.setValue(field.name, undefined)
    setResourceData(null)
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
        if (!resourceData?.data?.length) {
          return (
            <div className='min-h-[48px] border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200'>
              <div className='h-full flex flex-col items-center justify-center p-1 cursor-pointer'>
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
                        })
                        onChange?.(field.name, {
                          dataid: isMultiple ? dataids : dataids[0],
                        })
                      }
                    }}
                    buttonText='选择'
                    buttonProps={{
                      size: "lg",
                      variant: "light",
                      isDisabled: !isEditable,
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
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-4'>
                {resourceData.data.map((item: any, index: number) => (
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
                      {isEditable && (
                        <div className='mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2'>
                          <ResourceSelectButton
                            resourceName={field.resourceConfig?.resourceId || ""}
                            selectionMode={isMultiple ? "multiple" : "single"}
                            onSelect={(selected) => {
                              if (selected.length > 0) {
                                const dataids = selected.map((item) => item.dataid)
                                formField.onChange({
                                  dataid: isMultiple ? dataids : dataids[0],
                                })
                                onChange?.(field.name, {
                                  dataid: isMultiple ? dataids : dataids[0],
                                })
                              }
                            }}
                            buttonText='更换'
                            buttonProps={{
                              size: "md",
                              variant: "light",
                              isDisabled: !isEditable,
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
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )
      }}
    </FormFieldWrapper>
  )
}

import React, { useState, useEffect } from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { ResourceFieldGroupProps, FieldConfig } from "./types"
import ResourceSelectModal from "./ResourceSelectModal"
import { cn } from "@/theme/cn"

const ResourceFieldGroup: React.FC<ResourceFieldGroupProps> = ({
  resourceTitle,
  value,
  onChange,
  disabled,
  onDataSelect,
  form,
}) => {
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<any>(null)
  const { load: loadResources, getDetail: getResourceDetail } = useMetadata("resource")

  // 处理初始值
  useEffect(() => {
    if (value) {
      setSelectedData(value)
    }
  }, [value])

  useEffect(() => {
    const initializeFields = async () => {
      try {
        const resources = await loadResources()
        const resource = resources.find((r) => r.title === resourceTitle)
        if (!resource) {
          message.error(`未找到资料: ${resourceTitle}`)
          return
        }

        const detail = await getResourceDetail(resource.id)
        if (!detail?.data?.length) {
          message.error(`资料数据为空: ${resourceTitle}`)
          return
        }

        const fieldConfigs = Object.keys(detail.data[0]).map((key) => ({
          key,
          label: key,
          value: detail.data[0][key],
        }))

        setFields(fieldConfigs)
      } catch (error) {
        console.error("Error initializing fields:", error)
        message.error("初始化字段失败")
      }
    }

    initializeFields()
  }, [resourceTitle])

  const handleSelect = (data: any) => {
    setSelectedData(data)
    onDataSelect?.(data)
    onChange?.(data)

    if (form) {
      Object.entries(data).forEach(([key, value]) => {
        form.setValue(key, value, {
          shouldValidate: false,
        })
      })
    }
  }

  return (
    <div
      className={cn(
        "mt-2 rounded-xl border border-gray-200 bg-white transition-all duration-200",
        "hover:border-primary-100 hover:shadow-sm"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 p-3",
          "bg-gray-50/30 rounded-t-xl border-b border-gray-100"
        )}
      >
        <div className='flex items-center gap-3'>
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={disabled}
            variant='light'
            color={`${disabled ? "default" : "primary"}`}
            size='sm'
            startContent={<Icon icon='mdi:database-search' className='w-4 h-4' />}
            className={cn(
              "font-medium",
              "hover:bg-primary-50 hover:text-primary-600",
              "transition-colors duration-200"
            )}
          >
            选择 {resourceTitle}
          </Button>
        </div>
        {selectedData && (
          <div>
            <Button
              size='sm'
              variant='light'
              color='danger'
              isIconOnly
              onClick={() => {
                setSelectedData(null)
                onChange?.(null)
                onDataSelect?.(null)
                if (form) {
                  fields.forEach((field) => {
                    form.setValue(field.key, null)
                  })
                }
              }}
              className='hover:bg-red-50'
            >
              <Icon icon='mdi:close' className='w-4 h-4' />
            </Button>
          </div>
        )}
      </div>

      {selectedData && (
        <div className='p-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {fields.map((field) => (
              <div
                key={field.key}
                className={cn(
                  "group flex items-start gap-3 p-3 rounded-lg",
                  "bg-gray-50/30 hover:bg-primary-50/30",
                  "transition-colors duration-200"
                )}
              >
                <Icon
                  icon={getFieldIcon(field.key)}
                  className='w-4 h-4 mt-0.5 text-gray-400 group-hover:text-primary-500'
                />
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium text-gray-500 mb-1'>{field.label}</div>
                  <div className='text-sm text-gray-900 break-all'>{selectedData[field.key] || "-"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ResourceSelectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        resourceTitle={resourceTitle}
        fields={fields}
      />
    </div>
  )
}

const getFieldIcon = (key: string): string => {
  return "mdi:format-list-text"
}

export default ResourceFieldGroup

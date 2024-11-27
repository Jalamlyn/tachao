import React, { useState, useEffect } from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { ResourceFieldGroupProps, FieldConfig } from "./types"
import ResourceSelectModal from "./ResourceSelectModal"

const ResourceFieldGroup: React.FC<ResourceFieldGroupProps> = ({
  resourceTitle,
  value,
  onChange,
  disabled,
  onDataSelect,
  form
}) => {
  // 内部状态
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<any>(null)
  const { load: loadResources, getDetail: getResourceDetail } = useMetadata("resource")

  // 资源加载和字段初始化
  useEffect(() => {
    const initializeFields = async () => {
      try {
        const resources = await loadResources()
        const resource = resources.find(r => r.title === resourceTitle)
        if (!resource) {
          message.error(`未找到资料: ${resourceTitle}`)
          return
        }

        const detail = await getResourceDetail(resource.id)
        if (!detail?.data?.length) {
          message.error(`资料数据为空: ${resourceTitle}`)
          return
        }

        // 根据数据结构生成字段配置
        const fieldConfigs = Object.keys(detail.data[0]).map(key => ({
          key,
          label: key,
          value: detail.data[0][key]
        }))

        setFields(fieldConfigs)
      } catch (error) {
        console.error("Error initializing fields:", error)
        message.error("初始化字段失败")
      }
    }

    initializeFields()
  }, [resourceTitle])

  // 处理数据选择
  const handleSelect = (data: any) => {
    // 1. 更新内部选中状态
    setSelectedData(data)
    
    // 2. 触发外部数据选择回调
    onDataSelect?.(data)
    
    // 3. 触发 onChange
    onChange?.(data)
    
    // 4. 如果提供了form，自动填充所有字段
    if (form) {
      Object.keys(data).forEach(key => {
        form.setValue(key, data[key])
      })
    }
    
    // 5. 关闭弹窗
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      {/* 选择按钮和状态显示 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={disabled}
            variant="bordered"
            size="sm"
            startContent={<Icon icon="mdi:database-search" />}
          >
            选择{resourceTitle}
          </Button>
          {selectedData && (
            <span className="text-sm text-gray-500">
              已选择: {selectedData[fields[0]?.key]}
            </span>
          )}
        </div>
        {selectedData && (
          <Button
            size="sm"
            variant="light"
            color="danger"
            isIconOnly
            onClick={() => {
              setSelectedData(null)
              onChange?.(null)
              onDataSelect?.(null)
              // 如果提供了form，清空所有字段
              if (form) {
                fields.forEach(field => {
                  form.setValue(field.key, null)
                })
              }
            }}
          >
            <Icon icon="mdi:close" className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 字段值显示 */}
      {selectedData && (
        <div className="space-y-2 mt-4">
          {fields.map(field => (
            <div 
              key={field.key}
              className="grid grid-cols-3 gap-4 py-2 px-3 bg-white rounded border border-gray-100"
            >
              <span className="text-sm font-medium text-gray-500">
                {field.label}
              </span>
              <span className="text-sm text-gray-700 col-span-2">
                {selectedData[field.key] || '-'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 选择弹窗 */}
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

export default ResourceFieldGroup
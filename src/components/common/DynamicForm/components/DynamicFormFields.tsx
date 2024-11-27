import React, { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField as DynamicFormField, FormFieldGroup, StaticFieldGroup, DynamicFieldGroup } from "../types"
import { Tabs, Tab } from "@nextui-org/react"
import { cn } from "@/theme/cn"
import FormFields from "./FormFields"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"

interface FieldsWithGroups {
  groups: FormFieldGroup[]
  defaultGroup?: string
}

interface DynamicFormFieldsProps {
  fields: DynamicFormField[] | FieldsWithGroups
  form: UseFormReturn<any>
  isEditable?: boolean
  onChange?: (fieldName: string, value: any) => void
}

const DynamicFormFieldsWrapper: React.FC<DynamicFormFieldsProps> = ({ fields, form, isEditable, onChange }) => {
  const [dynamicFields, setDynamicFields] = useState<{ [key: string]: DynamicFormField[] }>({})
  const { getDetail: getResourceDetail } = useMetadata("resource")
  const { load: loadResources } = useMetadata("resource")

  // 处理动态字段生成
  const generateDynamicFields = async (group: DynamicFieldGroup) => {
    try {
      // 1. 加载资源列表
      const resources = await loadResources()
      const resource = resources.find(r => r.title === group.resourceTitle)
      
      if (!resource) {
        message.error(`未找到资料: ${group.resourceTitle}`)
        return []
      }

      // 2. 获取资源详情
      const detail = await getResourceDetail(resource.id)
      if (!detail?.data?.length) {
        message.error(`资料数据为空: ${group.resourceTitle}`)
        return []
      }

      // 3. 根据数据结构生成字段
      const fields = Object.keys(detail.data[0]).map((key, index) => ({
        name: `${group.key}_${key}`,
        label: key,
        type: "text" as const,
        readOnly: index > 0,
        render: index === 0 ? (props: any) => (
          <Button 
            onClick={() => openSelectModal(detail.data, group.key)}
            variant="bordered"
            size="sm"
          >
            {props.value || "选择数据"}
          </Button>
        ) : undefined
      }))

      return fields
    } catch (error) {
      console.error("Error generating dynamic fields:", error)
      message.error("生成动态字段失败")
      return []
    }
  }

  // 加载动态字段
  useEffect(() => {
    const loadDynamicFields = async () => {
      if ('groups' in fields) {
        const dynamicGroups = fields.groups.filter((g): g is DynamicFieldGroup => g.type === 'dynamic')
        const newDynamicFields: { [key: string]: DynamicFormField[] } = {}
        
        for (const group of dynamicGroups) {
          newDynamicFields[group.key] = await generateDynamicFields(group)
        }
        
        setDynamicFields(newDynamicFields)
      }
    }

    loadDynamicFields()
  }, [fields])

  // 检查是否使用分组配置
  if (!fields || typeof fields !== 'object' || !('groups' in fields)) {
    // 处理普通字段数组
    const fieldArray = Array.isArray(fields) ? fields : [fields]
    return <FormFields fields={fieldArray} form={form} isEditable={isEditable} onChange={onChange} />
  }

  // 处理分组配置
  const { groups, defaultGroup } = fields as FieldsWithGroups
  const [selectedGroup, setSelectedGroup] = React.useState(defaultGroup || groups[0]?.key)

  if (!groups?.length) {
    return null
  }

  return (
    <div className="space-y-6">
      <Tabs 
        selectedKey={selectedGroup} 
        onSelectionChange={(key) => setSelectedGroup(key.toString())}
        variant="underlined"
        classNames={{
          tabList: "gap-6",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-2 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}
      >
        {groups.map((group) => (
          <Tab
            key={group.key}
            title={
              <div className="flex items-center gap-2">
                {group.icon && <span className="text-xl">{group.icon}</span>}
                <span>{group.title}</span>
              </div>
            }
          >
            <div className={cn("py-4", "transition-all duration-200")}>
              {group.description && (
                <p className="text-sm text-gray-500 mb-4">{group.description}</p>
              )}
              {group.type === 'static' ? (
                <FormFields
                  fields={(group as StaticFieldGroup).fields}
                  form={form}
                  isEditable={isEditable}
                  onChange={onChange}
                />
              ) : (
                <FormFields
                  fields={dynamicFields[group.key] || []}
                  form={form}
                  isEditable={isEditable}
                  onChange={onChange}
                />
              )}
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  )
}

export default DynamicFormFieldsWrapper
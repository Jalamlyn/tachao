import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField as DynamicFormField, FormFieldGroup } from "../types"
import DynamicFormFields from "./FormFields"
import { Tabs, Tab } from "@nextui-org/react"
import { cn } from "@/theme/cn"

interface DynamicFormFieldsProps {
  fields: DynamicFormField[] | { groups: FormFieldGroup[], defaultGroup?: string }
  form: UseFormReturn<any>
  isEditable?: boolean
  onChange?: (fieldName: string, value: any) => void
}

const DynamicFormFieldsWrapper: React.FC<DynamicFormFieldsProps> = ({ fields, form, isEditable, onChange }) => {
  // 检查是否使用分组配置
  if (Array.isArray(fields)) {
    return <DynamicFormFields fields={fields} form={form} isEditable={isEditable} onChange={onChange} />
  }

  // 处理分组配置
  const { groups, defaultGroup } = fields
  const [selectedGroup, setSelectedGroup] = React.useState(defaultGroup || groups[0]?.key)

  if (!groups.length) {
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
              <DynamicFormFields
                fields={group.fields}
                form={form}
                isEditable={isEditable}
                onChange={onChange}
              />
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  )
}

export default DynamicFormFieldsWrapper
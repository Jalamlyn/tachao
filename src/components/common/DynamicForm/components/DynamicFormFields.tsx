import React, { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField as DynamicFormField, FormFieldGroup } from "../types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/theme/cn"
import FormFields from "./FormFields"

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
  // 检查是否使用分组配置
  if (!fields || typeof fields !== "object" || !("groups" in fields)) {
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
    <div className='space-y-6'>
      <Tabs value={selectedGroup} onValueChange={setSelectedGroup} className="w-full">
        <TabsList className="w-full">
          {groups.map((group) => (
            <TabsTrigger
              key={group.key}
              value={group.key}
              className={cn(
                "flex items-center gap-2",
                "data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600",
                "transition-all duration-200"
              )}
            >
              {group.icon && <span className='text-xl'>{group.icon}</span>}
              <span>{group.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {groups.map((group) => (
          <TabsContent
            key={group.key}
            value={group.key}
            className={cn("py-4", "transition-all duration-200")}
          >
            {group.description && <p className='text-sm text-gray-500 mb-4'>{group.description}</p>}
            <FormFields fields={group.fields} form={form} isEditable={isEditable} onChange={onChange} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default DynamicFormFieldsWrapper
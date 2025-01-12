import React, { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField as DynamicFormField, FormFieldGroup } from "../types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/theme/cn"
import FormFields from "./FormFields"
import { Icon } from "@iconify/react"
import styles from "../styles/DynamicForm.module.css"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface FieldsWithGroups {
  groups: FormFieldGroup[]
  defaultGroup?: string
  layout?: 'tabs' | 'vertical' // 新增布局选项
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
  const { groups, defaultGroup, layout = 'vertical' } = fields as FieldsWithGroups
  const [selectedGroup, setSelectedGroup] = React.useState(defaultGroup || groups[0]?.key)
  const [hasScroll, setHasScroll] = React.useState(false)

  // 检查是否需要显示滚动阴影
  React.useEffect(() => {
    if (layout === 'tabs') {
      const tabsList = document.querySelector(`.${styles["tabs-list-scroll"]}`)
      if (tabsList) {
        const checkScroll = () => {
          setHasScroll(tabsList.scrollWidth > tabsList.clientWidth)
        }
        checkScroll()
        window.addEventListener("resize", checkScroll)
        return () => window.removeEventListener("resize", checkScroll)
      }
    }
  }, [groups, layout])

  if (!groups?.length) {
    return null
  }
  // 垂直布局渲染
  if (layout === 'vertical') {
    return (
      <div className='space-y-6'>
        <AnimatePresence>
          {groups.map((group, index) => (
            <motion.div
              key={group.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={cn(
                "t-all duration-200",
                "hover:shadow-md"
              )}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    {group.icon && <Icon icon={group.icon} className="w-5 h-5 text-gray-500" />}
                    <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                  )}
                </CardHeader>
                <CardContent className={cn("py-4 t-all duration-200")}>
                  <FormFields fields={group.fields} form={form} isEditable={isEditable} onChange={onChange} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  // Tabs布局渲染（原有功能）
  return (
    <div className='space-y-6'>
      <Tabs value={selectedGroup} onValueChange={setSelectedGroup}>
        <div className={styles["tabs-scroll-container"]}>
          <TabsList
            className={cn(
              styles["tabs-list-scroll"],
              "w-full flex justify-start",
              hasScroll && styles["tabs-scroll-shadow"]
            )}
          >
            {groups.map((group) => (
              <TabsTrigger key={group.key} value={group.key}>
                {group.icon && <Icon icon={group.icon} className='mr-1' />}
                <span>{group.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {groups.map((group) => (
          <TabsContent key={group.key} value={group.key} className={cn("py-4", "t-all duration-200")}>
            {group.description && <p className='text-sm text-gray-500 mb-4'>{group.description}</p>}
            <FormFields fields={group.fields} form={form} isEditable={isEditable} onChange={onChange} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default DynamicFormFieldsWrapper
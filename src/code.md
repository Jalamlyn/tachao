      <Project>
                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/DynamicFormFields.tsx">
                    <FileContent>
                      import React, { useState } from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField as DynamicFormField, FormFieldGroup } from "../types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/theme/cn"
import FormFields from "./FormFields"
import { Icon } from "@iconify/react"
import styles from "../styles/DynamicForm.module.css"

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
const [hasScroll, setHasScroll] = React.useState(false)

// 检查是否需要显示滚动阴影
React.useEffect(() => {
const tabsList = document.querySelector(`.${styles["tabs-list-scroll"]}`)
if (tabsList) {
const checkScroll = () => {
setHasScroll(tabsList.scrollWidth > tabsList.clientWidth)
}
checkScroll()
window.addEventListener("resize", checkScroll)
return () => window.removeEventListener("resize", checkScroll)
}
}, [groups])

if (!groups?.length) {
return null
}

return (
<div className='space-y-6'>
<Tabs value={selectedGroup} onValueChange={setSelectedGroup}>
<div className={styles["tabs-scroll-container"]}>
<TabsList
className={cn(
styles["tabs-list-scroll"],
"w-full flex justify-start",
hasScroll && styles["tabs-scroll-shadow"]
)} >
{groups.map((group) => (
<TabsTrigger key={group.key} value={group.key}>
{group.icon && <Icon icon={group.icon} className='mr-1' />}
<span>{group.title}</span>
</TabsTrigger>
))}
</TabsList>
</div>
{groups.map((group) => (
<TabsContent key={group.key} value={group.key} className={cn("py-4", "transition-all duration-200")}>
{group.description && <p className='text-sm text-gray-500 mb-4'>{group.description}</p>}
<FormFields fields={group.fields} form={form} isEditable={isEditable} onChange={onChange} />
</TabsContent>
))}
</Tabs>
</div>
)
}

export default DynamicFormFieldsWrapper

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/DynamicProcessConfirm.tsx">
                    <FileContent>
                      import React, { useEffect, useState } from "react"

import { UseFormReturn } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { format } from "date-fns"
import { ProcessStep } from "../types"
import message from "@/components/Message"
import { getCurrentAccountInfo } from "@/service/apis/user"
import DynamicFormFields from "./DynamicFormFields"
import { cn } from "@/theme/cn"

interface DynamicProcessConfirmProps {
steps: ProcessStep[]
form: UseFormReturn<any>
isEditable?: boolean
fieldName?: string
}

const DynamicProcessConfirm: React.FC<DynamicProcessConfirmProps> = ({
steps,
form,
isEditable = true,
fieldName = "processConfirmations",
}) => {
const [currentUser, setCurrentUser] = useState<any>(null)
const [isConfirming, setIsConfirming] = useState<string>("")

useEffect(() => {
const fetchUser = async () => {
try {
const user = await getCurrentAccountInfo()
setCurrentUser(user)
} catch (error) {
console.error("Failed to fetch user info:", error)
message.error("获取用户信息失败")
}
}

    if (!currentUser) {
      fetchUser()
    }

}, [])

useEffect(() => {
const currentValues = form.getValues(fieldName) || {}
const updates: Record<string, any> = {}
let needsUpdate = false

    steps.forEach((step) => {
      if (!currentValues[step.key]) {
        updates[`${fieldName}.${step.key}`] = {
          confirmed: false,
          confirmer: "",
          confirmationDate: "",
          formData: {},
        }
        needsUpdate = true
      }
    })

    if (needsUpdate) {
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })
    }

}, [steps, fieldName, form])

const handleConfirm = async (step: ProcessStep) => {
if (!currentUser) {
message.error("未能获取用户信息")
return
}

    if (step.fields) {
      const formDataPath = `${fieldName}.${step.key}.formData`
      const isValid = await form.trigger(formDataPath)
      if (!isValid) {
        message.error("请完成必填字段")
        return
      }
    }

    setIsConfirming(step.key)
    try {
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: true,
        [`${fieldName}.${step.key}.confirmer`]: currentUser.name || currentUser.email,
        [`${fieldName}.${step.key}.confirmationDate`]: new Date().toISOString(),
      }

      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })

      form.trigger(`${fieldName}.${step.key}`)

    } catch (error) {
      console.error("Error confirming step:", error)
      message.error("确认失败")
    } finally {
      setIsConfirming("")
    }

}

const handleCancel = (step: ProcessStep) => {
try {
const updates = {
[`${fieldName}.${step.key}.confirmed`]: false,
[`${fieldName}.${step.key}.confirmer`]: "",
[`${fieldName}.${step.key}.confirmationDate`]: "",
}

      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })

      form.trigger(`${fieldName}.${step.key}`)
    } catch (error) {
      console.error("Error canceling confirmation:", error)
      message.error("取消确认失败")
    }

}

return (
<div className="space-y-6">
{steps.map((step) => {
const stepData = form.watch(`${fieldName}.${step.key}`) || {}
const isConfirmed = stepData.confirmed
const isLoading = isConfirming === step.key

        return (
          <Card key={step.key} className={cn(
            "border-l-4",
            isConfirmed ? "border-l-blue-500" : "border-l-gray-200"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    isConfirmed
                      ? "bg-blue-50 text-blue-600 ring-2 ring-blue-100"
                      : "bg-gray-50 text-gray-400"
                  )}>
                    <Icon
                      icon={step.icon || (isConfirmed ? "mdi:check-circle" : "mdi:clock-outline")}
                      className="w-5 h-5"
                    />
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-lg font-semibold",
                      isConfirmed ? "text-blue-600" : "text-gray-900"
                    )}>
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className="text-gray-500 mt-1 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                {isEditable && (
                  <div>
                    {!isConfirmed ? (
                      <Button
                        onClick={() => handleConfirm(step)}
                        variant="bordered"
                        size="sm"
                        isLoading={isLoading}
                        className={cn(
                          "font-medium",
                          isLoading ? "opacity-70" : "hover:bg-blue-50 hover:text-blue-600"
                        )}
                        startContent={!isLoading && <Icon icon="mdi:check" className="w-4 h-4" />}
                      >
                        确认
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleCancel(step)}
                        variant="bordered"
                        size="sm"
                        color="danger"
                        className="font-medium hover:bg-red-50"
                        startContent={<Icon icon="mdi:close" className="w-4 h-4" />}
                      >
                        取消确认
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {step.fields && (
                <div className={cn(
                  "mt-4 pt-4 border-t",
                  isConfirmed ? "opacity-70" : ""
                )}>
                  <DynamicFormFields
                    fields={step.fields}
                    form={form}
                    isEditable={isEditable && !isConfirmed}
                    orderNumberFieldConfig={undefined}
                  />
                </div>
              )}

              {isConfirmed && (
                <div className="grid grid-cols-2 gap-6 mt-4 pt-4 border-t text-sm">
                  <div className="space-y-1">
                    <label className="text-gray-500">确认人</label>
                    <p className="font-medium text-gray-900">{stepData.confirmer}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500">确认时间</label>
                    <p className="font-medium text-gray-900">
                      {stepData.confirmationDate &&
                        format(new Date(stepData.confirmationDate), "yyyy-MM-dd HH:mm:ss")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>

)
}

export default DynamicProcessConfirm
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/DynamicTable.tsx">
                    <FileContent>
                      import React, { useState, useCallback, useEffect } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import ResourceSelectButton from "../../ResourceSelectButton"
import { TableConfig } from "../types"
import { UseFormReturn, useFieldArray, useWatch } from "react-hook-form"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/theme/cn"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { debounce } from "lodash"
import styles from "../styles/DynamicForm.module.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import message from "@/components/Message"

interface DynamicTableProps {
config: TableConfig
form: UseFormReturn<any>
isEditable?: boolean
fieldName: string
}

const DynamicTable: React.FC<DynamicTableProps> = ({ config, form, isEditable = true, fieldName }) => {
const { fields, append, remove } = useFieldArray({
control: form.control,
name: fieldName,
})

const [hasScroll, setHasScroll] = useState(false)

// 检查是否需要显示滚动阴影
useEffect(() => {
const tabsList = document.querySelector(`.${styles["tabs-list-scroll"]}`)
if (tabsList) {
const checkScroll = () => {
setHasScroll(tabsList.scrollWidth > tabsList.clientWidth)
}
checkScroll()
window.addEventListener("resize", checkScroll)
return () => window.removeEventListener("resize", checkScroll)
}
}, [config.columns])

const tableData = useWatch({
control: form.control,
name: fieldName,
defaultValue: [],
})

// 新增：处理资源选择后的字段映射
const handleResourceSelect = useCallback(
(rowIndex: number, columnKey: string, selected: any) => {
if (!selected || !selected[0]) return

      const resource = selected[0]
      const column = config.columns.find((col) => col.key === columnKey)

      if (column?.resourceConfig?.fieldMapping) {
        Object.entries(column.resourceConfig.fieldMapping).forEach(([targetField, mapping]) => {
          // 找到目标列配置
          const targetColumn = config.columns.find((col) => col.key === targetField)
          if (!targetColumn) return

          // 设置映射标记
          targetColumn.isMappedField = true
          targetColumn.mappedFrom = `${columnKey}.${typeof mapping === "string" ? mapping : mapping.field}`
          targetColumn.editable = false

          if (typeof mapping === "string") {
            // 简单映射
            const value = resource[mapping]
            if (value !== undefined) {
              form.setValue(`${fieldName}.${rowIndex}.${targetField}`, value)
            }
          } else {
            // 复杂映射
            if (mapping.condition && !mapping.condition(resource)) {
              return
            }

            if (mapping.fields) {
              // 多字段组合
              const values = mapping.fields.map((field) => resource[field])
              const value = mapping.transform ? mapping.transform(values) : values.join(" ")
              form.setValue(`${fieldName}.${rowIndex}.${targetField}`, value)
            } else {
              // 单字段转换
              const value = resource[mapping.field]
              const transformedValue = mapping.transform ? mapping.transform(value) : value
              if (transformedValue !== undefined) {
                form.setValue(`${fieldName}.${rowIndex}.${targetField}`, transformedValue)
              }
            }
          }
        })
      }
    },
    [config.columns, fieldName, form]

)

// 修改: 添加默认值初始化逻辑
const handleAddRow = useCallback(() => {
const newRow = config.columns.reduce(
(acc, column) => {
switch (column.type) {
case "number":
acc[column.key] = 0
break
case "select":
acc[column.key] = column.options?.[0]?.value || ""
break
case "date":
case "datetime":
acc[column.key] = ""
break
case "resource":
acc[column.key] = null
break
default:
acc[column.key] = ""
}
return acc
},
{} as Record<string, any>
)

    append(newRow)

}, [config.columns, append])

const handleDeleteRow = useCallback(
(index: number) => {
remove(index)
},
[remove]
)

// 修改: 增加renderCell的空值处理
const renderCell = (column: TableConfig["columns"][0], rowIndex: number) => {
const cellFieldName = `${fieldName}.${rowIndex}.${column.key}`
const isFieldEditable = isEditable && column.editable !== false && !column.isMappedField
const cellValue = form.getValues(cellFieldName)

    if (column.render) {
      const record = tableData[rowIndex] || {}
      return column.render(cellValue, record, rowIndex)
    }

    switch (column.type) {
      case "resource":
        return (
          <div className='flex items-center gap-2'>
            <FormField
              control={form.control}
              name={cellFieldName}
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormControl>
                    <Input {...field} readOnly className={cn("min-w-[120px] border-0 focus:ring-0 bg-transparent")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isFieldEditable && column.resourceConfig && (
              <ResourceSelectButton
                resourceName={column.resourceConfig.resourceId}
                selectionMode='single'
                onSelect={(selected) => {
                  if (selected.length > 0) {
                    form.setValue(cellFieldName, selected[0])
                    // 处理字段映射
                    handleResourceSelect(rowIndex, column.key, selected)
                  }
                }}
                buttonText='选择'
                buttonProps={{
                  size: "sm",
                  className: "px-2 py-1 h-8",
                }}
              />
            )}
          </div>
        )

      default:
        return (
          <FormField
            control={form.control}
            name={cellFieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='relative'>
                    <Input
                      {...field}
                      disabled={!isFieldEditable}
                      className={cn("border-0 focus:ring-0 bg-transparent", column.isMappedField && "bg-gray-50")}
                    />
                    {column.isMappedField && (
                      <Icon
                        icon='mdi:link-variant'
                        className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400'
                        title={`自动填充自：${column.mappedFrom}`}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
    }

}

const renderSummaryCell = (column: TableConfig["columns"][0]) => {
if (column.key === config.columns[0].key) {
return <div className='font-medium'>{config.summary?.label || "合计"}</div>
}

    if (!column.summary?.render) {
      return null
    }

    // 修改: 直接使用tableData作为summary.render的参数
    return column.summary.render(tableData || [])

}

return (
<div>
{config.toolbar}

      <div className='hidden md:block overflow-x-auto'>
        <div className='min-w-full inline-block align-middle'>
          <div className='overflow-x-auto border rounded-lg'>
            <Table>
              <TableHeader className='bg-gray-100'>
                <TableRow>
                  {config.columns.map((column) => (
                    <TableHead
                      key={column.key}
                      style={{
                        width: column.width,
                        minWidth: column.width || "80px",
                      }}
                      className='border border-gray-200 whitespace-nowrap'
                    >
                      <div className='flex items-center gap-1'>
                        {column.title}
                        {column.isMappedField && (
                          <Icon icon='mdi:link-variant' className='text-gray-400' title='自动填充字段' />
                        )}
                      </div>
                    </TableHead>
                  ))}
                  {isEditable && <TableHead className='border border-gray-200 w-[80px]'>操作</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, rowIndex) => (
                  <TableRow key={field.id}>
                    {config.columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn("border border-gray-200", column.isMappedField && "bg-gray-50")}
                        style={{
                          minWidth: column.width || "80px",
                        }}
                      >
                        {renderCell(column, rowIndex)}
                      </TableCell>
                    ))}
                    {isEditable && (
                      <TableCell className='border border-gray-200 w-[80px]'>
                        <Button
                          isIconOnly
                          color='danger'
                          variant='light'
                          size='sm'
                          onClick={() => handleDeleteRow(rowIndex)}
                        >
                          <Icon icon='mdi:delete' className='w-4 h-4' />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {config.summary?.show && (
                  <TableRow className={cn("bg-default-50", config.summary.className)} style={config.summary.style}>
                    {config.columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className='border border-gray-200'
                        style={{
                          minWidth: column.width || "80px",
                        }}
                      >
                        {renderSummaryCell(column)}
                      </TableCell>
                    ))}
                    {isEditable && <TableCell className='border border-gray-200 w-[80px]' />}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {isEditable && (
        <motion.div className='mt-4' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            color='primary'
            variant='flat'
            size='sm'
            onClick={handleAddRow}
            startContent={<Icon icon='mdi:plus' className='w-4 h-4' />}
            className='w-full md:w-auto'
          >
            添加行
          </Button>
        </motion.div>
      )}
    </div>

)
}

export default DynamicTable

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/BasicInput.tsx">
                    <FileContent>
                      import React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/theme/cn"

interface BasicInputProps {
type: string
field: any
className?: string
placeholder?: string
}

const BasicInput: React.FC<BasicInputProps> = ({
type,
field,
className,
placeholder
}) => (
<Input
{...field}
type={type}
placeholder={placeholder}
className={cn(
type === "number" ? "text-right font-mono" : "",
"w-full rounded-md",
"border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
"transition-colors duration-200",
"placeholder:text-gray-400",
className
)}
/>
)

export default BasicInput
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/DateInput.tsx">
                    <FileContent>
                      import React from "react"

import { Button } from "@nextui-org/react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"

interface DateInputProps {
field: any
className?: string
placeholder?: string
}

const DateInput: React.FC<DateInputProps> = ({
field,
className,
placeholder = "选择日期"
}) => (
<Popover>
<PopoverTrigger asChild>
<Button
variant="bordered"
className={cn(
"w-full pl-3 text-left font-normal",
!field.value && "text-muted-foreground",
"border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
"transition-colors duration-200",
className
)}
disabled={field.disabled} >
{field.value ? format(new Date(field.value), "PPP") : <span>{placeholder}</span>}
<Icon icon="mdi:calendar" className="ml-auto h-4 w-4 opacity-50" />
</Button>
</PopoverTrigger>
<PopoverContent className="w-auto p-0" align="start">
<Calendar
mode="single"
selected={field.value ? new Date(field.value) : undefined}
onSelect={(date) => field.onChange(date?.toISOString())}
disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
initialFocus
/>
</PopoverContent>
</Popover>
)

export default DateInput
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/FormFieldWrapper.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/theme/cn"
import { TooltipConfig } from "../../types"

// 动画配置
const tooltipAnimation = {
initial: { opacity: 0, scale: 0.95, y: -4 },
animate: { opacity: 1, scale: 1, y: 0 },
exit: { opacity: 0, scale: 0.95, y: -4 },
transition: { duration: 0.15, ease: "easeOut" },
}

interface FormFieldWrapperProps {
name: string
label: string
tooltip?: TooltipConfig
children: (field: any) => React.ReactNode
form: UseFormReturn<any>
isEditable?: boolean
disabled?: boolean
required?: boolean
showWhen?: {
field: string
value: any
operator?: "eq" | "neq" | "gt" | "lt" | "contains"
}
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
name,
label,
tooltip,
children,
form,
isEditable = true,
disabled,
required,
}) => {
return (
<motion.div variants={tooltipAnimation} initial='hidden' animate='visible'>
<FormField
control={form.control}
name={name}
render={({ field }) => (
<FormItem className='w-full'>
<div className='flex items-center gap-1'>
<FormLabel className='text-sm font-medium text-primary-500'>
{label}
{required && (
<span className="text-red-500 ml-1">\*</span>
)}
</FormLabel>
{tooltip && (
<Popover>
<PopoverTrigger asChild>
<button
type='button'
className={cn(
"inline-flex items-center justify-center rounded-full",
"w-4 h-4 text-gray-400 hover:text-gray-500",
"focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
"transition-colors duration-200"
)} >
<Icon icon='mdi:help-circle-outline' className='w-4 h-4' />
</button>
</PopoverTrigger>
<AnimatePresence>
<PopoverContent
side={tooltip.placement || "top"}
className={cn(
"z-50 max-w-sm px-4 py-3",
"bg-white rounded-lg shadow-lg",
"border border-gray-200",
"text-sm text-gray-600 leading-relaxed"
)}
asChild >
<motion.div {...tooltipAnimation}>
{typeof tooltip.content === "string" ? (
<div className='whitespace-pre-wrap'>{tooltip.content}</div>
) : (
tooltip.content
)}
</motion.div>
</PopoverContent>
</AnimatePresence>
</Popover>
)}
</div>
<FormControl>{children({ ...field, disabled: !isEditable || disabled })}</FormControl>
<FormMessage className='text-xs' />
</FormItem>
)}
/>
</motion.div>
)
}

export default FormFieldWrapper
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/index.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField as DynamicFormField } from "../../types"
import { cn } from "@/theme/cn"
import { renderBasicInput } from "./renders/renderBasicInput"
import { renderTextarea } from "./renders/renderTextarea"
import { renderDateInput } from "./renders/renderDateInput"
import { renderSelect } from "./renders/renderSelect"
import { renderResource } from "./renders/renderResource"
import { renderSignature } from "./renders/renderSignature"
import { renderUpload } from "./renders/renderUpload"
import { renderRadio } from "./renders/renderRadio"
import { renderCheckbox } from "./renders/renderCheckbox"
import { renderSwitch } from "./renders/renderSwitch"
import { renderSlider } from "./renders/renderSlider"
import { renderCustom } from "./renders/renderCustom"

interface DynamicFormFieldsProps {
fields: DynamicFormField[]
form: UseFormReturn<any>
isEditable?: boolean
onChange?: (fieldName: string, value: any) => void
}

const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({ fields, form, isEditable, onChange }) => {
const renderField = (field: DynamicFormField) => {
if (field.hidden) return null

    // 基础输入类型
    if (["text", "password", "email", "tel", "url"].includes(field.type)) {
      return renderBasicInput(field, form, isEditable, onChange)
    }

    // 文本域
    if (field.type === "textarea") {
      return renderTextarea(field, form, isEditable, onChange)
    }

    // 数字输入
    if (field.type === "number") {
      return renderBasicInput(field, form, isEditable, onChange)
    }

    // 日期和时间
    if (field.type === "date" || field.type === "datetime") {
      return renderDateInput(field, form, isEditable, onChange)
    }

    // 选择器
    if (field.type === "select") {
      return renderSelect(field, form, isEditable, onChange)
    }

    // 资源选择
    if (field.type === "resource") {
      return renderResource(field, form, isEditable, onChange)
    }

    // 签名
    if (field.type === "signature") {
      return renderSignature(field, form, isEditable, onChange)
    }

    // 统一的上传组件
    if (field.type === "upload" || field.type === "file" || field.type === "image") {
      // 兼容旧的file和image类型
      if (field.type === "file" || field.type === "image") {
        const uploadConfig = {
          uploadType: field.type === "file" ? "file" : "image" as "file" | "image",
          multiple: false,
          maxSize: undefined,
          maxCount: 1,
          thumbnail: field.type === "image",
        }
        return renderUpload({ ...field, uploadConfig }, form, isEditable, onChange)
      }
      return renderUpload(field, form, isEditable, onChange)
    }

    // 单选框
    if (field.type === "radio") {
      return renderRadio(field, form, isEditable, onChange)
    }

    // 复选框
    if (field.type === "checkbox") {
      return renderCheckbox(field, form, isEditable, onChange)
    }

    // 开关
    if (field.type === "switch") {
      return renderSwitch(field, form, isEditable, onChange)
    }

    // 滑块
    if (field.type === "slider") {
      return renderSlider(field, form, isEditable, onChange)
    }

    // 自定义组件
    if (field.type === "custom") {
      return renderCustom(field, form, isEditable, onChange)
    }

    return null

}

return (
<div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6", "form-fields-container")}>
{fields.map((field) => (
<div
key={field.name}
className={cn(
"w-full",
"form-field-wrapper",
"hover:bg-gray-50/50 rounded-lg p-2 -m-2",
"transition-colors duration-200",
field.type === "resource" && "md:col-span-2"
)} >
{renderField(field)}
</div>
))}
</div>
)
}

export default DynamicFormFields
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderBasicInput.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import BasicInput from "../BasicInput"
import { cn } from "@/theme/cn"

export const renderBasicInput = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
{(formField) => (
<BasicInput
type={field.type}
field={{
            ...formField,
            onChange: (e: any) => {
              formField.onChange(e)
              onChange?.(field.name, e.target.value)
            },
          }}
className={cn(
field.type === "number" ? "text-right font-mono" : "",
"w-full rounded-md",
"border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
"transition-colors duration-200",
"placeholder:text-gray-400",
field.className
)}
placeholder={field.placeholder}
/>
)}
</FormFieldWrapper>
)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderCheckbox.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { CheckboxGroup, Checkbox } from "@nextui-org/react"

export const renderCheckbox = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
{(formField) => (
<CheckboxGroup
orientation={field.layout || "horizontal"}
value={formField.value || []}
onValueChange={(value) => {
formField.onChange(value)
onChange?.(field.name, value)
}}
isDisabled={!isEditable || field.disabled} >
{(typeof field.options === "function" ? field.options(form) : field.options || []).map((option) => (
<Checkbox key={option.value} value={option.value} isDisabled={option.disabled}>
{option.label}
</Checkbox>
))}
</CheckboxGroup>
)}
</FormFieldWrapper>
)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderCustom.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"

export const renderCustom = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
{(formField) =>
field?.render?.({
field: {
...formField,
onChange: (value: any) => {
formField.onChange(value)
onChange?.(field.name, value)
},
},
form,
isEditable,
})
}
</FormFieldWrapper>
)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderDateInput.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import DateInput from "../DateInput"

export const renderDateInput = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
{(formField) => (
<DateInput
field={{
            ...formField,
            onChange: (value: any) => {
              formField.onChange(value)
              onChange?.(field.name, value)
            },
          }}
className={field.className}
placeholder={field.placeholder}
/>
)}
</FormFieldWrapper>
)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderRadio.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { RadioGroup, Radio } from "@nextui-org/react"

export const renderRadio = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
{(formField) => (
<RadioGroup
orientation={field.layout || "horizontal"}
value={formField.value}
onValueChange={(value) => {
formField.onChange(value)
onChange?.(field.name, value)
}}
isDisabled={!isEditable || field.disabled} >
{(typeof field.options === "function" ? field.options(form) : field.options || []).map((option) => (
<Radio key={option.value} value={option.value} isDisabled={option.disabled}>
{option.label}
</Radio>
))}
</RadioGroup>
)}
</FormFieldWrapper>
)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderResource.tsx">
                    <FileContent>
                      import React, { useState, useCallback, useEffect } from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField, ResourceValue } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Card, CardBody, Input } from "@nextui-org/react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import { Spinner } from "@nextui-org/react"
import { useMetadata } from "@/hooks/metadata"
import message from "@/components/Message"
// import { Input } from "@/components/ui/input"
import { cn } from "@/theme/cn"

export const renderResource = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
const [loading, setLoading] = useState(false)
const [resourceData, setResourceData] = useState<any>(null)
const { getDetail } = useMetadata("resource")
const value = formField.value as ResourceValue
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

        // 格式化显示值
        const formatDisplayValue = (resource: any) => {
          if (!resource) return ""

          const { displayField, displayFormat, displayFields } = field.resourceConfig || {}

          if (displayFormat) {
            return displayFormat(resource)
          }

          if (displayField) {
            return resource[displayField]
          }

          if (displayFields?.length) {
            return displayFields.map((df) => `${df.label}: ${resource[df.key]}`).join(" | ")
          }

          return resource.name || resource.title || resource.code || ""
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
          formField.onChange(undefined)
          setResourceData(null)
          onChange?.(field.name, undefined)
        }

        // 渲染触发器
        const renderTrigger = () => {
          const { triggerConfig } = field.resourceConfig || {}
          if (!triggerConfig) return null

          const commonProps = {
            size: "sm",
            isDisabled: !isEditable || field.disabled,
            onClick: () => {
              /* 触发选择 */
            },
            className: cn("min-w-[80px]", triggerConfig.className),
            style: triggerConfig.style,
          }

          if (triggerConfig.type === "icon") {
            return (
              <Button isIconOnly variant='light' {...commonProps}>
                <Icon icon={triggerConfig.icon || "mdi:magnify"} className='w-4 h-4' />
              </Button>
            )
          }

          return (
            <Button
              variant='light'
              {...commonProps}
              startContent={triggerConfig.icon && <Icon icon={triggerConfig.icon} className='w-4 h-4' />}
            >
              {triggerConfig.text || "选择"}
            </Button>
          )
        }

        if (!resourceData?.data?.length) {
          return (
            <div className='min-h-[48px] border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200'>
              <div className='h-full flex items-center gap-2 p-2 cursor-pointer'>
                {loading ? (
                  <Spinner size='sm' />
                ) : (
                  <>
                    <Input
                      value={value?.displayValue || ""}
                      onChange={(e) => {
                        formField.onChange({
                          ...value,
                          displayValue: e.target.value,
                        })
                      }}
                      readOnly
                      placeholder={field.placeholder || "请选择"}
                      className='flex-1'
                    />
                    <ResourceSelectButton
                      resourceName={field.resourceConfig?.resourceId || ""}
                      selectionMode={isMultiple ? "multiple" : "single"}
                      onSelect={(selected) => {
                        if (selected.length > 0) {
                          const dataids = selected.map((item) => item.dataid)
                          const displayValue = selected.map((item) => formatDisplayValue(item)).join(", ")
                          const newValue = {
                            dataid: isMultiple ? dataids : dataids[0],
                            displayValue,
                          }
                          formField.onChange(newValue)
                          onChange?.(field.name, newValue)
                        }
                      }}
                      buttonProps={{
                        size: "sm",
                        variant: "light",
                        isDisabled: !isEditable,
                        className: "min-w-[80px]",
                      }}
                    >
                      {renderTrigger()}
                    </ResourceSelectButton>
                  </>
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
                                const displayValue = selected.map((item) => formatDisplayValue(item)).join(", ")
                                const newValue = {
                                  dataid: isMultiple ? dataids : dataids[0],
                                  displayValue,
                                }
                                formField.onChange(newValue)
                                onChange?.(field.name, newValue)
                              }
                            }}
                            buttonText='更换'
                            buttonProps={{
                              size: "md",
                              variant: "light",
                              isDisabled: !isEditable,
                              className: "min-w-[80px]",
                              startContent: <Icon icon='material-symbols:sync' className='text-lg' />,
                            }}
                          />
                          <Button
                            size='md'
                            variant='light'
                            color='danger'
                            className='min-w-[80px]'
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

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderSelect.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/theme/cn"
import { motion } from "framer-motion"

export const renderSelect = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
{(formField) => (
<Select
disabled={!isEditable || field.disabled}
onValueChange={(value) => {
formField.onChange(value)
onChange?.(field.name, value)
form.trigger(field.name)
}}
value={formField.value}
defaultValue={formField.value} >
<SelectTrigger
className={cn(
"w-full",
"border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
"transition-colors",
"placeholder:text-gray-400",
field.className
)} >
<SelectValue placeholder={field.placeholder || "请选择"} />
</SelectTrigger>
<SelectContent>
<motion.div
initial={{ opacity: 0, y: -10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 10 }}
transition={{ duration: 0.2 }} >
{(typeof field.options === "function" ? field.options(form) : field.options || []).map((option) => (
<SelectItem
key={option.value}
value={option.value}
disabled={option.disabled}
className={cn(
"cursor-pointer transition-colors",
"hover:bg-blue-50 hover:text-blue-600",
"focus:bg-blue-50 focus:text-blue-600",
option.disabled && "opacity-50 cursor-not-allowed"
)} >
{option.label}
</SelectItem>
))}
</motion.div>
</SelectContent>
</Select>
)}
</FormFieldWrapper>
)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderSignature.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import SignaturePad from "@/components/common/SignaturePad"

export const renderSignature = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
{(formField) => (
<SignaturePad
width={field.width}
height={field.height}
lineWidth={field.lineWidth}
lineColor={field.lineColor}
disabled={!isEditable || field.disabled}
className={field.className}
value={formField.value}
onChange={(value) => {
formField.onChange(value)
onChange?.(field.name, value)
}}
/>
)}
</FormFieldWrapper>
)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderSlider.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Slider } from "@nextui-org/react"

export const renderSlider = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
{(formField) => (
<div className='w-full px-2'>
<Slider
value={formField.value}
onChange={(value) => {
formField.onChange(value)
onChange?.(field.name, value)
}}
min={field.min}
max={field.max}
step={field.step}
isDisabled={!isEditable || field.disabled}
className='max-w-md'
/>
</div>
)}
</FormFieldWrapper>
)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderSwitch.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Switch } from "@nextui-org/react"

export const renderSwitch = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
{(formField) => (
<div className='flex items-center gap-2'>
<Switch
isSelected={formField.value}
onValueChange={(checked) => {
formField.onChange(checked)
onChange?.(field.name, checked)
}}
isDisabled={!isEditable || field.disabled}
/>
{formField.value ? field.checkedLabel : field.uncheckedLabel}
</div>
)}
</FormFieldWrapper>
)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderTextarea.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/theme/cn"

export const renderTextarea = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
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
{(formField) => (
<Textarea
{...formField}
onChange={(e) => {
formField.onChange(e)
onChange?.(field.name, e.target.value)
}}
placeholder={field.placeholder}
className={cn(
"min-h-[100px] md:min-h-[80px]",
"w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
"resize-none transition-colors",
"placeholder:text-gray-400",
field.className
)}
/>
)}
</FormFieldWrapper>
)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/FormFields/renders/renderUpload.tsx">
                    <FileContent>
                      import React, { useState } from "react"

import { UseFormReturn } from "react-hook-form"
import { FormField, FileInfo } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Input } from "@/components/ui/input"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Progress } from "@/components/ui/progress"
import message from "@/components/Message"
import { cn } from "@/theme/cn"
import { apiService } from "@/service/apis/api"
import { Modal } from "@nextui-org/react"

export const renderUpload = (
field: FormField,
form: UseFormReturn<any>,
isEditable: boolean,
onChange?: (fieldName: string, value: any) => void
) => {
const [uploading, setUploading] = useState(false)
const [progress, setProgress] = useState(0)
const [previewVisible, setPreviewVisible] = useState(false)
const [previewFile, setPreviewFile] = useState<FileInfo | null>(null)
const [isProcessing, setIsProcessing] = useState(false)

// 获取签名URL
const getSignedUrl = async (fileName: string) => {
try {
const res = await apiService.get(`/api/file/form/upload:singed?fileName=${fileName}`)
return res.data
} catch (error) {
message.error("获取签名URL失败，请重试！")
throw error
}
}

// 创建活动数据
const createActivity = async (fileInfo: { fileName: string; fileKey: string }) => {
try {
const response = await apiService.post('/public/data/file/activitiess', {
activityName: "测试",
activityType: "test",
files: [fileInfo]
})
return response.data
} catch (error) {
console.error("Create activity error:", error)
throw error
}
}

// 查询活动数据
const queryActivity = async () => {
try {
const response = await apiService.post('/public/data/file/activitiess/find', {}, {
params: { display: 'paginate' }
})
return response.data
} catch (error) {
console.error("Query activity error:", error)
throw error
}
}

// 处理文件预览
const handlePreview = async (file: FileInfo) => {
if (!file.type?.startsWith('image/')) {
return
}
setPreviewFile(file)
setPreviewVisible(true)

    if (field.uploadConfig?.onPreview) {
      field.uploadConfig.onPreview(file)
    }

}

// 处理文件下载
const handleDownload = async (file: FileInfo) => {
try {
if (!file.downloadUrl) {
message.error("下载链接不可用")
return
}

      if (field.uploadConfig?.onDownload) {
        field.uploadConfig.onDownload(file)
        return
      }

      const config = field.uploadConfig?.downloadConfig || {}
      const response = await fetch(file.downloadUrl, {
        method: config.method || "GET",
        headers: config.headers || {},
        credentials: config.withCredentials ? "include" : "omit",
      })

      if (!response.ok) {
        throw new Error("下载失败")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = file.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
      message.error("下载失败，请重试")
    }

}

// 处理新的upload类型
const handleUploadType = async (file: File) => {
if (field.uploadConfig) {
// 检查文件大小
if (field.uploadConfig.maxSize && file.size > field.uploadConfig.maxSize) {
message.error(`文件大小不能超过 ${field.uploadConfig.maxSize / 1024 / 1024}MB`)
return null
}

      // 如果是图片且需要处理
      if (field.uploadConfig.uploadType === "image" && field.uploadConfig.cropOptions) {
        const { quality = 0.8 } = field.uploadConfig.cropOptions
        // 处理图片...
      }

      // 使用自定义上传
      if (field.uploadConfig.uploadConfig?.customRequest) {
        try {
          const result = await field.uploadConfig.uploadConfig.customRequest({
            file,
            onProgress: (percent: number) => {
              setProgress(percent)
              field.uploadConfig?.onProgress?.(percent)
            },
          })
          return result
        } catch (error) {
          console.error("Custom upload error:", error)
          field.uploadConfig?.onError?.(error as Error)
          throw error
        }
      }

      // 新的表单上传逻辑
      try {
        const signedData = await getSignedUrl(file.name)
        const formData = new FormData()
        formData.append("key", signedData.fileKey)
        formData.append("OSSAccessKeyId", signedData.accessKeyId)
        formData.append("policy", signedData.policy)
        formData.append("Signature", signedData.signature)
        formData.append("file", file)

        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total)
            setProgress(percent)
            field.uploadConfig?.onProgress?.(percent)
          }
        }

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                setIsProcessing(true)
                // 创建活动数据
                await createActivity({
                  fileName: file.name,
                  fileKey: signedData.fileKey
                })

                // 查询获取完整信息
                const queryResult = await queryActivity()

                // 修改这里的数据处理逻辑
                if (!queryResult?.data || !Array.isArray(queryResult.data) || queryResult.data.length === 0) {
                  throw new Error("未找到上传的文件信息")
                }

                // 获取最新的活动记录（按创建时间排序，取最新的）
                const latestActivity = queryResult.data.sort((a, b) =>
                  Number(b.createdAt) - Number(a.createdAt)
                )[0]

                if (!latestActivity.files || !Array.isArray(latestActivity.files) || latestActivity.files.length === 0) {
                  throw new Error("文件信息不完整")
                }

                const fileInfo = latestActivity.files[0]
                if (!fileInfo || !fileInfo.downloadUrl) {
                  throw new Error("文件下载链接不可用")
                }

                field.uploadConfig?.onSuccess?.(fileInfo)
                resolve(fileInfo)
              } catch (error) {
                console.error("Process file error:", error)
                field.uploadConfig?.onError?.(error as Error)
                reject(error)
              } finally {
                setIsProcessing(false)
              }
            } else {
              const error = new Error(`Upload failed with status ${xhr.status}`)
              field.uploadConfig?.onError?.(error)
              reject(error)
            }
          }

          xhr.onerror = () => {
            const error = new Error("Upload failed")
            field.uploadConfig?.onError?.(error)
            reject(error)
          }
        })

        xhr.open("POST", signedData.formUploadHost, true)
        xhr.send(formData)

        return await uploadPromise
      } catch (error) {
        console.error("Upload error:", error)
        field.uploadConfig?.onError?.(error as Error)
        throw error
      }
    }

    // 兼容原有逻辑
    if (field.onUpload) {
      await field.onUpload(file)
      return file
    }

    return file

}

// 渲染预览内容
const renderPreviewContent = (file: FileInfo) => {
if (!file) return null

    if (file.type?.startsWith("image/")) {
      return (
        <img
          src={file.downloadUrl}
          alt={file.fileName}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      )
    }

    return (
      <div className='flex flex-col items-center justify-center p-4'>
        <Icon icon='mdi:file-document-outline' className='w-16 h-16 text-gray-400' />
        <p className='mt-2 text-gray-600'>{file.fileName}</p>
        <Button
          color='primary'
          variant='flat'
          size='sm'
          className='mt-4'
          onClick={() => handleDownload(file)}
          startContent={<Icon icon='mdi:download' className='w-4 h-4' />}
        >
          下载查看
        </Button>
      </div>
    )

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
{(formField) => (
<div className='space-y-4'>
<div className='flex items-center gap-2'>
<Input
type='file'
accept={field.accept}
multiple={field.uploadConfig?.multiple}
onChange={async (e) => {
const files = e.target.files
if (!files?.length) return

                // 检查文件数量
                if (field.uploadConfig?.maxCount && files.length > field.uploadConfig.maxCount) {
                  message.error(`最多只能上传 ${field.uploadConfig.maxCount} 个文件`)
                  return
                }

                setUploading(true)
                setProgress(0)

                try {
                  const uploadedFiles = []
                  for (let i = 0; i < files.length; i++) {
                    const result = await handleUploadType(files[i])
                    if (result) {
                      uploadedFiles.push(result)
                    }
                  }

                  const finalValue = field.uploadConfig?.multiple ? uploadedFiles : uploadedFiles[0]
                  formField.onChange(finalValue)
                  onChange?.(field.name, finalValue)
                  message.success("上传成功")
                } catch (error) {
                  console.error("Upload error:", error)
                  message.error("上传失败")
                } finally {
                  setUploading(false)
                  setProgress(0)
                }
              }}
              disabled={!isEditable || field.disabled}
              className='hidden'
              id={field.name}
            />
            <Button
              as='label'
              htmlFor={field.name}
              variant='bordered'
              size='sm'
              isDisabled={!isEditable || field.disabled || uploading || isProcessing}
              startContent={
                (uploading || isProcessing) ? (
                  <Icon icon='mdi:loading' className='w-4 h-4 animate-spin' />
                ) : (
                  <Icon icon='mdi:upload' className='w-4 h-4' />
                )
              }
              className={cn(
                "font-medium",
                "hover:bg-blue-50 hover:text-blue-600",
                "transition-colors duration-200",
                field.className
              )}
            >
              {uploading ? "上传中..." : isProcessing ? "处理中..." : field.placeholder || "选择文件"}
            </Button>
            {formField.value && !uploading && !isProcessing && (
              <>
                <span className='text-sm text-gray-500 truncate flex-1'>
                  {Array.isArray(formField.value)
                    ? `已选择 ${formField.value.length} 个文件`
                    : formField.value instanceof File
                    ? formField.value.name
                    : formField.value.fileName}
                </span>
                {formField.value.type?.startsWith('image/') && (
                  <Button
                    isIconOnly
                    variant='light'
                    size='sm'
                    color='primary'
                    onClick={() => handlePreview(formField.value)}
                    isDisabled={!formField.value.downloadUrl}
                  >
                    <Icon icon='mdi:eye' className='w-4 h-4' />
                  </Button>
                )}
                <Button
                  isIconOnly
                  variant='light'
                  size='sm'
                  color='primary'
                  onClick={() => handleDownload(formField.value)}
                  isDisabled={!formField.value.downloadUrl}
                >
                  <Icon icon='mdi:download' className='w-4 h-4' />
                </Button>
                <Button
                  isIconOnly
                  variant='light'
                  size='sm'
                  color='danger'
                  onClick={() => {
                    formField.onChange(field.uploadConfig?.multiple ? [] : null)
                    onChange?.(field.name, field.uploadConfig?.multiple ? [] : null)
                  }}
                  isDisabled={!isEditable || field.disabled}
                >
                  <Icon icon='mdi:close' className='w-4 h-4' />
                </Button>
              </>
            )}
          </div>

          {uploading && (
            <div className='space-y-2'>
              <Progress value={progress} className='w-full' />
              <p className='text-sm text-gray-500'>上传进度: {progress}%</p>
            </div>
          )}

          {/* 图片预览 */}
          {field.uploadConfig?.uploadType === "image" && field.uploadConfig.thumbnail && formField.value && (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {(Array.isArray(formField.value) ? formField.value : [formField.value]).map((file: FileInfo, index) => (
                <div key={index} className='relative aspect-square rounded-lg overflow-hidden'>
                  <img
                    src={file.downloadUrl}
                    alt={`预览图 ${index + 1}`}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute top-1 right-1 flex gap-1'>
                    <Button
                      isIconOnly
                      variant='light'
                      size='sm'
                      color='primary'
                      className='bg-white/80'
                      onClick={() => handlePreview(file)}
                    >
                      <Icon icon='mdi:eye' className='w-4 h-4' />
                    </Button>
                    <Button
                      isIconOnly
                      variant='light'
                      size='sm'
                      color='primary'
                      className='bg-white/80'
                      onClick={() => handleDownload(file)}
                    >
                      <Icon icon='mdi:download' className='w-4 h-4' />
                    </Button>
                    <Button
                      isIconOnly
                      variant='light'
                      size='sm'
                      color='danger'
                      className='bg-white/80'
                      onClick={() => {
                        if (Array.isArray(formField.value)) {
                          const newValue = formField.value.filter((_, i) => i !== index)
                          formField.onChange(newValue)
                          onChange?.(field.name, newValue)
                        } else {
                          formField.onChange(null)
                          onChange?.(field.name, null)
                        }
                      }}
                    >
                      <Icon icon='mdi:close' className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 预览模态框 */}
          <Modal
            isOpen={previewVisible}
            onClose={() => setPreviewVisible(false)}
            size={field.uploadConfig?.previewConfig?.modalWidth ? "full" : "2xl"}
            className='max-h-[90vh]'
          >
            <Modal.Header>
              <h3 className='text-lg font-semibold'>
                {field.uploadConfig?.previewConfig?.modalTitle || previewFile?.fileName || "文件预览"}
              </h3>
            </Modal.Header>
            <Modal.Body>{previewFile && renderPreviewContent(previewFile)}</Modal.Body>
            <Modal.Footer>
              <Button
                color='primary'
                variant='light'
                onPress={() => setPreviewVisible(false)}
                startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
              >
                关闭
              </Button>
              {previewFile && (
                <Button
                  color='primary'
                  variant='flat'
                  onPress={() => handleDownload(previewFile)}
                  startContent={<Icon icon='mdi:download' className='w-4 h-4' />}
                >
                  下载
                </Button>
              )}
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </FormFieldWrapper>

)
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/PrintableContent.tsx">
                    <FileContent>
                      import React, { forwardRef } from "react"

import { format } from "date-fns"

interface PrintableContentProps {
formData: any
}

const PrintableContent = forwardRef<HTMLDivElement, PrintableContentProps>(({ formData }, ref) => {
// 生成空行数据
const generateEmptyRows = (count: number) => {
return Array(count).fill(null).map((\_, index) => ({
id: `empty-${index}`,
...Object.keys(formData?.formFields || {}).reduce((acc, key) => {
acc[key] = ""
return acc
}, {})
}))
}

// 处理表格数据
const tableData = formData?.data?.tableData || []
const finalTableData = tableData.length > 0 ? tableData : generateEmptyRows(5)

// 确保基本信息字段存在
const ensureBasicInfo = (info: any) => {
if (!info) return {}
return Object.keys(formData?.formFields || {}).reduce((acc, key) => {
acc[key] = info[key] || ""
return acc
}, {})
}

const basicInfo = ensureBasicInfo(formData?.data?.basicInfo)

return (
<div ref={ref} className='p-8 print:p-4 bg-white'>
{/_ 标题 _/}
<div className='text-center mb-8'>
<h1 className='text-2xl font-bold'>{formData?.title || "表单详情"}</h1>
</div>

      {/* 基本信息 */}
      {Object.entries(formData?.formFields || {}).map(([section, fields]: [string, any]) => (
        <div key={section} className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>{section}</h2>
          <div className='grid grid-cols-2 gap-4'>
            {fields.map((field: any) => (
              <div key={field.name} className='flex justify-between border-b border-gray-200 py-2'>
                <span className='font-medium'>{field.label}:</span>
                <span className='min-w-[200px] text-right'>
                  {basicInfo[field.name] || "____________________"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 表格数据 */}
      {formData?.table && (
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>表格数据</h2>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-50'>
                {formData.table.columns.map((column: any) => (
                  <th
                    key={column.key}
                    className='border border-gray-300 p-2 text-sm font-medium text-left'
                    style={{ width: column.width }}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {finalTableData.map((row: any, index: number) => (
                <tr key={row.id || index} className='border-b border-gray-200'>
                  {formData.table.columns.map((column: any) => (
                    <td key={column.key} className='border border-gray-300 p-2 text-sm min-h-[40px]'>
                      {row[column.key] || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 签字栏 */}
      <div className='mt-8 flex justify-between text-sm'>
        <div>
          <p>制单人：________________</p>
          <p className='mt-2'>日期：________________</p>
        </div>
        <div>
          <p>审核人：________________</p>
          <p className='mt-2'>日期：________________</p>
        </div>
      </div>

      {/* 打印样式 */}
      <style type='text/css' media='print'>{`
        @page {
          size: A4;
          margin: 20mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
          .print-header {
            position: fixed;
            top: 0;
          }
          .print-footer {
            position: fixed;
            bottom: 0;
          }
          td {
            min-height: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>

)
})

PrintableContent.displayName = "PrintableContent"

export default PrintableContent
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/PrintableTemplate.tsx">
                    <FileContent>
                      import React, { forwardRef } from "react"

import { format } from "date-fns"
import { DynamicFormConfig } from "../types"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"

interface PrintableTemplateProps {
config: DynamicFormConfig
data: any
}

const PrintableTemplate = forwardRef<HTMLDivElement, PrintableTemplateProps>(({ config, data }, ref) => {
// 标准化配置
const normalizeConfig = (rawConfig: any): DynamicFormConfig => {
if (!rawConfig) return rawConfig

    // 如果配置来自模板
    if (rawConfig.config?.renderConfig) {
      return {
        metadata: {
          title: rawConfig.title || "表单",
          description: rawConfig.description,
          permissions: {
            edit: true,
            delete: true,
            print: true,
          },
        },
        renderConfig: rawConfig.config.renderConfig,
        orderNumberConfig: rawConfig.config.orderNumberConfig,
      }
    }

    return rawConfig

}

const normalizedConfig = normalizeConfig(config)
const { metadata, renderConfig } = normalizedConfig

// 从缓存中获取资源数据
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

// 格式化资源字段值
const formatResourceValue = (field: any, value: any) => {
if (!value) return "****\_\_\_\_****"

    try {
      // 处理单个资源
      if (value.dataid && !Array.isArray(value.dataid)) {
        const resourceData = getResourceFromCache(field.resourceConfig?.resourceId, value.dataid)
        if (resourceData) {
          const displayFields = field.resourceConfig?.displayFields || []
          return displayFields
            .map((df: any) => `${df.label}: ${resourceData[df.key]}`)
            .filter(Boolean)
            .join(" | ")
        }
      }

      // 处理多个资源
      if (Array.isArray(value.dataid)) {
        const resourcesData = value.dataid
          .map(id => getResourceFromCache(field.resourceConfig?.resourceId, id))
          .filter(Boolean)
        if (resourcesData.length > 0) {
          return resourcesData
            .map(data => {
              const displayFields = field.resourceConfig?.displayFields || []
              return displayFields
                .map((df: any) => `${df.label}: ${data[df.key]}`)
                .filter(Boolean)
                .join(" | ")
            })
            .join("\n")
        }
      }

      // 如果是对象，尝试直接使用对象的值
      if (typeof value === "object" && value !== null) {
        const fields = Object.entries(value)
          .filter(([_, v]) => v != null && v !== "")
          .map(([_, v]) => `${v}`)
          .join("，")
        return fields || "____________"
      }

      return value.dataid || "____________"
    } catch (error) {
      console.error("Error formatting resource value:", error)
      return "____________"
    }

}

// 格式化字段值
const formatFieldValue = (type: string, value: any, field?: any) => {
if (value === undefined || value === null || value === "") return "****\_\_\_\_****"

    switch (type) {
      case "signature":
        if (typeof value === "string" && value.startsWith("data:image")) {
          return (
            <img
              src={value}
              alt='签名'
              style={{
                maxWidth: "120px",
                maxHeight: "60px",
                objectFit: "contain",
              }}
              className='print-signature'
            />
          )
        }
        return "____________"
      case "date":
      case "datetime":
      case "time":
        try {
          return format(new Date(value), "yyyy-MM-dd HH:mm:ss")
        } catch {
          return "____________"
        }
      case "number":
        return typeof value === "number" ? value.toFixed(2) : "____________"
      case "resource":
        return formatResourceValue(field, value)
      default:
        if (typeof value === "object" && value !== null) {
          try {
            const fields = Object.entries(value)
              .filter(([_, v]) => v != null && v !== "")
              .map(([_, v]) => `${v}`)
              .join("，")
            return fields || "____________"
          } catch (error) {
            console.error("Error formatting object value:", error)
            return "____________"
          }
        }
        return value || "____________"
    }

}

// 确保基本信息数据的完整性
const ensureBasicInfo = () => {
const basicData = {
...data,
...(data?.basicInfo || {}),
}

    const systemFields = ["tableData", "processConfirmations"]
    return Object.fromEntries(Object.entries(basicData).filter(([key]) => !systemFields.includes(key)))

}

// 渲染基本信息字段
const renderBasicFields = () => {
const basicInfo = ensureBasicInfo()

    if (
      !renderConfig.basicFields ||
      typeof renderConfig.basicFields !== "object" ||
      !("groups" in renderConfig.basicFields)
    ) {
      const fieldArray = Array.isArray(renderConfig.basicFields) ? renderConfig.basicFields : []
      return (
        <table className='w-full border-collapse'>
          <tbody>
            {fieldArray.map((field, index) => (
              <tr key={field.name} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className='border border-gray-300 p-2 w-[200px] font-medium text-gray-700'>{field.label}</td>
                <td className='border border-gray-300 p-2'>{formatFieldValue(field.type, basicInfo[field.name], field)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    const { groups } = renderConfig.basicFields
    return (
      <div className='space-y-6'>
        {groups.map((group) => (
          <div key={group.key} className='print:break-inside-avoid'>
            <div className='flex items-center gap-2 mb-3 pb-2 border-b-2 border-gray-300'>
              {group.icon && <Icon icon={group.icon} className='text-gray-500' />}
              <h3 className='text-base font-bold text-gray-800'>{group.title}</h3>
            </div>
            {group.description && <p className='text-sm text-gray-500 mb-3 italic'>{group.description}</p>}
            <table className='w-full border-collapse'>
              <tbody>
                {group.fields.map((field, index) => (
                  <tr key={field.name} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className='border border-gray-300 p-2 w-[200px] font-medium text-gray-700'>{field.label}</td>
                    <td className='border border-gray-300 p-2'>
                      {formatFieldValue(field.type, basicInfo[field.name], field)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    )

}

// 渲染表格数据
const renderTable = () => {
if (!renderConfig.table) return null

    const tableData = data?.tableData || []
    const displayData = tableData.length > 0 ? tableData : [{}]

    return (
      <div className='mt-6'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gray-100'>
              {renderConfig.table.columns.map((column, index) => (
                <th
                  key={column.key}
                  className={cn(
                    "border border-gray-300 p-2 text-sm font-bold text-gray-800",
                    column.type === "number" && "text-right"
                  )}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row: any, rowIndex: number) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : ""}>
                {renderConfig.table!.columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "border border-gray-300 p-2 text-sm",
                      column.type === "number" && "text-right font-mono"
                    )}
                  >
                    {formatFieldValue(column.type, row[column.key], column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )

}

// 渲染流程确认信息
const renderProcessSteps = () => {
if (!renderConfig.processSteps) return null

    const processConfirmations = data?.processConfirmations || {}

    return (
      <div className='mt-6 space-y-6'>
        {renderConfig.processSteps.map((step) => {
          const stepData = processConfirmations[step.key] || {}

          return (
            <div key={step.key} className='process-step border border-gray-300 rounded-lg p-4'>
              <div className='flex justify-between items-center mb-3 pb-2 border-b border-gray-200'>
                <div className='flex items-center gap-2'>
                  <span className='font-bold text-gray-800'>{step.title}</span>
                  {step.description && <span className='text-sm text-gray-500 italic'>({step.description})</span>}
                </div>
                <div className='text-sm font-medium'>
                  {stepData?.confirmed ? (
                    <span className='text-green-600'>已确认</span>
                  ) : (
                    <span className='text-gray-400'>未确认</span>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 mb-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-500'>确认人：</span>
                  <span className='text-sm font-medium'>{stepData?.confirmer || "____________"}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-500'>确认时间：</span>
                  <span className='text-sm font-medium'>
                    {stepData?.confirmationDate
                      ? format(new Date(stepData.confirmationDate), "yyyy-MM-dd HH:mm:ss")
                      : "____________"}
                  </span>
                </div>
              </div>

              {step.fields && (
                <table className='w-full border-collapse'>
                  <tbody>
                    {step.fields.map((field, index) => (
                      <tr key={field.name} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className='border border-gray-300 p-2 w-[200px] text-sm font-medium text-gray-700'>
                          {field.label}
                        </td>
                        <td className='border border-gray-300 p-2 text-sm'>
                          {formatFieldValue(field.type, stepData?.formData?.[field.name], field)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>
    )

}

// 渲染页脚
const renderFooter = () => {
return (
<div className='mt-8 pt-4 border-t-2 border-gray-300'>
<div className='grid grid-cols-2 gap-8'>
<div className='space-y-4'>
<div className='flex items-center gap-2'>
<span className='text-sm text-gray-500'>制单人：</span>
<span className='flex-1 border-b border-gray-300'>****\_\_\_\_****</span>
</div>
<div className='flex items-center gap-2'>
<span className='text-sm text-gray-500'>日期：</span>
<span className='flex-1 border-b border-gray-300'>****\_\_\_\_****</span>
</div>
</div>
<div className='space-y-4'>
<div className='flex items-center gap-2'>
<span className='text-sm text-gray-500'>审核人：</span>
<span className='flex-1 border-b border-gray-300'>****\_\_\_\_****</span>
</div>
<div className='flex items-center gap-2'>
<span className='text-sm text-gray-500'>日期：</span>
<span className='flex-1 border-b border-gray-300'>****\_\_\_\_****</span>
</div>
</div>
</div>
</div>
)
}

return (
<div ref={ref} className='p-8 bg-white max-w-[210mm] mx-auto'>
{/_ 页眉 _/}
<div className='text-center mb-8 pb-4 border-b-2 border-gray-300'>
<h1 className='text-2xl font-bold text-gray-900 mb-2'>{metadata.title}</h1>
{metadata.description && <p className='text-sm text-gray-500 italic'>{metadata.description}</p>}
<div className='absolute top-8 right-8 text-sm text-gray-500'>
<div>单号：{data?.orderNumber || "****\_\_\_\_****"}</div>
<div>日期：{format(new Date(), "yyyy-MM-dd")}</div>
</div>
</div>

      {/* 基本信息 */}
      <div className='mb-6'>
        <div className='flex items-center gap-2 mb-3'>
          <div className='w-1 h-6 bg-gray-800'></div>
          <h2 className='text-lg font-bold text-gray-800'>基本信息</h2>
        </div>
        {renderBasicFields()}
      </div>

      {/* 表格数据 */}
      {renderConfig.table && (
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='w-1 h-6 bg-gray-800'></div>
            <h2 className='text-lg font-bold text-gray-800'>明细信息</h2>
          </div>
          {renderTable()}
        </div>
      )}

      {/* 流程确认 */}
      {renderConfig.processSteps && (
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='w-1 h-6 bg-gray-800'></div>
            <h2 className='text-lg font-bold text-gray-800'>流程确认</h2>
          </div>
          {renderProcessSteps()}
        </div>
      )}

      {/* 页脚 */}
      {renderFooter()}

      {/* 打印样式 */}
      <style type='text/css' media='print'>{`
        @page {
          size: A4;
          margin: 20mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
          .process-step {
            break-inside: avoid;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 8px !important;
          }
          h1 {
            font-size: 24px !important;
            margin-bottom: 12px !important;
          }
          h2 {
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }
          .mb-6 {
            margin-bottom: 24px !important;
          }
          .mb-3 {
            margin-bottom: 12px !important;
          }
          .p-8 {
            padding: 32px !important;
          }
          .bg-gray-50 {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-signature {
            max-width: 120px !important;
            max-height: 60px !important;
            object-fit: contain !important;
          }
          .text-gray-500 {
            color: #6b7280 !important;
          }
          .text-gray-700 {
            color: #374151 !important;
          }
          .text-gray-800 {
            color: #1f2937 !important;
          }
          .text-gray-900 {
            color: #111827 !important;
          }
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
          .border-gray-200 {
            border-color: #e5e7eb !important;
          }
        }
      `}</style>
    </div>

)
})

PrintableTemplate.displayName = "PrintableTemplate"

export default PrintableTemplate
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/ProcessConfirm/ProcessStep.tsx">
                    <FileContent>
                      import React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { ProcessStep as ProcessStepType } from "../../types"
import { UseFormReturn } from "react-hook-form"
import ProcessStepForm from "./ProcessStepForm"
import ProcessStepConfirmation from "./ProcessStepConfirmation"
import { motion, AnimatePresence } from "framer-motion"

interface ProcessStepProps {
step: ProcessStepType
form: UseFormReturn<any>
isEditable?: boolean
fieldName?: string
isConfirming: boolean
onConfirm: (step: ProcessStepType) => void
onCancel: (step: ProcessStepType) => void
}

const ProcessStep: React.FC<ProcessStepProps> = ({
step,
form,
isEditable = true,
fieldName = "processConfirmations",
isConfirming,
onConfirm,
onCancel,
}) => {
const stepData = form.watch(`${fieldName}.${step.key}`) || {}
const isConfirmed = stepData.confirmed
const isLoading = isConfirming
const isRequired = stepData.required

return (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.3, ease: "easeOut" }} >
<Card
className={cn(
"border-l-4 transition-all duration-300 ease-in-out transform hover:shadow-lg",
isConfirmed ? "border-l-blue-500 bg-blue-50/30" : "border-l-gray-200"
)} >
<CardContent className='p-4 md:p-6'>
<div className='flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 mb-4 md:mb-6'>
<div className='flex items-start gap-4'>
<motion.div
initial={false}
transition={{ duration: 0.3 }}
className={cn(
"w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
isConfirmed ? "bg-blue-100 text-blue-600 ring-2 ring-blue-200 shadow-md" : "bg-gray-50 text-gray-400"
)} >
<Icon
icon={isConfirmed ? "line-md:check-all" : "line-md:uploading"}
className={cn("w-5 h-5 transition-transform duration-300", isConfirmed ? "scale-110" : "")}
/>
</motion.div>
<div className='flex-1 min-w-0'>
<h3
className={cn(
"text-lg font-semibold break-all transition-colors duration-300",
isConfirmed ? "text-blue-600" : "text-gray-900"
)} >
{step.title}
{isRequired && (
<motion.span
initial={{ opacity: 0, scale: 0 }}
animate={{ opacity: 1, scale: 1 }}
className='text-red-500 ml-1' > \*
</motion.span>
)}
</h3>
{step.description && (
<p className='text-gray-500 mt-1 text-sm leading-relaxed break-all'>{step.description}</p>
)}
</div>
</div>

            {isEditable && (
              <div className='flex w-full md:w-auto'>
                <AnimatePresence mode='wait'>
                  {!isConfirmed ? (
                    <motion.div
                      key='confirm'
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        onClick={() => onConfirm(step)}
                        variant='bordered'
                        size='sm'
                        isLoading={isLoading}
                        className={cn(
                          "font-medium w-full md:w-auto transition-all duration-300",
                          isLoading ? "opacity-70" : "hover:bg-blue-50 hover:text-blue-600 hover:scale-105"
                        )}
                        startContent={!isLoading && <Icon icon='mdi:check' className='w-4 h-4' />}
                      >
                        <span className='hidden md:inline'>确认</span>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key='cancel'
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        onClick={() => onCancel(step)}
                        variant='bordered'
                        size='sm'
                        color='danger'
                        className='font-medium hover:bg-red-50 hover:scale-105 transition-all duration-300 w-full md:w-auto'
                        startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
                      >
                        <span className='hidden md:inline'>取消确认</span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <AnimatePresence>
            {step.fields && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProcessStepForm
                  step={step}
                  form={form}
                  isEditable={isEditable}
                  isConfirmed={isConfirmed}
                  fieldName={fieldName}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isConfirmed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <ProcessStepConfirmation confirmer={stepData.confirmer} confirmationDate={stepData.confirmationDate} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>

)
}

export default ProcessStep

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/ProcessConfirm/ProcessStepConfirmation.tsx">
                    <FileContent>
                      import React from "react"

import { format } from "date-fns"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { motion } from "framer-motion"

interface ProcessStepConfirmationProps {
confirmer: string
confirmationDate: string
}

const ProcessStepConfirmation: React.FC<ProcessStepConfirmationProps> = ({
confirmer,
confirmationDate,
}) => {
return (
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 pt-4 border-t border-blue-100">
<motion.div
className="space-y-2"
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.3 }} >
<label className="text-gray-500 flex items-center gap-2 text-sm">
<Icon icon="mdi:account" className="w-4 h-4" />
确认人
</label>
<p className={cn(
"font-medium text-gray-900 pl-6",
"transition-all duration-300",
"hover:text-blue-600"
)}>
{confirmer}
</p>
</motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <label className="text-gray-500 flex items-center gap-2 text-sm">
          <Icon icon="mdi:clock" className="w-4 h-4" />
          确认时间
        </label>
        <p className={cn(
          "font-medium text-gray-900 pl-6",
          "transition-all duration-300",
          "hover:text-blue-600"
        )}>
          {confirmationDate &&
            format(new Date(confirmationDate), "yyyy-MM-dd HH:mm:ss")}
        </p>
      </motion.div>
    </div>

)
}

export default ProcessStepConfirmation
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/ProcessConfirm/ProcessStepForm.tsx">
                    <FileContent>
                      import React from "react"

import { UseFormReturn } from "react-hook-form"
import { cn } from "@/theme/cn"
import DynamicFormFields from "../DynamicFormFields"
import { ProcessStep } from "../../types"
import { motion } from "framer-motion"

interface ProcessStepFormProps {
step: ProcessStep
form: UseFormReturn<any>
isEditable?: boolean
isConfirmed?: boolean
fieldName?: string
}

const ProcessStepForm: React.FC<ProcessStepFormProps> = ({
step,
form,
isEditable = true,
isConfirmed = false,
fieldName = "processConfirmations",
}) => {
if (!step.fields) return null

// 添加字段值变化处理函数
const handleFieldChange = (field: string, value: any) => {
// 使用正确的路径格式设置表单值
const formDataPath = `${fieldName}.${step.key}.formData.${field}`
console.log('Setting form value:', {
path: formDataPath,
value,
currentFormData: form.getValues(`${fieldName}.${step.key}.formData`),
allValues: form.getValues()
})
form.setValue(formDataPath, value)
}

return (
<motion.div
className={cn(
"mt-4 pt-4 border-t border-gray-100",
"transition-all duration-300",
isConfirmed ? "opacity-70 hover:opacity-100" : "",
"rounded-lg"
)}
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{
        duration: 0.3,
        ease: "easeOut"
      }} >
<motion.div
initial="hidden"
animate="visible"
variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }} >
<DynamicFormFields
fields={step.fields}
form={form}
isEditable={isEditable && !isConfirmed}
onChange={handleFieldChange}
/>
</motion.div>
</motion.div>
)
}

export default ProcessStepForm
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/ProcessConfirm/hooks/useProcessConfirm.ts">
                    <FileContent>
                      import { useState, useEffect, useCallback } from "react"

import { UseFormReturn } from "react-hook-form"
import { ProcessStep, ProcessProgress } from "../../../types"
import message from "@/components/Message"
import { getCurrentAccountInfo } from "@/service/apis/user"

interface UseProcessConfirmProps {
steps: ProcessStep[]
form: UseFormReturn<any>
fieldName?: string
isEditable?: boolean
}

export const useProcessConfirm = ({
steps,
form,
fieldName = "processConfirmations",
isEditable = true,
}: UseProcessConfirmProps) => {
const [currentUser, setCurrentUser] = useState<any>(null)
const [isConfirming, setIsConfirming] = useState<string>("")

useEffect(() => {
const fetchUser = async () => {
try {
const user = await getCurrentAccountInfo()
setCurrentUser(user)
} catch (error) {
console.error("Failed to fetch user info:", error)
message.error("获取用户信息失败")
}
}

    if (!currentUser && isEditable) {
      fetchUser()
    }

}, [currentUser, isEditable])

useEffect(() => {
const currentValues = form.getValues(fieldName) || {}
const updates: Record<string, any> = {}
let needsUpdate = false

    steps.forEach((step) => {
      if (!currentValues[step.key]) {
        updates[`${fieldName}.${step.key}`] = {
          confirmed: false,
          confirmer: "",
          confirmationDate: "",
          formData: {},
          hidden: false,
          required: step.required || false,
        }
        needsUpdate = true
      }
    })

    if (needsUpdate) {
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })
    }

}, [steps, fieldName, form])

const calculateProgress = useCallback((): ProcessProgress => {
const values = form.getValues(fieldName) || {}
console.log("Calculating progress with values:", values)

    const totalWeight = steps.reduce((sum, step) => sum + (step.weight || 1), 0)
    let completedWeight = 0
    let currentStepIndex = 0
    const status: ProcessProgress['status'] = {}

    steps.forEach((step, index) => {
      const stepData = values[step.key] || {}
      const stepWeight = step.weight || 1

      if (stepData.confirmed) {
        completedWeight += stepWeight
      } else if (currentStepIndex === 0) {
        currentStepIndex = index
      }

      // 检查步骤是否被阻塞
      const isBlocked = step.dependencies?.some(dep => {
        const dependentStep = values[dep.step]
        if (!dependentStep?.confirmed) return true
        if (dep.condition) {
          const { field, value, custom } = dep.condition
          if (field && value !== undefined) {
            return dependentStep.formData[field] !== value
          }
          if (custom) {
            return !custom(dependentStep.formData)
          }
        }
        return false
      }) ?? false

      status[step.key] = {
        isCompleted: stepData.confirmed,
        isBlocked,
        blockReason: isBlocked ? "依赖步骤未完成" : undefined
      }
    })

    const progress = {
      total: steps.length,
      completed: Object.values(values).filter(step => step.confirmed).length,
      current: currentStepIndex,
      percentage: Math.round((completedWeight / totalWeight) * 100),
      status
    }

    console.log("Calculated progress:", progress)
    return progress

}, [steps, form, fieldName])

const handleConfirm = async (step: ProcessStep) => {
if (!currentUser) {
message.error("未能获取用户信息")
return
}

    if (step.fields) {
      const formDataPath = `${fieldName}.${step.key}.formData`
      const isValid = await form.trigger(formDataPath)
      if (!isValid) {
        message.error("请完成必填字段")
        return
      }
    }

    setIsConfirming(step.key)
    try {
      // 使用批量更新
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: true,
        [`${fieldName}.${step.key}.confirmer`]: currentUser.name || currentUser.email,
        [`${fieldName}.${step.key}.confirmationDate`]: new Date().toISOString(),
      }

      // 批量设置值
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      })

      // 触发表单更新
      await form.trigger(fieldName)

      // 手动触发重新计算进度
      calculateProgress()
    } catch (error) {
      console.error("Error confirming step:", error)
      message.error("确认失败")
    } finally {
      setIsConfirming("")
    }

}

const handleCancel = (step: ProcessStep) => {
try {
const updates = {
[`${fieldName}.${step.key}.confirmed`]: false,
[`${fieldName}.${step.key}.confirmer`]: "",
[`${fieldName}.${step.key}.confirmationDate`]: "",
}

      // 批量设置值
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      })

      // 触发表单更新
      form.trigger(fieldName)

      // 手动触发重新计算进度
      calculateProgress()
    } catch (error) {
      console.error("Error canceling confirmation:", error)
      message.error("取消确认失败")
    }

}

return {
currentUser,
isConfirming,
handleConfirm,
handleCancel,
calculateProgress,
}
}

export const createProcessWatch = (form: UseFormReturn<any>, fieldName: string) => {
return {
setStepVisibility: (stepKey: string, visible: boolean) => {
form.setValue(`${fieldName}.${stepKey}.hidden`, !visible)
},

    setStepRequired: (stepKey: string, required: boolean) => {
      form.setValue(`${fieldName}.${stepKey}.required`, required)
    },

    watchStepStatus: (stepKey: string, callback: (status: any) => void) => {
      return form.watch(`${fieldName}.${stepKey}.status`, callback)
    },

    batchUpdateSteps: (updates: Array<{
      stepKey: string,
      updates: Record<string, any>
    }>) => {
      updates.forEach(({ stepKey, updates }) => {
        Object.entries(updates).forEach(([key, value]) => {
          form.setValue(`${fieldName}.${stepKey}.${key}`, value)
        })
      })
    }

}
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/components/ProcessConfirm/index.tsx">
                    <FileContent>
                      import React, { useMemo } from "react"

import { UseFormReturn } from "react-hook-form"
import { ProcessStep as ProcessStepType, ProcessProgress } from "../../types"
import { useProcessConfirm } from "./hooks/useProcessConfirm"
import ProcessStep from "./ProcessStep"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"
import { Progress } from "@nextui-org/react"
import styles from "../../styles/DynamicForm.module.css"

interface DynamicProcessConfirmProps {
steps: ProcessStepType[]
form: UseFormReturn<any>
isEditable?: boolean
fieldName?: string
}

const ProcessProgressIndicator: React.FC<{
progress: ProcessProgress
}> = ({ progress }) => {
return (
<div className='space-y-2 mb-4'>
<Progress aria-label='Progress' value={progress.percentage} className='max-w-md' color='primary' />
<div className='flex justify-between text-sm text-gray-500'>
<span>
已完成 {progress.completed}/{progress.total} 步
</span>
<span>{progress.percentage}%</span>
</div>
</div>
)
}

const DynamicProcessConfirm: React.FC<DynamicProcessConfirmProps> = ({
steps,
form,
isEditable = true,
fieldName = "processConfirmations",
}) => {
const { isConfirming, handleConfirm, handleCancel, calculateProgress } = useProcessConfirm({
steps,
form,
fieldName,
isEditable,
})

const [selectedStep, setSelectedStep] = React.useState<string>(steps[0]?.key || "")
const [hasScroll, setHasScroll] = React.useState(false)

// 检查是否需要显示滚动阴影
React.useEffect(() => {
const tabsList = document.querySelector(`.${styles["tabs-list-scroll"]}`)
if (tabsList) {
const checkScroll = () => {
setHasScroll(tabsList.scrollWidth > tabsList.clientWidth)
}
checkScroll()
window.addEventListener("resize", checkScroll)
return () => window.removeEventListener("resize", checkScroll)
}
}, [steps])

// 监听表单值变化
const formValues = form.watch(fieldName)

// 计算进度
const progress = useMemo(() => {
console.log("Calculating progress with values:", formValues)
return calculateProgress()
}, [calculateProgress, formValues])

// 添加表单值变化监听
React.useEffect(() => {
const subscription = form.watch(() => {
console.log("Form values changed:", form.getValues(fieldName))
form.trigger(fieldName)
})
return () => subscription.unsubscribe()
}, [form, fieldName])

// 检查步骤是否被阻塞
const isStepBlocked = (step: ProcessStepType): { blocked: boolean; reason?: string } => {
if (!step.dependencies?.length) return { blocked: false }

    for (const dep of step.dependencies) {
      const dependentStepData = form.watch(`${fieldName}.${dep.step}`)

      if (!dependentStepData?.confirmed) {
        return {
          blocked: true,
          reason: dep.message || `需要先完成 "${steps.find((s) => s.key === dep.step)?.title}"`,
        }
      }

      if (dep.condition) {
        const { field, value, custom } = dep.condition
        if (field && value !== undefined) {
          if (dependentStepData.formData[field] !== value) {
            return {
              blocked: true,
              reason: dep.message || `依赖步骤的 ${field} 值不符合要求`,
            }
          }
        }
        if (custom && !custom(dependentStepData.formData)) {
          return {
            blocked: true,
            reason: dep.message || "自定义条件未满足",
          }
        }
      }
    }

    return { blocked: false }

}

// 新增：监听表单变化并触发重新渲染
React.useEffect(() => {
console.log("Current progress:", progress)
const subscription = form.watch(() => {
form.trigger(fieldName)
})
return () => subscription.unsubscribe()
}, [form, fieldName, progress])

return (
<div className='space-y-6'>
<ProcessProgressIndicator progress={progress} />

      <Tabs value={selectedStep} onValueChange={setSelectedStep}>
        <div className={styles["tabs-scroll-container"]}>
          <TabsList
            className={cn(
              styles["tabs-list-scroll"],
              "w-full flex justify-start",
              hasScroll && styles["tabs-scroll-shadow"]
            )}
          >
            {steps.map((step) => {
              const stepData = form.watch(`${fieldName}.${step.key}`) || {}
              if (stepData.hidden) return null

              const { blocked, reason } = isStepBlocked(step)
              const isCompleted = stepData.confirmed
              const isCurrent = selectedStep === step.key

              return (
                <TabsTrigger
                  key={step.key}
                  value={step.key}
                  disabled={blocked}
                  className={cn(
                    "flex items-center gap-2 relative rounded-md whitespace-nowrap",
                    isCompleted && "text-blue-600",
                    blocked && "opacity-50 cursor-not-allowed"
                  )}
                  title={blocked ? reason : undefined}
                >
                  <Icon
                    icon={isCompleted ? "mdi:check-circle" : blocked ? "mdi:lock" : "mdi:circle-outline"}
                    className={cn("w-5 h-5", isCompleted && "text-blue-600", blocked && "text-gray-400")}
                  />
                  <span>{step.title}</span>
                  {step.weight && <span className='text-xs text-gray-500'>({step.weight}分)</span>}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {steps.map((step) => {
          const stepData = form.watch(`${fieldName}.${step.key}`) || {}
          if (stepData.hidden) return null

          return (
            <TabsContent key={step.key} value={step.key}>
              <ProcessStep
                step={step}
                form={form}
                isEditable={isEditable}
                fieldName={fieldName}
                isConfirming={isConfirming === step.key}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            </TabsContent>
          )
        })}
      </Tabs>
    </div>

)
}

export default DynamicProcessConfirm

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/validation/ValidationManager.ts">
                    <FileContent>
                      import { DynamicFormConfig, FormField, TableColumn, ValidationResult, FormFieldGroup } from "../types"

import { get, set } from "lodash"

export class ValidationManager {
// 统一处理表单级别校验
static async validateForm(values: any, config: DynamicFormConfig): Promise<ValidationResult> {
try {
// 1. 收集所有需要校验的字段
const fields = this.collectFormFields(config)

      // 2. 执行字段校验
      const errors: Record<string, string> = {}

      for (const field of fields) {
        const value = get(values, field.path)
        const error = await this.validateField(field, value, values)
        if (error) {
          errors[field.path] = error
        }
      }

      if (Object.keys(errors).length > 0) {
        // 对错误进行分类
        const categorizedErrors = this.categorizeErrors(errors)

        return {
          valid: false,
          errors: Object.values(errors),
          fields: errors,
          categorizedErrors,
        }
      }

      // 3. 执行表单级别校验
      if (config.validate) {
        const formValidation = await config.validate(values)
        return formValidation
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        errors: ["表单校验出错"],
        fields: {},
      }
    }

}

// 收集所有需要校验的字段
private static collectFormFields(config: DynamicFormConfig): Array<{
path: string
label: string
type: string
required?: boolean
validators?: Array<(value: any, allValues?: any) => string | undefined>
}> {
const fields: any[] = []

    // 处理基本字段
    const basicFields = config.renderConfig.basicFields
    if (basicFields) {
      if ("groups" in basicFields) {
        // 处理分组字段
        basicFields.groups.forEach((group) => {
          group.fields.forEach((field) => {
            fields.push({
              ...field,
              path: field.name,
            })
          })
        })
      } else if (Array.isArray(basicFields)) {
        // 处理字段数组
        basicFields.forEach((field) => {
          fields.push({
            ...field,
            path: field.name,
          })
        })
      }
    }

    // 处理表格字段
    if (config.renderConfig.table?.columns) {
      config.renderConfig.table.columns.forEach((column) => {
        if (column.required) {
          fields.push({
            path: `tableData.${column.key}`,
            label: column.title,
            type: column.type,
            required: true,
          })
        }
      })
    }

    // 处理流程确认字段
    if (config.renderConfig.processSteps) {
      config.renderConfig.processSteps.forEach((step) => {
        if (step.fields) {
          step.fields.forEach((field) => {
            fields.push({
              ...field,
              path: `processConfirmations.${step.key}.formData.${field.name}`,
            })
          })
        }
      })
    }

    return fields

}

// 校验单个字段
private static async validateField(
field: {
path: string
label: string
type: string
required?: boolean
validators?: Array<(value: any, allValues?: any) => string | undefined>
},
value: any,
allValues: any
): Promise<string | undefined> {
try {
// 必填校验
if (field.required) {
if (field.type === "resource") {
if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
return `${field.label}不能为空`
}
} else if (value === undefined || value === null || value === "") {
return `${field.label}不能为空`
}
}

      // 类型校验
      const typeError = this.validateFieldType(field.type, value)
      if (typeError) {
        return typeError
      }

      // 自定义校验
      if (field.validators) {
        for (const validator of field.validators) {
          try {
            const error = await Promise.resolve(validator(value, allValues))
            if (error) {
              return error
            }
          } catch (error) {
            return `${field.label}校验出错`
          }
        }
      }

      return undefined
    } catch (error) {
      throw error
    }

}

// 校验字段类型
private static validateFieldType(type: string, value: any): string | undefined {
if (!value) return undefined

    switch (type) {
      case "resource":
        break
      case "signature":
        if (typeof value === "string" && /^data:image\/[a-z]+;base64,/.test(value)) {
          return undefined
        }
        return "请输入有效的signature数据"
      case "number":
        if (isNaN(Number(value))) {
          return "请输入有效的数字"
        }
        break
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "请输入有效的邮箱地址"
        }
        break
      case "tel":
        if (!/^1[3-9]\d{9}$/.test(value)) {
          return "请输入有效的手机号码"
        }
        break
      case "url":
        try {
          new URL(value)
        } catch {
          return "请输入有效的URL地址"
        }
        break
      case "date":
      case "datetime":
        if (isNaN(Date.parse(value))) {
          return "请输入有效的日期"
        }
        break
    }

    return undefined

}

// 对错误进行分类
private static categorizeErrors(errors: Record<string, string>): {
required?: Array<{ field: string; message: string }>
invalid?: Array<{ field: string; message: string }>
other?: Array<{ field: string; message: string }>
} {
const categorized: {
required?: Array<{ field: string; message: string }>
invalid?: Array<{ field: string; message: string }>
other?: Array<{ field: string; message: string }>
} = {}

    Object.entries(errors).forEach(([field, error]) => {
      // 提取分组信息（如果存在）
      const groupMatch = error.match(/\[(.*?)\]/)
      const groupInfo = groupMatch ? groupMatch[1] + " - " : ""
      const cleanError = error.replace(/\[.*?\]\s*/, "")

      if (cleanError.includes("不能为空") || cleanError.includes("数据不完整")) {
        categorized.required = categorized.required || []
        categorized.required.push({
          field,
          message: `${groupInfo}${cleanError}`,
        })
      } else if (cleanError.includes("有效") || cleanError.includes("格式") || cleanError.includes("类型")) {
        categorized.invalid = categorized.invalid || []
        categorized.invalid.push({
          field,
          message: `${groupInfo}${cleanError}`,
        })
      } else {
        categorized.other = categorized.other || []
        categorized.other.push({
          field,
          message: `${groupInfo}${cleanError}`,
        })
      }
    })

    return categorized

}
}

                    </FileContent>
                  </File></Project>
      <project_files>
                    File path: /Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/index.tsx
                    File content:
                    import React, { useState, useRef, useCallback, useEffect } from "react"

import { Form } from "@/components/ui/form"
import { Button, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { DynamicFormProps, TableGroup } from "./types"
import { useDynamicForm } from "./hooks/useDynamicForm"
import DynamicFormFields from "./components/DynamicFormFields"
import DynamicTable from "./components/DynamicTable"
import DynamicProcessConfirm from "./components/ProcessConfirm"
import OrderNumberField from "../OrderNumberField"
import message from "@/components/Message"
import { useMetadata } from "@/hooks/useMetadata"
import PrintableTemplate from "./components/PrintableTemplate"
import { useReactToPrint } from "react-to-print"
import { cn } from "@/theme/cn"
import { defaultFormConfig } from "./defaultConfig"
import { merge } from "lodash"
import styles from "./styles/DynamicForm.module.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DynamicForm: React.FC<DynamicFormProps> = ({
config: userConfig,
id,
onSubmit,
onCancel,
templateId,
initialValues,
isCreateMode,
previewMode = false,
}) => {
const config = merge({}, defaultFormConfig, userConfig)
const [isLoading, setIsLoading] = useState(false)
const { getDetail, create: createMetadata, update: updateMetadata } = useMetadata("form")
const { getDetail: getTemplateDetail } = useMetadata("template")
const [isUpdating, setIsUpdating] = useState(0)
const [formValues, setFormValues] = useState<any>(null)
const [validationErrors, setValidationErrors] = useState<{
required?: Array<{ field: string; message: string }>
invalid?: Array<{ field: string; message: string }>
other?: Array<{ field: string; message: string }>
}>({})
const [selectedTable, setSelectedTable] = useState<string>("")
const [hasScroll, setHasScroll] = React.useState(false)

// 检查是否需要显示滚动阴影
React.useEffect(() => {
const tabsList = document.querySelector(`.${styles["tabs-list-scroll"]}`)
if (tabsList) {
const checkScroll = () => {
setHasScroll(tabsList.scrollWidth > tabsList.clientWidth)
}
checkScroll()
window.addEventListener("resize", checkScroll)
return () => window.removeEventListener("resize", checkScroll)
}
}, [])

// 加载表单数据的统一函数
const loadFormData = async (formId: string) => {
try {
const formData = await getDetail(formId)
if (formData) {
setFormValues(formData.data)
form.reset(formData.data)
}
return formData
} catch (error) {
console.error("Failed to load form data:", error)
message.error("加载表单数据失败")
throw error
}
}

useEffect(() => {
const initializeForm = async () => {
if (initialValues) {
setFormValues(initialValues)
return
}

      if (id) {
        setIsLoading(true)
        try {
          await loadFormData(id)
        } finally {
          setIsLoading(false)
        }
      }
    }

    initializeForm()

}, [id, getDetail, initialValues])

useEffect(() => {
// 设置默认选中的表格
if (config.renderConfig.tables && config.renderConfig.tables.length > 0) {
setSelectedTable(config.renderConfig.tables[0].key)
}
}, [])

const { form, submitForm } = useDynamicForm(config, initialValues)
const [isEditing, setIsEditing] = useState(false)
const printRef = useRef<HTMLDivElement>(null)
const printId = useRef<string>()

useEffect(() => {
if (config.watch) {
const unsubscribe = config.watch(form)
return () => {
if (typeof unsubscribe === "function") {
unsubscribe()
}
}
}
}, [config.watch, form])

const getTemplateInfo = async (templateId: string | undefined) => {
if (!templateId) return null

    try {
      const template = await getTemplateDetail(templateId)
      if (!template) return null

      return {
        id: template.id,
        title: template.title,
        type: template.type || "custom",
      }
    } catch (error) {
      console.error("Failed to get template info:", error)
      return null
    }

}

const prepareFormData = (formValues: any, templateInfo: any) => {
const orderNumberFieldName = config.orderNumberConfig?.fieldName || "orderNumber"
const orderNumber = formValues[orderNumberFieldName]

    return {
      title: orderNumber || config.metadata.title,
      status: "submitted",
      data: formValues,
      templateId: templateId,
      template: templateInfo,
      indexFields: {
        templateId: templateId,
        templateTitle: templateInfo?.title,
        templateType: templateInfo?.type,
        orderNumber: orderNumber,
        createdAt: new Date().toISOString(),
      },
    }

}

const handleValidationErrors = (errors?: string[]) => {
if (!errors?.length) return

    const fieldErrors = form.formState.errors
    Object.entries(fieldErrors).forEach(([field, error]) => {
      form.setError(field, {
        type: "custom",
        message: error.message || String(error),
      })
    })

    const errorContent = (
      <div className='space-y-2'>
        {errors.map((error, index) => (
          <div key={index} className='flex items-center gap-2'>
            <Icon icon='mdi:alert-circle' className='w-4 h-4 text-red-500' />
            <span>{error}</span>
          </div>
        ))}
      </div>
    )

    message.error(errorContent)

}

const handlePrint = useReactToPrint({
contentRef: printRef,
documentTitle: config.metadata.title || "表单打印",
onBeforePrint: () => {
return new Promise((resolve) => {
const values = form.getValues()
if (!values) {
message.error("没有可打印的内容")
resolve(false)
return
}
printId.current = message.loading("正在准备打印...")
setTimeout(resolve, 500)
})
},
onAfterPrint: () => {
message.closeLoading(printId.current)
},
onPrintError: (error) => {
message.closeLoading(printId.current)
console.error("Print error:", error)
message.error("打印失败，请重试")
},
pageStyle: `       @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        html, body {
          height: 100vh;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden;
        }
      }
    `,
})

const handleFormSubmit = useCallback(
async (e: React.FormEvent) => {
e.preventDefault()
try {
const { success, validationResult, values, error } = await submitForm(form.getValues())

        if (!success) {
          if (validationResult) {
            if (validationResult.fields) {
              Object.entries(validationResult.fields).forEach(([field, error]) => {
                form.setError(field, {
                  type: "custom",
                  message: error,
                })
              })
            }

            if (validationResult.categorizedErrors) {
              setValidationErrors(validationResult.categorizedErrors)
            }

            handleValidationErrors(validationResult.errors)
          }
          return
        }

        if (onSubmit) {
          await onSubmit(validationResult!, values)
          form.reset()
          return
        }

        const templateInfo = await getTemplateInfo(templateId)
        const formData = prepareFormData(values, templateInfo)

        if (previewMode) {
          message.warning("预览模式下无法保存数据")
          return
        }

        let savedFormId: string | undefined

        if (id) {
          const result = await updateMetadata(id, formData)
          if (result) {
            savedFormId = id
          } else {
            throw new Error("更新失败")
          }
        } else {
          const result = await createMetadata(formData)
          if (result) {
            savedFormId = result.id
          } else {
            throw new Error("创建失败")
          }
        }

        // 保存成功后重新加载数据
        if (savedFormId) {
          await loadFormData(savedFormId)
          setIsEditing(false)
          message.success("保存成功")

          // 如果是新创建的表单，显示确认对话框
          if (!id) {
            message.confirm({
              title: "表单创建成功",
              content: "是否前往查看创建好的表单?",
              onOk: () => {
                window.location.href = `/form/${savedFormId}`
              },
              onCancel: () => {
                setIsEditing(true)
              },
            })
          }
        }

        setIsUpdating(new Date().getTime())
      } catch (error) {
        console.error("Form submission error:", error)
        message.error("提交失败，请重试")
      }
    },
    [form, id, onSubmit, templateId, updateMetadata, createMetadata]

)

const { metadata, renderConfig } = config

const orderNumberConfig = {
prefix: config.orderNumberConfig?.prefix || "ORDER",
fieldName: config.orderNumberConfig?.fieldName || "orderNumber",
label: config.orderNumberConfig?.label || "订单编号",
}

if (isLoading) {
return (
<div className='flex items-center justify-center min-h-[200px]'>
<Spinner label='加载中...' />
</div>
)
}

const renderTables = () => {
// 如果有旧版的单表格配置，使用旧版配置
if (renderConfig.table) {
return (
<div className={cn(styles["form-card"])}>
<h2 className={cn(styles["form-title"])}>明细信息</h2>
<DynamicTable config={renderConfig.table} form={form} isEditable={isEditing} fieldName='tableData' />
</div>
)
}

    // 如果有新版的多表格配置，使用新版配置
    if (renderConfig.tables && renderConfig.tables.length > 0) {
      return (
        <div className={cn(styles["form-card"])}>
          <h2 className={cn(styles["form-title"])}>明细信息</h2>
          <Tabs value={selectedTable} onValueChange={setSelectedTable}>
            <div className={styles["tabs-scroll-container"]}>
              <TabsList
                className={cn(
                  styles["tabs-list-scroll"],
                  "w-full flex justify-start",
                  hasScroll && styles["tabs-scroll-shadow"]
                )}
              >
                {renderConfig.tables.map((table: TableGroup) => (
                  <TabsTrigger key={table.key} value={table.key}>
                    {table.icon && <Icon icon={table.icon} className='mr-1' />}
                    <span>{table.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {renderConfig.tables.map((table: TableGroup) => (
              <TabsContent key={table.key} value={table.key}>
                {table.description && <p className='text-sm text-gray-500 mb-4'>{table.description}</p>}
                <DynamicTable
                  config={table.config}
                  form={form}
                  isEditable={isEditing}
                  fieldName={`tableData.${table.key}`}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )
    }

    return null

}
return (
<Form {...form}>
<form onSubmit={handleFormSubmit} className={cn(styles["dynamic-form"], "space-y-6 md:space-y-8 pb-2")}>
{/_ 表单标题 _/}
<div
className={cn(styles["form-card"], "flex flex-col md:flex-row md:justify-between md:items-center pb-4 gap-4")} >
<div>
<h1 className={cn(styles["form-title"])}>{metadata.title}</h1>
<div className='mb-2 flex items-center'>
<span className='text-xs text-gray-600'>表单编号：</span>
<OrderNumberField
                form={form}
                prefix={orderNumberConfig.prefix}
                fieldName={orderNumberConfig.fieldName}
                label={orderNumberConfig.label}
                disabled={!isEditing}
                isUpdating={isUpdating}
                isCreateMode={isCreateMode}
              />
</div>
</div>
<div className='flex gap-2 flex-wrap'>
{metadata.permissions?.print && (
<Button
variant='flat'
onClick={handlePrint}
className={cn(styles["button"], styles["button-primary"], "hidden md:flex w-full md:w-auto")} >
<Icon icon='mdi:printer' className='w-4 h-4' />
<span className='hidden md:inline ml-1'>打印</span>
</Button>
)}
{metadata.permissions?.edit && (
<Button
variant='bordered'
color={isEditing ? "warning" : "primary"}
className={cn(styles["button"], "w-full md:w-auto")}
onClick={() => setIsEditing(!isEditing)} >
<Icon icon={isEditing ? "mdi:pencil-off" : "mdi:pencil"} className='w-4 h-4' />
<span className='hidden md:inline ml-1'>{isEditing ? "取消填写" : "填写表单"}</span>
</Button>
)}
</div>
</div>

        {/* 基本信息 */}
        <div className={cn(styles["form-card"])}>
          <h2 className={cn(styles["form-title"])}>基本信息</h2>
          <DynamicFormFields fields={renderConfig.basicFields} form={form} isEditable={isEditing} />
        </div>

        {/* 表格 */}
        {renderTables()}

        {/* 流程确认 */}
        {renderConfig.processSteps && (
          <div className={cn(styles["form-card"])}>
            <h2 className={cn(styles["form-title"])}>流程确认</h2>
            <DynamicProcessConfirm steps={renderConfig.processSteps} form={form} isEditable={isEditing} />
          </div>
        )}

        {/* 操作按钮 */}
        {isEditing && (
          <div className={cn(styles["form-card"], "flex flex-col md:flex-row md:justify-end gap-4 pt-4 border-t")}>
            {onCancel && (
              <Button
                variant='flat'
                color='default'
                onClick={onCancel}
                className={cn(styles["button"], "w-full md:w-auto order-2 md:order-1")}
              >
                <Icon icon='mdi:close' className='w-4 h-4' />
                <span className='hidden md:inline ml-1'>取消</span>
              </Button>
            )}
            <Button
              type='submit'
              color='primary'
              className={cn(styles["button"], styles["button-primary"], "w-full md:w-auto order-1 md:order-2")}
            >
              <Icon icon='mdi:content-save' className='w-4 h-4' />
              <span className='hidden md:inline ml-1'>{isCreateMode ? "创建表单" : "保存"}</span>
            </Button>
          </div>
        )}

        {/* 隐藏的打印内容 */}
        <div style={{ display: "none" }}>
          <PrintableTemplate ref={printRef} config={config} data={form.getValues()} />
        </div>
      </form>
    </Form>

)
}

export default DynamicForm

                    </project_files>


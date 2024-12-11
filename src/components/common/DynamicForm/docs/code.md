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
window.addEventListener('resize', checkScroll)
return () => window.removeEventListener('resize', checkScroll)
}
}, [config.columns])

const tableData = useWatch({
control: form.control,
name: fieldName,
defaultValue: [],
})

// 新增：处理资源选择后的字段映射
const handleResourceSelect = useCallback((rowIndex: number, columnKey: string, selected: any) => {
if (!selected || !selected[0]) return;

    const resource = selected[0];
    const column = config.columns.find(col => col.key === columnKey);

    if (column?.resourceConfig?.fieldMapping) {
      Object.entries(column.resourceConfig.fieldMapping).forEach(([targetField, mapping]) => {
        // 找到目标列配置
        const targetColumn = config.columns.find(col => col.key === targetField);
        if (!targetColumn) return;

        // 设置映射标记
        targetColumn.isMappedField = true;
        targetColumn.mappedFrom = `${columnKey}.${typeof mapping === 'string' ? mapping : mapping.field}`;
        targetColumn.editable = false;

        if (typeof mapping === 'string') {
          // 简单映射
          const value = resource[mapping];
          if (value !== undefined) {
            form.setValue(`${fieldName}.${rowIndex}.${targetField}`, value);
          }
        } else {
          // 复杂映射
          if (mapping.condition && !mapping.condition(resource)) {
            return;
          }

          if (mapping.fields) {
            // 多字段组合
            const values = mapping.fields.map(field => resource[field]);
            const value = mapping.transform ? mapping.transform(values) : values.join(' ');
            form.setValue(`${fieldName}.${rowIndex}.${targetField}`, value);
          } else {
            // 单字段转换
            const value = resource[mapping.field];
            const transformedValue = mapping.transform ? mapping.transform(value) : value;
            if (transformedValue !== undefined) {
              form.setValue(`${fieldName}.${rowIndex}.${targetField}`, transformedValue);
            }
          }
        }
      });
    }

}, [config.columns, fieldName, form]);

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
                    <Input
                      {...field}
                      disabled={!isFieldEditable}
                      className={cn(
                        "min-w-[120px] border-0 focus:ring-0 bg-transparent"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isFieldEditable && column.resourceConfig && (
              <ResourceSelectButton
                resourceName={column.resourceConfig.resourceId}
                selectionMode="single"
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
                  <div className="relative">
                    <Input
                      {...field}
                      disabled={!isFieldEditable}
                      className={cn(
                        "border-0 focus:ring-0 bg-transparent",
                        column.isMappedField && "bg-gray-50"
                      )}
                    />
                    {column.isMappedField && (
                      <Icon
                        icon="mdi:link-variant"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
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

    // 修改: 增加summary的空值处理
    const values = form.getValues() || {}
    return column.summary.render(values)

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
                        minWidth: column.width || '80px'
                      }}
                      className='border border-gray-200 whitespace-nowrap'
                    >
                      <div className='flex items-center gap-1'>
                        {column.title}
                        {column.isMappedField && (
                          <Icon
                            icon="mdi:link-variant"
                            className="text-gray-400"
                            title="自动填充字段"
                          />
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
                        className={cn(
                          'border border-gray-200',
                          column.isMappedField && 'bg-gray-50'
                        )}
                        style={{
                          minWidth: column.width || '80px'
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
                          minWidth: column.width || '80px'
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
import { Card, CardBody } from "@nextui-org/react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"
import { Spinner } from "@nextui-org/react"
import { useMetadata } from "@/hooks/metadata"
import message from "@/components/Message"
import { Input } from "@/components/ui/input"
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
                      disabled={!isEditable || field.disabled}
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
if (!value) return "\***\*\_\_\_\_\*\***"

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
if (value === undefined || value === null || value === "") return "\***\*\_\_\_\_\*\***"

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

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/defaultConfig.ts">
                    <FileContent>
                      import { DynamicFormConfig, ToolbarButton } from "./types"

// 默认工具栏按钮配置
export const defaultToolbarButtons: ToolbarButton[] = [
{
key: "save",
label: "保存",
icon: "mdi:content-save",
color: "primary",
variant: "flat",
onClick: () => {
console.log("Default save action")
},
},
{
key: "edit",
label: "编辑",
icon: "mdi:pencil",
color: "primary",
variant: "flat",
onClick: () => {
console.log("Default edit action")
},
},
{
key: "print",
label: "打印",
icon: "mdi:printer",
color: "primary",
variant: "flat",
onClick: () => {
console.log("Default print action")
},
},
{
key: "cancel",
label: "取消",
icon: "mdi:close",
color: "default",
variant: "flat",
onClick: () => {
console.log("Default cancel action")
},
},
]

// 默认表单配置
export const defaultFormConfig: DynamicFormConfig = {
metadata: {
title: "默认表单",
description: "",
permissions: {
edit: true,
delete: true,
print: true,
},
},
renderConfig: {
basicFields: [],
},
orderNumberConfig: {
prefix: "DG",
fieldName: "orderNumber",
label: "表单编号",
},
toolbar: {
buttons: defaultToolbarButtons,
},
}

// 默认页面样式
export const defaultPageStyle = `  @page {
    size: A4;
    margin: 20mm;
  }
  @media print {
    html, body {
      height: 100vh;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden;
    }
    .print-content {
      display: block !important;
    }
    .no-print {
      display: none !important;
    }
  }`

// 默认动画配置
export const defaultAnimationConfig = {
initial: { opacity: 0, y: 20 },
animate: { opacity: 1, y: 0 },
exit: { opacity: 0, y: -20 },
transition: {
type: "spring",
stiffness: 100,
damping: 15,
},
}

// 默认验证消息
export const defaultValidationMessages = {
required: "此字段为必填项",
email: "请输入有效的邮箱地址",
url: "请输入有效的URL地址",
tel: "请输入有效的电话号码",
number: "请输入有效的数字",
date: "请输入有效的日期",
}

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/docs/example.md">
                    <FileContent>
                      ```typescript

// 完整的动态表单配置示例
const complexFormConfig = {
metadata: {
title: "采购申请单",
description: "用于提交和审批采购申请",
permissions: {
edit: true,
delete: true,
print: true
}
},
renderConfig: {
// 基础字段配置 - 使用分组
basicFields: {
groups: [
{
key: "basic",
title: "基本信息",
icon: "mdi:information",
description: "申请的基本信息",
fields: [
{
name: "applicant",
label: "申请人",
type: "resource",
required: true,
resourceConfig: {
resourceId: "employees",
displayFields: [
{ key: "name", label: "姓名" },
{ key: "employeeId", label: "工号" },
{ key: "department", label: "部门" }
],
triggerConfig: {
type: "button",
text: "选择申请人",
icon: "mdi:account-search",
className: "custom-trigger"
},
fieldMapping: {
"department": "department",
"position": {
field: "position",
transform: (value) => value.toUpperCase()
},
"contactInfo": {
fields: ["email", "phone"],
transform: (values) => values.join(" / ")
}
}
}
},
{
name: "department",
label: "部门",
type: "text",
disabled: true
},
{
name: "position",
label: "职位",
type: "text",
disabled: true
},
{
name: "contactInfo",
label: "联系方式",
type: "text",
disabled: true
}
]
},
{
key: "request",
title: "申请信息",
icon: "mdi:file-document-edit",
description: "采购申请详细信息",
fields: [
{
name: "requestType",
label: "申请类型",
type: "select",
required: true,
options: [
{ label: "办公用品", value: "office" },
{ label: "IT设备", value: "it" },
{ label: "其他", value: "other" }
]
},
{
name: "urgencyLevel",
label: "紧急程度",
type: "radio",
required: true,
options: [
{ label: "普通", value: "normal" },
{ label: "紧急", value: "urgent" },
{ label: "特急", value: "critical" }
]
},
{
name: "expectedDate",
label: "期望到货日期",
type: "date",
required: true
},
{
name: "budget",
label: "预算金额",
type: "number",
required: true,
validators: [
(value) => {
if (value <= 0) return "预算金额必须大于0"
if (value > 1000000) return "单次申请预算不能超过100万"
}
]
}
]
},
{
key: "attachments",
title: "附件信息",
icon: "mdi:attachment",
description: "上传相关附件",
fields: [
{
name: "quotation",
label: "报价单",
type: "upload",
required: true,
uploadConfig: {
uploadType: "file",
multiple: true,
maxSize: 10 * 1024 * 1024,
maxCount: 3,
uploadConfig: {
customRequest: async (options) => {
// 自定义上传逻辑
}
},
previewConfig: {
modalTitle: "报价单预览",
modalWidth: "80%"
}
}
},
{
name: "specifications",
label: "规格说明书",
type: "upload",
uploadConfig: {
uploadType: "file",
multiple: false,
maxSize: 5 * 1024 * 1024
}
}
]
}
]
},

    // 表格配置
    tables: [
      {
        key: "items",
        title: "采购明细",
        icon: "mdi:table",
        description: "请填写需要采购的物品明细",
        config: {
          columns: [
            {
              key: "product",
              title: "物品",
              type: "resource",
              width: "300px",
              required: true,
              resourceConfig: {
                resourceId: "products",
                displayFields: [
                  { key: "name", label: "名称" },
                  { key: "code", label: "编码" },
                  { key: "specification", label: "规格" }
                ],
                showTrigger: true,
                triggerPosition: "right",
                inlineDisplay: true,
                fieldMapping: {
                  "unitPrice": "price",
                  "unit": "unit",
                  "specification": "specification"
                }
              }
            },
            {
              key: "specification",
              title: "规格",
              type: "text",
              width: "200px",
              editable: false
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              width: "120px",
              required: true,
              validators: [
                (value) => value <= 0 ? "数量必须大于0" : undefined
              ]
            },
            {
              key: "unitPrice",
              title: "单价",
              type: "number",
              width: "120px",
              editable: false
            },
            {
              key: "unit",
              title: "单位",
              type: "text",
              width: "80px",
              editable: false
            },
            {
              key: "amount",
              title: "金额",
              type: "number",
              width: "120px",
              editable: false,
              render: (value, record) => {
                const amount = (record.quantity || 0) * (record.unitPrice || 0)
                return amount.toFixed(2)
              }
            }
          ],
          summary: {
            show: true,
            label: "合计",
            className: "font-bold",
            style: { backgroundColor: "#f9fafb" }
          }
        }
      }
    ],

    // 流程步骤配置
    processSteps: [
      {
        key: "department",
        title: "部门审批",
        icon: "mdi:account-check",
        description: "部门主管审批",
        weight: 1,
        fields: [
          {
            name: "approved",
            label: "审批结果",
            type: "radio",
            required: true,
            options: [
              { label: "同意", value: "approved" },
              { label: "拒绝", value: "rejected" }
            ]
          },
          {
            name: "comments",
            label: "审批意见",
            type: "textarea",
            required: true
          },
          {
            name: "signature",
            label: "签名",
            type: "signature",
            required: true,
            width: 300,
            height: 100
          }
        ]
      },
      {
        key: "finance",
        title: "财务审批",
        icon: "mdi:currency-usd",
        description: "财务部门审批",
        weight: 2,
        dependencies: [
          {
            step: "department",
            condition: {
              field: "approved",
              value: "approved"
            },
            message: "需要先通过部门审批"
          }
        ],
        fields: [
          {
            name: "budgetAccount",
            label: "预算科目",
            type: "select",
            required: true,
            options: [
              { label: "办公费用", value: "office" },
              { label: "设备采购", value: "equipment" },
              { label: "其他支出", value: "other" }
            ]
          },
          {
            name: "approved",
            label: "审批结果",
            type: "radio",
            required: true,
            options: [
              { label: "同意", value: "approved" },
              { label: "拒绝", value: "rejected" }
            ]
          },
          {
            name: "comments",
            label: "审批意见",
            type: "textarea",
            required: true
          }
        ]
      },
      {
        key: "procurement",
        title: "采购确认",
        icon: "mdi:shopping",
        description: "采购部门确认",
        weight: 3,
        dependencies: [
          {
            step: "finance",
            condition: {
              field: "approved",
              value: "approved"
            },
            message: "需要先通过财务审批"
          }
        ],
        fields: [
          {
            name: "supplier",
            label: "供应商",
            type: "resource",
            required: true,
            resourceConfig: {
              resourceId: "suppliers",
              displayFields: [
                { key: "name", label: "供应商名称" },
                { key: "code", label: "供应商代码" },
                { key: "contact", label: "联系人" }
              ]
            }
          },
          {
            name: "estimatedDeliveryDate",
            label: "预计到货日期",
            type: "date",
            required: true
          },
          {
            name: "comments",
            label: "处理意见",
            type: "textarea"
          }
        ]
      }
    ]

},

// 单号配置
orderNumberConfig: {
prefix: "PO",
fieldName: "orderNumber",
label: "采购单号"
},

// 表单验证
validate: async (values, context) => {
const errors = []

    // 检查预算
    const totalAmount = values.tableData?.items?.reduce((sum, item) =>
      sum + (item.quantity || 0) * (item.unitPrice || 0), 0) || 0

    if (totalAmount > values.budget) {
      errors.push("采购总金额不能超过预算金额")
    }

    // 检查期望到货日期
    const expectedDate = new Date(values.expectedDate)
    if (expectedDate < new Date()) {
      errors.push("期望到货日期不能早于今天")
    }

    return {
      valid: errors.length === 0,
      errors,
      fields: {}
    }

},

// 字段联动
watch: (form) => {
const subscription = form.watch((value, { name }) => {
// 监听申请类型变化
if (name === "requestType") {
const budgetField = form.getValues("budget")
if (value === "it" && budgetField > 50000) {
form.setError("budget", {
type: "custom",
message: "IT设备单次采购金额不能超过5万"
})
}
}
})

    return () => subscription.unsubscribe()

}
}

````
                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/docs/guide.md">
                    <FileContent>
                      # 动态表单配置指南

## 类型定义

### 基础类型
```typescript
// 表单字段类型
type FieldType =
  | "text"      // 文本输入
  | "password"  // 密码输入
  | "number"    // 数字输入
  | "email"     // 邮箱输入
  | "tel"       // 电话输入
  | "url"       // URL输入
  | "textarea"  // 多行文本
  | "select"    // 下拉选择
  | "date"      // 日期选择
  | "datetime"  // 日期时间
  | "radio"     // 单选框
  | "checkbox"  // 复选框
  | "switch"    // 开关
  | "slider"    // 滑块
  | "upload"    // 文件上传
  | "resource"  // 资源选择
  | "signature" // 签名
  | "custom"    // 自定义组件

// 表单配置
interface FormConfig {
  // 元数据
  metadata: {
    title: string
    description?: string
    permissions?: {
      edit?: boolean
      delete?: boolean
      print?: boolean
    }
  }
  // 渲染配置
  renderConfig: {
    // 基础字段
    basicFields: FormField[] | {
      groups: FormFieldGroup[]
      defaultGroup?: string
    }
    // 表格配置
    table?: TableConfig
    // 多表格配置
    tables?: TableGroup[]
    // 流程步骤
    processSteps?: ProcessStep[]
  }
  // 单号配置
  orderNumberConfig?: {
    prefix?: string
    fieldName?: string
    label?: string
  }
}
````

## 配置示例

### 1. 基础表单

```typescript
const basicFormConfig = {
  metadata: {
    title: "用户信息表单",
    description: "用于收集用户基本信息",
  },
  renderConfig: {
    basicFields: [
      {
        name: "name",
        label: "姓名",
        type: "text",
        required: true,
        placeholder: "请输入姓名",
      },
      {
        name: "age",
        label: "年龄",
        type: "number",
        min: 0,
        max: 150,
      },
      {
        name: "gender",
        label: "性别",
        type: "select",
        options: [
          { label: "男", value: "male" },
          { label: "女", value: "female" },
        ],
      },
      {
        name: "birthday",
        label: "出生日期",
        type: "date",
      },
      {
        name: "email",
        label: "邮箱",
        type: "email",
        validators: [
          (value) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return "请输入有效的邮箱地址"
            }
          },
        ],
      },
    ],
  },
}
```

### 2. 分组表单

```typescript
const groupFormConfig = {
  metadata: {
    title: "员工信息表",
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          icon: "mdi:account",
          fields: [
            {
              name: "name",
              label: "姓名",
              type: "text",
              required: true,
            },
            {
              name: "employeeId",
              label: "工号",
              type: "text",
              required: true,
            },
          ],
        },
        {
          key: "contact",
          title: "联系方式",
          icon: "mdi:phone",
          fields: [
            {
              name: "phone",
              label: "电话",
              type: "tel",
              required: true,
            },
            {
              name: "email",
              label: "邮箱",
              type: "email",
            },
            {
              name: "address",
              label: "地址",
              type: "textarea",
            },
          ],
        },
      ],
    },
  },
}
```

### 3. 表格表单

```typescript
const tableFormConfig = {
  metadata: {
    title: "订单表单",
  },
  renderConfig: {
    basicFields: [
      {
        name: "orderNo",
        label: "订单编号",
        type: "text",
        required: true,
      },
      {
        name: "customerName",
        label: "客户名称",
        type: "text",
        required: true,
      },
    ],
    table: {
      columns: [
        {
          key: "product",
          title: "商品",
          type: "resource",
          width: "300px",
          resourceConfig: {
            resourceId: "products",
            displayField: "name",
            fieldMapping: {
              price: "price",
              unit: "unit",
            },
          },
        },
        {
          key: "quantity",
          title: "数量",
          type: "number",
          width: "120px",
        },
        {
          key: "price",
          title: "单价",
          type: "number",
          width: "120px",
        },
        {
          key: "amount",
          title: "金额",
          type: "number",
          width: "120px",
          editable: false,
        },
      ],
      summary: {
        show: true,
        label: "合计",
      },
    },
  },
}
```

### 4. 流程表单

```typescript
const processFormConfig = {
  metadata: {
    title: "请假申请",
  },
  renderConfig: {
    basicFields: [
      {
        name: "employeeName",
        label: "申请人",
        type: "text",
        required: true,
      },
      {
        name: "department",
        label: "部门",
        type: "text",
        required: true,
      },
    ],
    processSteps: [
      {
        key: "apply",
        title: "申请信息",
        icon: "mdi:file-document-edit",
        fields: [
          {
            name: "leaveType",
            label: "请假类型",
            type: "select",
            required: true,
            options: [
              { label: "事假", value: "personal" },
              { label: "病假", value: "sick" },
              { label: "年假", value: "annual" },
            ],
          },
          {
            name: "startDate",
            label: "开始日期",
            type: "date",
            required: true,
          },
          {
            name: "endDate",
            label: "结束日期",
            type: "date",
            required: true,
          },
          {
            name: "reason",
            label: "请假原因",
            type: "textarea",
            required: true,
          },
        ],
      },
      {
        key: "supervisor",
        title: "主管审批",
        icon: "mdi:account-check",
        description: "需要主管审批通过",
        fields: [
          {
            name: "approved",
            label: "审批结果",
            type: "radio",
            options: [
              { label: "同意", value: "approved" },
              { label: "拒绝", value: "rejected" },
            ],
          },
          {
            name: "comment",
            label: "审批意见",
            type: "textarea",
          },
        ],
      },
      {
        key: "hr",
        title: "人事确认",
        icon: "mdi:account-check",
        description: "人事部门最终确认",
        fields: [
          {
            name: "confirmed",
            label: "确认结果",
            type: "radio",
            options: [
              { label: "确认", value: "confirmed" },
              { label: "退回", value: "returned" },
            ],
          },
          {
            name: "hrComment",
            label: "确认意见",
            type: "textarea",
          },
        ],
      },
    ],
  },
}
```

## 特殊功能配置

### 1. 字段联动

```typescript
{
  watch: (form) => {
    // 监听字段变化
    const subscription = form.watch((value, { name }) => {
      if (name === "productId") {
        // 更新其他字段
        form.setValue("price", value.price)
      }
    })

    // 返回清理函数
    return () => subscription.unsubscribe()
  }
}
```

### 2. 自定义验证

```typescript
{
  validators: [
    async (value) => {
      // 异步验证
      const exists = await checkExists(value)
      if (exists) {
        return "该值已存在"
      }
    },
    (value, allValues) => {
      // 关联字段验证
      if (value < allValues.minValue) {
        return "不能小于最小值"
      }
    },
  ]
}
```

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/docs/index.ts">
                    <FileContent>
                      import { markdown as guidemd } from "./guide.md"

import { markdown as examplemd } from "./example.md"
import { markdown as resourceMappingmd } from "./resource-mapping.md"

export const guide = `${guidemd}
${resourceMappingmd}`
export const example = `${examplemd}`

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/docs/resource-mapping.md">
                    <FileContent>
                      # 资源字段自动填充指南

## 概述

资源字段是动态表单中的一个重要特性，它允许用户从预定义的资源中选择数据，并可以通过配置自动填充其他相关字段。本指南将详细介绍资源字段的自动填充功能及其配置方法。

## 配置说明

### fieldMapping 配置

fieldMapping 是实现自动填充的核心配置，它定义了如何将选中资源的字段映射到表单的其他字段。

```typescript
interface ResourceConfig {
  resourceId: string
  // ... 其他配置
  fieldMapping?: {
    [targetField: string]:
      | string // 简单映射
      | {
          // 复杂映射
          field: string
          fields?: string[]
          condition?: (resource: any) => boolean
          transform?: (value: any) => any
        }
  }
}
```

### 映射类型

#### 1. 简单映射

直接指定源字段到目标字段的映射关系。

```typescript
{
  resourceConfig: {
    resourceId: "products",
    fieldMapping: {
      "price": "productPrice",     // price 字段将被映射到 productPrice
      "stock": "inventoryCount"    // stock 字段将被映射到 inventoryCount
    }
  }
}
```

#### 2. 带转换的映射

在映射过程中对数据进行转换。

```typescript
{
  resourceConfig: {
    resourceId: "products",
    fieldMapping: {
      "price": {
        field: "productPrice",
        transform: (value) => Number(value).toFixed(2)  // 转换为两位小数
      }
    }
  }
}
```

#### 3. 条件映射

根据条件决定是否进行映射。

```typescript
{
  resourceConfig: {
    resourceId: "products",
    fieldMapping: {
      "discount": {
        field: "price",
        condition: (resource) => resource.canDiscount,  // 只有满足条件才映射
        transform: (value) => value * 0.9              // 计算折扣价
      }
    }
  }
}
```

#### 4. 多字段组合映射

将多个字段组合成一个值。

```typescript
{
  resourceConfig: {
    resourceId: "products",
    fieldMapping: {
      "displayName": {
        fields: ["code", "name"],
        transform: (values) => values.join(' - ')  // 组合多个字段
      }
    }
  }
}
```

## 工作原理

### 自动填充流程

1. 用户选择资源后，系统会：

   - 根据 fieldMapping 配置自动填充相关字段
   - 被映射的字段会自动变为只读状态
   - 在字段右侧显示链接图标，表示该字段是自动填充的

2. 映射过程：
   - 系统获取选中的资源数据
   - 遍历 fieldMapping 配置
   - 执行字段映射和数据转换
   - 更新表单数据

## 使用示例

### 销售订单示例

```typescript
{
  columns: [
    {
      key: "product",
      title: "产品",
      type: "resource",
      resourceConfig: {
        resourceId: "products",
        displayFields: [
          { key: "name", label: "产品名称" },
          { key: "code", label: "产品编码" },
        ],
        fieldMapping: {
          // 简单映射
          unitPrice: "price",

          // 带转换的映射
          specification: {
            field: "specs",
            transform: (value) => value.toUpperCase(),
          },

          // 多字段组合
          description: {
            fields: ["name", "specs"],
            transform: (values) => values.join(" - "),
          },
        },
      },
    },
    {
      key: "unitPrice",
      title: "单价",
      type: "number",
      width: "120px",
    },
  ]
}
```

### 采购订单示例

```typescript
{
  columns: [
    {
      key: "material",
      title: "原材料",
      type: "resource",
      resourceConfig: {
        resourceId: "materials",
        displayFields: [
          { key: "name", label: "材料名称" },
          { key: "specification", label: "规格" },
        ],
        fieldMapping: {
          unitPrice: {
            field: "price",
            transform: (value) => Number(value).toFixed(2),
          },
          unit: "measureUnit",
          specification: {
            fields: ["specification", "standard"],
            transform: (values) => values.filter(Boolean).join(" / "),
          },
        },
      },
    },
  ]
}
```

## 最佳实践

### 1. 字段命名

- 使用清晰、语义化的字段名称
- 保持源字段和目标字段的命名一致性
- 避免使用特殊字符和空格

### 2. 数据转换

- 在 transform 函数中处理数据类型转换
- 添加适当的数据验证和错误处理
- 处理空值和异常情况

### 3. 性能优化

- 避免过于复杂的转换逻辑
- 合理使用条件映射
- 缓存频繁使用的计算结果

### 4. 用户体验

- 为自动填充的字段添加清晰的提示
- 确保字段值的可读性
- 提供适当的错误反馈

## 注意事项

1. 被映射的字段会自动变为只读状态
2. 源字段值为空时，目标字段也会被清空
3. 条件映射失败时不会更新目标字段
4. transform 函数应该是纯函数，避免副作用
5. 避免循环映射，可能导致死循环

## 常见问题解答

### Q1: 如何处理字段值为 null 或 undefined 的情况？

建议在 transform 函数中添加适当的默认值处理：

```typescript
{
  transform: (value) => value ?? "-" // 使用空值合并运算符
}
```

### Q2: 如何在映射时进行数据验证？

可以在 condition 中添加验证逻辑：

```typescript
{
  condition: (resource) => {
    if (!resource.price || resource.price < 0) {
      return false // 验证失败，不进行映射
    }
    return true
  }
}
```

### Q3: 如何处理异步转换？

目前不支持异步转换，建议在选择资源前预处理数据。

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/hooks/useDynamicForm.tsx">
                    <FileContent>
                      import { useEffect, useCallback } from "react"

import { useForm } from "react-hook-form"
import { DynamicFormConfig, ValidationResult } from "../types"
import { ValidationManager } from "../validation/ValidationManager"
import { debounce } from "lodash"

// 创建带防抖的 watch
export const createDebouncedWatch = (form: UseFormReturn<any>, delay = 300) => {
return (fields: string | string[], callback: (values: any) => void) => {
const debouncedCallback = debounce(callback, delay)

    const subscription = form.watch((value, { name }) => {
      if (Array.isArray(fields)) {
        if (fields.includes(name)) {
          debouncedCallback(value)
        }
      } else if (fields === name) {
        debouncedCallback(value)
      }
    })

    return subscription

}
}

// 格式化验证错误信息
const formatValidationErrors = (errors: Record<string, any>): string[] => {
return Object.entries(errors).map(([field, error]) => {
const errorMessage = error.message || error
return `${field}：${errorMessage}`
})
}

export const useDynamicForm = (
config: DynamicFormConfig,
initialValues?: any,
onValuesChange?: (changedValues: any, allValues: any) => void
) => {
const form = useForm({
defaultValues: initialValues || {},
})

// 设置 watch 函数
useEffect(() => {
if (!config.watch) {
console.log("[useDynamicForm] No watch function provided")
return
}

    console.log("[useDynamicForm] Setting up watch function")
    let unsubscribe: (() => void) | undefined

    try {
      unsubscribe = config.watch(form)
      console.log("[useDynamicForm] After setting up watch, unsubscribe:", unsubscribe)

      if (typeof unsubscribe !== "function") {
        console.warn("[useDynamicForm] Watch function should return an unsubscribe function")
      }
    } catch (error) {
      console.error("[useDynamicForm] Error in watch setup:", error)
    }

    return () => {
      console.log("[useDynamicForm] Cleaning up watch subscriptions")
      if (typeof unsubscribe === "function") {
        try {
          unsubscribe()
          console.log("[useDynamicForm] Successfully unsubscribed watch")
        } catch (error) {
          console.error("[useDynamicForm] Error unsubscribing watch:", error)
        }
      }
    }

}, [config.watch, form])

// 监听表单值变化
useEffect(() => {
console.log("[useDynamicForm] Setting up form value change listener")
const subscription = form.watch((value, { name, type }) => {
console.log("[useDynamicForm] Form value changed:", { field: name, type, value })
console.log("[useDynamicForm] Current form values:", form.getValues())

      // 触发表单重新渲染
      form.trigger(name)
    })

    return () => subscription.unsubscribe()

}, [form])

// 统一的验证函数
const validateForm = useCallback(async (): Promise<ValidationResult> => {
try {
const values = form.getValues()
// 直接使用ValidationManager进行统一校验
return await ValidationManager.validateForm(values, config)
} catch (error) {
console.error("[useDynamicForm] Validation error:", error)
return {
valid: false,
errors: ["表单校验出错"],
fields: {},
}
}
}, [config, form])

// 统一的提交处理函数
const submitForm = useCallback(
async (
values: any,
options?: {
onSuccess?: () => void
onError?: (error: Error) => void
}
) => {
try {
// 验证
const validationResult = await validateForm()
if (!validationResult.valid) {
// 设置字段错误
if (validationResult.fields) {
Object.entries(validationResult.fields).forEach(([field, error]) => {
form.setError(field, { type: "custom", message: error })
})
}
return { success: false, validationResult }
}

        return { success: true, validationResult, values }
      } catch (error) {
        console.error("[useDynamicForm] Submit error:", error)
        options?.onError?.(error as Error)
        return { success: false, error }
      }
    },
    [form, validateForm]

)

return {
form,
validateForm,
submitForm,
}
}

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/index.tsx">
                    <FileContent>
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
color='primary'
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

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/styles/DynamicForm.module.css">
                    <FileContent>
                      /* DynamicForm 专用样式 */

.dynamic-form {
/_ 主题色系 - 采用蓝色主题 _/
--df-primary-50: #ebf5ff;
--df-primary-100: #e1effe;
--df-primary-200: #c3ddfd;
--df-primary-300: #a4cafe;
--df-primary-400: #76a9fa;
--df-primary-500: #3f83f8;
--df-primary-600: #1c64f2;
--df-primary-700: #1a56db;

/_ 功能色系 _/
--df-success-50: #f0fdf4;
--df-success-500: #22c55e;
--df-success-700: #15803d;

--df-warning-50: #fefce8;
--df-warning-500: #eab308;
--df-warning-700: #a16207;

--df-error-50: #fef2f2;
--df-error-500: #ef4444;
--df-error-700: #b91c1c;

/_ 中性色系 - 更柔和的灰度 _/
--df-gray-50: #f9fafb;
--df-gray-100: #f3f4f6;
--df-gray-200: #e5e7eb;
--df-gray-300: #d1d5db;
--df-gray-400: #9ca3af;
--df-gray-500: #6b7280;
--df-gray-600: #4b5563;
--df-gray-700: #374151;
--df-gray-900: #111827;
color: var(--df-gray-900);
}

/_ 新增: Tabs滚动样式 _/
.tabs-scroll-container {
position: relative;
width: 100%;
overflow: hidden;
}

.tabs-list-scroll {
overflow-x: auto;
scrollbar-width: none; /_ Firefox _/
-ms-overflow-style: none; /_ IE and Edge _/
white-space: nowrap;
flex-wrap: nowrap;
padding-bottom: 2px;
-webkit-overflow-scrolling: touch; /_ 支持iOS滑动 _/
}

.tabs-list-scroll::-webkit-scrollbar {
display: none; /_ Chrome, Safari, Opera _/
}

.tabs-scroll-shadow {
position: relative;
}

.tabs-scroll-shadow::after {
content: '';
position: absolute;
top: 0;
right: 0;
bottom: 0;
width: 30px;
background: linear-gradient(to right, transparent, white);
pointer-events: none;
opacity: 0;
transition: opacity 0.2s;
}

.tabs-scroll-shadow.has-scroll::after {
opacity: 1;
}

/_ 原有样式保持不变 _/
.form-card {
background-color: white;
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
padding: 1rem;
margin-bottom: 1.5rem;
transition: all 0.2s ease-in-out;
}

.form-card:hover {
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.form-title {
color: var(--df-gray-900);
font-size: 1.25rem;
font-weight: 600;
margin-bottom: 1rem;
padding-bottom: 0.5rem;
border-bottom: 2px solid var(--df-primary-100);
}

.form-field {
margin-bottom: 1.5rem;
}

.field-label {
color: var(--df-gray-700);
font-weight: 500;
margin-bottom: 0.5rem;
font-size: 0.875rem;
}

.field-input {
width: 100%;
padding: 0.75rem 1rem;
border: 1px solid var(--df-gray-200);
border-radius: 0.75rem;
transition: all 0.2s ease-in-out;
font-size: 0.875rem;
background-color: white;
}

.field-input:focus {
border-color: var(--df-primary-400);
box-shadow: 0 0 0 3px var(--df-primary-100);
outline: none;
}

.button {
padding: 0.75rem 1.5rem;
border-radius: 0.75rem;
font-weight: 500;
font-size: 0.875rem;
transition: all 0.2s ease-in-out;
display: inline-flex;
align-items: center;
justify-content: center;
gap: 0.5rem;
}

.button-primary {
background-color: var(--df-primary-600);
color: white;
border: none;
}

.status-tag {
display: inline-flex;
align-items: center;
padding: 0.375rem 0.75rem;
border-radius: 0.75rem;
font-size: 0.75rem;
font-weight: 500;
gap: 0.25rem;
}

.status-success {
background-color: var(--df-success-50);
color: var(--df-success-700);
}

.status-warning {
background-color: var(--df-warning-50);
color: var(--df-warning-700);
}

.status-error {
background-color: var(--df-error-50);
color: var(--df-error-700);
}

.table {
width: 100%;
border-collapse: separate;
border-spacing: 0;
margin: 1rem 0;
}

.table th {
background-color: var(--df-gray-50);
color: var(--df-gray-600);
font-weight: 500;
text-align: left;
padding: 0.75rem 1rem;
font-size: 0.875rem;
border-bottom: 1px solid var(--df-gray-200);
}

.table td {
padding: 1rem;
border-bottom: 1px solid var(--df-gray-100);
font-size: 0.875rem;
}

.table tr:hover {
background-color: var(--df-gray-50);
}

.calculated-field {
background-color: var(--df-primary-50) !important;
border-color: var(--df-primary-200) !important;
cursor: not-allowed !important;
}

.calculated-field:hover {
background-color: var(--df-primary-100) !important;
}

.calculated-field-icon {
color: var(--df-primary-500);
opacity: 0.5;
transition: opacity 0.2s;
}

.calculated-field-icon:hover {
opacity: 1;
}

.table-legend {
display: flex;
align-items: center;
gap: 1rem;
margin-bottom: 1rem;
font-size: 0.875rem;
color: var(--df-gray-500);
}

.legend-item {
display: flex;
align-items: center;
gap: 0.5rem;
}

.legend-color {
width: 1rem;
height: 1rem;
border-radius: 0.25rem;
border: 1px solid;
}

.legend-color-calculated {
background-color: var(--df-primary-50);
border-color: var(--df-primary-200);
}

.legend-color-disabled {
background-color: var(--df-gray-50);
border-color: var(--df-gray-200);
}

.process-step {
border: 1px solid var(--df-gray-200);
border-radius: 0.75rem;
padding: 1rem;
margin-bottom: 1rem;
transition: all 0.2s ease-in-out;
background-color: white;
}

.process-step.active {
border-color: var(--df-primary-400);
background-color: var(--df-primary-50);
}

.step-icon {
width: 2rem;
height: 2rem;
border-radius: 0.5rem;
display: flex;
align-items: center;
justify-content: center;
background-color: var(--df-gray-100);
color: var(--df-gray-400);
}

.step-icon.completed {
background-color: var(--df-primary-50);
color: var(--df-primary-600);
}

.info-box {
background-color: var(--df-primary-50);
border: 1px solid var(--df-primary-200);
border-radius: 0.75rem;
padding: 1rem;
margin: 1rem 0;
display: flex;
align-items: flex-start;
gap: 0.75rem;
font-size: 0.875rem;
color: var(--df-primary-700);
}

.input-group {
display: flex;
align-items: center;
gap: 0.5rem;
margin-bottom: 1rem;
}

.input-group .field-input {
flex: 1;
}

.select {
appearance: none;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
background-position: right 0.75rem center;
background-repeat: no-repeat;
background-size: 1rem;
padding-right: 2.5rem;
}

@media print {
.dynamic-form {
background-color: white;
}

.form-card {
box-shadow: none;
border: 1px solid var(--df-gray-300);
break-inside: avoid;
}

.process-step {
break-inside: avoid;
}

.table {
break-inside: auto;
}

.table tr {
break-inside: avoid;
}
}

.paper-form {
background: white;
border: 1px solid #000;
padding: 2rem;
box-shadow: none !important;
border-radius: 0;
}

.paper-form:hover {
box-shadow: none !important;
}

.paper-table {
border-collapse: collapse !important;
border-spacing: 0;
width: 100%;
border: 1px solid #000;
}

.paper-table th,
.paper-table td {
border: 1px solid #000 !important;
padding: 0.75rem;
background: transparent !important;
}

.paper-table tr:hover {
background: transparent !important;
}

.paper-input {
border: 1px solid #000 !important;
background: transparent !important;
border-radius: 0 !important;
box-shadow: none !important;
}

.paper-input:focus {
border-color: #000 !important;
box-shadow: none !important;
}

.paper-section {
border: 1px solid #000;
padding: 1rem;
margin-bottom: 1rem;
border-radius: 0;
background: transparent;
}

.paper-title {
border-bottom: 2px solid #000;
color: #000;
font-weight: bold;
text-align: center;
padding-bottom: 0.5rem;
}

.paper-button {
border: 1px solid #000;
background: transparent;
color: #000;
border-radius: 0;
}

.paper-button:hover {
background: rgba(0, 0, 0, 0.05);
}

.paper-step {
border: 1px solid #000;
border-radius: 0;
background: transparent;
}

.paper-step.active {
background: rgba(0, 0, 0, 0.05);
}

@media print {
.paper-form,
.paper-table,
.paper-section,
.paper-step {
border-color: #000 !important;
-webkit-print-color-adjust: exact;
print-color-adjust: exact;
}
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/types/basic.ts">
                    <FileContent>
                      import { ReactNode } from "react"

/\*\*

- 表单字段类型定义
- @description 定义了DynamicForm支持的所有字段类型
-
- 基础输入类型:
- - text: 单行文本输入
- - password: 密码输入,自动隐藏内容
- - number: 数字输入,支持整数和小数
- - email: 邮箱输入,自带邮箱格式验证
- - tel: 电话号码输入
- - url: URL地址输入
-
- 扩展输入类型:
- - textarea: 多行文本输入,适用于长文本
- - select: 下拉选择框
- - date: 日期选择
- - datetime: 日期时间选择
-
- 特殊输入类型:
- - file: (已废弃)文件上传,请使用upload类型
- - image: (已废弃)图片上传,请使用upload类型
- - upload: 统一的上传组件,支持文件、图片等
- - signature: 手写签名
- - custom: 自定义组件
-
- 选择类型:
- - radio: 单选框组
- - checkbox: 复选框组
- - switch: 开关
- - slider: 滑块
-
- 资源类型:
- - resource: 资源选择器,用于选择主数据
-
- 使用建议:
- 1.  文本输入优先使用text类型
- 2.  数值输入使用number类型,并配置min/max限制
- 3.  日期选择使用date/datetime类型
- 4.  文件上传统一使用upload类型,配置uploadType
- 5.  选项选择使用select/radio/checkbox
- 6.  开关量使用switch类型
- 7.  资源选择使用resource类型
- 8.  需要自定义渲染时使用custom类型
      \*/
      export type FormFieldType =
      | "text"
      | "password"
      | "number"
      | "email"
      | "tel"
      | "url"
      | "textarea"
      | "select"
      | "date"
      | "datetime"
      | "file"
      | "image"
      | "custom"
      | "resource"
      | "signature"
      | "radio"
      | "checkbox"
      | "switch"
      | "slider"
      | "upload"

/\*\*

- 手动输入字段类型
- @description 需要用户手动输入的字段类型
  \*/
  export type ManualInputFieldType = "text" | "number" | "email" | "tel" | "textarea" | "select" | "date" | "datetime"

export interface TooltipConfig {
content: ReactNode
placement?: "top" | "bottom" | "left" | "right"
}

export interface FormMetadata {
title: string
description?: string
permissions?: {
edit?: boolean
delete?: boolean
print?: boolean
}
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/types/field.ts">
                    <FileContent>
                      import { ReactNode } from "react"

import { UseFormReturn } from "react-hook-form"
import { FormFieldType, ManualInputFieldType, TooltipConfig } from "./basic"

// 资料字段显示配置
interface ResourceDisplayField {
key: string // 字段键名
label: string // 显示标签
width?: string | number // 表格模式下的列宽
render?: (value: any) => React.ReactNode // 自定义渲染函数
}

// 触发器配置
interface ResourceTriggerConfig {
type: "button" | "icon"
text?: string
icon?: string
className?: string
style?: React.CSSProperties
}

// 资料配置
export interface ResourceConfig {
resourceTitle?: string // 资料标题（可选）
resourceId: string // 资料id
multiple?: boolean // 是否支持多选
displayMode?: "card" // 显示模式,默认 card
displayFields?: ResourceDisplayField[] // 显示字段配置,不配置则显示所有字段
// 新增：主显示字段
displayField?: string
// 新增：显示格式化函数
displayFormat?: (resource: any) => string
// 新增：触发器配置
triggerConfig?: ResourceTriggerConfig
loadDataById?: (dataid: string | string[]) => Promise<any> // 加载数据的方法（已废弃）
fieldMapping?: {
[targetField: string]:
| string
| {
field: string
fields?: string[]
condition?: (resource: any) => boolean
transform?: (value: any) => any
}
}
}

// 资料字段值类型
export interface ResourceValue {
dataid: string | string[] // 单个或多个dataid
displayValue?: string // 新增：显示值
}

export interface FileInfo {
fileId: string
fileName: string
fileKey: string
downloadUrl?: string
type?: string
size?: number
}

export interface FormField {
name: string
label: string
type: FormFieldType
placeholder?: string
disabled?: boolean
hidden?: boolean
required?: boolean
tooltip?: TooltipConfig
validators?: Array<(value: any, allValues?: any) => string | undefined>
options?:
| Array<{
label: string
value: string | number
disabled?: boolean
}>
| ((form: UseFormReturn<any>) => Array<{
label: string
value: string | number
disabled?: boolean
}>)
accept?: string
resourceConfig?: ResourceConfig
onUpload?: (file: File) => Promise<void>
render?: (props: { field: any; form: UseFormReturn<any>; isEditable: boolean }) => ReactNode
width?: number | string
height?: number
lineWidth?: number
lineColor?: string
className?: string
checkedLabel?: string
uncheckedLabel?: string
min?: number
max?: number
step?: number
layout?: "horizontal" | "vertical"
path?: string
style?: React.CSSProperties
uploadConfig?: {
uploadType: "file" | "image" | "video" | "audio"
multiple?: boolean
maxSize?: number
maxCount?: number
thumbnail?: boolean
cropOptions?: {
aspect?: number
quality?: number
width?: number
height?: number
}
uploadConfig?: {
action?: string
headers?: Record<string, string>
withCredentials?: boolean
customRequest?: (options: any) => Promise<any>
}
onSuccess?: (fileInfo: FileInfo) => void
onError?: (error: Error) => void
onProgress?: (percent: number) => void
onPreview?: (file: FileInfo) => void
onDownload?: (file: FileInfo) => void
previewConfig?: {
width?: number | string
height?: number | string
modalTitle?: string
modalWidth?: number | string
}
downloadConfig?: {
method?: "GET" | "POST"
headers?: Record<string, string>
withCredentials?: boolean
timeout?: number
}
}
}

export interface FormFieldGroup {
key: string
title: string
fields: FormField[]
description?: string
icon?: string
className?: string
style?: React.CSSProperties
}

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/types/form.ts">
                    <FileContent>
                      import { UseFormReturn } from "react-hook-form"

import { FormField, FormFieldGroup } from "./field"
import { TableConfig, TableGroup } from "./table"
import { ProcessStep } from "./process"
import { FormMetadata } from "./basic"
import { ValidationContext, ValidationResult, ValidationRule, FormEventHandlers } from "./validation"

export interface FormRenderConfig {
basicFields:
| FormField[]
| {
groups: FormFieldGroup[]
defaultGroup?: string
}
table?: TableConfig
tables?: TableGroup[]
processSteps?: ProcessStep[]
}

export interface DynamicFormConfig {
metadata: FormMetadata
renderConfig: FormRenderConfig
orderNumberConfig?: {
prefix?: string
fieldName?: string
label?: string
}
watch?: (form: UseFormReturn<any>) => () => void
validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult
validationRules?: Record<string, ValidationRule>
eventHandlers?: FormEventHandlers
}

export interface DynamicFormProps {
config: DynamicFormConfig
id?: string
onSubmit?: (validationResult: ValidationResult, values: any) => Promise<void>
onCancel?: () => void
templateId?: string
isCreateMode?: boolean
previewMode?: boolean
}

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/types/index.ts">
                    <FileContent>
                      export * from "./basic"

export _ from "./field"
export _ from "./table"
export _ from "./process"
export _ from "./validation"
export \* from "./form"

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/types/process.ts">
                    <FileContent>
                      import { FormField } from "./field"

export interface ProcessStepDependency {
step: string
condition?: {
field?: string
value?: any
custom?: (stepData: any) => boolean
}
message?: string
}

export interface ProcessStepTimeout {
duration: number
action: "warn" | "block" | "auto-approve" | "auto-reject"
message?: string
callback?: (step: string) => void
}

export interface ProcessStepApprovers {
type: "single" | "multiple" | "any" | "all"
roles?: string[]
users?: string[]
minApprovers?: number
maxApprovers?: number
deadline?: number
notifyType?: "email" | "sms" | "both"
escalation?: {
after: number
to: string[]
}
}

export interface ProcessStep {
key: string
title: string
description?: string
icon?: string
fields?: FormField[]
dependencies?: ProcessStepDependency[]
weight?: number
timeout?: ProcessStepTimeout
approvers?: ProcessStepApprovers
className?: string
style?: React.CSSProperties
}

export interface ProcessStepStatus {
isCompleted: boolean
isBlocked: boolean
blockReason?: string
}

export interface ProcessProgress {
total: number
completed: number
current: number
percentage: number
status: {
[key: string]: ProcessStepStatus
}
}
</FileContent>
</File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/types/table.ts">
                    <FileContent>
                      import { ReactNode } from "react"

import { FormFieldType } from "./basic"
import { ResourceConfig } from "./field"

export interface TableColumn {
key: string
title: string
type: FormFieldType
width?: string | number
editable?: boolean
required?: boolean
placeholder?: string
options?: Array<{
label: string
value: string | number
}>
resourceConfig?: ResourceConfig & {
// 新增：表格特定的资源配置
showTrigger?: boolean // 是否显示触发按钮
triggerPosition?: "right" | "cell" // 触发按钮位置
inlineDisplay?: boolean // 是否内联显示选择界面
}
render?: (value: any, record: any, index: number) => ReactNode
summary?: {
render?: (value: any) => ReactNode
}
className?: string
style?: React.CSSProperties
isMappedField?: boolean
mappedFrom?: string
}

export interface TableSummary {
show?: boolean
label?: string
className?: string
style?: React.CSSProperties
}

export interface TableConfig {
columns: TableColumn[]
toolbar?: ReactNode
summary?: TableSummary
}

export interface TableGroup {
key: string
title: string
description?: string
icon?: string
config: TableConfig
className?: string
style?: React.CSSProperties
}

                    </FileContent>
                  </File>

                  <File path="/Users/jalam/Works/mo-repo/shata-ai-front/src/components/common/DynamicForm/types/validation.ts">
                    <FileContent>
                      export interface ValidationContext {

mode?: "create" | "edit"
user?: any
}

export interface ValidationResult {
valid: boolean
errors?: string[]
warnings?: string[]
fields?: {
[key: string]: string
}
categorizedErrors?: {
required?: Array<{ field: string; message: string }>
invalid?: Array<{ field: string; message: string }>
other?: Array<{ field: string; message: string }>
}
}

export interface ValidationRule {
required?: boolean
pattern?: RegExp
min?: number
max?: number
minLength?: number
maxLength?: number
validate?: (value: any) => string | undefined
message?: string
}

export interface FormState {
isSubmitting: boolean
isDirty: boolean
isValid: boolean
errors: Record<string, string>
}

export interface FormEventHandlers {
onSubmit?: (validationResult: ValidationResult, values: any) => Promise<void>
onChange?: (values: any) => void
onError?: (error: Error) => void
onCancel?: () => void
}
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

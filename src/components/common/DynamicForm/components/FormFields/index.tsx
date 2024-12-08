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

    // 文件上传
    if (field.type === "file" || field.type === "image" || field.type === "upload") {
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
          )}
        >
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}

export default DynamicFormFields
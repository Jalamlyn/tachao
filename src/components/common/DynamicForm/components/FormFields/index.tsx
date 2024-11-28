import React from "react"
import { UseFormReturn } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { FormField as DynamicFormField } from "../../types"
import FormFieldWrapper from "./FormFieldWrapper"
import BasicInput from "./BasicInput"
import DateInput from "./DateInput"
import { cn } from "@/theme/cn"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import message from "@/components/Message"
import SignaturePad from "@/components/common/SignaturePad"
import ResourceFieldGroup from "@/components/common/ResourceFieldGroup"
import { Checkbox, CheckboxGroup, Radio, RadioGroup, Slider, Switch } from "@nextui-org/react"

[原有代码保持不变直到 renderField 函数]

const renderField = (field: DynamicFormField) => {
    if (field.hidden) return null

    // 基础输入类型映射
    const basicInputTypes = ["text", "password", "email", "tel", "url"]
    if (basicInputTypes.includes(field.type)) {
      return (
        <div className={cn("form-field-container")}>
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
                  }
                }} 
              />
            )}
          </FormFieldWrapper>
        </div>
      )
    }

    switch (field.type) {
      // [原有 case 保持不变]

      case "radio":
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
                value={formField.value}
                onValueChange={(value) => {
                  formField.onChange(value)
                  onChange?.(field.name, value)
                }}
                orientation={field.layout || "horizontal"}
                isDisabled={!isEditable || field.disabled}
              >
                {field.options?.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </RadioGroup>
            )}
          </FormFieldWrapper>
        )

      case "checkbox":
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
                value={formField.value || []}
                onValueChange={(value) => {
                  formField.onChange(value)
                  onChange?.(field.name, value)
                }}
                orientation={field.layout || "horizontal"}
                isDisabled={!isEditable || field.disabled}
              >
                {field.options?.map((option) => (
                  <Checkbox key={option.value} value={option.value}>
                    {option.label}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            )}
          </FormFieldWrapper>
        )

      case "switch":
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
              <Switch
                isSelected={formField.value}
                onValueChange={(checked) => {
                  formField.onChange(checked)
                  onChange?.(field.name, checked)
                }}
                isDisabled={!isEditable || field.disabled}
                size="sm"
              >
                {formField.value ? field.checkedLabel : field.uncheckedLabel}
              </Switch>
            )}
          </FormFieldWrapper>
        )

      case "slider":
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
                className="max-w-md"
                size="sm"
              />
            )}
          </FormFieldWrapper>
        )

      // [其余原有代码保持不变]
    }
  }

[其余代码保持不变...]
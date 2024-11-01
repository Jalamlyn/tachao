import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import ResourceSelectButton from "../../ResourceSelectButton"
import { FormField as DynamicFormField } from "../types"

interface DynamicFormFieldsProps {
  fields: DynamicFormField[]
  form: UseFormReturn<any>
  isEditable?: boolean
}

const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({ fields, form, isEditable = true }) => {
  const renderField = (field: DynamicFormField) => {
    if (field.hidden) return null

    const fieldVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }

    const renderBasicInput = (type: string) => (
      <FormField
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              <Input
                {...formField}
                type={type}
                disabled={!isEditable || field.disabled}
                placeholder={field.placeholder}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )

    switch (field.type) {
      case "text":
      case "password":
      case "email":
      case "tel":
      case "url":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            {renderBasicInput(field.type)}
          </motion.div>
        )

      case "textarea":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...formField}
                      disabled={!isEditable || field.disabled}
                      placeholder={field.placeholder}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )

      case "number":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      {...formField}
                      type="number"
                      disabled={!isEditable || field.disabled}
                      placeholder={field.placeholder}
                      className="text-right font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )

      case "date":
      case "datetime":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !formField.value && "text-muted-foreground"
                          )}
                          disabled={!isEditable || field.disabled}
                        >
                          {formField.value ? (
                            format(
                              new Date(formField.value),
                              field.type === "datetime" ? "PPP HH:mm:ss" : "PPP"
                            )
                          ) : (
                            <span>选择日期</span>
                          )}
                          <Icon icon="mdi:calendar" className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formField.value ? new Date(formField.value) : undefined}
                        onSelect={(date) => formField.onChange(date?.toISOString())}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )

      case "select":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      {...formField}
                      disabled={!isEditable || field.disabled}
                    >
                      <option value="">{field.placeholder || "请选择"}</option>
                      {(field as any).options?.map((option: any) => (
                        <option key={option.value} value={option.value} disabled={option.disabled}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )

      case "radio":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={formField.onChange}
                      defaultValue={formField.value}
                      disabled={!isEditable || field.disabled}
                      className="flex flex-wrap gap-4"
                    >
                      {(field as any).options?.map((option: any) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                          <label
                            htmlFor={`${field.name}-${option.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )

      case "checkbox":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-4">
                      {(field as any).options?.map((option: any) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formField.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const currentValue = formField.value || []
                              const newValue = checked
                                ? [...currentValue, option.value]
                                : currentValue.filter((v: any) => v !== option.value)
                              formField.onChange(newValue)
                            }}
                            disabled={!isEditable || field.disabled || option.disabled}
                          />
                          <label className="text-sm font-medium leading-none">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )

      case "switch":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Switch
                        checked={formField.value}
                        onCheckedChange={formField.onChange}
                        disabled={!isEditable || field.disabled}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )

      case "slider":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Slider
                      value={[formField.value]}
                      onValueChange={(value) => formField.onChange(value[0])}
                      disabled={!isEditable || field.disabled}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )

      case "resource":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name={field.name}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Input
                          {...formField}
                          disabled={!isEditable || field.disabled}
                          placeholder={field.placeholder}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {isEditable && !field.disabled && (
                <ResourceSelectButton
                  resourceName={field.resourceName}
                  appId={field.appId}
                  selectionMode={field.selectionMode}
                  onSelect={field.onSelect}
                  buttonText={`选择${field.label}`}
                  buttonProps={{
                    className: "w-full sm:w-auto whitespace-nowrap",
                    size: "default",
                  }}
                />
              )}
            </div>
          </motion.div>
        )

      case "file":
      case "image":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={field.accept}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file && field.onUpload) {
                          await field.onUpload(file)
                        }
                        formField.onChange(e)
                      }}
                      disabled={!isEditable || field.disabled}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                        file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )

      case "custom":
        return (
          <motion.div variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.render({
                      field: formField,
                      form,
                      isEditable,
                    })}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field) => (
        <div key={field.name}>{renderField(field)}</div>
      ))}
    </div>
  )
}

export default DynamicFormFields
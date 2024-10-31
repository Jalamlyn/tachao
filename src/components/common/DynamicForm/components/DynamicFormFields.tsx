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
      visible: { opacity: 1, y: 0 }
    }

    switch (field.type) {
      case "resource":
        return (
          <motion.div
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end"
          >
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
                  size: "default"
                }}
              />
            )}
          </motion.div>
        )

      case "file":
        return (
          <motion.div
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
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

      case "number":
        return (
          <motion.div
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
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
        return (
          <motion.div
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
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
                            format(new Date(formField.value), "PPP")
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

      case "custom":
        return field.render({ form, field, isEditable })

      default:
        return (
          <motion.div
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )
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
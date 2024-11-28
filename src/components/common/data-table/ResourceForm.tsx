import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

interface ResourceFormProps {
  initialData?: any
  columns?: ColumnDef<any>[]
  onSubmit: (data: any) => void
  isLoading?: boolean
}

const ResourceForm: React.FC<ResourceFormProps> = ({ initialData, columns = [], onSubmit, isLoading = false }) => {
  const createFormSchema = () => {
    if (!initialData && columns.length > 0) {
      const schemaFields: { [key: string]: any } = {}
      columns.forEach((column) => {
        if (column.accessorKey) {
          schemaFields[column.accessorKey] = z.string().min(1, `${column.accessorKey}不能为空`)
        }
      })
      return z.object(schemaFields)
    }

    if (!initialData && !columns.length) {
      return z.object({
        name: z.string().min(1, "名称不能为空"),
        description: z.string().optional(),
      })
    }

    const schemaFields: { [key: string]: any } = {}
    Object.keys(initialData || {}).forEach((key) => {
      const value = initialData[key]
      if (typeof value === "string") {
        schemaFields[key] = z.string()
      } else if (typeof value === "number") {
        schemaFields[key] = z.number()
      } else if (typeof value === "boolean") {
        schemaFields[key] = z.boolean()
      } else {
        schemaFields[key] = z.any()
      }
    })

    return z.object(schemaFields)
  }

  const createDefaultValues = () => {
    if (!initialData && columns.length > 0) {
      const defaultValues: { [key: string]: string } = {}
      columns.forEach((column) => {
        if (column.accessorKey) {
          defaultValues[column.accessorKey] = ""
        }
      })
      return defaultValues
    }

    if (!initialData && !columns.length) {
      return {
        name: "",
        description: "",
      }
    }

    return initialData
  }

  const form = useForm<z.infer<ReturnType<typeof createFormSchema>>>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: createDefaultValues(),
  })

  useEffect(() => {
    form.reset(createDefaultValues())
  }, [])

  const handleSubmit = (values: any) => {
    onSubmit(values)
  }

  const getFormFields = () => {
    if (!initialData && columns.length > 0) {
      return columns
        .filter((column): column is ColumnDef<any> & { accessorKey: string } => Boolean(column.accessorKey))
        .map((column) => ({
          name: column.accessorKey,
          label: column.header
            ? typeof column.header === "function"
              ? column.accessorKey
              : column.header
            : column.accessorKey,
        }))
    }

    const formFields = Object.keys(form.getValues())
    return formFields.map((field) => ({
      name: field,
      label: field,
    }))
  }

  const fields = getFormFields()
  const groupedFields = {
    basic: fields.filter((field) => ["name", "description", "title"].includes(field.name)),
    details: fields.filter((field) => !["name", "description", "title"].includes(field.name)),
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto px-6 py-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            {groupedFields.basic.length > 0 && (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {groupedFields.basic.map((field) => (
                    <FormField
                      key={field.name}
                      control={form.control}
                      name={field.name}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel className='capitalize text-gray-700'>
                            {field.label.replace(/([A-Z])/g, " $1").trim()}
                          </FormLabel>
                          <FormControl>
                            <Input {...formField} className='w-full focus:ring-indigo-500 focus:border-indigo-500' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedFields.details.length > 0 && (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {groupedFields.details.map((field) => (
                    <FormField
                      key={field.name}
                      control={form.control}
                      name={field.name}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel className='capitalize text-gray-700'>
                            {field.label.replace(/([A-Z])/g, " $1").trim()}
                          </FormLabel>
                          <FormControl>
                            <Input {...formField} className='w-full focus:ring-indigo-500 focus:border-indigo-500' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>

      <div className='flex justify-end space-x-4 px-6 py-4 border-t'>
        <Button type='submit' onClick={form.handleSubmit(handleSubmit)} disabled={isLoading} className='min-w-[120px]'>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {initialData ? "更新" : "保存"}
        </Button>
      </div>
    </div>
  )
}

export default ResourceForm

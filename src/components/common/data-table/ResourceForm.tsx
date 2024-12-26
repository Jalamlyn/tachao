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
  resource?: any
  columns?: ColumnDef<any>[]
  onSubmit: (data: any) => void
  isLoading?: boolean
}

const ResourceForm: React.FC<ResourceFormProps> = ({ 
  initialData, 
  resource,
  columns = [], 
  onSubmit, 
  isLoading = false 
}) => {
  const createFormSchema = () => {
    let schemaFields: { [key: string]: any } = {}

    if (resource?.indexFields?.displayFields) {
      resource.indexFields.displayFields.forEach((field: any) => {
        schemaFields[field.key] = z.string().min(1, `${field.label}不能为空`)
      })
      return z.object(schemaFields)
    }

    if (resource?.indexFields?.rawData) {
      Object.keys(resource.indexFields.rawData).forEach(key => {
        schemaFields[key] = z.string().min(1, `${key}不能为空`)
      })
      return z.object(schemaFields)
    }

    if (initialData) {
      Object.keys(initialData).forEach((key) => {
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

    if (columns.length > 0) {
      columns.forEach((column) => {
        if (column.accessorKey) {
          schemaFields[column.accessorKey] = z.string().min(1, `${column.accessorKey}不能为空`)
        }
      })
      return z.object(schemaFields)
    }

    return z.object({
      name: z.string().min(1, "名称不能为空"),
      description: z.string().optional(),
    })
  }

  const createDefaultValues = () => {
    if (initialData) {
      return initialData
    }

    if (resource?.indexFields?.rawData) {
      return Object.keys(resource.indexFields.rawData).reduce((acc, key) => {
        acc[key] = ''
        return acc
      }, {})
    }

    if (resource?.indexFields?.displayFields) {
      return resource.indexFields.displayFields.reduce((acc: any, field: any) => {
        acc[field.key] = ''
        return acc
      }, {})
    }

    if (columns.length > 0) {
      return columns.reduce((acc, column) => {
        if (column.accessorKey) {
          acc[column.accessorKey] = ''
        }
        return acc
      }, {})
    }

    return {
      name: "",
      description: "",
    }
  }

  const form = useForm<z.infer<ReturnType<typeof createFormSchema>>>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: createDefaultValues(),
  })

  useEffect(() => {
    form.reset(createDefaultValues())
  }, [resource])

  const handleSubmit = (values: any) => {
    onSubmit(values)
  }

  const getFormFields = () => {
    if (resource?.indexFields?.displayFields) {
      return resource.indexFields.displayFields.map((field: any) => ({
        name: field.key,
        label: field.label,
      }))
    }

    if (resource?.indexFields?.rawData) {
      return Object.keys(resource.indexFields.rawData).map(key => ({
        name: key,
        label: key,
      }))
    }

    if (initialData) {
      return Object.keys(initialData).map(key => ({
        name: key,
        label: key,
      }))
    }

    if (columns.length > 0) {
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

    return [
      { name: "name", label: "名称" },
      { name: "description", label: "描述" },
    ]
  }

  const fields = getFormFields()
  const groupedFields = {
    basic: fields.filter((field) => ["name", "description", "title"].includes(field.name)),
    details: fields.filter((field) => !["name", "description", "title"].includes(field.name)),
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto px-6 py-4 max-h-[70vh]'>
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
                            <Input
                              {...formField}
                              disabled={field.name === "dataid"}
                              className='w-full focus:ring-indigo-500 focus:border-indigo-500'
                            />
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
                            <Input
                              {...formField}
                              disabled={field.name === "dataid"}
                              className='w-full focus:ring-indigo-500 focus:border-indigo-500'
                            />
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
import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import ResourceSelectButton from "../../ResourceSelectButton"
import { TableConfig } from "../types"
import { UseFormReturn } from "react-hook-form"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface DynamicTableProps {
  config: TableConfig
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName: string
}

const DynamicTable: React.FC<DynamicTableProps> = ({ config, form, isEditable = true, fieldName }) => {
  const tableData = form.watch(fieldName) || []

  // 默认的计算函数
  const defaultCalculations = {
    amount: (row: any) => {
      const quantity = Number(row.quantity) || 0
      const unitPrice = Number(row.unitPrice) || 0
      return Number((quantity * unitPrice).toFixed(2))
    }
  }

  // 合并默认计算函数和配置的计算函数
  const calculations = {
    ...defaultCalculations,
    ...(config.rowCalculations || {})
  }

  const handleCalculateField = (row: any, index: number, changedField: string) => {
    // 检查是否有依赖关系需要计算
    if (config.dependencies) {
      Object.entries(config.dependencies).forEach(([field, dependency]) => {
        if (dependency.dependsOn?.includes(changedField)) {
          try {
            // 优先使用配置的计算函数
            const calculate = dependency.calculate || calculations[field]
            if (typeof calculate === 'function') {
              const value = calculate(row)
              form.setValue(`${fieldName}.${index}.${field}`, value)
            }
          } catch (error) {
            console.error(`Error calculating field ${field}:`, error)
          }
        }
      })
    }
  }

  const calculateSummary = (field: string, calculate: (records: any[]) => number | string) => {
    try {
      return calculate(tableData)
    } catch (error) {
      console.error(`Error calculating summary for ${field}:`, error)
      return 0
    }
  }

  const handleAddRow = () => {
    const newRow = config.columns.reduce((acc, column) => {
      acc[column.key] = ""
      return acc
    }, {} as Record<string, any>)
    
    form.setValue(fieldName, [...tableData, newRow])
  }

  const handleDeleteRow = (index: number) => {
    const newData = [...tableData]
    newData.splice(index, 1)
    form.setValue(fieldName, newData)
  }

  const renderCell = (column: TableConfig["columns"][0], rowIndex: number) => {
    const cellFieldName = `${fieldName}.${rowIndex}.${column.key}`

    if (column.render) {
      return column.render(form.getValues(cellFieldName), tableData[rowIndex], rowIndex)
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
                    <Input {...field} disabled={!isEditable || !column.editable} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEditable && column.editable && column.resourceConfig && (
              <ResourceSelectButton
                resourceName={column.resourceConfig.resourceName}
                appId={column.resourceConfig.appId}
                selectionMode={column.resourceConfig.selectionMode}
                onSelect={(selected) => {
                  if (selected.length > 0) {
                    form.setValue(cellFieldName, selected[0])
                  }
                }}
                buttonText='选择'
              />
            )}
          </div>
        )

      case "file":
        return (
          <FormField
            control={form.control}
            name={cellFieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type='file'
                    accept={column.fileConfig?.accept}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        field.onChange({
                          fileName: file.name,
                          fileSize: file.size,
                          fileType: file.type,
                        })
                      }
                    }}
                    disabled={!isEditable || !column.editable}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "number":
        return (
          <FormField
            control={form.control}
            name={cellFieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type='number'
                    className='text-right'
                    disabled={!isEditable || !column.editable}
                    onChange={(e) => {
                      field.onChange(e)
                      handleCalculateField(tableData[rowIndex], rowIndex, column.key)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      default:
        return (
          <FormField
            control={form.control}
            name={cellFieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} disabled={!isEditable || !column.editable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
    }
  }

  const renderSummary = () => {
    if (!config.summary) return null

    return (
      <TableRow>
        <TableCell colSpan={config.columns.length + (isEditable ? 1 : 0)}>
          <div className='space-y-2'>
            {Object.entries(config.summary.fields).map(([key, { label, calculate }]) => {
              const value = calculateSummary(key, calculate)
              
              return (
                <div key={key} className='flex justify-between'>
                  <span>{label}:</span>
                  <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                </div>
              )
            })}
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div>
      {config.toolbar}
      <Table>
        <TableHeader>
          <TableRow>
            {config.columns.map((column) => (
              <TableHead key={column.key} style={{ width: column.width }}>
                {column.title}
              </TableHead>
            ))}
            {isEditable && <TableHead>操作</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row: any, rowIndex: number) => (
            <TableRow key={rowIndex}>
              {config.columns.map((column) => (
                <TableCell key={column.key}>{renderCell(column, rowIndex)}</TableCell>
              ))}
              {isEditable && (
                <TableCell>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    size="sm"
                    onClick={() => handleDeleteRow(rowIndex)}
                  >
                    <Icon icon="mdi:delete" className="w-4 h-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          {renderSummary()}
        </TableBody>
      </Table>
      {isEditable && (
        <div className="mt-4">
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onClick={handleAddRow}
            startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
          >
            添加行
          </Button>
        </div>
      )}
    </div>
  )
}

export default DynamicTable
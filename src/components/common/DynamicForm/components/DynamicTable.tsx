import React from "react"
import { UseFormReturn } from "react-hook-form"
import { TableConfig } from "../types"
import DynamicTable from "./Table"

interface DynamicTableProps {
  config: TableConfig
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName: string
}

// 为了保持向后兼容性，我们保留了原始的DynamicTable组件
// 但是内部使用新的重构后的Table组件
const DynamicTableWrapper: React.FC<DynamicTableProps> = ({
  config,
  form,
  isEditable = true,
  fieldName,
}) => {
  return (
    <DynamicTable
      config={config}
      form={form}
      isEditable={isEditable}
      fieldName={fieldName}
    />
  )
}

export default DynamicTableWrapper
import React, { forwardRef } from "react"
import { format } from "date-fns"
import { DynamicFormConfig } from "../types"
import { cn } from "@/theme/cn"

interface PrintableTemplateProps {
  config: DynamicFormConfig
  data: any
}

const PrintableTemplate = forwardRef<HTMLDivElement, PrintableTemplateProps>(({ config, data }, ref) => {
  const { metadata, renderConfig } = config

  // 渲染基本信息字段
  const renderBasicFields = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        {renderConfig.basicFields.map((field) => (
          <div key={field.name} className="flex justify-between border-b border-gray-200 py-2">
            <span className="font-medium">{field.label}:</span>
            <span className="min-w-[200px] text-right">
              {formatFieldValue(field.type, data?.basicInfo?.[field.name])}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // 渲染表格数据
  const renderTable = () => {
    if (!renderConfig.table || !data?.tableData?.length) return null

    return (
      <div className="mt-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {renderConfig.table.columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "border border-gray-300 p-2 text-sm font-medium text-left",
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
            {data.tableData.map((row: any, index: number) => (
              <tr key={index} className="border-b border-gray-200">
                {renderConfig.table!.columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "border border-gray-300 p-2 text-sm",
                      column.type === "number" && "text-right font-mono"
                    )}
                  >
                    {formatFieldValue(column.type, row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {renderConfig.table.summary && (
            <tfoot>
              <tr>
                <td
                  colSpan={renderConfig.table.columns.length}
                  className="border border-gray-300 p-2 text-sm"
                >
                  <div className="space-y-1">
                    {Object.entries(renderConfig.table.summary.fields).map(([key, { label, calculate }]) => {
                      const value = calculate(data.tableData)
                      return (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{label}:</span>
                          <span>{typeof value === "number" ? value.toFixed(2) : value}</span>
                        </div>
                      )
                    })}
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    )
  }

  // 渲染流程确认信息
  const renderProcessSteps = () => {
    if (!renderConfig.processSteps || !data?.processConfirmations) return null

    return (
      <div className="mt-6 space-y-4">
        {renderConfig.processSteps.map((step) => {
          const stepData = data.processConfirmations[step.key]
          if (!stepData?.confirmed) return null

          return (
            <div key={step.key} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{step.title}</span>
                <span className="text-gray-500">
                  {stepData.confirmationDate &&
                    format(new Date(stepData.confirmationDate), "yyyy-MM-dd HH:mm:ss")}
                </span>
              </div>
              <div className="text-sm text-gray-500">确认人: {stepData.confirmer}</div>
              {step.fields && (
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {step.fields.map((field) => (
                    <div key={field.name} className="flex justify-between">
                      <span>{field.label}:</span>
                      <span>{formatFieldValue(field.type, stepData.formData?.[field.name])}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // 格式化字段值
  const formatFieldValue = (type: string, value: any) => {
    if (value === undefined || value === null || value === "") return "-"

    switch (type) {
      case "date":
      case "datetime":
        return format(new Date(value), "yyyy-MM-dd HH:mm:ss")
      case "number":
        return typeof value === "number" ? value.toFixed(2) : value
      default:
        return value
    }
  }

  return (
    <div ref={ref} className="p-8 print:p-4 bg-white">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{metadata.title}</h1>
        {metadata.description && <p className="text-gray-500 mt-1">{metadata.description}</p>}
      </div>

      {/* 基本信息 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">基本信息</h2>
        {renderBasicFields()}
      </div>

      {/* 表格数据 */}
      {renderConfig.table && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">明细信息</h2>
          {renderTable()}
        </div>
      )}

      {/* 流程确认 */}
      {renderConfig.processSteps && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">流程确认</h2>
          {renderProcessSteps()}
        </div>
      )}

      {/* 签字栏 */}
      <div className="mt-8 flex justify-between text-sm">
        <div>
          <p>制单人：________________</p>
          <p className="mt-2">日期：________________</p>
        </div>
        <div>
          <p>审核人：________________</p>
          <p className="mt-2">日期：________________</p>
        </div>
      </div>

      {/* 打印样式 */}
      <style type="text/css" media="print">{`
        @page {
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
          body {
            -webkit-print-color-adjust: exact;
          }
          table { page-break-inside: auto }
          tr { page-break-inside: avoid; page-break-after: auto }
          thead { display: table-header-group }
          tfoot { display: table-footer-group }
        }
      `}</style>
    </div>
  )
})

PrintableTemplate.displayName = "PrintableTemplate"

export default PrintableTemplate
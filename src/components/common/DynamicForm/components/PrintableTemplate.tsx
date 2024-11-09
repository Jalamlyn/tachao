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

  // 渲染基本信息字段
  const renderBasicFields = () => {
    return (
      <div className='grid grid-cols-2 gap-4'>
        {renderConfig.basicFields.map((field) => (
          <div
            key={field.name}
            className={cn("flex justify-between border-b border-gray-200 py-2", "print:break-inside-avoid")}
          >
            <span className='font-medium text-gray-700'>{field.label}:</span>
            <span className='min-w-[200px] text-right text-gray-900'>
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
      <div className='mt-6 print:break-inside-avoid-page'>
        <table className='w-full border-collapse print:break-inside-auto'>
          <thead className='print:table-header-group'>
            <tr className='bg-gray-50'>
              {renderConfig.table.columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "border border-gray-300 p-2 text-sm font-medium text-left",
                    column.type === "number" && "text-right",
                    "print:break-inside-avoid"
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
              <tr key={index} className='border-b border-gray-200 print:break-inside-avoid'>
                {renderConfig.table!.columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "border border-gray-300 p-2 text-sm",
                      column.type === "number" && "text-right font-mono",
                      "print:break-inside-avoid"
                    )}
                  >
                    {formatFieldValue(column.type, row[column.key])}
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
    if (!renderConfig.processSteps || !data?.processConfirmations) return null

    return (
      <div className='mt-6 space-y-4 print:break-inside-avoid-page'>
        {renderConfig.processSteps.map((step) => {
          const stepData = data.processConfirmations[step.key]

          return (
            <div key={step.key} className='process-step border-b border-gray-200 pb-4 print:break-inside-avoid'>
              <div className='flex justify-between mb-2'>
                <div>
                  <span className='font-medium text-gray-900'>{step.title}</span>
                  {step.description && <p className='text-gray-500 text-sm mt-1'>{step.description}</p>}
                </div>
                <div className='text-sm'>
                  {stepData?.confirmed ? (
                    <span className='text-green-600'>已确认</span>
                  ) : (
                    <span className='text-gray-400'>未确认</span>
                  )}
                </div>
              </div>

              {stepData?.confirmed && (
                <div className='step-content'>
                  <div className='grid grid-cols-2 gap-4 text-sm mt-2'>
                    <div>
                      <span className='text-gray-500'>确认人：</span>
                      <span className='text-gray-900'>{stepData.confirmer}</span>
                    </div>
                    <div>
                      <span className='text-gray-500'>确认时间：</span>
                      <span className='text-gray-900'>
                        {stepData.confirmationDate &&
                          format(new Date(stepData.confirmationDate), "yyyy-MM-dd HH:mm:ss")}
                      </span>
                    </div>
                  </div>

                  {/* 渲染步骤表单字段 */}
                  {step.fields && stepData.formData && (
                    <div className='mt-3 grid grid-cols-2 gap-4 text-sm'>
                      {step.fields.map((field) => (
                        <div key={field.name}>
                          <span className='text-gray-500'>{field.label}：</span>
                          <span className='text-gray-900'>
                            {formatFieldValue(field.type, stepData.formData[field.name])}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={ref} className='p-8 print:p-4 bg-white'>
      {/* 表单标题 */}
      <div className='text-center mb-8 print:break-inside-avoid'>
        <h1 className='text-2xl font-bold text-gray-900'>{metadata.title}</h1>
        {metadata.description && <p className='text-gray-500 mt-1 text-sm'>{metadata.description}</p>}
      </div>

      {/* 基本信息 */}
      <div className='mb-8 print:break-inside-avoid print-page'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>基本信息</h2>
        {renderBasicFields()}
      </div>

      {/* 表格数据 */}
      {renderConfig.table && (
        <div className='mb-8 print-page'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>明细信息</h2>
          {renderTable()}
        </div>
      )}

      {/* 流程确认 */}
      {renderConfig.processSteps && (
        <div className='mb-8 print-page'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>流程确认</h2>
          {renderProcessSteps()}
        </div>
      )}

      {/* 打印样式 */}
      <style type='text/css' media='print'>{`
        @page {
          size: A4;
          margin: 20mm;
        }
        @media print {
          html, body {
            height: 100vh;
            margin: 0 !important;
            padding: 0 !important;
            overflow: initial !important;
            -webkit-print-color-adjust: exact;
          }
          .print-page {
            page-break-after: always;
            margin-bottom: 0;
          }
          table { page-break-inside: auto }
          tr    { page-break-inside: avoid; page-break-after: auto }
          thead { display: table-header-group }
          tfoot { display: table-footer-group }
          .process-step {
            break-inside: avoid;
          }
          .step-content {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  )
})

PrintableTemplate.displayName = "PrintableTemplate"

export default PrintableTemplate
import React, { forwardRef } from "react"
import { format } from "date-fns"

interface PrintableContentProps {
  formData: any
}

const PrintableContent = forwardRef<HTMLDivElement, PrintableContentProps>(({ formData }, ref) => {
  if (!formData) return null

  return (
    <div ref={ref} className='p-8 print:p-4 bg-white'>
      {/* 标题 */}
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold'>{formData.title || "表单详情"}</h1>
      </div>

      {/* 基本信息 */}
      {Object.entries(formData.formFields || {}).map(([section, fields]: [string, any]) => (
        <div key={section} className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>{section}</h2>
          <div className='grid grid-cols-2 gap-4'>
            {fields.map((field: any) => (
              <div key={field.name} className='flex justify-between'>
                <span className='font-medium'>{field.label}:</span>
                <span>{formData[field.name]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 表格数据 */}
      {formData.table && (
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>表格数据</h2>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-50'>
                {formData.table.columns.map((column: any) => (
                  <th key={column.key} className='border border-gray-300 p-2 text-sm font-medium text-left'>
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(formData.tableData || []).map((row: any, index: number) => (
                <tr key={index} className='border-b border-gray-200'>
                  {formData.table.columns.map((column: any) => (
                    <td key={column.key} className='border border-gray-300 p-2 text-sm'>
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 流程确认信息 */}
      {formData.processSteps && (
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>流程确认</h2>
          <div className='space-y-4'>
            {formData.processSteps.map((step: any) => (
              <div key={step.key} className='border rounded p-4'>
                <h3 className='font-medium'>{step.title}</h3>
                <p className='text-gray-600 text-sm'>{step.description}</p>
                {formData.processConfirmations?.[step.key]?.confirmed && (
                  <div className='mt-2 text-sm'>
                    <div>确认人: {formData.processConfirmations[step.key].confirmer}</div>
                    <div>确认时间: {formData.processConfirmations[step.key].confirmationDate}</div>
                    {formData.processConfirmations[step.key].comments && (
                      <div>确认意见: {formData.processConfirmations[step.key].comments}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 打印页脚 */}
      <div className='mt-8 text-sm text-gray-500'>
        <div>打印时间: {new Date().toLocaleString()}</div>
      </div>

      {/* 打印样式 */}
      <style type='text/css' media='print'>{`
        @page {
          size: A4;
          margin: 20mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
          .print-header {
            position: fixed;
            top: 0;
          }
          .print-footer {
            position: fixed;
            bottom: 0;
          }
        }
      `}</style>
    </div>
  )
})

PrintableContent.displayName = "PrintableContent"

export default PrintableContent
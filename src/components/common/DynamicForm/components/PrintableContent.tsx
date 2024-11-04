import React, { forwardRef } from "react"
import { format } from "date-fns"

interface PrintableContentProps {
  formData: any
}

const PrintableContent = forwardRef<HTMLDivElement, PrintableContentProps>(({ formData }, ref) => {
  // 生成空行数据
  const generateEmptyRows = (count: number) => {
    return Array(count).fill(null).map((_, index) => ({
      id: `empty-${index}`,
      ...Object.keys(formData?.formFields || {}).reduce((acc, key) => {
        acc[key] = ""
        return acc
      }, {})
    }))
  }

  // 处理表格数据
  const tableData = formData?.data?.tableData || []
  const finalTableData = tableData.length > 0 ? tableData : generateEmptyRows(5)

  // 确保基本信息字段存在
  const ensureBasicInfo = (info: any) => {
    if (!info) return {}
    return Object.keys(formData?.formFields || {}).reduce((acc, key) => {
      acc[key] = info[key] || ""
      return acc
    }, {})
  }

  const basicInfo = ensureBasicInfo(formData?.data?.basicInfo)

  return (
    <div ref={ref} className='p-8 print:p-4 bg-white'>
      {/* 标题 */}
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold'>{formData?.title || "表单详情"}</h1>
      </div>

      {/* 基本信息 */}
      {Object.entries(formData?.formFields || {}).map(([section, fields]: [string, any]) => (
        <div key={section} className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>{section}</h2>
          <div className='grid grid-cols-2 gap-4'>
            {fields.map((field: any) => (
              <div key={field.name} className='flex justify-between border-b border-gray-200 py-2'>
                <span className='font-medium'>{field.label}:</span>
                <span className='min-w-[200px] text-right'>
                  {basicInfo[field.name] || "____________________"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 表格数据 */}
      {formData?.table && (
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>表格数据</h2>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-50'>
                {formData.table.columns.map((column: any) => (
                  <th
                    key={column.key}
                    className='border border-gray-300 p-2 text-sm font-medium text-left'
                    style={{ width: column.width }}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {finalTableData.map((row: any, index: number) => (
                <tr key={row.id || index} className='border-b border-gray-200'>
                  {formData.table.columns.map((column: any) => (
                    <td key={column.key} className='border border-gray-300 p-2 text-sm min-h-[40px]'>
                      {row[column.key] || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 签字栏 */}
      <div className='mt-8 flex justify-between text-sm'>
        <div>
          <p>制单人：________________</p>
          <p className='mt-2'>日期：________________</p>
        </div>
        <div>
          <p>审核人：________________</p>
          <p className='mt-2'>日期：________________</p>
        </div>
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
          td {
            min-height: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  )
})

PrintableContent.displayName = "PrintableContent"

export default PrintableContent
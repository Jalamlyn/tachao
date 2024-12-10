import React, { forwardRef } from "react"
import { format } from "date-fns"
import { DynamicFormConfig } from "../types"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"

interface PrintableTemplateProps {
  config: DynamicFormConfig
  data: any
}

const PrintableTemplate = forwardRef<HTMLDivElement, PrintableTemplateProps>(({ config, data }, ref) => {
  // 标准化配置
  const normalizeConfig = (rawConfig: any): DynamicFormConfig => {
    if (!rawConfig) return rawConfig

    // 如果配置来自模板
    if (rawConfig.config?.renderConfig) {
      return {
        metadata: {
          title: rawConfig.title || "表单",
          description: rawConfig.description,
          permissions: {
            edit: true,
            delete: true,
            print: true,
          },
        },
        renderConfig: rawConfig.config.renderConfig,
        orderNumberConfig: rawConfig.config.orderNumberConfig,
      }
    }

    return rawConfig
  }

  const normalizedConfig = normalizeConfig(config)
  const { metadata, renderConfig } = normalizedConfig

  // 从缓存中获取资源数据
  const getResourceFromCache = (resourceId: string, dataid: string) => {
    try {
      const key = `resource_${resourceId}_${dataid}`
      const cached = sessionStorage.getItem(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error("Error getting resource from cache:", error)
      return null
    }
  }

  // 格式化资源字段值
  const formatResourceValue = (field: any, value: any) => {
    if (!value) return "____________"

    try {
      // 处理单个资源
      if (value.dataid && !Array.isArray(value.dataid)) {
        const resourceData = getResourceFromCache(field.resourceConfig?.resourceId, value.dataid)
        if (resourceData) {
          const displayFields = field.resourceConfig?.displayFields || []
          return displayFields
            .map((df: any) => `${df.label}: ${resourceData[df.key]}`)
            .filter(Boolean)
            .join(" | ")
        }
      }

      // 处理多个资源
      if (Array.isArray(value.dataid)) {
        const resourcesData = value.dataid
          .map(id => getResourceFromCache(field.resourceConfig?.resourceId, id))
          .filter(Boolean)
        if (resourcesData.length > 0) {
          return resourcesData
            .map(data => {
              const displayFields = field.resourceConfig?.displayFields || []
              return displayFields
                .map((df: any) => `${df.label}: ${data[df.key]}`)
                .filter(Boolean)
                .join(" | ")
            })
            .join("\n")
        }
      }

      // 如果是对象，尝试直接使用对象的值
      if (typeof value === "object" && value !== null) {
        const fields = Object.entries(value)
          .filter(([_, v]) => v != null && v !== "")
          .map(([_, v]) => `${v}`)
          .join("，")
        return fields || "____________"
      }

      return value.dataid || "____________"
    } catch (error) {
      console.error("Error formatting resource value:", error)
      return "____________"
    }
  }

  // 格式化字段值
  const formatFieldValue = (type: string, value: any, field?: any) => {
    if (value === undefined || value === null || value === "") return "____________"

    switch (type) {
      case "signature":
        if (typeof value === "string" && value.startsWith("data:image")) {
          return (
            <img
              src={value}
              alt='签名'
              style={{
                maxWidth: "120px",
                maxHeight: "60px",
                objectFit: "contain",
              }}
              className='print-signature'
            />
          )
        }
        return "____________"
      case "date":
      case "datetime":
      case "time":
        try {
          return format(new Date(value), "yyyy-MM-dd HH:mm:ss")
        } catch {
          return "____________"
        }
      case "number":
        return typeof value === "number" ? value.toFixed(2) : "____________"
      case "resource":
        return formatResourceValue(field, value)
      default:
        if (typeof value === "object" && value !== null) {
          try {
            const fields = Object.entries(value)
              .filter(([_, v]) => v != null && v !== "")
              .map(([_, v]) => `${v}`)
              .join("，")
            return fields || "____________"
          } catch (error) {
            console.error("Error formatting object value:", error)
            return "____________"
          }
        }
        return value || "____________"
    }
  }

  // 确保基本信息数据的完整性
  const ensureBasicInfo = () => {
    const basicData = {
      ...data,
      ...(data?.basicInfo || {}),
    }

    const systemFields = ["tableData", "processConfirmations"]
    return Object.fromEntries(Object.entries(basicData).filter(([key]) => !systemFields.includes(key)))
  }

  // 渲染基本信息字段
  const renderBasicFields = () => {
    const basicInfo = ensureBasicInfo()

    if (
      !renderConfig.basicFields ||
      typeof renderConfig.basicFields !== "object" ||
      !("groups" in renderConfig.basicFields)
    ) {
      const fieldArray = Array.isArray(renderConfig.basicFields) ? renderConfig.basicFields : []
      return (
        <table className='w-full border-collapse'>
          <tbody>
            {fieldArray.map((field, index) => (
              <tr key={field.name} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className='border border-gray-300 p-2 w-[200px] font-medium text-gray-700'>{field.label}</td>
                <td className='border border-gray-300 p-2'>{formatFieldValue(field.type, basicInfo[field.name], field)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    const { groups } = renderConfig.basicFields
    return (
      <div className='space-y-6'>
        {groups.map((group) => (
          <div key={group.key} className='print:break-inside-avoid'>
            <div className='flex items-center gap-2 mb-3 pb-2 border-b-2 border-gray-300'>
              {group.icon && <Icon icon={group.icon} className='text-gray-500' />}
              <h3 className='text-base font-bold text-gray-800'>{group.title}</h3>
            </div>
            {group.description && <p className='text-sm text-gray-500 mb-3 italic'>{group.description}</p>}
            <table className='w-full border-collapse'>
              <tbody>
                {group.fields.map((field, index) => (
                  <tr key={field.name} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className='border border-gray-300 p-2 w-[200px] font-medium text-gray-700'>{field.label}</td>
                    <td className='border border-gray-300 p-2'>
                      {formatFieldValue(field.type, basicInfo[field.name], field)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    )
  }

  // 渲染表格数据
  const renderTable = () => {
    if (!renderConfig.table) return null

    const tableData = data?.tableData || []
    const displayData = tableData.length > 0 ? tableData : [{}]

    return (
      <div className='mt-6'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gray-100'>
              {renderConfig.table.columns.map((column, index) => (
                <th
                  key={column.key}
                  className={cn(
                    "border border-gray-300 p-2 text-sm font-bold text-gray-800",
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
            {displayData.map((row: any, rowIndex: number) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : ""}>
                {renderConfig.table!.columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "border border-gray-300 p-2 text-sm",
                      column.type === "number" && "text-right font-mono"
                    )}
                  >
                    {formatFieldValue(column.type, row[column.key], column)}
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
    if (!renderConfig.processSteps) return null

    const processConfirmations = data?.processConfirmations || {}

    return (
      <div className='mt-6 space-y-6'>
        {renderConfig.processSteps.map((step) => {
          const stepData = processConfirmations[step.key] || {}

          return (
            <div key={step.key} className='process-step border border-gray-300 rounded-lg p-4'>
              <div className='flex justify-between items-center mb-3 pb-2 border-b border-gray-200'>
                <div className='flex items-center gap-2'>
                  <span className='font-bold text-gray-800'>{step.title}</span>
                  {step.description && <span className='text-sm text-gray-500 italic'>({step.description})</span>}
                </div>
                <div className='text-sm font-medium'>
                  {stepData?.confirmed ? (
                    <span className='text-green-600'>已确认</span>
                  ) : (
                    <span className='text-gray-400'>未确认</span>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 mb-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-500'>确认人：</span>
                  <span className='text-sm font-medium'>{stepData?.confirmer || "____________"}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-500'>确认时间：</span>
                  <span className='text-sm font-medium'>
                    {stepData?.confirmationDate
                      ? format(new Date(stepData.confirmationDate), "yyyy-MM-dd HH:mm:ss")
                      : "____________"}
                  </span>
                </div>
              </div>

              {step.fields && (
                <table className='w-full border-collapse'>
                  <tbody>
                    {step.fields.map((field, index) => (
                      <tr key={field.name} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className='border border-gray-300 p-2 w-[200px] text-sm font-medium text-gray-700'>
                          {field.label}
                        </td>
                        <td className='border border-gray-300 p-2 text-sm'>
                          {formatFieldValue(field.type, stepData?.formData?.[field.name], field)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // 渲染页脚
  const renderFooter = () => {
    return (
      <div className='mt-8 pt-4 border-t-2 border-gray-300'>
        <div className='grid grid-cols-2 gap-8'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-500'>制单人：</span>
              <span className='flex-1 border-b border-gray-300'>____________</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-500'>日期：</span>
              <span className='flex-1 border-b border-gray-300'>____________</span>
            </div>
          </div>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-500'>审核人：</span>
              <span className='flex-1 border-b border-gray-300'>____________</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-500'>日期：</span>
              <span className='flex-1 border-b border-gray-300'>____________</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className='p-8 bg-white max-w-[210mm] mx-auto'>
      {/* 页眉 */}
      <div className='text-center mb-8 pb-4 border-b-2 border-gray-300'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>{metadata.title}</h1>
        {metadata.description && <p className='text-sm text-gray-500 italic'>{metadata.description}</p>}
        <div className='absolute top-8 right-8 text-sm text-gray-500'>
          <div>单号：{data?.orderNumber || "____________"}</div>
          <div>日期：{format(new Date(), "yyyy-MM-dd")}</div>
        </div>
      </div>

      {/* 基本信息 */}
      <div className='mb-6'>
        <div className='flex items-center gap-2 mb-3'>
          <div className='w-1 h-6 bg-gray-800'></div>
          <h2 className='text-lg font-bold text-gray-800'>基本信息</h2>
        </div>
        {renderBasicFields()}
      </div>

      {/* 表格数据 */}
      {renderConfig.table && (
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='w-1 h-6 bg-gray-800'></div>
            <h2 className='text-lg font-bold text-gray-800'>明细信息</h2>
          </div>
          {renderTable()}
        </div>
      )}

      {/* 流程确认 */}
      {renderConfig.processSteps && (
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='w-1 h-6 bg-gray-800'></div>
            <h2 className='text-lg font-bold text-gray-800'>流程确认</h2>
          </div>
          {renderProcessSteps()}
        </div>
      )}

      {/* 页脚 */}
      {renderFooter()}

      {/* 打印样式 */}
      <style type='text/css' media='print'>{`
        @page {
          size: A4;
          margin: 20mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
          .process-step {
            break-inside: avoid;
          }
          table { 
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 8px !important;
          }
          h1 {
            font-size: 24px !important;
            margin-bottom: 12px !important;
          }
          h2 {
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }
          .mb-6 {
            margin-bottom: 24px !important;
          }
          .mb-3 {
            margin-bottom: 12px !important;
          }
          .p-8 {
            padding: 32px !important;
          }
          .bg-gray-50 {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-signature {
            max-width: 120px !important;
            max-height: 60px !important;
            object-fit: contain !important;
          }
          .text-gray-500 {
            color: #6b7280 !important;
          }
          .text-gray-700 {
            color: #374151 !important;
          }
          .text-gray-800 {
            color: #1f2937 !important;
          }
          .text-gray-900 {
            color: #111827 !important;
          }
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
          .border-gray-200 {
            border-color: #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  )
})

PrintableTemplate.displayName = "PrintableTemplate"

export default PrintableTemplate
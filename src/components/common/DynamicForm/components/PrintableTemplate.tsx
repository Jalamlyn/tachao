import React, { forwardRef } from "react"
import { format } from "date-fns"
import { DynamicFormConfig } from "../types"
import { cn } from "@/theme/cn"

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
            print: true
          }
        },
        renderConfig: rawConfig.config.renderConfig,
        orderNumberConfig: rawConfig.config.orderNumberConfig
      }
    }

    return rawConfig
  }

  const normalizedConfig = normalizeConfig(config)
  const { metadata, renderConfig } = normalizedConfig

  // 格式化字段值
  const formatFieldValue = (type: string, value: any) => {
    if (value === undefined || value === null || value === "") return "____________"

    switch (type) {
      case "signature":
        // 验证是否为有效的base64图片数据
        if (typeof value === "string" && value.startsWith("data:image")) {
          return (
            <img
              src={value}
              alt='签名'
              style={{
                maxWidth: "200px",
                maxHeight: "100px",
                objectFit: "contain",
              }}
              className='print-signature'
            />
          )
        }
        // 如果不是有效的base64图片则显示占位符
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
      default:
        return value || "____________"
    }
  }

  // 确保基本信息数据的完整性
  const ensureBasicInfo = () => {
    // 合并顶级字段和 basicInfo 字段
    const basicData = {
      ...data, // 包含所有顶级字段
      ...(data?.basicInfo || {}), // 如果存在 basicInfo，则合并
    }

    // 只过滤掉特定的系统字段
    const systemFields = ["tableData", "processConfirmations"]
    return Object.fromEntries(Object.entries(basicData).filter(([key]) => !systemFields.includes(key)))
  }

  // 渲染基本信息字段
  const renderBasicFields = () => {
    const basicInfo = ensureBasicInfo()

    // 检查是否使用分组配置
    if (Array.isArray(renderConfig.basicFields)) {
      return (
        <div className='grid grid-cols-2 gap-2'>
          {renderConfig.basicFields.map((field) => (
            <div
              key={field.name}
              className={cn("flex justify-between border-b border-gray-200 py-1", "print:break-inside-avoid")}
            >
              <span className='font-medium text-gray-700 text-sm'>{field.label}:</span>
              <span className='min-w-[120px] text-right text-sm text-gray-900'>
                {formatFieldValue(field.type, basicInfo[field.name])}
              </span>
            </div>
          ))}
        </div>
      )
    }

    // 处理分组配置
    const { groups } = renderConfig.basicFields
    return (
      <div className='space-y-4'>
        {groups.map((group) => (
          <div key={group.key} className='print:break-inside-avoid'>
            <h3 className='text-sm font-medium text-gray-900 mb-2 pb-1 border-b'>
              {group.icon && <span className='mr-1'>{group.icon}</span>}
              {group.title}
            </h3>
            {group.description && <p className='text-xs text-gray-500 mb-2'>{group.description}</p>}
            <div className='grid grid-cols-2 gap-2'>
              {group.fields.map((field) => (
                <div
                  key={field.name}
                  className={cn("flex justify-between border-b border-gray-200 py-1", "print:break-inside-avoid")}
                >
                  <span className='font-medium text-gray-700 text-sm'>{field.label}:</span>
                  <span className='min-w-[120px] text-right text-sm text-gray-900'>
                    {formatFieldValue(field.type, basicInfo[field.name])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 渲染表格数据
  const renderTable = () => {
    if (!renderConfig.table) return null

    const tableData = data?.tableData || []
    // 如果没有数据，显示至少一行空行
    const displayData = tableData.length > 0 ? tableData : [{}]

    return (
      <div className='mt-3'>
        <table className='w-full border-collapse text-sm'>
          <thead>
            <tr className='bg-gray-50'>
              {renderConfig.table.columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "border border-gray-300 p-1 text-sm font-medium text-left",
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
            {displayData.map((row: any, index: number) => (
              <tr key={index} className='border-b border-gray-200'>
                {renderConfig.table!.columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "border border-gray-300 p-1 text-sm",
                      column.type === "number" && "text-right font-mono"
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
    if (!renderConfig.processSteps) return null

    const processConfirmations = data?.processConfirmations || {}

    return (
      <div className='mt-3 space-y-2'>
        {renderConfig.processSteps.map((step) => {
          const stepData = processConfirmations[step.key] || {}

          return (
            <div key={step.key} className='process-step border-b border-gray-200 pb-2'>
              <div className='flex justify-between mb-1'>
                <div>
                  <span className='font-medium text-gray-900 text-sm'>{step.title}</span>
                  {step.description && <p className='text-gray-500 text-xs mt-0.5'>{step.description}</p>}
                </div>
                <div className='text-xs'>
                  {stepData?.confirmed ? (
                    <span className='text-green-600'>已确认</span>
                  ) : (
                    <span className='text-gray-400'>未确认</span>
                  )}
                </div>
              </div>

              {step.fields && (
                <div className='step-content'>
                  <div className='grid grid-cols-2 gap-2 text-xs mt-1'>
                    <div>
                      <span className='text-gray-500'>确认人：</span>
                      <span className='text-gray-900'>{stepData?.confirmer || "____________"}</span>
                    </div>
                    <div>
                      <span className='text-gray-500'>确认时间：</span>
                      <span className='text-gray-900'>
                        {stepData?.confirmationDate
                          ? format(new Date(stepData.confirmationDate), "yyyy-MM-dd HH:mm:ss")
                          : "____________"}
                      </span>
                    </div>
                  </div>

                  <div className='mt-2 grid grid-cols-2 gap-2 text-xs'>
                    {step.fields.map((field) => (
                      <div key={field.name}>
                        <span className='text-gray-500'>{field.label}：</span>
                        <span className='text-gray-900'>
                          {formatFieldValue(field.type, stepData?.formData?.[field.name])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={ref} className='p-4 bg-white'>
      {/* 表单标题 */}
      <div className='text-center mb-4'>
        <h1 className='text-xl font-bold text-gray-900'>{metadata.title}</h1>
        {metadata.description && <p className='text-gray-500 mt-1 text-xs'>{metadata.description}</p>}
      </div>

      {/* 基本信息 */}
      <div className='mb-4'>{renderBasicFields()}</div>

      {/* 表格数据 */}
      {renderConfig.table && <div className='mb-4'>{renderTable()}</div>}

      {/* 流程确认 */}
      {renderConfig.processSteps && <div className='mb-4'>{renderProcessSteps()}</div>}

      {/* 打印样式 */}
      <style type='text/css' media='print'>{`
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .process-step {
            break-inside: avoid;
          }
          .step-content {
            margin-bottom: 0.5rem;
          }
          table { 
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 4px !important;
          }
          h1 {
            font-size: 16px !important;
            margin-bottom: 8px !important;
          }
          h2 {
            font-size: 14px !important;
            margin-bottom: 4px !important;
          }
          p {
            margin: 0 !important;
          }
          .mb-4 {
            margin-bottom: 8px !important;
          }
          .gap-2 {
            gap: 4px !important;
          }
          .py-1 {
            padding-top: 2px !important;
            padding-bottom: 2px !important;
          }
          .print-signature {
            max-width: 200px !important;
            max-height: 100px !important;
            object-fit: contain !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
})

PrintableTemplate.displayName = "PrintableTemplate"

export default PrintableTemplate
// ... [前面的 import 和接口定义保持不变]

const PrintableTemplate = forwardRef<HTMLDivElement, PrintableTemplateProps>(({ config, data }, ref) => {
  // ... [其他代码保持不变，直到 renderBasicFields 方法]

  // 渲染基本信息字段
  const renderBasicFields = () => {
    const basicInfo = ensureBasicInfo()

    // 检查是否使用分组配置
    if (!renderConfig.basicFields || typeof renderConfig.basicFields !== "object" || !("groups" in renderConfig.basicFields)) {
      // 处理普通字段数组
      const fieldArray = Array.isArray(renderConfig.basicFields) ? renderConfig.basicFields : []
      return (
        <div className='grid grid-cols-2 gap-2'>
          {fieldArray.map((field) => (
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

  // ... [其余代码保持不变]
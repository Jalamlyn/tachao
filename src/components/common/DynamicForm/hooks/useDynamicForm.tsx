import { useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { DynamicFormConfig, ValidationResult, ValidationContext } from "../types"
import message from "@/components/Message"
import { ValidationManager } from "../validation/ValidationManager"
import { debounce } from "lodash"

// 创建带防抖的 watch
export const createDebouncedWatch = (form: UseFormReturn<any>, delay = 300) => {
  return (fields: string | string[], callback: (values: any) => void) => {
    const debouncedCallback = debounce(callback, delay)
    
    const subscription = form.watch((value, { name }) => {
      if (Array.isArray(fields)) {
        if (fields.includes(name)) {
          debouncedCallback(value)
        }
      } else if (fields === name) {
        debouncedCallback(value)
      }
    })

    return subscription
  }
}

// 创建表格专用的 watch 工具函数
export const createTableWatch = (form: UseFormReturn<any>) => {
  return {
    // 监听整个表格数据
    onTableDataChange: (callback: (data: any[]) => void) => {
      const subscription = form.watch((value, { name }) => {
        if (name?.startsWith('tableData')) {
          callback(form.getValues('tableData'))
        }
      })
      return subscription
    },

    // 监听特定行
    onRowChange: (rowIndex: number, callback: (row: any) => void) => {
      const subscription = form.watch((value, { name }) => {
        if (name?.startsWith(`tableData.${rowIndex}`)) {
          callback(form.getValues(`tableData.${rowIndex}`))
        }
      })
      return subscription
    },

    // 监听特定单元格
    onCellChange: (rowIndex: number, field: string, callback: (value: any) => void) => {
      const subscription = form.watch((value, { name }) => {
        if (name === `tableData.${rowIndex}.${field}`) {
          callback(value)
        }
      })
      return subscription
    },

    // 批量更新工具
    batchUpdate: (updates: Array<{ path: string; value: any }>) => {
      form.batch(() => {
        updates.forEach(({ path, value }) => {
          form.setValue(path, value)
        })
      })
    },
  }
}

export const useDynamicForm = (
  config: DynamicFormConfig,
  initialValues?: any,
  onValuesChange?: (changedValues: any, allValues: any) => void
) => {
  const form = useForm({
    defaultValues: initialValues || {},
  })

  // 设置 watch 函数
  useEffect(() => {
    if (!config.watch) return

    let subscription: { unsubscribe: () => void } | null = null

    try {
      // 使用新的 watch API
      subscription = config.watch(form)

      if (!subscription || typeof subscription.unsubscribe !== 'function') {
        console.warn('Watch function should return a subscription with unsubscribe method')
      }
    } catch (error) {
      console.error('Error in watch setup:', error)
    }

    // 返回清理函数
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [config.watch, form])

  // 优化错误信息处理
  const formatValidationErrors = (errors: Record<string, any>): string[] => {
    return Object.entries(errors).map(([field, error]) => {
      // 获取字段配置以获取标签名
      const fieldConfig = config.renderConfig.basicFields.find((f) => f.name === field)
      const label = fieldConfig?.label || field

      // 优化错误信息格式
      const errorMessage = error.message || error
      return `${label}：${errorMessage}`
    })
  }

  // 表单级别校验函数
  const validateForm = useCallback(
    async (context?: ValidationContext): Promise<ValidationResult> => {
      try {
        // 首先执行 react-hook-form 的内置校验
        const isValid = await form.trigger()
        if (!isValid) {
          const formErrors = form.formState.errors
          const errorMessages = formatValidationErrors(formErrors)

          // 优化错误分类
          const categorizedErrors = {
            required: errorMessages.filter((msg) => msg.includes("不能为空")),
            invalid: errorMessages.filter(
              (msg) => msg.includes("格式错误") || msg.includes("无效") || msg.includes("不正确")
            ),
            other: errorMessages.filter(
              (msg) =>
                !msg.includes("不能为空") &&
                !msg.includes("格式错误") &&
                !msg.includes("无效") &&
                !msg.includes("不正确")
            ),
          }

          return {
            valid: false,
            errors: errorMessages,
            fields: Object.entries(formErrors).reduce((acc, [field, error]) => {
              acc[field] = error.message as string
              return acc
            }, {} as { [key: string]: string }),
            categorizedErrors,
          }
        }

        // 使用 ValidationManager 进行统一校验
        const values = form.getValues()
        const validationResult = await ValidationManager.validateForm(values, config)

        // 如果有字段级错误，设置到表单状态
        if (validationResult.fields) {
          Object.entries(validationResult.fields).forEach(([field, error]) => {
            form.setError(field, {
              type: "custom",
              message: error,
            })
          })
        }

        // 优化错误分类展示
        if (!validationResult.valid && validationResult.errors) {
          validationResult.categorizedErrors = {
            required: validationResult.errors.filter((msg) => msg.includes("不能为空")),
            invalid: validationResult.errors.filter(
              (msg) => msg.includes("格式错误") || msg.includes("无效") || msg.includes("不正确")
            ),
            other: validationResult.errors.filter(
              (msg) =>
                !msg.includes("不能为空") &&
                !msg.includes("格式错误") &&
                !msg.includes("无效") &&
                !msg.includes("不正确")
            ),
          }
        }

        return validationResult
      } catch (error) {
        console.error("Form validation error:", error)
        return {
          valid: false,
          errors: ["表单校验出错，请重试"],
          fields: {},
          categorizedErrors: {
            other: ["表单校验出错，请重试"],
          },
        }
      }
    },
    [config, form, config.renderConfig.basicFields]
  )

  const handleSubmit = useCallback(
    async (onSubmit: (values: any) => Promise<void>) => {
      try {
        const values = form.getValues()
        const validationResult = await ValidationManager.validateForm(values, config)

        if (!validationResult.valid) {
          // 如果校验失败，显示错误信息
          if (validationResult.errors && validationResult.errors.length > 0) {
            // 使用分类后的错误信息
            if (validationResult.categorizedErrors) {
              const { required, invalid, other } = validationResult.categorizedErrors
              if (required?.length) {
                message.error(
                  <div className='space-y-2'>
                    <div className='font-medium'>必填项未填写：</div>
                    {required.map((error, index) => (
                      <div key={index} className='ml-4'>
                        • {error}
                      </div>
                    ))}
                  </div>
                )
              }
              if (invalid?.length) {
                message.error(
                  <div className='space-y-2'>
                    <div className='font-medium'>格式错误：</div>
                    {invalid.map((error, index) => (
                      <div key={index} className='ml-4'>
                        • {error}
                      </div>
                    ))}
                  </div>
                )
              }
              if (other?.length) {
                message.error(
                  <div className='space-y-2'>
                    <div className='font-medium'>其他错误：</div>
                    {other.map((error, index) => (
                      <div key={index} className='ml-4'>
                        • {error}
                      </div>
                    ))}
                  </div>
                )
              }
            } else {
              message.error(
                <div className='space-y-2'>
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className='ml-4'>
                      • {error}
                    </div>
                  ))}
                </div>
              )
            }
          }
          return
        }

        // 如果有警告信息，显示警告提示
        if (validationResult.warnings && validationResult.warnings.length > 0) {
          const warningContent = (
            <div className='space-y-2'>
              <div className='font-medium'>警告：</div>
              {validationResult.warnings.map((warning, index) => (
                <div key={index} className='ml-4'>
                  • {warning}
                </div>
              ))}
              <div className='mt-4'>是否继续提交？</div>
            </div>
          )

          // 使用 message 组件显示警告
          message.warning(warningContent, 0)

          // 添加确认和取消按钮
          const confirmId = Math.random().toString(36).substr(2, 9)
          const confirmContent = (
            <div className='flex justify-end gap-2 mt-4'>
              <button
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                onClick={() => {
                  message.dismiss(confirmId)
                }}
              >
                取消
              </button>
              <button
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700'
                onClick={async () => {
                  message.dismiss(confirmId)
                  await onSubmit(values)
                }}
              >
                继续提交
              </button>
            </div>
          )

          message.info(
            <div>
              {warningContent}
              {confirmContent}
            </div>,
            {
              id: confirmId,
              duration: 0,
            }
          )
          return
        }

        // 提交表单
        await onSubmit(values)
      } catch (error) {
        console.error("Form submission error:", error)
        message.error(
          <div className='space-y-2'>
            <div className='font-medium'>提交表单失败</div>
            <div className='ml-4'>• 请检查网络连接后重试</div>
          </div>
        )
        throw error
      }
    },
    [config, form]
  )

  const setFieldValue = useCallback(
    (name: string, value: any) => {
      form.setValue(name, value)
    },
    [form]
  )

  const resetForm = useCallback(
    (values?: any) => {
      form.reset(values)
    },
    [form]
  )

  const validateField = useCallback(
    async (name: string) => {
      return form.trigger(name)
    },
    [form]
  )

  return {
    form,
    handleSubmit,
    setFieldValue,
    resetForm,
    validateField,
    validateForm,
  }
}
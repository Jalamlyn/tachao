# DynamicForm 高级特性示例

本文档提供了 DynamicForm 组件的高级特性和特殊场景的使用示例，作为对 complex-form-examples.md 的补充。

## 1. 上传组件高级配置

### 1.1 多文件上传与预览

```typescript
{
  name: "documents",
  label: "文档上传",
  type: "upload",
  required: true,
  uploadConfig: {
    uploadType: "file",
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    maxCount: 5,
    accept: ".pdf,.doc,.docx,.xlsx",
    // 自定义上传配置
    uploadConfig: {
      headers: {
        'X-Custom-Header': 'value'
      },
      withCredentials: true,
      customRequest: async (options) => {
        const { file, onProgress, onSuccess, onError } = options
        try {
          // 自定义上传逻辑
          const formData = new FormData()
          formData.append('file', file)

          const xhr = new XMLHttpRequest()
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded * 100) / event.total)
              onProgress({ percent })
            }
          }

          const uploadPromise = new Promise((resolve, reject) => {
            xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(xhr.response) : reject()
            xhr.onerror = () => reject()
          })

          const response = await uploadPromise
          onSuccess(response)
          return response
        } catch (error) {
          onError(error)
          throw error
        }
      }
    },
    // 预览配置
    previewConfig: {
      modalWidth: "80%",
      modalTitle: "文档预览"
    },
    // 下载配置
    downloadConfig: {
      method: "GET",
      headers: {
        'X-Download-Token': 'token'
      },
      timeout: 30000
    }
  }
}
1.2 图片上传与裁剪
{
  name: "productImages",
  label: "产品图片",
  type: "upload",
  uploadConfig: {
    uploadType: "image",
    multiple: true,
    maxSize: 5 * 1024 * 1024,
    maxCount: 9,
    accept: "image/*",
    thumbnail: true,
    // 图片裁剪配置
    cropOptions: {
      aspect: 16/9,
      quality: 0.8,
      width: 800,
      height: 450,
      modalTitle: "裁剪图片"
    },
    // 事件处理
    onSuccess: (fileInfo) => {
      console.log('Upload success:', fileInfo)
    },
    onError: (error) => {
      console.error('Upload error:', error)
    },
    onProgress: (percent) => {
      console.log('Upload progress:', percent)
    },
    onPreview: (file) => {
      console.log('Preview file:', file)
    }
  }
}
2. 签名组件完整配置
2.1 基础签名
{
  name: "signature",
  label: "签名确认",
  type: "signature",
  required: true,
  width: 500,
  height: 200,
  lineWidth: 2,
  lineColor: "#000000",
  backgroundColor: "#ffffff",
  className: "signature-pad",
  style: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px"
  },
  validators: [
    (value) => {
      if (!value) return "请签名"
      // 检查签名是否为空白
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.src = value
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0) return undefined
      }
      return "签名不能为空"
    }
  ]
}
2.2 高级签名配置
{
  name: "contractSignature",
  label: "合同签署",
  type: "signature",
  required: true,
  width: 800,
  height: 300,
  lineWidth: 3,
  lineColor: "#1c64f2",
  backgroundColor: "#f9fafb",
  // 自定义渲染
  render: ({ field, form, isEditable }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          请在下方签署您的姓名
        </span>
        <button
          type="button"
          onClick={() => field.onChange(null)}
          className="text-sm text-red-500"
        >
          清除签名
        </button>
      </div>
      <SignaturePad
        value={field.value}
        onChange={field.onChange}
        width={800}
        height={300}
        lineWidth={3}
        lineColor="#1c64f2"
        backgroundColor="#f9fafb"
        disabled={!isEditable}
      />
      {field.value && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              const link = document.createElement('a')
              link.download = 'signature.png'
              link.href = field.value
              link.click()
            }}
            className="text-sm text-blue-500"
          >
            下载签名
          </button>
        </div>
      )}
    </div>
  )
}
3. 自定义渲染示例
3.1 复杂自定义组件
{
  name: "customField",
  label: "自定义组件",
  type: "custom",
  render: ({ field, form, isEditable }) => {
    const [localValue, setLocalValue] = useState(field.value)
    const debouncedUpdate = useCallback(
      debounce((value) => {
        field.onChange(value)
      }, 300),
      []
    )

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={localValue || ''}
            onChange={(e) => {
              setLocalValue(e.target.value)
              debouncedUpdate(e.target.value)
            }}
            disabled={!isEditable}
            className="flex-1 rounded-md border-gray-300"
          />
          <button
            type="button"
            onClick={() => {
              // 自定义操作
            }}
            disabled={!isEditable}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            自定义操作
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {/* 自定义提示信息 */}
        </div>
      </div>
    )
  }
}
3.2 集成第三方组件
{
  name: "richText",
  label: "富文本编辑器",
  type: "custom",
  render: ({ field, form, isEditable }) => {
    return (
      <div className="w-full">
        <ReactQuill
          value={field.value || ''}
          onChange={(content) => {
            field.onChange(content)
          }}
          readOnly={!isEditable}
          modules={{
            toolbar: [
              [{ 'header': [1, 2, false] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{'list': 'ordered'}, {'list': 'bullet'}],
              ['link', 'image'],
              ['clean']
            ]
          }}
          formats={[
            'header',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet',
            'link', 'image'
          ]}
          className="h-[200px] mb-12"
        />
      </div>
    )
  }
}
4. 性能优化示例
4.1 大数据表格优化
{
  renderConfig: {
    table: {
      columns: [
        // 列配置
      ],
      // 虚拟滚动配置
      virtualScroll: {
        enabled: true,
        itemHeight: 48,
        overscan: 5
      },
      // 数据加载配置
      loadData: async (params) => {
        const { page, pageSize, filters, sorter } = params
        // 异步加载数据
        const response = await fetchTableData(params)
        return {
          data: response.data,
          total: response.total
        }
      },
      // 批量操作配置
      batchOperations: {
        enabled: true,
        actions: [
          {
            key: 'delete',
            label: '删除',
            confirm: true,
            onClick: async (selectedRows) => {
              // 处理批量删除
            }
          }
        ]
      }
    }
  }
}
4.2 表单性能优化
{
  // 字段依赖优化
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 使用防抖处理频繁变化
      const debouncedUpdate = debounce(() => {
        if (name === 'quantity' || name === 'price') {
          const quantity = form.getValues('quantity') || 0
          const price = form.getValues('price') || 0
          form.setValue('amount', quantity * price)
        }
      }, 300)

      debouncedUpdate()
    })

    return () => subscription.unsubscribe()
  },

  // 异步验证优化
  validate: async (values) => {
    const errors = []

    // 并行验证
    const validationPromises = [
      validateBusinessRules(values),
      validateExternalData(values),
      validateCalculations(values)
    ]

    const results = await Promise.all(validationPromises)

    results.forEach(result => {
      if (!result.valid) {
        errors.push(...result.errors)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
5. 多语言支持示例
{
  metadata: {
    title: {
      'zh-CN': '采购申请单',
      'en-US': 'Purchase Request Form'
    },
    description: {
      'zh-CN': '用于提交和审批采购申请',
      'en-US': 'For submitting and approving purchase requests'
    }
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: 'basic',
          title: {
            'zh-CN': '基本信息',
            'en-US': 'Basic Information'
          },
          fields: [
            {
              name: 'applicant',
              label: {
                'zh-CN': '申请人',
                'en-US': 'Applicant'
              },
              placeholder: {
                'zh-CN': '请输入申请人姓名',
                'en-US': 'Please enter applicant name'
              }
            }
          ]
        }
      ]
    }
  }
}
6. 主题定制示例
{
  theme: {
    // 颜色系统
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1'
      },
      // 其他颜色...
    },
    // 组件样式
    components: {
      input: {
        base: 'rounded-md border-gray-300 shadow-sm',
        focus: 'border-primary-500 ring-2 ring-primary-200',
        error: 'border-red-300 ring-2 ring-red-200'
      },
      button: {
        base: 'rounded-md font-medium',
        primary: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      },
      // 其他组件样式...
    },
    // 布局配置
    layout: {
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        4: '1rem',
        // 其他间距...
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px'
      }
    }
  }
}
7. 与其他组件集成示例
7.1 集成图表组件
{
  name: "salesChart",
  label: "销售统计",
  type: "custom",
  render: ({ field, form, isEditable }) => {
    const chartData = useMemo(() => {
      const tableData = form.getValues('tableData.sales') || []
      return {
        labels: tableData.map(item => item.date),
        datasets: [{
          label: '销售额',
          data: tableData.map(item => item.amount),
          borderColor: '#3b82f6',
          tension: 0.1
        }]
      }
    }, [form.watch('tableData.sales')])

    return (
      <div className="w-full h-[400px]">
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: '销售趋势图'
              }
            }
          }}
        />
      </div>
    )
  }
}
7.2 集成地图组件
{
  name: "location",
  label: "位置信息",
  type: "custom",
  render: ({ field, form, isEditable }) => {
    return (
      <div className="space-y-4">
        <div className="h-[400px]">
          <MapComponent
            value={field.value}
            onChange={field.onChange}
            readonly={!isEditable}
            zoom={12}
            markers={[
              {
                position: field.value,
                draggable: isEditable
              }
            ]}
            onMarkerDrag={(event) => {
              field.onChange({
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              })
            }}
          />
        </div>
        {field.value && (
          <div className="text-sm text-gray-500">
            经度: {field.value.lng}, 纬度: {field.value.lat}
          </div>
        )}
      </div>
    )
  }
}
这些示例展示了 DynamicForm 组件的高级特性和特殊场景的使用方法。开发者可以根据实际需求，参考这些示例来实现更复杂的表单功能。
```

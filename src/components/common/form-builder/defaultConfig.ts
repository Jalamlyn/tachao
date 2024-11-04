import { FormBuilderConfig } from './types'
import { getCurrentAccountInfo } from '@/service/apis/user'

export const getDefaultConfig = async (): Promise<Partial<FormBuilderConfig>> => {
  // 获取当前用户信息用于设置默认值
  const currentUser = await getCurrentAccountInfo()

  return {
    mode: 'create',
    layout: {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    },
    basicInfo: {
      title: '基本信息',
      fields: [
        {
          type: 'custom',
          label: '订单编号',
          name: 'orderNumber',
          component: 'OrderNumberField',
          props: {
            prefix: 'ORDER',
            disabled: true
          },
          span: 12,
          printable: true,
          rules: [
            { required: true, message: '订单编号不能为空' }
          ]
        },
        {
          type: 'text',
          label: '创建人',
          name: 'creator',
          defaultValue: currentUser?.name || currentUser?.email || '',
          disabled: true,
          span: 12,
          printable: true
        },
        {
          type: 'date',
          label: '创建日期',
          name: 'createDate',
          defaultValue: new Date().toISOString(),
          disabled: true,
          span: 12,
          printable: true
        }
      ]
    },
    print: {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      header: {
        height: 20,
        content: (
          <div className="text-center text-lg font-bold py-4">
            {/* 可以在这里添加公司Logo等 */}
            系统表单
          </div>
        )
      },
      footer: {
        height: 20,
        content: (
          <div className="text-center text-sm text-gray-500 py-4">
            第 {'{currentPage}'} 页 / 共 {'{totalPages}'} 页
          </div>
        )
      }
    }
  }
}

export const mergeConfig = (defaultConfig: Partial<FormBuilderConfig>, userConfig: FormBuilderConfig): FormBuilderConfig => {
  // 合并基本信息字段
  const mergedBasicInfoFields = [
    ...(defaultConfig.basicInfo?.fields || []),
    ...(userConfig.basicInfo?.fields || [])
  ]

  // 移除重复的字段（以name为唯一标识）
  const uniqueFields = mergedBasicInfoFields.reduce((acc: any[], current) => {
    const exists = acc.find(item => item.name === current.name)
    if (!exists) {
      acc.push(current)
    }
    return acc
  }, [])

  return {
    ...defaultConfig,
    ...userConfig,
    basicInfo: {
      ...defaultConfig.basicInfo,
      ...userConfig.basicInfo,
      fields: uniqueFields
    },
    // 保留用户配置的其他部分
    tables: userConfig.tables,
    process: userConfig.process,
    handlers: {
      ...defaultConfig.handlers,
      ...userConfig.handlers
    },
    print: {
      ...defaultConfig.print,
      ...userConfig.print
    }
  }
}
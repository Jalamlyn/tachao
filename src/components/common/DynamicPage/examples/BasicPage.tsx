import React from 'react'
import { PageRenderer } from '../components/base/PageRenderer'
import { useComponents } from '../hooks/useComponents'
import type { PageConfig } from '../types/page'

const exampleConfig: PageConfig = {
  metadata: {
    title: "基础页面示例",
    description: "展示 DynamicPage 的基本用法",
    permissions: {
      edit: true,
      print: true
    }
  },
  layout: {
    type: "grid",
    grid: {
      cols: { base: 1, md: 2, lg: 3 },
      gap: { base: 4, md: 6 }
    }
  },
  content: [
    {
      type: "container",
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: 4
        }
      },
      children: [
        {
          type: "Card",
          props: {
            className: "p-4",
            children: [
              {
                type: "h2",
                props: {
                  className: "text-xl font-bold mb-2",
                  children: "搜索"
                }
              },
              {
                type: "Input",
                props: {
                  placeholder: "请输入搜索内容",
                  className: "w-full"
                }
              }
            ]
          }
        }
      ]
    },
    {
      type: "Card",
      props: {
        className: "p-4",
        children: "内容区域 1"
      }
    },
    {
      type: "Card",
      props: {
        className: "p-4",
        children: "内容区域 2"
      }
    }
  ],
  state: {
    initial: {
      searchText: ""
    }
  }
}

export const BasicPage: React.FC = () => {
  const { components } = useComponents()
  
  return (
    <PageRenderer
      config={exampleConfig}
      components={components}
      onEdit={() => console.log("编辑")}
      onPrint={() => console.log("打印")}
    />
  )
}

export default BasicPage
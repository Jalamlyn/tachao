import React from 'react'
import { PageRenderer } from '../components/base/PageRenderer'
import { useComponents } from '../hooks/useComponents'
import { Card } from '@nextui-org/react'
import type { PageConfig } from '../types/page'

// 自定义卡片组件
const CustomCard: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => (
  <Card className="p-4">
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    {children}
  </Card>
)

// 动态内容组件
const DynamicContent: React.FC<{
  data: any[]
}> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {data.map((item, index) => (
      <Card key={index} className="p-4">
        {item.content}
      </Card>
    ))}
  </div>
)

const exampleConfig: PageConfig = {
  metadata: {
    title: "自定义渲染示例",
    description: "展示如何使用自定义渲染功能",
    permissions: {
      edit: true,
      print: true
    }
  },
  layout: {
    type: "grid",
    grid: {
      cols: { base: 1, md: 2 },
      gap: { base: 4, md: 6 }
    }
  },
  content: [
    // 1. 直接使用 JSX
    {
      type: "Card",
      render: (
        <CustomCard title="直接 JSX 渲染">
          <p>这是使用 JSX 直接渲染的内容</p>
        </CustomCard>
      )
    },
    // 2. 使用渲染函数
    {
      type: "Card",
      render: ({ state, computed }) => (
        <CustomCard title="动态渲染">
          <div className="space-y-2">
            <p>计数器: {state.counter}</p>
            <p>双倍值: {computed.doubleCounter}</p>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => state.setState('counter', state.counter + 1)}
            >
              增加
            </button>
          </div>
        </CustomCard>
      )
    },
    // 3. 条件渲染
    {
      type: "Card",
      render: ({ state }) => 
        state.showExtra ? (
          <CustomCard title="额外内容">
            <p>这是额外显示的内容</p>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded mt-2"
              onClick={() => state.setState('showExtra', false)}
            >
              隐藏
            </button>
          </CustomCard>
        ) : (
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => state.setState('showExtra', true)}
          >
            显示额外内容
          </button>
        )
    },
    // 4. 动态列表
    {
      type: "container",
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: 4
        }
      },
      render: ({ state }) => (
        <DynamicContent data={state.items} />
      )
    }
  ],
  state: {
    initial: {
      counter: 0,
      showExtra: false,
      items: [
        { content: "项目 1" },
        { content: "项目 2" },
        { content: "项目 3" }
      ]
    },
    computed: {
      doubleCounter: "return state.counter * 2"
    }
  }
}

export const CustomRenderPage: React.FC = () => {
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

export default CustomRenderPage
import React from 'react'
import { PageRenderer } from '../components/base/PageRenderer'
import { useComponents } from '../hooks/useComponents'
import { usePageGenerator } from '../hooks/usePageGenerator'
import { Button } from '@nextui-org/react'

export const AIGeneratedPage: React.FC = () => {
  const { components } = useComponents()
  const { loading, error, config, generatePage } = usePageGenerator()
  
  const handleGenerate = async () => {
    await generatePage(`
      创建一个客户管理页面，包含：
      1. 顶部搜索栏
      2. 客户列表
      3. 数据统计
    `)
  }
  
  if (loading) {
    return <div>生成页面中...</div>
  }
  
  if (error) {
    return <div>生成失败: {error}</div>
  }
  
  return (
    <div>
      <div className="mb-4">
        <Button
          color="primary"
          onClick={handleGenerate}
          disabled={loading}
        >
          生成页面
        </Button>
      </div>
      
      {config && (
        <PageRenderer
          config={config}
          components={components}
          onEdit={() => console.log("编辑")}
          onPrint={() => console.log("打印")}
        />
      )}
    </div>
  )
}

export default AIGeneratedPage
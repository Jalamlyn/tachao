import React from 'react'
import { Card, CardBody } from '@nextui-org/react'
import { ChatPanel } from './ChatPanel'
import { useAIEditor } from '../../../hooks/useAIEditor'
import { PageRenderer, useComponents } from '@/components/common/DynamicPage'

interface AIEditorProps {
  onConfigChange?: (config: any) => void
}

export const AIEditor: React.FC<AIEditorProps> = ({
  onConfigChange
}) => {
  const { components } = useComponents()
  const {
    messages,
    pageConfig,
    isGenerating,
    handleSendMessage,
    handleConfigUpdate
  } = useAIEditor({
    onConfigChange
  })

  return (
    <div className="flex h-full">
      {/* 左侧：AI 对话区 */}
      <div className="w-1/3 border-r">
        <ChatPanel
          messages={messages}
          isGenerating={isGenerating}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* 右侧：预览区 */}
      <div className="flex-1">
        <Card className="h-full">
          <CardBody>
            {pageConfig ? (
              <PageRenderer
                config={pageConfig}
                components={components}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>开始与 AI 对话，生成您的页面</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default AIEditor
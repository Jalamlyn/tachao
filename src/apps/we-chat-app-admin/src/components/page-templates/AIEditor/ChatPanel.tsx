import React, { useState } from 'react'
import {
  Card,
  CardBody,
  CardFooter,
  Input,
  Button,
  ScrollShadow,
  Avatar,
} from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
  timestamp: string
}

interface ChatPanelProps {
  messages: Message[]
  isGenerating: boolean
  onSendMessage: (message: string) => void
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isGenerating,
  onSendMessage
}) => {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim() || isGenerating) return
    onSendMessage(input)
    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="h-full">
      <CardBody className="p-0">
        {/* AI 助手介绍 */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar src={mo2} className="w-10 h-10" />
            <div>
              <h3 className="font-medium">AI 页面助手</h3>
              <p className="text-sm text-gray-500">
                我可以帮您创建和优化页面
              </p>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <ScrollShadow className="h-[calc(100vh-280px)]">
          <div className="p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${
                    message.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'
                  }`}
                >
                  <Avatar
                    src={message.role === 'assistant' ? mo2 : user}
                    className="w-8 h-8 flex-shrink-0"
                  />
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.role === 'assistant'
                        ? 'bg-default-100'
                        : 'bg-primary text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-50 mt-1 block">
                      {message.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-gray-500"
              >
                <Icon icon="eos-icons:loading" className="w-5 h-5 animate-spin" />
                <span>AI 正在生成...</span>
              </motion.div>
            )}
          </div>
        </ScrollShadow>
      </CardBody>

      {/* 输入区域 */}
      <CardFooter className="p-4 border-t">
        <div className="flex gap-2 w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="描述您想要的页面，例如：创建一个数据分析仪表盘..."
            disabled={isGenerating}
          />
          <Button
            isIconOnly
            color="primary"
            onClick={handleSend}
            isDisabled={!input.trim() || isGenerating}
          >
            <Icon icon="solar:arrow-up-bold" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChatPanel
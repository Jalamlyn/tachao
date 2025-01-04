import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface AITutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AITutorialModal: React.FC<AITutorialModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size='3xl'
      scrollBehavior='inside'
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <h3 className='text-lg font-semibold'>如何与AI助手对话</h3>
          <p className='text-small text-default-500'>了解如何更好地描述您的需求，获得更好的回答</p>
        </ModalHeader>
        <ModalBody className='space-y-6'>
          {/* 基础规则 */}
          <div className='space-y-2'>
            <h4 className='text-medium font-semibold'>基本原则</h4>
            <div className='space-y-2 text-small text-default-600'>
              <p>1. 清晰具体：描述要尽可能具体，避免模糊的表述</p>
              <p>2. 提供上下文：包含必要的背景信息</p>
              <p>3. 分步骤提问：复杂问题可以拆分成多个步骤</p>
            </div>
          </div>

          {/* 提示词模板 */}
          <div className='space-y-2'>
            <h4 className='text-medium font-semibold'>常用提示词模板</h4>
            <div className='grid grid-cols-1 gap-4'>
              {/* 代码相关 */}
              <div className='rounded-lg border border-default-200 p-4'>
                <h5 className='font-medium mb-2'>代码开发类</h5>
                <div className='space-y-2 text-small text-default-600'>
                  <div className='bg-default-50 p-2 rounded'>
                    <p className='font-medium'>功能开发:</p>
                    <p className='text-default-500'>
                      请帮我实现[具体功能]，要求如下：<br/>
                      1. 功能描述：[详细描述]<br/>
                      2. 技术要求：[使用的技术栈]<br/>
                      3. 其他要求：[其他具体要求]
                    </p>
                  </div>
                  
                  <div className='bg-default-50 p-2 rounded'>
                    <p className='font-medium'>代码优化:</p>
                    <p className='text-default-500'>
                      请帮我优化以下代码，重点关注：<br/>
                      1. 性能优化<br/>
                      2. 代码可读性<br/>
                      3. 最佳实践<br/>
                      ```[您的代码]```
                    </p>
                  </div>
                </div>
              </div>

              {/* 问题解决类 */}
              <div className='rounded-lg border border-default-200 p-4'>
                <h5 className='font-medium mb-2'>问题解决类</h5>
                <div className='space-y-2 text-small text-default-600'>
                  <div className='bg-default-50 p-2 rounded'>
                    <p className='font-medium'>Bug修复:</p>
                    <p className='text-default-500'>
                      我遇到了[具体问题]，详细信息如下：<br/>
                      1. 问题现象：[描述问题]<br/>
                      2. 期望结果：[期望的正确行为]<br/>
                      3. 相关代码：```[代码片段]```
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 使用技巧 */}
          <div className='space-y-2'>
            <h4 className='text-medium font-semibold'>实用技巧</h4>
            <div className='space-y-3 text-small text-default-600'>
              <div className='flex items-start gap-2'>
                <Icon icon='solar:lightbulb-linear' className='text-warning mt-1' />
                <p>使用代码块：将代码用 ``` 包裹，可以保持代码格式</p>
              </div>
              <div className='flex items-start gap-2'>
                <Icon icon='solar:lightbulb-linear' className='text-warning mt-1' />
                <p>分步骤提问：复杂问题可以分多次对话，逐步完善</p>
              </div>
              <div className='flex items-start gap-2'>
                <Icon icon='solar:lightbulb-linear' className='text-warning mt-1' />
                <p>及时反馈：如果回答不够准确，可以继续追问或提供更多信息</p>
              </div>
            </div>
          </div>

          {/* 快捷键 */}
          <div className='space-y-2'>
            <h4 className='text-medium font-semibold'>快捷键</h4>
            <div className='grid grid-cols-2 gap-4 text-small'>
              <div className='flex items-center justify-between p-2 bg-default-50 rounded'>
                <span>发送消息</span>
                <kbd className='px-2 py-1 bg-default-100 rounded'>Enter</kbd>
              </div>
              <div className='flex items-center justify-between p-2 bg-default-50 rounded'>
                <span>换行</span>
                <kbd className='px-2 py-1 bg-default-100 rounded'>Shift + Enter</kbd>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onPress={onClose}
          >
            明白了
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
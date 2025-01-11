import React from "react"
import { Icon } from "@iconify/react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Divider } from "@nextui-org/react"

// 错误提示组件
export const ErrorPrompt = ({ error, onFix }) => {
  // 解析错误信息
  const parseError = (error) => {
    if (error.moduleErrors) {
      return {
        missingModules: error.moduleErrors.missingModules,
        dependentModules: error.moduleErrors.dependentModules,
      }
    }
    return null
  }

  const errorInfo = parseError(error)
  if (!errorInfo) return null

  return (
    <div className='p-4 bg-danger-50 rounded-lg mb-4'>
      <div className='flex items-start gap-3'>
        <Icon icon='mdi:alert-circle' className='w-5 h-5 text-danger mt-0.5' />
        <div className='flex-1'>
          <h4 className='font-medium text-danger'>检测到缺失模块</h4>
          <div className='mt-2 space-y-1 text-sm text-danger-600'>
            <p>缺失模块:</p>
            <ul className='list-disc pl-4'>
              {errorInfo.missingModules.map((module, index) => (
                <li key={index}>
                  <code>{module}</code>
                </li>
              ))}
            </ul>
            <p>依赖这些模块的组件:</p>
            <ul className='list-disc pl-4'>
              {errorInfo.dependentModules.map((module, index) => (
                <li key={index}>
                  <code>{module}</code>
                </li>
              ))}
            </ul>
          </div>
          <Button
            color='primary'
            variant='flat'
            size='sm'
            className='mt-3'
            startContent={<Icon icon='mdi:wrench' className='w-4 h-4' />}
            onClick={() => onFix(errorInfo)}
          >
            修复此问题
          </Button>
        </div>
      </div>
    </div>
  )
}

// 发布模态框组件
export const PublishModal = ({ isOpen, onClose, appId }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='4xl'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:check-circle' className='w-6 h-6 text-success' />
            <span>发布成功</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-medium mb-2'>访问应用</h3>
              <div className='flex items-center gap-2 p-2 bg-default-100 rounded'>
                <code className='text-sm'>/app-run/{appId}</code>
                <Button
                  size='sm'
                  variant='flat'
                  onClick={() => window.open(`/app-run/${appId}`, "_blank")}
                  startContent={<Icon icon='mdi:open-in-new' className='w-4 h-4' />}
                >
                  查看应用
                </Button>
              </div>
            </div>

            <Divider />

            <div>
              <h3 className='text-lg font-medium mb-2'>分享应用</h3>
              <p className='text-sm text-default-600 mb-3'>
                将您的应用发布为模板，其他用户可以基于您的模板快速创建新应用。
              </p>
              <Button
                color='secondary'
                variant='flat'
                startContent={<Icon icon='fluent:book-template-20-filled' className='w-4 h-4' />}
                onClick={() => {
                  onClose()
                  // 这里可以触发发布模板的操作
                  document.querySelector('[aria-label="发布模板"]')?.click()
                }}
              >
                发布为模板
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// 发布模板模态框组件
export const PublishTemplateModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>发布模板成功</ModalHeader>
        <ModalBody>
          <p>模板已成功发布到平台！其他用户现在可以使用此模板创建新应用。</p>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// 回滚确认模态框组件
export const RollbackModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>确认回滚</ModalHeader>
        <ModalBody>
          <p>确定要回滚到最近一次发布的版本吗？此操作将丢失当前未发布的更改。</p>
        </ModalBody>
        <ModalFooter>
          <Button color='default' variant='light' onPress={onClose}>
            取消
          </Button>
          <Button color='warning' onPress={onConfirm}>
            确认回滚
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

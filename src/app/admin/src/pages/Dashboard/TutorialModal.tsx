import {
  Card,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import message from "@/components/Message"

const TutorialModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  const promptText = `我想创建一个待办事项应用，需要以下功能：

1. 基本功能需求：
- 支持添加、编辑、删除待办事项
- 可以设置任务优先级和截止日期
- 支持任务分类和标签
- 可以标记任务完成状态

2. 界面要求：
- 清晰简洁的界面设计
- 响应式布局，支持移动端
- 使用 NextUI 组件库
- 良好的视觉反馈

3. 数据存储：
- 使用 getMetadata 和 setMetadata API 存储数据
- 支持数据的本地缓存

4. 其他要求：
- 添加简单的数据统计
- 支持任务搜索和筛选
- 添加任务提醒功能

请帮我实现这个应用，生成完整的代码。`

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText)
    message.success("提示词已复制到剪贴板")
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='3xl' scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <h3 className='text-xl font-bold'>开始创建您的第一个应用</h3>
          <p className='text-sm text-default-500'>复制下面的提示词到AI对话框中，开始创建应用</p>
        </ModalHeader>
        <ModalBody>
          <div className='space-y-6'>
            <Card>
              <div className='relative'>
                <pre className='p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm'>{promptText}</pre>
                <Button
                  className='absolute top-2 right-2'
                  size='sm'
                  color='primary'
                  variant='flat'
                  startContent={<Icon icon='mdi:content-copy' />}
                  onClick={handleCopy}
                >
                  复制提示词
                </Button>
              </div>
            </Card>

            <div className='flex items-center justify-between gap-4 p-4 bg-primary-50 rounded-lg'>
              <div className='flex-1'>
                <h4 className='font-medium mb-1'>准备好了吗？</h4>
                <p className='text-sm text-default-600'>
                  点击下方按钮进入应用开发界面，将刚才复制的提示词粘贴到AI对话框中，开始创建您的第一个应用。
                </p>
              </div>
              <Button
                color='primary'
                startContent={<Icon icon='solar:rocket-linear' />}
                onPress={() => navigate("/admin/apps")}
              >
                开始创建
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' variant='light' onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TutorialModal
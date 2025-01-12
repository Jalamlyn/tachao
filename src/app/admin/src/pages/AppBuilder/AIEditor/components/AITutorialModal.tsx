import React from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Tabs,
  Tab,
} from "@nextui-org/react"
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
      classNames={{
        wrapper: "items-start mt-4",
        base: "max-h-[90vh]",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon icon='solar:magic-stick-3-linear' className='w-6 h-6 text-primary' />
            <div>
              <h3 className='text-lg font-semibold'>如何与AI助手对话</h3>
              <p className='text-small text-default-500'>了解如何更好地描述您的需求，获得更好的回答</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <Tabs 
            aria-label="Tutorial sections" 
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-6",
              cursor: "w-full",
            }}
          >
            <Tab
              key="basics"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:document-text-linear" className="w-4 h-4"/>
                  <span>基本原则</span>
                </div>
              }
            >
              <Card className='border-none shadow-small'>
                <CardBody className='space-y-4'>
                  <div className='space-y-3 text-small text-default-600'>
                    <div className='flex items-start gap-2'>
                      <div className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                        <span className='text-primary font-medium'>1</span>
                      </div>
                      <p>清晰具体：描述要尽可能具体，避免模糊的表述</p>
                    </div>
                    <div className='flex items-start gap-2'>
                      <div className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                        <span className='text-primary font-medium'>2</span>
                      </div>
                      <p>提供上下文：包含必要的背景信息</p>
                    </div>
                    <div className='flex items-start gap-2'>
                      <div className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                        <span className='text-primary font-medium'>3</span>
                      </div>
                      <p>分步骤提问：复杂问题可以拆分成多个步骤</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab
              key="best-practices"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:star-linear" className="w-4 h-4"/>
                  <span>最佳实践</span>
                </div>
              }
            >
              <div className="space-y-4">
                <Card className="bg-warning-50/50">
                  <CardBody>
                    <h5 className="font-medium flex items-center gap-2">
                      <Icon icon="solar:lightbulb-bold" className="text-warning"/>
                      处理复杂需求的最佳实践
                    </h5>
                    <div className="mt-2 space-y-2">
                      <p>对于复杂的需求或难以确定的问题:</p>
                      <div className="pl-4 space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-warning">1</span>
                          </div>
                          <p>先使用 @pm 与产品经理讨论,明确需求范围和实现方案</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-warning">2</span>
                          </div>
                          <p>达成共识后,使用 @mo 请工程师进行具体实现</p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-default-100 rounded-lg">
                        <p className="font-medium mb-2">示例:</p>
                        <p className="text-sm">❌ 直接告诉工程师: "我需要一个数据分析dashboard"</p>
                        <p className="text-sm">✅ 先问产品经理: "@pm 我需要做一个数据分析dashboard,应该包含哪些核心指标和图表?"</p>
                        <p className="text-sm">✅ 再找工程师: "@mo 请帮我实现一个包含销售趋势、用户增长等指标的dashboard"</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab
              key="screenshots"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:gallery-linear" className="w-4 h-4"/>
                  <span>使用截图</span>
                </div>
              }
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Card className='bg-default-50 border-none'>
                  <CardBody className='min-h-[180px]'>
                    <h5 className='font-medium mb-3 flex items-center gap-2'>
                      <Icon icon='solar:lightbulb-linear' className='text-warning' />
                      为什么要使用截图？
                    </h5>
                    <ul className='list-disc pl-4 space-y-2 text-small text-default-600'>
                      <li>直观展示问题：一图胜千言，截图可以清晰展示界面问题</li>
                      <li>减少描述歧义：避免文字描述可能产生的误解</li>
                      <li>提高沟通效率：帮助AI更快理解您的需求</li>
                    </ul>
                  </CardBody>
                </Card>

                <Card className='bg-default-50 border-none'>
                  <CardBody className='space-y-3'>
                    <h5 className='font-medium flex items-center gap-2'>
                      <Icon icon='solar:keyboard-linear' className='text-primary' />
                      截图快捷键
                    </h5>
                    <div className='space-y-3 text-small text-default-600'>
                      <div>
                        <p className='font-medium mb-1'>Windows:</p>
                        <div className='flex items-center gap-2 bg-default-100 p-2 rounded-lg'>
                          <kbd className='px-2 py-1 bg-white rounded shadow-sm'>Win</kbd>
                          <span>+</span>
                          <kbd className='px-2 py-1 bg-white rounded shadow-sm'>Shift</kbd>
                          <span>+</span>
                          <kbd className='px-2 py-1 bg-white rounded shadow-sm'>S</kbd>
                        </div>
                      </div>
                      <div>
                        <p className='font-medium mb-1'>Mac:</p>
                        <div className='flex items-center gap-2 bg-default-100 p-2 rounded-lg'>
                          <kbd className='px-2 py-1 bg-white rounded shadow-sm'>⌘</kbd>
                          <span>+</span>
                          <kbd className='px-2 py-1 bg-white rounded shadow-sm'>Shift</kbd>
                          <span>+</span>
                          <kbd className='px-2 py-1 bg-white rounded shadow-sm'>4</kbd>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              <Card className='bg-default-50 border-none mt-4'>
                <CardBody>
                  <h5 className='font-medium mb-3 flex items-center gap-2'>
                    <Icon icon='solar:star-linear' className='text-warning' />
                    截图最佳实践
                  </h5>
                  <ul className='list-disc pl-4 space-y-2 text-small text-default-600'>
                    <li>截取完整的问题区域，包含必要的上下文信息</li>
                    <li>对于UI问题，建议包含整个组件或页面的截图</li>
                    <li>如果是错误提示，确保包含错误信息和相关代码</li>
                    <li>可以使用箭头或标注工具突出关键区域</li>
                    <li>保持截图清晰，避免模糊或像素过低</li>
                  </ul>
                </CardBody>
              </Card>
            </Tab>

            <Tab
              key="templates"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:chat-square-code-linear" className="w-4 h-4"/>
                  <span>提示词模板</span>
                </div>
              }
            >
              <div className='space-y-4'>
                <Card className='bg-default-50 border-none'>
                  <CardBody className='space-y-3'>
                    <h5 className='font-medium flex items-center gap-2'>
                      <Icon icon='solar:brush-linear' className='text-success' />
                      UI美化类
                    </h5>
                    <div className='space-y-3'>
                      <Card className='bg-white border-none'>
                        <CardBody>
                          <p className='font-medium mb-2'>整体UI美化:</p>
                          <div className='pl-4 space-y-1 text-default-500'>
                            请帮我优化以下界面的设计：
                            <br />
                            1. 设计风格：[现代简约/科技感/商务等]
                            <br />
                            2. 色彩方案：[描述期望的配色]
                            <br />
                            3. 布局优化：[描述布局需求]
                            <br />
                            4. 重点关注：[用户体验/视觉效果/品牌一致性等]
                          </div>
                        </CardBody>
                      </Card>

                      <Card className='bg-white border-none'>
                        <CardBody>
                          <p className='font-medium mb-2'>组件样式优化:</p>
                          <div className='pl-4 space-y-1 text-default-500'>
                            请优化以下组件的样式：
                            <br />
                            1. 组件类型：[按钮/卡片/表单等]
                            <br />
                            2. 视觉效果：[阴影/圆角/渐变等]
                            <br />
                            3. 交互反馈：[悬停/点击效果]
                            <br />
                            4. 响应式适配：[不同设备的展示效果]
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </CardBody>
                </Card>

                <Card className='bg-default-50 border-none'>
                  <CardBody>
                    <h5 className='font-medium flex items-center gap-2'>
                      <Icon icon='solar:bug-linear' className='text-danger' />
                      问题解决类
                    </h5>
                    <Card className='bg-white border-none mt-3'>
                      <CardBody>
                        <p className='font-medium mb-2'>Bug修复:</p>
                        <div className='pl-4 space-y-1 text-default-500'>
                          我遇到了[具体问题]，详细信息如下：
                          <br />
                          1. 问题现象：[描述问题]
                          <br />
                          2. 期望结果：[期望的正确行为]
                          <br />
                          3. 相关代码：```[代码片段]```
                        </div>
                      </CardBody>
                    </Card>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab
              key="shortcuts"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:keyboard-linear" className="w-4 h-4"/>
                  <span>快捷键</span>
                </div>
              }
            >
              <div className='space-y-4'>
                <Card className='border-none shadow-small'>
                  <CardBody className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4 text-small'>
                      <div className='flex items-center justify-between p-3 bg-default-50 rounded-lg'>
                        <span>发送消息</span>
                        <kbd className='px-3 py-1 bg-white rounded shadow-sm font-medium'>Enter</kbd>
                      </div>
                      <div className='flex items-center justify-between p-3 bg-default-50 rounded-lg'>
                        <span>换行</span>
                        <div className='flex items-center gap-2'>
                          <kbd className='px-3 py-1 bg-white rounded shadow-sm font-medium'>Shift</kbd>
                          <span>+</span>
                          <kbd className='px-3 py-1 bg-white rounded shadow-sm font-medium'>Enter</kbd>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className='border-none shadow-small'>
                  <CardBody>
                    <div className='space-y-3 text-small text-default-600'>
                      <div className='flex items-start gap-2 bg-default-50 p-3 rounded-lg'>
                        <Icon icon='solar:code-square-linear' className='text-primary mt-1 flex-shrink-0' />
                        <p>使用代码块：将代码用 ``` 包裹，可以保持代码格式</p>
                      </div>
                      <div className='flex items-start gap-2 bg-default-50 p-3 rounded-lg'>
                        <Icon icon='bi:bar-chart-steps' className='text-primary mt-1 flex-shrink-0' />
                        <p>分步骤提问：复杂问题可以分多次对话，逐步完善</p>
                      </div>
                      <div className='flex items-start gap-2 bg-default-50 p-3 rounded-lg'>
                        <Icon icon='solar:chat-round-dots-linear' className='text-primary mt-1 flex-shrink-0' />
                        <p>及时反馈：如果回答不够准确，可以继续追问或提供更多信息</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onPress={onClose}
            className='w-full sm:w-auto'
            startContent={<Icon icon='solar:check-circle-linear' className='w-5 h-5' />}
          >
            明白了
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
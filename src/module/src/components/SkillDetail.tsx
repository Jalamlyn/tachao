import { context } from "@/lib/context"

const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
  ReactMarkdown,
  remarkGfm,
} = context

const {
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Progress,
  Card,
  CardBody,
  Spinner,
} = NextUI
const { motion } = FramerMotion

const skillStore = await wpm.import("store_skill")

const SkillDetail = observer(({ skill, isOpen, onClose }) => {
  if (!skill) return null

  const handleStartMatching = async () => {
    try {
      api.log.info("点击开始匹配按钮", {
        skillId: skill.id,
        skillName: skill.name,
      })

      await skillStore.startMatching(skill.id)
      onClose()
    } catch (error) {
      api.log.error("开始匹配失败", {
        skillId: skill.id,
        error: error.message,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='2xl' scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            <Icon icon={skill.icon} className='w-6 h-6 text-pink-500' />
            {skill.name}
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <Chip
                variant='flat'
                color='primary'
                className='bg-pink-100 text-pink-600'
                startContent={<Icon icon='solar:tag-bold-duotone' className='w-4 h-4' />}
              >
                {skill.category}
              </Chip>
              <div className='flex items-center gap-2'>
                <Icon icon='solar:users-group-rounded-bold-duotone' className='w-4 h-4 text-default-400' />
                <span className='text-sm text-default-400'>{skill.users}人已掌握</span>
              </div>
            </div>

            <div className='space-y-2'>
              <h3 className='font-medium'>技能描述</h3>
              <div className='prose prose-pink max-w-none dark:prose-invert'>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className='text-2xl font-bold mb-4' {...props} />,
                    h2: ({ node, ...props }) => <h2 className='text-xl font-bold mb-3' {...props} />,
                    h3: ({ node, ...props }) => <h3 className='text-lg font-bold mb-2' {...props} />,
                    p: ({ node, ...props }) => <p className='mb-4 text-default-600' {...props} />,
                    ul: ({ node, ...props }) => <ul className='list-disc pl-5 mb-4' {...props} />,
                    ol: ({ node, ...props }) => <ol className='list-decimal pl-5 mb-4' {...props} />,
                    li: ({ node, ...props }) => <li className='mb-1' {...props} />,
                    code: ({ node, inline, ...props }) =>
                      inline ? (
                        <code className='px-1 py-0.5 bg-default-100 rounded text-pink-500' {...props} />
                      ) : (
                        <code className='block p-4 bg-default-100 rounded-lg overflow-x-auto' {...props} />
                      ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className='border-l-4 border-pink-200 pl-4 italic' {...props} />
                    ),
                  }}
                >
                  {skill.description}
                </ReactMarkdown>
              </div>
            </div>

            <div className='space-y-2'>
              <h3 className='font-medium'>技能评分</h3>
              <Progress
                size='md'
                radius='full'
                value={skill.rating * 20}
                color='primary'
                showValueLabel={true}
                label='综合评分'
                classNames={{
                  base: "max-w-md",
                  track: "drop-shadow-sm border border-default-200",
                  indicator: "bg-gradient-to-r from-pink-500 to-pink-400",
                  label: "tracking-wider font-medium text-default-400",
                  value: "text-foreground/50",
                }}
              />
            </div>

            <div className='space-y-2'>
              <h3 className='font-medium'>掌握该技能的用户</h3>
              <div className='flex flex-wrap gap-2'>
                {[...Array(5)].map((_, index) => (
                  <Avatar
                    key={index}
                    size='lg'
                    src={`https://images.unsplash.com/photo-${1490000000000 + index}?w=50&h=50`}
                    className='cursor-pointer transition-transform hover:scale-110'
                  />
                ))}
                <Button isIconOnly variant='flat' className='w-12 h-12 rounded-full'>
                  <Icon icon='solar:alt-arrow-right-bold' className='w-4 h-4' />
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' variant='light' onPress={onClose}>
            关闭
          </Button>
          <Button
            color='primary'
            onPress={handleStartMatching}
            isLoading={skillStore.matching}
            className={cn(
              "bg-gradient-to-r from-pink-500 to-pink-400",
              "text-white font-medium",
              "shadow-lg shadow-pink-500/20",
              "hover:opacity-90 hover:shadow-pink-500/30",
              "transition-all duration-300"
            )}
          >
            {skillStore.matching ? "匹配中..." : "开始匹配"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

context.wpm.export("comp_skill_detail", SkillDetail)
SkillDetail.displayName = "SkillDetail"

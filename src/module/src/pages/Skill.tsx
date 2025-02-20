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
} = context

const { Chip, Card, CardBody, Avatar, Button, Input, Tabs, Tab, Spinner, Progress } = NextUI
const { motion, AnimatePresence } = FramerMotion
const { useNavigate } = ReactRouterDom

const SkillTag = await wpm.import("comp_skill_tag")
const SkillDetail = await wpm.import("comp_skill_detail")
const skillStore = await wpm.import("store_skill")
const userStore = await wpm.import("store_user")

const SkillPage = observer(() => {
  const [detailOpen, setDetailOpen] = React.useState(false)
  const navigate = useNavigate()

  const handleContactUser = (userId) => {
    if (!userStore.isLoggedIn) {
      api.log.info("未登录用户尝试联系其他用户", { userId })
      userStore.setRedirectPath(`/skill?contact=${userId}`)
      message.info("请先登录后再联系")
      navigate("/login")
      return
    }

    // 已登录，处理联系逻辑
    skillStore.contactUser(userId)
  }

  const handleSkillSelect = (skill) => {
    api.log.info("选择技能", {
      skillId: skill.id,
      skillName: skill.name,
    })

    skillStore.setSelectedSkill(skill)
    setDetailOpen(true)
  }

  if (skillStore.loading && !skillStore.hasSkills) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <Spinner label='加载中...' color='primary' />
      </div>
    )
  }

  if (skillStore.error && !skillStore.hasSkills) {
    return (
      <div className='flex flex-col items-center justify-center h-[60vh]'>
        <Icon icon='solar:danger-triangle-bold' className='w-16 h-16 text-danger mb-4' />
        <p className='text-danger mb-4'>{skillStore.error}</p>
        <Button
          color='primary'
          onPress={() => skillStore.loadSkills()}
          className={cn(
            "bg-gradient-to-r from-pink-500 to-pink-400",
            "text-white font-medium",
            "shadow-lg shadow-pink-500/20",
            "hover:opacity-90 hover:shadow-pink-500/30",
            "transition-all duration-300"
          )}
        >
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <h1 className='text-3xl font-bold'>技能交换</h1>
        <p className='text-default-500'>和其他宝妈交换育儿技能</p>
      </div>

      <Card className='bg-default-50'>
        <CardBody className='p-4'>
          <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
            <Input
              placeholder='搜索技能...'
              value={skillStore.searchQuery}
              onChange={(e) => skillStore.setSearchQuery(e.target.value)}
              startContent={<Icon icon='solar:magnifer-bold' className='text-default-400' />}
              className='max-w-xs'
            />
            <Tabs
              selectedKey={skillStore.selectedCategory}
              onSelectionChange={skillStore.setSelectedCategory}
              variant='light'
              classNames={{
                tabList: "bg-pink-100/50 p-0",
                cursor: "bg-pink-500",
                tab: cn(
                  "h-10 px-4 data-[selected=true]:bg-pink-500 data-[selected=true]:text-white",
                  "text-pink-700 hover:text-pink-500 transition-colors",
                  "data-[selected=true]:font-medium",
                  "data-[hover=true]:text-pink-600"
                ),
                tabContent: "group-data-[selected=true]:text-white",
                base: "justify-center",
              }}
            >
              {skillStore.categories.map((category) => (
                <Tab key={category.id} title={category.name} />
              ))}
            </Tabs>
          </div>
        </CardBody>
      </Card>

      {skillStore.hasSkills && (
        <div
          className={cn("grid gap-2", "grid-cols-[repeat(auto-fill,minmax(200px,1fr))]")}
          style={{
            gridAutoRows: "1fr",
          }}
        >
          {skillStore.filteredSkills.map((skill) => (
            <SkillTag
              key={skill.id}
              skill={skill}
              onClick={handleSkillSelect}
              isSelected={skillStore.selectedSkill?.id === skill.id}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {skillStore.hasMatches && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='space-y-4'
          >
            <h2 className='text-xl font-semibold flex items-center gap-2'>
              <Icon icon='solar:users-group-rounded-bold-duotone' className='w-6 h-6 text-pink-500' />
              匹配的宝妈
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {skillStore.matches.map((match) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className='border-none bg-default-50'>
                    <CardBody className='p-4'>
                      <div className='flex items-center gap-4 mb-4'>
                        <Avatar src={match.avatar} size='lg' isBordered color='primary' />
                        <div className='flex-1'>
                          <h3 className='font-semibold'>{match.name}</h3>
                          <div className='flex items-center gap-2 text-default-400'>
                            <Icon icon='solar:map-point-bold-duotone' className='w-4 h-4' />
                            <span className='text-sm'>{match.distance}</span>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='font-bold text-pink-500'>{match.matchRate}%</div>
                          <div className='text-xs text-default-400'>匹配度</div>
                        </div>
                      </div>

                      <div className='space-y-3'>
                        <div>
                          <div className='text-sm font-medium mb-2'>掌握的技能</div>
                          <div className='flex flex-wrap gap-1'>
                            {match.skills.map((skill, index) => (
                              <Chip key={index} variant='flat' className='bg-pink-100 text-pink-600' size='sm'>
                                {skill}
                              </Chip>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className='text-sm font-medium mb-2'>期望交换</div>
                          <div className='flex flex-wrap gap-1'>
                            {match.exchangeSkills.map((skill, index) => (
                              <Chip key={index} variant='flat' className='bg-pink-50 text-pink-500' size='sm'>
                                {skill}
                              </Chip>
                            ))}
                          </div>
                        </div>

                        <Progress
                          size='sm'
                          radius='full'
                          value={match.rating * 20}
                          classNames={{
                            base: "max-w-md",
                            track: "drop-shadow-sm border border-default-200",
                            indicator: "bg-gradient-to-r from-pink-500 to-pink-400",
                            label: "tracking-wider font-medium text-default-400",
                            value: "text-foreground/50",
                          }}
                        />

                        <Button
                          fullWidth
                          className={cn(
                            "bg-gradient-to-r from-pink-500 to-pink-400",
                            "text-white font-medium",
                            "shadow-lg shadow-pink-500/20",
                            "hover:opacity-90 hover:shadow-pink-500/30",
                            "transition-all duration-300"
                          )}
                          startContent={<Icon icon='solar:chat-round-dots-bold-duotone' className='w-4 h-4' />}
                          onPress={() => handleContactUser(match.userId)}
                        >
                          联系她
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SkillDetail skill={skillStore.selectedSkill} isOpen={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  )
})

context.wpm.export("page_skill", SkillPage)
SkillPage.displayName = "SkillPage"
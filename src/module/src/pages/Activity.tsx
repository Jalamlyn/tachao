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

const { Card, CardBody, Button, Chip, Spinner } = NextUI
const { motion } = FramerMotion
const { useNavigate } = ReactRouterDom

const ActivityMap = await wpm.import("comp_activity_map")
const ActivityJoinModal = await wpm.import("comp_activity_join_modal")
const activityStore = await wpm.import("store_activity")
const userStore = await wpm.import("store_user")

const ActivityPage = observer(() => {
  const containerRef = React.useRef(null)
  const [containerHeight, setContainerHeight] = React.useState(0)
  const navigate = useNavigate()

  React.useEffect(() => {
    api.log.info("ActivityPage 组件加载")

    const initLocation = async () => {
      try {
        const location = await userStore.requestLocationPermission()
        if (location) {
          activityStore.loadNearbyActivities(location)
        }
      } catch (error) {
        api.log.error("初始化位置失败", {
          error: error.message,
        })
      }
    }

    initLocation()

    // 计算容器高度
    const updateHeight = () => {
      if (containerRef.current) {
        const height = window.innerHeight - containerRef.current.offsetTop - 100
        setContainerHeight(height)
        api.log.info("更新容器高度", { height })
      }
    }

    updateHeight()
    window.addEventListener("resize", updateHeight)

    return () => {
      window.removeEventListener("resize", updateHeight)
    }
  }, [])

  const handleJoinActivity = (activity) => {
    if (!userStore.isLoggedIn) {
      api.log.info("未登录用户尝试报名活动", {
        activityId: activity.id,
      })
      userStore.setRedirectPath(`/activity?join=${activity.id}`)
      message.info("请先登录后再报名")
      navigate("/login")
      return
    }

    if (activity.participants >= activity.maxParticipants) {
      message.error("该活动已报名满员")
      return
    }

    activityStore.openJoinModal(activity)
  }

  if (userStore.locationPermissionDenied) {
    return (
      <div className='flex flex-col items-center justify-center py-12 px-4'>
        <Icon icon='solar:map-point-forbidden-bold-duotone' className='w-16 h-16 text-danger mb-4' />
        <h2 className='text-xl font-bold mb-2'>需要位置权限</h2>
        <p className='text-default-500 text-center mb-4'>为了显示附近的活动，我们需要获取您的位置信息</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>附近活动</h1>
        <p className='text-default-500'>发现身边的宝妈活动</p>
      </div>

      <div ref={containerRef} className='grid grid-cols-[1fr,380px] gap-6' style={{ height: `${containerHeight}px` }}>
        <div className='relative min-h-0 bg-default-50 rounded-xl overflow-hidden'>
          <ActivityMap activities={activityStore.activities} onSelectActivity={activityStore.selectActivity} />
        </div>

        <div className='min-h-0 overflow-y-auto rounded-xl'>
          <div className='space-y-4 p-2'>
            {activityStore.loading ? (
              <Card className='w-full'>
                <CardBody className='py-8'>
                  <div className='flex flex-col items-center justify-center'>
                    <Spinner color='primary' className='mb-4' />
                    <p className='text-default-500'>加载活动中...</p>
                  </div>
                </CardBody>
              </Card>
            ) : activityStore.error ? (
              <Card className='w-full'>
                <CardBody className='py-8'>
                  <div className='flex flex-col items-center justify-center'>
                    <Icon icon='solar:danger-triangle-bold' className='w-12 h-12 text-danger mb-4' />
                    <p className='text-danger mb-4'>{activityStore.error}</p>
                    <Button
                      className={cn(
                        "bg-gradient-to-r from-pink-500 to-pink-400",
                        "text-white font-medium",
                        "shadow-lg shadow-pink-500/20",
                        "hover:opacity-90 hover:shadow-pink-500/30",
                        "transition-all duration-300"
                      )}
                      onPress={() => activityStore.loadNearbyActivities(userStore.location)}
                    >
                      重试
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ) : activityStore.hasActivities ? (
              activityStore.activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={cn(
                      "w-full cursor-pointer transition-all duration-200",
                      activityStore.selectedActivity?.id === activity.id
                        ? "border-pink-400 shadow-lg scale-[1.02]"
                        : "border-transparent hover:scale-[1.01]"
                    )}
                    isPressable
                    onPress={() => activityStore.selectActivity(activity.id)}
                  >
                    <CardBody className='p-4'>
                      <div className='space-y-4'>
                        <div>
                          <h3 className='text-lg font-semibold mb-2 line-clamp-1'>{activity.title}</h3>
                          <div className='space-y-2 text-default-500 text-sm'>
                            <div className='flex items-start gap-2'>
                              <Icon icon='solar:map-point-bold-duotone' className='w-4 h-4 shrink-0 mt-1' />
                              <span className='line-clamp-2'>{activity.location.address}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Icon icon='solar:clock-circle-bold-duotone' className='w-4 h-4 shrink-0' />
                              <span className='truncate'>{activity.startTime}</span>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center justify-between'>
                          <Chip color='primary' variant='flat' size='sm' className='bg-pink-100 text-pink-600'>
                            {activity.participants}/{activity.maxParticipants} 人已报名
                          </Chip>
                          <Button
                            className={cn(
                              "bg-gradient-to-r from-pink-500 to-pink-400",
                              "text-white font-medium",
                              "shadow-lg shadow-pink-500/20",
                              "hover:opacity-90 hover:shadow-pink-500/30",
                              "transition-all duration-300",
                              "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            size='sm'
                            onPress={() => handleJoinActivity(activity)}
                            isDisabled={activity.participants >= activity.maxParticipants}
                          >
                            {activity.participants >= activity.maxParticipants ? "已满" : "报名参加"}
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className='w-full'>
                <CardBody className='py-8'>
                  <div className='flex flex-col items-center justify-center'>
                    <Icon icon='solar:calendar-minimalistic-bold-duotone' className='w-12 h-12 text-default-300 mb-4' />
                    <p className='text-default-500'>附近暂无活动</p>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ActivityJoinModal />
    </div>
  )
})

context.wpm.export("page_activity", ActivityPage)
ActivityPage.displayName = "ActivityPage"

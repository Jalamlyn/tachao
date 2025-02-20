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

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } = NextUI

const activityStore = await wpm.import("store_activity")

const ActivityJoinModal = observer(() => {
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [remark, setRemark] = React.useState("")

  const handleSubmit = async () => {
    if (!name.trim()) {
      message.error("请输入姓名")
      return
    }
    if (!phone.trim()) {
      message.error("请输入手机号")
      return
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.error("请输入正确的手机号")
      return
    }

    const formData = {
      name: name.trim(),
      phone: phone.trim(),
      remark: remark.trim(),
    }

    await activityStore.joinActivity(activityStore.currentJoinActivity.id, formData)
  }

  const handleClose = () => {
    setName("")
    setPhone("")
    setRemark("")
    activityStore.closeJoinModal()
  }

  if (!activityStore.currentJoinActivity) {
    return null
  }

  return (
    <Modal
      isOpen={activityStore.joinModalOpen}
      onClose={handleClose}
      placement='center'
      classNames={{
        base: "max-w-md",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>活动报名</ModalHeader>
        <ModalBody>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold'>{activityStore.currentJoinActivity.title}</h3>
              <p className='text-sm text-default-500'>开始时间：{activityStore.currentJoinActivity.startTime}</p>
              <p className='text-sm text-default-500'>地点：{activityStore.currentJoinActivity.location.address}</p>
            </div>

            <Input
              label='姓名'
              placeholder='请输入您的姓名'
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant='bordered'
              isRequired
            />

            <Input
              label='手机号'
              placeholder='请输入您的手机号'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant='bordered'
              isRequired
            />

            <Input
              label='备注'
              placeholder='可选填'
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              variant='bordered'
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={handleClose}>
            取消
          </Button>
          <Button
            color='primary'
            onPress={handleSubmit}
            isLoading={activityStore.joiningActivity}
            className={cn(
              "bg-gradient-to-r from-pink-500 to-pink-400",
              "text-white font-medium",
              "shadow-lg shadow-pink-500/20",
              "hover:opacity-90 hover:shadow-pink-500/30",
              "transition-all duration-300"
            )}
          >
            确认报名
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

context.wpm.export("comp_activity_join_modal", ActivityJoinModal)
ActivityJoinModal.displayName = "ActivityJoinModal"

import React, { useState } from "react"
import {
  Modal,
  Input,
  Button,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spacer,
} from "@nextui-org/react"

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateApp: (appName: string) => void
  appType: "install" | "blank" | null
}

const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose, onCreateApp, appType }) => {
  const [appName, setAppName] = useState("")
  const { onOpen, onClose: handleClose } = useDisclosure()

  const handleCreate = () => {
    if (appName.trim()) {
      onCreateApp(appName.trim())
      setAppName("")
      handleClose()
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      onOpen()
    } else {
      handleClose()
    }
  }, [isOpen, onOpen, handleClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg' scrollBehavior='inside'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              <h3 className='text-lg font-semibold'>创建新应用</h3>
              <p className='text-sm text-gray-500'>{appType === "install" ? "安装预配置的应用" : "创建一个空白应用"}</p>
            </ModalHeader>
            <ModalBody>
              <Input
                label='应用名称'
                placeholder='输入应用名称'
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                variant='bordered'
              />
              <Spacer y={2} />
              {appType === "install" && (
                <div className='bg-gray-100 p-4 rounded-md'>
                  <h4 className='text-md font-medium mb-2'>已选择的模板</h4>
                  <p className='text-sm text-gray-600'>离散制造业ERP</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='flat' onPress={onClose}>
                取消
              </Button>
              <Button onPress={handleCreate} color='primary'>
                创建应用
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default CreateAppModal

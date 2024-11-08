import React, { useState, useEffect } from "react"
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
  Card,
} from "@nextui-org/react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateApp: (appName: string) => void
  appType: "install" | "blank" | null
}

const CreateAppModal: React.FC<CreateAppModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateApp, 
  appType 
}) => {
  const [appName, setAppName] = useState("")
  const { onOpen, onClose: handleClose } = useDisclosure()
  const navigate = useNavigate()

  const handleCreate = () => {
    if (appName.trim()) {
      onCreateApp(appName.trim())
      setAppName("")
      handleClose()
    }
  }

  const handleCreateTemplate = () => {
    onClose()
    navigate("/we-chat-app/admin/documents/create")
  }

  React.useEffect(() => {
    if (isOpen) {
      onOpen()
    } else {
      handleClose()
    }
  }, [isOpen, onOpen, handleClose])

  const EmptyTemplateState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-default-50">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
          >
            <Icon icon="solar:document-add-bold-duotone" className="w-16 h-16 text-default-400 mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">还没有可用的模板</h3>
          <p className="text-sm text-default-500 mb-6">
            创建您的第一个单据模板，开始使用强大的单据管理功能
          </p>
          <Button
            color="primary"
            endContent={<Icon icon="solar:add-circle-bold-duotone" />}
            onClick={handleCreateTemplate}
            size="lg"
          >
            创建单据模板
          </Button>
        </div>
      </Card>
    </motion.div>
  )

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size='lg' 
      scrollBehavior='inside'
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        }
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              <h3 className='text-lg font-semibold'>创建新应用</h3>
              <p className='text-sm text-gray-500'>
                {appType === "install" ? "安装预配置的应用" : "创建一个空白应用"}
              </p>
            </ModalHeader>
            <ModalBody>
              <Input
                label='应用名称'
                placeholder='输入应用名称'
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                variant='bordered'
                classNames={{
                  input: "text-medium",
                  inputWrapper: "bg-default-100",
                }}
                endContent={
                  appName && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => setAppName("")}
                    >
                      <Icon icon="mdi:close" className="w-4 h-4" />
                    </Button>
                  )
                }
              />
              <Spacer y={2} />
              {appType === "install" && (
                <AnimatePresence mode="wait">
                  <EmptyTemplateState />
                </AnimatePresence>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='flat' onPress={onClose}>
                取消
              </Button>
              <Button 
                onPress={handleCreate} 
                color='primary' 
                isDisabled={appType === "install" || !appName.trim()}
              >
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
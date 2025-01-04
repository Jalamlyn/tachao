import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import AIChat from "@/app/admin/src/component/AIChat"
import ProductAgent from "./ProductAgent"
import message from "@/components/Message"
import appAgent from "@/app/admin/src/pages/AppBuilder/AppAgent"

const ProductManagerModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirmRequirement = async () => {
    if (messages.length < 2) {
      message.warning("请先与产品经理进行需求讨论")
      return
    }

    setIsConfirming(true)
    try {
      const requirement = ProductAgent.formatRequirementForAppAgent(messages)

      // 创建一个新的应用并处理需求
      const result = await appAgent.processCommand(
        "app_" + Date.now(), // 生成新的appId
        [],
        requirement,
        (chunk) => {
          console.log("Processing chunk:", chunk)
        }
      )

      if (result.success) {
        message.success("需求已确认，正在为您创建应用...")
        onClose()
        // 导航到新创建的应用
        navigate(`/admin/apps/${result.version.appId}/builder`)
      } else {
        throw new Error(result.error || "处理需求时发生错误")
      }
    } catch (error) {
      console.error("Error processing requirement:", error)
      message.error(error instanceof Error ? error.message : "处理需求时发生错误")
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='3xl'
      scrollBehavior='inside'
      classNames={{
        base: "h-[80vh]",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <h3 className='text-xl font-bold'>与AI产品经理对话</h3>
          <p className='text-sm text-default-500'>让我们一起讨论您的应用需求</p>
        </ModalHeader>
        <ModalBody>
          <div className='h-full'>
            <AIChat
              isOpen={true}
              onClose={() => {}}
              systemPrompt=''
              agent={ProductAgent}
              onMessagesChange={setMessages}
              hideCloseButton
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' variant='light' onPress={onClose}>
            稍后再说
          </Button>
          <Button
            color='primary'
            startContent={<Icon icon='solar:rocket-linear' />}
            onPress={handleConfirmRequirement}
            isLoading={isConfirming}
            isDisabled={messages.length < 2 || isConfirming}
          >
            确认需求并创建应用
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ProductManagerModal

import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Image } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import wecomqr from "../../../public/assets/wechat.jpg"

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='md'
      classNames={{
        base: "max-w-md",
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <h3 className='text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent'>
            开启智能企业管理之旅
          </h3>
          <p className='text-sm text-default-500'>扫码立即体验AI驱动的企业管理解决方案</p>
        </ModalHeader>

        <ModalBody>
          <motion.div
            className='text-center space-y-4'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className='p-4 rounded-lg bg-default-50'>
              <ul className='text-sm text-default-600 space-y-2'>
                <li className='flex items-center gap-2'>
                  <Icon icon='mdi:rocket-launch' className='text-primary' />
                  10分钟快速部署
                </li>
                <li className='flex items-center gap-2'>
                  <Icon icon='mdi:shield-check' className='text-primary' />
                  企业级安全保障
                </li>
                <li className='flex items-center gap-2'>
                  <Icon icon='mdi:trending-up' className='text-primary' />
                  效率提升75%
                </li>
                <li className='flex items-center gap-2'>
                  <Icon icon='tabler:24-hours' className='text-primary' />
                  专属客服支持
                </li>
              </ul>
            </div>

            <p className='text-default-600 font-medium'>扫描下方二维码，立即开始体验</p>

            <motion.div
              className='flex justify-center'
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src={wecomqr}
                alt='联系二维码'
                className='w-48 h-48 object-contain rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300'
              />
            </motion.div>

            <p className='text-sm text-default-500'>
              扫码添加客服，获取免费体验资格
              <br />
              我们将为您提供专属的产品体验指导
            </p>
          </motion.div>
        </ModalBody>

        <ModalFooter className='justify-center'>
          <Button
            color='primary'
            variant='light'
            onPress={onClose}
            className='font-medium'
            startContent={<Icon icon='mdi:close-circle' />}
          >
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default QRCodeModal

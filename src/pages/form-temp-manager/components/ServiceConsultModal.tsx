import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Image } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import wecomqr from "../../../../public/assets/wechat.jpg"

interface ServiceConsultModalProps {
  isOpen: boolean
  onClose: () => void
}

const ServiceConsultModal: React.FC<ServiceConsultModalProps> = ({ isOpen, onClose }) => {
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
            企业级AI助手定制服务
          </h3>
          <p className='text-sm text-default-500'>为您的企业打造专属智能化解决方案</p>
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
                  <Icon icon='solar:robot-linear' className='text-primary' />
                  定制企业专属AI助手
                </li>
                <li className='flex items-center gap-2'>
                  <Icon icon='solar:chart-square-linear' className='text-primary' />
                  智能化流程优化
                </li>
                <li className='flex items-center gap-2'>
                  <Icon icon='solar:shield-check-linear' className='text-primary' />
                  企业级安全保障
                </li>
                <li className='flex items-center gap-2'>
                  <Icon icon='solar:refresh-circle-linear' className='text-primary' />
                  持续优化升级
                </li>
              </ul>
            </div>

            <p className='text-default-600 font-medium'>扫描下方二维码，获取专属AI解决方案</p>

            <motion.div
              className='flex justify-center'
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src={wecomqr}
                alt='客服二维码'
                className='w-48 h-48 object-contain rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300'
              />
            </motion.div>

            <p className='text-sm text-default-500'>
              我们的专业团队将为您提供一对一的咨询服务，
              <br />
              为您的企业量身定制最适合的AI助手解决方案。
            </p>
          </motion.div>
        </ModalBody>

        <ModalFooter className='justify-center'>
          <Button
            color='primary'
            variant='light'
            onPress={onClose}
            className='font-medium'
            startContent={<Icon icon='solar:close-circle-bold-duotone' />}
          >
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ServiceConsultModal

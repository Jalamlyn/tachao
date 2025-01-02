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
  Image,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import wecomqr from "../../assets/wechat.png"

interface ServiceSupportModalProps {
  isOpen: boolean
  onClose: () => void
}

const services = [
  {
    icon: "solar:widget-5-bold-duotone",
    title: "企业专属 AI 智能体",
    description: "打造符合企业特色的 AI 助手，提供智能化的业务支持",
    color: "text-success",
    gradient: "from-success-400 to-success-600",
  },
  {
    icon: "solar:widget-4-bold-duotone",
    title: "自动化工作流",
    description: "设计并实现企业级自动化工作流程，减少重复性工作",
    color: "text-warning",
    gradient: "from-warning-400 to-warning-600",
  },
]

const ServiceSupportModal: React.FC<ServiceSupportModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='2xl'
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        closeButton: "right-2",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <h3 className='text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent'>
            企业增值服务
          </h3>
          <p className='text-sm text-default-500'>为您的企业提供全方位的定制化服务</p>
        </ModalHeader>
        <ModalBody>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className='hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group'
                  isPressable
                >
                  <CardBody className='flex flex-row items-start gap-4 relative'>
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${service.gradient} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon icon={service.icon} className='w-6 h-6 text-white' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='text-base font-semibold group-hover:text-primary transition-colors duration-300'>
                        {service.title}
                      </h4>
                      <p className='text-sm text-default-500 group-hover:text-default-700 transition-colors duration-300'>
                        {service.description}
                      </p>
                    </div>
                    <motion.div
                      className='absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                      initial={false}
                      animate={{ x: 0 }}
                      whileHover={{ x: 5 }}
                    >
                      <Icon icon='solar:arrow-right-bold-duotone' className={`w-5 h-5 ${service.color}`} />
                    </motion.div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className='text-center space-y-4'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className='text-default-600 font-medium'>扫描下方二维码，联系我们的技术支持团队</p>
            <div className='flex justify-center'>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                <Image
                  src={wecomqr}
                  alt='客服二维码'
                  className='w-48 h-48 object-contain rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300'
                />
              </motion.div>
            </div>
            <p className='text-sm text-default-500'>
              我们的专业团队将为您提供一对一的咨询服务，深入了解您的需求，
              <br />
              为您的企业量身定制最适合的解决方案。
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

export default ServiceSupportModal

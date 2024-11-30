import React from "react"
import { motion } from "framer-motion"
import { Card, CardBody, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"

const Contact: React.FC = () => {
  return (
    <section className='py-20 relative overflow-hidden'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className='max-w-4xl mx-auto'
        >
          <Card className='bg-white/10 backdrop-blur-lg border border-white/20'>
            <CardBody className='text-center p-8'>
              <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>开启智能企业管理之旅</h2>
              <p className='text-white/80 text-lg mb-8 max-w-2xl mx-auto'>
                立即体验AI驱动的企业管理解决方案，让企业管理更简单、更高效
              </p>
              
              {/* 核心优势展示 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-white/90">
                  <Icon icon="mdi:rocket-launch" className="text-3xl mb-2 text-blue-400" />
                  <h3 className="font-bold mb-1">快速部署</h3>
                  <p className="text-sm text-white/70">10分钟完成配置</p>
                </div>
                <div className="text-white/90">
                  <Icon icon="mdi:shield-check" className="text-3xl mb-2 text-green-400" />
                  <h3 className="font-bold mb-1">安全可靠</h3>
                  <p className="text-sm text-white/70">数据安全保障</p>
                </div>
                <div className="text-white/90">
                  <Icon icon="mdi:headphones" className="text-3xl mb-2 text-purple-400" />
                  <h3 className="font-bold mb-1">专业支持</h3>
                  <p className="text-sm text-white/70">7x24小时服务</p>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button
                  size='lg'
                  className='bg-white text-primary-dark hover:bg-white/90 font-medium px-8'
                  startContent={<Icon icon='mdi:rocket-launch' />}
                >
                  免费试用
                </Button>
                <Button
                  size='lg'
                  variant='bordered'
                  className='text-white border-white hover:bg-white/10 font-medium px-8'
                  startContent={<Icon icon='mdi:headphones' />}
                >
                  在线咨询
                </Button>
              </div>

              {/* 补充信息 */}
              <div className="mt-8 text-white/60 text-sm">
                <p>无需信用卡 · 14天免费试用 · 专业技术支持</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
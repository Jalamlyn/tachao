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
              <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>开始使用 沙塔 AI</h2>
              <p className='text-white/80 text-lg mb-8 max-w-2xl mx-auto'>立即体验智能化企业管理，提升效率，降低成本</p>
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
                  联系销售
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact

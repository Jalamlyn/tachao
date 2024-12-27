import React from "react"
import { Link } from "@nextui-org/react"
import { motion } from "framer-motion"

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-primary-dark/90 backdrop-blur-lg py-12'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div className='space-y-4'>
            <img src='/assets/logo.jpg' alt='ShaTa AI' className='w-[100px] h-auto rounded-lg' />
            <p className='text-white/70'>AI驱动的企业级低代码开发平台</p>
          </div>

          <div>
            <h3 className='text-white font-bold mb-4'>产品</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='#' className='text-white/70 hover:text-white'>
                  AI 开发表单
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/70 hover:text-white'>
                  AI 开发报表
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/70 hover:text-white'>
                  AI 开发应用
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/70 hover:text-white'>
                  AI 分析数据
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-white font-bold mb-4'>联系方式</h3>
            <ul className='space-y-2'>
              <li className='text-white/70'>邮箱：shihong@mobenai.com.cn</li>
              <li className='text-white/70'>地址：杭州市临平区</li>
            </ul>
          </div>
        </div>

        <div className='mt-12 pt-8 border-t border-white/10'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-white/70 text-sm'>© {currentYear} 模本(杭州)科技有限责任公司. 保留所有权利.</p>
            <div className='flex space-x-4 mt-4 md:mt-0'>
              <Link href='#' className='text-white/70 hover:text-white text-sm'>
                隐私政策
              </Link>
              <Link href='#' className='text-white/70 hover:text-white text-sm'>
                服务条款
              </Link>
            </div>
          </div>
          <div className='text-center mt-4'>
            <Link
              href='https://beian.miit.gov.cn/#/Integrated/recordQuery'
              target='_blank'
              className='text-white/50 hover:text-white/70 text-sm transition-colors'
            >
              浙ICP备2024090629号-1
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

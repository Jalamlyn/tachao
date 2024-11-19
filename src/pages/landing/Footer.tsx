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
            <img src='/assets/logo.jpg' alt='ShaTa AI' className='h-auto w-[200px] rounded-lg' />
            <p className='text-white/70'>智能企业服务专家，让企业管理更简单</p>
          </div>

          <div>
            <h3 className='text-white font-bold mb-4'>产品</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='#' className='text-white/70 hover:text-white'>
                  智能表单
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/70 hover:text-white'>
                  数据分析
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/70 hover:text-white'>
                  报表生成
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-white font-bold mb-4'>关于我们</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='#' className='text-white/70 hover:text-white'>
                  公司介绍
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/70 hover:text-white'>
                  联系我们
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/70 hover:text-white'>
                  加入我们
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-white font-bold mb-4'>联系方式</h3>
            <ul className='space-y-2'>
              <li className='text-white/70'>邮箱：shihong@mobenai.com.cn</li>
              <li className='text-white/70'>电话：15384078477</li>
              <li className='text-white/70'>地址：杭州市临平区</li>
            </ul>
          </div>
        </div>

        <div className='mt-12 pt-8 border-t border-white/10'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-white/70 text-sm'>© {currentYear} 沙塔智能. 保留所有权利.</p>
            <div className='flex space-x-4 mt-4 md:mt-0'>
              <Link href='#' className='text-white/70 hover:text-white text-sm'>
                隐私政策
              </Link>
              <Link href='#' className='text-white/70 hover:text-white text-sm'>
                服务条款
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

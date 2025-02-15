import React, { useState, useEffect } from "react"
import { Card, CardBody, CardFooter, Image, Button, Spinner, Modal, ModalContent } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { motion } from "framer-motion"
import { getMetadata } from "@/service/apis/metadata"

interface MarketApp {
  id: string
  title: string
  description: string
  accessUrl: string
  publisher: {
    id: string
    name: string
  }
  screenshots: string[]
  publishedAt: string
}

const AppMarket: React.FC = () => {
  const [apps, setApps] = useState<MarketApp[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScreenshots, setSelectedScreenshots] = useState<string[]>([])
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchApps()
  }, [currentPage, searchTerm])

  const fetchApps = async () => {
    try {
      setLoading(true)
      // 获取市场索引
      const indexResult = await getMetadata(["market_apps_index"])
      const marketIndex = indexResult.data?.[0]?.value
        ? JSON.parse(indexResult.data[0].value)
        : { totalPages: 0, totalApps: 0 }

      setTotalPages(marketIndex.totalPages)

      // 获取当前页数据
      const pageResult = await getMetadata([`market_apps_page_${currentPage}`])
      let pageData = pageResult.data?.[0]?.value ? JSON.parse(pageResult.data[0].value) : []

      // 搜索过滤
      if (searchTerm) {
        pageData = pageData.filter((app) =>
          app.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // 按发布时间排序
      pageData.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

      setApps(pageData)
    } catch (error) {
      console.error("Error fetching apps:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleScreenshotClick = (screenshots: string[]) => {
    setSelectedScreenshots(screenshots)
    setShowScreenshotModal(true)
  }

  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <Spinner size='lg' />
      </div>
    )
  }

  return (
    <div className='min-h-screen flex justify-center items-center relative bg-gradient-to-b from-[#2D1B69] via-[#1E1656] to-[#19073B]'>
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20" />

      <div className='container mx-auto px-4'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>应用市场</h1>
          <p className='text-xl text-white/80'>发现和使用优秀的企业应用</p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {apps.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className='bg-white/10 backdrop-blur-sm border border-white/20'>
                <CardBody className='p-0'>
                  <div className='cursor-pointer' onClick={() => handleScreenshotClick(app.screenshots)}>
                    <Swiper
                      modules={[Navigation, Pagination]}
                      navigation
                      pagination={{ clickable: true }}
                      className='h-48'
                    >
                      {app.screenshots.map((screenshot, index) => (
                        <SwiperSlide key={index}>
                          <Image
                            src={screenshot}
                            alt={`${app.name} screenshot ${index + 1}`}
                            className='w-full h-48 object-cover'
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                  <div className='p-4'>
                    <h3 className='text-xl font-bold text-white mb-2'>{app.title}</h3>
                    <p className='text-white/70 text-sm line-clamp-2'>{app.description}</p>
                  </div>
                </CardBody>
                <CardFooter className='flex justify-between items-center border-t border-white/10'>
                  <div className='flex items-center gap-2 text-white/60 text-sm'>
                    <Icon icon='mdi:account' />
                    <span>{app.publisher.name}</span>
                    <span className='mx-2'>•</span>
                    <span>{new Date(app.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <Button
                    color='primary'
                    endContent={<Icon icon='mdi:arrow-right' />}
                    onClick={() => window.open(app.accessUrl, "_blank")}
                  >
                    访问应用
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showScreenshotModal}
        onClose={() => setShowScreenshotModal(false)}
        size='5xl'
        classNames={{
          backdrop: "backdrop-blur-sm",
        }}
      >
        <ModalContent>
          <div className='relative'>
            <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} className='h-[80vh]'>
              {selectedScreenshots.map((screenshot, index) => (
                <SwiperSlide key={index}>
                  <Image src={screenshot} alt={`Screenshot ${index + 1}`} className='w-full h-full object-contain' />
                </SwiperSlide>
              ))}
            </Swiper>
            <Button
              isIconOnly
              className='absolute top-4 right-4 z-50'
              color='danger'
              variant='flat'
              onPress={() => setShowScreenshotModal(false)}
            >
              <Icon icon='mdi:close' className='w-6 h-6' />
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default AppMarket
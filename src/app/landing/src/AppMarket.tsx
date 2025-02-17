import React, { useState, useEffect } from "react"
import { Card, CardBody, CardFooter, Image, Button, Spinner, Modal, ModalContent, ModalBody, Navbar, NavbarContent, NavbarItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { motion } from "framer-motion"
import { getPlatMetaData } from "@/service/apis/metadata"
import { useNavigate } from "react-router-dom"

interface MarketApp {
  id: string
  title: string
  description: string
  accessUrl: string
  creator: {
    id: string
    name: string
    avatar?: string
  }
  screenshots: string[]
  publishedAt: string
  category?: string
}

const categories = [
  { key: "all", name: "全部" },
  { key: "office", name: "办公" },
  { key: "crm", name: "客户管理" },
  { key: "erp", name: "企业管理" },
  { key: "other", name: "其他" },
]

const sortOptions = [
  { key: "newest", name: "最新发布" },
  { key: "popular", name: "最受欢迎" },
]

const AppMarket: React.FC = () => {
  const navigate = useNavigate()
  const [apps, setApps] = useState<MarketApp[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScreenshots, setSelectedScreenshots] = useState<string[]>([])
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSort, setSelectedSort] = useState("newest")

  useEffect(() => {
    fetchApps()
  }, [currentPage, searchTerm, selectedCategory, selectedSort])

  const fetchApps = async () => {
    try {
      setLoading(true)
      const indexResult = await getPlatMetaData(["market_apps_index"])
      const marketIndex = indexResult.data?.[0]?.values[0].value
        ? JSON.parse(indexResult.data[0].values[0].value)
        : { totalPages: 0, totalApps: 0 }

      setTotalPages(marketIndex.totalPages)

      const pageResult = await getPlatMetaData([`market_apps_page_${currentPage}`])
      let pageData = pageResult.data?.[0]?.values[0].value ? JSON.parse(pageResult.data[0].values[0].value) : []

      // 搜索过滤
      if (searchTerm) {
        pageData = pageData.filter((app) => 
          app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // 分类过滤
      if (selectedCategory !== "all") {
        pageData = pageData.filter((app) => app.category === selectedCategory)
      }

      // 排序
      pageData.sort((a, b) => {
        if (selectedSort === "newest") {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        } else {
          // 这里可以添加其他排序逻辑
          return 0
        }
      })

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

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <Spinner size='lg' />
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col relative bg-gradient-to-b from-[#2D1B69] via-[#1E1656] to-[#19073B]'>
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20" />

      {/* 导航栏 */}
      <Navbar className="bg-background/60 backdrop-blur-md border-b border-white/20">
        <NavbarContent justify="start">
          <NavbarItem>
            <Button
              variant="light"
              startContent={<Icon icon="mdi:arrow-left" />}
              onClick={() => navigate("/")}
            >
              返回首页
            </Button>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="center">
          <NavbarItem>
            <h1 className="text-xl font-bold">应用市场</h1>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <div className='container mx-auto p-4'>
        {/* 搜索和筛选区域 */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
          <div className="flex gap-4 flex-1 max-w-md">
            <Input
              placeholder="搜索应用..."
              value={searchTerm}
              onValueChange={handleSearch}
              startContent={<Icon icon="mdi:search" />}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-4">
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="flat" 
                  startContent={<Icon icon="mdi:filter-variant" />}
                >
                  {categories.find(c => c.key === selectedCategory)?.name || "分类"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[selectedCategory]}
                onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string)}
              >
                {categories.map((category) => (
                  <DropdownItem key={category.key}>{category.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="flat" 
                  startContent={<Icon icon="mdi:sort" />}
                >
                  {sortOptions.find(s => s.key === selectedSort)?.name || "排序"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[selectedSort]}
                onSelectionChange={(keys) => setSelectedSort(Array.from(keys)[0] as string)}
              >
                {sortOptions.map((option) => (
                  <DropdownItem key={option.key}>{option.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {apps.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className='bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300'>
                <CardBody className='p-0'>
                  <div
                    className='cursor-pointer flex justify-center items-center pt-6 overflow-hidden'
                    onClick={() => handleScreenshotClick(app.screenshots)}
                  >
                    <Image
                      src={app.screenshots[0]}
                      alt={`${app.title} screenshot`}
                      className='w-full h-48 object-cover transform transition-transform duration-300 hover:scale-105'
                    />
                  </div>
                  <div className='p-4'>
                    <h3 className='text-xl font-bold text-white mb-2 flex items-center gap-2'>
                      {app.title}
                      {app.category && (
                        <span className='text-xs px-2 py-1 rounded-full bg-white/10'>
                          {categories.find(c => c.key === app.category)?.name || app.category}
                        </span>
                      )}
                    </h3>
                    <p className='text-white/70 text-sm line-clamp-2'>{app.description}</p>
                  </div>
                </CardBody>
                <CardFooter className='flex justify-between items-center border-t border-white/10'>
                  <div className='flex items-center gap-2 text-white/60 text-sm'>
                    <Icon icon='mdi:account' />
                    <span>{app.creator?.name || "未知创建者"}</span>
                    <span className='mx-2'>•</span>
                    <span>{new Date(app.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <Button
                    color='primary'
                    endContent={<Icon icon='mdi:arrow-right' />}
                    onPress={() => window.open(app.accessUrl.replace("app-run", "app-plat"), "_blank")}
                  >
                    访问应用
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {apps.length === 0 && !loading && (
          <div className="text-center py-20">
            <Icon icon="mdi:package-variant" className="w-16 h-16 mx-auto text-white/30" />
            <p className="text-white/50 mt-4">暂无符合条件的应用</p>
          </div>
        )}
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
          <ModalBody>
            <div className='relative mt-6'>
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className='h-[80vh]'
              >
                {selectedScreenshots.map((screenshot, index) => (
                  <SwiperSlide key={index}>
                    <Image src={screenshot} alt={`Screenshot ${index + 1}`} className='w-full h-full object-contain' />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default AppMarket
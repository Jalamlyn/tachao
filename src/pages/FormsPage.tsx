import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Button, Tooltip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CreateResourceButton from "../components/resource/CreateResourceButton"
import ResourceCardList from "../components/common/ResourceCardList"
import TabsContainer from "../components/forms/TabsContainer"
import { getAppId } from "@/utils"

const FormsPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("forms")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setSelectedAppId(getAppId())
  }, [])

  const handleCreateForm = () => {
    if (!selectedAppId) return
    window.open(`/forms/create?appId=${selectedAppId}`, "_blank")
  }

  const handleViewForm = (formId: string) => {
    if (!selectedAppId) return
    window.open(`/forms/${formId}?appId=${selectedAppId}`, "_blank")
  }

  const handleLogout = () => {
    sessionStorage.removeItem("x-app-id")
    sessionStorage.removeItem("x-project-id")
    navigate("/we-chat-login")
  }

  const handleCreateReport = () => {
    if (!selectedAppId) return
    window.open(`/reports/create?appId=${selectedAppId}`, "_blank")
  }

  const handleViewReport = (reportId: string) => {
    if (!selectedAppId) return
    window.open(`/reports/view/${reportId}?appId=${selectedAppId}`, "_blank")
  }

  const handleOpenAIAssistant = () => {
    if (!selectedAppId) return
    window.open(`/forms/analysis?appId=${selectedAppId}`, "_blank")
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 max-h-screen overflow-hidden'
    >
      <motion.div
        variants={itemVariants}
        className='bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-gray-100'
      >
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6'>
          {/* <div className='w-full sm:w-auto'>
            <ProjectAppSelector onAppSelect={handleAppSelect} />
          </div> */}
          <div className='flex sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto'>
            <Button
              color='secondary'
              variant='shadow'
              startContent={<Icon icon='mingcute:ai-fill' className='text-xl' />}
              onClick={handleOpenAIAssistant}
              isDisabled={!selectedAppId}
              className='w-full sm:w-auto min-w-[160px] bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-200 hover:shadow-purple-300 transition-all duration-300'
              size='sm'
            >
              智能查询
            </Button>
            <Button
              color='danger'
              onClick={handleLogout}
              className='bg-gradient-to-r from-red-500 to-red-600 shadow-lg hover:shadow-xl transition-all duration-300'
              startContent={<Icon icon='mdi:logout' className='w-4 h-4 sm:w-5 sm:h-5' />}
              size='sm'
            ></Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <TabsContainer
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'
        >
          {activeTab === "forms" && (
            <ResourceCardList
              resourceType='forms'
              appId={selectedAppId}
              onView={handleViewForm}
              onCreate={handleCreateForm}
              isRefreshing={isRefreshing}
              setIsRefreshing={setIsRefreshing}
            />
          )}
          {activeTab === "reports" && (
            <ResourceCardList
              resourceType='reports'
              appId={selectedAppId}
              onView={handleViewReport}
              onCreate={handleCreateReport}
              isRefreshing={isRefreshing}
              setIsRefreshing={setIsRefreshing}
            />
          )}
          {activeTab === "resources" && (
            <ResourceCardList
              resourceType='resources'
              appId={selectedAppId}
              onView={(id) => window.open(`/resources/view/${id}?appId=${selectedAppId}`, "_blank")}
              onCreate={() => {}}
              isRefreshing={isRefreshing}
              setIsRefreshing={setIsRefreshing}
              createButton={
                <CreateResourceButton
                  appId={selectedAppId}
                  isDisabled={!selectedAppId}
                  className='w-full sm:w-auto min-w-[200px]'
                />
              }
            />
          )}
        </TabsContainer>
      </motion.div>
    </motion.div>
  )
}

export default FormsPage

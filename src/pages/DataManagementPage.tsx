import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Button, Tooltip, Card, CardHeader, CardBody, ScrollShadow, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CreateResourceButton from "../components/resource/CreateResourceButton"
import ResourceCardList from "../components/common/ResourceCardList"
import TabsContainer from "../components/forms/TabsContainer"
import CommandInput from "../components/CommandInput"
import { getAppId } from "@/utils"
import message from "@/components/Message"

const FormsPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("forms")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [resourceType, setResourceType] = useState<"forms" | "resources" | "reports">("forms")
  const [error, setError] = useState<string | null>(null)
  const [currentContext, setCurrentContext] = useState<string>("单据")

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

  const handleCreateReport = () => {
    if (!selectedAppId) return
    window.open(`/reports/create?appId=${selectedAppId}`, "_blank")
  }

  const handleViewReport = (reportId: string) => {
    if (!selectedAppId) return
    window.open(`/reports/view/${reportId}?appId=${selectedAppId}`, "_blank")
  }

  const handleContextChange = (context: string) => {
    setCurrentContext(context)
    // 这里可以根据上下文切换来获取不同的数据
    console.log("Context changed to:", context)
  }

  return (
    <Card className='w-full h-[calc(100vh-280px)] shadow-lg rounded-lg flex flex-col'>
      <CardHeader className='flex justify-between items-center p-4 text-white'>
        <CommandInput
          placeholder='输入您的数据管理需求...'
          disabled={isRefreshing}
          resourceType={resourceType}
          onResourceTypeChange={setResourceType}
          contexts={["单据", "数据"]}
          onContextChange={handleContextChange}
        />
        <Tooltip content='刷新数据'>
          <Button
            isIconOnly
            color='warning'
            variant='light'
            onPress={() => setIsRefreshing(true)}
            className='text-white'
          >
            <Icon icon='mdi:refresh' width='24' height='24' />
          </Button>
        </Tooltip>
      </CardHeader>
      <CardBody className='p-4 flex-grow flex flex-col'>
        {error ? (
          <div className='flex-grow flex items-center justify-center'>
            <p className='text-danger text-center'>{error}</p>
          </div>
        ) : (
          <ScrollShadow className='flex-grow mb-4 pr-2'>
            <TabsContainer activeTab={activeTab} onTabChange={setActiveTab}>
              <ResourceCardList
                resourceType={resourceType}
                appId={selectedAppId}
                onView={handleViewForm}
                onCreate={handleCreateForm}
                isRefreshing={isRefreshing}
                setIsRefreshing={setIsRefreshing}
              />
            </TabsContainer>
          </ScrollShadow>
        )}
      </CardBody>
    </Card>
  )
}

export default FormsPage
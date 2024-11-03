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

  return (
    <div className='container mx-auto p-4 md:p-6 h-screen flex flex-col'>
      <Card className='w-full h-full shadow-lg rounded-lg flex flex-col'>
        <CardHeader className='flex justify-between items-center p-4 text-white'>
          <h1 className='text-2xl font-bold'>数据管理助手</h1>
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
          <div className='flex items-center space-x-2 mt-4'>
            <CommandInput
              placeholder='输入您的数据管理需求...'
              disabled={isRefreshing}
              resourceType={resourceType}
              onResourceTypeChange={setResourceType}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default FormsPage
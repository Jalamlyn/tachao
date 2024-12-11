import React, { useEffect, useState } from "react"
import { Card, CardBody, Spinner } from "@nextui-org/react"
import { useMetadata } from "@/hooks/useMetadata"
import InitializeView from "./components/InitializeView"
import FileList from "./components/FileList"
import PageLayout from "@/components/PageLayout"
import { queryModels, queryModelProperties } from "@/service/apis/model"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

const FileManager: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "企业网盘", href: "/we-chat-app/admin/file-manager" },
    ])
  }, [])

  useEffect(() => {
    checkInitialization()
  }, [])

  const checkInitialization = async () => {
    try {
      setIsLoading(true)
      // 1. 检查模型是否存在
      const modelResponse = await queryModels({
        namespace: "file",
        name: "activities",
      })

      if (modelResponse.data.length === 0) {
        setIsInitialized(false)
        return
      }

      // 2. 检查files属性是否存在
      const modelId = modelResponse.data[0].id
      const propertiesResponse = await queryModelProperties(modelId)
      
      const hasFilesProperty = propertiesResponse.data.some(
        (prop) => prop.name === "files" && prop.type === "array"
      )

      setIsInitialized(hasFilesProperty)

      if (!hasFilesProperty) {
        message.warning("模型属性不完整，需要重新初始化")
      }
    } catch (error) {
      console.error("Check initialization error:", error)
      message.error("检查初始化状态失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitializeSuccess = () => {
    setIsInitialized(true)
    message.success("初始化成功")
  }

  return (
    <PageLayout title='企业网盘' titleIcon='solar:folder-with-files-bold-duotone'>
      <Card>
        <CardBody>
          {isLoading ? (
            <div className='flex justify-center items-center h-96'>
              <Spinner label='加载中...'></Spinner>
            </div>
          ) : !isInitialized ? (
            <InitializeView onInitializeSuccess={handleInitializeSuccess} />
          ) : (
            <FileList />
          )}
        </CardBody>
      </Card>
    </PageLayout>
  )
}

export default FileManager
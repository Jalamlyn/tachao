import React, { useEffect, useState } from "react"
import { Card, CardBody, Spinner } from "@nextui-org/react"
import { useMetadata } from "@/hooks/useMetadata"
import InitializeView from "./components/InitializeView"
import FileList from "./components/FileList"
import PageLayout from "@/components/PageLayout"
import { queryModels } from "@/service/apis/model"
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
      const response = await queryModels({
        namespace: "file",
        name: "activities",
      })
      setIsInitialized(response.data.length > 0)
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

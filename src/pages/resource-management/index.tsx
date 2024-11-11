import React, { useEffect, useState } from "react"
import { Button, useDisclosure } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ResourceTable from "./components/ResourceTable"
import UploadModal from "./components/UploadModal"
import CreateResourceButton from "./components/CreateResourceButton"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import message from "@/components/Message"
import { useResourceMetadata } from "./hooks/useResourceMetadata"
import { useFileUpload } from "./hooks/useFileUpload"
import { useSearchParams } from "react-router-dom"

const ResourceManagement: React.FC = () => {
  const { updateBreadcrumbs } = useBreadcrumb()
  const [searchParams] = useSearchParams()
  const appId = searchParams.get("appId")
  const { isOpen: isUploadModalOpen, onOpen: onOpenUpload, onClose: onCloseUpload } = useDisclosure()
  
  // 使用 hooks
  const {
    createResource,
    loadResources,
    resources,
    loading: resourceLoading,
  } = useResourceMetadata(appId)

  const {
    handleUpload: uploadFile,
    uploading,
    progress,
    error: uploadError,
  } = useFileUpload({
    onProgress: (progress) => {
      console.log("Upload progress:", progress)
    },
    onSuccess: (data) => {
      message.success("文件解析成功")
      handleCreateResource(data)
    },
    onError: (error) => {
      message.error(error.message || "文件上传失败")
    },
  })

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
    ])
  }, [])

  useEffect(() => {
    if (appId) {
      loadResources()
    }
  }, [appId, loadResources])

  const handleCreateResource = async (data: any) => {
    if (!appId) {
      message.error("缺少应用ID")
      return
    }

    try {
      const resource = {
        name: data.name || "新建资料",
        type: "excel",
        size: data.size || "0",
        status: "active" as const,
        description: `上传于 ${new Date().toLocaleString()}`,
        data: data,
      }

      await createResource(resource)
      message.success("资料创建成功")
      onCloseUpload()
      loadResources() // 重新加载资源列表
    } catch (error) {
      console.error("Error creating resource:", error)
      message.error("创建资料失败")
    }
  }

  const handleUpload = async (file: File) => {
    if (!appId) {
      message.error("缺少应用ID")
      return
    }

    try {
      await uploadFile(file)
    } catch (error) {
      console.error("Upload error:", error)
      message.error("上传失败")
    }
  }

  const pageActions = (
    <div className="flex gap-2">
      <CreateResourceButton 
        appId={appId} 
        isDisabled={!appId || uploading}
        onSuccess={() => {
          message.success("资料创建成功")
          loadResources()
        }}
      />
      <Button 
        onClick={onOpenUpload} 
        color="primary"
        isDisabled={!appId || uploading}
        className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {uploading ? (
          <>
            <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
            上传中...
          </>
        ) : (
          <>
            <Icon icon="mdi:upload" className="w-4 h-4 mr-2" />
            上传资料
          </>
        )}
      </Button>
    </div>
  )

  return (
    <PageLayout 
      title="资料管理" 
      titleIcon="mdi:file-document" 
      actions={pageActions}
      loading={resourceLoading}
    >
      <ResourceTable resources={resources} onRefresh={loadResources} />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={onCloseUpload}
        onUpload={handleUpload}
        uploading={uploading}
        progress={progress}
        error={uploadError}
      />
    </PageLayout>
  )
}

export default ResourceManagement
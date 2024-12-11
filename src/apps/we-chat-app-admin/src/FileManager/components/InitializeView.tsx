import React, { useState } from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { createModel, createModelProperty } from "@/service/apis/model"
import message from "@/components/Message"

interface InitializeViewProps {
  onInitializeSuccess: () => void
}

const InitializeView: React.FC<InitializeViewProps> = ({ onInitializeSuccess }) => {
  const [isInitializing, setIsInitializing] = useState(false)

  const handleInitialize = async () => {
    try {
      setIsInitializing(true)

      // 1. 创建模型
      // const modelResponse = await createModel({
      //   namespace: "file",
      //   name: "activities",
      //   description: "企业网盘文件管理",
      // })

      // 2. 创建files属性
      await createModelProperty({
        modelId: "1866059191187591170",
        name: "files",
        type: "file",
        description: "文件列表",
        isRequired: true,
        allowMultipleFiles: true,
      })

      onInitializeSuccess()
      message.success("初始化成功")
    } catch (error) {
      console.error("Initialize error:", error)
      message.error("初始化失败，请重试")
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <Icon icon='solar:folder-with-files-bold-duotone' className='w-24 h-24 text-primary mb-6' />
      <h2 className='text-2xl font-bold mb-4'>欢迎使用企业网盘</h2>
      <p className='text-default-500 mb-8 max-w-md'>
        在开始使用企业网盘之前，需要进行初始化设置。这将创建必要的文件管理模型，确保文件上传和管理功能正常运行。
      </p>
      <Button
        color='primary'
        size='lg'
        startContent={<Icon icon='solar:settings-bold-duotone' />}
        isLoading={isInitializing}
        onPress={handleInitialize}
      >
        {isInitializing ? "初始化中..." : "一键初始化"}
      </Button>
    </div>
  )
}

export default InitializeView

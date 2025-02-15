import React, { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Card,
  CardBody,
  Image,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

// ... 保留原有的 ErrorPrompt 和其他组件 ...

export const PublishModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  appId: string
}> = ({ isOpen, onClose, appId }) => {
  const navigate = useNavigate()
  const [publishToMarket, setPublishToMarket] = useState(false)
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [description, setDescription] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 5) {
      alert("最多只能上传5张截图")
      return
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith("image/") && file.size <= 2 * 1024 * 1024
      if (!isValid) {
        alert(`文件 ${file.name} 无效。请确保是图片文件且大小不超过2MB`)
      }
      return isValid
    })

    setScreenshots(validFiles)

    // 生成预览URL
    const urls = validFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  const handlePublishToMarket = async () => {
    if (publishToMarket && screenshots.length === 0) {
      alert("发布到应用市场需要至少上传一张截图")
      return
    }

    // TODO: 处理发布到应用市场的逻辑
    // 上传截图并获取URL
    // 更新应用市场数据
    
    onClose()
    navigate(`/app/${appId}`)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      classNames={{
        backdrop: "backdrop-blur-sm",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">发布成功</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Card className="bg-success-50/50">
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <Icon icon="mdi:check-circle" className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">应用发布成功</h4>
                    <p className="text-sm text-default-600">您的应用已经成功发布到生产环境</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="space-y-4">
              <Checkbox
                isSelected={publishToMarket}
                onValueChange={setPublishToMarket}
                size="sm"
              >
                同时发布到应用市场
              </Checkbox>

              {publishToMarket && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <Input
                    label="应用描述"
                    placeholder="请输入应用描述..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      应用截图 (最多5张，每张不超过2MB)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="flat"
                            className="absolute -top-2 -right-2"
                            onClick={() => {
                              const newScreenshots = [...screenshots]
                              const newPreviewUrls = [...previewUrls]
                              newScreenshots.splice(index, 1)
                              newPreviewUrls.splice(index, 1)
                              setScreenshots(newScreenshots)
                              setPreviewUrls(newPreviewUrls)
                              URL.revokeObjectURL(url)
                            }}
                          >
                            <Icon icon="mdi:close" className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {previewUrls.length < 5 && (
                        <Button
                          className="w-24 h-24 border-2 border-dashed"
                          variant="flat"
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.multiple = true
                            input.accept = "image/*"
                            input.onchange = handleFileChange
                            input.click()
                          }}
                        >
                          <Icon icon="mdi:image-plus" className="w-6 h-6" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handlePublishToMarket}>
            确认发布
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ... 保留原有的其他导出组件 ...
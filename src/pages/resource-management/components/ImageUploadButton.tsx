import React, { useState, useRef } from "react"
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Chip,
  Image,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import message from "@/components/Message"

interface ImageUploadProps {
  onSuccess: (data: any) => void
  onError: (error: Error) => void
}

const ImageUploadButton: React.FC<ImageUploadProps> = ({ onSuccess, onError }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      if (!selectedFile.type.startsWith("image/")) {
        message.error("请上传图片文件")
        return
      }
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (!droppedFile.type.startsWith("image/")) {
        message.error("请上传图片文件")
        return
      }
      setFile(droppedFile)
      const url = URL.createObjectURL(droppedFile)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      message.error("请选择文件")
      return
    }
    try {
      await onSuccess({
        file,
        description,
        previewUrl,
      })
      onClose()
      setFile(null)
      setPreviewUrl(null)
      setDescription("")
    } catch (error) {
      onError(error as Error)
    }
  }

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(null)
    setPreviewUrl(null)
    setDescription("")
    onClose()
  }

  return (
    <>
      <Button
        onClick={onOpen}
        color='warning'
        startContent={<Icon icon='mdi:image' className='text-xl' />}
        className='bg-yellow-600 hover:bg-yellow-700 transition-all duration-200 text-white'
      >
        上传图片资料
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size='2xl'
        classNames={{
          base: "bg-background",
          header: "border-b-1 border-default-200",
          body: "py-6",
          footer: "border-t-1 border-default-200",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:image' className='text-yellow-600 text-2xl' />
              <span className='text-xl font-semibold'>上传图片资料</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-6'>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    flex flex-col items-center justify-center w-full h-40 
                    px-4 transition-all duration-200 bg-default-50 
                    border-2 border-dashed rounded-xl cursor-pointer
                    ${isDragging ? "border-primary bg-primary/10" : "border-default-300"}
                    hover:border-primary hover:bg-primary/5
                  `}
                >
                  {previewUrl ? (
                    <div className='flex flex-col items-center gap-2'>
                      <Image src={previewUrl} alt='Preview' className='w-32 h-32 object-cover rounded-lg' />
                      <Chip size='sm' color='primary' variant='flat'>
                        {file && (file.size / 1024 / 1024).toFixed(2)} MB
                      </Chip>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center gap-2'>
                      <Icon icon='mdi:upload' className='w-12 h-12 text-default-400' />
                      <span className='font-medium text-default-600'>点击选择或拖拽图片到这里</span>
                      <span className='text-sm text-default-400'>支持 jpg, png, gif 等常见图片格式</span>
                    </div>
                  )}
                </div>
              </motion.div>

              <input ref={fileInputRef} type='file' accept='image/*' className='sr-only' onChange={handleFileSelect} />

              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className='rounded-xl border border-default-200 bg-default-50 p-4'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-default-700'>图片信息</span>
                      <div className='flex gap-2'>
                        <Chip size='sm' variant='flat' color='primary'>
                          {file.type.split("/")[1].toUpperCase()}
                        </Chip>
                        <Chip size='sm' variant='flat' color='primary'>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Chip>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className='space-y-4'>
                <Input
                  label='图片描述'
                  placeholder='请输入图片描述（选填）'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant='bordered'
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onPress={handleClose} className='font-medium'>
              取消
            </Button>
            <Button
              color='primary'
              onPress={handleUpload}
              isDisabled={!file}
              className='font-medium bg-yellow-600 hover:bg-yellow-700'
              startContent={<Icon icon='mdi:upload' />}
            >
              上传
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ImageUploadButton

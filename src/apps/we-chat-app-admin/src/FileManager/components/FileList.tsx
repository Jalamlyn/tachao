import React, { useEffect, useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { apiService } from "@/service/apis/api"
import message from "@/components/Message"

interface FileInfo {
  fileId: string
  fileName: string
  fileKey: string
  downloadUrl: string
  type?: string
}

interface Activity {
  id: string
  activityName: string
  activityType: string
  files: FileInfo[]
  createdAt: string
}

const FileList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.post(
        "/public/data/file/activitiess/find",
        {},
        {
          params: { display: "paginate" },
        }
      )
      setActivities(response.data.data)
    } catch (error) {
      console.error("Fetch files error:", error)
      message.error("获取文件列表失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = (file: FileInfo) => {
    setSelectedFile(file)
    onOpen()
  }

  const handleDownload = async (file: FileInfo) => {
    try {
      if (!file.downloadUrl) {
        message.error("下载链接不可用")
        return
      }

      const response = await fetch(file.downloadUrl)
      if (!response.ok) throw new Error("下载失败")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = file.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
      message.error("下载失败，请重试")
    }
  }

  const isImageFile = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)
  }

  const columns = [
    { name: "文件名", uid: "fileName" },
    { name: "操作", uid: "actions" },
  ]

  const renderCell = (activity: Activity, columnKey: string) => {
    const file = activity.files[0] // 假设每个活动只有一个文件

    switch (columnKey) {
      case "fileName":
        return (
          <div className='flex items-center gap-2'>
            <Icon
              icon={isImageFile(file.fileName) ? "solar:gallery-wide-bold" : "solar:document-bold"}
              className='w-5 h-5 text-default-500'
            />
            <span>{file.fileName}</span>
          </div>
        )
      case "createdAt":
        return new Date(activity.createdAt).toLocaleString()
      case "actions":
        return (
          <div className='flex gap-2'>
            {isImageFile(file.fileName) && (
              <Button isIconOnly size='sm' variant='light' onPress={() => handlePreview(file)}>
                <Icon icon='solar:eye-bold' className='w-4 h-4' />
              </Button>
            )}
            <Button isIconOnly size='sm' variant='light' onPress={() => handleDownload(file)}>
              <Icon icon='solar:download-bold' className='w-4 h-4' />
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <Table
        aria-label='文件列表'
        classNames={{
          wrapper: "min-h-[400px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={activities} isLoading={isLoading} loadingContent={<Spinner label='加载中...' />}>
          {(activity) => (
            <TableRow key={activity.id}>
              {(columnKey) => <TableCell>{renderCell(activity, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal size='2xl' isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{selectedFile?.fileName}</ModalHeader>
              <ModalBody>
                {selectedFile && (
                  <img src={selectedFile.downloadUrl} alt={selectedFile.fileName} className='max-w-full h-auto' />
                )}
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  关闭
                </Button>
                <Button color='primary' onPress={() => selectedFile && handleDownload(selectedFile)}>
                  下载
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default FileList

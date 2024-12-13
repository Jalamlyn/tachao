import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Button,
  Modal,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  ModalHeader,
  ModalBody,
  ModalContent,
  ModalFooter,
  Input,
  useDisclosure,
  Image,
  Tooltip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"

import CreateAppModal from "./CreateAppModal"
import AppTypeCard from "./AppTypeCard"
import { queryApps, deleteApp, updateApps } from "@/service/apis/api" // 假设这些API函数已经存在
import { useBreadcrumb } from "../../../contexts/BreadcrumbContext"

const ApplicationList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAppTypeModalOpen, setIsAppTypeModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [apps, setApps] = useState<any[]>([])
  const [selectedAppType, setSelectedAppType] = useState<"install" | "blank" | null>(null)
  const navigate = useNavigate()
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure()
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure()
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure()
  const [selectedApp, setSelectedApp] = useState<any | null>(null)

  const projectId = "" // 固定的 project ID

  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    fetchApps()
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用列表", href: "/we-chat-app/admin/applications" },
    ])
  }, [])

  const fetchApps = async () => {
    try {
      const res = await queryApps({ projectId })
      setApps(res.data)
    } catch (error) {
      console.error("Failed to fetch apps:", error)
    }
  }

  const handleCreateApp = (appName: string) => {
    setApps([...apps, { name: appName }])
    setIsCreateModalOpen(false)
  }

  const handleAppTypeSelect = (type: "install" | "blank") => {
    setSelectedAppType(type)
    setIsAppTypeModalOpen(false)
    if (type === "install") {
      setIsTemplateModalOpen(true)
    } else {
      setIsCreateModalOpen(true)
    }
  }

  const handleTemplateSelect = () => {
    setIsTemplateModalOpen(false)
    setIsCreateModalOpen(true)
  }

  const handleTemplateCancel = () => {
    setIsTemplateModalOpen(false)
    setIsAppTypeModalOpen(true)
  }

  const handleAppDetailClick = (app) => {
    navigate(`/we-chat-app/admin/applications/${app.id}`)
  }

  const handleAppClick = (app: any) => {
    setSelectedApp(app)
    onViewModalOpen()
  }

  const handleEditApp = (app: any) => {
    setSelectedApp(app)
    onEditModalOpen()
  }

  const handleDeleteApp = (app: any) => {
    setSelectedApp(app)
    onDeleteModalOpen()
  }

  const confirmDeleteApp = async () => {
    if (selectedApp) {
      try {
        await deleteApp(selectedApp.id)
        setApps(apps.filter((app) => app.id !== selectedApp.id))
        onDeleteModalClose()
      } catch (error) {
        console.error("Failed to delete app:", error)
      }
    }
  }

  const AppList: React.FC<{ apps: any[] }> = ({ apps }) => {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {apps.map((app, index) => (
          <Card
            onPress={() => handleAppDetailClick(app)}
            key={app.id || index}
            isPressable
            isHoverable
            className='w-full h-[300px]'
          >
            <CardHeader className='absolute z-10 top-1 flex-col items-start'>
              <p className='text-tiny text-white/60 uppercase font-bold'>应用</p>
              <h4 className='text-white font-medium text-large'>{app.name}</h4>
            </CardHeader>
            <Image
              removeWrapper
              alt={`${app.name} background`}
              className='z-0 w-full h-full object-cover'
              src='https://nextui.org/images/card-example-4.jpeg'
            />
            <CardFooter className='absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100'>
              <div className='flex flex-grow gap-2 items-center justify-end'>
                <div className='flex gap-1'>
                  <Tooltip content='查看'>
                    <Button isIconOnly size='sm' variant='light' onPress={() => handleAppClick(app)}>
                      <Icon icon='mdi:eye' width={20} height={20} />
                    </Button>
                  </Tooltip>
                  <Tooltip content='编辑'>
                    <Button isIconOnly size='sm' variant='light' onPress={() => handleEditApp(app)}>
                      <Icon icon='mdi:pencil' width={20} height={20} />
                    </Button>
                  </Tooltip>
                  <Tooltip content='删除'>
                    <Button isIconOnly size='sm' variant='light' color='danger' onPress={() => handleDeleteApp(app)}>
                      <Icon icon='mdi:delete' width={20} height={20} />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4'>
      <div className='my-4'>
        <Button
          size='lg'
          color='primary'
          onPress={() => setIsAppTypeModalOpen(true)}
          startContent={<Icon icon='solar:add-circle-bold' width={24} height={24} />}
        >
          创建应用
        </Button>
      </div>

      <AppList apps={apps} />

      <Modal isOpen={isAppTypeModalOpen} onClose={() => setIsAppTypeModalOpen(false)} size='xl'>
        <ModalContent>
          <ModalHeader>
            <h3>选择创建应用的方式</h3>
          </ModalHeader>
          <ModalBody>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <AppTypeCard
                title='安装应用'
                headerTitle='创建方式'
                icon='mdi:application-import'
                onClick={() => handleAppTypeSelect("install")}
                description='使用预配置的模板快速创建应用'
              />
              <AppTypeCard
                title='空白应用'
                headerTitle='创建方式'
                icon='mdi:application-outline'
                onClick={() => handleAppTypeSelect("blank")}
                description='从头开始创建自定义应用'
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} size='xl'>
        <ModalContent>
          <ModalHeader>
            <h3>选择应用模板</h3>
          </ModalHeader>
          <ModalBody>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
              <AppTypeCard
                title='离散制造业ERP'
                headerTitle='模板'
                icon='mdi:application-cog'
                onClick={handleTemplateSelect}
                description='适用于离散制造业的ERP系统模板'
                imageSrc='https://picsum.photos/seed/erp/300/200'
              />
              {/* 可以在这里添加更多模板 */}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='flat' onPress={handleTemplateCancel}>
              取消
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateApp={handleCreateApp}
        appType={selectedAppType}
      />

      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size='md'>
        <ModalContent>
          <ModalHeader>查看应用</ModalHeader>
          <ModalBody>
            <p>应用名称: {selectedApp?.name}</p>
            <p>Project ID: {projectId}</p>
            {/* 这里可以添加更多应用详情 */}
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={onViewModalClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size='md'>
        <ModalContent>
          <ModalHeader>编辑应用</ModalHeader>
          <ModalBody>
            <Input label='应用名称' placeholder='输入新的应用名称' defaultValue={selectedApp?.name || ""} />
            {/* 这里可以添加更多编辑字段 */}
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onPress={onEditModalClose}>
              取消
            </Button>
            <Button color='primary' onPress={onEditModalClose}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size='sm'>
        <ModalContent>
          <ModalHeader>删除应用</ModalHeader>
          <ModalBody>
            <p>确定要删除应用 "{selectedApp?.name}" 吗？此操作不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onDeleteModalClose}>
              取消
            </Button>
            <Button color='danger' onPress={confirmDeleteApp}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default ApplicationList

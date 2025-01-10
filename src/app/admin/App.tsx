"use client"

import React, { useEffect, useState } from "react"
import { Avatar, Button, Spacer, Tab, Tabs, Tooltip, useDisclosure, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useMediaQuery } from "usehooks-ts"
import { cn } from "@nextui-org/react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import SidebarDrawer from "./src/components/SidebarDrawer"
import Sidebar from "./src/components/Sidebar"
import { useGlobalUser } from "@/hooks/useGlobalUser"
import { items } from "./src/components/Items"
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext"
import GlobalBreadcrumb from "@/components/GlobalBreadcrumb"
import ServiceSupportModal from "./src/components/ServiceSupportModal"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"

export default function Component() {
  const { isOpen, onOpenChange } = useDisclosure()
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const location = useLocation()
  const navigate = useNavigate()
  const { userInfo, loading } = useGlobalUser()
  const { isOpen: isServiceModalOpen, onOpen: onServiceModalOpen, onClose: onServiceModalClose } = useDisclosure()
  const { isOpen: isLogoutModalOpen, onOpen: onLogoutModalOpen, onClose: onLogoutModalClose } = useDisclosure()
  const [enterpriseName, setEnterpriseName] = useState("")

  useEffect(() => {
    const cachedLabel = localStorage.getItem("cachedLabel")
    if (cachedLabel) {
      setEnterpriseName(cachedLabel || "")
    }
  }, [])

  // 添加账号类型检查
  useEffect(() => {
    if (!loading && userInfo) {
      // 检查是否是内部账号（以nb_开头）
      const isInternalAccount = userInfo.name?.startsWith('nb_')
      if (!isInternalAccount) {
        // 如果不是内部账号，重定向到错误页面
        navigate("/admin/error")
      }
    }
  }, [loading, userInfo, navigate])

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const handleLogout = () => {
    onLogoutModalOpen()
  }

  const confirmLogout = async () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    const auth = app.auth()
    await auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    onLogoutModalClose()
    window.location.href = "/login"
  }

  // 如果正在加载或没有用户信息，显示加载状态
  if (loading || !userInfo) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spinner size="lg" label="加载中..." />
      </div>
    )
  }

  return (
    <BreadcrumbProvider>
      <div className='flex h-screen w-full gap-4 overflow-hidden'>
        <SidebarDrawer
          className={cn("min-w-[288px] rounded-lg h-[calc(100vh-24px)] m-3", { "min-w-[76px]": isCollapsed })}
          hideCloseButton={true}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <div
            className={cn("will-change relative flex h-full w-72 flex-col bg-default-100 p-6 transition-width", {
              "w-[83px] items-center px-[6px] py-6": isCollapsed,
            })}
          >
            <div
              className={cn("flex items-center gap-3 pl-2", {
                "justify-center gap-0 pl-0": isCollapsed,
              })}
            >
              <span className={cn("text-medium font-bold", { hidden: isCollapsed })}>
                {enterpriseName || "企业管理平台"}
              </span>
              <div className={cn("flex-end flex", { hidden: isCollapsed })}>
                <Icon
                  className='cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]'
                  icon='solar:round-alt-arrow-left-line-duotone'
                  width={24}
                  onClick={isMobile ? onOpenChange : onToggle}
                />
              </div>
            </div>
            <Spacer y={6} />
            <div className='flex items-center gap-3 px-3'>
              <Avatar isBordered size='sm' src={userInfo?.avatar || "https://picsum.photos/300"} />
              <div className={cn("flex max-w-full flex-col", { hidden: isCollapsed })}>
                <p className='text-small font-medium text-foreground'>
                  {loading ? "Loading..." : userInfo?.name || "Unknown User"}
                </p>
                <p className='text-tiny font-medium text-default-400'>
                  {loading ? "Loading..." : userInfo?.userRoles[0]?.keyz || "Unknown Role"}
                </p>
              </div>
            </div>

            <Spacer y={6} />

            <Sidebar
              defaultSelectedKey='applications'
              iconClassName='group-data-[selected=true]:text-default-50'
              isCompact={isCollapsed}
              itemClasses={{
                base: "px-3 rounded-large data-[selected=true]:!bg-foreground",
                title: "group-data-[selected=true]:text-default-50",
              }}
              items={items}
              selectedKeys={[location.pathname.split("/")[3] || "applications"]}
              onSelectionChange={(key) => navigate(`/admin/${key}`)}
            />

            <Spacer y={8} />

            <div
              className={cn("mt-auto flex flex-col", {
                "items-center": isCollapsed,
              })}
            >
              {isCollapsed && (
                <Button isIconOnly className='flex h-10 w-10 text-default-600' size='sm' variant='light'>
                  <Icon
                    className='cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]'
                    height={24}
                    icon='solar:round-alt-arrow-right-line-duotone'
                    width={24}
                    onClick={onToggle}
                  />
                </Button>
              )}
              <Tooltip content='Support' isDisabled={!isCollapsed} placement='right'>
                <Button
                  fullWidth
                  className={cn(
                    "relative justify-start truncate bg-gradient-to-r from-primary-500/20 to-secondary-500/20 hover:from-primary-500/30 hover:to-secondary-500/30 transition-all duration-300",
                    "group overflow-hidden",
                    {
                      "justify-center": isCollapsed,
                    }
                  )}
                  startContent={
                    isCollapsed ? null : (
                      <div className='relative'>
                        <Icon className='flex-none text-primary-500' icon='solar:info-circle-line-duotone' width={24} />
                        <span className='absolute -right-1 -top-1'>
                          <span className='relative flex h-2 w-2'>
                            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75'></span>
                            <span className='relative inline-flex h-2 w-2 rounded-full bg-primary-500'></span>
                          </span>
                        </span>
                      </div>
                    )
                  }
                  variant='flat'
                  onPress={onServiceModalOpen}
                >
                  {isCollapsed ? (
                    <div className='relative'>
                      <Icon className='text-primary-500' icon='solar:info-circle-line-duotone' width={24} />
                      <span className='absolute -right-1 -top-1'>
                        <span className='relative flex h-2 w-2'>
                          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75'></span>
                          <span className='relative inline-flex h-2 w-2 rounded-full bg-primary-500'></span>
                        </span>
                      </span>
                    </div>
                  ) : (
                    <span className='font-medium text-primary-700'>增值服务</span>
                  )}
                  {!isCollapsed && (
                    <div className='absolute inset-0 -z-10 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                  )}
                </Button>
              </Tooltip>
              <Tooltip content='Log Out' isDisabled={!isCollapsed} placement='right'>
                <Button
                  className={cn("justify-start text-default-500 data-[hover=true]:text-foreground", {
                    "justify-center": isCollapsed,
                  })}
                  onClick={handleLogout}
                  isIconOnly={isCollapsed}
                  startContent={
                    isCollapsed ? null : (
                      <Icon
                        className='flex-none rotate-180 text-default-500'
                        icon='solar:minus-circle-line-duotone'
                        width={24}
                      />
                    )
                  }
                  variant='light'
                >
                  {isCollapsed ? (
                    <Icon className='rotate-180 text-default-500' icon='solar:minus-circle-line-duotone' width={24} />
                  ) : (
                    "退出登录"
                  )}
                </Button>
              </Tooltip>
            </div>
          </div>
        </SidebarDrawer>

        <div className='w-full max-h-screen overflow-hidden md:max-w-[calc(100%-40px)] flex-1 p-4'>
          <GlobalBreadcrumb />
          <div className='px-4'>
            <Outlet />
          </div>
        </div>

        <ServiceSupportModal isOpen={isServiceModalOpen} onClose={onServiceModalClose} />

        <Modal isOpen={isLogoutModalOpen} onClose={onLogoutModalClose}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>确认退出</ModalHeader>
            <ModalBody>
              <p>确定要退出登录吗？</p>
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onLogoutModalClose}>
                取消
              </Button>
              <Button color='primary' onPress={confirmLogout}>
                确认退出
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </BreadcrumbProvider>
  )
}
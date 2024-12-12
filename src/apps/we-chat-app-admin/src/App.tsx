"use client"

import React from "react"
import { Avatar, Button, Spacer, Tab, Tabs, Tooltip, useDisclosure } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useMediaQuery } from "usehooks-ts"
import { cn } from "@nextui-org/react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import SidebarDrawer from "../component/sidebar-drawer"
import Sidebar from "../component/sidebar"
import { useGlobalUser } from "@/hooks/useGlobalUser"
import { items } from "../component/items"
import Logo from "../component/logo/Logo"
import { BreadcrumbProvider } from "../../../contexts/BreadcrumbContext"
import GlobalBreadcrumb from "../../../components/GlobalBreadcrumb"
import ServiceSupportModal from "./ServiceSupportModal"

export default function Component() {
  const { isOpen, onOpenChange } = useDisclosure()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const location = useLocation()
  const navigate = useNavigate()
  const { userInfo, loading } = useGlobalUser()
  const { isOpen: isServiceModalOpen, onOpen: onServiceModalOpen, onClose: onServiceModalClose } = useDisclosure()

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const handleLogout = () => {
    navigate("/login")
  }

  return (
    <BreadcrumbProvider>
      <div className='flex h-screen w-full gap-4 overflow-hidden'>
        {/* Sidebar */}
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
              <Logo />
              <span
                className={cn("w-full text-small font-bold uppercase opacity-100", {
                  "w-0 opacity-0": isCollapsed,
                })}
              ></span>
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
              onSelectionChange={(key) => navigate(`/we-chat-app/admin/${key}`)}
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
                      <div className="relative">
                        <Icon className='flex-none text-primary-500' icon='solar:info-circle-line-duotone' width={24} />
                        <span className="absolute -right-1 -top-1">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
                          </span>
                        </span>
                      </div>
                    )
                  }
                  variant='flat'
                  onPress={onServiceModalOpen}
                >
                  {isCollapsed ? (
                    <div className="relative">
                      <Icon className='text-primary-500' icon='solar:info-circle-line-duotone' width={24} />
                      <span className="absolute -right-1 -top-1">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
                        </span>
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium text-primary-700">增值服务</span>
                  )}
                  {!isCollapsed && (
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
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

        {/*  Content */}
        <div className='w-full max-h-screen overflow-hidden md:max-w-[calc(100%-40px)] flex-1 p-4'>
          <GlobalBreadcrumb />
          <div className='content-container'>
            <Outlet />
          </div>
        </div>

        {/* Service Support Modal */}
        <ServiceSupportModal isOpen={isServiceModalOpen} onClose={onServiceModalClose} />
      </div>
    </BreadcrumbProvider>
  )
}
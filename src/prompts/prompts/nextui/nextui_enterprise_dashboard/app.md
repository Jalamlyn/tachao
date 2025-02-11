<mo-ai-code type="app">
const {
  wpm,
  React,
  ReactRouterDom,
  observer,
  NextUI,
  Icon,
  FramerMotion,
  message,
  api,
  mobx,
  appId,
  cn
} = context;

const { Routes, Route, Navigate, useNavigate } = ReactRouterDom;
const { ScrollShadow, Spacer, Avatar, Button, useDisclosure } = NextUI;

// 导入组件
const OutsourceDashboard = await context.wpm.import('page_outsource_dashboard');
const Sidebar = await context.wpm.import('comp_sidebar');
const SidebarDrawer = await context.wpm.import('comp_sidebar_drawer');

const App = observer(() => {
  const {isOpen, onOpenChange} = useDisclosure();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = window.innerWidth <= 768;
  const navigate = useNavigate();

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <NextUI.NextUIProvider navigate={navigate}>
      <div className="flex h-screen w-full p-2">
        {/* 侧边栏 */}
        <SidebarDrawer
          className={cn("min-w-[288px] rounded-lg", {"min-w-[76px]": isCollapsed})}
          hideCloseButton={true}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <div
            className={cn(
              "will-change relative flex h-full w-72 flex-col bg-default-100 p-6 transition-width",
              {
                "w-[83px] items-center px-[6px] py-6": isCollapsed,
              },
            )}
          >
            <div
              className={cn("flex items-center gap-3 pl-2", {
                "justify-center gap-0 pl-0": isCollapsed,
              })}
            >
              <span
                className={cn("w-full text-small font-bold uppercase opacity-100", {
                  "w-0 opacity-0": isCollapsed,
                })}
              >
                委外加工管理系统
              </span>
              <div className={cn("flex-end flex", {hidden: isCollapsed})}>
                <Icon
                  className="cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]"
                  icon="solar:round-alt-arrow-left-line-duotone"
                  width={24}
                  onClick={isMobile ? onOpenChange : onToggle}
                />
              </div>
            </div>
            <Spacer y={6} />
            <div className="flex items-center gap-3 px-3">
              <Avatar
                isBordered
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
              />
              <div className={cn("flex max-w-full flex-col", {hidden: isCollapsed})}>
                <p className="text-small font-medium text-foreground">管理员</p>
                <p className="text-tiny font-medium text-default-400">系统管理员</p>
              </div>
            </div>

            <Spacer y={6} />

            <Sidebar
              defaultSelectedKey="dashboard"
              iconClassName="group-data-[selected=true]:text-default-50"
              isCompact={isCollapsed}
              items={[
                {
                  key: "dashboard",
                  title: "委外统计",
                  icon: "solar:chart-2-bold-duotone",
                  href: "/dashboard"
                },
                {
                  key: "plan",
                  title: "委外计划",
                  icon: "solar:calendar-bold-duotone",
                  href: "/plan"
                },
                {
                  key: "process",
                  title: "委外执行",
                  icon: "solar:widget-2-bold-duotone",
                  href: "/process"
                },
                {
                  key: "supplier",
                  title: "供应商管理",
                  icon: "solar:users-group-rounded-bold-duotone",
                  href: "/supplier"
                },
                {
                  key: "report",
                  title: "统计报表",
                  icon: "solar:document-bold-duotone",
                  href: "/report"
                }
              ]}
              itemClasses={{
                base: "px-3 rounded-large data-[selected=true]:!bg-foreground",
                title: "group-data-[selected=true]:text-default-50",
              }}
            />

            <Spacer y={8} />

            <div
              className={cn("mt-auto flex flex-col", {
                "items-center": isCollapsed,
              })}
            >
              {isCollapsed && (
                <Button
                  isIconOnly
                  className="flex h-10 w-10 min-w-5 text-default-600"
                  size="sm"
                  variant="light"
                >
                  <Icon
                    className="cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]"
                    height={24}
                    icon="solar:round-alt-arrow-right-line-duotone"
                    width={24}
                    onClick={onToggle}
                  />
                </Button>
              )}
              <NextUI.Tooltip content="帮助支持" isDisabled={!isCollapsed} placement="right">
                <Button
                  fullWidth
                  className={cn(
                    "justify-start truncate text-default-600 data-[hover=true]:text-foreground",
                    {
                      "justify-center": isCollapsed,
                    },
                  )}
                  isIconOnly={isCollapsed}
                  startContent={
                    isCollapsed ? null : (
                      <Icon
                        className="flex-none text-default-600"
                        icon="solar:info-circle-line-duotone"
                        width={24}
                      />
                    )
                  }
                  variant="light"
                >
                  {isCollapsed ? (
                    <Icon
                      className="text-default-500"
                      icon="solar:info-circle-line-duotone"
                      width={24}
                    />
                  ) : (
                    "帮助支持"
                  )}
                </Button>
              </NextUI.Tooltip>
              <NextUI.Tooltip content="退出登录" isDisabled={!isCollapsed} placement="right">
                <Button
                  className={cn("justify-start text-default-500 data-[hover=true]:text-foreground", {
                    "justify-center": isCollapsed,
                  })}
                  isIconOnly={isCollapsed}
                  startContent={
                    isCollapsed ? null : (
                      <Icon
                        className="flex-none rotate-180 text-default-500"
                        icon="solar:logout-3-bold-duotone"
                        width={24}
                      />
                    )
                  }
                  variant="light"
                >
                  {isCollapsed ? (
                    <Icon
                      className="rotate-180 text-default-500"
                      icon="solar:logout-3-bold-duotone"
                      width={24}
                    />
                  ) : (
                    "退出登录"
                  )}
                </Button>
              </NextUI.Tooltip>
            </div>
          </div>
        </SidebarDrawer>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="w-full">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<OutsourceDashboard />} />
              </Routes>
          </div>
        </div>
      </div>
    </NextUI.NextUIProvider>
  );
});

context.wpm.export(appId, App);
</mo-ai-code>
# 应用入口模块的代码例子

```jsx
<mo-ai-code type="app">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context
const { Routes, Route, Navigate, useNavigate } = ReactRouterDom;
const { ScrollShadow, Spacer, Avatar, Button, useDisclosure, Spinner, Divider } = NextUI;

// 导入页面组件
const DeliveryPage = await context.wpm.import('page_delivery');
const ReportPage = await context.wpm.import('page_report');
const AIPage = await context.wpm.import('page_ai');
const DeliverySharePage = await context.wpm.import('page_delivery_share');
const AIStandalonePage = await context.wpm.import('page_ai_standalone');
const CustomerProfilePage = await context.wpm.import('page_customer_profile');

// 导入组件
const Sidebar = await context.wpm.import('comp_sidebar');
const SidebarDrawer = await context.wpm.import('comp_sidebar_drawer');
const userStore = await context.wpm.import('store_user');

const App = observer(() => {
  const {isOpen, onOpenChange} = useDisclosure();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = window.innerWidth <= 768;
  const navigate = useNavigate();
  const location = ReactRouterDom.useLocation();

  React.useEffect(() => {
    userStore.loadUserInfo();
  }, []);

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // 判断是否是独立页面
  const isStandalonePage = location.pathname.startsWith('/share') || location.pathname.startsWith('/ai-standalone');

  if (isStandalonePage) {
    return (
      <NextUI.NextUIProvider navigate={navigate}>
        <Routes>
          <Route path="/share/:id" element={<DeliverySharePage />} />
          <Route path="/ai-standalone" element={<AIStandalonePage />} />
        </Routes>
      </NextUI.NextUIProvider>
    );
  }

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
                江阴郎牌特曲配送管理
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
                {userStore.isLoading ? (
                  <Spinner size="sm" />
                ) : userStore.error ? (
                  <p className="text-small text-danger">加载失败</p>
                ) : (
                  <>
                    <p className="text-small font-medium text-foreground">
                      {userStore.userInfo?.name || '未知用户'}
                    </p>
                    <p className="text-tiny font-medium text-default-400">
                      {userStore.userInfo?.account || '未知账号'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {!isCollapsed && (
              <>
                <Divider className="my-4" />
                <div className="px-3 space-y-1">
                  <p className="text-tiny text-default-500">企业信息</p>
                  <p className="text-small font-medium text-foreground">
                    {userStore.enterpriseInfo?.name || '未知企业'}
                  </p>
                  <p className="text-tiny text-default-400">
                    ID: {userStore.enterpriseInfo?.id || '-'}
                  </p>
                </div>
                <Divider className="my-4" />
              </>
            )}

            <Sidebar
              defaultSelectedKey="delivery"
              iconClassName="group-data-[selected=true]:text-default-50"
              isCompact={isCollapsed}
              items={[
                {
                  key: "delivery",
                  title: "送货单管理",
                  icon: "solar:delivery-bold-duotone",
                  href: "/delivery"
                },
                {
                  key: "customer-profile",
                  title: "客户档案",
                  icon: "solar:users-group-rounded-bold",
                  href: "/customer-profile"
                },
                {
                  key: "report",
                  title: "数据报表",
                  icon: "solar:chart-2-bold-duotone",
                  href: "/report"
                },
                {
                  key: "ai",
                  title: "智能助手",
                  icon: "hugeicons:ai-search",
                  href: "/ai"
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
            </div>
          </div>
        </SidebarDrawer>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="w-full">
              <Routes>
                <Route path="/" element={<Navigate to="/delivery" replace />} />
                <Route path="/delivery" element={<DeliveryPage />} />
                <Route path="/customer-profile" element={<CustomerProfilePage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/ai" element={<AIPage />} />
              </Routes>
          </div>
        </div>
      </div>
    </NextUI.NextUIProvider>
  );
});
context.wpm.export(appId, App);
App.displayName = 'App';
</mo-ai-code>
```

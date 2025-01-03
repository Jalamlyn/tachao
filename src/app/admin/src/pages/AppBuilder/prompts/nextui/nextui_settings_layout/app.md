```jsx
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
  ai,
  mobx,
  appId
} = context;

const { Routes, Route, Navigate } = ReactRouterDom;
const { ScrollShadow, Spacer, Avatar, Button, useDisclosure, Tabs, Tab } = NextUI;

// 导入组件
const ProfileSetting = await wpm.import('page_profile_setting');
const AppearanceSetting = await wpm.import('page_appearance_setting');
const AccountSetting = await wpm.import('page_account_setting');
const BillingSetting = await wpm.import('page_billing_setting');
const TeamSetting = await wpm.import('page_team_setting');
const Sidebar = await wpm.import('comp_sidebar');
const SidebarDrawer = await wpm.import('comp_sidebar_drawer');
const AcmeIcon = await wpm.import('comp_acme_icon');

const App = observer(() => {
  const {isOpen, onOpenChange} = useDisclosure();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = window.innerWidth <= 768;

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-dvh w-full gap-4">
      {/* Sidebar */}
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
              <AcmeIcon className="text-background" />
            </div>
            <span
              className={cn("w-full text-small font-bold uppercase opacity-100", {
                "w-0 opacity-0": isCollapsed,
              })}
            >
              Acme
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
              <p className="text-small font-medium text-foreground">Kate Moore</p>
              <p className="text-tiny font-medium text-default-400">Customer Support</p>
            </div>
          </div>

          <Spacer y={6} />

          <Sidebar
            defaultSelectedKey="settings"
            iconClassName="group-data-[selected=true]:text-default-50"
            isCompact={isCollapsed}
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
                className="flex h-10 w-10 text-default-600"
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
            <NextUI.Tooltip content="Support" isDisabled={!isCollapsed} placement="right">
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
                  "Support"
                )}
              </Button>
            </NextUI.Tooltip>
            <NextUI.Tooltip content="Log Out" isDisabled={!isCollapsed} placement="right">
              <Button
                className={cn("justify-start text-default-500 data-[hover=true]:text-foreground", {
                  "justify-center": isCollapsed,
                })}
                isIconOnly={isCollapsed}
                startContent={
                  isCollapsed ? null : (
                    <Icon
                      className="flex-none rotate-180 text-default-500"
                      icon="solar:minus-circle-line-duotone"
                      width={24}
                    />
                  )
                }
                variant="light"
              >
                {isCollapsed ? (
                  <Icon
                    className="rotate-180 text-default-500"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                ) : (
                  "Log Out"
                )}
              </Button>
            </NextUI.Tooltip>
          </div>
        </div>
      </SidebarDrawer>

      {/*  Settings Content */}
      <div className="w-full max-w-2xl flex-1 p-4">
        {/* Title */}
        <div className="flex items-center gap-x-3">
          <Button
            isIconOnly
            className="sm:hidden"
            size="sm"
            variant="flat"
            onPress={() => {
              setIsCollapsed(false);
              onOpenChange();
            }}
          >
            <Icon
              className="text-default-500"
              icon="solar:sidebar-minimalistic-linear"
              width={20}
            />
          </Button>
          <h1 className="text-3xl font-bold leading-9 text-default-foreground">Settings</h1>
        </div>
        <h2 className="mt-2 text-small text-default-500">
          Customize settings, email preferences, and web appearance.
        </h2>
        {/*  Tabs */}
        <Tabs
          fullWidth
          classNames={{
            base: "mt-6",
            cursor: "bg-content1 dark:bg-content1",
            panel: "w-full p-0 pt-4",
          }}
        >
          <Tab key="profile" title="Profile">
            <ProfileSetting />
          </Tab>
          <Tab key="appearance" title="Appearance">
            <AppearanceSetting />
          </Tab>
          <Tab key="account" title="Account">
            <AccountSetting />
          </Tab>
          <Tab key="billing" title="Billing">
            <BillingSetting />
          </Tab>
          <Tab key="team" title="Team">
            <TeamSetting />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
});

wpm.export(appId, App);
</mo-ai-code>
```
<mo-ai-code type="app" >
const {
  React,
  wpm,
  ReactRouterDom,
  observer,
  appId,
  Icon,
  FramerMotion,
  NextUI,
  message,
  api,
  ai,
  mobx,
  recharts
} = context;

const { Routes, Route, Navigate } = ReactRouterDom;
const {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Funnel,
  FunnelChart,
  LabelList
} = recharts;

// 导入页面组件
const HomePage = await wpm.import('page_home');
const CustomerListPage = await wpm.import('page_customer_list');
const CustomerFormPage = await wpm.import('page_customer_form');
const CustomerDetailPage = await wpm.import('page_customer_detail');
const LeadListPage = await wpm.import('page_lead_list');
const LeadFormPage = await wpm.import('page_lead_form');
const LeadDetailPage = await wpm.import('page_lead_detail');
const OpportunityListPage = await wpm.import('page_opportunity_list');
const OpportunityFormPage = await wpm.import('page_opportunity_form');
const OpportunityDetailPage = await wpm.import('page_opportunity_detail');
const OrderListPage = await wpm.import('page_order_list');
const OrderFormPage = await wpm.import('page_order_form');
const OrderDetailPage = await wpm.import('page_order_detail');
const ReportPage = await wpm.import('page_report');

// 导入数据服务
const DataStore = await wpm.import('store_data');

// 应用布局组件
const AppLayout = observer(() => {
  const { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, useDisclosure } = NextUI;
  const navigate = ReactRouterDom.useNavigate();
  const location = ReactRouterDom.useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const navItems = [
    {
      key: "dashboard",
      label: "仪表盘",
      path: "",
      icon: "mdi:view-dashboard"
    },
    {
      key: "customers",
      label: "客户管理",
      path: "customers",
      icon: "mdi:account-group"
    },
    {
      key: "leads",
      label: "线索管理",
      path: "leads",
      icon: "mdi:lighthouse"
    },
    {
      key: "opportunities",
      label: "商机管理",
      path: "opportunities",
      icon: "mdi:currency-usd"
    },
    {
      key: "orders",
      label: "订单管理",
      path: "orders",
      icon: "mdi:file-document"
    },
    {
      key: "reports",
      label: "统计报表",
      path: "reports",
      icon: "mdi:chart-box"
    }
  ];

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-dvh w-full gap-x-3">
      <SidebarDrawer
        className={cn("min-w-[288px] rounded-lg", {"min-w-[76px]": isCollapsed})}
        hideCloseButton={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <div className={cn(
          "will-change relative flex h-full w-72 flex-col bg-default-100 p-6 transition-width",
          {
            "w-[83px] items-center px-[6px] py-6": isCollapsed,
          }
        )}>
          <div className={cn("flex items-center gap-3 pl-2", {
            "justify-center gap-0 pl-0": isCollapsed,
          })}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
              <Icon icon="mdi:store" className="text-background" />
            </div>
            <span className={cn("w-full text-small font-bold uppercase opacity-100", {
              "w-0 opacity-0": isCollapsed,
            })}>
              CRM系统
            </span>
            <div className={cn("flex-end flex", {hidden: isCollapsed})}>
              <Icon
                className="cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]"
                icon="solar:round-alt-arrow-left-line-duotone"
                width={24}
                onClick={onToggle}
              />
            </div>
          </div>

          <Spacer y={6} />

          <Sidebar
            defaultSelectedKey="dashboard"
            iconClassName="group-data-[selected=true]:text-default-50"
            isCompact={isCollapsed}
            itemClasses={{
              base: "px-3 rounded-large data-[selected=true]:!bg-foreground",
              title: "group-data-[selected=true]:text-default-50",
            }}
            items={navItems}
            selectedKeys={[location.pathname.split("/")[0] || "dashboard"]}
            onSelectionChange={(key) => {
              navigate(navItems.find(item => item.key === key)?.path || "");
            }}
          />
        </div>
      </SidebarDrawer>

      <main className="w-full">
        <div className="grid grid-cols-12 gap-0 overflow-y-hidden p-0 pb-2 sm:rounded-large sm:border-small sm:border-default-200">
          <div className="col-span-12">
            <Routes>
              <Route path="" element={<HomePage />} />
              <Route path="customers" element={<CustomerListPage />} />
              <Route path="customers/new" element={<CustomerFormPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="customers/:id/edit" element={<CustomerFormPage />} />
              <Route path="leads" element={<LeadListPage />} />
              <Route path="leads/new" element={<LeadFormPage />} />
              <Route path="leads/:id" element={<LeadDetailPage />} />
              <Route path="leads/:id/edit" element={<LeadFormPage />} />
              <Route path="opportunities" element={<OpportunityListPage />} />
              <Route path="opportunities/new" element={<OpportunityFormPage />} />
              <Route path="opportunities/:id" element={<OpportunityDetailPage />} />
              <Route path="opportunities/:id/edit" element={<OpportunityFormPage />} />
              <Route path="orders" element={<OrderListPage />} />
              <Route path="orders/new" element={<OrderFormPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="orders/:id/edit" element={<OrderFormPage />} />
              <Route path="reports" element={<ReportPage />} />
              <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
});

// 配置路由
const App = () => {
  return (
    <Routes>
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
};

wpm.export(appId, App);
</mo-ai-code>
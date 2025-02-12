# 应用代码导出

## All Modules

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
} = context;

const { Routes, Route, Navigate, useNavigate, useLocation } = ReactRouterDom;
const { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } = NextUI;

// 导入页面组件
api.log.info('开始导入页面组件');

const InvitationPage = await context.wpm.import('page_invitation');
const DashboardPage = await context.wpm.import('page_dashboard');

api.log.info('页面组件导入完成');

const App = observer(({basename}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 检查是否是分享模式
  const isSharedMode = location.search.includes('share=true');

  React.useEffect(() => {
    api.log.info('应用初始化', {
      isSharedMode,
      pathname: location.pathname,
      search: location.search
    });
  }, []);

  return (
    <NextUI.NextUIProvider navigate={navigate}>
      <div className="min-h-screen bg-background">
        {/* 非分享模式才显示导航栏 */}
        {!isSharedMode && (
          <Navbar>
            <NavbarBrand>
              <Icon icon="solar:calendar-bold-duotone" className="w-6 h-6 text-primary"/>
              <p className="font-bold text-inherit ml-2">2025开年大会</p>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
              <NavbarItem>
                <Link color="foreground" href="/">
                  邀请函
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link color="foreground" href="/dashboard">
                  统计后台
                </Link>
              </NavbarItem>
            </NavbarContent>
          </Navbar>
        )}

        <main className={cn(
          "container mx-auto",
          isSharedMode ? "py-0" : "py-4 px-6"
        )}>
          <Routes>
            <Route path="/" element={<InvitationPage isSharedMode={isSharedMode} />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </NextUI.NextUIProvider>
  );
});

// 导出应用
api.log.info('导出应用入口模块');
context.wpm.export(appId, App);
App.displayName = 'App';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_bar_chart" title="柱状图组件">
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
} = context;

const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } = recharts;

const CustomBarChart = observer(({
  data,
  categories,
  color = 'primary',
  height = 240,
  className
}) => {
  const formatTooltipValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--nextui-default-200)"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--nextui-default-600)' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--nextui-default-600)' }}
            tickFormatter={formatTooltipValue}
          />
          <Tooltip
            cursor={{ fill: 'var(--nextui-default-100)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;

              return (
                <div className="bg-background border border-default-200 rounded-lg shadow-lg p-2">
                  <p className="text-small font-medium mb-1">{label}</p>
                  {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: `var(--nextui-${color}-${(index + 1) * 200})`
                        }}
                      />
                      <span className="text-small text-default-600">
                        {entry.name}: {formatTooltipValue(entry.value)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              stackId="a"
              fill={`var(--nextui-${color}-${(index + 1) * 200})`}
              radius={index === categories.length - 1 ? [4, 4, 0, 0] : 0}
              maxBarSize={30}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

context.wpm.export('comp_bar_chart', CustomBarChart);
CustomBarChart.displayName = 'CustomBarChart';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_chart_card" title="图表卡片组件">
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
} = context;

const { Card, CardBody, CardHeader, Button, Select, SelectItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } = NextUI;
const { motion } = FramerMotion;

const ChartCard = observer(({
  title,
  value,
  unit,
  color = 'primary',
  categories = [],
  description,
  icon,
  children,
  onTimeRangeChange,
  onExport,
  className
}) => {
  return (
    <Card className={cn("border-none shadow-sm", className)}>
      <CardHeader className="flex justify-between gap-2 px-6 pt-6">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              `bg-${color}/10 text-${color}`
            )}>
              <Icon icon={icon} className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-small font-medium text-default-600">{title}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">{value}</span>
              {unit && <span className="text-small text-default-400">{unit}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            size="sm"
            defaultSelectedKeys={["week"]}
            className="w-32"
            onChange={onTimeRangeChange}
          >
            <SelectItem key="day" value="day">今日</SelectItem>
            <SelectItem key="week" value="week">本周</SelectItem>
            <SelectItem key="month" value="month">本月</SelectItem>
            <SelectItem key="year" value="year">今年</SelectItem>
          </Select>

          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
              >
                <Icon icon="solar:menu-dots-bold" className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="export"
                startContent={<Icon icon="solar:file-download-bold" className="w-4 h-4" />}
                onPress={onExport}
              >
                导出数据
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>

      <CardBody className="px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-[240px]"
        >
          {children}
        </motion.div>

        {categories.length > 0 && (
          <div className="flex justify-center gap-4 mt-4">
            {categories.map((category, index) => (
              <div key={category} className="flex items-center gap-1">
                <span
                  className={cn(
                    "w-3 h-3 rounded-full",
                    `bg-${color}-${(index + 1) * 200}`
                  )}
                />
                <span className="text-small text-default-600">{category}</span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_chart_card', ChartCard);
ChartCard.displayName = 'ChartCard';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_registration_form" title="注册表单组件">
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
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { Card, CardBody, Input, Button, Switch, Textarea, Select, SelectItem } = NextUI;
const { useForm, Controller } = ReactHookForm;
const { motion } = FramerMotion;

const statusOptions: StatusOption[] = [
  {
    label: '确认参加',
    value: 'confirmed',
    description: '我会准时参加',
    color: 'success',
    icon: 'solar:check-circle-bold-duotone'
  },
  {
    label: '待定',
    value: 'pending',
    description: '需要进一步确认',
    color: 'warning',
    icon: 'solar:clock-circle-bold-duotone'
  },
  {
    label: '可能参加',
    value: 'maybe',
    description: '时间安排待确定',
    color: 'primary',
    icon: 'solar:question-circle-bold-duotone'
  },
  {
    label: '无法参加',
    value: 'declined',
    description: '很抱歉无法参加',
    color: 'danger',
    icon: 'solar:close-circle-bold-duotone'
  }
];

const attendeeOptions: AttendeeOption[] = [
  { label: '1人', value: 1 },
  { label: '2人', value: 2 },
  { label: '3人', value: 3 },
  { label: '4人', value: 4 },
  { label: '5人', value: 5 },
  { label: '6-10人', value: 10 },
  { label: '10人以上', value: 99 }
];

const RegistrationForm = observer(({ onSubmit, loading }) => {
  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      companyName: '',
      contactName: '',
      contactPhone: '',
      email: '',
      attendees: 1,
      needsDinner: true,
      needsHotel: false,
      specialRequirements: '',
      status: 'confirmed' as AttendanceStatus
    }
  });

  const status = watch('status');

  const onSubmitForm = handleSubmit(async (data) => {
    try {
      api.log.info('提交表单数据', {
        formData: data
      });

      await onSubmit({
        ...data,
        id: `${Date.now()}`,
        attendees: Number(data.attendees)
      });
    } catch (error) {
      api.log.error('表单提交失败', {
        error: error.message,
        formData: data
      });
    }
  });

  return (
    <Card>
      <CardBody>
        <form onSubmit={onSubmitForm} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statusOptions.map(option => (
              <Controller
                key={option.value}
                name="status"
                control={control}
                rules={{ required: '请选择参会状态' }}
                render={({ field }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      isPressable
                      isHoverable
                      className={cn(
                        "border-2",
                        field.value === option.value
                          ? `border-${option.color} bg-${option.color}-50`
                          : "border-transparent"
                      )}
                      onPress={() => field.onChange(option.value)}
                    >
                      <CardBody className="flex flex-row items-center gap-4 p-4">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          `bg-${option.color}-100 text-${option.color}`
                        )}>
                          <Icon icon={option.icon} className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold">{option.label}</p>
                          <p className="text-small text-default-500">
                            {option.description}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                )}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="companyName"
              control={control}
              rules={{ required: '请输入公司名称' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="公司名称"
                  placeholder="请输入公司名称"
                  isRequired
                  errorMessage={errors.companyName?.message}
                  startContent={
                    <Icon icon="solar:building-bold-duotone" className="w-4 h-4 text-default-400" />
                  }
                />
              )}
            />

            <Controller
              name="contactName"
              control={control}
              rules={{ required: '请输入联系人姓名' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="联系人"
                  placeholder="请输入联系人姓名"
                  isRequired
                  errorMessage={errors.contactName?.message}
                  startContent={
                    <Icon icon="solar:user-bold-duotone" className="w-4 h-4 text-default-400" />
                  }
                />
              )}
            />

            <Controller
              name="contactPhone"
              control={control}
              rules={{ required: '请输入联系电话' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="联系电话"
                  type="tel"
                  placeholder="请输入联系电话"
                  isRequired
                  errorMessage={errors.contactPhone?.message}
                  startContent={
                    <Icon icon="solar:phone-bold-duotone" className="w-4 h-4 text-default-400" />
                  }
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: '请输入邮箱',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '请输入有效的邮箱地址'
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="邮箱"
                  type="email"
                  placeholder="请输入邮箱地址"
                  isRequired
                  errorMessage={errors.email?.message}
                  startContent={
                    <Icon icon="solar:letter-bold-duotone" className="w-4 h-4 text-default-400" />
                  }
                />
              )}
            />
          </div>

          {status === 'confirmed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Controller
                name="attendees"
                control={control}
                rules={{ required: '请选择参会人数' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="参会人数"
                    placeholder="请选择参会人数"
                    isRequired
                    errorMessage={errors.attendees?.message}
                    startContent={
                      <Icon icon="solar:users-group-rounded-bold-duotone" className="w-4 h-4 text-default-400" />
                    }
                  >
                    {attendeeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <div className="flex gap-6">
                <Controller
                  name="needsDinner"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      isSelected={value}
                      onValueChange={onChange}
                      size="lg"
                      color="primary"
                      startContent={
                        <Icon
                          icon="solar:cup-hot-bold-duotone"
                          className={cn(
                            "w-4 h-4",
                            value ? "text-primary" : "text-default-400"
                          )}
                        />
                      }
                    >
                      需要用餐
                    </Switch>
                  )}
                />

                <Controller
                  name="needsHotel"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      isSelected={value}
                      onValueChange={onChange}
                      size="lg"
                      color="primary"
                      startContent={
                        <Icon
                          icon="solar:home-angle-bold-duotone"
                          className={cn(
                            "w-4 h-4",
                            value ? "text-primary" : "text-default-400"
                          )}
                        />
                      }
                    >
                      需要住宿
                    </Switch>
                  )}
                />
              </div>
            </motion.div>
          )}

          <Controller
            name="specialRequirements"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                label="特殊要求"
                placeholder="如有特殊要求请说明"
                className="min-h-[100px]"
              />
            )}
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
            startContent={!loading && <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />}
          >
            {loading ? '提交中...' : '确认提交'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_registration_form', RegistrationForm);
RegistrationForm.displayName = 'RegistrationForm';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_stats_card" title="统计卡片组件">
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
} = context;

const { Card, CardBody } = NextUI;

const StatsCard = observer(({ title, value, icon, trend, color = "primary" }) => {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            {
              "bg-primary/10 text-primary": color === "primary",
              "bg-success/10 text-success": color === "success",
              "bg-warning/10 text-warning": color === "warning",
              "bg-danger/10 text-danger": color === "danger",
            }
          )}>
            <Icon icon={icon} className="w-6 h-6" />
          </div>
          <div>
            <p className="text-small text-default-500">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <Icon
                  icon={trend > 0 ? "solar:arrow-up-linear" : "solar:arrow-down-linear"}
                  className={cn(
                    "w-4 h-4",
                    trend > 0 ? "text-success" : "text-danger"
                  )}
                />
                <span className={cn(
                  "text-small",
                  trend > 0 ? "text-success" : "text-danger"
                )}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_stats_card', StatsCard);
StatsCard.displayName = 'StatsCard';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_supplier_table" title="供应商表格组件">
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
} = context;

const {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Button,
  Pagination
} = NextUI;

const statusColorMap = {
  confirmed: "success",
  declined: "danger",
  pending: "warning",
  maybe: "primary"
};

const statusNameMap = {
  confirmed: "已确认",
  declined: "不参加",
  pending: "待定",
  maybe: "可能参加"
};

const SupplierTable = observer(({ data, page, total, onPageChange }) => {
  const renderCell = React.useCallback((item, columnKey) => {
    switch (columnKey) {
      case "status":
        return (
          <Chip
            color={statusColorMap[item.status]}
            variant="flat"
            size="sm"
          >
            {statusNameMap[item.status]}
          </Chip>
        );
      case "needsDinner":
      case "needsHotel":
        return item[columnKey] ? (
          <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-success" />
        ) : (
          <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5 text-danger" />
        );
      case "registeredAt":
        return new Date(item.registeredAt).toLocaleString();
      default:
        return item[columnKey];
    }
  }, []);

  return (
    <Table
      aria-label="供应商列表"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={Math.ceil(total / 10)}
            onChange={onPageChange}
          />
        </div>
      }
    >
      <TableHeader>
        <TableColumn>公司名称</TableColumn>
        <TableColumn>联系人</TableColumn>
        <TableColumn>联系电话</TableColumn>
        <TableColumn>参会人数</TableColumn>
        <TableColumn>状态</TableColumn>
        <TableColumn>用餐</TableColumn>
        <TableColumn>住宿</TableColumn>
        <TableColumn>注册时间</TableColumn>
      </TableHeader>
      <TableBody items={data}>
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>{renderCell(item, "companyName")}</TableCell>
            <TableCell>{renderCell(item, "contactName")}</TableCell>
            <TableCell>{renderCell(item, "contactPhone")}</TableCell>
            <TableCell>{renderCell(item, "attendees")}</TableCell>
            <TableCell>{renderCell(item, "status")}</TableCell>
            <TableCell>{renderCell(item, "needsDinner")}</TableCell>
            <TableCell>{renderCell(item, "needsHotel")}</TableCell>
            <TableCell>{renderCell(item, "registeredAt")}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
});

context.wpm.export('comp_supplier_table', SupplierTable);
SupplierTable.displayName = 'SupplierTable';
</mo-ai-code>
```

```jsx
<mo-ai-code type="entry" name="app_entry" title="应用入口">
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
} = context;

const { Routes, Route, useNavigate, useLocation } = ReactRouterDom;
const { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } = NextUI;

// 导入页面组件
const InvitationPage = await context.wpm.import('page_invitation');
const DashboardPage = await context.wpm.import('page_dashboard');

const App = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();

  // 检查是否是分享模式
  const isSharedMode = location.search.includes('share=true');

  return (
    <NextUI.NextUIProvider navigate={navigate}>
      {!isSharedMode && (
        <Navbar>
          <NavbarBrand>
            <p className="font-bold text-inherit">会展管理系统</p>
          </NavbarBrand>
          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem>
              <Link color="foreground" href="/">
                邀请函
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href="/dashboard">
                统计后台
              </Link>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      )}

      <main>
        <Routes>
          <Route
            path="/"
            element={<InvitationPage isSharedMode={isSharedMode} />}
          />
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />
        </Routes>
      </main>
    </NextUI.NextUIProvider>
  );
});

context.wpm.export('app_entry', App);
App.displayName = 'App';
</mo-ai-code>
```

```jsx
<mo-ai-code type="markdown" name="readme" title="应用说明文档">
# 多页应用说明文档

## 简介
这是一个使用 AI 助手创建的多页应用程序。该应用采用现代化的技术栈和组件库,提供了良好的用户界面和交互体验。

## 功能特性
- 路由系统:使用 React Router 进行页面导航
- 响应式设计:适配不同屏幕尺寸
- 现代化UI:使用 NextUI 组件库
- 状态管理:采用 MobX 进行状态管理

## 项目结构
```

└── App.jsx # 应用入口(包含路由配置和主要内容)

```

## 开发指南
1. 使用 AI 助手:
   - 在左侧输入您的需求
   - AI 将帮助您开发新功能或修改现有功能

2. 自定义开发:
   - 遵循 React 最佳实践
   - 使用 NextUI 组件库构建界面
   - 使用 MobX 进行状态管理

## 技术栈
- React
- NextUI
- React Router
- MobX
- Tailwind CSS

## 集成说明
- 此多页应用支持集成单页应用模块
- 可以通过导入单页应用组件来扩展功能

## 后续计划
- 添加更多功能模块
- 优化用户体验
- 完善文档说明

## 贡献指南
欢迎提供建议和反馈,一起改进这个应用!
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_dashboard" title="统计后台页面">
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
} = context;

const { Card, CardBody, Button } = NextUI;
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts;

// 导入组件和 store
const StatsCard = await context.wpm.import('comp_stats_card');
const SupplierTable = await context.wpm.import('comp_supplier_table');
const invitationStore = await context.wpm.import('store_invitation');

const DashboardPage = observer(() => {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    invitationStore.loadData();
  }, []);

  const stats = invitationStore.statistics;
  const registrations = invitationStore.registrations;

  // 计算分页数据
  const paginatedData = registrations.slice((page - 1) * pageSize, page * pageSize);

  // 图表数据
  const chartData = React.useMemo(() => {
    if (!stats) return [];
    return [
      { name: '已确认', value: stats.confirmed },
      { name: '待定', value: stats.pending },
      { name: '可能参加', value: stats.maybe },
      { name: '不参加', value: stats.declined }
    ];
  }, [stats]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <NextUI.Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">参会统计</h1>
        <Button
          color="primary"
          startContent={<Icon icon="solar:file-download-bold-duotone" />}
          onPress={() => invitationStore.exportData()}
        >
          导出数据
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="总注册数"
          value={stats.total}
          icon="solar:users-group-rounded-bold-duotone"
          color="primary"
        />
        <StatsCard
          title="确认参加"
          value={stats.confirmed}
          icon="solar:user-check-rounded-bold-duotone"
          color="success"
        />
        <StatsCard
          title="总参会人数"
          value={stats.totalAttendees}
          icon="solar:users-group-two-rounded-bold-duotone"
          color="warning"
        />
        <StatsCard
          title="需要用餐"
          value={stats.needsDinner}
          icon="solar:cup-hot-bold-duotone"
          color="danger"
        />
      </div>

      <Card>
        <CardBody>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#006FEE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <SupplierTable
            data={paginatedData}
            page={page}
            total={registrations.length}
            onPageChange={setPage}
          />
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('page_dashboard', DashboardPage);
DashboardPage.displayName = 'DashboardPage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_invitation" title="邀请函页面">
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
} = context;

const { Card, CardBody, CardHeader, Image, Button, Tooltip } = NextUI;
const { motion } = FramerMotion;
const { useLocation } = ReactRouterDom;

// 导入组件和 store
const RegistrationForm = await context.wpm.import('comp_registration_form');
const invitationStore = await context.wpm.import('store_invitation');

const InvitationPage = observer(({ isSharedMode = false }) => {
  const location = useLocation();

  // 生成分享链接
  const getShareLink = () => {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}?share=true`;
  };

  // 复制分享链接
  const handleShare = async () => {
    try {
      const shareLink = getShareLink();
      await navigator.clipboard.writeText(shareLink);
      message.success('分享链接已复制到剪贴板');

      api.log.info('复制分享链接成功', {
        shareLink
      });
    } catch (error) {
      api.log.error('复制分享链接失败', {
        error: error.message
      });
      message.error('复制分享链接失败');
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-primary-50 to-background",
      isSharedMode ? "py-0" : "py-8 px-4"
    )}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <Card className="border-none bg-background/60 dark:bg-default-100/50 backdrop-blur-lg">
          <CardBody className="text-center py-10">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold mb-4">2025开年大会</h1>
              <p className="text-xl text-default-600 mb-8">诚挚邀请您参加我们的供应商大会</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Image
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800"
                  alt="会议场景"
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="text-left space-y-4">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:calendar-bold-duotone" className="w-5 h-5 text-primary" />
                  <p>时间: 2025年1月15日 09:00-17:00</p>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:map-point-bold-duotone" className="w-5 h-5 text-primary" />
                  <p>地点: 上海国际会议中心</p>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:user-id-bold-duotone" className="w-5 h-5 text-primary" />
                  <p>规模: 预计500+供应商参会</p>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:phone-bold-duotone" className="w-5 h-5 text-primary" />
                  <p>联系电话: 021-88888888</p>
                </div>
              </div>
            </div>

            {!isSharedMode && (
              <Tooltip content="复制分享链接">
                <Button
                  isIconOnly
                  color="primary"
                  variant="light"
                  className="absolute top-4 right-4"
                  onPress={handleShare}
                >
                  <Icon icon="solar:share-bold-duotone" className="w-5 h-5" />
                </Button>
              </Tooltip>
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">会议议程</h2>
          <Card>
            <CardBody className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded p-2">
                  09:00
                </div>
                <div>
                  <h3 className="font-semibold">签到入场</h3>
                  <p className="text-default-500">领取会议资料</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded p-2">
                  10:00
                </div>
                <div>
                  <h3 className="font-semibold">开幕致辞</h3>
                  <p className="text-default-500">公司高层致辞</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded p-2">
                  11:00
                </div>
                <div>
                  <h3 className="font-semibold">2025战略发布</h3>
                  <p className="text-default-500">发布年度战略规划</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded p-2">
                  12:00
                </div>
                <div>
                  <h3 className="font-semibold">商务午宴</h3>
                  <p className="text-default-500">与高层共进午餐</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded p-2">
                  14:00
                </div>
                <div>
                  <h3 className="font-semibold">分组讨论</h3>
                  <p className="text-default-500">深入交流与合作</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded p-2">
                  16:00
                </div>
                <div>
                  <h3 className="font-semibold">闭幕式</h3>
                  <p className="text-default-500">总结与展望</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-center mb-4">参会登记</h2>
          <RegistrationForm
            onSubmit={invitationStore.submitRegistration}
            loading={invitationStore.submitting}
          />
        </div>
      </motion.div>
    </div>
  );
});

context.wpm.export('page_invitation', InvitationPage);
InvitationPage.displayName = 'InvitationPage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_invitation" title="邀请函数据服务">
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
} = context;

class InvitationService {
  private static METADATA_KEY = `${appId}_registrations`;

  // 保存注册信息
  async saveRegistration(registration: RegistrationRecord) {
    try {
      api.log.info('开始保存注册信息', {
        supplierId: registration.id,
        companyName: registration.companyName,
        metadataKey: InvitationService.METADATA_KEY
      });

      // 获取现有记录
      const records = await this.getRegistrations();

      api.log.info('获取现有记录', {
        existingCount: records.length,
        records: JSON.stringify(records)
      });

      const existingIndex = records.findIndex(r => r.id === registration.id);

      if (existingIndex >= 0) {
        records[existingIndex] = registration;
        api.log.info('更新已存在的记录', {
          supplierId: registration.id,
          index: existingIndex
        });
      } else {
        records.push(registration);
        api.log.info('添加新记录', {
          supplierId: registration.id,
          newCount: records.length
        });
      }

      // 保存所有记录
      const saveResult = await api.setMetadata(InvitationService.METADATA_KEY, {
        records,
        updatedAt: new Date().toISOString()
      });

      api.log.info('注册信息保存成功', {
        supplierId: registration.id,
        totalRecords: records.length,
        saveResult: JSON.stringify(saveResult)
      });

      return registration;
    } catch (error) {
      api.log.error('保存注册信息失败', {
        error: error.message,
        registration: JSON.stringify(registration),
        stack: error.stack
      });
      throw error;
    }
  }

  // 获取所有注册信息
  async getRegistrations(): Promise<RegistrationRecord[]> {
    try {
      api.log.info('开始获取注册信息列表', {
        metadataKey: InvitationService.METADATA_KEY
      });

      const result = await api.getMetadata([InvitationService.METADATA_KEY]);

      api.log.info('获取元数据结果', {
        result: JSON.stringify(result)
      });

      const data = result.data?.[0]?.value;

      if (!data) {
        api.log.info('没有找到注册记录,返回空数组');
        return [];
      }

      // 解析数据
      let parsedData;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        api.log.info('解析数据成功', {
          parsedData: JSON.stringify(parsedData)
        });
      } catch (error) {
        api.log.error('解析数据失败', {
          error: error.message,
          data
        });
        return [];
      }

      if (!parsedData?.records) {
        api.log.info('数据格式不正确,返回空数组', {
          parsedData: JSON.stringify(parsedData)
        });
        return [];
      }

      api.log.info('获取注册信息成功', {
        recordCount: parsedData.records.length,
        records: JSON.stringify(parsedData.records)
      });

      return parsedData.records;
    } catch (error) {
      api.log.error('获取注册信息失败', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // 获取统计数据
  async getStatistics(): Promise<Statistics> {
    try {
      api.log.info('开始计算统计数据');

      const records = await this.getRegistrations();

      api.log.info('获取到注册记录', {
        recordCount: records.length,
        records: JSON.stringify(records)
      });

      const stats = records.reduce((acc, curr) => {
        acc.total++;
        acc[curr.status]++;
        acc.totalAttendees += curr.attendees;
        if (curr.needsDinner) acc.needsDinner++;
        if (curr.needsHotel) acc.needsHotel++;
        return acc;
      }, {
        total: 0,
        confirmed: 0,
        declined: 0,
        pending: 0,
        maybe: 0,
        totalAttendees: 0,
        needsDinner: 0,
        needsHotel: 0
      } as Statistics);

      api.log.info('统计数据计算完成', {
        stats: JSON.stringify(stats)
      });

      return stats;
    } catch (error) {
      api.log.error('计算统计数据失败', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // 导出Excel
  async exportToExcel() {
    try {
      api.log.info('开始导出Excel');

      const records = await this.getRegistrations();

      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(records.map(record => ({
        '公司名称': record.companyName,
        '联系人': record.contactName,
        '联系电话': record.contactPhone,
        '邮箱': record.email,
        '参会状态': record.status,
        '参会人数': record.attendees,
        '需要用餐': record.needsDinner ? '是' : '否',
        '需要住宿': record.needsHotel ? '是' : '否',
        '特殊要求': record.specialRequirements || '',
        '注册时间': new Date(record.registeredAt).toLocaleString()
      })));

      xlsx.utils.book_append_sheet(workbook, worksheet, '注册记录');
      xlsx.writeFile(workbook, '2025开年大会参会统计.xlsx');

      api.log.info('Excel导出成功', {
        recordCount: records.length
      });
    } catch (error) {
      api.log.error('导出Excel失败', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

const invitationService = new InvitationService();
context.wpm.export('service_invitation', invitationService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_statistics" title="统计数据服务">
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
} = context;

class StatisticsService {
  private static METADATA_KEY = `${appId}_statistics`;

  async getStatistics(timeRange: TimeRange = 'week'): Promise<Statistics> {
    try {
      api.log.info('开始获取统计数据', { timeRange });

      const registrations = await this.getRegistrationData();

      api.log.info('获取到注册数据', {
        count: registrations.length
      });

      // 计算基础统计数据
      const stats = {
        totalRegistrations: registrations.length,
        confirmedCount: registrations.filter(r => r.status === 'confirmed').length,
        pendingCount: registrations.filter(r => r.status === 'pending').length,
        declinedCount: registrations.filter(r => r.status === 'declined').length,
        totalAttendees: registrations.reduce((sum, r) => sum + r.attendees, 0),
        needsDinner: registrations.filter(r => r.needsDinner).length,
        needsHotel: registrations.filter(r => r.needsHotel).length,
        trends: this.calculateTrends(registrations, timeRange)
      };

      api.log.info('统计数据计算完成', { stats });

      return stats;
    } catch (error) {
      api.log.error('获取统计数据失败', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  private async getRegistrationData() {
    try {
      const result = await api.getMetadata([StatisticsService.METADATA_KEY]);
      const data = result.data?.[0]?.value;

      if (!data) {
        return [];
      }

      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      return parsedData.records || [];
    } catch (error) {
      api.log.error('获取注册数据失败', {
        error: error.message,
        stack: error.stack
      });
      return [];
    }
  }

  private calculateTrends(registrations: any[], timeRange: TimeRange): ChartData[] {
    // 根据时间范围计算趋势数据
    const now = new Date();
    const trends: ChartData[] = [];

    switch (timeRange) {
      case 'day':
        // 24小时数据
        for (let i = 0; i < 24; i++) {
          const hour = now.getHours() - (23 - i);
          trends.push({
            date: `${hour}:00`,
            value: Math.floor(Math.random() * 100),
            category: 'hourly'
          });
        }
        break;

      case 'week':
        // 7天数据
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          trends.push({
            date: date.toLocaleDateString(),
            value: Math.floor(Math.random() * 1000),
            category: 'daily'
          });
        }
        break;

      case 'month':
        // 30天数据
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          trends.push({
            date: date.toLocaleDateString(),
            value: Math.floor(Math.random() * 5000),
            category: 'daily'
          });
        }
        break;

      case 'year':
        // 12个月数据
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          trends.push({
            date: date.toLocaleDateString(),
            value: Math.floor(Math.random() * 50000),
            category: 'monthly'
          });
        }
        break;
    }

    return trends;
  }

  async exportStatistics() {
    try {
      api.log.info('开始导出统计数据');

      const stats = await this.getStatistics();

      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet([
        {
          '总注册数': stats.totalRegistrations,
          '确认参加': stats.confirmedCount,
          '待定': stats.pendingCount,
          '已拒绝': stats.declinedCount,
          '总参会人数': stats.totalAttendees,
          '需要用餐': stats.needsDinner,
          '需要住宿': stats.needsHotel
        }
      ]);

      xlsx.utils.book_append_sheet(workbook, worksheet, '统计数据');
      xlsx.writeFile(workbook, '参会统计数据.xlsx');

      api.log.info('统计数据导出成功');
    } catch (error) {
      api.log.error('导出统计数据失败', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

const statisticsService = new StatisticsService();
context.wpm.export('service_statistics', statisticsService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_invitation" title="邀请函状态管理">
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
} = context;

const { makeAutoObservable, runInAction } = mobx;

// 导入服务
const invitationService = await context.wpm.import('service_invitation');

class InvitationStore {
  registrations: RegistrationRecord[] = [];
  statistics: Statistics | null = null;
  loading = false;
  submitting = false;

  constructor() {
    makeAutoObservable(this);
    this.loadData();
  }

  // 加载数据
  async loadData() {
    try {
      this.loading = true;
      const [registrations, statistics] = await Promise.all([
        invitationService.getRegistrations(),
        invitationService.getStatistics()
      ]);

      api.log.info('Store loadData 结果', {
        registrationsCount: registrations.length,
        registrations: JSON.stringify(registrations),
        statistics: JSON.stringify(statistics)
      });

      runInAction(() => {
        this.registrations = registrations;
        this.statistics = statistics;
      });

      api.log.info('Store 状态更新完成', {
        storeRegistrations: JSON.stringify(this.registrations),
        storeStatistics: JSON.stringify(this.statistics)
      });
    } catch (error) {
      api.log.error('加载数据失败', {
        error: error.message,
        stack: error.stack
      });
      message.error('加载数据失败');
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // 提交注册
  submitRegistration = async (data: Omit<RegistrationRecord, 'registeredAt' | 'updatedAt'>) => {
    try {
      this.submitting = true;

      api.log.info('开始提交注册信息', {
        companyName: data.companyName,
        formData: JSON.stringify(data)
      });

      const registration = await invitationService.saveRegistration({
        ...data,
        registeredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await this.loadData();

      message.success('提交成功');

      api.log.info('注册信息提交成功', {
        supplierId: registration.id,
        registration: JSON.stringify(registration)
      });

      return registration;
    } catch (error) {
      api.log.error('提交注册信息失败', {
        error: error.message,
        formData: JSON.stringify(data),
        stack: error.stack
      });
      message.error('提交失败: ' + error.message);
      throw error;
    } finally {
      runInAction(() => {
        this.submitting = false;
      });
    }
  }

  // 导出数据
  async exportData() {
    try {
      api.log.info('开始导出数据');
      await invitationService.exportToExcel();
      message.success('导出成功');
    } catch (error) {
      api.log.error('导出数据失败', {
        error: error.message,
        stack: error.stack
      });
      message.error('导出失败');
    }
  }
}

const invitationStore = new InvitationStore();
context.wpm.export('store_invitation', invitationStore);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_statistics" title="统计数据状态管理">
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
} = context;

const { makeAutoObservable, runInAction } = mobx;

// 导入服务
const statisticsService = await context.wpm.import('service_statistics');

class StatisticsStore {
  statistics: Statistics | null = null;
  loading = false;
  timeRange: TimeRange = 'week';
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadStatistics();
  }

  setTimeRange(range: TimeRange) {
    this.timeRange = range;
    this.loadStatistics();
  }

  async loadStatistics() {
    try {
      this.loading = true;
      this.error = null;

      api.log.info('开始加载统计数据', {
        timeRange: this.timeRange
      });

      const stats = await statisticsService.getStatistics(this.timeRange);

      runInAction(() => {
        this.statistics = stats;
      });

      api.log.info('统计数据加载完成', {
        stats: JSON.stringify(stats)
      });
    } catch (error) {
      api.log.error('加载统计数据失败', {
        error: error.message,
        stack: error.stack
      });

      runInAction(() => {
        this.error = error.message;
      });

      message.error('加载统计数据失败');
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async exportData() {
    try {
      api.log.info('开始导出统计数据');

      await statisticsService.exportStatistics();
      message.success('导出成功');

      api.log.info('统计数据导出成功');
    } catch (error) {
      api.log.error('导出统计数据失败', {
        error: error.message,
        stack: error.stack
      });
      message.error('导出失败');
    }
  }

  get chartConfigs(): ChartConfig[] {
    if (!this.statistics) return [];

    return [
      {
        title: '参会状态分布',
        value: this.statistics.totalRegistrations,
        unit: '人',
        color: 'primary',
        categories: ['已确认', '待定', '已拒绝'],
        icon: 'solar:users-group-rounded-bold-duotone'
      },
      {
        title: '参会人数趋势',
        value: this.statistics.totalAttendees,
        unit: '人',
        color: 'success',
        categories: ['总人数'],
        icon: 'solar:graph-new-bold-duotone'
      },
      {
        title: '服务需求分布',
        value: this.statistics.needsDinner + this.statistics.needsHotel,
        unit: '项',
        color: 'warning',
        categories: ['用餐', '住宿'],
        icon: 'solar:cup-hot-bold-duotone'
      }
    ];
  }
}

const statisticsStore = new StatisticsStore();
context.wpm.export('store_statistics', statisticsStore);
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_invitation" title="邀请函类型定义">
// 参会状态
type AttendanceStatus = 'confirmed' | 'declined' | 'pending' | 'maybe';

// 供应商信息
type Supplier = {
  id: string;
  companyName: string;
  contactName: string;
  contactPhone: string;
  email: string;
};

// 参会信息
type Registration = {
  supplierId: string;
  status: AttendanceStatus;
  attendees: number;
  needsDinner: boolean;
  needsHotel: boolean;
  specialRequirements?: string;
  registeredAt: string;
  updatedAt: string;
};

// 统计数据
type Statistics = {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  maybe: number;
  totalAttendees: number;
  needsDinner: number;
  needsHotel: number;
};

// 完整的注册记录
type RegistrationRecord = Supplier & Registration;

// 状态选项
type StatusOption = {
  label: string;
  value: AttendanceStatus;
  description: string;
  color: 'success' | 'danger' | 'warning' | 'primary';
  icon: string;
};

// 参会人数选项
type AttendeeOption = {
  label: string;
  value: number;
};
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_statistics" title="统计类型定义">
// 图表数据类型
type ChartData = {
  date: string;
  value: number;
  category: string;
};

// 图表配置类型
type ChartConfig = {
  title: string;
  value: string | number;
  unit?: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  categories: string[];
  description?: string;
  icon?: string;
};

// 时间范围类型
type TimeRange = 'day' | 'week' | 'month' | 'year';

// 统计数据类型
type Statistics = {
  totalRegistrations: number;
  confirmedCount: number;
  pendingCount: number;
  declinedCount: number;
  totalAttendees: number;
  needsDinner: number;
  needsHotel: number;
  trends: ChartData[];
};

// 图表选项类型
type ChartOptions = {
  timeRange: TimeRange;
  startDate?: string;
  endDate?: string;
  categories?: string[];
};
</mo-ai-code>
```

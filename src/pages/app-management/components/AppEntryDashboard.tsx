import React from "react"
import { useParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import EmptyState from "@/components/EmptyState"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner, Avatar, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { DateRange } from "react-day-picker"

// 自定义日期选择器组件
function CalendarDateRangePicker({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2023, 0, 20),
    to: addDays(new Date(2023, 0, 20), 20),
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>选择日期范围</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// 自定义导航组件
function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Button variant="link" className="text-sm font-medium">
        概览
      </Button>
      <Button variant="link" className="text-sm font-medium text-muted-foreground">
        表单
      </Button>
      <Button variant="link" className="text-sm font-medium text-muted-foreground">
        报表
      </Button>
      <Button variant="link" className="text-sm font-medium text-muted-foreground">
        设置
      </Button>
    </nav>
  )
}

// 搜索组件
function Search() {
  return (
    <div>
      <Input
        type="search"
        placeholder="搜索..."
        className="md:w-[100px] lg:w-[300px]"
      />
    </div>
  )
}

// 用户导航组件
function UserNav() {
  return (
    <Avatar
      isBordered
      as="button"
      className="transition-transform"
      color="secondary"
      name="Jason Hughes"
      size="sm"
      src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
    />
  )
}

// 数据概览组件
function Overview() {
  const data = [
    { name: "1月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "2月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "3月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "4月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "5月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "6月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "7月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "8月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "9月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "10月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "11月", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "12月", total: Math.floor(Math.random() * 5000) + 1000 },
  ]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// 最近提交组件
function RecentSubmissions() {
  const recentData = [
    {
      id: 1,
      name: "张三",
      email: "zhangsan@example.com",
      time: "10分钟前",
      form: "员工入职表"
    },
    {
      id: 2,
      name: "李四",
      email: "lisi@example.com",
      time: "25分钟前",
      form: "请假申请"
    },
    {
      id: 3,
      name: "王五",
      email: "wangwu@example.com",
      time: "1小时前",
      form: "报销单"
    },
    {
      id: 4,
      name: "赵六",
      email: "zhaoliu@example.com",
      time: "2小时前",
      form: "项目申请"
    },
    {
      id: 5,
      name: "钱七",
      email: "qianqi@example.com",
      time: "3小时前",
      form: "设备维修"
    }
  ]

  return (
    <div className="space-y-8">
      {recentData.map((item) => (
        <div key={item.id} className="flex items-center">
          <Avatar
            isBordered
            className="h-9 w-9"
            src={`https://i.pravatar.cc/150?u=${item.id}`}
          />
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              {item.email}
            </p>
          </div>
          <div className="ml-auto text-sm">
            <p className="font-medium">{item.form}</p>
            <p className="text-muted-foreground">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export const AppEntryDashboard: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const { items: apps = [], load: loadApps, isLoading } = useMetadata("app")
  const { items: templates = [], load: loadTemplates } = useMetadata("template")
  const { items: reports = [], load: loadReports } = useMetadata("report")
  const { items: forms = [], load: loadForms } = useMetadata("form")

  React.useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadApps(), loadTemplates(), loadReports(), loadForms()])
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  const app = apps.find((app) => app.id === appId)
  if (!app) {
    return <EmptyState type='error' title='未找到应用' description='该应用可能已被删除或您没有访问权限' />
  }

  const appTemplates = templates.filter((template) => app.indexFields?.templateIds?.includes(template.id))
  const appReports = reports.filter((report) => app.indexFields?.reportIds?.includes(report.id))
  const appForms = forms.filter((form) => app.indexFields?.templateIds?.includes(form.template?.id))

  return (
    <div className="hidden flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{app.title}</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <Button>导出数据</Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="forms">表单</TabsTrigger>
            <TabsTrigger value="reports">报表</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总表单数</CardTitle>
                  <Icon icon="mdi:form-select" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appForms.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% 较上月
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">模板数量</CardTitle>
                  <Icon icon="mdi:file-document-multiple" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appTemplates.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% 较上月
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">报表数量</CardTitle>
                  <Icon icon="mdi:chart-box" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appReports.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +19% 较上月
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
                  <Icon icon="mdi:account-multiple" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">
                    +201 较上小时
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>数据概览</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>最近提交</CardTitle>
                  <CardDescription>
                    最近提交的表单数据
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSubmissions />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AppEntryDashboard
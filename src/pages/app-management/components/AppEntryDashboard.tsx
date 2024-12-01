import React from "react"
import { useParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import EmptyState from "@/components/EmptyState"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner, Avatar, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { DateRange } from "react-day-picker"

// 统计卡片组件
interface StatCardProps {
  title: string
  value: number | string
  icon: string
  description?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon icon={icon} className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// 日期选择器组件
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

// 导航组件
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

// 主仪表盘组件
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

  // 计算活跃用户数（基于表单提交者）
  const activeUsers = new Set(appForms.map(form => form.submitter?.id)).size

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
            {/* 统计卡片 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="表单总数"
                value={appForms.length}
                icon="mdi:form-select"
                description="所有已提交的表单"
              />
              <StatCard
                title="模板数量"
                value={appTemplates.length}
                icon="mdi:file-document-multiple"
                description="可用的表单模板"
              />
              <StatCard
                title="报表数量"
                value={appReports.length}
                icon="mdi:chart-box"
                description="数据分析报表"
              />
              <StatCard
                title="活跃用户"
                value={activeUsers}
                icon="mdi:account-multiple"
                description="提交过表单的用户"
              />
            </div>

            {/* 报表展示区域 */}
            <div className="grid gap-4 md:grid-cols-2">
              {appReports.map(report => (
                <Card key={report.id} className="col-span-1">
                  <CardHeader>
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <iframe
                      src={`/report/${report.id}`}
                      className="w-full h-[400px] border-0"
                      title={report.title}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 无报表时显示提示 */}
            {appReports.length === 0 && (
              <EmptyState
                type="no-data"
                title="暂无报表"
                description="请在应用配置中添加需要展示的报表"
                icon={<Icon icon="mdi:chart-box" className="w-20 h-20 text-default-400" />}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AppEntryDashboard
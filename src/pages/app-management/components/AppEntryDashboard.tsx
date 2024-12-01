import React from "react"
import { useParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import { AppIndex } from "../store/useAppStore"
import EmptyState from "@/components/EmptyState"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/new-york/ui/card"
import { Overview } from "@/examples/dashboard/components/overview"
import { RecentSales } from "@/examples/dashboard/components/recent-sales"
import { CalendarDateRangePicker } from "@/examples/dashboard/components/date-range-picker"
import { Button } from "@/registry/new-york/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/new-york/ui/tabs"
import { MainNav } from "@/examples/dashboard/components/main-nav"
import { Search } from "@/examples/dashboard/components/search"
import { UserNav } from "@/examples/dashboard/components/user-nav"
import { Spinner } from "@nextui-org/react"

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
                  <CardTitle className="text-sm font-medium">
                    总表单数
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
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
                  <CardTitle className="text-sm font-medium">
                    模板数量
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
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
                  <CardTitle className="text-sm font-medium">
                    活跃用户
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
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
                  <RecentSales />
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
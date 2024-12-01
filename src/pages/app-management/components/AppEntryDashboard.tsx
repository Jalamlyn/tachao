import React from "react"
import { useParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import EmptyState from "@/components/EmptyState"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner, Input, Button, Select, SelectItem } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { FormTypeAIModal } from "./FormTypeTabs/FormTypeAIModal"
import { FormTypeTabs } from "./FormTypeTabs"

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

// 主仪表盘组件
export const AppEntryDashboard: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const { items: apps = [], load: loadApps, isLoading } = useMetadata("app")
  const { items: templates = [], load: loadTemplates } = useMetadata("template")
  const { items: reports = [], load: loadReports } = useMetadata("report")
  const { items: forms = [], load: loadForms } = useMetadata("form")
  const [isAIModalOpen, setIsAIModalOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

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

  // 过滤表单
  const filteredForms = appForms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || form.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // 获取本月新增报表数量
  const getNewReportsCount = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return appReports.filter(report => new Date(report.createdAt) >= startOfMonth).length
  }

  return (
    <div className="hidden flex-col md:flex">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{app.title}</h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="forms">表单</TabsTrigger>
            <TabsTrigger value="reports">报表</TabsTrigger>
          </TabsList>
          
          {/* 概览 Tab */}
          <TabsContent value="overview" className="space-y-4">
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

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>表单模板</CardTitle>
                  <CardDescription>可用的表单模板列表</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 rounded-lg border border-default-200 hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{template.title}</h3>
                            <p className="text-small text-default-500">{template.description || "点击开始填写表单"}</p>
                          </div>
                          <Button
                            color="primary"
                            variant="flat"
                            onPress={() => window.open(`/form-preview/${template.id}`, "_blank")}
                          >
                            开始填写
                          </Button>
                        </div>
                      </div>
                    ))}
                    {appTemplates.length === 0 && (
                      <div className="text-center py-8 text-default-500">暂无可用的表单模板</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>数据报表</CardTitle>
                  <CardDescription>可用的数据报表列表</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 rounded-lg border border-default-200 hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{report.title}</h3>
                            <p className="text-small text-default-500">{report.description || "点击查看报表详情"}</p>
                          </div>
                          <Button
                            color="primary"
                            variant="flat"
                            onPress={() => window.open(`/report/${report.id}`, "_blank")}
                          >
                            查看报表
                          </Button>
                        </div>
                      </div>
                    ))}
                    {appReports.length === 0 && (
                      <div className="text-center py-8 text-default-500">暂无可用的数据报表</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 表单 Tab */}
          <TabsContent value="forms" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="总表单数"
                value={appForms.length}
                icon="mdi:form-select"
                description="所有表单"
              />
              <StatCard
                title="已提交表单"
                value={appForms.filter(f => f.status === "submitted").length}
                icon="mdi:checkbox-marked-circle"
                description="已完成提交的表单"
              />
              <StatCard
                title="待处理表单"
                value={appForms.filter(f => f.status === "draft").length}
                icon="mdi:clock"
                description="草稿状态的表单"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>表单列表</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="搜索表单..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={<Icon icon="mdi:magnify" />}
                  />
                  <Select
                    placeholder="状态筛选"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <SelectItem key="all" value="all">全部</SelectItem>
                    <SelectItem key="submitted" value="submitted">已提交</SelectItem>
                    <SelectItem key="draft" value="draft">草稿</SelectItem>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <FormTypeTabs forms={filteredForms} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 报表 Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                title="报表总数"
                value={appReports.length}
                icon="mdi:chart-box"
                description="所有报表"
              />
              <StatCard
                title="本月新增"
                value={getNewReportsCount()}
                icon="mdi:chart-timeline-variant"
                description="本月新增的报表数量"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-default-100 rounded-lg mb-4">
                      {/* 报表预览或缩略图占位符 */}
                      <div className="flex items-center justify-center h-full">
                        <Icon icon="mdi:chart-box" className="w-12 h-12 text-default-300" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        color="primary"
                        variant="flat"
                        onPress={() => window.open(`/report/${report.id}`, "_blank")}
                        startContent={<Icon icon="mdi:eye" />}
                      >
                        查看报表
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {appReports.length === 0 && (
                <div className="col-span-full text-center py-8 text-default-500">
                  暂无可用的数据报表
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI 分析模态框 */}
      <FormTypeAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        formType="all"
        context={JSON.stringify(appForms)}
        onUpdateHistory={() => {}}
        onClearHistory={() => {}}
      />
    </div>
  )
}

export default AppEntryDashboard
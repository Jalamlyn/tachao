import React from "react"
import { Card, CardBody, Button, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useParams } from "react-router-dom"
import { useMetadata } from "@/hooks/useMetadata"
import EmptyState from "@/components/EmptyState"
import { FormTypeTabs } from "./FormTypeTabs"
import AppEntryDashboard from "./AppEntryDashboard"
import { PermissionCheck } from "@/permissions/components/PermissionCheck"

export const AppEntry: React.FC = () => {
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

  const app = apps.find((app) => app.id === appId)
  if (!app) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  // 使用PermissionCheck包装主要内容
  const AppContent = () => {
    // 根据应用的模板类型选择渲染不同的界面
    if (app.template === "dashboard") {
      return <AppEntryDashboard />
    }

    const appTemplates = templates.filter((template) => app.indexFields?.templateIds?.includes(template.id))
    const appReports = reports.filter((report) => app.indexFields?.reportIds?.includes(report.id))
    const appForms = forms.filter((form) => app.indexFields?.templateIds?.includes(form.template?.id))

    return (
      <div className='min-h-screen bg-gradient-to-b from-primary-50 to-background p-4 md:p-8'>
        <div className='max-w-7xl mx-auto space-y-8'>
          {/* 应用信息 */}
          <div className='text-center space-y-4'>
            <h1 className='text-4xl font-bold text-foreground'>{app.title}</h1>
            <p className='text-xl text-default-600'>欢迎使用{app.title}</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* 表单模板区域 */}
            <Card className='p-4'>
              <CardBody className='space-y-6'>
                <div className='flex items-center gap-2'>
                  <Icon icon='mdi:form-select' className='w-6 h-6 text-primary' />
                  <h2 className='text-xl font-semibold'>填写表单</h2>
                </div>

                <div className='space-y-4'>
                  {appTemplates.map((template) => (
                    <div
                      key={template.id}
                      className='p-4 rounded-lg border border-default-200 hover:border-primary transition-colors'
                    >
                      <div className='flex justify-between items-center'>
                        <div>
                          <h3 className='font-medium'>{template.title}</h3>
                          <p className='text-small text-default-500'>{template.description || "点击开始填写表单"}</p>
                        </div>
                        <Button
                          color='primary'
                          variant='flat'
                          onPress={() => window.open(`/form-create/${template.id}`, "_blank")}
                        >
                          开始填写
                        </Button>
                      </div>
                    </div>
                  ))}
                  {appTemplates.length === 0 && (
                    <div className='text-center py-8 text-default-500'>暂无可用的表单模板</div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* 报表区域 */}
            <Card className='p-4'>
              <CardBody className='space-y-6'>
                <div className='flex items-center gap-2'>
                  <Icon icon='mdi:chart-box' className='w-6 h-6 text-primary' />
                  <h2 className='text-xl font-semibold'>查看报表</h2>
                </div>

                <div className='space-y-4'>
                  {appReports.map((report) => (
                    <div
                      key={report.id}
                      className='p-4 rounded-lg border border-default-200 hover:border-primary transition-colors'
                    >
                      <div className='flex justify-between items-center'>
                        <div>
                          <h3 className='font-medium'>{report.title}</h3>
                          <p className='text-small text-default-500'>{report.description || "点击查看报表详情"}</p>
                        </div>
                        <Button
                          color='primary'
                          variant='flat'
                          onPress={() => window.open(`/report/${report.id}`, "_blank")}
                        >
                          查看报表
                        </Button>
                      </div>
                    </div>
                  ))}
                  {appReports.length === 0 && <div className='text-center py-8 text-default-500'>暂无可用的数据报表</div>}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 表单类型分类区域 */}
          <Card className='p-4'>
            <CardBody className='space-y-6'>
              <div className='flex items-center gap-2'>
                <Icon icon='mdi:file-document-multiple' className='w-6 h-6 text-primary' />
                <h2 className='text-xl font-semibold'>表单管理</h2>
              </div>
              <FormTypeTabs forms={appForms} isLoading={isLoading} />
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  // 无权限时的显示内容
  const NoPermissionContent = () => (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-background p-4'>
      <EmptyState
        type='no-permission'
        title='无访问权限'
        description='您没有访问此应用的权限'
        icon={<Icon icon='mdi:shield-lock' className='w-20 h-20 text-danger' />}
      />
    </div>
  )

  return (
    <PermissionCheck
      resourceType="app"
      resourceId={appId}
      accountId="currentUser" // TODO: 从用户上下文获取实际的用户ID
      fallback={<NoPermissionContent />}
    >
      <AppContent />
    </PermissionCheck>
  )
}

export default AppEntry
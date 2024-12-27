import React from "react"
import { Card, CardBody, Button, Spinner } from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom"
import { PermissionCheck } from "@/permissions/components/PermissionCheck"
import { PageRenderer } from "@/components/PageRenderer"
import { getMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"
import { Icon } from "@iconify/react"
import EmptyState from "@/components/EmptyState"

export const AppEntry: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(true)
  const [pageData, setPageData] = React.useState<any>(null)
  const [app, setApp] = React.useState<any>(null)

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // 直接获取应用索引数据
        const result = await getMetadata(["app_index"])
        const apps = result.data?.[0]?.value ? JSON.parse(result.data[0].value) : []
        
        // 查找应用并更新状态
        const foundApp = apps.find((a: any) => a.id === appId)
        setApp(foundApp)

        if (!foundApp) {
          message.error("应用不存在")
          return
        }

        // 检查是否有首页配置
        if (!foundApp.homePageId) {
          return
        }

        // 获取首页内容
        const pageResult = await getMetadata([`${foundApp.homePageId}`])
        if (pageResult.data?.[0]?.value) {
          setPageData(JSON.parse(pageResult.data[0].value))
        }
      } catch (error) {
        console.error("Error loading app:", error)
        message.error("加载应用失败")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [appId])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  // 如果没有找到应用
  if (!app) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <EmptyState
          type='error'
          title='应用不存在'
          description='请检查应用ID是否正确'
          icon={<Icon icon='mdi:alert' className='w-20 h-20 text-danger' />}
        />
      </div>
    )
  }

  // 如果没有配置首页
  if (!app.homePageId || !pageData) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='w-[600px]'>
          <CardBody className='text-center py-8'>
            <div className='mb-6'>
              <Icon icon='mdi:home-plus' className='w-20 h-20 text-primary mx-auto' />
            </div>
            <h3 className='text-xl font-semibold mb-2'>应用首页未配置</h3>
            <p className='text-default-500 mb-6'>
              这个应用还没有配置首页，请先创建并设置应用首页。
            </p>
            <Button
              color='primary'
              onPress={() => navigate(`/we-chat-app/admin/apps/${appId}/pages/create`, {
                state: { isHome: true },
              })}
            >
              创建首页
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <PermissionCheck resourceType='app' resourceId={appId}>
      <PageRenderer code={pageData.code} />
    </PermissionCheck>
  )
}

export default AppEntry
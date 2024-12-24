import { Tabs, Tab, Card, CardBody, ScrollShadow } from "@nextui-org/react"
import { useSearchParams, useNavigate } from "react-router-dom"
import AccountManagement from "../AccountManagement"
import RoleManagement from "../RoleManagement"
import PageLayout from "@/components/PageLayout"
import SystemInfo from "./SystemInfo"
import AccountFinance from "./AccountFinance"
import { useEffect } from "react"

const EnterpriseSettings = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const defaultTab = searchParams.get('tab') || 'accounts'

  // 处理 tab 变化
  const handleTabChange = (key: string) => {
    navigate(`/enterprise-settings?tab=${key}`, { replace: true })
  }

  // 初始化时设置默认 tab
  useEffect(() => {
    if (!searchParams.get('tab')) {
      navigate(`/enterprise-settings?tab=accounts`, { replace: true })
    }
  }, [])

  return (
    <PageLayout title='企业设置' titleIcon='solar:settings-outline'>
      <Card>
        <CardBody>
          <Tabs 
            aria-label='企业设置选项'
            selectedKey={defaultTab}
            onSelectionChange={(key) => handleTabChange(key as string)}
          >
            <Tab key='accounts' title='账号管理'>
              <div className='p-4'>
                <AccountManagement />
              </div>
            </Tab>
            <Tab key='system' title='系统信息'>
              <ScrollShadow className='h-[calc(100vh-300px)]'>
                <SystemInfo />
              </ScrollShadow>
            </Tab>
            <Tab key='finance' title='账户费用'>
              <ScrollShadow className='h-[calc(100vh-300px)]'>
                <AccountFinance />
              </ScrollShadow>
            </Tab>
            <Tab isDisabled key='roles' title='角色管理'>
              <div className='p-4'>
                <RoleManagement />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </PageLayout>
  )
}

export default EnterpriseSettings
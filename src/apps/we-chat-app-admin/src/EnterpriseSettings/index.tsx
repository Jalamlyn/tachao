import { Tabs, Tab, Card, CardBody, ScrollShadow } from "@nextui-org/react"
import AccountManagement from "../AccountManagement"
import RoleManagement from "../RoleManagement"
import PageLayout from "@/components/PageLayout"
import SystemInfo from "./SystemInfo"
import AccountFinance from "./AccountFinance"

const EnterpriseSettings = () => {
  return (
    <PageLayout title='企业设置' titleIcon='solar:settings-outline'>
      <Card>
        <CardBody>
          <Tabs aria-label='企业设置选项'>
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

import React from "react"
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react"
import AccountManagement from "./AccountManagement"
import RoleManagement from "./RoleManagement"
import PageLayout from "@/components/PageLayout"

const EnterpriseSettings: React.FC = () => {
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

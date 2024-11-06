import React from "react"
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react"
import AccountManagement from "./AccountManagement"
import RoleManagement from "./RoleManagement"

const EnterpriseSettings: React.FC = () => {
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold'>企业设置</h1>
      <Card>
        <CardBody>
          <Tabs aria-label='企业设置选项'>
            <Tab key='accounts' title='账号管理'>
              <div className='p-4'>
                <AccountManagement />
              </div>
            </Tab>
            <Tab key='roles' title='角色管理'>
              <div className='p-4'>
                <RoleManagement />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  )
}

export default EnterpriseSettings

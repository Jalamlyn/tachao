import React, { useEffect, useState } from "react"
import { Tabs, Tab, Card, CardBody, Spinner, ScrollShadow, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import AccountManagement from "./AccountManagement"
import RoleManagement from "./RoleManagement"
import PageLayout from "@/components/PageLayout"
import { queryMyProject } from "@/service/apis/project"
import { queryApps } from "@/service/apis/app"
import { queryModels } from "@/service/apis/model"
import { getAccount } from "@/service/apis/pay"
import { localDB } from "@/utils/localDB"

const CostRecords = () => {
  const [records, setRecords] = useState([])

  useEffect(() => {
    const costRecords = localDB.getItem('ai-cost-records') || []
    setRecords(costRecords)
  }, [])

  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex items-center gap-2 mb-4">
          <Icon icon="solar:card-transfer-bold-duotone" className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-medium">费用明细</h3>
        </div>
        <Table aria-label="费用明细表">
          <TableHeader>
            <TableColumn>时间</TableColumn>
            <TableColumn>模型</TableColumn>
            <TableColumn>输入Token</TableColumn>
            <TableColumn>输出Token</TableColumn>
            <TableColumn>输入费用(塔币)</TableColumn>
            <TableColumn>输出费用(塔币)</TableColumn>
            <TableColumn>总费用(塔币)</TableColumn>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                <TableCell>{record.model === 'ADVANCED' ? '高级模型' : '专家模型'}</TableCell>
                <TableCell>{record.promptTokenCount}</TableCell>
                <TableCell>{record.candidatesTokenCount}</TableCell>
                <TableCell>{record.inputCost.toFixed(4)}</TableCell>
                <TableCell>{record.outputCost.toFixed(4)}</TableCell>
                <TableCell>{record.totalCost.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  )
}

// 新增账户费用管理组件
const AccountFinance = () => {
  const [account, setAccount] = useState(null)

  useEffect(() => {
    fetchAccountData()
  }, [])

  const fetchAccountData = async () => {
    try {
      const accountRes = await getAccount()
      setAccount(accountRes)
    } catch (error) {
      console.error("Error fetching account data:", error)
    }
  }

  const InfoCard = ({ title, icon, children }) => (
    <Card className='w-full'>
      <CardBody>
        <div className='flex items-center gap-2 mb-4'>
          <Icon icon={icon} className='w-6 h-6 text-primary' />
          <h3 className='text-lg font-medium'>{title}</h3>
        </div>
        {children}
      </CardBody>
    </Card>
  )

  const InfoItem = ({ label, value }) => (
    <div className='flex justify-between items-center py-2 border-b border-default-200 last:border-none'>
      <span className='text-default-600'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  )

  return (
    <div className='grid gap-6 p-4'>
      <InfoCard title='账户信息' icon='solar:wallet-money-bold-duotone'>
        <div className="flex flex-col gap-4">
          <div>
            <InfoItem label='算力余额' value={account?.computePower ? `${account.computePower} 算力` : "0 算力"} />
            <InfoItem
              label='塔币额度'
              value={account?.computePower ? `${(account.computePower / 100).toFixed(2)} 塔币` : "0 塔币"}
            />
            <div className='mt-2 text-sm text-default-500'>注: 100算力 = 1塔币</div>
          </div>
          <div className="flex justify-end gap-2">
            <Button color="primary" variant="flat" startContent={<Icon icon="solar:card-recive-bold-duotone" />}>
              充值
            </Button>
          </div>
        </div>
      </InfoCard>

      <CostRecords />
    </div>
  )
}

const SystemInfo = () => {
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [app, setApp] = useState(null)
  const [model, setModel] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const projectRes = await queryMyProject({ name: "默认企业项目" })
      if (projectRes.data && projectRes.data.length > 0) {
        setProject(projectRes.data[0])

        const appRes = await queryApps({
          projectId: projectRes.data[0].id,
          name: "企业管理平台",
        })
        if (appRes.data && appRes.data.length > 0) {
          setApp(appRes.data[0])
        }
      }

      const modelRes = await queryModels({
        namespace: "file",
        name: "activities",
      })
      if (modelRes.data && modelRes.data.length > 0) {
        setModel(modelRes.data[0])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Spinner size='lg' />
      </div>
    )
  }

  const InfoCard = ({ title, icon, children }) => (
    <Card className='w-full'>
      <CardBody>
        <div className='flex items-center gap-2 mb-4'>
          <Icon icon={icon} className='w-6 h-6 text-primary' />
          <h3 className='text-lg font-medium'>{title}</h3>
        </div>
        {children}
      </CardBody>
    </Card>
  )

  const InfoItem = ({ label, value }) => (
    <div className='flex justify-between items-center py-2 border-b border-default-200 last:border-none'>
      <span className='text-default-600'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  )

  return (
    <div className='grid gap-6 p-4'>
      <InfoCard title='项目信息' icon='solar:folder-with-files-bold-duotone'>
        <InfoItem label='项目名称' value={project?.name || "未初始化"} />
        <InfoItem label='项目描述' value={project?.description || "暂无描述"} />
        <InfoItem label='创建时间' value={project?.createdAt ? new Date(project.createdAt).toLocaleString() : "-"} />
      </InfoCard>

      <InfoCard title='数据库信息' icon='solar:widget-bold-duotone'>
        <InfoItem label='数据库名称' value={app?.name || "未初始化"} />
        <InfoItem label='数据库代码' value={app?.appCode || "-"} />
        <InfoItem label='创建时间' value={app?.createdAt ? new Date(app.createdAt).toLocaleString() : "-"} />
      </InfoCard>

      <InfoCard title='模型信息' icon='solar:database-bold-duotone'>
        <InfoItem label='模型名称' value={model?.name || "未初始化"} />
        <InfoItem label='命名空间' value={model?.namespace || "-"} />
        <InfoItem label='描述' value={model?.description || "暂无描述"} />
      </InfoCard>
    </div>
  )
}

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
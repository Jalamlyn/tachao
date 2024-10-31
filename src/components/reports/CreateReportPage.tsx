import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardBody, Button, Select, SelectItem, Chip } from "@nextui-org/react"
import { useNavigate, useLocation } from "react-router-dom"
import { reportTemplates } from "../report-templates/reportTemplateConfig"
import { getMetadata } from "@/service/apis/api"
import ResourceSelectButton from "../common/ResourceSelectButton"
import { Icon } from "@iconify/react"

const CreateReportPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([])
  const [dataSources, setDataSources] = useState<{ id: string; name: string }[]>([])
  const [appId, setAppId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const appIdParam = params.get("appId")
    if (appIdParam) {
      setAppId(appIdParam)
    }
  }, [location])

  useEffect(() => {
    if (appId) {
      loadDataSources()
    }
  }, [appId])

  const loadDataSources = async () => {
    try {
      const response = await getMetadata(["forms"])
      if (response.data && response.data.length > 0 && response.data[0].value) {
        const forms = JSON.parse(response.data[0].value)
        const formDataSources = forms.map((form: any) => ({
          id: form.id,
          name: form.title || `表单 ${form.id}`,
        }))
        setDataSources(formDataSources)
      }
    } catch (error) {
      console.error("Error loading data sources:", error)
    }
  }

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
  }

  const handleDataSourceSelect = (selectedRows: any[]) => {
    const selectedIds = selectedRows.map(row => row.id)
    setSelectedDataSources(selectedIds)
  }

  const handleRemoveDataSource = (sourceId: string) => {
    setSelectedDataSources(prev => prev.filter(id => id !== sourceId))
  }

  const handleCreateReport = async () => {
    if (!selectedTemplate || selectedDataSources.length === 0 || !appId) return

    const newReport = {
      id: Date.now().toString(),
      templateId: selectedTemplate,
      title: `${reportTemplates.find((t) => t.id === selectedTemplate)?.name} - ${new Date().toLocaleString()}`,
      data: {
        dataSources: selectedDataSources,
      },
      status: "draft",
    }

    try {
      await setMetadata(`report_${newReport.id}`, JSON.stringify(newReport), appId)
      navigate(`/reports/${newReport.id}?appId=${appId}`)
    } catch (error) {
      console.error("Error creating report:", error)
    }
  }

  const getSelectedDataSourceNames = () => {
    return selectedDataSources.map(id => {
      const source = dataSources.find(ds => ds.id === id)
      return source?.name || id
    })
  }

  return (
    <div className='container mx-auto p-4'>
      <Card className='w-full'>
        <CardHeader className='pb-0 pt-2 px-4 flex-col items-start'>
          <h2 className='text-lg font-bold'>创建新报表</h2>
        </CardHeader>
        <CardBody className='overflow-visible py-2'>
          <div className='flex flex-col gap-4'>
            <Select
              label='选择报表模板'
              placeholder='请选择一个模板'
              selectedKeys={selectedTemplate ? [selectedTemplate] : []}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {reportTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </Select>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">选择数据源</label>
              <ResourceSelectButton
                resourceName="forms"
                appId={appId || ""}
                onSelect={handleDataSourceSelect}
                buttonText="选择数据源"
                selectionMode="multiple"
              />
              
              {/* 已选数据源展示区域 */}
              <div className="mt-2 flex flex-wrap gap-2">
                {getSelectedDataSourceNames().map((name, index) => (
                  <Chip
                    key={selectedDataSources[index]}
                    onClose={() => handleRemoveDataSource(selectedDataSources[index])}
                    variant="flat"
                    className="bg-blue-100"
                  >
                    {name}
                  </Chip>
                ))}
              </div>
            </div>
            
            <Button
              color='primary'
              onClick={handleCreateReport}
              disabled={!selectedTemplate || selectedDataSources.length === 0}
              className="mt-4"
            >
              创建报表
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default CreateReportPage
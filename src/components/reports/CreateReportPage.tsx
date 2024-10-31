import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardBody, Button, Select, SelectItem } from "@nextui-org/react"
import { useNavigate, useLocation } from "react-router-dom"
import { reportTemplates } from "../../components/report-templates/reportTemplateConfig"
import { useReportsMetadata } from "../../components/report-templates/hook/useReportsMetadata"
import { useFormMetadata } from "../../components/from-templates/hook/useFormMetadata"
import { getMetadata, setMetadata } from "@/service/apis/api"
import { formTemplates } from "../../components/from-templates/formTemplateConfig"

const CreateReportPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const { addReport } = useReportsMetadata()
  const { fetchForms } = useFormMetadata()
  const [appId, setAppId] = useState<string | null>(null)
  const [selectedFormTemplateId, setSelectedFormTemplateId] = useState<string>("")

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const appIdParam = params.get("appId")
    if (appIdParam) {
      setAppId(appIdParam)
    }
  }, [location])

  useEffect(() => {
    if (appId) {
      fetchForms()
    }
  }, [appId, fetchForms])

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
  }

  const handleFormTemplateChange = (value: string) => {
    setSelectedFormTemplateId(value)
  }

  const handleCreateReport = async () => {
    if (!selectedTemplate || !appId || !selectedFormTemplateId) return

    const newReport = {
      id: Date.now().toString(),
      templateId: selectedTemplate,
      title: `${reportTemplates.find((t) => t.id === selectedTemplate)?.name} - ${new Date().toLocaleString()}`,
      data: { formTemplateId: selectedFormTemplateId },
      status: "draft",
    }

    try {
      await addReport(newReport)
      await setMetadata(`report_${newReport.id}`, JSON.stringify(newReport), appId)
      navigate(`/reports/${newReport.id}?appId=${appId}`)
    } catch (error) {
      console.error("Error creating report:", error)
    }
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

            <Select
              label='选择表单模板'
              placeholder='请选择表单模板'
              selectedKeys={selectedFormTemplateId ? [selectedFormTemplateId] : []}
              onChange={(e) => handleFormTemplateChange(e.target.value)}
            >
              {formTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </Select>
            
            <Button
              color='primary'
              onClick={handleCreateReport}
              disabled={!selectedTemplate || !selectedFormTemplateId}
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
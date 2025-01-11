import React, { useState, useEffect } from "react"
import { Card, CardBody, Button, Chip, Divider, Progress } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { templates, AppTemplate } from "@/app/admin/src/pages/AppBuilder/prompts/prompt/templates"
import { getPlatMetaData } from "@/service/apis/metadata"
import message from "@/components/Message"

interface TemplateSectionProps {
  selectedTemplate: string
  setSelectedTemplate: (id: string) => void
  isAdmin: boolean
  onDeleteTemplate: (template: any) => void
}

const TemplateSuiteGroup = ({ children, suiteName }) => (
  <div className="relative p-6 rounded-xl border-2 border-default-200 bg-default-50/50 backdrop-blur-sm mb-6">
    <div className="absolute -top-3 left-4 px-3 py-1 bg-background rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Icon icon="mdi:package-variant" className="w-4 h-4 text-primary"/>
        <span className="text-sm font-medium text-primary">{suiteName}</span>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      {children}
    </div>
  </div>
)

export const TemplateSection: React.FC<TemplateSectionProps> = ({
  selectedTemplate,
  setSelectedTemplate,
  isAdmin,
  onDeleteTemplate,
}) => {
  const [platformTemplates, setPlatformTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPlatformTemplates()
  }, [])

  const loadPlatformTemplates = async () => {
    try {
      setIsLoading(true)
      const result = await getPlatMetaData(["plat_template_index"])
      const templates = result.data?.[0]?.values[0]?.value ? JSON.parse(result.data?.[0]?.values[0]?.value) : []
      setPlatformTemplates(templates)
    } catch (error) {
      console.error("Error loading platform templates:", error)
      message.error("加载平台模板失败")
    } finally {
      setIsLoading(false)
    }
  }

  const renderTemplateCard = (template: AppTemplate) => (
    <Card
      key={template.id}
      isPressable
      isHoverable
      className={`
        border-2 transition-all duration-300 
        hover:shadow-lg hover:-translate-y-1
        ${selectedTemplate === template.id ? "border-primary bg-primary/5" : "border-transparent"}
      `}
      onPress={() => setSelectedTemplate(template.id)}
    >
      <CardBody className="p-6">
        <div className="flex items-start gap-4">
          <div className={`
            p-3 rounded-xl transition-all duration-300
            ${selectedTemplate === template.id 
              ? "bg-primary/10 text-primary" 
              : "bg-default-100 text-default-600"}
          `}>
            <Icon
              icon={template.icon || "mdi:cube-outline"}
              className="w-6 h-6"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-semibold truncate">{template.name}</h4>
              {isAdmin && template.creator && (
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onPress={(e) => {
                    e.stopPropagation()
                    onDeleteTemplate(template)
                  }}
                  className="text-danger hover:bg-danger/10"
                >
                  <Icon icon="mdi:delete" className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-default-500 line-clamp-2 mb-3">{template.description}</p>
            {template.creator && (
              <div className="flex items-center gap-2 pt-2 border-t border-default-100">
                <div className="flex items-center gap-1">
                  <Icon icon="mdi:account" className="w-4 h-4 text-default-400" />
                  <span className="text-xs text-default-400">{template.creator.name}</span>
                </div>
                <Chip 
                  size="sm" 
                  variant="flat" 
                  className="ml-auto bg-default-100/50 backdrop-blur-sm"
                >
                  {new Date(template.updatedAt).toLocaleDateString()}
                </Chip>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )

  const renderTemplateSection = (title: string, icon: string, templateList: any[]) => {
    const suites = new Map<string, AppTemplate[]>()
    const standalone = templateList.filter(template => !template.suiteId)
    
    templateList.forEach(template => {
      if (template.suiteId) {
        if (!suites.has(template.suiteId)) {
          suites.set(template.suiteId, [])
        }
        suites.get(template.suiteId).push(template)
      }
    })

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon={icon} className="w-5 h-5 text-default-500" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          {isLoading && <Progress size="sm" isIndeterminate className="max-w-[40%]" />}
        </div>
        <div className="space-y-6">
          {Array.from(suites.entries()).map(([suiteId, templates]) => {
            const sortedTemplates = templates.sort((a, b) => (a.suiteOrder || 0) - (b.suiteOrder || 0))
            return (
              <TemplateSuiteGroup key={suiteId} suiteName={sortedTemplates[0].suiteName}>
                {sortedTemplates.map(template => renderTemplateCard(template))}
              </TemplateSuiteGroup>
            )
          })}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standalone.map(template => renderTemplateCard(template))}
          </div>
        </div>
      </div>
    )
  }

  const formTemplates = Object.values(templates).filter((template) => template.type === "form")
  const aiTemplates = Object.values(templates).filter((template) => template.type === "ai")

  return (
    <div className="space-y-8">
      {renderTemplateSection("企业应用", "solar:document-bold-duotone", formTemplates)}
      <Divider className="my-8" />
      {renderTemplateSection("智能应用", "hugeicons:ai-chat-02", aiTemplates)}
      <Divider className="my-8" />
      {renderTemplateSection("平台模板", "solar:cloud-storage-bold-duotone", platformTemplates)}
    </div>
  )
}
import React, { useState, useEffect } from "react"
import { Card, CardBody, Button, Chip, Divider } from "@nextui-org/react"
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
  <div className='relative p-4 rounded-xl border-2 border-default-200 bg-default-50 mb-6'>
    <div className='absolute -top-3 left-4 px-2 bg-background'>
      <div className='flex items-center gap-2'>
        <Icon icon='mdi:package-variant' className='w-4 h-4 text-primary' />
        <span className='text-sm font-medium text-primary'>{suiteName}</span>
      </div>
    </div>
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>{children}</div>
  </div>
)

export const TemplateSection: React.FC<TemplateSectionProps> = ({
  selectedTemplate,
  setSelectedTemplate,
  isAdmin,
  onDeleteTemplate,
}) => {
  const [platformTemplates, setPlatformTemplates] = useState([])

  useEffect(() => {
    loadPlatformTemplates()
  }, [])

  const loadPlatformTemplates = async () => {
    try {
      const result = await getPlatMetaData(["plat_template_index"])
      const templates = result.data?.[0]?.values[0]?.value ? JSON.parse(result.data?.[0]?.values[0]?.value) : []
      setPlatformTemplates(templates)
    } catch (error) {
      console.error("Error loading platform templates:", error)
      message.error("加载平台模板失败")
    }
  }

  const renderTemplateCard = (template: AppTemplate) => (
    <Card
      key={template.id}
      isPressable
      isHoverable
      className={`border-2 transition-all duration-200 hover:shadow-lg ${
        selectedTemplate === template.id ? "border-primary" : "border-transparent"
      }`}
      onPress={() => setSelectedTemplate(template.id)}
    >
      <CardBody className='p-4'>
        <div className='flex items-center gap-4'>
          <div
            className={`p-3 rounded-lg bg-gradient-to-br ${
              selectedTemplate === template.id ? "from-primary/20 to-primary/10" : "from-default-100 to-default-50"
            }`}
          >
            <Icon
              icon={template.icon || "mdi:cube-outline"}
              className={`w-6 h-6 ${selectedTemplate === template.id ? "text-primary" : "text-default-600"}`}
            />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-1'>
              <h4 className='text-base font-semibold truncate'>{template.name}</h4>
              {isAdmin && template.creator && (
                <Button
                  size='sm'
                  variant='light'
                  onPress={(e) => {
                    onDeleteTemplate(template)
                  }}
                >
                  <Icon icon='mdi:delete' className='w-4 h-4 text-danger' />
                </Button>
              )}
            </div>
            <p className='text-sm text-default-500 line-clamp-2 mb-2'>{template.description}</p>
            {template.creator && (
              <div className='flex items-center gap-2 mt-2 pt-2 border-t border-default-100'>
                <span className='text-xs text-default-400'>由 {template.creator.name} 创建</span>
                <Chip size='sm' variant='flat' className='ml-auto bg-default-100/50 backdrop-blur-sm'>
                  {new Date(template.updatedAt).toLocaleDateString()}
                </Chip>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )

  const renderTemplateSection = (title: string, icon: string, templateList: any[], type?: string) => {
    // 将模板按套件分组
    const suites = new Map<string, AppTemplate[]>()
    const standalone = templateList.filter((template) => !template.suiteId)

    templateList.forEach((template) => {
      if (template.suiteId) {
        if (!suites.has(template.suiteId)) {
          suites.set(template.suiteId, [])
        }
        suites.get(template.suiteId).push(template)
      }
    })

    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Icon icon={icon} className='w-5 h-5 text-default-500' />
          <h3 className='text-lg font-semibold'>{title}</h3>
        </div>
        <div className='space-y-4'>
          {/* 渲染套件模板 */}
          {Array.from(suites.entries()).map(([suiteId, templates]) => {
            const sortedTemplates = templates.sort((a, b) => (a.suiteOrder || 0) - (b.suiteOrder || 0))
            return (
              <TemplateSuiteGroup key={suiteId} suiteName={sortedTemplates[0].suiteName}>
                {sortedTemplates.map((template) => renderTemplateCard(template))}
              </TemplateSuiteGroup>
            )
          })}
          {/* 渲染独立模板 */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {standalone.map((template) => renderTemplateCard(template))}
          </div>
        </div>
      </div>
    )
  }

  const renderTemplateLibrary = () => {
    const formTemplates = Object.values(templates).filter((template) => template.type === "form")
    const aiTemplates = Object.values(templates).filter((template) => template.type === "ai")

    return (
      <div className='space-y-6'>
        {renderTemplateSection("企业应用", "solar:document-bold-duotone", formTemplates)}
        <Divider />
        {renderTemplateSection("智能应用", "hugeicons:ai-chat-02", aiTemplates)}
        <Divider />
        {renderTemplateSection("平台模板", "solar:cloud-storage-bold-duotone", platformTemplates)}
      </div>
    )
  }

  return renderTemplateLibrary()
}

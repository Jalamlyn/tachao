import React from "react"
import { Card, CardBody, CardFooter, Button, Chip, Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useDisclosure } from "@nextui-org/react"
import ServiceConsultModal from "./ServiceConsultModal"
import PageLayout from "@/components/PageLayout"
import { functionalTemplates, industryTemplates } from "./FormTemplatesCard"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

export interface FormTemplate {
  id: string
  title: string
  description: string
  type: "functional" | "industry"
  category: string
  status: "available" | "comingSoon" | "beta" | "enterprise"
  features: string[]
  promptTemplate: string
  thumbnail?: string
}

const TemplateCard: React.FC<{
  template: FormTemplate
  onSelect: (template: FormTemplate) => void
}> = ({ template, onSelect }) => {
  const isCustom = template.id === "custom-form"
  const isAvailable = template.status === "available"

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card
        className={`w-full hover:shadow-lg transition-shadow duration-300 ${isCustom ? "border-2 border-primary" : ""} ${template.id === "custom-form-self" && "text-primary"}`}
        isPressable={isAvailable}
        onPress={() => isAvailable && onSelect(template)}
      >
        <CardBody className='p-4'>
          <div className='flex items-center gap-4'>
            <div className={`p-3 rounded-lg ${isCustom ? "bg-primary text-white" : "bg-default-100"}`}>
              <Icon icon={isCustom ? "mdi:crown" : "mdi:file-document-outline"} className='w-6 h-6' />
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <h3 className='text-lg font-semibold'>{template.title}</h3>
                {isCustom && (
                  <Chip color='primary' variant='flat' size='sm'>
                    推荐
                  </Chip>
                )}
                {!isAvailable && (
                  <Chip variant='flat' size='sm'>
                    即将推出
                  </Chip>
                )}
              </div>
              <p className='text-small text-default-500'>{template.description}</p>
            </div>
          </div>
          <div className='mt-4'>
            <div className='flex flex-wrap gap-2'>
              {template.features.map((feature, index) => (
                <Chip key={index} variant='flat' size='sm'>
                  {feature}
                </Chip>
              ))}
            </div>
          </div>
        </CardBody>
        <CardFooter className='gap-2'>
          {template.id === "custom-form-self" ? (
            <Button
              color='primary'
              startContent={<Icon icon='mdi:arrow-right' className='w-4 h-4' />}
              onPress={() => onSelect(template)}
            >
              立即去定制
            </Button>
          ) : template.id === "custom-form" ? (
            <Button
              color='secondary'
              variant='flat'
              startContent={<Icon icon='mdi:crown' className='w-4 h-4' />}
              onPress={() => onSelect(template)}
            >
              咨询定制方案
            </Button>
          ) : (
            <Button
              color='default'
              variant='flat'
              startContent={<Icon icon='mdi:arrow-right' className='w-4 h-4' />}
              isDisabled={!isAvailable}
              onPress={() => isAvailable && onSelect(template)}
            >
              {isAvailable ? "使用此模板" : "即将推出"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

const FormTemplateSelect: React.FC = () => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { updateBreadcrumbs } = useBreadcrumb()

  React.useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "表单模板管理", href: "/admin/documents" },
      { label: "选择表单模板", href: "/admin/documents/create" },
    ])
  }, [updateBreadcrumbs])

  const handleTemplateSelect = (template: FormTemplate) => {
    if (template.id === "custom-form") {
      onOpen()
      return
    }

    navigate(`/admin/documents/create/${template.id}`, {
      state: {
        templateType: template.type,
        templateTitle: template.title,
        templateDescription: template.description,
        promptTemplate: template.promptTemplate,
      },
    })
  }

  return (
    <PageLayout title='选择表单模板' titleIcon='mdi:form-select'>
      <Tabs aria-label='表单模板分类'>
        <Tab
          key='functional'
          title={
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:function' className='w-4 h-4' />
              <span>按功能分类</span>
            </div>
          }
        >
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-[calc(100vh-200px)] overflow-auto'>
            {functionalTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} onSelect={handleTemplateSelect} />
            ))}
          </div>
        </Tab>
        <Tab
          key='industry'
          title={
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:domain' className='w-4 h-4' />
              <span>按行业分类</span>
            </div>
          }
        >
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-[calc(100vh-200px)] overflow-auto'>
            {industryTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} onSelect={handleTemplateSelect} />
            ))}
          </div>
        </Tab>
      </Tabs>
      <ServiceConsultModal isOpen={isOpen} onClose={onClose} />
    </PageLayout>
  )
}

export default FormTemplateSelect

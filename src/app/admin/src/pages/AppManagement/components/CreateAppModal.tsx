import React, { useState, useEffect } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Chip,
  useDisclosure,
} from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import confetti from "canvas-confetti"
import { appCodeStore } from "@/app/admin/src/pages/AppBuilder/store/appCodeStore"
import { templates } from "@/app/admin/src/pages/AppBuilder/prompts/prompt/templates"
import { useAppStore } from "../store/useAppStore"
import { getPlatMetaData, setPlatMetaData } from "@/service/apis/metadata"
import { getCurrentAccountInfo } from "@/service/apis/user"
import message from "@/components/Message"

// ... [保持其他接口定义不变]

const TemplateSuiteGroup = ({ children, suiteName }) => (
  <div className="relative p-4 rounded-xl border-2 border-default-200 bg-default-50 mb-6">
    <div className="absolute -top-3 left-4 px-2 bg-background">
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

// ... [保持 SuccessDialog 和 DeleteConfirmDialog 组件不变]

export const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose, isLoading, onSuccess }) => {
  // ... [保持状态定义和其他函数不变]

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
              selectedTemplate === template.id
                ? "from-primary/20 to-primary/10"
                : "from-default-100 to-default-50"
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
                    e.stopPropagation()
                    handleDeleteTemplate(template)
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
                {sortedTemplates.map(template => renderTemplateCard(template))}
              </TemplateSuiteGroup>
            )
          })}
          {/* 渲染独立模板 */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {standalone.map(template => renderTemplateCard(template))}
          </div>
        </div>
      </div>
    )
  }

  // ... [保持其他渲染函数不变]

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='3xl'
        classNames={{
          base: "max-w-3xl",
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
        scrollBehavior='inside'
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>创建应用</ModalHeader>
          <ModalBody className='gap-6'>
            <Input
              label='应用名称'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='请输入应用名称'
              variant='bordered'
              isRequired
            />

            <div className='space-y-6'>
              {renderCreateOptions()}
              {createMode === "template" && (
                <div className='mt-6'>
                  <Divider className='my-6' />
                  {renderTemplateLibrary()}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onClose}>
              取消
            </Button>
            <Button color='primary' onPress={handleSubmit} isLoading={loading} isDisabled={!title.trim()}>
              创建
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <SuccessDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        onConfirm={handleNavigate}
        countdown={5}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={onDeleteConfirmClose}
        onConfirm={confirmDeleteTemplate}
        templateName={templateToDelete?.name}
      />
    </>
  )
}
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Spacer,
  useDisclosure,
  ButtonGroup,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { PageRenderer, useComponents, PageConfig } from "@/components/common/DynamicPage"
import { useTemplates } from "./hooks/useTemplates"
import { usePageState } from "./hooks/usePageState"
import { AIEditor } from "./components/page-templates/AIEditor"
import { CodeEditor } from "./components/page-templates/CodeEditor"
import { PreviewModal } from "./components/page-templates/PreviewModal"
import { ShareModal } from "./components/page-templates/ShareModal"
import { configToCode, codeToConfig } from "./utils/codeFormatter"
import message from "@/components/Message"

type EditorMode = 'visual' | 'ai'
type DeviceType = 'desktop' | 'tablet' | 'mobile'

const PageTemplateEditor: React.FC = () => {
  // 路由和导航
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()

  // 组件和模板管理
  const { components } = useComponents()
  const { 
    handleTemplateChange, 
    saveTemplate, 
    isLoading: isTemplateLoading 
  } = useTemplates()

  // 页面状态管理
  const {
    state: { pageConfig, selectedDevice, isLoading, error },
    setPageConfig,
    setSelectedDevice,
    startLoading,
    stopLoading,
    setError,
    resetState
  } = usePageState()

  // 编辑器状态
  const [editorMode, setEditorMode] = useState<EditorMode>('visual')
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [codeValue, setCodeValue] = useState('')

  // 模态框状态
  const { 
    isOpen: isSuccessModalOpen, 
    onOpen: onSuccessModalOpen, 
    onClose: onSuccessModalClose 
  } = useDisclosure()
  
  const { 
    isOpen: isPreviewOpen, 
    onOpen: onPreviewOpen, 
    onClose: onPreviewClose 
  } = useDisclosure()
  
  const { 
    isOpen: isShareOpen, 
    onOpen: onShareOpen, 
    onClose: onShareClose 
  } = useDisclosure()

  // 设备选项
  const deviceOptions = useMemo(() => [
    { key: 'desktop', label: '桌面', icon: 'mdi:desktop' },
    { key: 'tablet', label: '平板', icon: 'mdi:tablet' },
    { key: 'mobile', label: '手机', icon: 'mdi:mobile' }
  ], [])

  // 初始化和清理
  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "页面模板管理", href: "/we-chat-app/admin/pages" },
      {
        label: templateId ? "编辑页面模板" : "创建页面模板",
        href: templateId 
          ? `/we-chat-app/admin/pages/edit/${templateId}`
          : "/we-chat-app/admin/pages/create",
      },
    ])

    if (templateId) {
      loadTemplate(templateId)
    }

    return () => {
      resetState()
    }
  }, [templateId])

  // 加载模板
  const loadTemplate = async (id: string) => {
    startLoading()
    try {
      const config = await handleTemplateChange(id)
      if (config) {
        setPageConfig(config)
      } else {
        setError("模板加载失败")
      }
    } catch (error) {
      setError("加载模板失败")
      navigate("/we-chat-app/admin/pages")
    } finally {
      stopLoading()
    }
  }

  // 保存模板
  const handleSave = async () => {
    if (!pageConfig) {
      message.error("请先创建页面内容")
      return
    }

    try {
      await saveTemplate(pageConfig)
      onSuccessModalOpen()
    } catch (error) {
      message.error("保存失败")
    }
  }

  // 预览功能
  const handlePreview = () => {
    if (!pageConfig) {
      message.error("没有可预览的内容")
      return
    }
    onPreviewOpen()
  }

  // 配置更新
  const handleConfigChange = useCallback((newConfig: PageConfig) => {
    setPageConfig(newConfig)
  }, [])

  // 代码编辑器
  const handleOpenCodeEditor = useCallback(() => {
    if (pageConfig) {
      try {
        const code = configToCode(pageConfig)
        setCodeValue(code)
        setShowCodeEditor(true)
      } catch (error) {
        message.error('打开代码编辑器失败')
      }
    }
  }, [pageConfig])

  const handleCodeChange = useCallback((newCode: string) => {
    setCodeValue(newCode)
    try {
      const newConfig = codeToConfig(newCode)
      setPageConfig(newConfig)
    } catch (error) {
      console.error('Error parsing code:', error)
    }
  }, [])

  // 导航功能
  const handleCreateDocument = () => {
    navigate("/we-chat-app/admin/documents/create")
  }

  const handleGoToTemplates = () => {
    navigate("/we-chat-app/admin/pages")
  }

  // 加载状态
  const isLoadingState = isLoading || isTemplateLoading

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* 工具栏 */}
      <div className="w-full h-16 px-4 border-b fixed top-0 left-0 bg-white z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 编辑模式切换 */}
          <ButtonGroup>
            <Button
              variant={editorMode === 'visual' ? 'solid' : 'flat'}
              onClick={() => setEditorMode('visual')}
              startContent={<Icon icon="mdi:pencil" className="w-4 h-4" />}
            >
              可视化编辑
            </Button>
            <Button
              variant={editorMode === 'ai' ? 'solid' : 'flat'}
              onClick={() => setEditorMode('ai')}
              startContent={<Icon icon="mdi:robot" className="w-4 h-4" />}
            >
              AI 助手
            </Button>
          </ButtonGroup>

          {editorMode === 'visual' && (
            <>
              <Select
                label="预览设备"
                selectedKeys={[selectedDevice]}
                className="w-40"
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                {deviceOptions.map(device => (
                  <SelectItem 
                    key={device.key} 
                    startContent={<Icon icon={device.icon} />}
                  >
                    {device.label}
                  </SelectItem>
                ))}
              </Select>
              <Button
                variant="flat"
                startContent={<Icon icon="mdi:code" className="w-4 h-4" />}
                onClick={handleOpenCodeEditor}
                isDisabled={!pageConfig}
              >
                查看代码
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="flat"
            startContent={<Icon icon="mdi:share" className="w-4 h-4" />}
            onClick={onShareOpen}
            isDisabled={!pageConfig}
          >
            分享
          </Button>
          <Button
            color="primary"
            variant="flat"
            startContent={<Icon icon="mdi:eye" className="w-4 h-4" />}
            onClick={handlePreview}
            isDisabled={!pageConfig}
          >
            预览
          </Button>
          <Button
            color="primary"
            startContent={<Icon icon="mdi:content-save" className="w-4 h-4" />}
            onClick={handleSave}
            isDisabled={!pageConfig}
            isLoading={isLoadingState}
          >
            保存模板
          </Button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 mt-16 p-6">
        <AnimatePresence mode="wait">
          {showCodeEditor ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CodeEditor
                code={codeValue}
                onChange={handleCodeChange}
                onClose={() => setShowCodeEditor(false)}
              />
            </motion.div>
          ) : editorMode === 'ai' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AIEditor onConfigChange={handleConfigChange} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="w-full h-full">
                <CardBody>
                  {isLoadingState ? (
                    <div className="flex items-center justify-center h-full">
                      <Icon icon="eos-icons:loading" className="w-8 h-8 animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-danger">
                      <Icon icon="mdi:alert-circle" className="w-16 h-16 mb-4" />
                      <p>{error}</p>
                    </div>
                  ) : pageConfig ? (
                    <div className={`preview-${selectedDevice}`}>
                      <PageRenderer
                        config={pageConfig}
                        components={components}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Icon icon="solar:layout-left-bold" className="w-16 h-16 mb-4" />
                      <p>开始创建您的页面模板</p>
                      <Button
                        className="mt-4"
                        color="primary"
                        variant="flat"
                        startContent={<Icon icon="mdi:robot" />}
                        onClick={() => setEditorMode('ai')}
                      >
                        使用 AI 助手
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 成功保存弹窗 */}
      <Modal isOpen={isSuccessModalOpen} onClose={onSuccessModalClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <Icon icon="mdi:check-circle" className="w-6 h-6 text-success" />
              <span>模板{templateId ? "更新" : "保存"}成功</span>
            </motion.div>
          </ModalHeader>
          <ModalBody>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-4"
            >
              <p className="text-gray-600">
                恭喜！您的页面模板已经{templateId ? "更新" : "保存"}成功。现在您可以：
              </p>
              <div className="flex flex-col gap-2">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-2">创建新单据</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    使用这个模板立即创建一个新的单据，开始记录您的业务数据。
                  </p>
                  <Button
                    color="primary"
                    onClick={handleCreateDocument}
                    startContent={<Icon icon="mdi:file-document-plus" className="w-4 h-4" />}
                  >
                    创建单据
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">返回模板管理</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    返回模板列表查看或管理您的所有页面模板。
                  </p>
                  <Button
                    variant="bordered"
                    onClick={handleGoToTemplates}
                    startContent={<Icon icon="mdi:format-list-bulleted" className="w-4 h-4" />}
                  >
                    查看所有模板
                  </Button>
                </div>
              </div>
            </motion.div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onSuccessModalClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 预览模态框 */}
      {pageConfig && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={onPreviewClose}
          config={pageConfig}
          components={components}
        />
      )}

      {/* 分享模态框 */}
      {pageConfig && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={onShareClose}
          templateId={templateId || ""}
          templateTitle={pageConfig.metadata?.title || "未命名模板"}
        />
      )}
    </div>
  )
}

export default PageTemplateEditor
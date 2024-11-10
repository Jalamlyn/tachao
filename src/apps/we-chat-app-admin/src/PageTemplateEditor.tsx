import React, { useState, useEffect } from "react"
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
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { PageRenderer, useComponents } from "@/components/common/DynamicPage"
import { useTemplates } from "./hooks/useTemplates"
import { usePageState } from "./hooks/usePageState"
import { AIEditor } from "./components/page-templates/AIEditor"
import message from "@/components/Message"

type EditorMode = 'visual' | 'ai'

const PageTemplateEditor: React.FC = () => {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { components } = useComponents()
  const { 
    handleTemplateChange, 
    saveTemplate, 
    isLoading: isTemplateLoading 
  } = useTemplates()
  const {
    state: { pageConfig, selectedDevice, isLoading, error },
    setPageConfig,
    setSelectedDevice,
    startLoading,
    stopLoading,
    setError
  } = usePageState()
  
  // 添加编辑模式状态
  const [editorMode, setEditorMode] = useState<EditorMode>('visual')

  // ... 保留原有的 useEffect 和其他函数 ...

  // 添加配置更新处理函数
  const handleConfigChange = (newConfig: any) => {
    setPageConfig(newConfig)
  }

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* 工具栏 */}
      <div className="w-full h-16 px-4 border-b fixed top-0 left-0 bg-white z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 添加编辑模式切换 */}
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
                <SelectItem key="desktop" startContent={<Icon icon="mdi:desktop" />}>
                  桌面
                </SelectItem>
                <SelectItem key="tablet" startContent={<Icon icon="mdi:tablet" />}>
                  平板
                </SelectItem>
                <SelectItem key="mobile" startContent={<Icon icon="mdi:mobile" />}>
                  手机
                </SelectItem>
              </Select>
              <Button
                variant="flat"
                startContent={<Icon icon="mdi:code" className="w-4 h-4" />}
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
        {editorMode === 'ai' ? (
          <AIEditor onConfigChange={handleConfigChange} />
        ) : (
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
        )}
      </div>
    </div>
  )
}

export default PageTemplateEditor
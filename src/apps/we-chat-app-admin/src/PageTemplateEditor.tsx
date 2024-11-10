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
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { PageRenderer, useComponents } from "@/components/common/DynamicPage"
import message from "@/components/Message"

const PageTemplateEditor: React.FC = () => {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { components } = useComponents()
  const [selectedDevice, setSelectedDevice] = useState<string>("desktop")
  const [pageConfig, setPageConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

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
  }, [templateId])

  const loadTemplate = async (id: string) => {
    setIsLoading(true)
    try {
      // TODO: 实现模板加载逻辑
      const mockTemplate = {
        metadata: {
          title: "示例模板",
          description: "这是一个示例模板"
        },
        layout: {
          type: "grid",
          grid: {
            cols: { base: 1, md: 2 },
            gap: 4
          }
        },
        content: [
          {
            type: "Card",
            props: {
              className: "p-4",
              children: "示例内容"
            }
          }
        ]
      }
      setPageConfig(mockTemplate)
    } catch (error) {
      message.error("加载模板失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // TODO: 实现保存逻辑
      message.success("保存成功")
      navigate("/we-chat-app/admin/pages")
    } catch (error) {
      message.error("保存失败")
    }
  }

  const handlePreview = () => {
    // TODO: 实现预览逻辑
  }

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* 工具栏 */}
      <div className="w-full h-16 px-4 border-b fixed top-0 left-0 bg-white z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            label="预览设备"
            defaultSelectedKeys={["desktop"]}
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
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="flat"
            startContent={<Icon icon="mdi:eye" className="w-4 h-4" />}
            onClick={handlePreview}
          >
            预览
          </Button>
          <Button
            color="primary"
            startContent={<Icon icon="mdi:content-save" className="w-4 h-4" />}
            onClick={handleSave}
          >
            保存模板
          </Button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 mt-16 p-6">
        <Card className="w-full h-full">
          <CardBody>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Icon icon="eos-icons:loading" className="w-8 h-8 animate-spin" />
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
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default PageTemplateEditor
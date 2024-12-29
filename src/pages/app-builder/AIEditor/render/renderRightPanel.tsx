import { Tabs, Tab, Button, Select, SelectItem } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResizablePanel } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { VersionControl, Version } from "../../types"
import { CodeItem } from "../type"

export const renderRightPanel = (
  versionControl: VersionControl,
  selectedTab: string,
  onTabChange: (key: string) => void,
  renderPreview: () => React.ReactNode,
  showDataTab: boolean,
  previewTabName: string,
  renderCodeEditor: (content: string, isEditing: boolean) => React.ReactNode,
  currentVersion: Version | null,
  showCodeTab: boolean,
  renderDataView?: () => React.ReactNode,
  isEditing?: boolean,
  editedCode?: string,
  setIsEditing?: (editing: boolean) => void,
  handleSaveEdit?: () => void,
  handleCancelEdit?: () => void,
  codeItems?: CodeItem[],
  selectedCodeId?: string,
  onCodeSelect?: (id: string) => void
) => {
  return (
    <ResizablePanel defaultSize={50} className="resizable-panel bg-slate-50">
      <div className="relative h-full flex flex-col">
        <div className="version-control-wrapper absolute -top-2 right-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 transition-all duration-200 hover:bg-white z-50">
          <div className="flex items-center gap-3">
            <div className="version-controls flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={versionControl.rollback}
                disabled={!versionControl.canRollback}
                className={cn(
                  "h-8 w-8 p-0 rounded-full transition-all duration-200",
                  "hover:bg-primary/10 active:scale-95",
                  !versionControl.canRollback && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon icon="mdi:chevron-left" className="h-4 w-4" />
              </Button>

              <div className="version-info px-2 min-w-[80px] text-center">
                <span className="text-sm font-medium">
                  {versionControl.currentIndex + 1}/{versionControl.versions.length}
                </span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={versionControl.forward}
                disabled={!versionControl.canForward}
                className={cn(
                  "h-8 w-8 p-0 rounded-full transition-all duration-200",
                  "hover:bg-primary/10 active:scale-95",
                  !versionControl.canForward && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon icon="mdi:chevron-right" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <Tabs size="sm" selectedKey={selectedTab} onSelectionChange={(key) => onTabChange(key.toString())}>
          {showDataTab && <Tab key="data" title="数据源" />}
          <Tab key="preview" title={previewTabName}>
            <div className="h-[calc(100vh-260px)] overflow-auto p-2">{renderPreview()}</div>
          </Tab>
          {showCodeTab && <Tab key="code" title="代码视图" />}
        </Tabs>

        {selectedTab === "data" && showDataTab && (
          <div className="h-[calc(100vh-260px)] overflow-auto p-2">{renderDataView?.()}</div>
        )}
        {selectedTab === "code" && showCodeTab && (
          <div className="relative h-[calc(100vh-260px)] rounded-lg overflow-hidden mt-2">
            <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center">
              <Select
                size="sm"
                className="max-w-xs bg-white/80 backdrop-blur-sm"
                selectedKeys={selectedCodeId ? [selectedCodeId] : []}
                onChange={(e) => onCodeSelect?.(e.target.value)}
              >
                {codeItems?.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    startContent={
                      <Icon icon={item.type === "app" ? "mdi:application" : "mdi:file-code"} className="w-4 h-4" />
                    }
                  >
                    {item.title}
                  </SelectItem>
                ))}
              </Select>

              {isEditing ? (
                <div className="space-x-2">
                  <Button
                    size="sm"
                    color="primary"
                    onClick={handleSaveEdit}
                    startContent={<Icon icon="mdi:content-save" className="w-4 h-4" />}
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    onClick={handleCancelEdit}
                    startContent={<Icon icon="mdi:close" className="w-4 h-4" />}
                  >
                    取消
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  color="primary"
                  onClick={() => setIsEditing?.(true)}
                  startContent={<Icon icon="mdi:pencil" className="w-4 h-4" />}
                >
                  编辑
                </Button>
              )}
            </div>
            <div className="h-full pt-14 pb-2 px-2">
              {renderCodeEditor(
                isEditing
                  ? editedCode || ""
                  : selectedCodeId
                    ? codeItems?.find((item) => item.id === selectedCodeId)?.code || ""
                    : "",
                isEditing || false
              )}
            </div>
          </div>
        )}
      </div>
    </ResizablePanel>
  )
}
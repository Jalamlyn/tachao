import { Tabs, Tab, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResizablePanel } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"

export const renderRightPanel = (
  versionControl,
  selectedTab,
  onTabChange,
  renderPreview,
  showDataTab,
  previewTabName,
  renderCodeEditor,
  currentVersion,
  showCodeTab,
  renderDataView,
  isEditing,
  editedCode,
  setIsEditing,
  handleSaveEdit,
  handleCancelEdit
) => {
  return (
    <ResizablePanel defaultSize={70} className='resizable-panel bg-slate-50'>
      <div className='relative h-full flex flex-col p-4'>
        <div className='version-control-wrapper absolute -top-2 right-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 transition-all duration-200 hover:bg-white'>
          <div className='flex items-center gap-3'>
            <div className='version-controls flex items-center gap-1'>
              <Button
                size='sm'
                variant='ghost'
                onClick={versionControl.rollback}
                disabled={!versionControl.canRollback}
                className={cn(
                  "h-8 w-8 p-0 rounded-full transition-all duration-200",
                  "hover:bg-primary/10 active:scale-95",
                  !versionControl.canRollback && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon icon='mdi:chevron-left' className='h-4 w-4' />
              </Button>

              <div className='version-info px-2 min-w-[80px] text-center'>
                <span className='text-sm font-medium'>
                  {versionControl.currentIndex + 1}/{versionControl.versions.length}
                </span>
              </div>

              <Button
                size='sm'
                variant='ghost'
                onClick={versionControl.forward}
                disabled={!versionControl.canForward}
                className={cn(
                  "h-8 w-8 p-0 rounded-full transition-all duration-200",
                  "hover:bg-primary/10 active:scale-95",
                  !versionControl.canForward && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon icon='mdi:chevron-right' className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
        <Tabs size='sm' selectedKey={selectedTab} onSelectionChange={(key) => onTabChange(key.toString())}>
          {showDataTab && <Tab key='data' title='数据源' />}
          <Tab key='preview' title={previewTabName}>
            <div className='h-[calc(100vh-200px)] overflow-auto p-2'>{renderPreview(currentVersion)}</div>
          </Tab>
          {showCodeTab && <Tab key='code' title='代码视图' />}
        </Tabs>

        {selectedTab === "data" && showDataTab && (
          <div className='h-[calc(100vh-200px)] overflow-auto p-2'>{renderDataView?.()}</div>
        )}
        {selectedTab === "code" && showCodeTab && (
          <div className='relative h-[calc(100vh-200px)] rounded-lg overflow-auto mt-2'>
            <>
              {renderCodeEditor(isEditing ? editedCode : currentVersion?.rawConfig || "", isEditing)}
              {isEditing ? (
                <div className='absolute top-2 right-2 space-x-2'>
                  <Button
                    size='sm'
                    color='primary'
                    onClick={handleSaveEdit}
                    startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}
                  >
                    保存
                  </Button>
                  <Button
                    size='sm'
                    variant='flat'
                    onClick={handleCancelEdit}
                    startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
                  >
                    取消
                  </Button>
                </div>
              ) : (
                <div className='absolute top-2 right-2'>
                  <Button
                    size='sm'
                    color='primary'
                    onClick={() => setIsEditing(true)}
                    startContent={<Icon icon='mdi:pencil' className='w-4 h-4' />}
                  >
                    编辑
                  </Button>
                </div>
              )}
            </>
          </div>
        )}
      </div>
    </ResizablePanel>
  )
}

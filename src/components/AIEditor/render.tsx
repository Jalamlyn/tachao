import { ScrollShadow, Tabs, Tab, Button, Select, SelectItem } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResizablePanel } from "@/components/ui/resizable"
import MessageCard from "@/components/MessageCard"
import AICommandInput from "@/components/AICommandInput"
import { cn } from "@/lib/utils"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import { ImageUploader } from "../ImageUpload"
import { AI_LEVELS } from "./type"

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
    <ResizablePanel defaultSize={50} className='resizable-panel bg-slate-50'>
      <div className='relative h-full flex flex-col'>
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
            <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderPreview(currentVersion)}</div>
          </Tab>
          {showCodeTab && <Tab key='code' title='代码视图' />}
        </Tabs>

        {selectedTab === "data" && showDataTab && (
          <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderDataView?.()}</div>
        )}
        {selectedTab === "code" && showCodeTab && (
          <div className='relative h-[calc(100vh-260px)] rounded-lg overflow-auto mt-2'>
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

export const renderLeftPanel = (
  selectedAILevel,
  handleAILevelChange,
  handleClearMessages,
  messages,
  imageUpload,
  agent,
  onCommandResult
) => {
  return (
    <ResizablePanel defaultSize={50} className='resizable-panel'>
      <div className='h-full flex flex-col'>
        <div className='flex justify-between items-center p-2 border-b mb-2'>
          <div className='flex items-center gap-4'>
            <h3 className='text-lg font-medium'>对话</h3>
            <Select
              size='sm'
              selectedKeys={[selectedAILevel]}
              onChange={(e) => handleAILevelChange(e.target.value as keyof typeof AI_LEVELS)}
              className='w-64'
              renderValue={(items) => {
                return items.map((item) => (
                  <div key={item.key} className='flex items-center gap-2'>
                    {item.data.icon}
                    <div className='flex flex-col'>
                      <span className='text-small'>{item.data.label}</span>
                      <span className='text-tiny text-default-500'>
                        {item.data.cost} 塔币/次 - {item.data.description}
                      </span>
                    </div>
                  </div>
                ))
              }}
            >
              {Object.entries(AI_LEVELS).map(([key, level]) => (
                <SelectItem
                  key={key}
                  value={key}
                  startContent={level.icon}
                  description={`${level.cost} 塔币/次 ${level.description}`}
                >
                  <div className='flex items-center gap-2'>
                    {level.icon}
                    <div className='flex flex-col'>
                      <span>{level.label}</span>
                      <span className='text-tiny text-default-400'>
                        {level.cost} 塔币/次 - {level.description}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>
          <Button
            size='sm'
            variant='light'
            color='primary'
            onClick={handleClearMessages}
            startContent={<Icon icon='mdi:refresh' className='w-4 h-4' />}
          >
            新对话
          </Button>
        </div>
        <ScrollShadow className='flex-1 overflow-y-auto pb-9'>
          <div className='space-y-4'>
            {messages.map((message) => (
              <div key={message.id}>
                <MessageCard
                  avatar={message.role === "assistant" ? mo2 : user}
                  message={message.content}
                  role={message.role}
                  status={message.status || "success"}
                  className='message-card max-w-[90%]'
                  aiLevel={message.aiLevel}
                />
              </div>
            ))}
          </div>
        </ScrollShadow>

        <div className='p-2'>
          {imageUpload && <ImageUploader agent={agent} />}
          <AICommandInput
            agent={agent}
            onResult={onCommandResult}
            aiLevel={selectedAILevel}
            tokenCost={AI_LEVELS[selectedAILevel].cost}
          />
        </div>
      </div>
    </ResizablePanel>
  )
}
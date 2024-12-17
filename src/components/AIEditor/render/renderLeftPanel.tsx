import { ScrollShadow, Button, ButtonGroup, Tooltip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResizablePanel } from "@/components/ui/resizable"
import MessageCard from "@/components/MessageCard"
import AICommandInput from "@/components/AIEditor/components/AICommandInput"
import { cn } from "@/lib/utils"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import { ImageUploader } from "../../ImageUpload"
import { AI_LEVELS } from "../type"

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
            <ButtonGroup variant='flat' className='gap-2 p-1 bg-default-100 rounded-lg'>
              {Object.entries(AI_LEVELS).map(([key, level]) => (
                <Tooltip content={level.description}>
                  <Button
                    key={key}
                    className={cn(
                      "min-w-[140px] h-12 px-4",
                      "transition-all duration-200",
                      selectedAILevel === key
                        ? "bg-primary text-white shadow-lg scale-105"
                        : "bg-white hover:bg-primary/10"
                    )}
                    onClick={() => handleAILevelChange(key)}
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className={cn("p-1.5 rounded-full", selectedAILevel === key ? "bg-white/20" : "bg-primary/10")}
                      >
                        <Icon
                          icon={level.icon}
                          className={cn("w-4 h-4", selectedAILevel === key ? "text-white" : "text-primary")}
                        />
                      </div>
                      <div className='flex flex-col items-start'>
                        <span className='font-medium'>{level.label}</span>
                      </div>
                    </div>
                  </Button>
                </Tooltip>
              ))}
            </ButtonGroup>
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
          {imageUpload && <ImageUploader agent={agent} aiLevel={selectedAILevel} />}
          <AICommandInput agent={agent} onResult={onCommandResult} aiLevel={selectedAILevel} />
        </div>
      </div>
    </ResizablePanel>
  )
}

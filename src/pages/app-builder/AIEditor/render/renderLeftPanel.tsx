import { ScrollShadow, Button, ButtonGroup, Tooltip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResizablePanel } from "@/components/ui/resizable"
import MessageCard from "@/components/MessageCard"
import AICommandInput from "../components/AICommandInput"
import { cn } from "@/lib/utils"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import { AI_LEVELS } from "../type"
import { VersionControl } from "../../types"

export const renderLeftPanel = (
  onStop,
  selectedAILevel: keyof typeof AI_LEVELS,
  handleAILevelChange: (level: keyof typeof AI_LEVELS) => void,
  handleClearMessages: () => void,
  messages: any[],
  imageUpload: boolean,
  excelUpload: boolean,
  agent: any,
  onCommandResult: (result: any) => void,
  versionControl?: VersionControl
) => {
  return (
    <ResizablePanel defaultSize={50} className='resizable-panel'>
      <div className='h-full flex flex-col'>
        <div className='flex justify-between items-center p-2 border-b mb-2'>
          <div className='flex items-center gap-4'></div>
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
          <AICommandInput onStop={onStop} agent={agent} onResult={onCommandResult} aiLevel={selectedAILevel} />
        </div>
      </div>
    </ResizablePanel>
  )
}

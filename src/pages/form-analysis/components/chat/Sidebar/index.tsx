import React from "react"
import { Button, ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ChatSession } from "../../../store/useChatStore"
import { cn } from "@/theme/cn"

interface SidebarProps {
  isOpen: boolean
  sessions: ChatSession[]
  currentSession: ChatSession | null
  onSessionSelect: (session: ChatSession) => void
  onNewChat: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  sessions,
  currentSession,
  onSessionSelect,
  onNewChat,
}) => {
  return (
    <div
      className={cn(
        "w-64 h-full bg-content2 flex flex-col border-r border-divider transition-all duration-300",
        !isOpen && "w-0"
      )}
    >
      <div className="p-4">
        <Button
          fullWidth
          color="primary"
          startContent={<Icon icon="mdi:plus" />}
          onPress={onNewChat}
        >
          新建会话
        </Button>
      </div>

      <ScrollShadow className="flex-1">
        <div className="space-y-2 p-2">
          {sessions.map((session) => (
            <Button
              key={session.id}
              fullWidth
              variant={currentSession?.id === session.id ? "flat" : "light"}
              color={currentSession?.id === session.id ? "primary" : "default"}
              className="justify-start"
              onPress={() => onSessionSelect(session)}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon icon="mdi:chat-outline" />
                <span className="truncate">{session.title}</span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollShadow>
    </div>
  )
}

export default Sidebar
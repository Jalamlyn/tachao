import React, { memo } from "react"
import { Button, Textarea, Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface AICommandInputProps {
  input: string
  isLoading: boolean
  selectedMode?: "modify" | "analyze"
  onInputChange: (value: string) => void
  onSend: () => void
  onModeChange?: (mode: "modify" | "analyze") => void
  placeholder?: string
  showModeSwitch?: boolean
}

const AICommandInput = memo(
  ({
    input,
    isLoading,
    selectedMode,
    onInputChange,
    onSend,
    onModeChange,
    placeholder,
    showModeSwitch = false,
  }: AICommandInputProps) => {
    return (
      <div className='flex flex-col gap-2 p-4 bg-white'>
        {showModeSwitch && onModeChange && (
          <Tabs
            selectedKey={selectedMode}
            onSelectionChange={(key) => onModeChange(key as "modify" | "analyze")}
            size='sm'
            color='primary'
            variant='light'
            classNames={{
              tabList: "gap-4",
              cursor: "w-full",
              tab: "max-w-fit px-4",
            }}
          >
            <Tab
              key='modify'
              title={
                <div className='flex items-center gap-2'>
                  <Icon icon='mdi:pencil' />
                  <span>资料修改</span>
                </div>
              }
            />
            <Tab
              key='analyze'
              title={
                <div className='flex items-center gap-2'>
                  <Icon icon='mdi:chart-bar' />
                  <span>资料分析</span>
                </div>
              }
            />
          </Tabs>
        )}

        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          className='flex-grow'
          classNames={{
            input: "py-2 text-medium",
            inputWrapper: "bg-default-100",
          }}
          minRows={1}
          maxRows={4}
          endContent={
            <div className='flex items-center gap-2 pr-2'>
              <Button
                isIconOnly
                className={!input || isLoading ? "" : "bg-primary"}
                color={!input || isLoading ? "default" : "primary"}
                isDisabled={!input || isLoading}
                radius='full'
                variant={!input || isLoading ? "flat" : "solid"}
                onClick={onSend}
                isLoading={isLoading}
              >
                {isLoading ? (
                  <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
                ) : (
                  <Icon
                    className={!input ? "text-default-500" : "text-white"}
                    icon='solar:arrow-up-linear'
                    width={20}
                  />
                )}
              </Button>
            </div>
          }
        />
      </div>
    )
  }
)

AICommandInput.displayName = "AICommandInput"

export default AICommandInput
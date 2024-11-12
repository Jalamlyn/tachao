import React, { memo, useState } from "react"
import { Button, Textarea, Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface AICommandInputProps {
  defaultValue?: string
  isLoading: boolean
  selectedMode?: "modify" | "analyze"
  onInputSubmit: (value: string) => void
  onSend: () => void
  onModeChange?: (mode: "modify" | "analyze") => void
  placeholder?: string
  showModeSwitch?: boolean
  // 保留 input 和 onInputChange 以保持向后兼容
  input?: string
  onInputChange?: (value: string) => void
}

const AICommandInput = memo(
  ({
    defaultValue = "",
    isLoading,
    selectedMode,
    onInputSubmit,
    onSend,
    onModeChange,
    placeholder,
    showModeSwitch = false,
    // 向后兼容的属性
    input: _input,
    onInputChange: _onInputChange,
  }: AICommandInputProps) => {
    // 内部状态管理
    const [internalInput, setInternalInput] = useState(defaultValue)

    // 处理输入变化
    const handleInputChange = (value: string) => {
      setInternalInput(value)
      // 向后兼容：如果提供了 onInputChange，也调用它
      _onInputChange?.(value)
    }

    // 处理发送
    const handleSend = () => {
      onInputSubmit(internalInput)
      onSend()
      setInternalInput("")
    }

    // 使用受控或非受控模式
    const inputValue = _input !== undefined ? _input : internalInput

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
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
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
                className={!inputValue || isLoading ? "" : "bg-primary"}
                color={!inputValue || isLoading ? "default" : "primary"}
                isDisabled={!inputValue || isLoading}
                radius='full'
                variant={!inputValue || isLoading ? "flat" : "solid"}
                onClick={handleSend}
                isLoading={isLoading}
              >
                {isLoading ? (
                  <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
                ) : (
                  <Icon
                    className={!inputValue ? "text-default-500" : "text-white"}
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
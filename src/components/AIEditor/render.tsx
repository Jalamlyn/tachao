// ... (前面的 import 部分保持不变)

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
                const selectedLevel = items[0]
                const levelKey = selectedLevel?.key?.toString() || selectedAILevel
                const level = AI_LEVELS[levelKey as keyof typeof AI_LEVELS]
                
                if (!level) return null

                return (
                  <div className='flex items-center gap-2'>
                    {level.icon}
                    <div className='flex flex-col'>
                      <span className='text-small'>{level.label}</span>
                      <span className='text-tiny text-default-500'>
                        {level.cost} 塔币/次 - {level.description}
                      </span>
                    </div>
                  </div>
                )
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

// ... (其余部分保持不变)
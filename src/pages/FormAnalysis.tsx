// ... [之前的 import 部分保持不变]

const FormAnalysis: React.FC = () => {
  // ... [之前的 state 定义保持不变]
  const [isLoading, setIsLoading] = useState(true) // 添加加载状态

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const templatesData = await fetchTemplates()
        const forms = await fetchForms()
        
        // 计算每个模板的表单数量
        const templatesWithCount = templatesData.map(template => ({
          ...template,
          formCount: forms.filter(form => form.template?.id === template.id).length
        }))
        
        setTemplates(templatesWithCount)
        formsRef.current = forms

        // 从本地存储加载最近使用的模板
        const recent = localStorage.getItem("recentTemplates")
        if (recent) {
          setRecentTemplates(JSON.parse(recent))
        }
      } catch (error) {
        console.error("Error loading data:", error)
        message.error("加载数据失败")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()

    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "AI 智能助手", href: "/we-chat-app/admin/ai-assistant" },
    ])
  }, [])

  // ... [其他方法保持不变]

  return (
    <PageLayout title='AI 智能助手' titleIcon='hugeicons:ai-chat-02' actions={pageActions}>
      <Card className='w-full shadow-lg'>
        <CardBody className='p-4 flex flex-col gap-4'>
          <ScrollShadow className='flex-grow h-[calc(100vh-380px)] mb-4'> {/* 调整高度 */}
            {messages.map((message) => (
              <div key={message.id}>
                <MessageCard
                  avatar={message.role === "assistant" ? mo2 : user}
                  message={message.content}
                  role={message.role}
                  status='success'
                  className='mb-4'
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollShadow>

          <div className='flex flex-col gap-2'>
            {/* 数据源选择区域 */}
            <div className='flex flex-wrap gap-2 min-h-8 p-2 bg-default-100 rounded-lg'>
              {selectedTemplates.map((templateId) => {
                const template = templates.find(t => t.id === templateId)
                return (
                  <Chip
                    key={templateId}
                    onClose={() => handleRemoveTemplate(templateId)}
                    variant='flat'
                    color='primary'
                    className='h-6'
                  >
                    {template?.title} ({template?.formCount || 0}条数据)
                  </Chip>
                )
              })}
              <Button
                size='sm'
                variant='flat'
                startContent={<Icon icon='mdi:plus' />}
                onPress={onTemplateModalOpen}
              >
                {selectedTemplates.length === 0 ? "选择数据源" : "添加数据源"}
              </Button>
            </div>

            {/* 输入区域 */}
            <div className='flex items-end gap-2'>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedTemplates.length > 0
                    ? "输入分析指令，例如: '统计所有表单的状态分布'"
                    : "请先选择数据源"
                }
                className='flex-grow'
                classNames={{
                  input: "py-2 text-medium",
                  inputWrapper: "bg-default-100",
                }}
                minRows={2}
                maxRows={4}
                isDisabled={selectedTemplates.length === 0}
                endContent={
                  <div className='flex items-center gap-2 pr-2'>
                    <Tooltip content='发送指令' placement='top'>
                      <Button
                        isIconOnly
                        className={!input || isLoading ? "" : "bg-primary"}
                        color={!input || isLoading ? "default" : "primary"}
                        isDisabled={!input || isLoading || selectedTemplates.length === 0}
                        radius='full'
                        variant={!input || isLoading ? "flat" : "solid"}
                        onClick={handleSendMessage}
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
                    </Tooltip>
                  </div>
                }
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 模板选择模态框 */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={onTemplateModalClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">选择数据源</ModalHeader>
          <ModalBody className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner label="加载中..." />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-default-500">
                暂无可用的表单模板
              </div>
            ) : (
              <>
                {recentTemplates.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-medium font-medium mb-2">最近使用</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {recentTemplates.map((templateId) => {
                        const template = templates.find(t => t.id === templateId)
                        if (!template) return null
                        return (
                          <Card
                            key={template.id}
                            isPressable
                            isSelected={selectedTemplates.includes(template.id)}
                            onPress={() => handleTemplateSelection(template.id)}
                            className="border-1 border-default-200"
                          >
                            <CardBody className="p-3">
                              <div className="flex items-center gap-2">
                                <Icon
                                  icon="mdi:file-document-outline"
                                  className={selectedTemplates.includes(template.id) ? "text-primary" : "text-default-500"}
                                  width={24}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{template.title}</div>
                                  <div className="text-small text-default-500">
                                    {template.formCount || 0} 条数据
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                <h4 className="text-medium font-medium mb-2">所有模板</h4>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      isPressable
                      isSelected={selectedTemplates.includes(template.id)}
                      onPress={() => handleTemplateSelection(template.id)}
                      className="border-1 border-default-200"
                    >
                      <CardBody className="p-3">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="mdi:file-document-outline"
                            className={selectedTemplates.includes(template.id) ? "text-primary" : "text-default-500"}
                            width={24}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{template.title}</div>
                            {template.description && (
                              <div className="text-small text-default-500">
                                {template.description}
                              </div>
                            )}
                            <div className="text-small text-default-500">
                              {template.formCount || 0} 条数据
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default FormAnalysis
// ... 保持原有的 imports ...

const AppBuilder: React.FC = observer(() => {
  // ... 保持原有的 state 和 hooks ...

  const handleCommandResult = useCallback(async (result: any) => {
    if (!result.success) {
      message.error(result.error || "处理失败")
      return
    }

    try {
      // 执行所有模块代码
      const moduleResults = await versionStore.executeModules(result.rawConfig)
      
      if (moduleResults.some(r => !r.success)) {
        throw new Error('Failed to execute some modules')
      }

      message.success("代码生成成功")
      refreshPreview()
    } catch (error) {
      console.error("Error handling command result:", error)
      message.error("处理结果失败")
    }
  }, [refreshPreview])

  // ... 保持其他方法不变 ...

  const renderPreview = useCallback(() => {
    if (!appId) return null

    return (
      <div className='relative'>
        <div className='absolute top-0 left-0 right-0 z-10 bg-default-100 border-b border-default-200 rounded-t-lg px-4 py-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex gap-1.5'>
                <div className='w-3 h-3 rounded-full bg-danger'></div>
                <div className='w-3 h-3 rounded-full bg-warning'></div>
                <div className='w-3 h-3 rounded-full bg-success'></div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant='light'
                isIconOnly
                onClick={refreshPreview}
                isDisabled={isRefreshing}
                className='bg-white/70 backdrop-blur-sm'
              >
                <Icon icon='mdi:refresh' className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button
                size='sm'
                variant='light'
                isIconOnly
                onClick={() => {
                  const iframe = document.querySelector("iframe")
                  if (iframe && iframe.requestFullscreen) {
                    iframe.requestFullscreen()
                  }
                }}
                className='bg-white/70 backdrop-blur-sm'
              >
                <Icon icon='mdi:fullscreen' className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>

        <div className='rounded-lg overflow-hidden border border-default-200 shadow-lg pt-12'>
          <iframe
            ref={iframeRef}
            src={`/app-preview/${appId}`}
            style={{
              width: "100%",
              height: "600px",
              border: "none",
            }}
            title='App Preview'
            allowFullScreen
          />
        </div>
      </div>
    )
  }, [appId, isRefreshing, refreshPreview])

  // ... 保持其他代码不变 ...

  return (
    <PageLayout title={`构建应用 - ${appTitle}`} titleIcon='mdi:tools' actions={pageActions}>
      <div className='h-[calc(100vh-140px)] overflow-auto'>
        <AIEditor
          parseConfig={async (code: string) => ({ code })}
          messages={messages}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          agent={{
            processCommand,
          }}
          renderPreview={renderPreview}
          onCommandResult={handleCommandResult}
          handleClearMessages={handleClearMessages}
          onStop={handleStop}
          showCodeTab
          previewTabName='应用预览'
          codeItems={codeItems}
          selectedCodeId={selectedCodeId}
          onCodeSelect={setSelectedCodeId}
        />
      </div>

      <Modal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)}>
        {/* ... 保持 Modal 内容不变 ... */}
      </Modal>
    </PageLayout>
  )
})

export default AppBuilder
// 在 CodeView.tsx 中的版本控制按钮部分修改
<Button
  size='sm'
  variant='ghost'
  onClick={() => {
    appCodeStore.rollback()
    // 保存到 localStorage
    appCodeStore.saveToStorage()
    // 通知 iframe
    const previewIframe = document.querySelector('iframe')
    if (previewIframe) {
      previewIframe.contentWindow?.postMessage({
        type: 'VERSION_CHANGED',
        appId: appCodeStore.appId
      }, '*')
    }
  }}
  disabled={!appCodeStore.canRollback}
  className={cn(
    "h-8 w-8 p-0 rounded-full transition-all duration-200",
    "hover:bg-primary/10 active:scale-95",
    !appCodeStore.canRollback && "opacity-50 cursor-not-allowed"
  )}
>
  <Icon icon='mdi:chevron-left' className='h-4 w-4' />
</Button>

<Button
  size='sm'
  variant='ghost'
  onClick={() => {
    appCodeStore.forward()
    // 保存到 localStorage
    appCodeStore.saveToStorage()
    // 通知 iframe
    const previewIframe = document.querySelector('iframe')
    if (previewIframe) {
      previewIframe.contentWindow?.postMessage({
        type: 'VERSION_CHANGED',
        appId: appCodeStore.appId
      }, '*')
    }
  }}
  disabled={!appCodeStore.canForward}
  className={cn(
    "h-8 w-8 p-0 rounded-full transition-all duration-200",
    "hover:bg-primary/10 active:scale-95",
    !appCodeStore.canForward && "opacity-50 cursor-not-allowed"
  )}
>
  <Icon icon='mdi:chevron-right' className='h-4 w-4' />
</Button>
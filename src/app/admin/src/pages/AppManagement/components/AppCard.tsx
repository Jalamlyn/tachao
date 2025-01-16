// ... [之前的导入语句保持不变]

export const AppCard: React.FC<AppCardProps> = ({ app, index, onDevelopClick }) => {
  // ... [之前的状态和函数保持不变]

  return (
    <>
      <Card ref={cardRef}>
        <CardBody>
          <div className='space-y-4'>
            {/* 预览区域 */}
            <div className='relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-default-50 to-default-100'>
              {shouldLoad ? (
                <div className='relative w-full h-full'>
                  {app.previewImage ? (
                    // 使用静态预览图
                    <img
                      src={app.previewImage.url}
                      alt={`Preview of ${app.title}`}
                      className='w-full h-full object-cover transition-transform duration-200 hover:scale-105'
                      onClick={() => window.open(`/app-run/${app.id}`, "_blank")}
                    />
                  ) : (
                    // 回退到 iframe 预览
                    <>
                      <div className='absolute inset-0 scale-[0.5] origin-top-left transform-gpu'>
                        <iframe
                          src={`/app-run/${app.id}`}
                          className='w-[200%] h-[200%] border-0'
                          title={`Preview of ${app.title}`}
                        />
                      </div>
                      <div
                        className='absolute inset-0 bg-transparent cursor-pointer'
                        onClick={() => window.open(`/app-run/${app.id}`, "_blank")}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className='w-full h-full flex flex-col items-center justify-center gap-3 p-4'>
                  <div className='w-16 h-16 rounded-xl bg-gradient-to-br from-default-200 to-default-100 flex items-center justify-center animate-pulse'>
                    <Icon icon='mdi:image-outline' className='w-8 h-8 text-default-400' />
                  </div>
                  <div className='text-center'>
                    <p className='text-sm text-default-500'>加载预览...</p>
                    <p className='text-xs text-default-400 mt-1'>{app.title}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ... [其余部分保持不变] */}
          </div>
        </CardBody>
      </Card>

      {/* ... [模态框部分保持不变] */}
    </>
  )
}
// ... 前面的代码保持不变 ...

            <div className='flex-1 relative mt-2'>
              <div className='flex items-center gap-2'>
                <Tooltip content='导出代码'>
                  <Button className='ml-2' size='sm' variant='flat' isIconOnly onPress={handleExportCode}>
                    <Icon icon='mdi:download' className='w-4 h-4' />
                  </Button>
                </Tooltip>
                // ... 其他按钮保持不变 ...
              </div>

              {/* 移除 max-w-[500px] 限制 */}
              <div className='h-[calc(100vh-250px)] pt-4'>
                <Editor
                  height='100%'
                  width='100%'
                  language='javascript'
                  value={appCodeStore.viewState.editedCode}
                  options={{
                    readOnly: !appCodeStore.viewState.isEditing,
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: true,
                    formatOnPaste: true,
                    formatOnType: true,
                    find: {
                      addExtraSpaceOnTop: false,
                      autoFindInSelection: "never",
                      seedSearchStringFromSelection: "never",
                    },
                  }}
                  theme='vs-dark'
                  onChange={(value) => {
                    if (appCodeStore.viewState.isEditing) {
                      appCodeStore.updateEditedCode(value || "")
                    }
                  }}
                />
              </div>

// ... 后面的代码保持不变 ...
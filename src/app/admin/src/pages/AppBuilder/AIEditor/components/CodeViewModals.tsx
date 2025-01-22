<ModalHeader className='flex flex-col gap-1'>版本信息</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-small font-semibold'>当前版本</p>
                  <p className='text-tiny text-default-500'>
                    {appCodeStore.currentVersion?.timestamp
                      ? new Date(appCodeStore.currentVersion.timestamp).toLocaleString()
                      : "无"}
                  </p>
                </div>
                <Chip color={appCodeStore.isViewingHistory ? "warning" : "success"} variant='flat'>
                  {appCodeStore.isViewingHistory ? "历史版本" : "最新版本"}
                </Chip>
              </div>
              <Divider />
              <div>
                <p className='text-small font-semibold mb-2'>版本历史</p>
                <ScrollShadow className='h-[300px]'>
                  <div className='space-y-2'>
                    {appCodeStore.versions.map((version, index) => (
                      <div
                        key={version.timestamp}
                        className={`p-3 rounded-lg transition-colors ${
                          index === appCodeStore.currentIndex
                            ? "bg-primary text-white"
                            : "bg-default-100 hover:bg-default-200"
                        }`}
                      >
                        <div className='flex flex-col gap-2'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <p className='text-small'>版本 {index + 1}</p>
                              <p className='text-tiny opacity-80'>{new Date(version.timestamp).toLocaleString()}</p>
                            </div>
                            {index === appCodeStore.currentIndex && <Icon icon='mdi:check-circle' className='w-5 h-5' />}
                          </div>
                          {/* 添加版本操作按钮组 */}
                          {index !== appCodeStore.currentIndex && (
                            <ButtonGroup size="sm" variant="flat" className="w-full">
                              <Button 
                                className="flex-1"
                                color="primary"
                                startContent={<Icon icon="solar:download-minimalistic-linear" className="w-4 h-4" />}
                                onPress={() => appCodeStore.pullVersion(version)}
                              >
                                拉取代码
                              </Button>
                              <Button
                                className="flex-1"
                                color="success"
                                startContent={<Icon icon="solar:upload-minimalistic-linear" className="w-4 h-4" />}
                                onPress={() => appCodeStore.publishFromVersion(version)}
                              >
                                发布此版本
                              </Button>
                            </ButtonGroup>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollShadow>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onPress={() => (appCodeStore.viewState.showVersionInfo = false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        isOpen={appCodeStore.viewState.showDeleteConfirm}
        onClose={() => (appCodeStore.viewState.showDeleteConfirm = false)}
        size='sm'
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-2'>
              <p className='text-danger'>
                警告：此操作将删除选中的 {appCodeStore?.viewState?.selectedModules?.length} 个模块！
              </p>
              <p className='text-default-500'>删除后可以通过版本回退恢复，是否确认继续？</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onPress={() => (appCodeStore.viewState.showDeleteConfirm = false)}>
              取消
            </Button>
            <Button color='danger' onPress={handleDeleteSelected}>
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
})

export default CodeViewModals
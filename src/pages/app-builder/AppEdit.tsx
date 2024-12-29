showCodeTab
          previewTabName='应用预览'
          codeItems={codeItems}
          selectedCodeId={selectedCodeId}
          onCodeSelect={setSelectedCodeId}
        />
      </div>

      <Modal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>发布成功</ModalHeader>
          <ModalBody>
            <p>应用已成功发布！您可以通过以下链接访问：</p>
            <div className='flex items-center gap-2 p-2 bg-default-100 rounded'>
              <code className='text-sm'>/app-run/{appId}</code>
              <Button
                size='sm'
                variant='flat'
                onClick={() => window.open(`/app-run/${appId}`, "_blank")}
                startContent={<Icon icon='mdi:open-in-new' className='w-4 h-4' />}
              >
                查看应用
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={() => setShowPublishModal(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default AppBuilder
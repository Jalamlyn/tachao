// ... 保留原有的导入 ...
import { ShareModal } from './components/page-templates/ShareModal'

const PageTemplateEditor: React.FC = () => {
  // ... 保留原有的状态和函数 ...

  // 添加分享模态框状态
  const { 
    isOpen: isShareOpen, 
    onOpen: onShareOpen, 
    onClose: onShareClose 
  } = useDisclosure()

  // 添加分享按钮到工具栏
  const toolbarButtons = (
    <div className="flex gap-2">
      <Button
        color="primary"
        variant="flat"
        startContent={<Icon icon="mdi:share" className="w-4 h-4" />}
        onClick={onShareOpen}
        isDisabled={!pageConfig}
      >
        分享
      </Button>
      {/* ... 保留原有的按钮 ... */}
    </div>
  )

  return (
    <>
      {/* ... 保留原有的 JSX ... */}

      {/* 添加分享模态框 */}
      {pageConfig && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={onShareClose}
          templateId={templateId || ""}
          templateTitle={pageConfig.metadata?.title || "未命名模板"}
        />
      )}
    </>
  )
}

export default PageTemplateEditor
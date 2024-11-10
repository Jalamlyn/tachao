// ... 保留原有的导入 ...
import { PreviewModal } from './components/page-templates/PreviewModal'

const PageTemplateEditor: React.FC = () => {
  // ... 保留原有的状态和函数 ...

  // 添加预览模态框状态
  const { 
    isOpen: isPreviewOpen, 
    onOpen: onPreviewOpen, 
    onClose: onPreviewClose 
  } = useDisclosure()

  const handlePreview = () => {
    if (!pageConfig) {
      message.error("没有可预览的内容")
      return
    }
    onPreviewOpen()
  }

  return (
    <>
      {/* ... 保留原有的 JSX ... */}

      {/* 添加预览模态框 */}
      {pageConfig && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={onPreviewClose}
          config={pageConfig}
          components={components}
        />
      )}
    </>
  )
}

export default PageTemplateEditor
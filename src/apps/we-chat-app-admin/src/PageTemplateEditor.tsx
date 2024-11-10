// ... 保留原有的导入 ...
import { CodeEditor } from './components/page-templates/CodeEditor'
import { configToCode, codeToConfig } from './utils/codeFormatter'

const PageTemplateEditor: React.FC = () => {
  // ... 保留原有的状态和函数 ...
  
  // 添加代码编辑器状态
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [codeValue, setCodeValue] = useState('')

  // 处理代码编辑器打开
  const handleOpenCodeEditor = useCallback(() => {
    if (pageConfig) {
      try {
        const code = configToCode(pageConfig)
        setCodeValue(code)
        setShowCodeEditor(true)
      } catch (error) {
        message.error('打开代码编辑器失败')
      }
    }
  }, [pageConfig])

  // 处理代码更新
  const handleCodeChange = useCallback((newCode: string) => {
    setCodeValue(newCode)
    try {
      const newConfig = codeToConfig(newCode)
      setPageConfig(newConfig)
    } catch (error) {
      // 解析错误时不更新配置
      console.error('Error parsing code:', error)
    }
  }, [])

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* ... 保留原有的工具栏 ... */}
      
      {/* 修改工具栏中的代码按钮 */}
      <Button
        variant="flat"
        startContent={<Icon icon="mdi:code" className="w-4 h-4" />}
        onClick={handleOpenCodeEditor}
        isDisabled={!pageConfig}
      >
        查看代码
      </Button>

      {/* 内容区 */}
      <div className="flex-1 mt-16 p-6">
        {showCodeEditor ? (
          <CodeEditor
            code={codeValue}
            onChange={handleCodeChange}
            onClose={() => setShowCodeEditor(false)}
          />
        ) : editorMode === 'ai' ? (
          <AIEditor onConfigChange={handleConfigChange} />
        ) : (
          // ... 保留原有的可视化编辑器 ...
        )}
      </div>
    </div>
  )
}

export default PageTemplateEditor
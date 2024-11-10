import React, { useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { Card, CardBody, Button } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { formatCode } from '../../../utils/codeFormatter'
import message from '@/components/Message'

interface CodeEditorProps {
  code: string
  onChange?: (code: string) => void
  onClose?: () => void
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onClose
}) => {
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value && onChange) {
      onChange(value)
    }
  }, [onChange])

  const handleFormat = useCallback(() => {
    try {
      const formattedCode = formatCode(code)
      onChange?.(formattedCode)
      message.success('代码格式化成功')
    } catch (error) {
      message.error('代码格式化失败')
    }
  }, [code, onChange])

  return (
    <Card className="h-full">
      <CardBody className="p-0">
        {/* 工具栏 */}
        <div className="flex justify-between items-center p-2 border-b">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              startContent={<Icon icon="mdi:format-align-left" />}
              onClick={handleFormat}
            >
              格式化
            </Button>
          </div>
          <Button
            size="sm"
            variant="light"
            isIconOnly
            onClick={onClose}
          >
            <Icon icon="mdi:close" />
          </Button>
        </div>

        {/* 编辑器 */}
        <div className="h-[calc(100vh-200px)]">
          <Editor
            defaultLanguage="javascript"
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
      </CardBody>
    </Card>
  )
}

export default CodeEditor
import React from "react"

interface CodeViewProps {
  content: string
}

const CodeView: React.FC<CodeViewProps> = ({ content }) => {
  if (!content) {
    return (
      <div className='flex items-center justify-center h-full text-gray-500'>
        <p>请先生成分析报表</p>
      </div>
    )
  }

  return (
    <pre className='text-sm overflow-auto bg-slate-800 text-white p-2 rounded-lg'>
      <code>{content}</code>
    </pre>
  )
}

export default CodeView
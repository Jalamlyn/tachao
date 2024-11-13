import React from "react"
import AnalysisResult from "./AnalysisResult"

interface AnalysisViewProps {
  analysis: any
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className='flex items-center justify-center h-full text-gray-500'>
        <p>请先生成分析报表</p>
      </div>
    )
  }

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 bg-white rounded-lg'>
        <AnalysisResult analysis={analysis} />
      </div>
    </div>
  )
}

export default AnalysisView
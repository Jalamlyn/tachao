import React from "react"
import { motion } from "framer-motion"
import CommandInput from "@/components/CommandInput"

interface DataAnalysisTabProps {
  isDataLoaded: boolean
  error: string | null
}

const DataAnalysisTab: React.FC<DataAnalysisTabProps> = ({ isDataLoaded, error }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {error ? (
        <div className="text-white/90 bg-red-500/20 border border-red-500/30 p-4 rounded-lg mb-4">
          {error}
        </div>
      ) : (
        <div className="text-white/80 mb-4">
          {isDataLoaded ? (
            "数据已加载完成，您可以开始分析数据了"
          ) : (
            "请先加载数据，然后再开始分析"
          )}
        </div>
      )}
      <CommandInput
        disabled={!isDataLoaded}
        placeholder={
          isDataLoaded
            ? "请输入您的分析需求，例如：帮我分析本月销售趋势..."
            : "请先加载数据..."
        }
      />
    </motion.div>
  )
}

export default DataAnalysisTab
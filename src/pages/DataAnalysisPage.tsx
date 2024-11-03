import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button, Tooltip, CardBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CommandInput from "@/components/CommandInput"
import { useFormMetadata } from "@/components/from-templates/hook/useFormMetadata"

const DataAnalysisPage: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const { fetchForms } = useFormMetadata()
  const [error, setError] = useState<string | null>(null)

  const handleLoadData = async () => {
    try {
      const forms = await fetchForms()
      setIsDataLoaded(true)
      if (forms && forms.length > 0) {
        setError(null)
      } else {
        setError("没有找到可用的数据，请先创建一些表单")
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setError("加载数据时发生错误")
    }
  }

  return (
    <CardBody className='p-6'>
      <div className="flex justify-end mb-4">
        <Tooltip content={isDataLoaded ? "数据已加载" : "加载数据"}>
          <Button
            isIconOnly
            color={isDataLoaded ? "success" : "primary"}
            variant='flat'
            onPress={handleLoadData}
            className='relative overflow-visible bg-white/20 hover:bg-white/30'
          >
            <Icon
              icon={isDataLoaded ? "mdi:check-circle" : "mdi:database-import"}
              className={`w-5 h-5 ${isDataLoaded ? "text-green-400" : "text-white/90"}`}
            />
            {isDataLoaded && (
              <motion.div
                className='absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </Button>
        </Tooltip>
      </div>

      {error ? (
        <div className='text-white/90 bg-red-500/20 border border-red-500/30 p-4 rounded-lg mb-4'>
          {error}
        </div>
      ) : (
        <div className='text-white/80 mb-4'>
          {isDataLoaded ? "数据已加载完成，您可以开始分析了" : "请先加载数据，然后再开始分析"}
        </div>
      )}
      
      <CommandInput
        disabled={!isDataLoaded}
        placeholder={isDataLoaded ? "请输入您的分析需求，例如：帮我分析本月销售趋势..." : "请先加载数据..."}
      />
    </CardBody>
  )
}

export default DataAnalysisPage
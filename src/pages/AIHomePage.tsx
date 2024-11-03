import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardBody, Button, Tooltip, Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CommandInput from "@/components/CommandInput"
import { useFormMetadata } from "@/components/from-templates/hook/useFormMetadata"
import AnimatedBackground from "@/components/landing/AnimatedBackground"
import DataAnalysisTab from "./components/DataAnalysisTab"

const AIHomePage: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const { fetchForms } = useFormMetadata()
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("management")

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-primary-dark to-primary-light">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto space-y-6"
        >
          <Card className="bg-white/10 border border-white/20 shadow-xl backdrop-blur-md">
            <CardHeader className="flex justify-between items-center p-6">
              <h1 className="text-2xl font-bold text-white/90">AI 智能助手</h1>
              <Tooltip content={isDataLoaded ? "数据已加载" : "加载数据"}>
                <Button
                  isIconOnly
                  color={isDataLoaded ? "success" : "primary"}
                  variant="flat"
                  onPress={handleLoadData}
                  className="relative overflow-visible bg-white/20 hover:bg-white/30"
                >
                  <Icon
                    icon={isDataLoaded ? "mdi:check-circle" : "mdi:database-import"}
                    className={`w-5 h-5 ${isDataLoaded ? 'text-green-400' : 'text-white/90'}`}
                  />
                  {isDataLoaded && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Button>
              </Tooltip>
            </CardHeader>
            <CardBody className="p-6">
              <Tabs 
                selectedKey={selectedTab} 
                onSelectionChange={(key) => setSelectedTab(key.toString())}
                className="mb-4"
                variant="underlined"
                classNames={{
                  tabList: "bg-white/10 rounded-lg p-1",
                  cursor: "bg-white/30",
                  tab: "text-white/70 data-[selected=true]:text-white",
                }}
              >
                <Tab
                  key="management"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:database-cog" className="w-4 h-4" />
                      <span>数据管理</span>
                    </div>
                  }
                >
                  {error ? (
                    <div className="text-white/90 bg-red-500/20 border border-red-500/30 p-4 rounded-lg mb-4">
                      {error}
                    </div>
                  ) : (
                    <div className="text-white/80 mb-4">
                      {isDataLoaded ? (
                        "数据已加载完成，您可以开始询问了"
                      ) : (
                        "请先加载数据，然后再开始询问"
                      )}
                    </div>
                  )}
                  <CommandInput
                    disabled={!isDataLoaded}
                    placeholder={
                      isDataLoaded
                        ? "请输入您的指令，例如：帮我查询所有待审批的单据..."
                        : "请先加载数据..."
                    }
                  />
                </Tab>
                <Tab
                  key="analysis"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:chart-box" className="w-4 h-4" />
                      <span>数据分析</span>
                    </div>
                  }
                >
                  <DataAnalysisTab isDataLoaded={isDataLoaded} error={error} />
                </Tab>
              </Tabs>
            </CardBody>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-white/70 backdrop-blur-sm bg-white/5 py-2 px-4 rounded-full inline-block">
              提示：您可以询问关于表单数据的任何问题，比如查询特定状态的单据、统计数据等
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default AIHomePage
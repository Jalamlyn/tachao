import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button, Tooltip, CardBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CommandInput from "@/components/CommandInput"
import { useFormMetadata } from "@/components/from-templates/hook/useFormMetadata"
import ResourceCardList from "@/components/common/ResourceCardList"
import TabsContainer from "@/components/forms/TabsContainer"
import chatMoV2 from "@/service/chat/chat-deepseek"
import message from "@/components/Message"

const DataManagementPage: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const { fetchForms } = useFormMetadata()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("forms")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

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

  const handleSearch = async (command: string) => {
    if (!command.trim() || !isDataLoaded) return

    setIsSearching(true)
    try {
      let aiResponse = ""
      await chatMoV2(
        [
          {
            role: "system",
            content: "你是一个数据检索助手，根据用户的自然语言描述，返回相关的数据结果。",
          },
          {
            role: "user",
            content: command,
          },
        ],
        (chunk) => {
          aiResponse += chunk
        },
        () => {},
        true,
        0.7
      )

      try {
        const results = JSON.parse(aiResponse)
        setSearchResults(results)
        message.success(`找到 ${results.length} 条相关记录`)
      } catch (error) {
        message.error("搜索结果解析失败")
        console.error("Search results parsing error:", error)
      }
    } catch (error) {
      message.error("搜索失败，请稍后重试")
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreateForm = () => {
    window.open("/forms/create", "_blank")
  }

  const handleViewForm = (formId: string) => {
    window.open(`/forms/${formId}`, "_blank")
  }

  const handleCreateReport = () => {
    window.open("/reports/create", "_blank")
  }

  const handleViewReport = (reportId: string) => {
    window.open(`/reports/view/${reportId}`, "_blank")
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
          {isDataLoaded ? "数据已加载完成，您可以开始查询了" : "请先加载数据，然后再开始查询"}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CommandInput
          disabled={!isDataLoaded}
          placeholder={isDataLoaded ? "请输入您的查询需求，例如：查找与某个客户相关的所有单据..." : "请先加载数据..."}
          onSubmit={handleSearch}
          isLoading={isSearching}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <TabsContainer activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "forms" && (
            <ResourceCardList
              resourceType="forms"
              appId={null}
              onView={handleViewForm}
              onCreate={handleCreateForm}
              isRefreshing={isRefreshing}
              setIsRefreshing={setIsRefreshing}
            />
          )}
          {activeTab === "reports" && (
            <ResourceCardList
              resourceType="reports"
              appId={null}
              onView={handleViewReport}
              onCreate={handleCreateReport}
              isRefreshing={isRefreshing}
              setIsRefreshing={setIsRefreshing}
            />
          )}
          {activeTab === "resources" && (
            <ResourceCardList
              resourceType="resources"
              appId={null}
              onView={(id) => window.open(`/resources/view/${id}`, "_blank")}
              onCreate={() => {}}
              isRefreshing={isRefreshing}
              setIsRefreshing={setIsRefreshing}
            />
          )}
        </TabsContainer>
      </motion.div>

      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <h3 className="text-lg font-semibold text-white/90 mb-4">搜索结果</h3>
          <div className="space-y-2">
            {searchResults.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white/90">{result.title}</h4>
                    <p className="text-white/60 text-sm">{result.description}</p>
                  </div>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onClick={() => handleViewForm(result.id)}
                  >
                    查看
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </CardBody>
  )
}

export default DataManagementPage
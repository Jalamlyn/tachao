import AIFormAgent from "@/service/agents/AIFormAgent"
import { localDB } from "@/utils/localDB"
import { Icon } from "@iconify/react"
import { useEffect } from "react"

export const useWatch = (
  lastResponseRef,
  setFormConfig,
  setRawConfig,
  setPreviewContent,
  setSelectedTab,
  versionControl,
  updateLastMessage
) => {
  useEffect(() => {
    const unwatch = localDB.watchKey("chat-chunk-over", async ({ value }) => {
      if (value === "YES" && lastResponseRef.current) {
        try {
          // 提取表单配置
          const formContent = lastResponseRef.current
          const parsedConfig = await AIFormAgent.parseConfig(lastResponseRef.current)
          if (parsedConfig) {
            // 更新表单配置
            setFormConfig(parsedConfig.config)
            setRawConfig(formContent)
            setPreviewContent(formContent)
            setSelectedTab("preview")

            // 添加到版本控制
            versionControl.addVersion({
              formConfig: parsedConfig.config,
              rawConfig: formContent,
            })

            // 更新消息状态
            updateLastMessage({
              content: (
                <div className='flex items-center gap-2'>
                  <Icon icon='line-md:check-all' className='w-5 h-5 text-green-500'></Icon>
                  表单生成完成
                </div>
              ),
              status: "success",
            })
          }
        } catch (error) {
          console.error("Error parsing form config:", error)
          updateLastMessage({
            content: "表单解析失败",
            status: "error",
          })
        }
      }
    })

    return () => unwatch()
  }, [])
}

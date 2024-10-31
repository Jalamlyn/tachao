import { blog } from "@/utils"
import { apiService } from "../apis/api"

/**
 * 与AI助手进行对话
 * @param {Array} initialMessages - 初始消息列表
 * @param {string} idFlag - 标识符
 * @param {Array} tools - 可用的工具列表
 * @returns {Promise<Object>} 对话结果
 */
export default async (
  initialMessages,
  onChunk,
  idFlag = "an",
  tools = [],
  operationContent = "Mo-2 chat for development"
) => {
  const requestAgent = async (messages) => {
    const res = await apiService.post(`/api/chat/completions`, {
      id: `mobenai-an`,
      // id: `mobenai-a`,
      operationContent,
      chatCompletionsOptions: {
        max_tokens: 4096,
        temperature: 0,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
        stream: true,
      },
    })
    console.log(res)
    if (res.data.choices[0].finish_reason === "stop" || res.data.choices[0].finish_reason === "tool_calls") {
      return res.data.choices[0]
    } else if (res.data.choices[0].finish_reason === "length") {
      const newMessages = [
        ...messages,
        {
          role: "assistant",
          content: res.data.choices[0].message.content,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "继续生成，开头不要换行",
            },
          ],
        },
      ]
      const continuedResult = await requestAgent(newMessages)
      return {
        ...continuedResult,
        message: {
          ...continuedResult.message,
          content: res.data.choices[0].message.content + continuedResult.message.content,
        },
      }
    }
  }

  const finalResult = await requestAgent(initialMessages)
  onChunk(finalResult.message.content)
}

import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"
import TokenService from "../token/TokenService"
import { AI_LEVELS } from "@/components/AIEditor"

function processAIMessages(messages: any[]) {
  return messages.map((message) => {
    if (message.role === "assistant") {
      return {
        ...message,
        content: message.content.map((item) => {
          if (item.type === "text") {
            return {
              ...item,
              text: item.text.replace(/<shata-ai-code>[\s\S]*?<\/shata-ai-code>/g, "已更新 system 中的现有配置"),
            }
          }
          return item
        }),
      }
    }
    return message
  })
}

export default async function chatChunkOpenAIOffice(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES",
  baseModel = "advanced"
) {
  // 检查塔币余额
  const aiLevel = Object.entries(AI_LEVELS).find(([_, level]) => level.value === baseModel)?.[0] as keyof typeof AI_LEVELS
  const tokenCost = AI_LEVELS[aiLevel || "ADVANCED"].cost

  if (isFirst) {
    const hasEnoughTokens = await TokenService.checkBalance(tokenCost)
    if (!hasEnoughTokens) {
      throw new Error(`塔币余额不足，当前对话需要 ${tokenCost} 塔币`)
    }
  }

  let _messages = messages
  if (isFirst) {
    _messages = messages.map((msg, index) => {
      if (msg.role === "system") {
        return msg
      } else {
        return {
          role: msg.role,
          content: [
            {
              type: "text",
              text: msg.content,
            },
            ...(msg.images?.map((img) => ({ type: "image_url", image_url: { url: img } })) || []),
          ],
        }
      }
    })
  }

  const modelEndpoints = {
    expert: "https://ai-mobenaimo177654748466.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview",
    advanced: "https://ai-mobenaimo177654748466.openai.azure.com/openai/deployments/gpt-4o-mini-2/chat/completions?api-version=2024-02-15-preview"
  }

  const apiKey = "5d5c1f3cc91b440b8391851b2eadfb1c"
  const apiEndPoint = modelEndpoints[baseModel] || modelEndpoints.advanced

  const payload = {
    messages: _messages,
    temperature,
    max_tokens: 4096,
    stream: true,
  }

  let controller = new AbortController()
  fetchController.current = controller
  onCancel(() => controller.abort())

  try {
    const response = await fetch(apiEndPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": `${apiKey}`,
      },
      body: jsonStringify(payload),
      signal: controller.signal,
      timeout: 30000,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const eventStream = events(response, controller.signal)
    let fullContent = ""

    for await (let event of eventStream) {
      if (event.data !== "[DONE]") {
        try {
          const parsed = jsonParse(event.data)
          const content = parsed?.choices[0]?.delta?.content || ""
          fullContent += content
          onChunk(content)

          if (parsed?.choices[0]?.finish_reason === "length") {
            const lastTenChars = fullContent.slice(-10)
            await chatChunkOpenAIOffice(
              _messages.concat([
                { role: "assistant", content: fullContent },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `继续生成，从"""${lastTenChars}"""后面开始生成，开头和结尾都不要解释和说明，也不要有\`\`\`和这样的标记`,
                    },
                  ],
                },
              ]),
              onChunk,
              onCancel,
              false,
              temperature,
              overFlag,
              baseModel
            )
            return
          }
        } catch (error) {
          console.log("Error parsing JSON:", error)
        }
      } else {
        localDB.setItem("chat-chunk-over", overFlag)
        // 扣除塔币
        if (isFirst) {
          await TokenService.deductTokens(tokenCost)
        }
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted")
    } else {
      message.error(`An error occurred while fetching data: ${error.message}`)
      if (error.message.includes("context_length_exceeded")) {
        onChunk(`项目大小超过了最大上下文，无法使用自动检索模式，请切换到手动检索模式，手动勾选需要修改的文件`)
      }
    }
    throw error
  }
}
import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"
import { costService } from "@/utils/costService"
import { aiControllerStore } from "@/app/admin/src/pages/AppBuilder/AIEditor/components/AIControllerStore"
import { balanceStore } from "@/stores/balanceStore"
import globalStore from "@/globalStore"

const AI_MODELS = {
  // BASIC: "anthropic/claude-3.5-haiku-20241022",
  BASIC: "deepseek-ai/DeepSeek-R1",
  // BASIC: "deepseek/deepseek-r1",
  // ADVANCED: "anthropic/claude-3.5-sonnet:beta",
  // ADVANCED: "deepseek/deepseek-r1",
  // ADVANCED: "google/gemini-2.0-flash-exp:free",
  ADVANCED: "deepseek-ai/DeepSeek-V3",
  USER: "deepseek-ai/DeepSeek-R1",
}

function selectModel(messages) {
  // 检查是否以 @pm 开头
  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.content[0]?.text.includes("@pm")) {
    return AI_MODELS.BASIC
  }

  // 检查是否有图片
  const hasImages = messages.some((msg) => msg.images && msg.images.length > 0)
  if (hasImages) {
    return AI_MODELS.ADVANCED
  }

  return AI_MODELS.ADVANCED
}

// 清理AI响应中的代码块
function cleanAIResponse(content) {
  if (typeof content === "string") {
    return content.replace(/<mo-ai-code[^>]*>[\s\S]*?<\/mo-ai-code>/g, "").replace(/<think[^>]*>[\s\S]*?<\/think>/g, "")
  }
  if (Array.isArray(content)) {
    return content.map((item) => {
      if (item.type === "text" && typeof item.text === "string") {
        return {
          ...item,
          text: item.text
            .replace(/<mo-ai-code[^>]*>[\s\S]*?<\/mo-ai-code>/g, "")
            .replace(/<think[^>]*>[\s\S]*?<\/think>/g, ""),
        }
      }
      return item
    })
  }
  return content
}

export default async function chatChunkOpenAIOffice(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES",
  promptData = {},
  isUSER
) {
  let _messages = messages
  if (isFirst) {
    _messages = messages.map((msg, index) => {
      if (msg.role === "system") {
        return msg
      } else if (msg.role === "assistant") {
        return {
          role: msg.role,
          content: [
            {
              type: "text",
              text: typeof msg.content === "string" ? cleanAIResponse(msg.content) : msg.content[0]?.text,
            },
          ],
        }
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

  const apiEndPoint = "https://1259692580-1w0gjex43c.ap-shanghai.tencentscf.com/chat-sc"
  // const apiEndPoint = "https://api.openai-prc.com"

  // 选择模型
  const selectedModel = isUSER ? AI_MODELS.USER : selectModel(_messages)
  // 保存当前使用的模型到 sessionStorage
  sessionStorage.setItem("currentAIModel", selectedModel)

  // 获取当前用户ID
  const currentUserId = globalStore.currentUser?.id

  // 只检查余额，不更新使用量
  const hasEnoughBalance = await balanceStore.checkBalance(0.1)
  if (!hasEnoughBalance) {
    return
  }

  // 如果提供了accountId，检查账户额度
  if (currentUserId) {
    const hasEnoughAccountBalance = await balanceStore.checkAccountBalance(currentUserId, 0.1)
    if (!hasEnoughAccountBalance) {
      return
    }
  }

  const payload = {
    model: selectedModel,
    messages: _messages,
    max_tokens: 4096,
    promptData,
    stream: true,
    temperature,
  }

  let controller = new AbortController()
  aiControllerStore.setController(controller)
  fetchController.current = controller
  onCancel(() => {
    controller.abort()
    aiControllerStore.clear()
  })

  try {
    const response = await fetch(apiEndPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonStringify(payload),
      signal: controller.signal,
      timeout: 60000,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const eventStream = events(response, controller.signal)
    let fullContent = ""

    // 获取用户最后一条输入
    const lastUserMessage = _messages.filter((msg) => msg.role === "user").pop()
    const userInput = lastUserMessage
      ? typeof lastUserMessage.content === "string"
        ? lastUserMessage.content
        : lastUserMessage.content[0]?.text || ""
      : ""

    // 添加 usage 累加器
    let totalUsage = {
      promptTokenCount: 0,
      candidatesTokenCount: 0,
    }

    for await (let event of eventStream) {
      if (event.data !== "[DONE]") {
        try {
          const parsed = jsonParse(event.data)
          const content = parsed?.choices[0]?.delta?.content || ""
          fullContent += content
          onChunk(content)

          // 累加 usage 而不是立即记录
          if (parsed?.usage) {
            totalUsage.promptTokenCount += parsed.usage.prompt_tokens || 0
            totalUsage.candidatesTokenCount += parsed.usage.completion_tokens || 0
          }

          if (parsed?.choices[0]?.finish_reason === "max_tokens") {
            const lastTenChars = fullContent.slice(-10)
            await chatChunkOpenAIOffice(
              _messages.concat([
                { role: "assistant", content: fullContent },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `继续生成，从"""${lastTenChars}"""后面开始生成，但是不要包含从"""${lastTenChars}""",开头和结尾都不要解释和说明，也不要有\`\`\`和这样的标记`,
                    },
                  ],
                },
              ]),
              onChunk,
              onCancel,
              false,
              temperature,
              overFlag
            )
            return
          }
        } catch (error) {
          console.log("Error parsing JSON:", error)
          message.error(`An error occurred while parsing JSON: ${error.message}`)
          throw error
        }
      } else {
        // 在对话结束时才记录总的消费
        if (totalUsage.promptTokenCount > 0 || totalUsage.candidatesTokenCount > 0) {
          const model = sessionStorage.getItem("aiLevel") || "ADVANCED"
          await costService.recordTokenUsage(
            {
              promptTokenCount: totalUsage.promptTokenCount,
              candidatesTokenCount: totalUsage.candidatesTokenCount,
              model: model,
              content: fullContent,
              userInput: userInput,
            },
            true
          )
        }
        localDB.setItem("chat-chunk-over", overFlag)
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted")
    } else {
      message.error(`An error occurred while fetching data: ${error.message}`)
    }
    throw error
  }
}

export { AI_MODELS }

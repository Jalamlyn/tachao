import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"
import { costService } from "@/utils/costService"
import { aiControllerStore } from "@/app/admin/src/pages/AppBuilder/AIEditor/components/AIControllerStore"

const AI_MODELS = {
  BASIC: "anthropic/claude-3.5-haiku-20241022:beta",
  ADVANCED: "anthropic/claude-3.5-sonnet:beta",
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

  // 检查消息长度

  return AI_MODELS.ADVANCED
}

// 清理AI响应中的代码块
function cleanAIResponse(content) {
  if (typeof content === "string") {
    // 使用与 extractShataAICodes 相同的正则模式
    return content.replace(/<mo-ai-code[^>]*>[\s\S]*?<\/mo-ai-code>/g, "")
  }
  if (Array.isArray(content)) {
    return content.map((item) => {
      if (item.type === "text" && typeof item.text === "string") {
        return {
          ...item,
          text: item.text.replace(/<mo-ai-code[^>]*>[\s\S]*?<\/mo-ai-code>/g, ""),
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
  promptData = {}
) {
  let _messages = messages
  if (isFirst) {
    _messages = messages.map((msg, index) => {
      if (msg.role === "system") {
        return msg
      } else if (msg.role === "assistant") {
        // 清理AI响应中的代码块
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

  const apiEndPoint = "https://1259692580-b9dznk0gp5.na-siliconvalley.tencentscf.com/chat-openrouter"

  // 选择模型
  const selectedModel = selectModel(_messages)
  // 保存当前使用的模型到 sessionStorage
  sessionStorage.setItem("currentAIModel", selectedModel)

  const payload = {
    model: selectedModel,
    messages: _messages,
    promptData,
    stream: true,
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

    for await (let event of eventStream) {
      if (event.data !== "[DONE]") {
        try {
          const parsed = jsonParse(event.data)
          const content = parsed?.choices[0]?.delta?.content || ""
          fullContent += content
          onChunk(content)

          if (parsed?.usage) {
            const model = sessionStorage.getItem("aiLevel") || "ADVANCED"
            await costService.recordTokenUsage(
              {
                promptTokenCount: parsed.usage.prompt_tokens,
                candidatesTokenCount: parsed.usage.completion_tokens,
                model: model,
                content: fullContent,
              },
              true
            )
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
        }
      } else {
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

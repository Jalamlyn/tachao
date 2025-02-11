import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"
import { costService } from "@/utils/costService"
import { aiControllerStore } from "@/app/admin/src/pages/AppBuilder/AIEditor/components/AIControllerStore"
import { balanceStore } from "@/stores/balanceStore"
import globalStore from "@/globalStore"

const AI_MODELS = {
  BASIC: "anthropic/claude-3.5-sonnet",
  ADVANCED: "anthropic/claude-3.5-sonnet",
  USER: "anthropic/claude-3.5-sonnet",
  // USER: "google/gemini-2.0-flash-001",
}

// 定义JavaScript执行工具
const TOOLS = [
  {
    type: "function",
    function: {
      name: "executeJavaScript",
      description: "Execute JavaScript code and return the result",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "The JavaScript code to execute",
          },
        },
        required: ["code"],
      },
    },
  },
]

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

// 执行脚本代码并返回结果
async function executeScript(code) {
  try {
    const result = await new Function(code)()
    return String(result)
  } catch (error) {
    console.error("Script execution error:", error)
    return `Error executing script: ${error.message}`
  }
}

export default async function chatChunkOpenAIOffice(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES",
  system,
  stop,
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

  const apiEndPoint = "https://1259692580-b9dznk0gp5.na-siliconvalley.tencentscf.com/chat-openrouter"

  // 选择模型
  const selectedModel = isUSER ? AI_MODELS.USER : selectModel(_messages)
  // 保存当前使用的模型到 sessionStorage
  sessionStorage.setItem("currentAIModel", selectedModel)

  // 获取当前用户ID
  const currentUserId = globalStore.currentUser?.id

  // 只检查余额,不更新使用量
  const hasEnoughBalance = await balanceStore.checkBalance(0.1)
  if (!hasEnoughBalance) {
    return
  }

  // 如果提供了accountId,检查账户额度
  if (currentUserId) {
    const hasEnoughAccountBalance = await balanceStore.checkAccountBalance(currentUserId, 0.1)
    if (!hasEnoughAccountBalance) {
      return
    }
  }

  const payload = {
    model: selectedModel,
    messages: _messages,
    system,
    stream: true,
    stop,
    temperature,
    tools: TOOLS, // 添加tools到请求中
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

          // 处理工具调用
          if (parsed?.choices[0]?.delta?.tool_calls) {
            const toolCall = parsed.choices[0].delta.tool_calls[0]
            if (toolCall.function.name === "executeJavaScript") {
              const args = JSON.parse(toolCall.function.arguments)
              const result = await executeScript(args.code)

              // 将执行结果作为工具响应添加到消息中
              await chatChunkOpenAIOffice(
                _messages.concat([
                  {
                    role: "tool",
                    name: "executeJavaScript",
                    tool_call_id: toolCall.id,
                    content: result,
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
          }

          const content = parsed?.choices[0]?.delta?.content || ""
          fullContent += content
          onChunk(content)

          // 累加 usage 而不是立即记录
          if (parsed?.usage) {
            totalUsage.promptTokenCount += parsed.usage.prompt_tokens || 0
            totalUsage.candidatesTokenCount += parsed.usage.completion_tokens || 0
          }

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
                      text: `继续生成,从"""${lastTenChars}"""后面开始生成,但是不要包含从"""${lastTenChars}""",开头和结尾都不要解释和说明,也不要有\`\`\`和这样的标记`,
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

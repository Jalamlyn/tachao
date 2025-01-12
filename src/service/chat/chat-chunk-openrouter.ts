import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"
import { costService } from "@/utils/costService"
import { aiControllerStore } from "@/app/admin/src/pages/AppBuilder/AIEditor/components/AIControllerStore"

export default async function chatChunkOpenAIOffice(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES"
) {
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

  const apiEndPoint = "https://1259692580-b9dznk0gp5.na-siliconvalley.tencentscf.com/chat-openrouter"

  const payload = {
    // model: "anthropic/claude-3.5-haiku-20241022:beta",
    messages: _messages,
    stream: true,
  }

  let controller = new AbortController()
  // 同时使用全局控制器和现有的 fetchController
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

          // 检查是否有 usage 数据并计算费用
          if (parsed?.usage) {
            const model = sessionStorage.getItem("aiLevel") || "ADVANCED"
            await costService.recordTokenUsage(
              {
                promptTokenCount: parsed.usage.prompt_tokens,
                candidatesTokenCount: parsed.usage.completion_tokens,
                model: model,
                content: fullContent,
              },
              true // 使用 wild 模式的计费标准
            )
          }
          // 检查停止原因
          if (parsed?.choices[0]?.finish_reason === "max_tokens") {
            // 如果停止原因是 length，则继续调用
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
            return // 结束当前调用
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

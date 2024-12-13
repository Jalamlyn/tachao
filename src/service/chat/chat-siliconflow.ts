import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"

export default async function chatChunkDeepseek(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES",
  baseModel = "deepseek::deepseek-chat"
) {
  const apiKey = "sk-gdgylduvkxdhdzpyjdfpqdcmvcwmmqhoazmnfwjecxwvzuur"
  const apiEndPoint = "https://api.siliconflow.cn/v1/chat/completions"

  let _messages
  if (isFirst) {
    _messages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  } else {
    _messages = messages
  }

  const payload = {
    model: "Qwen/QwQ-32B-Preview",
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
        Authorization: `Bearer ${apiKey}`,
      },
      body: jsonStringify(payload),
      signal: controller.signal,
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
            await chatChunkDeepseek(
              _messages.concat([
                {
                  role: "assistant",
                  content: fullContent,
                },
                {
                  role: "user",
                  content: `从"""${lastTenChars}"""后面开始继续生成，开头和结尾都不要解释和说明，也不要有\`\`\`json 和这样的标记`,
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

          if (parsed?.usage) {
            const usageData = {
              usage: parsed.usage,
            }
          }
        } catch (error) {
          console.error("Error parsing JSON:", error)
        }
      } else {
        localDB.setItem("chat-chunk-over", overFlag)
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted")
    } else {
      console.error("Error:", error)
      message.error(`An error occurred while fetching data: ${error.message}`)
      if (error.message.includes("context_length_exceeded")) {
        onChunk(`项目大小超过了最大上下文，无法使用自动检索模式，请切换到手动检索模式，手动勾选需要修改的文件`)
      }
    }
    throw error
  }
}

import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"

let systemMsg

export default async function chatMoV2(messages, onChunk, onCancel, isFirst = true) {
  const env = localDB.getItem("environments")
  const environments = jsonParse(env)
  if (!environments) {
    return message.error(`客户端信息获取失败，请返回应用界面重试`)
  }
  const apiKey = localStorage.getItem("mobenai.api-key")
  const apiEndPoint = `http://localhost:${environments[0].port}/chat-claude`
  if (isFirst) {
    systemMsg = messages.shift()
  }
  const payload = {
    model: "claude-3-5-sonnet-20240620",
    system: systemMsg.content,
    messages: messages.map((msg) => {
      if (msg.role === "user" && Array.isArray(msg.content)) {
        return {
          role: "user",
          content: msg.content.map((item) => {
            if (item.type === "image_url") {
              return {
                type: "image",
                source: {
                  type: "base64",
                  media_type: item.image_url.url.split(";base64,")[0].split(":")[1],
                  data: item.image_url.url.split(";base64,")[1],
                },
              }
            }
            return item
          }),
        }
      }
      return msg
    }),
    temperature: 0,
    max_tokens: 8192,
    stream: true,
    apiKey,
  }

  let controller = new AbortController()
  fetchController.current = controller
  onCancel(() => controller.abort())

  try {
    const response = await fetch(apiEndPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: jsonStringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let fullContent = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop()

      for (const line of lines) {
        if (line.trim() === "") continue
        if (!line.startsWith("data:")) continue

        const data = line.slice(5).trim()

        try {
          const parsed = jsonParse(data)
          if (parsed.type === "content_block_delta" && parsed.delta.type === "text_delta") {
            const content = parsed.delta.text
            fullContent += content
            onChunk(content)
          } else if (parsed.type === "message_delta" && parsed.delta.stop_reason === "end_turn") {
            // 消息结束
            return
          } else if (parsed.type === "message_delta" && parsed.delta.stop_reason === "max_tokens") {
            // 如果停止原因是 max_tokens，则继续调用
            const lastTenChars = fullContent.slice(-10)
            // fullContent = fullContent.slice(0, -10)
            await chatMoV2(
              messages.concat([
                { role: "assistant", content: fullContent },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `继续生成，以"""${lastTenChars}"""开头，但是不包含"""${lastTenChars}"""，开头和结尾都不要解释和说明`,
                    },
                  ],
                },
              ]),
              onChunk,
              onCancel,
              false
            )
            return // 结束当前调用
          }
        } catch (error) {
          console.error("Error parsing JSON:", error)
        }
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

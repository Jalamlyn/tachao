import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"

export default async function chatMoV2(messages, onChunk, onCancel, isFirst = true, temperature = 0, overFlag = "YES") {
  const apiKey = localStorage.getItem("mobenai.api-key")
  const apiEndPoint = localStorage.getItem("mobenai.api-endpoint")
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
        "api-key": apiKey,
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

          // 检查停止原因
          if (parsed?.choices[0]?.finish_reason === "length") {
            // 如果停止原因是 length，则继续调用
            const lastTenChars = fullContent.slice(-10)
            await chatMoV2(
              messages.concat([
                { role: "assistant", content: fullContent },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `继续生成，从“${lastTenChars}”后面继续生成，保持连续，开头和结尾都不要解释和说明，也不要有\`\`\`text 这样的标记和其他任何标记`,
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
      if (error.message.includes("context_length_exceeded")) {
        onChunk(`项目大小超过了最大上下文，无法使用自动检索模式，请切换到手动检索模式，手动勾选需要修改的文件`)
      }
    }
    throw error
  }
}

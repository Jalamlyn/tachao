import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"
import { costService } from "@/utils/costService"

export default async function chatChunkDeepseek(
  messages,
  onChunk,
  onCancel = () => {},
  isFirst = true,
  temperature = 0,
  overFlag = "YES"
) {
  let _messages
  if (isFirst) {
    _messages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content?.content || msg.content,
    }))
  } else {
    _messages = messages
  }

  const payload = {
    messages: _messages,
    temperature,
    max_tokens: 8192,
  }

  let controller = new AbortController()
  fetchController.current = controller
  onCancel(() => controller.abort())

  try {
    const response = await fetch("https://service-fpf07h2s-1259692580.usw.apigw.tencentcs.com/release/chat-a", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    let inputTokens = 0
    let outputTokens = 0

    for await (let event of eventStream) {
      if (event.data !== "[DONE]") {
        try {
          const parsed = jsonParse(event.data)
          const content = parsed?.choices[0]?.delta?.content || ""
          fullContent += content
          onChunk(content)

          if (parsed?.usage) {
            inputTokens = parsed.usage.prompt_tokens || inputTokens
            outputTokens = parsed.usage.completion_tokens || outputTokens
          }

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
              overFlag
            )
            return
          }
        } catch (error) {
          console.error("Error parsing JSON:", error)
          throw error
        }
      } else {
        await costService.recordTokenUsage({
          promptTokenCount: inputTokens,
          candidatesTokenCount: outputTokens,
          model: "advanced",
          content: fullContent,
        })
        localDB.setItem("chat-chunk-over", overFlag)
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted")
    } else {
      console.error("Error:", error)
      message.error(`An error occurred while fetching data: ${error.message}`)
    }
    throw error
  }
}

import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"

export default async function chatChunkOpenAIOffice(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES"
) {
  // 从 sessionStorage 读取当前选择的模型
  const baseModel = sessionStorage.getItem("aiLevel") || "advanced"
  console.log("[ChatService] Using model:", baseModel)

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
    expert:
      "https://ai-mobenaimo177654748466.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview",
    advanced:
      "https://ai-mobenaimo177654748466.openai.azure.com/openai/deployments/gpt-4o-mini-2/chat/completions?api-version=2024-02-15-preview",
  }

  const apiKey = "5d5c1f3cc91b440b8391851b2eadfb1c"
  const apiEndPoint = modelEndpoints[baseModel]
  console.log("[ChatService] API Endpoint:", apiEndPoint)

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
      if (error.message.includes("context_length_exceeded")) {
        onChunk(`项目大小超过了最大上下文，无法使用自动检索模式，请切换到手动检索模式，手动勾选需要修改的文件`)
      }
    }
    throw error
  }
}

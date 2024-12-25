import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { inject } from "@wpm-js/core"
import { costService } from "@/utils/costService"

let systemMsg

async function handleToolUse(toolUse, onChunk) {
  if (toolUse.name === "download_template") {
    try {
      const id = message.loading("开始下载模版...")
      const res = await inject("Tools")["downloadTemplate"]()
      message.closeLoading(id, "success", "模版下载成功")

      const toolResult = {
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(res),
      }

      return toolResult
    } catch (error) {
      console.error("Error in moAction:", error)
      return {
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: `Error: ${error.message}`,
        is_error: true,
      }
    }
  } else {
    console.warn(`Unhandled tool type: ${toolUse.name}`)
    return {
      type: "tool_result",
      tool_use_id: toolUse.id,
      content: `Unhandled tool type: ${toolUse.name}`,
      is_error: true,
    }
  }
}

export default async function chatChunkClaudeOffice(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES"
) {
  const model = sessionStorage.getItem("aiLevel") || "ADVANCED"
  const apiEndPoint = "https://service-fpf07h2s-1259692580.usw.apigw.tencentcs.com/release/chat-claude-horay"
  let _messages
  if (isFirst) {
    _messages = messages.map((msg, index) => {
      if (!msg.images) {
        msg.images = []
      }
      if (msg.role === "system") {
        return msg
      } else {
        return {
          role: msg.role,
          // content: msg.content,
          content: [
            {
              type: "text",
              text: msg.content,
            },
            ...(msg.images?.map((img) => ({ type: "image_url", image_url: { url: img, detail: "high" } })) || []),
          ],
        }
      }
    })
    systemMsg = _messages.shift()
  } else {
    _messages = messages
  }

  const payload = {
    model: model,
    system: systemMsg.content,
    messages: _messages,
    temperature,
    max_tokens: 8192,
    stream: true,
    cid: "Hx9Kp2Qm7Zf3Lw5Ry8Tj6",
  }

  let controller = new AbortController()
  fetchController.current = controller

  try {
    const response = await fetch(apiEndPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
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
    let inputTokens = 0
    let outputTokens = 0

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

          if (parsed.type === "message_start") {
            inputTokens = parsed.message.usage.input_tokens
          }

          if (parsed.type === "content_block_delta" && parsed.delta.type === "text_delta") {
            const content = parsed.delta.text
            fullContent += content
            onChunk(content)
          } else if (parsed.type === "message_delta" && parsed.delta.stop_reason === "end_turn") {
            outputTokens = parsed.usage.output_tokens
            const totalInputTokens = inputTokens

            // 使用 costService 记录 token 使用情况
            await costService.recordTokenUsage(
              {
                promptTokenCount: totalInputTokens,
                candidatesTokenCount: outputTokens,
                model: model,
                content: fullContent,
              },
              true
            ) // true 表示使用 wild 模式的计费

            localDB.setItem("chat-chunk-over", overFlag)
            return
          } else if (parsed.type === "message_delta" && parsed.delta.stop_reason === "max_tokens") {
            const lastTenChars = fullContent.slice(-10)
            await chatChunkClaudeOffice(
              _messages.concat([
                { role: "assistant", content: fullContent },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `继续生成，以"""${lastTenChars}"""开头，但是不包含"""${lastTenChars}"""，开头和结尾都不要解释和说明，也不要有\`\`\`json 和这样的标记`,
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
          } else if (parsed.type === "content_block_start" && parsed.content_block.type === "tool_use") {
            const toolUse = parsed.content_block
            const toolResult = await handleToolUse(toolUse, onChunk)

            await chatChunkClaudeOffice(
              [
                ..._messages,
                {
                  role: "assistant",
                  content: [toolUse],
                },
                {
                  role: "user",
                  content: [toolResult],
                },
              ],
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
    }
    throw error
  }
}

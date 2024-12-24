import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { inject } from "@wpm-js/core"
import { setMetadata, getMetadata } from "@/service/apis/metadata"

let systemMsg

// 计算 Claude 费用的函数
function calculateClaudeCost(fullContent, tokenCount: number, isInput: boolean, model: string): number {
  const isCoding = fullContent.includes(`shata-ai-code`)
  const ratePerMillionTokens = {
    EXPERT: {
      input: isCoding ? 219 : 43.8,
      output: isCoding ? 109 : 21.8,
    },
    ADVANCED: {
      input: isCoding ? 73 : 14.6,
      output: isCoding ? 292 : 58.4,
    },
  }

  const rate = ratePerMillionTokens[model] || ratePerMillionTokens["ADVANCED"]
  const tokenRate = isInput ? rate.input : rate.output
  return (tokenCount / 1000000) * tokenRate // 转换为每百万 token 的价格
}

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
  const apiEndPoint = "https://service-fpf07h2s-1259692580.usw.apigw.tencentcs.com/release/chat-claude-office"
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
          content: [
            {
              type: "text",
              text: msg.content,
            },
            ...msg.images.map((image) => {
              return {
                type: "image",
                source: {
                  type: "base64",
                  media_type: image.split(";base64,")[0].split(":")[1],
                  data: image.split(";base64,")[1],
                },
              }
            }),
          ],
        }
      }
    })
    systemMsg = _messages.shift()
  } else {
    _messages = messages
  }
  _messages[_messages.length - 1].content[0].cache_control = { type: "ephemeral" }

  const payload = {
    model: model,
    system: [
      {
        type: "text",
        text: systemMsg.content,
        cache_control: { type: "ephemeral" },
      },
    ],
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
    let cacheCreationInputTokens = 0
    let cacheReadInputTokens = 0
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

          // 捕获开始消息中的 token 信息
          if (parsed.type === "message_start") {
            inputTokens = parsed.message.usage.input_tokens
            cacheCreationInputTokens = parsed.message.usage.cache_creation_input_tokens
            cacheReadInputTokens = parsed.message.usage.cache_read_input_tokens
          }

          // 处理内容块
          if (parsed.type === "content_block_delta" && parsed.delta.type === "text_delta") {
            const content = parsed.delta.text
            fullContent += content
            onChunk(content)
          }
          // 捕获结束消息中的 token 信息并计算成本
          else if (parsed.type === "message_delta" && parsed.delta.stop_reason === "end_turn") {
            outputTokens = parsed.usage.output_tokens
            const totalInputTokens = inputTokens + cacheCreationInputTokens + cacheReadInputTokens

            // 计算成本
            const inputCost = calculateClaudeCost(fullContent, totalInputTokens, true, model)
            const outputCost = calculateClaudeCost(fullContent, outputTokens, false, model)

            // 记录成本
            try {
              const costRecords = await getMetadata(["ai-cost-records"])
              const existingRecords = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []

              const newRecord = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                model,
                promptTokenCount: totalInputTokens,
                candidatesTokenCount: outputTokens,
                inputCost,
                outputCost,
                totalCost: inputCost + outputCost,
              }

              if (existingRecords.length > 0) {
                await setMetadata("ai-cost-records", [...existingRecords, newRecord])
              } else {
                await setMetadata("ai-cost-records", [newRecord])
              }
            } catch (e) {
              console.error("Error storing cost records:", e)
            }

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

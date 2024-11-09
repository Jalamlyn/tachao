import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { inject } from "@wpm-js/core"

let systemMsg

function mergeAdjacentRoles(arr) {
  if (arr.length === 0) return []

  const result = []
  let current = { ...arr[0] }

  for (let i = 1; i < arr.length; i++) {
    if (arr[i].role === current.role) {
      current.content += arr[i].content
    } else {
      result.push(current)
      current = { ...arr[i] }
    }
  }

  result.push(current)
  return result
}

async function handleToolUse(toolUse, onChunk) {
  if (toolUse.name === "download_template") {
    try {
      const id = message.loading("开始下载模版...")
      const res = await inject("Tools")["downloadTemplate"]()
      message.closeLoading(id, "success", "模版下载成功")

      // 格式化返回结果
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
    // 处理其他类型的工具（如果有的话）
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
  overFlag = "YES",
  // baseModel = "claude::claude-3-5-sonnet-20241022"
  baseModel = "claude::claude-3-5-haiku-20241022"
) {
  const [provider, model] = baseModel.split("::")
  const modelSupplierData = localDB.getItem("model-supplier-data") || []
  const supplierInfo = modelSupplierData.find((supplier) => supplier.id === provider) || "claude"

  if (!supplierInfo) {
    throw new Error(`未找到服务商信息：${provider}`)
  }

  const apiKey =
    supplierInfo.apiKey ||
    ""
  // const apiEndPoint = supplierInfo.endpoint || "https://api.anthropic.com/v1/messages"
  const apiEndPoint = ""

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
    apiKey,
    cid: "",
    // tools: [
    //   {
    //     name: "download_template",
    //     description: "Download template",
    //     input_schema: {
    //       type: "object",
    //       properties: {},
    //     },
    //   },
    // ],
    // tool_choice: { type: "auto" },
  }

  let controller = new AbortController()
  fetchController.current = controller

  try {
    const response = await fetch(apiEndPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
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
            // 处理工具使用请求
            const toolUse = parsed.content_block
            const toolResult = await handleToolUse(toolUse, onChunk)

            // 将工具结果添加到消息中
            // 继续对话
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
      if (error.message.includes("context_length_exceeded")) {
        onChunk(`项目大小超过了最大上下文，无法使用自动检索模式，请切换到手动检索模式，手动勾选需要修改的文件`)
      }
    }
    throw error
  }
}

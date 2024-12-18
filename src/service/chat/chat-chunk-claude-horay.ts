import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"

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

export default async function chatChunkClaudeHoray(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES",
  baseModel = "hooray::claude-3-5-sonnet-v2@20241022"
) {
  const [provider, model] = baseModel.split("::")
  console.log("chatChunkClaudeHoray", baseModel)
  const modelSupplierData = localDB.getItem("model-supplier-data") || [
    {
      id: "hooray",
      name: "Hooray AI",
      apiKey: "",
      endpoint: "https://api.horay.ai/v1/messages",
      isDefault: true,
    },
  ]
  const supplierInfo = modelSupplierData.find((supplier) => supplier.id === provider)

  if (!supplierInfo) {
    throw new Error(`未找到服务商信息：${provider}`)
  }

  const apiKey = "sk-eqoxibfuslwmxpnmlvjzwleeqdaltstzwmnavydsayujhvnj"
  const apiEndPoint = supplierInfo.endpoint || "https://api.horay.ai/v1/messages"

  let _messages
  if (isFirst) {
    _messages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
    systemMsg = _messages.shift()
  } else {
    _messages = mergeAdjacentRoles(messages)
  }
  const payload = {
    model: model,
    system: systemMsg.content,
    messages: _messages,
    temperature,
    max_tokens: 8192,
    stream: true,
    apiKey,
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
            await chatChunkClaudeHoray(
              _messages.concat([
                { role: "assistant", content: fullContent },
                {
                  role: "user",
                  content: `继续生成，以"""${lastTenChars}"""开头，但是不包含"""${lastTenChars}"""，开头和结尾都不要解释和说明`,
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

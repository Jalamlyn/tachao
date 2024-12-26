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
  overFlag = "YES"
) {
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
    system: systemMsg.content,
    messages: _messages,
    temperature,
    max_tokens: 8192,
  }

  let controller = new AbortController()
  fetchController.current = controller

  try {
    const response = await fetch("https://service-fpf07h2s-1259692580.usw.apigw.tencentcs.com/release/chat-e", {
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
              "expert"
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

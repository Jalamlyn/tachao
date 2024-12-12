import { message } from "@/components/Message"
import { fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"

export default async function chatChunkGeminiOffice(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES",
  baseModel = "gemini::gemini-2.0-flash-exp"
) {
  const [provider, model] = baseModel.split("::")
  const modelSupplierData = localDB.getItem("model-supplier-data") || []
  const supplierInfo = modelSupplierData.find((supplier) => supplier.id === provider) || "gemini"

  if (!supplierInfo) {
    throw new Error(`未找到服务商信息：${provider}`)
  }

  const apiKey = supplierInfo.apiKey || "default_api_key"
  const apiEndPoint = "https://service-fpf07h2s-1259692580.usw.apigw.tencentcs.com/release/chat-gemini-office"

  let _messages = messages.map((msg) => {
    if (msg.role === "system") {
      return {
        role: "system",
        content: msg.content,
      }
    }
    return {
      role: msg.role === "assistant" ? "model" : msg.role,
      content: msg.content,
      images: msg.images || [],
    }
  })

  const systemMsg = _messages.find((msg) => msg.role === "system")
  _messages = _messages.filter((msg) => msg.role !== "system")

  const payload = {
    model: model,
    messages: _messages,
    temperature,
    max_tokens: 8192,
    stream: true,
    apiKey,
    cid: "Hx9Kp2Qm7Zf3Lw5Ry8Tj6",
    system: systemMsg ? systemMsg.content : "",
  }

  let controller = new AbortController()
  fetchController.current = controller

  try {
    const response = await fetch(apiEndPoint, {
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

      const chunk = decoder.decode(value, { stream: true })
      console.log("Received chunk:", chunk)
      
      buffer += chunk
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        console.log("Processing line:", line)
        
        // 直接查找包含 "text": " 的行
        if (line.includes('"text": "')) {
          // 提取文本内容
          const textStart = line.indexOf('"text": "') + 8
          const textEnd = line.lastIndexOf('"')
          if (textEnd > textStart) {
            const content = line.substring(textStart, textEnd).trim()
            console.log("Extracted content:", content)
            if (content) {
              fullContent += content
              onChunk(content)
            }
          }
        }
      }
    }

    console.log("Final accumulated content:", fullContent)
    localDB.setItem("chat-chunk-over", overFlag)
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
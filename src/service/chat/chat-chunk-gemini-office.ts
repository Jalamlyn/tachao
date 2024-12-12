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
    let jsonBuffer = ""
    let bracketCount = 0
    let inObject = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      console.log("Received raw chunk:", chunk)
      
      // 处理每个字符，正确收集JSON对象
      for (const char of chunk) {
        if (char === '{') {
          inObject = true
          bracketCount++
        }
        
        if (inObject) {
          jsonBuffer += char
        }
        
        if (char === '}') {
          bracketCount--
          if (bracketCount === 0 && inObject) {
            // 收集到完整的JSON对象
            console.log("Complete JSON object collected:", jsonBuffer)
            try {
              const parsed = jsonParse(jsonBuffer)
              console.log("Successfully parsed JSON:", parsed)
              
              if (parsed.candidates && Array.isArray(parsed.candidates)) {
                for (const candidate of parsed.candidates) {
                  if (candidate.content?.parts?.[0]?.text) {
                    const content = candidate.content.parts[0].text
                    console.log("Extracted content:", content)
                    fullContent += content
                    onChunk(content)
                  }
                }
              }
            } catch (error) {
              console.error("Error parsing JSON object:", error)
              console.log("Problematic JSON:", jsonBuffer)
            }
            
            // 重置缓冲区
            jsonBuffer = ""
            inObject = false
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
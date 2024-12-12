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
      console.log("Received raw chunk:", chunk)
      
      buffer += chunk
      
      // 分割并处理多个JSON对象
      const parts = buffer.split(/,\s*{/).filter(Boolean)
      
      for (let part of parts) {
        // 如果不是以{开头，添加{
        if (!part.startsWith("{")) {
          part = "{" + part
        }
        
        // 确保JSON对象完整
        if (part.includes("}")) {
          const endIndex = part.lastIndexOf("}") + 1
          const jsonStr = part.substring(0, endIndex)
          buffer = part.substring(endIndex)
          
          console.log("Processing JSON string:", jsonStr)
          
          try {
            const parsed = jsonParse(jsonStr)
            console.log("Successfully parsed JSON:", parsed)
            
            if (parsed.candidates && Array.isArray(parsed.candidates)) {
              for (const candidate of parsed.candidates) {
                if (candidate.content?.parts?.[0]?.text) {
                  const content = candidate.content.parts[0].text
                  console.log("Extracted content:", content)
                  // 移除content中的特殊格式标记
                  const cleanContent = content.replace(/```/g, "").trim()
                  if (cleanContent) {
                    console.log("Clean content to be sent:", cleanContent)
                    fullContent += cleanContent
                    onChunk(cleanContent)
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error parsing JSON:", error)
            console.log("Problematic JSON:", jsonStr)
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
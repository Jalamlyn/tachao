import { message } from "@/components/Message"
import { fetchController, jsonParse, jsonStringify } from "@/utils"
import { setMetadata, getMetadata } from "@/service/apis/metadata"
import { localDB } from "@/utils/localDB"

// 处理返回的数据行
function processTextContent(line: string): string | null {
  try {
    // 移除 "data:" 前缀
    const jsonStr = line.replace(/^data:\s*/, "")
    // 解析完整的JSON
    const parsed = JSON.parse(jsonStr)

    // 检查并提取文本内容
    if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
      return parsed.candidates[0].content.parts[0].text
    }
    return null
  } catch (e) {
    console.warn("Failed to parse line:", line, e)
    return null
  }
}

// 计算费用的函数
function calculateCost(tokenCount: number, isInput: boolean, model: string): number {
  const ratePerThousandTokens = {
    ADVANCED: {
      input: 0.02,
      output: 0.08,
    },
    EXPERT: {
      input: 0.2,
      output: 0.8,
    },
  }

  const rate = ratePerThousandTokens[model === "ADVANCED" ? "ADVANCED" : "EXPERT"]
  const tokenRate = isInput ? rate.input : rate.output
  return (tokenCount / 1000) * tokenRate
}

export default async function chatChunkGeminiOffice(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES",
  aiLevel
) {
  // 从 sessionStorage 读取当前选择的模型
  debugger
  const model = aiLevel ? aiLevel : sessionStorage.getItem("aiLevel") || "ADVANCED"
  const apiEndPoint = "https://service-fpf07h2s-1259692580.usw.apigw.tencentcs.com/release/chat"

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
    model,
    messages: _messages,
    temperature,
    max_tokens: 8192,
    stream: true,
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

      buffer += chunk
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.trim()) {
          const content = processTextContent(line)
          if (content) {
            fullContent += content
            onChunk(content)
          }

          // 检查是否是最后一行（包含token统计信息）
          if (line.includes(`STOP`)) {
            try {
              const jsonStr = line.replace(/^data:\s*/, "")
              const parsed = JSON.parse(jsonStr)
              const { promptTokenCount, candidatesTokenCount } = parsed.usageMetadata
              // 计算费用
              const inputCost = calculateCost(promptTokenCount, true, model)
              const outputCost = calculateCost(candidatesTokenCount, false, model)

              // 获取现有的费用记录
              const costRecords = await getMetadata(["ai-cost-records"])
              const existingRecords = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []

              // 添加新的记录
              const newRecord = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                model,
                promptTokenCount,
                candidatesTokenCount,
                inputCost,
                outputCost,
                totalCost: inputCost + outputCost,
              }

              // 判断是否已有数据
              if (existingRecords.length > 0) {
                // 插入新记录到现有数据
                await setMetadata("ai-cost-records", [...existingRecords, newRecord])
              } else {
                // 没有数据，直接设置
                await setMetadata("ai-cost-records", [newRecord])
              }

              localDB.setItem("chat-chunk-over", overFlag)
            } catch (e) {
              console.error("Error processing usage metadata:", e)
            }
          }
        }
      }
    }
    console.log("Final accumulated content:", fullContent)
  } catch (error) {
    if (error.name === "AbortError") {
      s
    } else {
      message.error(`An error occurred while fetching data: ${error.message}`)
    }
    throw error
  }
}

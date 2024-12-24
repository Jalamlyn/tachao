import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"
import { countTokens } from "gpt-tokenizer/model/gpt-4o" // 引入 o200k_base 编码
import { setMetadata, getMetadata } from "@/service/apis/metadata" // 引入元数据存储方法

// 计算费用的函数（复用 Gemini 的逻辑）
function calculateCost(tokenCount: number, isInput: boolean, model: string): number {
  const ratePerThousandTokens = {
    ADVANCED: {
      input: 0.01,
      output: 0.15,
    },
    EXPERT: {
      input: 0.1,
      output: 1.5,
    },
  }

  const rate = ratePerThousandTokens[model === "ADVANCED" ? "ADVANCED" : "EXPERT"]
  const tokenRate = isInput ? rate.input : rate.output
  return (tokenCount / 1000) * tokenRate
}

// 根据模型选择合适的 countTokens 方法

export default async function chatChunkOpenAIOffice(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES"
) {
  // 从 sessionStorage 读取当前选择的模型
  const baseModel = sessionStorage.getItem("aiLevel") || "ADVANCED"
  const model = baseModel // 假设模型名称从 payload 中获取
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
            ...(msg.images?.map((img) => ({ type: "image_url", image_url: { url: img, detail: "high" } })) || []),
          ],
        }
      }
    })
  }
  const apiKey = "xxxxxxx"
  const apiEndPoint = "https://service-fpf07h2s-1259692580.usw.apigw.tencentcs.com/release/chat-openai-office"

  const payload = {
    apiKey,
    model,
    messages: _messages,
    temperature,
    max_tokens: 16000,
    stream: true,
  }

  // 使用动态选择的 countTokens 方法统计输入 token 数量，并传递模型名称
  const inputTokenCount = countTokens(JSON.stringify(_messages))
  console.log("[TokenStats] Input token count:", inputTokenCount)

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
    let outputTokenCount = 0 // 初始化输出 token 计数

    for await (let event of eventStream) {
      if (event.data !== "[DONE]") {
        try {
          const parsed = jsonParse(event.data)
          const content = parsed?.choices[0]?.delta?.content || ""
          fullContent += content
          onChunk(content)

          // 使用动态选择的 countTokens 方法统计输出 token 数量，并传递模型名称

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
        outputTokenCount = countTokens(fullContent)
        localDB.setItem("chat-chunk-over", overFlag)
      }
    }

    // 计算费用
    const inputCost = calculateCost(inputTokenCount, true, baseModel)
    const outputCost = calculateCost(outputTokenCount, false, baseModel)
    console.log("[CostStats] Input cost:", inputCost, "Output cost:", outputCost, "Total cost:", inputCost + outputCost)

    // 存储成本记录
    try {
      const costRecords = await getMetadata(["ai-cost-records"])
      const existingRecords = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []

      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        model: baseModel,
        promptTokenCount: inputTokenCount * 2,
        candidatesTokenCount: outputTokenCount * 2,
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
    } catch (e) {
      console.error("Error storing cost records:", e)
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted")
    } else {
      message.error(`An error occurred while fetching data: ${error.message}`)
    }
    throw error
  }
}

import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"
import { countTokens } from "@/utils/moduleLoader"
import { setMetadata, getMetadata } from "@/service/apis/metadata"

// 计算费用的函数
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

// 清理消息内容，移除图片以准确计算token
function cleanMessagesForTokenCount(messages: any[]) {
  return messages.map((msg) => {
    if (msg.role === "system") {
      return msg
    }

    if (Array.isArray(msg.content)) {
      // 只保留文本内容
      return {
        ...msg,
        content: msg.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("\n"),
      }
    }

    // 如果是普通文本消息，直接返回
    return msg
  })
}

export default async function chatChunkOpenAIOffice(
  messages,
  onChunk,
  onCancel,
  isFirst = true,
  temperature = 0,
  overFlag = "YES",
  onResult?: (result: string) => void
) {
  const baseModel = sessionStorage.getItem("aiLevel") || "EXPERT"
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

  const payload = {
    messages: _messages,
    temperature,
    max_tokens: 16000,
    model: baseModel,
  }

  // 使用清理后的消息计算token
  const cleanedMessages = cleanMessagesForTokenCount(_messages)
  const inputTokenCount = countTokens(JSON.stringify(cleanedMessages))
  console.log("[TokenStats] Input token count (excluding images):", inputTokenCount)

  let controller = new AbortController()
  fetchController.current = controller
  onCancel(() => controller.abort())
  try {
    const response = await fetch("https://service-fpf07h2s-1259692580.usw.apigw.tencentcs.com/release/chat-azure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    let outputTokenCount = 0

    for await (let event of eventStream) {
      if (event.data !== "[DONE]") {
        try {
          const parsed = jsonParse(event.data)
          const content = parsed?.choices[0]?.delta?.content || ""
          fullContent += content
          onChunk(content)

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
              overFlag,
              onResult
            )
            return
          }
        } catch (error) {
          console.log("Error parsing JSON:", error)
        }
      } else {
        outputTokenCount = countTokens(fullContent)
        localDB.setItem("chat-chunk-over", overFlag)
        // 在完成时调用onResult回调
        if (onResult) {
          onResult(fullContent)
        }
      }
    }

    const inputCost = calculateCost(inputTokenCount, true, baseModel)
    const outputCost = calculateCost(outputTokenCount, false, baseModel)
    console.log("[CostStats] Input cost:", inputCost, "Output cost:", outputCost, "Total cost:", inputCost + outputCost)

    try {
      const costRecords = await getMetadata(["ai-cost-records"])
      const existingRecords = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []

      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: "token_usage",
        totalCost: inputCost + outputCost,
        detail: {
          tokenUsage: {
            promptTokenCount: inputTokenCount,
            candidatesTokenCount: outputTokenCount,
            inputCost,
            outputCost,
            model: baseModel,
          },
        },
      }
      if (existingRecords.length > 0) {
        await setMetadata("ai-cost-records", [...existingRecords, newRecord])
      } else {
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
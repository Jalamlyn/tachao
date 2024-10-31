import { message } from "@/components/Message"
import { blog, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"

export default async function chatMoV2(messages, onChunk, onCancel, isFirst = true) {
  const env = localDB.getItem("environments")
  const environments = jsonParse(env)
  if (!environments) {
    return message.error(`客户端信息获取失败，请返回应用界面重试`)
  }
  const apiEndPoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-exp-0801:generateContent"
  let systemMsg = ""
  if (isFirst) {
    systemMsg = messages.shift()
  }
  const payload = {
    contents: messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content[0].text }],
    })),
    systemInstruction: {
      role: "user",
      parts: [{ text: systemMsg.content }],
    },
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
  }

  let controller = new AbortController()
  fetchController.current = controller
  onCancel(() => controller.abort())

  try {
    const response = await fetch(`${apiEndPoint}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonStringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`网络响应不正常: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    const content = data.candidates[0].content.parts[0].text || ""
    onChunk(content)

    // 检查是否需要继续生成
    if (content.length >= 8192) {
      const lastTenChars = content.slice(-10)
      await chatMoV2(
        messages.concat([
          { role: "model", parts: { text: content } },
          {
            role: "user",
            parts: {
              text: `继续生成，从"""${lastTenChars}"""后面开始生成，开头和结尾都不要解释和说明，也不要有\`\`\`这样的标记`,
            },
          },
        ]),
        onChunk,
        onCancel
      )
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("请求已中止")
    } else {
      console.error("错误:", error)
      message.error(`获取数据时发生错误: ${error.message}`)
      if (error.message.includes("context_length_exceeded")) {
        onChunk(`项目大小超过了最大上下文，无法使用自动检索模式，请切换到手动检索模式，手动勾选需要修改的文件`)
      }
    }
    throw error
  }
}

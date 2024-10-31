import { message } from "@/components/Message"
import { blog, fetchController, jsonParse, jsonStringify } from "@/utils"
import { localDB } from "@/utils/localDB"
import { events } from "fetch-event-stream"

export default async function chatOllama(messages, onChunk, onCancel, isFirst = true, temperature = 0, overFlag = "YES") {
  const apiEndPoint = localStorage.getItem("mobenai.api-endpoint") || "http://localhost:11434"
  const modelName = localStorage.getItem("ollamaModelName") || "llama2"

  let _messages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))

  const payload = {
    model: modelName,
    messages: _messages,
    stream: true,
    options: {
      temperature: temperature,
    },
  }

  let controller = new AbortController()
  fetchController.current = controller
  onCancel(() => controller.abort())

  try {
    const response = await fetch(`${apiEndPoint}/api/chat`, {
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

    const eventStream = events(response, controller.signal)
    let fullContent = ""

    for await (let event of eventStream) {
      if (event.data !== "[DONE]") {
        try {
          const parsed = jsonParse(event.data)
          const content = parsed?.message?.content || ""
          fullContent += content
          onChunk(content)

          if (parsed?.done) {
            localDB.setItem("chat-chunk-over", overFlag)
            break
          }
        } catch (error) {
          console.log("Error parsing JSON:", error)
        }
      }
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
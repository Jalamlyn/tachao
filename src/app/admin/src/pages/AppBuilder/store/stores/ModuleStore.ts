import { BaseStore } from "./BaseStore"
import { transform } from "@/utils/moduleLoader"
import { ModuleData, ShataAICode } from "../types"

export class ModuleStore extends BaseStore {
  async compileCode(code: string): Promise<string> {
    try {
      const { code: compiledCode } = transform(
        `export default async () => {
          ${code}
         }
        `,
        {
          presets: ["react"],
        }
      )
      return compiledCode
    } catch (error) {
      console.error("Error compiling code:", error)
      throw error
    }
  }

  extractShataAICodes(content: string): ShataAICode[] {
    try {
      const results: ShataAICode[] = []
      const codeBlocks = content.match(/<mo-ai-code[^>]*>([\s\S]*?)<\/mo-ai-code>/g)

      if (!codeBlocks) return results

      for (const block of codeBlocks) {
        try {
          const typeMatch = block.match(/type="([^"]+)"/)
          if (!typeMatch) continue

          const type = typeMatch[1] as ShataAICode["type"]
          const codeMatch = block.match(/<mo-ai-code[^>]*>([\s\S]*?)<\/mo-ai-code>/)
          if (!codeMatch) continue

          const code = codeMatch[1].trim()

          if (type === "app") {
            results.push({
              type,
              code,
              name: "entry",
              title: "应用入口",
            })
            continue
          }

          const nameMatch = block.match(/name="([^"]+)"/)
          const name = nameMatch ? nameMatch[1] : undefined

          const titleMatch = block.match(/title="([^"]+)"/)
          const title = titleMatch ? titleMatch[1] : undefined

          const pageIdMatch = block.match(/pageid="([^"]+)"/)
          const pageid = pageIdMatch ? pageIdMatch[1] : undefined

          if (type === "page" && !pageid) {
            console.warn("Page type requires pageid attribute")
            continue
          }

          if (type !== "page" && !name) {
            console.warn(`${type} type requires name attribute`)
            continue
          }

          results.push({
            type,
            code,
            name: type === "page" ? pageid : name,
            title,
            ...(type === "page" && { pageid }),
          })
        } catch (blockError) {
          console.error("Error processing code block:", blockError)
          continue
        }
      }

      return results
    } catch (error) {
      console.error("Error extracting code blocks:", error)
      throw new Error("Failed to extract code blocks")
    }
  }

  async processAIResponse(aiResponse: string): Promise<Record<string, ModuleData>> {
    if (!this.appId) throw new Error("AppId not set")

    try {
      const codeBlocks = this.extractShataAICodes(aiResponse)
      const moduleData: Record<string, ModuleData> = {}

      for (const block of codeBlocks) {
        const moduleId = block.type === "app" ? `${this.appId}_app_entry` : `${this.appId}_${block.type}_${block.name}`

        moduleData[moduleId] = {
          id: moduleId,
          type: block.type,
          name: block.name!,
          title: block.title,
          code: block.code,
          compiledCode: await this.compileCode(block.code),
        }
      }

      return moduleData
    } catch (error) {
      console.error("Error processing AI response:", error)
      throw new Error("Failed to process AI response")
    }
  }
}
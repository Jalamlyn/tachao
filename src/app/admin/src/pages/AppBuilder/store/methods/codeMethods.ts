import { transform } from "@/utils/moduleLoader"
import { AppCodeStore, ModuleData, ShataAICode, Version } from "../types"

export function compileCode(this: AppCodeStore, code: string): Promise<string> {
  try {
    const { code: compiledCode } = transform(
      `export default async () => {
        ${code}
       }
      `,
      {
        filename: "example.tsx",
        presets: ["react", "typescript"],
      }
    )
    return Promise.resolve(compiledCode)
  } catch (error) {
    console.error("Error compiling code:", error)
    throw error
  }
}

export function extractShataAICodes(content: string): ShataAICode[] {
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

        let code = codeMatch[1].trim()

        // 处理 SEARCH/REPLACE 格式
        const searchReplaceMatch = code.match(/<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)>>>>>>> REPLACE/);
        if (searchReplaceMatch) {
          const searchContent = searchReplaceMatch[1].trim();
          const replaceContent = searchReplaceMatch[2].trim();
          
          // 如果 search 部分为空，说明是新代码
          if (!searchContent) {
            code = replaceContent;
          } else {
            // 否则需要在现有代码中进行替换
            code = replaceContent;
          }
        }

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

        results.push({
          type,
          code,
          name,
          title,
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

export async function processAIResponse(this: AppCodeStore, aiResponse: string): Promise<Record<string, ModuleData>> {
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

// ... 其他代码保持不变 ...
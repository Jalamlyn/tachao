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
        presets: ["react"],
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

export async function executeModules(this: AppCodeStore, context: any) {
  if (!this.currentVersion) return []
  const results: Array<{
    success: boolean
    moduleId: string
    type: string
    name: string
    executionTime?: number
    error?: string
    result?: any
  }> = []

  const version = this.currentVersion

  try {
    for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
      const startTime = performance.now()

      try {
        const moduleData = moduleWrapper.data

        if (!moduleData || !moduleData.compiledCode) {
          throw new Error(`Invalid module data for ${moduleId}`)
        }

        const moduleFunction = new Function(
          "context",
          `
          ${moduleData.compiledCode.replace(/export default/, "return")}
        `
        )
        const getResult = moduleFunction(context)
        getResult()

        results.push({
          success: true,
          moduleId,
          type: moduleData.type,
          name: moduleData.name,
          executionTime: performance.now() - startTime,
        })
      } catch (error) {
        console.error(`Error executing module ${moduleId}:`, error)
        results.push({
          success: false,
          moduleId,
          type: moduleWrapper.data?.type || "unknown",
          name: moduleWrapper.data?.name || moduleId,
          executionTime: performance.now() - startTime,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return results
  } catch (error) {
    console.error("Error executing modules:", error)
    return [
      {
        success: false,
        moduleId: "unknown",
        type: "unknown",
        name: "unknown",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    ]
  }
}

export async function addModules(this: AppCodeStore, updates: Record<string, string>): Promise<Version> {
  if (!this.currentVersion) {
    throw new Error("No current version")
  }

  try {
    const updatedModules: Record<string, any> = {}

    for (const [moduleId, newCode] of Object.entries(updates)) {
      const existingModule = this.currentVersion.modules[moduleId]
      if (!existingModule) {
        throw new Error(`Module ${moduleId} not found`)
      }

      const compiledCode = await this.compileCode(newCode)

      updatedModules[moduleId] = {
        data: {
          ...existingModule.data,
          code: newCode,
          compiledCode,
        },
        updatedAt: new Date().toISOString(),
      }
    }

    const newVersion: Version = {
      timestamp: Date.now(),
      app: {
        ...this.currentVersion.app,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
      },
      modules: {
        ...this.currentVersion.modules,
        ...updatedModules,
      },
    }

    return newVersion
  } catch (error) {
    console.error("Error adding modules:", error)
    throw error
  }
}

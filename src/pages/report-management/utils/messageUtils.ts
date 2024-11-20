export const extractShataAICode = (content: string): string | null => {
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content.match(regex)
  if (match) {
    return match[1].trim()
  }
  return null
}
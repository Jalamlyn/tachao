import { RESOURCE_PROMPTS } from "./resource-prompts"
import { LOCATION_PROMPTS } from "./location-prompts"

export const promptsComposer = {
  async getSystemPrompt() {
    const resourcePrompt = await RESOURCE_PROMPTS.resourcePrompt.getResourcePrompt()
    const locationPrompt = LOCATION_PROMPTS.locationPrompt.getLocationPrompt()
    
    return `
${resourcePrompt}

${locationPrompt}
    `
  }
}
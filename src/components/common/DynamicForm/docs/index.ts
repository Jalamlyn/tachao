import { markdown as guidemd } from "./guide.md"
import { markdown as examplemd } from "./example.md"
import { markdown as resourceMappingmd } from "./resource-mapping.md"
import { markdown as codemd } from "./code.md"

export const guide = `
${guidemd}
${resourceMappingmd}
`
export const example = `${examplemd}`

export const code = `${codemd}`

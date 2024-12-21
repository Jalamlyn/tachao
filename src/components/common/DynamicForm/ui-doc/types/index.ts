import { markdown as basic } from "./basic.md"
import { markdown as field } from "./field.md"
import { markdown as form } from "./form.md"
import { markdown as format } from "./format.md"
import { markdown as process } from "./process.md"
import { markdown as summary } from "./summary.md"
import { markdown as table } from "./table.md"
import { markdown as validation } from "./validation.md"

export const type = `
# Dynamic Form 类型说明
${basic}
${field}
${form}
${format}
${process}
${summary}
${table}
${validation}
`

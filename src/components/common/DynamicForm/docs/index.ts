import { markdown as configuration } from "./configuration.md"
import { markdown as fields } from "./fields.md"
import { markdown as table } from "./table.md"
import { markdown as process } from "./process.md"
import { markdown as validation } from "./validation.md"
import { markdown as watch } from "./watch.md"
import { markdown as examples } from "./examples.md"
import { markdown as bestPractices } from "./best-practices.md"
import { markdown as tooltip } from "./tooltip.md"
import { markdown as scroll } from "./scroll.md"
import { markdown as types } from "./types.md"

export const docs = {
  configuration,
  fields,
  table,
  process,
  validation,
  watch,
  examples,
  bestPractices,
  tooltip,
  scroll,
  types,
}

export default docs.configuration +
  "\n" +
  docs.fields +
  "\n" +
  docs.table +
  "\n" +
  docs.process +
  "\n" +
  docs.validation +
  "\n" +
  docs.watch +
  "\n" +
  docs.examples +
  "\n" +
  docs.bestPractices +
  "\n" +
  docs.tooltip +
  "\n" +
  docs.scroll +
  "\n" +
  docs.types +
  "\n"

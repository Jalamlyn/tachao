import { markdown as introduction } from "./introduction.md"
import { markdown as configuration } from "./configuration.md"
import { markdown as fields } from "./fields.md"
import { markdown as table } from "./table.md"
import { markdown as process } from "./process.md"
import { markdown as validation } from "./validation.md"
import { markdown as dependencies } from "./dependencies.md"
import { markdown as examples } from "./examples.md"
import { markdown as bestPractices } from "./best-practices.md"
import { markdown as faq } from "./faq.md"

export const docs = {
  introduction,
  configuration,
  fields,
  table,
  process,
  validation,
  dependencies,
  examples,
  bestPractices,
  faq,
}

export default docs.introduction + "\n" +
  docs.configuration + "\n" +
  docs.fields + "\n" +
  docs.table + "\n" +
  docs.process + "\n" +
  docs.validation + "\n" +
  docs.dependencies + "\n" +
  docs.examples + "\n" +
  docs.bestPractices + "\n" +
  docs.faq
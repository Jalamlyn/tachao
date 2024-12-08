import { markdown as formLinkage } from "./advanced/form-linkage.md"
import { markdown as configuration } from "./basic/configuration.md"
import { markdown as fieldTypes } from "./basic/field-types.md"
import { markdown as gettingStarted } from "./basic/getting-started.md"
import { markdown as exampleAssetManagement } from "./examples/example-asset-management.md"

export const doc = `
  ${gettingStarted}
  ${configuration}
  ${fieldTypes}
  ${formLinkage}
  ${exampleAssetManagement}
`

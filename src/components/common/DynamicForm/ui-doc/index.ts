import { markdown as textInput } from "./basic-fields/text-input.md"
import { markdown as numberInput } from "./basic-fields/number-input.md"
import { markdown as dateInput } from "./basic-fields/date-input.md"
import { markdown as select } from "./basic-fields/select.md"
import { markdown as switchInput } from "./basic-fields/switch.md"
import { markdown as slider } from "./basic-fields/slider.md"
import { markdown as upload } from "./basic-fields/upload.md"
import { markdown as resource } from "./basic-fields/resource.md"
import { markdown as signature } from "./basic-fields/signature.md"
import { markdown as location } from "./basic-fields/location.md"
import { markdown as clockIn } from "./basic-fields/clock-in.md"
import { markdown as customRender } from "./basic-fields/custom-render.md"

import { markdown as basicLayout } from "./layouts/basic-layout.md"
import { markdown as groupLayout } from "./layouts/group-layout.md"
import { markdown as responsiveLayout } from "./layouts/responsive-layout.md"
import { markdown as conditionalLayout } from "./layouts/conditional-layout.md"

import { markdown as basicTable } from "./tables/basic-table.md"
import { markdown as editableTable } from "./tables/editable-table.md"
import { markdown as autoCompute } from "./tables/auto-compute.md"
import { markdown as tableSummary } from "./tables/summary.md"
import { markdown as tableCustomRender } from "./tables/custom-render.md"

import { markdown as basicProcess } from "./process/basic-process.md"
import { markdown as conditionalProcess } from "./process/conditional-process.md"
import { markdown as processDependencies } from "./process/dependencies.md"
import { markdown as processValidation } from "./process/validation.md"

import { markdown as basicSummary } from "./summary/basic-summary.md"
import { markdown as autoComputeSummary } from "./summary/auto-compute.md"
import { markdown as summaryFormatting } from "./summary/formatting.md"
import { markdown as summaryCustomRender } from "./summary/custom-render.md"

import { markdown as fieldLinkage } from "./form-linkage/field-linkage.md"
import { markdown as tableLinkage } from "./form-linkage/table-linkage.md"
import { markdown as summaryLinkage } from "./form-linkage/summary-linkage.md"
import { markdown as processLinkage } from "./form-linkage/process-linkage.md"

import { markdown as validation } from "./data-processing/validation.md"
import { markdown as formatting } from "./data-processing/formatting.md"
import { markdown as transformation } from "./data-processing/transformation.md"
import { markdown as submission } from "./data-processing/submission.md"

export const uiDoc = {
  basicFields: {
    textInput,
    numberInput,
    dateInput,
    select,
    switchInput,
    slider,
    upload,
    resource,
    signature,
    location,
    clockIn,
    customRender
  },
  layouts: {
    basicLayout,
    groupLayout,
    responsiveLayout,
    conditionalLayout
  },
  tables: {
    basicTable,
    editableTable,
    autoCompute,
    tableSummary,
    tableCustomRender
  },
  process: {
    basicProcess,
    conditionalProcess,
    processDependencies,
    processValidation
  },
  summary: {
    basicSummary,
    autoComputeSummary,
    summaryFormatting,
    summaryCustomRender
  },
  formLinkage: {
    fieldLinkage,
    tableLinkage,
    summaryLinkage,
    processLinkage
  },
  dataProcessing: {
    validation,
    formatting,
    transformation,
    submission
  }
}

// 导出类型
export type UIDocType = typeof uiDoc
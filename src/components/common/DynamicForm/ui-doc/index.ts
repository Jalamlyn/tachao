import { markdown as textInput } from "./basic-fields/text-input.md"
import { markdown as numberInput } from "./basic-fields/number-input.md"
import { markdown as dateInput } from "./basic-fields/date-input.md"
import { markdown as select } from "./basic-fields/select.md"
import { markdown as switch } from "./basic-fields/switch.md"
import { markdown as slider } from "./basic-fields/slider.md"
import { markdown as upload } from "./basic-fields/upload.md"
import { markdown as resource } from "./basic-fields/resource.md"
import { markdown as signature } from "./basic-fields/signature.md"
import { markdown as location } from "./basic-fields/location.md"
import { markdown as clockIn } from "./basic-fields/clock-in.md"
import { markdown as customRender } from "./basic-fields/custom-render.md"

export const uiDoc = {
  basicFields: {
    textInput,
    numberInput,
    dateInput,
    select,
    switch,
    slider,
    upload,
    resource,
    signature,
    location,
    clockIn,
    customRender
  }
}
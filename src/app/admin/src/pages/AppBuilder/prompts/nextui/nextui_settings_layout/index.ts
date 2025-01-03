import { markdown as app } from "./app.md"
import { markdown as profileSetting } from "./pages/profile-setting.md"
import { markdown as appearanceSetting } from "./pages/appearance-setting.md"
import { markdown as accountSetting } from "./pages/account-setting.md"
import { markdown as billingSetting } from "./pages/billing-setting.md"
import { markdown as teamSetting } from "./pages/team-setting.md"
import { markdown as sidebar } from "./components/sidebar.md"
import { markdown as sidebarDrawer } from "./components/sidebar-drawer.md"
import { markdown as switchCell } from "./components/switch-cell.md"
import { markdown as themeCustomRadio } from "./components/theme-custom-radio.md"
import { markdown as planCustomRadio } from "./components/plan-custom-radio.md"
import { markdown as teamManageTable } from "./components/team-manage-table.md"
import { markdown as acmeIcon } from "./components/acme-icon.md"

export default `
${app}

${profileSetting}

${appearanceSetting}

${accountSetting}

${billingSetting}

${teamSetting}

${sidebar}

${sidebarDrawer}

${switchCell}

${themeCustomRadio}

${planCustomRadio}

${teamManageTable}

${acmeIcon}
`
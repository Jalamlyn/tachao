import { markdown as app } from "./app.md"
import { markdown as dataManage } from "./pages/data-manage.md"
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
import { markdown as tableContent } from "./components/TableContent.md"
import { markdown as tablePagination } from "./components/TablePagination.md"
import { markdown as tableToolbar } from "./components/TableToolbar.md"
import { markdown as status } from "./components/Status.md"
import { markdown as copyText } from "./components/CopyText.md"
import { markdown as store } from "./store.md"
import { markdown as module } from "./module.md"

export default `
${app}

${dataManage}

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

${tableContent}

${tablePagination}

${tableToolbar}

${status}

${copyText}

${store}

${module}
`
import { markdown as app } from "./app.md"
import { markdown as sidebarPage } from "./sidebar-page.md"
import { markdown as sidebar } from "./components/sidebar.md"
import { markdown as teamAvatar } from "./components/team-avatar.md"
import { markdown as acmeIcon } from "./components/acme-icon.md"
import { markdown as module } from "./module.md"

export default `
${app}

${sidebarPage}

${sidebar}

${teamAvatar}

${acmeIcon}

${module}
`
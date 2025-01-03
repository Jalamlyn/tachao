import { markdown as app } from "./app.md"
import { markdown as status } from "./components/Status.md"
import { markdown as copyText } from "./components/CopyText.md"
import { markdown as tableToolbar } from "./components/TableToolbar.md"
import { markdown as tableContent } from "./components/TableContent.md"
import { markdown as tablePagination } from "./components/TablePagination.md"
import { markdown as tablePage } from "./table-page.md"
import { markdown as store } from "./store.md"
import { markdown as module } from "./module.md"

export default `
${app}

${tablePage}

${tableToolbar}

${tableContent}

${tablePagination}

${status}

${copyText}

${store}

${module}
`
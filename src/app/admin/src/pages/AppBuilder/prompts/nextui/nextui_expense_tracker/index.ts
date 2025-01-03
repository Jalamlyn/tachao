import { markdown as app } from "./app.md"
import { markdown as expensePage } from "./expense-page.md"
import { markdown as expenseForm } from "./components/expense-form.md"
import { markdown as store } from "./store.md"
import { markdown as module } from "./module.md"

export default `
${app}

${expensePage}

${expenseForm}

${store}

${module}
`
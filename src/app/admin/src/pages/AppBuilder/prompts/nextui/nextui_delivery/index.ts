import { markdown as app } from "./app.md"
import { markdown as deliveryForm } from "./components/delivery/form.md"
import { markdown as deliveryTable } from "./components/delivery/table.md"
import { markdown as deliveryDetail } from "./components/delivery/detail.md"
import { markdown as deliveryItemForm } from "./components/delivery/item-form.md"
import { markdown as reportCustomer } from "./components/report/customer.md"
import { markdown as reportProduct } from "./components/report/product.md"
import { markdown as reportDashboard } from "./components/report/dashboard.md"
import { markdown as aiChat } from "./components/ai/chat.md"
import { markdown as Sidebar } from "./components/sidebar.md"
import { markdown as SidebarDrawer } from "./components/sidebar_drawer.md"
import { markdown as aiContext } from "./components/ai/context.md"
import { markdown as deliveryStore } from "./store/delivery.md"
import { markdown as reportStore } from "./store/report.md"
import { markdown as deliveryPage } from "./pages/delivery.md"
import { markdown as reportPage } from "./pages/report.md"
import { markdown as aiPage } from "./pages/ai.md"

export default `
${app}
${Sidebar}
${SidebarDrawer}
${deliveryForm}
${deliveryTable}
${deliveryDetail}
${deliveryItemForm}

${reportCustomer}
${reportProduct}
${reportDashboard}

${aiChat}
${aiContext}

${deliveryStore}
${reportStore}

${deliveryPage}
${reportPage}
${aiPage}
`

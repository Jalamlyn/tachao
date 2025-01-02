import { markdown as app } from "./app.md"
import { markdown as checkoutPage } from "./checkout-page.md"
import { markdown as orderSummary } from "./components/order-summary.md"
import { markdown as shippingForm } from "./components/shipping-form.md"
import { markdown as paymentForm } from "./components/payment-form.md"
import { markdown as paymentMethodRadio } from "./components/payment-method-radio.md"
import { markdown as store } from "./store.md"
import { markdown as module } from "./module.md"

export const nextui_checkout_complete = `
${app}

${checkoutPage}

${orderSummary}

${shippingForm}

${paymentForm}

${paymentMethodRadio}

${store}

${module}
`
import { useRoutes } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import routes from "./routes"
import RechargeModal from "./components/RechargeModal"

function App() {
  const content = useRoutes(routes)

  return (
    <NextUIProvider>
      <NextThemesProvider attribute='class' defaultTheme='light'>
        {content}
        <RechargeModal />
      </NextThemesProvider>
    </NextUIProvider>
  )
}

export default App
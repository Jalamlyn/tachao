import { NextUIProvider } from "@nextui-org/system"
import { useNavigate } from "react-router-dom"
import useDarkMode from "use-dark-mode"

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const darkMode = useDarkMode(false)
  return (
    <NextUIProvider navigate={navigate}>
      <main className={`${darkMode.value ? "light" : "light"} text-foreground bg-background`}>{children}</main>
    </NextUIProvider>
  )
}

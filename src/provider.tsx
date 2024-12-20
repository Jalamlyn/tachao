import { NextUIProvider } from "@nextui-org/system"
import { useNavigate } from "react-router-dom"
import useDarkMode from "use-dark-mode"
import { queryMyProject } from "./service/apis/project"
import { queryApps } from "./service/apis/app"
import { localDB } from "./utils/localDB"
import { useEffect, useState } from "react"
import { Spinner } from "@nextui-org/react"
import { preloadBabel, preloadTokenizer } from "./utils/moduleLoader"

const preloadModules = async () => {
  let retryCount = 0
  const maxRetries = 3

  const doPreload = async () => {
    try {
      await Promise.all([preloadTokenizer(), preloadBabel()])
      console.log("[Preload] All modules loaded successfully")
    } catch (err) {
      console.error("[Preload] Failed to preload modules:", err)
      if (retryCount < maxRetries) {
        retryCount++
        console.log(`[Preload] Retrying... (${retryCount}/${maxRetries})`)
        return new Promise((resolve) => setTimeout(() => resolve(doPreload()), 1000))
      }
      throw err
    }
  }

  return new Promise((resolve, reject) => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => doPreload().then(resolve).catch(reject))
    } else {
      setTimeout(() => doPreload().then(resolve).catch(reject), 1000)
    }
  })
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const darkMode = useDarkMode(false)
  const [isInit, setIsInit] = useState(false)
  const [modulesLoaded, setModulesLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)

  const checkInitialization = async () => {
    try {
      const appId = localDB.getAppId()
      if (!appId) {
        const projectResponse = await queryMyProject({
          name: "默认企业项目",
        })
        if (projectResponse.data && projectResponse.data.length > 0) {
          const appResponse = await queryApps({
            projectId: projectResponse.data[0].id,
            name: "企业管理平台",
          })
          if (appResponse.data && appResponse.data.length > 0) {
            // debugger
            localDB.setAppId(appResponse.data[0])
            setIsInit(true)
          }
        }
      }
    } catch (error) {
      console.error("Initialization check failed:", error)
    }
  }

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/external-login") {
      return setIsInit(true)
    }
    if (!location.pathname.includes("/login")) {
      checkInitialization()
    } else {
      setIsInit(true)
    }
  }, [])

  useEffect(() => {
    if (isInit) {
      preloadModules()
        .then(() => {
          setModulesLoaded(true)
          // 添加延迟以确保过渡动画完成
          setTimeout(() => {
            setIsTransitioning(false)
          }, 300) // 与CSS过渡时间匹配
        })
        .catch((err) => console.error("Failed to preload modules:", err))
    }
  }, [isInit])

  return (
    <NextUIProvider navigate={navigate}>
      <main className={`${darkMode.value ? "light" : "light"} text-foreground bg-background relative`}>
        <div
          className={`fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col justify-center items-center transition-opacity duration-600 ease-in-out z-50 ${
            isInit && modulesLoaded && !isTransitioning ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className='relative flex flex-col items-center'>
            <h1 className='text-5xl font-bold text-white mb-8 relative'>
              <span className='inline-block animate-pulse'>S</span>
              <span className='inline-block animate-pulse' style={{ animationDelay: "0.1s" }}>
                h
              </span>
              <span className='inline-block animate-pulse' style={{ animationDelay: "0.2s" }}>
                a
              </span>
              <span className='inline-block animate-pulse' style={{ animationDelay: "0.3s" }}>
                t
              </span>
              <span className='inline-block animate-pulse' style={{ animationDelay: "0.4s" }}>
                a
              </span>
              <span className='inline-block animate-pulse' style={{ animationDelay: "0.5s" }}>
                A
              </span>
              <span className='inline-block animate-pulse' style={{ animationDelay: "0.6s" }}>
                I
              </span>
            </h1>
            <div className='absolute -bottom-12'>
              <Spinner
                size='lg'
                classNames={{
                  base: "w-8 h-8",
                  wrapper: "w-8 h-8",
                }}
                color='white'
              />
            </div>
          </div>
        </div>
        <div
          className={`transition-opacity duration-300 ease-in-out ${
            isInit && modulesLoaded && !isTransitioning ? "opacity-100" : "opacity-0"
          }`}
        >
          {isInit && modulesLoaded && !isTransitioning && children}
        </div>
      </main>
    </NextUIProvider>
  )
}

import { NextUIProvider } from "@nextui-org/system"
import { useNavigate } from "react-router-dom"
import useDarkMode from "use-dark-mode"
import { queryMyProject } from "./service/apis/project"
import { queryApps } from "./service/apis/app"
import { localDB } from "./utils/localDB"
import { useEffect, useState } from "react"
import { Spinner } from "@nextui-org/react"
import { preloadBabel, preloadTokenizer } from "./utils/moduleLoader"
import EnterpriseInitializer from "./components/EnterpriseInitializer"
import { getAccount } from "./service/apis/pay"
import { getMetadata } from "./service/apis/metadata"
import { useStore } from "./stores/StoreProvider"
import globalStore from "./globalStore"
import { observer } from "mobx-react-lite"

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

// 计算实际可用余额
const calculateActualBalance = async () => {
  try {
    // 获取账户信息
    const accountRes = await getAccount()
    if (!accountRes?.totalComputePower) {
      return 0
    }

    // 获取费用记录
    const costRecords = await getMetadata(["ai-cost-records"])
    const records = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []
    
    // 计算总费用
    const totalCost = records.reduce((sum, record) => sum + (record.totalCost || 0), 0)
    
    // 计算实际余额
    const actualBalance = accountRes.totalComputePower / 100 - totalCost
    
    return Math.max(0, actualBalance)
  } catch (error) {
    console.error("Error calculating actual balance:", error)
    return 0
  }
}

export const Provider = observer(({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const darkMode = useDarkMode(false)
  const [isInit, setIsInit] = useState(false)
  const [modulesLoaded, setModulesLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [showInitializer, setShowInitializer] = useState(false)
  const { balanceStore } = useStore()

  const handleInitializationSuccess = () => {
    setShowInitializer(false)
    setIsInit(true)
  }

  // 初始化余额
  useEffect(() => {
    const initBalance = async () => {
      const actualBalance = await calculateActualBalance()
      balanceStore.setActualBalance(actualBalance)
      globalStore.actualBalance = actualBalance
    }

    if (isInit && !location.pathname.includes("/login")) {
      initBalance()
    }
  }, [isInit])

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
            localDB.setAppId(appResponse.data[0])
            setIsInit(true)
          } else {
            setShowInitializer(true)
          }
        } else {
          setShowInitializer(true)
        }
      } else {
        setIsInit(true)
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
          setTimeout(() => {
            setIsTransitioning(false)
          }, 300)
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
        <EnterpriseInitializer isOpen={showInitializer} onClose={() => {}} onSuccess={handleInitializationSuccess} />
      </main>
    </NextUIProvider>
  )
})
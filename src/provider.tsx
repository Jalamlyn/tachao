import { NextUIProvider } from "@nextui-org/system"
import useDarkMode from "use-dark-mode"
import { queryMyProject } from "./service/apis/project"
import { queryApps } from "./service/apis/app"
import { localDB } from "./utils/localDB"
import { useEffect, useState } from "react"
import { Spinner } from "@nextui-org/react"
import { preloadBabel, preloadTokenizer } from "./utils/moduleLoader"
import EnterpriseInitializer from "./components/EnterpriseInitializer"
import { getAccount } from "./service/apis/pay"
import { getMetadata, setMetadata } from "./service/apis/metadata"
import { useStore } from "./stores/StoreProvider"
import globalStore from "./globalStore"
import { observer } from "mobx-react-lite"
import { subscriptionService } from "./permissions/utils/permissionUtils"

// 添加新的样式
const loadingAnimationStyles = `
  @font-face {
    font-family: 'Brand Font';
    src: local('PingFang SC'),
         local('Microsoft YaHei'),
         url('/fonts/subset.woff2') format('woff2');
    font-weight: 700;
    font-display: block;
  }

  .brand-reveal {
    font-family: 'Brand Font', -apple-system, "SF Pro SC", "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 3.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: blur(8px);
    animation: revealText 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    text-shadow: 0 0 20px rgba(255,255,255,0.5);
    letter-spacing: 0.05em;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    opacity: 0;
    visibility: hidden;
  }

  .fonts-loaded .brand-reveal {
    opacity: 1;
    visibility: visible;
  }

  @keyframes revealText {
    from {
      filter: blur(8px);
      opacity: 0;
      transform: scale(0.96) translateZ(0);
    }
    to {
      filter: blur(0);
      opacity: 1;
      transform: scale(1) translateZ(0);
    }
  }
`

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
    const accountRes = await getAccount()
    if (!accountRes?.totalComputePower) {
      return 0
    }

    const totalBalance = accountRes.totalComputePower / 100

    const costRecords = await getMetadata(["ai-cost-records"])
    const records = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []

    const totalCost = records.reduce((sum, record) => {
      const cost = typeof record.totalCost === "number" ? record.totalCost : 0
      return sum + cost
    }, 0)

    const actualBalance = totalBalance - totalCost

    try {
      const balanceLogs = await getMetadata(["balance-logs"])
      const existingLogs = balanceLogs?.data[0]?.value ? JSON.parse(balanceLogs.data[0].value) : []

      const newLog = {
        timestamp: new Date().toISOString(),
        totalBalance,
        totalCost,
        actualBalance,
      }

      if (existingLogs.length > 0) {
        const lastLog = existingLogs[existingLogs.length - 1]
        if (lastLog.actualBalance !== newLog.actualBalance) {
          existingLogs.push(newLog)
          await setMetadata("balance-logs", existingLogs)
        }
      } else {
        await setMetadata("balance-logs", [newLog])
      }
    } catch (error) {
      console.error("Error storing balance logs:", error)
    }

    return actualBalance
  } catch (error) {
    console.error("Error calculating actual balance:", error)
    return 0
  }
}

const initializeSubscription = async () => {
  try {
    const subscription = await subscriptionService.getSubscription(globalStore.organizationId)
    if (subscription) {
      const status = await subscriptionService.checkSubscriptionStatus(globalStore.organizationId)
      globalStore.subscription = {
        status: status.status,
        type: subscription.type,
        expireDate: subscription.expireDate,
        features: subscription.features,
      }
    } else {
      globalStore.subscription = {
        status: null,
        type: null,
        expireDate: null,
        features: null,
      }
    }
  } catch (error) {
    console.error("Error initializing subscription:", error)
    globalStore.subscription = {
      status: null,
      type: null,
      expireDate: null,
      features: null,
    }
  }
}

const LoadingText = () => {
  useEffect(() => {
    // 预加载字体
    const preloadFont = async () => {
      if ("fonts" in document) {
        try {
          await document.fonts.load('700 3.5rem "Brand Font"')
          document.documentElement.classList.add("fonts-loaded")
        } catch (err) {
          console.error("Font loading failed:", err)
        }
      }
    }

    preloadFont()
  }, [])

  return <div className='brand-reveal'>即想智能</div>
}

export const Provider = observer(({ children }: { children: React.ReactNode }) => {
  const darkMode = useDarkMode(false)
  const [isInit, setIsInit] = useState(false)
  const [modulesLoaded, setModulesLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [showInitializer, setShowInitializer] = useState(false)
  const [appIdReady, setAppIdReady] = useState(false)
  const { balanceStore } = useStore()

  useEffect(() => {
    // 添加动画样式到head
    const styleSheet = document.createElement("style")
    styleSheet.textContent = loadingAnimationStyles
    document.head.appendChild(styleSheet)

    // 添加字体预加载
    const linkElement = document.createElement("link")
    linkElement.rel = "preload"
    linkElement.href = "/fonts/subset.woff2"
    linkElement.as = "font"
    linkElement.type = "font/woff2"
    linkElement.crossOrigin = "anonymous"
    document.head.appendChild(linkElement)

    return () => {
      document.head.removeChild(styleSheet)
      document.head.removeChild(linkElement)
    }
  }, [])

  const handleInitializationSuccess = () => {
    setShowInitializer(false)
    setIsInit(true)
    setAppIdReady(true)
  }

  useEffect(() => {
    const initializeData = async () => {
      if (isInit && !location.pathname.includes("/login")) {
        const actualBalance = await calculateActualBalance()
        balanceStore.setActualBalance(actualBalance)
        globalStore.actualBalance = actualBalance
        await initializeSubscription()
      }
    }

    initializeData()
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
            setAppIdReady(true)
            setIsInit(true)
          } else {
            setShowInitializer(true)
          }
        } else {
          setShowInitializer(true)
        }
      } else {
        setAppIdReady(true)
        setIsInit(true)
      }
    } catch (error) {
      console.error("Initialization check failed:", error)
      globalStore.subscription = {
        status: null,
        type: null,
        expireDate: null,
        features: null,
      }
    }
  }

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/external-login") {
      setIsInit(true)
      setAppIdReady(true)
      return
    }
    if (!location.pathname.includes("/login")) {
      checkInitialization()
    } else {
      setIsInit(true)
      setAppIdReady(true)
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

  const shouldRenderChildren = () => {
    const isLoginPage = location.pathname.includes("/login")
    const isExternalLoginPage = location.pathname === "/external-login"
    const isRootPath = location.pathname === "/"

    if (isLoginPage || isExternalLoginPage || isRootPath) {
      return isInit && modulesLoaded && !isTransitioning
    }

    return isInit && modulesLoaded && !isTransitioning && appIdReady
  }

  return (
    <NextUIProvider>
      <main className={`${darkMode.value ? "light" : "light"} text-foreground bg-background relative`}>
        <div
          className={`fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col justify-center items-center transition-opacity duration-600 ease-in-out z-50 ${
            shouldRenderChildren() ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className='relative flex flex-col items-center'>
            <LoadingText />
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
            shouldRenderChildren() ? "opacity-100" : "opacity-0"
          }`}
        >
          {shouldRenderChildren() && children}
        </div>
        <EnterpriseInitializer isOpen={showInitializer} onClose={() => {}} onSuccess={handleInitializationSuccess} />
      </main>
    </NextUIProvider>
  )
})

import { NextUIProvider } from "@nextui-org/system"
import useDarkMode from "use-dark-mode"
import { queryMyProject } from "./service/apis/project"
import { queryApps } from "./service/apis/app"
import { localDB } from "./utils/localDB"
import { useEffect, useState } from "react"
import { Image, Spinner } from "@nextui-org/react"
import { preloadBabel, preloadTokenizer } from "./utils/moduleLoader"
import EnterpriseInitializer from "./components/EnterpriseInitializer"
import { getAccount } from "./service/apis/pay"
import { getMetadata, setMetadata } from "./service/apis/metadata"
import { useStore } from "./stores/StoreProvider"
import globalStore from "./globalStore"
import { observer } from "mobx-react-lite"
import { subscriptionService } from "./permissions/utils/permissionUtils"
import { motion } from "framer-motion"

const LogoAnimation = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.h1 
        className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        即想 AI
      </motion.h1>
      <motion.p
        className="text-xl text-purple-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        随时随地实现你的想法
      </motion.p>
    </div>
  )
}

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

export const Provider = observer(({ children }: { children: React.ReactNode }) => {
  const darkMode = useDarkMode(false)
  const [isInit, setIsInit] = useState(false)
  const [modulesLoaded, setModulesLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [showInitializer, setShowInitializer] = useState(false)
  const [appIdReady, setAppIdReady] = useState(false)
  const { balanceStore } = useStore()

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
          }, 500)
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
        <motion.div
          className={`fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col justify-center items-center z-50`}
          initial={{ opacity: 1 }}
          animate={{
            opacity: shouldRenderChildren() ? 0 : 1,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            pointerEvents: shouldRenderChildren() ? "none" : "auto",
          }}
        >
          <div className='relative flex flex-col gap-4 items-center'>
            <LogoAnimation />
            <Spinner size='lg' color='white' />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: shouldRenderChildren() ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {shouldRenderChildren() && children}
        </motion.div>
        <EnterpriseInitializer isOpen={showInitializer} onClose={() => {}} onSuccess={handleInitializationSuccess} />
      </main>
    </NextUIProvider>
  )
})
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

  .brand-container {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .cube-container {
    width: 80px;
    height: 80px;
    perspective: 1000px;
    transform-style: preserve-3d;
    animation: rotate 10s infinite linear;
  }

  .cube {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  .cube-face {
    position: absolute;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
    border: 2px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .front { transform: translateZ(40px); }
  .back { transform: translateZ(-40px) rotateY(180deg); }
  .right { transform: translateX(40px) rotateY(90deg); }
  .left { transform: translateX(-40px) rotateY(-90deg); }
  .top { transform: translateY(-40px) rotateX(90deg); }
  .bottom { transform: translateY(40px) rotateX(-90deg); }

  @keyframes rotate {
    from {
      transform: rotateX(30deg) rotateY(0);
    }
    to {
      transform: rotateX(30deg) rotateY(360deg);
    }
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .brand-name {
    font-family: 'Brand Font', -apple-system, "SF Pro SC", "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    color: #333;
    letter-spacing: 0.05em;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .brand-slogan {
    font-size: 1rem;
    color: #666;
    letter-spacing: 0.1em;
    animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    animation-delay: 100ms;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fonts-loaded .brand-name,
  .fonts-loaded .brand-slogan {
    opacity: 1;
    visibility: visible;
  }
`

const Cube = () => {
  return (
    <div className="cube-container">
      <div className="cube">
        <div className="cube-face front"></div>
        <div className="cube-face back"></div>
        <div className="cube-face right"></div>
        <div className="cube-face left"></div>
        <div className="cube-face top"></div>
        <div className="cube-face bottom"></div>
      </div>
    </div>
  );
};

const LoadingText = () => {
  useEffect(() => {
    const preloadFont = async () => {
      if ('fonts' in document) {
        try {
          await document.fonts.load('900 3.5rem "Brand Font"');
          document.documentElement.classList.add('fonts-loaded');
        } catch (err) {
          console.error('Font loading failed:', err);
        }
      }
    };

    preloadFont();
  }, []);

  return (
    <div className="brand-container">
      <Cube />
      <div className="brand-text">
        <div className="brand-name">即想智能</div>
        <div className="brand-slogan">将你的创意转化为现实代码</div>
      </div>
    </div>
  );
};

// 保持原有的其他代码不变
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
    const linkElement = document.createElement('link');
    linkElement.rel = 'preload';
    linkElement.href = '/fonts/subset.woff2';
    linkElement.as = 'font';
    linkElement.type = 'font/woff2';
    linkElement.crossOrigin = 'anonymous';
    document.head.appendChild(linkElement);

    return () => {
      document.head.removeChild(styleSheet);
      document.head.removeChild(linkElement);
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
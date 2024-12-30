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
@keyframes strokeAnimation {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.stroke-text {
  fill: none;
  stroke: white;
  stroke-width: 2;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.animate-stroke {
  animation: strokeAnimation 2s ease-out forwards;
}

.ji-stroke { animation-delay: 0s; }
.xiang-stroke { animation-delay: 0.5s; }
.zhi-stroke { animation-delay: 1s; }
.neng-stroke { animation-delay: 1.5s; }

.text-glow {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
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

// 其他原有函数保持不变...
const calculateActualBalance = async () => {
  // ... 保持原有代码不变
}

const initializeSubscription = async () => {
  // ... 保持原有代码不变
}

export const Provider = observer(({ children }: { children: React.ReactNode }) => {
  // ... 保持原有状态和函数不变

  return (
    <NextUIProvider>
      <main className={`${darkMode.value ? "light" : "light"} text-foreground bg-background relative`}>
        <div
          className={`fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col justify-center items-center transition-opacity duration-600 ease-in-out z-50 ${
            shouldRenderChildren() ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className='relative flex flex-col items-center'>
            <svg width="200" height="80" viewBox="0 0 200 80" className="text-glow">
              {/* 即 */}
              <path
                d="M40 20 L60 20 M50 20 L50 60 M40 40 L60 40"
                className="stroke-text animate-stroke ji-stroke"
              />
              {/* 想 */}
              <path
                d="M80 20 L100 20 M90 20 L90 60 M80 40 L100 40"
                className="stroke-text animate-stroke xiang-stroke"
              />
              {/* 智 */}
              <path
                d="M120 20 L140 20 M130 20 L130 60 M120 40 L140 40"
                className="stroke-text animate-stroke zhi-stroke"
              />
              {/* 能 */}
              <path
                d="M160 20 L180 20 M170 20 L170 60 M160 40 L180 40"
                className="stroke-text animate-stroke neng-stroke"
              />
            </svg>
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
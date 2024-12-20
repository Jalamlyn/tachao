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
  let retryCount = 0;
  const maxRetries = 3;
  
  const doPreload = async () => {
    try {
      await Promise.all([
        preloadTokenizer(),
        preloadBabel()
      ]);
      console.log("[Preload] All modules loaded successfully");
    } catch (err) {
      console.error("[Preload] Failed to preload modules:", err);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`[Preload] Retrying... (${retryCount}/${maxRetries})`);
        return new Promise(resolve => setTimeout(() => resolve(doPreload()), 1000));
      }
      throw err;
    }
  };

  return new Promise((resolve, reject) => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => doPreload().then(resolve).catch(reject));
    } else {
      setTimeout(() => doPreload().then(resolve).catch(reject), 1000);
    }
  });
};

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const darkMode = useDarkMode(false)
  const [isInit, setIsInit] = useState(false)
  const [modulesLoaded, setModulesLoaded] = useState(false)

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
        .then(() => setModulesLoaded(true))
        .catch(err => console.error("Failed to preload modules:", err));
    }
  }, [isInit])

  return (
    <NextUIProvider navigate={navigate}>
      <main className={`${darkMode.value ? "light" : "light"} text-foreground bg-background`}>
        {isInit && modulesLoaded ? (
          children
        ) : (
          <div className='flex justify-center items-center h-screen'>
            <Spinner label={!isInit ? '应用正在初始化...' : '正在加载必要模块...'}></Spinner>
          </div>
        )}
      </main>
    </NextUIProvider>
  )
}
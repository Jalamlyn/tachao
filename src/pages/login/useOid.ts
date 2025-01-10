import globalStore from "@/globalStore"
import { localDB } from "@/utils/localDB"
import { useState, useEffect } from "react"

export const useOid = (loginData) => {
  const [hasOidParam, setHasOidParam] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const callback = urlParams.get("callback")

    if (callback) {
      try {
        const callbackUrl = new URL(decodeURIComponent(callback))
        const callbackParams = new URLSearchParams(callbackUrl.search)
        const callbackOid = callbackParams.get("oid")
        const pathMatch = callbackUrl.pathname.match(/\/app_(\d+)_(\d+)/)

        // 新的 URL 格式解析
        if (pathMatch) {
          const [, organizationId, appId] = pathMatch
          loginData.current.organizationId = organizationId
          localDB.setAppId({ id: appId, organizationId })
          setHasOidParam(true)
        }
        // 保持原有的 oid 参数解析功能
        else if (callbackOid) {
          loginData.current.organizationId = callbackOid
          globalStore.organizationId = callbackOid
          setHasOidParam(true)
        }
      } catch (error) {
        console.error("Failed to parse callback URL:", error)
      }
    }
  }, [])

  return { hasOidParam }
}

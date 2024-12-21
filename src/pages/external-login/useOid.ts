import React, { useState, useEffect } from "react"

export const useOid = (loginData) => {
  const [hasOidParam, setHasOidParam] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const callback = urlParams.get("callback")

    if (callback) {
      try {
        // 解析 callback URL 中的 oid
        const callbackUrl = new URL(decodeURIComponent(callback))
        const callbackParams = new URLSearchParams(callbackUrl.search)
        const callbackOid = callbackParams.get("oid")

        if (callbackOid) {
          loginData.current.organizationId = callbackOid
          setHasOidParam(true)
        }
      } catch (error) {
        console.error("Failed to parse callback URL:", error)
      }
    }
  }, [])

  return { hasOidParam }
}

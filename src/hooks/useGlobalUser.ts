import { useState, useEffect } from 'react'
import { getCurrentAccountInfo } from '@/service/apis/user'

export interface UserInfo {
  name?: string
  role?: string
  id?: string
  email?: string
  phone?: string
  avatar?: string
  [key: string]: any
}

let globalUserInfo: UserInfo | null = null
let globalSetUserInfo: ((userInfo: UserInfo | null) => void)[] = []

export const useGlobalUser = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(globalUserInfo)
  const [loading, setLoading] = useState<boolean>(!globalUserInfo)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    globalSetUserInfo.push(setUserInfo)
    return () => {
      globalSetUserInfo = globalSetUserInfo.filter(setter => setter !== setUserInfo)
    }
  }, [])

  const updateGlobalUserInfo = (newUserInfo: UserInfo | null) => {
    globalUserInfo = newUserInfo
    globalSetUserInfo.forEach(setter => setter(newUserInfo))
  }

  const fetchUserInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCurrentAccountInfo()
      updateGlobalUserInfo(data)
    } catch (err) {
      setError(err as Error)
      updateGlobalUserInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const clearUserInfo = () => {
    updateGlobalUserInfo(null)
  }

  useEffect(() => {
    if (!globalUserInfo) {
      fetchUserInfo()
    }
  }, [])

  return {
    userInfo,
    loading,
    error,
    refreshUserInfo: fetchUserInfo,
    clearUserInfo
  }
}
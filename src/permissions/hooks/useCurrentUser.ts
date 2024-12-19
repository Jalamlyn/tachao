import { useQuery } from "@tanstack/react-query"
import { getCurrentAccountInfo } from "@/service/apis/user"

export const useCurrentUser = () => {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentAccountInfo,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    cacheTime: 10 * 60 * 1000, // 10分钟后清除缓存
  })

  return {
    user,
    isLoading,
    error,
  }
}

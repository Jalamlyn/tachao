import { context } from "@/lib/context"

const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context

const defaultActivities = await wpm.import("data_activity")

class ActivityDataService {
  static METADATA_KEY = `${appId}_activities`

  async initialize() {
    try {
      api.log.info("开始初始化活动数据")

      const result = await api.getMetadata([ActivityDataService.METADATA_KEY])
      const existingData = result.data?.[0]?.value

      if (!existingData) {
        await api.setMetadata(ActivityDataService.METADATA_KEY, {
          activities: defaultActivities,
          lastUpdated: new Date().toISOString(),
        })

        api.log.info("活动数据初始化成功", {
          activitiesCount: defaultActivities.length,
        })
      } else {
        api.log.info("活动数据已存在，使用现有数据")
      }
    } catch (error) {
      api.log.error("活动数据初始化失败", {
        error: error.message,
      })
      throw error
    }
  }

  async getActivities() {
    try {
      api.log.info("获取活动列表")

      const result = await api.getMetadata([ActivityDataService.METADATA_KEY])
      const data = JSON.parse(result.data?.[0]?.value || '{"activities":[]}')

      if (!Array.isArray(data.activities)) {
        api.log.warn("活动数据格式错误，使用默认数据")
        return defaultActivities
      }

      api.log.info("获取活动列表成功", {
        activitiesCount: data.activities.length,
      })

      return data.activities.length > 0 ? data.activities : defaultActivities
    } catch (error) {
      api.log.error("获取活动列表失败，使用默认数据", {
        error: error.message,
      })
      return defaultActivities
    }
  }

  async getNearbyActivities(location) {
    try {
      api.log.info("获取附近活动", {
        location,
      })

      const activities = await this.getActivities()

      if (!Array.isArray(activities)) {
        api.log.warn("活动数据格式错误，返回默认数据")
        return defaultActivities
      }

      // 暂时返回所有活动，不做距离过滤
      const nearbyActivities = activities.map((activity) => ({
        ...activity,
        distance: this.calculateDistance(
          location.latitude,
          location.longitude,
          activity.location.latitude,
          activity.location.longitude
        ),
      }))

      api.log.info("获取附近活动成功", {
        totalActivities: activities.length,
        nearbyActivities: nearbyActivities.length,
      })

      return nearbyActivities
    } catch (error) {
      api.log.error("获取附近活动失败，返回默认数据", {
        error: error.message,
        location,
      })
      return defaultActivities
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000 // 地球半径（米）
    const phi1 = this.toRadians(lat1)
    const phi2 = this.toRadians(lat2)
    const deltaPhi = this.toRadians(lat2 - lat1)
    const deltaLambda = this.toRadians(lon2 - lon1)

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  toRadians(degrees) {
    return (degrees * Math.PI) / 180
  }
}

const activityDataService = new ActivityDataService()
context.wpm.export("service_activity_data", activityDataService)

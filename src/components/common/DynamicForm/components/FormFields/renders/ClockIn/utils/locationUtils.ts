import { message } from "antd"
import { ClockInLocation } from "../types"

export const getAddressFromLocation = (latitude: number, longitude: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.BMap) {
      reject(new Error("百度地图未加载完成"))
      return message.error("百度地图加载中...")
    }

    const geocoder = new window.BMap.Geocoder()
    const point = new window.BMap.Point(longitude, latitude)

    geocoder.getLocation(point, (result) => {
      if (result) {
        resolve(result.address)
      } else {
        reject("无法解析地址")
      }
    })
  })
}

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("浏览器不支持地理位置功能"))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

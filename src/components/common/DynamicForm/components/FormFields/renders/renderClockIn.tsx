import React, { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/theme/cn"
import message from "@/components/Message"

interface ClockInConfig {
  enableLocation?: boolean
  requireNote?: boolean
  modes?: ("in" | "out")[]
}

interface ClockInData {
  timestamp: string
  type: "in" | "out"
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  note?: string
}

export const renderClockIn = (
  field: FormField & { config?: ClockInConfig },
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null)
  const [locationError, setLocationError] = useState<string>("")

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("您的浏览器不支持地理位置功能")
      return Promise.reject("Geolocation not supported")
    }

    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position)
          resolve(position)
        },
        (error) => {
          let errorMessage = "获取位置信息失败"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "请允许访问位置信息"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "位置信息不可用"
              break
            case error.TIMEOUT:
              errorMessage = "获取位置信息超时"
              break
          }
          setLocationError(errorMessage)
          reject(error)
        }
      )
    })
  }

  const handleClockIn = async (type: "in" | "out") => {
    setIsLoading(true)
    try {
      let location
      if (field.config?.enableLocation) {
        try {
          const position = await getLocation()
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
        } catch (error) {
          console.error("Failed to get location:", error)
          if (field.config.enableLocation) {
            message.error("获取位置信息失败")
            setIsLoading(false)
            return
          }
        }
      }

      const clockInData: ClockInData = {
        timestamp: new Date().toISOString(),
        type,
        ...(location && { location }),
      }

      // 更新表单数据
      const currentValue = form.getValues(field.name) || []
      const newValue = Array.isArray(currentValue) ? [...currentValue, clockInData] : [clockInData]
      
      form.setValue(field.name, newValue)
      onChange?.(field.name, newValue)
      
      message.success(`${type === "in" ? "签到" : "签退"}成功`)
    } catch (error) {
      console.error("Clock in error:", error)
      message.error(`${type === "in" ? "签到" : "签退"}失败`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormFieldWrapper
      name={field.name}
      label={field.label}
      form={form}
      isEditable={isEditable}
      disabled={field.disabled}
      tooltip={field.tooltip}
      required={field.required}
    >
      {(formField) => {
        const records: ClockInData[] = formField.value || []
        const lastRecord = records[records.length - 1]
        const canClockIn = !lastRecord || lastRecord.type === "out"
        const canClockOut = lastRecord?.type === "in"

        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {(!field.config?.modes || field.config.modes.includes("in")) && (
                <Button
                  color="primary"
                  variant="flat"
                  size="lg"
                  isDisabled={!isEditable || !canClockIn || isLoading}
                  isLoading={isLoading}
                  onClick={() => handleClockIn("in")}
                  startContent={!isLoading && <Icon icon="mdi:login" className="w-5 h-5" />}
                  className={cn(
                    "min-w-[120px]",
                    "transition-all duration-300",
                    "hover:scale-105"
                  )}
                >
                  签到
                </Button>
              )}
              
              {(!field.config?.modes || field.config.modes.includes("out")) && (
                <Button
                  color="primary"
                  variant="flat"
                  size="lg"
                  isDisabled={!isEditable || !canClockOut || isLoading}
                  isLoading={isLoading}
                  onClick={() => handleClockIn("out")}
                  startContent={!isLoading && <Icon icon="mdi:logout" className="w-5 h-5" />}
                  className={cn(
                    "min-w-[120px]",
                    "transition-all duration-300",
                    "hover:scale-105"
                  )}
                >
                  签退
                </Button>
              )}
            </div>

            {locationError && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                {locationError}
              </div>
            )}

            <AnimatePresence>
              {records.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-gray-500">打卡记录</div>
                  <div className="space-y-2">
                    {records.map((record, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={cn(
                          "p-3 rounded-lg",
                          "border border-gray-200",
                          "hover:bg-gray-50 transition-colors"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon={record.type === "in" ? "mdi:login" : "mdi:logout"}
                              className={cn(
                                "w-5 h-5",
                                record.type === "in" ? "text-green-500" : "text-blue-500"
                              )}
                            />
                            <span className="font-medium">
                              {record.type === "in" ? "签到" : "签退"}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(new Date(record.timestamp), "yyyy-MM-dd HH:mm:ss")}
                          </span>
                        </div>
                        {record.location && (
                          <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                            <Icon icon="mdi:map-marker" className="w-4 h-4" />
                            <span>
                              {record.location.address ||
                                `${record.location.latitude.toFixed(6)}, ${record.location.longitude.toFixed(
                                  6
                                )}`}
                            </span>
                          </div>
                        )}
                        {record.note && (
                          <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                            <Icon icon="mdi:note-text" className="w-4 h-4" />
                            <span>{record.note}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      }}
    </FormFieldWrapper>
  )
}
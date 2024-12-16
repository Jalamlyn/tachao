import React, { useState } from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import FormFieldWrapper from "../../FormFieldWrapper"
import { getCurrentPosition, getAddressFromLocation } from "../ClockIn/utils/locationUtils"
import { getLocationPermissionGuide } from "../ClockIn/utils/browserUtils"
import type { LocationProps, LocationValue } from "./types"
import { message } from "antd"

export const renderLocation = (
  field: LocationProps,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  return <Location {...field} form={form} isEditable={isEditable} onChange={onChange} />
}

const Location: React.FC<LocationProps> = ({
  name,
  label,
  form,
  isEditable,
  disabled,
  tooltip,
  required,
  onChange,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const value: LocationValue | undefined = form.watch(name)

  const handleGetLocation = async () => {
    setIsLoading(true)
    setError("")

    try {
      const position = await getCurrentPosition()
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }

      const address = await getAddressFromLocation(coordinates.latitude, coordinates.longitude)

      const locationValue: LocationValue = {
        address,
        coordinates,
      }

      form.setValue(name, locationValue)
      onChange?.(name, locationValue)
      message.success("位置获取成功")
    } catch (error: any) {
      let errorMessage = "获取位置信息失败"
      if (error.code === 1) {
        errorMessage = "请允许访问位置信息"
      } else if (error.code === 2) {
        errorMessage = "位置信息不可用"
      } else if (error.code === 3) {
        errorMessage = "获取位置信息超时"
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormFieldWrapper
      name={name}
      label={label}
      form={form}
      isEditable={isEditable}
      disabled={disabled}
      tooltip={tooltip}
      required={required}
    >
      {() => (
        <div className='space-y-4'>
          <Button
            color='primary'
            variant='flat'
            size='lg'
            isDisabled={!isEditable || disabled || isLoading}
            isLoading={isLoading}
            onClick={handleGetLocation}
            startContent={!isLoading && <Icon icon='mdi:map-marker' className='w-5 h-5' />}
            className='min-w-[120px] transition-all duration-300 hover:scale-105'
          >
            {value?.address ? "重新获取位置" : "获取位置"}
          </Button>

          {value?.address && (
            <div className='text-sm text-gray-600 flex items-center gap-2'>
              <Icon icon='mdi:map-marker' className='w-4 h-4' />
              <span>{value.address}</span>
            </div>
          )}

          {error && (
            <div className='text-red-500 text-sm space-y-2'>
              <div className='flex items-center gap-2'>
                <Icon icon='mdi:alert-circle' className='w-4 h-4' />
                {error}
              </div>
              {error === "请允许访问位置信息" && (
                <div className='text-gray-600 text-xs bg-gray-50 p-2 rounded'>
                  <p className='font-medium'>如何允许位置访问：</p>
                  <p>{getLocationPermissionGuide()}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </FormFieldWrapper>
  )
}

export default Location

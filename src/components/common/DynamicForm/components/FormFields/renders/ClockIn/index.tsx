import React, { useState } from "react"
import FormFieldWrapper from "../../FormFieldWrapper"
import { ClockInButtons } from "./components/ClockInButtons"
import { LocationError } from "./components/LocationError"
import { MapModal } from "./components/MapModal"
import { ClockInRecords } from "./components/ClockInRecords"
import { useLocation } from "./hooks/useLocation"
import type { ClockInProps, ClockInRecord, ClockInLocation } from "./types"

export const renderClockIn = (
  field: ClockInProps,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  return <ClockIn {...field} form={form} isEditable={isEditable} onChange={onChange} />
}

const ClockIn: React.FC<ClockInProps> = ({
  name,
  label,
  form,
  isEditable,
  disabled,
  tooltip,
  required,
  config,
  onChange,
}) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<ClockInLocation | null>(null)
  const { currentLocation, error, isLoading, getLocation, clearError } = useLocation()

  const records: ClockInRecord[] = form.watch(name) || []
  const lastRecord = records[records.length - 1]
  const canClockIn = !lastRecord || lastRecord.type === "out"
  const canClockOut = lastRecord?.type === "in"

  const handleClockIn = async (type: "in" | "out") => {
    try {
      let location
      if (config?.enableLocation) {
        location = await getLocation()
      }

      const clockInData: ClockInRecord = {
        timestamp: new Date().toISOString(),
        type,
        ...(location && { location }),
      }

      const newValue = [...records, clockInData]
      form.setValue(name, newValue)
      onChange?.(name, newValue)

      message.success(`${type === "in" ? "签到" : "签退"}成功`)
    } catch (error) {
      console.error("Clock in error:", error)
    }
  }

  const handleLocationClick = (location: ClockInLocation) => {
    setSelectedLocation(location)
    setIsMapModalOpen(true)
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
          <ClockInButtons
            onClockIn={handleClockIn}
            canClockIn={canClockIn}
            canClockOut={canClockOut}
            isEditable={isEditable}
            isLoading={isLoading}
            modes={config?.modes}
          />

          {error && <LocationError error={error} onRetry={getLocation} onClearError={clearError} />}

          <ClockInRecords records={records} onLocationClick={handleLocationClick} />

          <MapModal  isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} location={selectedLocation} />
        </div>
      )}
    </FormFieldWrapper>
  )
}

export default ClockIn

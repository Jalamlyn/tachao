import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react"
import MapComponent from "@/components/reports/MapComponent"
import { ClockInLocation } from "../types"

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
  location: ClockInLocation | null
}

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, location }) => {
  if (!location) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='2xl'>
      <ModalContent>
        <ModalHeader>打卡位置</ModalHeader>
        <ModalBody>
          <MapComponent
            data={[
              {
                name: "打卡位置",
                coordinates: [location.longitude, location.latitude],
                value: 1,
                address: location.address,
              },
            ]}
            center={[location.longitude, location.latitude]}
            zoom={16}
            style={{
              symbolSize: 20,
              pointColor: "#0066ff",
            }}
            containerStyle={{
              height: "400px",
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

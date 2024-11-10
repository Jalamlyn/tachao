import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ButtonGroup,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { PageRenderer } from "@/components/common/DynamicPage"
import type { PageConfig } from "@/components/common/DynamicPage"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  config: PageConfig
  components: Record<string, React.ComponentType<any>>
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  config,
  components
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const deviceIcons = {
    desktop: "mdi:desktop",
    tablet: "mdi:tablet",
    mobile: "mdi:mobile"
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="full"
      classNames={{
        body: "p-0",
        backdrop: "bg-[#000000]/70",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">预览模式</h3>
            <ButtonGroup variant="flat">
              {(Object.keys(deviceIcons) as Array<keyof typeof deviceIcons>).map((d) => (
                <Button
                  key={d}
                  isIconOnly
                  variant={device === d ? "solid" : "flat"}
                  onClick={() => setDevice(d)}
                >
                  <Icon icon={deviceIcons[d]} className="w-5 h-5" />
                </Button>
              ))}
            </ButtonGroup>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={onClose}
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </Button>
        </ModalHeader>
        <ModalBody>
          <div className="min-h-[calc(100vh-200px)] bg-gray-50 p-6">
            <div className={`preview-${device} bg-white shadow-lg mx-auto`}>
              <PageRenderer
                config={config}
                components={components}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            variant="light"
            onPress={onClose}
            startContent={<Icon icon="mdi:arrow-left" />}
          >
            返回编辑
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PreviewModal
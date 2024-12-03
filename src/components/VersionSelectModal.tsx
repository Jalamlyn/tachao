import React from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface VersionSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (useCurrentVersion: boolean) => void
  currentVersionIndex: number
  latestVersionIndex: number
}

const VersionSelectModal: React.FC<VersionSelectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentVersionIndex,
  latestVersionIndex,
}) => {
  const [selectedOption, setSelectedOption] = React.useState<"current" | "latest">("latest")

  const handleConfirm = () => {
    onConfirm(selectedOption === "current")
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:history" className="w-6 h-6" />
            <span>版本选择</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-default-700">
              检测到您正在使用历史版本（版本 {currentVersionIndex + 1}），而最新版本是版本 {latestVersionIndex + 1}。
              请选择要保存的版本：
            </p>
            <RadioGroup
              value={selectedOption}
              onValueChange={(value) => setSelectedOption(value as "current" | "latest")}
            >
              <Radio value="current">
                使用当前版本（版本 {currentVersionIndex + 1}）
              </Radio>
              <Radio value="latest">
                使用最新版本（版本 {latestVersionIndex + 1}）
              </Radio>
            </RadioGroup>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleConfirm}>
            确认
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default VersionSelectModal
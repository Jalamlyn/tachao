import React, { useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@nextui-org/react"
import mermaid from "mermaid"

interface MermaidModalProps {
  isOpen: boolean
  onClose: () => void
  code: string
}

const MermaidModal: React.FC<MermaidModalProps> = ({ isOpen, onClose, code }) => {
  useEffect(() => {
    if (isOpen && code) {
      // 配置 mermaid
      mermaid.initialize({
        startOnLoad: true,
        theme: "default",
        securityLevel: "loose",
        themeVariables: {
          fontFamily: "system-ui, sans-serif",
        },
      })

      // 清除之前的内容
      const container = document.querySelector(".mermaid-modal-content")
      if (container) {
        container.innerHTML = code
      }

      // 渲染图表
      mermaid.run({
        querySelector: ".mermaid-modal-content",
      }).catch((error) => {
        console.error("Mermaid rendering error:", error)
        if (container) {
          container.innerHTML = "图表渲染失败，请检查语法是否正确。"
        }
      })
    }
  }, [isOpen, code])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-background",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">图表预览</ModalHeader>
        <ModalBody className="py-6">
          <div className="mermaid-modal-content w-full flex justify-center" />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default MermaidModal
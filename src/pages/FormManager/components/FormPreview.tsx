import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import DynamicForm from "@/components/common/DynamicForm";
import type { DynamicFormConfig } from "@/components/common/DynamicForm/types";
import message from "@/components/Message";

interface FormPreviewProps {
  config: DynamicFormConfig | null;
}

const deviceSizes = {
  pc: { width: "100%", maxWidth: "1200px" },
  pad: { width: "768px" },
  mobile: { width: "375px" }
};

const FormPreview: React.FC<FormPreviewProps> = ({ config }) => {
  const [selectedDevice, setSelectedDevice] = useState<keyof typeof deviceSizes>("pc");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const shareLink = `${window.location.origin}/form-preview/${config?.id || ""}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      message.success("链接已复制到剪贴板");
    } catch (err) {
      message.error("复制失败，请手动复制");
    }
  };

  const renderDeviceButtons = () => (
    <div className="flex gap-2 mb-4">
      <Button
        isIconOnly
        variant={selectedDevice === "pc" ? "solid" : "light"}
        onClick={() => setSelectedDevice("pc")}
      >
        <Icon icon="mdi:desktop" className="w-5 h-5" />
      </Button>
      <Button
        isIconOnly
        variant={selectedDevice === "pad" ? "solid" : "light"}
        onClick={() => setSelectedDevice("pad")}
      >
        <Icon icon="mdi:tablet" className="w-5 h-5" />
      </Button>
      <Button
        isIconOnly
        variant={selectedDevice === "mobile" ? "solid" : "light"}
        onClick={() => setSelectedDevice("mobile")}
      >
        <Icon icon="mdi:cellphone" className="w-5 h-5" />
      </Button>
      <Button
        isIconOnly
        variant="light"
        onClick={onOpen}
      >
        <Icon icon="mdi:share" className="w-5 h-5" />
      </Button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center"
    >
      {config ? (
        <>
          {renderDeviceButtons()}
          <div 
            style={{ 
              width: deviceSizes[selectedDevice].width,
              maxWidth: deviceSizes[selectedDevice].maxWidth,
              transition: "width 0.3s ease"
            }}
            className="border rounded-lg p-6 mx-auto"
          >
            <DynamicForm config={config} />
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Icon icon="mdi:form" className="w-12 h-12 mx-auto mb-4" />
          <p>请先生成或选择一个表单模板</p>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>分享表单</ModalHeader>
          <ModalBody>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 p-2 border rounded"
              />
              <Button color="primary" onClick={handleCopyLink}>
                <Icon icon="mdi:content-copy" className="w-4 h-4 mr-1" />
                复制
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};

export default FormPreview;
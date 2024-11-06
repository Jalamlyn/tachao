import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from "@nextui-org/react";
import { useParams } from "react-router-dom";
import DynamicForm from "@/components/common/DynamicForm";
import type { DynamicFormConfig } from "@/components/common/DynamicForm/types";
import message from "@/components/Message";
import { useMetadata } from "@/components/from-templates/hook/useMetadata";

interface FormPreviewProps {
  config: DynamicFormConfig | null;
}

const deviceSizes = {
  pc: { width: "100%", maxWidth: "1200px" },
  pad: { width: "768px" },
  mobile: { width: "375px" }
};

const FormPreview: React.FC<FormPreviewProps> = ({ config: propConfig }) => {
  const [selectedDevice, setSelectedDevice] = useState<keyof typeof deviceSizes>("pc");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedConfig, setLoadedConfig] = useState<DynamicFormConfig | null>(null);
  const { formId } = useParams<{ formId: string }>();
  const { getDetail } = useMetadata<{ config: DynamicFormConfig }>("template");

  // 使用 URL 参数加载表单配置
  useEffect(() => {
    const loadFormConfig = async () => {
      // 如果有传入的配置，优先使用传入的配置
      if (propConfig) {
        setLoadedConfig(propConfig);
        return;
      }

      // 如果有 formId，尝试加载配置
      if (formId) {
        setIsLoading(true);
        setError(null);
        try {
          const result = await getDetail(formId);
          if (result && result.data.config) {
            setLoadedConfig(result.data.config);
          } else {
            setError("未找到表单配置");
          }
        } catch (err) {
          console.error("加载表单配置失败:", err);
          setError("加载表单配置失败");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadFormConfig();
  }, [formId, propConfig, getDetail]);

  // 使用合并后的配置（优先使用 props 传入的配置）
  const config = propConfig || loadedConfig;
  const shareLink = `${window.location.origin}/we-chat-app/admin/form-preview/${config?.id || ""}`;

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner label="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-danger">
        <Icon icon="mdi:alert-circle" className="w-12 h-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

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
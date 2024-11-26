import React, { useState, useRef } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import message from "@/components/Message";

interface PDFUploadProps {
  onSuccess: (data: any) => void;
  onError: (error: Error) => void;
}

const PDFUploadButton: React.FC<PDFUploadProps> = ({
  onSuccess,
  onError
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      try {
        setAnalyzing(true);
        // 模拟分析PDF页数
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPageCount(Math.floor(Math.random() * 100) + 1); // 模拟页数
      } catch (error) {
        onError(error as Error);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      message.error("请选择文件");
      return;
    }
    try {
      // 模拟上传
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess({ file, pageCount });
      onClose();
      setFile(null);
      setPageCount(null);
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <>
      <Button 
        onClick={onOpen}
        color="primary"
        startContent={<Icon icon="mdi:file-pdf" />}
      >
        上传PDF文档
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">上传PDF文档</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-lg appearance-none cursor-pointer hover:border-primary focus:outline-none"
              >
                {file ? (
                  <span className="flex items-center space-x-2">
                    <Icon icon="mdi:file-pdf" className="w-6 h-6 text-danger" />
                    <span className="font-medium text-gray-600">{file.name}</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Icon icon="mdi:upload" className="w-6 h-6 text-gray-600" />
                    <span className="font-medium text-gray-600">点击选择或拖拽文件到这里</span>
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="sr-only"
                onChange={handleFileSelect}
              />

              {analyzing && (
                <div className="text-center py-4">
                  <Icon icon="eos-icons:loading" className="w-6 h-6 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-gray-500">正在分析PDF文档...</p>
                </div>
              )}

              {pageCount !== null && (
                <div className="mt-4 p-4 border rounded-lg bg-default-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">总页数</span>
                    <span className="text-lg font-bold text-primary">{pageCount}</span>
                  </div>
                </div>
              )}

              <Input
                type="text"
                label="文档描述"
                placeholder="请输入文档描述（选填）"
                variant="bordered"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              取消
            </Button>
            <Button color="primary" onPress={handleUpload} isDisabled={!file}>
              上传
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PDFUploadButton;
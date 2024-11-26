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
  Chip,
  Textarea,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState("");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      try {
        setAnalyzing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPageCount(Math.floor(Math.random() * 100) + 1);
      } catch (error) {
        onError(error as Error);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith('.pdf')) {
        message.error('请上传PDF文档(.pdf)');
        return;
      }
      setFile(droppedFile);
      try {
        setAnalyzing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPageCount(Math.floor(Math.random() * 100) + 1);
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess({ file, pageCount, description });
      onClose();
      setFile(null);
      setPageCount(null);
      setDescription("");
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <>
      <Button 
        onClick={onOpen}
        color="primary"
        startContent={<Icon icon="mdi:file-pdf" className="text-xl" />}
        className="bg-red-600 hover:bg-red-700 transition-all duration-200"
        size="lg"
      >
        上传PDF文档
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        classNames={{
          base: "bg-background",
          header: "border-b-1 border-default-200",
          body: "py-6",
          footer: "border-t-1 border-default-200",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:file-pdf" className="text-red-600 text-2xl" />
              <span className="text-xl font-semibold">上传PDF文档</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    flex flex-col items-center justify-center w-full h-40 
                    px-4 transition-all duration-200 bg-default-50 
                    border-2 border-dashed rounded-xl cursor-pointer
                    ${isDragging ? 'border-primary bg-primary/10' : 'border-default-300'}
                    hover:border-primary hover:bg-primary/5
                  `}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="mdi:file-pdf" className="w-12 h-12 text-red-600" />
                      <span className="font-medium text-default-700">{file.name}</span>
                      <Chip size="sm" color="primary" variant="flat">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Chip>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="mdi:upload" className="w-12 h-12 text-default-400" />
                      <span className="font-medium text-default-600">点击选择或拖拽文件到这里</span>
                      <span className="text-sm text-default-400">支持 .pdf 格式</span>
                    </div>
                  )}
                </div>
              </motion.div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="sr-only"
                onChange={handleFileSelect}
              />

              <AnimatePresence>
                {analyzing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-center py-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon icon="eos-icons:loading" className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm text-default-600">正在分析PDF文档...</span>
                    </div>
                  </motion.div>
                )}

                {pageCount !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-default-200 bg-default-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-default-700">文档信息</span>
                      <Chip size="sm" variant="flat" color="primary">
                        {pageCount} 页
                      </Chip>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <Textarea
                  label="文档描述"
                  placeholder="请输入文档描述（选填）"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="bordered"
                  classNames={{
                    label: "text-default-700",
                    input: "resize-none",
                  }}
                  minRows={3}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              variant="light" 
              onPress={onClose}
              className="font-medium"
            >
              取消
            </Button>
            <Button 
              color="primary"
              onPress={handleUpload} 
              isDisabled={!file}
              className="font-medium bg-red-600 hover:bg-red-700"
              startContent={<Icon icon="mdi:upload" />}
            >
              上传
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PDFUploadButton;
import React, { useState, useRef } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import message from "@/components/Message";

interface WordUploadProps {
  onSuccess: (data: any) => void;
  onError: (error: Error) => void;
}

const WordUploadButton: React.FC<WordUploadProps> = ({
  onSuccess,
  onError
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [extractingToc, setExtractingToc] = useState(false);
  const [tocData, setTocData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      try {
        setExtractingToc(true);
        // 这里模拟提取目录
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTocData({
          chapters: [
            { title: "第一章", page: 1 },
            { title: "第二章", page: 10 },
          ]
        });
      } catch (error) {
        onError(error as Error);
      } finally {
        setExtractingToc(false);
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
      onSuccess({ file, tocData });
      onClose();
      setFile(null);
      setTocData(null);
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <>
      <Button 
        onClick={onOpen}
        color="primary"
        startContent={<Icon icon="mdi:file-word" />}
      >
        上传Word文档
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">上传Word文档</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-lg appearance-none cursor-pointer hover:border-primary focus:outline-none"
              >
                {file ? (
                  <span className="flex items-center space-x-2">
                    <Icon icon="mdi:file-word" className="w-6 h-6 text-primary" />
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
                accept=".docx,.doc"
                className="sr-only"
                onChange={handleFileSelect}
              />

              {extractingToc && (
                <div className="text-center py-4">
                  <Icon icon="eos-icons:loading" className="w-6 h-6 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-gray-500">正在提取文档信息...</p>
                </div>
              )}

              {tocData && (
                <div className="mt-4 p-4 border rounded-lg bg-default-50">
                  <h3 className="text-lg font-medium mb-2">文档目录</h3>
                  <div className="space-y-2">
                    {tocData.chapters.map((chapter: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{chapter.title}</span>
                        <span className="text-gray-500">第 {chapter.page} 页</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Checkbox defaultSelected>提取目录</Checkbox>
                <Checkbox defaultSelected>包含页眉页脚</Checkbox>
              </div>
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

export default WordUploadButton;
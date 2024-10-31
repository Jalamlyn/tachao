import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Loader2 } from "lucide-react";
import { message } from "../Message";
import { localDB } from "@/utils/localDB";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ value, onChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      await handleUpload(selectedFile);
    }
  };

  const handleUpload = async (selectedFile: File) => {
    if (!selectedFile) {
      message.warning("请先选择文件");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      // 检查文件是否为图片
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === "string") {
            onChange(e.target.result);
            localDB.setItem("avatarUrl", e.target.result); // 存储到 localDB
            message.success("图片上传成功");
          }
        };
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentCompleted = Math.round((e.loaded * 100) / e.total);
            setProgress(percentCompleted);
          }
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // 如果不是图片，可以在这里添加其他处理逻辑
        message.error("请上传图片文件");
        setFile(null);
      }
    } catch (error) {
      message.error("文件上传失败，请重试！");
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onChange("");
    localDB.removeItem("avatarUrl"); // 从 localDB 移除
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        ref={fileInputRef}
      />
      <Button onClick={handleButtonClick} disabled={uploading} type="button" variant="outline">
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />上传中
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />上传
          </>
        )}
      </Button>
      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500">上传进度: {progress}%</p>
        </div>
      )}
      {value && (
        <div className="relative">
          <img src={value} alt="已上传的图片" className="max-w-full h-auto rounded-lg" />
          <button
            onClick={handleRemoveFile}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

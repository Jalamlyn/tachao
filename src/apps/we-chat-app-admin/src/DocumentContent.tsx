import React, { useCallback } from "react";
import { Button } from "@nextui-org/react";

const DocumentContent: React.FC = () => {
  const handleCreateDocument = useCallback(() => {
    window.open("http://localhost:8081/forms/create", "_blank");
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">单据内容</h2>
        <Button color="primary" onClick={handleCreateDocument}>创建单据</Button>
      </div>
      <p>这里是单据内容的列表或详细信息。</p>
    </div>
  );
};

export default DocumentContent;
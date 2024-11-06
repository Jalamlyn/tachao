import React from "react";
import { Button } from "@nextui-org/react";

const ReportContent: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">报表内容</h2>
        <Button color="primary">创建报表</Button>
      </div>
      <p>这里是报表内容的列表或详细信息。</p>
    </div>
  );
};

export default ReportContent;
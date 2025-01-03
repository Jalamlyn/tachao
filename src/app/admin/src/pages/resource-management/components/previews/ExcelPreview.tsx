import React from 'react';
import { Card, CardBody } from "@nextui-org/react";

interface ExcelPreviewProps {
  data: any;
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({ data }) => {
  return (
    <Card>
      <CardBody>
        <div className="text-center p-4">
          <p className="text-default-500">Excel预览组件</p>
          <p className="text-sm text-default-400">待实现</p>
        </div>
      </CardBody>
    </Card>
  );
};

export default ExcelPreview;
import React from 'react';
import { Card, CardBody } from "@nextui-org/react";

interface WordPreviewProps {
  data: any;
}

const WordPreview: React.FC<WordPreviewProps> = ({ data }) => {
  return (
    <Card>
      <CardBody>
        <div className="text-center p-4">
          <p className="text-default-500">Word预览组件</p>
          <p className="text-sm text-default-400">待实现</p>
        </div>
      </CardBody>
    </Card>
  );
};

export default WordPreview;
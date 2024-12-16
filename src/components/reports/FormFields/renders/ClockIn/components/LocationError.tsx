import React from "react";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { getLocationPermissionGuide } from "../utils/browserUtils";

interface LocationErrorProps {
  error: string;
  onRetry: () => void;
  onClearError: () => void;
}

export const LocationError: React.FC<LocationErrorProps> = ({
  error,
  onRetry,
  onClearError
}) => {
  const isPermissionError = error === "请允许访问位置信息";

  return (
    <div className="text-red-500 text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Icon icon="mdi:alert-circle" className="w-4 h-4" />
        {error}
      </div>
      {isPermissionError && (
        <div className="text-gray-600 text-xs bg-gray-50 p-2 rounded">
          <p className="font-medium">如何允许位置访问：</p>
          <p>{getLocationPermissionGuide()}</p>
        </div>
      )}
      <Button
        size="sm"
        variant="flat"
        color="primary"
        onClick={() => {
          onClearError();
          onRetry();
        }}
      >
        重新获取位置
      </Button>
    </div>
  );
};
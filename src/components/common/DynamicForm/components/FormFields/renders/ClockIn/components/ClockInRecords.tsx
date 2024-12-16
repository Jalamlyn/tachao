import React from "react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/theme/cn";
import type { ClockInRecord } from "../types";

interface ClockInRecordsProps {
  records: ClockInRecord[];
  onLocationClick: (location: NonNullable<ClockInRecord["location"]>) => void;
}

export const ClockInRecords: React.FC<ClockInRecordsProps> = ({
  records,
  onLocationClick
}) => {
  if (records.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-2"
      >
        <div className="text-sm font-medium text-gray-500">打卡记录</div>
        <div className="space-y-2">
          {records.map((record, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "p-3 rounded-lg",
                "border border-gray-200",
                "hover:bg-gray-50 transition-colors"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    icon={record.type === "in" ? "mdi:login" : "mdi:logout"}
                    className={cn(
                      "w-5 h-5",
                      record.type === "in" ? "text-green-500" : "text-blue-500"
                    )}
                  />
                  <span className="font-medium">
                    {record.type === "in" ? "签到" : "签退"}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(record.timestamp), "yyyy-MM-dd HH:mm:ss")}
                </span>
              </div>
              {record.location && (
                <div
                  className="mt-2 text-sm text-gray-500 flex items-center gap-2 cursor-pointer hover:text-primary"
                  onClick={() => onLocationClick(record.location!)}
                >
                  <Icon icon="mdi:map-marker" className="w-4 h-4" />
                  <span>
                    {record.location.address ||
                      `${record.location.latitude.toFixed(6)}, ${record.location.longitude.toFixed(6)}`}
                  </span>
                </div>
              )}
              {record.note && (
                <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                  <Icon icon="mdi:note-text" className="w-4 h-4" />
                  <span>{record.note}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
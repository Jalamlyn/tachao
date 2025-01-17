import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Card, ScrollShadow, Chip, Divider, Tooltip, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { requestStore, RequestRecord } from "./RequestStore"
import { motion, AnimatePresence } from "framer-motion"

const RequestView: React.FC = observer(() => {
  const [selectedRequest, setSelectedRequest] = useState<RequestRecord | null>(null)

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2)
    } catch (error) {
      return String(data)
    }
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex-1 flex gap-4">
        {/* 请求列表 */}
        <div className="w-1/2 overflow-hidden">
          <ScrollShadow className="h-full">
            <div className="space-y-2 p-2">
              <AnimatePresence mode="popLayout">
                {requestStore.latestRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      key={request.id}
                      className={`p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                        selectedRequest?.id === request.id 
                          ? "bg-primary-50 border-primary" 
                          : "hover:bg-default-100"
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Chip
                            size="sm"
                            color={request.method === "GET" ? "primary" : "success"}
                            startContent={
                              <Icon 
                                icon={request.method === "GET" ? "mdi:download" : "mdi:upload"} 
                                className="w-3 h-3"
                              />
                            }
                          >
                            {request.method}
                          </Chip>
                          <span className="text-small text-default-500">
                            {formatTime(request.timestamp)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRequest(request)
                          }}
                        >
                          <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mt-2">
                        <div className="flex flex-col gap-1">
                          <div className="text-small font-medium">Names:</div>
                          <Tooltip
                            content={
                              <div className="max-w-[400px] whitespace-pre-wrap">
                                {request.method === "GET" 
                                  ? request.params.names.join(", ")
                                  : request.params.name}
                              </div>
                            }
                            placement="bottom"
                          >
                            <div className="text-small text-default-600 truncate">
                              {request.method === "GET"
                                ? truncateText(request.params.names.join(", "))
                                : truncateText(request.params.name)}
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollShadow>
        </div>

        {/* 请求详情 */}
        <div className="w-1/2 overflow-hidden">
          <ScrollShadow className="h-full">
            <AnimatePresence mode="wait">
              {selectedRequest ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-small font-medium">Request Details</h3>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={selectedRequest.method === "GET" ? "primary" : "success"}
                      >
                        {formatTime(selectedRequest.timestamp)}
                      </Chip>
                    </div>
                    <Card className="bg-default-50">
                      <pre className="p-3 rounded-lg text-small overflow-auto max-h-[200px]">
                        {formatJson(selectedRequest.params)}
                      </pre>
                    </Card>
                  </div>
                  <Divider />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-small font-medium">Response</h3>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<Icon icon="mdi:content-copy" className="w-4 h-4" />}
                        onClick={() => {
                          navigator.clipboard.writeText(formatJson(selectedRequest.response))
                          // 可以添加复制成功的提示
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <Card className="bg-default-50">
                      <pre className="p-3 rounded-lg text-small overflow-auto max-h-[300px]">
                        {formatJson(selectedRequest.response)}
                      </pre>
                    </Card>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-default-400"
                >
                  <Icon icon="solar:box-minimalistic-broken" className="w-12 h-12 mb-2 opacity-50" />
                  <p>Select a request to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollShadow>
        </div>
      </div>
    </div>
  )
})

export default RequestView
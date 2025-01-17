import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Card, ScrollShadow, Chip, Divider } from "@nextui-org/react"
import { requestStore, RequestRecord } from "./RequestStore"

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

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex-1 flex gap-4">
        {/* 请求列表 */}
        <div className="w-1/2 overflow-hidden">
          <ScrollShadow className="h-full">
            <div className="space-y-2 p-2">
              {requestStore.latestRequests.map((request) => (
                <Card
                  key={request.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedRequest?.id === request.id ? "bg-primary-50" : ""
                  }`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color={request.method === "GET" ? "primary" : "success"}
                    >
                      {request.method}
                    </Chip>
                    <span className="text-small text-default-500">
                      {formatTime(request.timestamp)}
                    </span>
                  </div>
                  <div className="mt-2 text-small">
                    {request.method === "GET" ? (
                      <div>Names: {request.params.names.join(", ")}</div>
                    ) : (
                      <div>Name: {request.params.name}</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollShadow>
        </div>

        {/* 请求详情 */}
        <div className="w-1/2 overflow-hidden">
          <ScrollShadow className="h-full">
            {selectedRequest ? (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-small font-medium mb-2">Request</h3>
                  <pre className="bg-default-50 p-3 rounded-lg text-small overflow-auto">
                    {formatJson(selectedRequest.params)}
                  </pre>
                </div>
                <Divider />
                <div>
                  <h3 className="text-small font-medium mb-2">Response</h3>
                  <pre className="bg-default-50 p-3 rounded-lg text-small overflow-auto">
                    {formatJson(selectedRequest.response)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-default-400">
                Select a request to view details
              </div>
            )}
          </ScrollShadow>
        </div>
      </div>
    </div>
  )
})

export default RequestView
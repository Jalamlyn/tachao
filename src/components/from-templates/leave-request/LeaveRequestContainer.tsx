import React from "react"
import DynamicForm from "../../common/DynamicForm"
import { leaveRequestConfig } from "./config"

const LeaveRequestContainer: React.FC = () => {
  const handleSubmit = async (values: any) => {
    console.log("提交请假单:", values)
    // TODO: 实现提交逻辑
  }

  const handleValuesChange = (changedValues: any, allValues: any) => {
    console.log("表单值变化:", changedValues, allValues)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">请假申请单</h1>
      <DynamicForm
        config={leaveRequestConfig}
        onSubmit={handleSubmit}
        onValuesChange={handleValuesChange}
      />
    </div>
  )
}

export default LeaveRequestContainer
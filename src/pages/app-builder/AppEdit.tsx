import React from "react"
import { useParams } from "react-router-dom"

const AppBuilder: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">应用构建器</h1>
      <p>正在构建应用: {appId}</p>
    </div>
  )
}

export default AppBuilder
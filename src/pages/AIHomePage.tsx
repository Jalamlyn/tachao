import React from "react"
import { Outlet } from "react-router-dom"

const AIHomePage: React.FC = () => {
  return (
    <div className='min-h-screen relative bg-gradient-to-b from-primary-dark to-primary-light p-2'>
      <Outlet />
    </div>
  )
}

export default AIHomePage

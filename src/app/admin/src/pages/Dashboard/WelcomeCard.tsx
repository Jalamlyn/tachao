import React, { useEffect, useState } from "react"
import { Card, CardBody, Button, Image } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useGlobalUser } from "@/hooks/useGlobalUser"
import welcome from "./welcome.png"

const WelcomeCard = ({ appsCount, setShowProductManager }) => {
  const navigate = useNavigate()
  const { userInfo } = useGlobalUser()
  const isAdmin = userInfo?.role === "admin"

  if (appsCount === 0) {
    return (
      <Card className="bg-gradient-to-r from-primary-900 to-primary-700 text-white overflow-hidden">
        <CardBody className="p-8 relative">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-2 bg-white/10 rounded-full">
                  <span className="text-xl">👋</span>
                </motion.div>
                <h1 className="text-3xl font-bold">欢迎开启您的数字化之旅</h1>
              </div>
              <p className="text-white/80 text-lg mb-6">
                {isAdmin
                  ? "让我们从创建第一个应用开始，AI产品经理将帮助您梳理需求"
                  : "让我们开始创建您的第一个应用吧"}
              </p>
              <div className="flex items-center gap-4">
                <Button
                  className="bg-white text-primary-900 font-medium"
                  size="lg"
                  startContent={<Icon icon="solar:rocket-linear" />}
                  onPress={() => navigate("/admin/apps")}
                >
                  开始创建应用
                </Button>
                {isAdmin && (
                  <Button
                    className="bg-white/10 text-white font-medium"
                    size="lg"
                    variant="flat"
                    startContent={<Icon icon="solar:user-speak-rounded-linear" />}
                    onPress={() => setShowProductManager(true)}
                  >
                    咨询 AI 产品经理
                  </Button>
                )}
              </div>
            </div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block">
              <Image src={welcome} className="w-64" />
            </motion.div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <Icon icon="solar:cube-linear" className="w-32 h-32" />
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-primary-900 to-primary-700 text-white overflow-hidden rounded-lg">
      <CardBody className="p-8 relative">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold mb-3">欢迎回来 👋</h1>
            <p className="text-white/80 text-lg">
              {isAdmin ? "这里是您的工作台概览" : "开始您今天的应用开发之旅吧"}
            </p>
          </div>
          <Button
            startContent={<Icon icon="solar:rocket-linear" className="text-xl" />}
            onPress={() => navigate("/admin/apps")}
            className="bg-white text-primary-900"
          >
            创建应用
          </Button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
          <Icon icon="solar:cube-linear" className="w-32 h-32" />
        </div>
      </CardBody>
    </Card>
  )
}

export default WelcomeCard
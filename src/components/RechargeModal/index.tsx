import React, { useState, useEffect } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ButtonGroup,
  Tabs,
  Tab,
  Card,
  CardBody,
  Chip,
} from "@nextui-org/react"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { products, orders, pagePay } from "@/service/apis/pay"
import { Icon } from "@iconify/react"
import { subscriptionService } from "@/permissions/utils/permissionUtils"
import message from "@/components/Message"

const SUBSCRIPTION_PLANS = {
  personal: {
    type: "personal",
    name: "个人版",
    price: 19.9,
    features: {
      adminAccount: true,
      nbAccountLimit: 0,
      wbAccountLimit: -1,
      tokenAmount: 10,
    },
    description: [
      "1个管理员账号",
      "不限数量外部账号",
      "10个塔币",
      "基础AI功能",
    ],
  },
  enterprise: {
    type: "enterprise",
    name: "企业版",
    price: 199,
    features: {
      adminAccount: true,
      nbAccountLimit: 4,
      wbAccountLimit: -1,
      tokenAmount: 100,
    },
    description: [
      "1个管理员账号",
      "4个内部账号",
      "不限数量外部账号",
      "100个塔币",
      "完整AI功能",
    ],
  },
}

const RechargeModal = observer(() => {
  const { balanceStore } = useStore()
  const [productList, setProductList] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(9.9)
  const [paymentForm, setPaymentForm] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState("token")
  const [selectedPlan, setSelectedPlan] = useState(null)

  // 快速选择金额选项
  const quickSelectAmounts = [19.9, 49.9, 99.9]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await products()
      setProductList(res.data)
      if (res.data.length > 0) {
        setSelectedProduct(res.data[0])
      }
    } catch (error) {
      console.error("获取产品列表失败:", error)
    }
  }

  const handlePay = async () => {
    if (selectedTab === "token") {
      await handleTokenPay()
    } else {
      await handleSubscriptionPay()
    }
  }

  const handleTokenPay = async () => {
    if (!selectedProduct) {
      console.error("请选择一个产品")
      return
    }

    try {
      const orderDataRes = await orders({
        productId: selectedProduct.id,
        quantity,
        paymentMethod: "ALIPAY",
      })
      const payDataRes = await pagePay({
        orderId: orderDataRes.id,
        returnUrl: window.location.href,
      })
      setPaymentForm(payDataRes)
      balanceStore.hideRechargeModal()
      setIsPaymentModalOpen(true)
    } catch (error) {
      console.error("创建订单或发起支付失败:", error)
    }
  }

  const handleSubscriptionPay = async () => {
    if (!selectedPlan) {
      message.error("请选择套餐")
      return
    }

    try {
      // 创建订阅订单
      const orderDataRes = await orders({
        productId: selectedPlan.type,
        quantity: 1,
        paymentMethod: "ALIPAY",
        metadata: {
          type: "subscription",
          plan: selectedPlan.type,
        },
      })

      // 获取支付表单
      const payDataRes = await pagePay({
        orderId: orderDataRes.id,
        returnUrl: window.location.href,
      })

      // 更新订阅信息
      const startDate = new Date()
      const expireDate = new Date()
      expireDate.setMonth(expireDate.getMonth() + 1)

      await subscriptionService.updateSubscription(balanceStore.organizationId, {
        organizationId: balanceStore.organizationId,
        type: selectedPlan.type,
        status: "active",
        startDate: startDate.toISOString(),
        expireDate: expireDate.toISOString(),
        features: selectedPlan.features,
        price: selectedPlan.price,
      })

      setPaymentForm(payDataRes)
      balanceStore.hideRechargeModal()
      setIsPaymentModalOpen(true)
    } catch (error) {
      console.error("创建订阅订单失败:", error)
      message.error("创建订阅失败")
    }
  }

  const handleQuickSelect = (amount) => {
    setQuantity(amount)
  }

  const renderTokenTab = () => (
    <div className="space-y-4">
      {productList.map((product) => (
        <div
          key={product.id}
          className={`p-4 rounded-lg cursor-pointer border ${
            selectedProduct?.id === product.id ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onClick={() => setSelectedProduct(product)}
        >
          <span className="font-medium text-default-700">塔币 / 1元</span>
        </div>
      ))}
      <div className="flex flex-col gap-4">
        <div className="font-medium">快速选择金额:</div>
        <ButtonGroup>
          {quickSelectAmounts.map((amount) => (
            <Button
              key={amount}
              variant={quantity === amount ? "solid" : "flat"}
              color={quantity === amount ? "primary" : "default"}
              onClick={() => handleQuickSelect(amount)}
            >
              {amount}塔币
            </Button>
          ))}
        </ButtonGroup>
        <div className="flex items-center gap-2">
          <span className="font-medium">自定义数量: </span>
          <Input
            type="number"
            min={9.9}
            step={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-default-500">塔币</span>
        </div>
      </div>
      <div className="text-right text-default-700 font-medium">
        总价: {selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : "0.00"} 元
      </div>
    </div>
  )

  const renderSubscriptionTab = () => (
    <div className="grid md:grid-cols-2 gap-4">
      {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
        <Card
          key={plan.type}
          isPressable
          isHoverable
          className={selectedPlan?.type === plan.type ? "border-primary" : ""}
          onPress={() => setSelectedPlan(plan)}
        >
          <CardBody className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <Chip color="primary" variant="flat">
                ¥{plan.price}/月
              </Chip>
            </div>
            <div className="space-y-2">
              {plan.description.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-bold-duotone" className="text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )

  return (
    <>
      <Modal isOpen={balanceStore.isRechargeModalOpen} onClose={() => balanceStore.hideRechargeModal()} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <Tabs selectedKey={selectedTab} onSelectionChange={setSelectedTab}>
                  <Tab key="token" title="充值塔币" />
                  <Tab key="subscription" title="购买套餐" />
                </Tabs>
              </ModalHeader>
              <ModalBody>
                {selectedTab === "token" ? renderTokenTab() : renderSubscriptionTab()}
              </ModalBody>
              <ModalFooter className="flex flex-col gap-4">
                <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm flex items-center">
                    <span className="font-medium">温馨提示：</span>
                    <span className="ml-1">
                      {selectedTab === "token"
                        ? "支付完成后，请刷新页面查看最新余额"
                        : "套餐购买后立即生效，请刷新页面"}
                    </span>
                  </p>
                </div>
                <div className="flex justify-end w-full gap-2">
                  <Button color="danger" variant="light" onClick={onClose}>
                    取消
                  </Button>
                  <Button color="primary" onClick={handlePay}>
                    去支付
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 支付弹窗 */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} size="full">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-lg font-semibold">支付</h3>
              </ModalHeader>
              <ModalBody>
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 flex items-center">
                    <span className="font-medium">重要提示：</span>
                    <span className="ml-1">完成支付后，请刷新页面以查看最新的账户信息</span>
                  </p>
                </div>
                <iframe
                  srcDoc={paymentForm}
                  style={{ width: "100%", height: "600px", border: "none" }}
                  sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
})

export default RechargeModal
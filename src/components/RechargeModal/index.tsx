import React, { useState, useEffect } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Tabs,
  Tab,
  Card,
  CardBody,
  Chip,
  Slider,
} from "@nextui-org/react"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { products, orders, pagePay } from "@/service/apis/pay"
import { Icon } from "@iconify/react"
import { subscriptionService } from "@/app/admin/src/permissions/utils/permissionUtils"
import message from "@/components/Message"
import globalStore from "@/globalStore"

const SUBSCRIPTION_PLANS = {
  personal: {
    type: "personal",
    name: "个人版",
    price: 9.9,
    accountCost: 9.9,
    features: {
      adminAccount: true,
      nbAccountLimit: 0,
      wbAccountLimit: -1,
    },
    description: ["1个管理员账号", "基础AI功能", "社区支持"],
    costInTokens: 9.9,
  },
  enterprise: {
    type: "enterprise",
    name: "企业版",
    price: 99,
    accountCost: 99,
    features: {
      adminAccount: true,
      nbAccountLimit: 4,
      wbAccountLimit: -1,
    },
    description: ["1个管理员账号", "4个内部账号", "完整AI功能"],
    costInTokens: 99,
  },
}

// 价格选择卡片组件
const PriceCard = ({ amount, isPopular, onSelect, isSelected }) => (
  <Card
    isPressable
    isHoverable
    className={`t-all duration-300 ${isSelected ? "border-primary shadow-lg scale-105" : ""}`}
    onClick={() => onSelect(amount)}
  >
    <CardBody className='text-center p-6'>
      <div className='text-3xl font-bold mb-2'>¥{amount}</div>
      <Button
        className='mt-4'
        color={isSelected ? "primary" : "default"}
        variant={isSelected ? "solid" : "bordered"}
        size='sm'
        onClick={() => onSelect(amount)}
      >
        选择
      </Button>
    </CardBody>
  </Card>
)

// 步骤指示器组件
const StepIndicator = ({ step, title, subtitle, icon }) => (
  <div className='flex flex-col items-center'>
    <div className='flex items-center gap-2'>
      <div className='w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm'>{step}</div>
      <Icon icon={icon} className='text-xl' />
      {title}
    </div>
  </div>
)

const RechargeModal = observer(() => {
  const { balanceStore } = useStore()
  const [productList, setProductList] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(20)
  const [paymentForm, setPaymentForm] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState("token")
  const [selectedPlan, setSelectedPlan] = useState(null)

  // 价格选项配置
  const priceOptions = [
    { amount: 20, isPopular: false },
    { amount: 50, isPopular: true },
    { amount: 200, isPopular: false },
  ]

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
      const requiredTokens = selectedPlan.accountCost
      const currentBalance = balanceStore.actualBalance

      if (currentBalance < requiredTokens) {
        message.info(
          <div className='space-y-2'>
            <p>
              梦想币余额不足,订阅{selectedPlan.name}需要{requiredTokens}梦想币
            </p>
            <p className='text-sm text-default-500'>当前余额: {currentBalance.toFixed(2)} 梦想币</p>
            <p className='text-sm text-default-500'>还需充值: {(requiredTokens - currentBalance).toFixed(2)} 梦想币</p>
          </div>
        )
        setSelectedTab("token")
        return
      }

      const startDate = new Date()
      const expireDate = new Date()
      expireDate.setMonth(expireDate.getMonth() + 1)

      await subscriptionService.updateSubscription(globalStore.organizationId, {
        organizationId: globalStore.organizationId,
        type: selectedPlan.type,
        status: "active",
        startDate: startDate.toISOString(),
        expireDate: expireDate.toISOString(),
        features: selectedPlan.features,
        price: selectedPlan.accountCost,
      })

      balanceStore.setActualBalance(currentBalance - requiredTokens)

      message.success(`已成功订阅${selectedPlan.name},扣除${requiredTokens}梦想币`)
      balanceStore.hideRechargeModal()
    } catch (error) {
      console.error("订阅失败:", error)
      message.error("订阅失败,请稍后重试")
    }
  }

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false)
    message.info(
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <Icon icon='solar:refresh-circle-bold-duotone' className='text-lg' />
          <span>支付完成后,请刷新页面查看最新余额</span>
        </div>
        <div className='text-xs text-default-500'>提示:刷新页面后即可看到充值的梦想币</div>
      </div>,
      { duration: 10000 }
    )
  }

  const renderTokenTab = () => (
    <div className='space-y-6'>
      {/* 充值说明 */}
      <div className='p-4 bg-default-50 rounded-lg'>
        <h4 className='font-medium mb-2 flex items-center gap-2'>
          <Icon icon='solar:info-circle-bold-duotone' className='text-primary' />
          为什么需要充值梦想币?
        </h4>
        <div className='space-y-2 text-sm text-default-600'>
          <p className='flex items-center gap-2'>
            <Icon icon='solar:shield-star-bold-duotone' className='text-success' />
            用于订阅套餐和使用AI服务
          </p>
          <p className='flex items-center gap-2'>
            <Icon icon='solar:wallet-money-bold-duotone' className='text-success' />
            更灵活的费用管理和使用方式
          </p>
          <p className='flex items-center gap-2'>
            <Icon icon='solar:chart-bold-duotone' className='text-success' />
            实时查看余额和使用情况
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {priceOptions.map((option) => (
          <PriceCard
            key={option.amount}
            amount={option.amount}
            isPopular={option.isPopular}
            isSelected={quantity === option.amount}
            onSelect={setQuantity}
          />
        ))}
      </div>

      <div className='space-y-4 bg-default-50 p-4 rounded-lg'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>自定义金额</span>
          <Input
            type='number'
            min={20}
            step={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className='w-32'
            size='sm'
          />
        </div>
        <Slider
          size='sm'
          step={1}
          minValue={20}
          value={quantity}
          onChange={(value) => setQuantity(Number(value))}
          className='max-w-md'
        />
      </div>

      <div className='flex items-center justify-between p-4 bg-primary-50 rounded-lg'>
        <div className='flex items-center gap-2'>
          <Icon icon='solar:wallet-money-bold-duotone' className='text-primary' />
          <span className='font-medium'>总价</span>
        </div>
        <div className='text-2xl font-bold text-primary'>
          ¥{selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : "0.00"}
        </div>
      </div>
    </div>
  )

  const renderSubscriptionTab = () => (
    <div className='space-y-6'>
      {/* 套餐余额提示 */}
      <div className='flex items-center justify-between p-4 bg-primary-50 rounded-lg'>
        <div>
          <span className='text-sm text-default-600'>当前账户余额:</span>
          <span className='text-xl font-bold text-success ml-2'>{balanceStore.actualBalance.toFixed(2)} 梦想币</span>
        </div>
        <div>
          <span className='text-sm text-default-600'>所需梦想币:</span>
          <span className='text-xl font-bold text-primary ml-2'>{selectedPlan?.costInTokens || 0} 梦想币</span>
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-4'>
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
          <Card
            key={plan.type}
            isPressable
            isHoverable
            className={`t-all duration-300 ${
              selectedPlan?.type === plan.type ? "border-primary shadow-lg scale-105" : ""
            }`}
            onPress={() => setSelectedPlan(plan)}
          >
            <CardBody className='p-6 flex flex-col'>
              <div className='flex justify-between items-center mb-4'>
                <div>
                  <h3 className='text-xl font-bold'>{plan.name}</h3>
                  <div className='text-3xl font-bold mt-2'>
                    ¥{plan.price}
                    <span className='text-sm font-normal text-default-500'>/月</span>
                  </div>
                </div>
                <Chip color='primary' variant='flat'>
                  {plan.costInTokens} 梦想币
                </Chip>
              </div>
              <div className='space-y-3 flex-grow'>
                {plan.description.map((feature, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <Icon icon='solar:check-circle-bold-duotone' className='text-success' />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                className='w-full mt-4'
                color={selectedPlan?.type === plan.type ? "primary" : "default"}
                variant={selectedPlan?.type === plan.type ? "solid" : "bordered"}
                onPress={() => setSelectedPlan(plan)}
              >
                选择{plan.name}
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className='p-4 bg-default-50 rounded-lg'>
        <div className='flex items-center gap-2 text-sm text-default-600'>
          <Icon icon='solar:info-circle-bold-duotone' />
          <span>
            使用梦想币订阅套餐,当前余额:
            <span className='font-medium text-primary'>{balanceStore.actualBalance.toFixed(2)}</span> 梦想币
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Modal
        isOpen={balanceStore.isRechargeModalOpen}
        onClose={() => balanceStore.hideRechargeModal()}
        size='3xl'
        classNames={{
          base: "max-w-3xl",
          header: "border-b border-default-200",
          body: "py-6",
          footer: "border-t border-default-200",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <Tabs selectedKey={selectedTab} onSelectionChange={setSelectedTab}>
                  <Tab
                    key='token'
                    title={
                      <StepIndicator
                        step={1}
                        title='账户充值'
                        subtitle='先充值购买力'
                        icon='solar:wallet-money-bold-duotone'
                      />
                    }
                  />
                  <Tab
                    key='subscription'
                    title={
                      <StepIndicator
                        step={2}
                        title='选择套餐'
                        subtitle='使用余额订阅'
                        icon='solar:shield-star-bold-duotone'
                      />
                    }
                  />
                </Tabs>
              </ModalHeader>
              <ModalBody>{selectedTab === "token" ? renderTokenTab() : renderSubscriptionTab()}</ModalBody>
              <ModalFooter className='flex flex-col gap-4'>
                <div className='w-full p-4 bg-warning-50 rounded-lg'>
                  <p className='text-warning-700 text-sm flex items-center gap-2'>
                    <Icon icon='solar:info-circle-bold-duotone' className='text-warning-500' />
                    <span className='font-medium'>温馨提示:</span>
                    <span>
                      {selectedTab === "token"
                        ? "支付完成后,请刷新页面查看最新余额"
                        : `订阅套餐将使用梦想币支付,当前余额:${balanceStore.actualBalance.toFixed(2)}梦想币`}
                    </span>
                  </p>
                </div>
                <div className='flex justify-end w-full gap-2'>
                  <Button color='danger' variant='light' onPress={onClose}>
                    取消
                  </Button>
                  <Button
                    color='primary'
                    onClick={handlePay}
                    startContent={
                      <Icon
                        icon={selectedTab === "token" ? "solar:card-bold-duotone" : "solar:shield-check-bold-duotone"}
                      />
                    }
                  >
                    {selectedTab === "token" ? "去支付" : "确认订阅"}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={handlePaymentModalClose} size='5xl'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className='flex items-center gap-2'>
                  <Icon icon='solar:card-bold-duotone' className='text-primary' />
                  <h3 className='text-xl font-semibold'>支付</h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='mb-4 p-4 bg-warning-50 rounded-lg'>
                  <p className='text-warning-700 flex items-center gap-2'>
                    <Icon icon='solar:info-circle-bold-duotone' className='text-warning-500' />
                    <span className='font-medium'>重要提示:</span>
                    <span>完成支付后,请刷新页面以查看最新的账户信息</span>
                  </p>
                </div>
                <iframe srcDoc={paymentForm} style={{ width: "100%", height: "600px", border: "none" }} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
})

export default RechargeModal

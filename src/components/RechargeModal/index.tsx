import React, { useState, useEffect } from "react"
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ModalContent,
  ButtonGroup,
} from "@nextui-org/react"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { products, orders, pagePay } from "@/service/apis/pay"

const RechargeModal = observer(() => {
  const { balanceStore } = useStore()
  const [productList, setProductList] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(10)
  const [paymentForm, setPaymentForm] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // 快速选择金额选项
  const quickSelectAmounts = [10, 20, 50, 100]

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

  const handleQuickSelect = (amount) => {
    setQuantity(amount)
  }

  return (
    <>
      <Modal isOpen={balanceStore.isRechargeModalOpen} onClose={() => balanceStore.hideRechargeModal()}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className='text-lg font-semibold'>购买塔币</h3>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  {productList.map((product) => (
                    <div
                      key={product.id}
                      className={`p-4 rounded-lg cursor-pointer border ${
                        selectedProduct?.id === product.id ? "border-blue-500 bg-blue-50" : "border-gray-300"
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <span className='font-medium text-default-700'>塔币 / 1元</span>
                    </div>
                  ))}
                  <div className='flex flex-col gap-4'>
                    <div className='font-medium'>快速选择金额:</div>
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
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>自定义数量: </span>
                      <Input
                        type='number'
                        min={10}
                        step={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className='w-24'
                      />
                      <span className='text-sm text-default-500'>塔币</span>
                    </div>
                  </div>
                  <div className='text-right text-default-700 font-medium'>
                    总价: {selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : "0.00"} 元
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onClick={onClose}>
                  取消
                </Button>
                <Button color='primary' onClick={handlePay}>
                  去支付
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 支付弹窗 */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} size='xl'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className='text-lg font-semibold'>支付</h3>
              </ModalHeader>
              <ModalBody>
                <iframe
                  srcDoc={paymentForm}
                  style={{ width: "100%", height: "600px", border: "none" }}
                  sandbox='allow-forms allow-scripts allow-same-origin allow-popups'
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
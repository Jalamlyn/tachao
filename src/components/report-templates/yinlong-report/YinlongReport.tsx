import React, { useState, useEffect, useMemo } from "react"
import { getMetadata } from "@/service/apis/api"
import { jsonParse } from "@/utils"
import { ProcessingOrder } from "@/types/yinlong"
import StatisticsCards from "./components/StatisticsCards"
import FinanceStats from "./components/FinanceStats"
import ProcessStats from "./components/ProcessStats"
import DataAnalysis from "./components/DataAnalysis"
import AnomalyTable from "./components/AnomalyTable"

interface YinlongReportProps {
  reportId: string
  data: any
}

const YinlongReport: React.FC<YinlongReportProps> = ({ reportId, data }) => {
  const [orders, setOrders] = useState<ProcessingOrder[]>([])
  const [activeView, setActiveView] = useState<'manufacturer' | 'product' | 'project'>('manufacturer')

  useEffect(() => {
    async function fetchData() {
      try {
        const names = data?.dataSources?.map((item: string) => `form_${item}`)
        const res = await getMetadata(names)
        const fetchedOrders: ProcessingOrder[] = res.data
          ?.map((item: any) => {
            try {
              const parsed = jsonParse(item.value)
              if (!parsed?.data?.basicInfo?.manufacturer) {
                console.warn('Invalid order data structure:', parsed)
                return null
              }
              return parsed
            } catch (e) {
              console.error('Error parsing order data:', e)
              return null
            }
          })
          .filter(Boolean)
        setOrders(fetchedOrders || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      }
    }
    fetchData()
  }, [data])

  const manufacturerStats = useMemo(() => {
    const stats = new Map()
    orders.forEach(order => {
      if (!order?.data?.basicInfo?.manufacturer) {
        console.warn('Invalid order data structure:', order)
        return
      }

      const manufacturer = order.data.basicInfo.manufacturer
      if (!stats.has(manufacturer)) {
        stats.set(manufacturer, {
          outbound: 0,
          inbound: 0,
          amount: 0,
          orderCount: 0,
        })
      }
      const stat = stats.get(manufacturer)
      if (Array.isArray(order.data.productDetails)) {
        order.data.productDetails.forEach(product => {
          stat.outbound += Number(product.outboundQuantity) || 0
          stat.inbound += Number(product.inboundQuantity) || 0
          stat.amount += Number(product.totalPrice) || 0
        })
      }
      stat.orderCount++
    })
    return Array.from(stats.entries()).map(([name, data]) => ({
      name,
      ...data,
    }))
  }, [orders])

  const productStats = useMemo(() => {
    const stats = new Map()
    orders.forEach(order => {
      if (!order?.data?.productDetails) return
      
      order.data.productDetails.forEach(product => {
        if (!product?.productName) return
        
        if (!stats.has(product.productName)) {
          stats.set(product.productName, {
            outbound: 0,
            inbound: 0,
            amount: 0,
            orderCount: 0,
          })
        }
        const stat = stats.get(product.productName)
        stat.outbound += Number(product.outboundQuantity) || 0
        stat.inbound += Number(product.inboundQuantity) || 0
        stat.amount += Number(product.totalPrice) || 0
        stat.orderCount++
      })
    })
    return Array.from(stats.entries()).map(([name, data]) => ({
      name,
      ...data,
    }))
  }, [orders])

  const projectStats = useMemo(() => {
    const stats = new Map()
    orders.forEach(order => {
      if (!order?.data?.basicInfo?.processingProject) {
        console.warn('Missing processing project:', order)
        return
      }

      const project = order.data.basicInfo.processingProject
      if (!stats.has(project)) {
        stats.set(project, {
          outbound: 0,
          inbound: 0,
          amount: 0,
          orderCount: 0,
        })
      }
      const stat = stats.get(project)
      if (Array.isArray(order.data.productDetails)) {
        order.data.productDetails.forEach(product => {
          stat.outbound += Number(product.outboundQuantity) || 0
          stat.inbound += Number(product.inboundQuantity) || 0
          stat.amount += Number(product.totalPrice) || 0
        })
      }
      stat.orderCount++
    })
    return Array.from(stats.entries()).map(([name, data]) => ({
      name,
      ...data,
    }))
  }, [orders])

  const anomalyStats = useMemo(() => {
    return orders.flatMap(order => {
      if (!order?.data?.productDetails || !order?.data?.basicInfo) return []
      
      return order.data.productDetails
        .filter(product => {
          const outbound = Number(product.outboundQuantity) || 0
          const inbound = Number(product.inboundQuantity) || 0
          return outbound !== inbound
        })
        .map(product => ({
          orderNumber: order.data.basicInfo.orderNumber,
          manufacturer: order.data.basicInfo.manufacturer,
          productName: product.productName,
          outboundQuantity: Number(product.outboundQuantity) || 0,
          inboundQuantity: Number(product.inboundQuantity) || 0,
          difference: (Number(product.inboundQuantity) || 0) - (Number(product.outboundQuantity) || 0),
        }))
    })
  }, [orders])

  const processStats = useMemo(() => {
    const total = orders.length
    return {
      warehouseConfirm: orders.filter(o => o?.data?.processConfirmations?.warehouseConfirm?.confirmed).length,
      purchaseConfirm: orders.filter(o => o?.data?.processConfirmations?.purchaseConfirm?.confirmed).length,
      financeConfirm: orders.filter(o => o?.data?.processConfirmations?.financeConfirm?.confirmed).length,
      total,
    }
  }, [orders])

  const financeStats = useMemo(() => {
    const stats = {
      totalAmount: 0,
      confirmedAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      anomalyAmount: 0,
    }

    orders.forEach(order => {
      if (!order?.data) return

      stats.totalAmount += Number(order.data.totalAmount) || 0

      if (order.data.processConfirmations?.financeConfirm?.confirmed) {
        stats.confirmedAmount += Number(order.data.processConfirmations.financeConfirm.confirmedAmount) || 0
      }

      if (order.data.processConfirmations?.financeConfirm?.confirmed) {
        stats.paidAmount += Number(order.data.processConfirmations.financeConfirm.paymentAmount) || 0
      }
    })

    stats.unpaidAmount = stats.confirmedAmount - stats.paidAmount
    stats.anomalyAmount = stats.confirmedAmount - stats.totalAmount

    return stats
  }, [orders])

  const activeStats = useMemo(() => {
    switch (activeView) {
      case 'manufacturer':
        return manufacturerStats
      case 'product':
        return productStats
      case 'project':
        return projectStats
      default:
        return manufacturerStats
    }
  }, [activeView, manufacturerStats, productStats, projectStats])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-8">银隆外协加工统计报表 (ID: {reportId})</h2>
      
      <StatisticsCards
        orderCount={orders.length}
        manufacturerCount={manufacturerStats.length}
        anomalyCount={anomalyStats.length}
        completedCount={processStats.financeConfirm}
      />

      <FinanceStats stats={financeStats} />

      <ProcessStats stats={processStats} />

      <DataAnalysis
        data={activeStats}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <AnomalyTable anomalies={anomalyStats} />
    </div>
  )
}

export default YinlongReport
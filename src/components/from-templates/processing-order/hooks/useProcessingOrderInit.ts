import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { Manufacturer } from "../types/ProcessingOrder"
import { getMetadata } from "@/service/apis/api"
import { message } from "@/components/Message"

interface UseProcessingOrderInitProps {
  form: UseFormReturn<any>
  formId: string
  getFormById: (id: string) => Promise<any>
}

export const useProcessingOrderInit = ({ form, formId, getFormById }: UseProcessingOrderInitProps) => {
  const [loading, setLoading] = useState(true)
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        await Promise.all([fetchForm(), fetchManufacturers()])
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [formId])

  const fetchForm = async () => {
    try {
      if (formId && formId !== "create") {
        const formData = await getFormById(formId)
        if (formData) {
          form.reset(formData)
        }
      }
    } catch (error) {
      console.error("Error fetching form:", error)
      message.error("获取表单数据失败")
    }
  }

  const fetchManufacturers = async () => {
    try {
      const result = await getMetadata(["客户"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        const customers = JSON.parse(result.data[0].value)
        const manufacturerData = customers.map((customer: any) => ({
          data_id: customer.data_id,
          manufacturerName: customer.客户名称,
          manufacturerId: customer.客户编码,
          address: `${customer["客户地址(省/自治区/直辖市)"] || ""},${customer["客户地址(市/区)"] || ""},${
            customer["客户地址(县/区)"] || ""
          },${customer["客户地址(详细地址)"] || ""}`,
          contactMethod: customer.开户电话 || "",
          qualificationLevel: customer.资质等级 || "",
          cooperationHistory: customer.合作历史 || "",
          paymentTerms: customer.付款条件 || "",
        }))
        setManufacturers(manufacturerData)
      }
    } catch (error) {
      console.error("Error fetching manufacturers:", error)
      message.error("获取厂商数据失败")
    }
  }

  return {
    loading,
    manufacturers,
  }
}

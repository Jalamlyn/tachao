import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { getMetadata } from "@/service/apis/api"
import { Customer, CustomerContact, ProductData } from "../types/SalesOrder"
import { message } from "@/components/Message"
import { FORM_MESSAGES } from "../constants"

export const useFormData = (form: UseFormReturn<any>, formId: string) => {
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [contacts, setContacts] = useState<CustomerContact[]>([])
  const [products, setProducts] = useState<ProductData[]>([])

  const fetchForm = async () => {
    try {
      setLoading(true)
      if (formId && formId !== "create") {
        const formData = await getFormById(formId)
        if (formData) {
          form.reset(formData as any)
          const customerCode = formData.data?.customerInfo?.customerCode
          if (customerCode) {
            fetchContacts(customerCode)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching form:", error)
      message.error(FORM_MESSAGES.FETCH_ERROR)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const result = await getMetadata(["客户"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        setCustomers(JSON.parse(result.data[0].value))
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      message.error(FORM_MESSAGES.FETCH_CUSTOMER_ERROR)
    }
  }

  const fetchContacts = async (customerCode: string) => {
    try {
      const result = await getMetadata(["联系人"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        const allContacts = JSON.parse(result.data[0].value)
        setContacts(allContacts.filter((contact: CustomerContact) => contact.客户编码 === customerCode))
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      message.error(FORM_MESSAGES.FETCH_CONTACT_ERROR)
    }
  }

  const fetchProducts = async () => {
    try {
      const result = await getMetadata(["产品信息"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        setProducts(JSON.parse(result.data[0].value))
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      message.error(FORM_MESSAGES.FETCH_PRODUCT_ERROR)
    }
  }

  useEffect(() => {
    fetchForm()
    fetchCustomers()
    fetchProducts()
  }, [formId])

  return {
    loading,
    customers,
    contacts,
    products,
    fetchContacts
  }
}
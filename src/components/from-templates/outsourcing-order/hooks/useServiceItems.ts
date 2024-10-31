import { UseFormReturn } from 'react-hook-form'
import { OutsourcingOrderFormValues } from '../schema'

export const useServiceItems = (form: UseFormReturn<OutsourcingOrderFormValues>) => {
  const handleSelectServices = (selectedServices: any[]) => {
    const currentServices = form.getValues("data.serviceItems") || []
    const newServices = selectedServices.map((service) => ({
      id: Date.now().toString() + Math.random(),
      name: service.服务项目 || "",
      code: service.编码 || "",
      unit: service.单位 || "",
      remarks: service.备注 || "",
    }))

    form.setValue("data.serviceItems", [...currentServices, ...newServices])
  }

  const handleRemoveService = (serviceId: string) => {
    const currentServices = form.getValues("data.serviceItems")
    const updatedServices = currentServices.filter((service) => service.id !== serviceId)
    form.setValue("data.serviceItems", updatedServices)
  }

  return {
    handleSelectServices,
    handleRemoveService
  }
}
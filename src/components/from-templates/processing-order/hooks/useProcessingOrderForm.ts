import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProcessingOrderFormValues, processingOrderSchema } from "../schema"

export const useProcessingOrderForm = () => {
  const form = useForm<ProcessingOrderFormValues>({
    resolver: zodResolver(processingOrderSchema),
    defaultValues: {
      id: "",
      title: "",
      status: "initial",
      templateId: "processingOrder",
      data: {
        basicInfo: {
          orderNumber: "",
          manufacturerName: "",
          manufacturerId: "",
          address: "",
          contactMethod: "",
          orderDate: new Date().toISOString().split("T")[0],
          department: "",
          responsiblePerson: "",
        },
        materialDetails: [],
        totalAmount: 0,
        totalAmountInWords: "",
        processingFee: 0,
        attachment: null,
        tradingTerms: [],
      },
    },
    mode: "onChange",
  })

  return form
}
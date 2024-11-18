import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { message } from "@/components/Message"
import { useFormMetadata } from "../../hook/useFormMetadata"
import { warehouseReceiptSchema, WarehouseReceiptFormValues } from "../schema"

const DEFAULT_VALUES: WarehouseReceiptFormValues = {
  id: "",
  templateId: "warehouseReceipt",
  status: "draft",
  title: "",
  data: {
    basicInfo: {
      receiptNumber: "",
      receiptDate: new Date().toISOString(),
      receiptType: "purchase",
      department: "",
      responsiblePerson: "",
      supplier: "",
      sourceDocument: "",
      sourceDocumentNumber: "",
      remarks: "",
    },
    materialDetails: [],
    warehouseInfo: {
      warehouseCode: "",
      warehouseName: "",
      area: "",
      shelf: "",
      position: "",
      temperature: "",
      humidity: "",
      operator: "",
      checkPerson: "",
      receiveTime: new Date().toISOString(),
      storageRequirements: "",
    },
    approvalInfo: {
      status: "pending",
      approver: "",
      approvalDate: "",
      approvalComments: "",
      qualityInspector: "",
      inspectionDate: "",
      inspectionResult: undefined,
      inspectionComments: "",
    },
    attachment: null,
  },
}

export const useWarehouseReceiptForm = (formId: string, onFormSaved?: () => void) => {
  const { getFormById, addForm, updateForm } = useFormMetadata()
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<WarehouseReceiptFormValues>({
    resolver: zodResolver(warehouseReceiptSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  })

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true)
        if (formId && formId !== "create") {
          const formData = await getFormById(formId)
          if (formData) {
            form.reset(formData as WarehouseReceiptFormValues)
          }
        }
      } catch (error) {
        console.error("Error fetching form:", error)
        message.error("获取表单数据失败")
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [formId, getFormById, form])

  const onSubmit = async (values: WarehouseReceiptFormValues) => {
    try {
      setIsSaving(true)
      if (formId && formId !== "create") {
        await updateForm(values)
      } else {
        await addForm(values)
      }
      if (onFormSaved) {
        onFormSaved()
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      message.error("提交表单失败")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddMaterial = () => {
    const currentMaterials = form.getValues("data.materialDetails") || []
    form.setValue("data.materialDetails", [
      ...currentMaterials,
      {
        id: Date.now().toString(),
        materialCode: "",
        materialName: "",
        specification: "",
        unit: "",
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        batchNumber: "",
        location: "",
        qualityStatus: "pending",
        remarks: "",
      },
    ])
  }

  const handleDeleteMaterial = (index: number) => {
    const currentMaterials = form.getValues("data.materialDetails")
    const updatedMaterials = currentMaterials.filter((_, i) => i !== index)
    form.setValue("data.materialDetails", updatedMaterials)
  }

  const handleQuantityChange = (index: number, value: number) => {
    const currentMaterials = form.getValues("data.materialDetails")
    const material = currentMaterials[index]
    const unitPrice = material.unitPrice || 0

    currentMaterials[index] = {
      ...material,
      quantity: value,
      totalPrice: value * unitPrice,
    }

    form.setValue("data.materialDetails", currentMaterials)
  }

  const handleUnitPriceChange = (index: number, value: number) => {
    const currentMaterials = form.getValues("data.materialDetails")
    const material = currentMaterials[index]
    const quantity = material.quantity || 0

    currentMaterials[index] = {
      ...material,
      unitPrice: value,
      totalPrice: quantity * value,
    }

    form.setValue("data.materialDetails", currentMaterials)
  }

  return {
    form,
    loading,
    isSaving,
    onSubmit,
    handleAddMaterial,
    handleDeleteMaterial,
    handleQuantityChange,
    handleUnitPriceChange,
  }
}
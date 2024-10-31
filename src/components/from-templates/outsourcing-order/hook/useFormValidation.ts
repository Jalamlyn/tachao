import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { OutsourcingOrderFormValues } from "../schema"

export const useFormValidation = (form: UseFormReturn<OutsourcingOrderFormValues>) => {
  const [hasErrors, setHasErrors] = useState(false)

  useEffect(() => {
    const subscription = form.watch(() => {
      const hasFinancialErrs = hasFinancialErrors(form)
      setHasErrors(hasFinancialErrs)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const hasFinancialErrors = (form: UseFormReturn<OutsourcingOrderFormValues>) => {
    const errors = form.formState.errors
    return !!(errors.data?.approvalInfo)
  }

  const validateForm = () => {
    const errors = form.formState.errors
    const errorMessages: string[] = []

    const collectErrors = (obj: any) => {
      for (const key in obj) {
        if (obj[key]?.message) {
          errorMessages.push(obj[key].message)
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          collectErrors(obj[key])
        }
      }
    }

    collectErrors(errors)
    return errorMessages
  }

  return {
    hasErrors,
    validateForm
  }
}
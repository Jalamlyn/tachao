import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { DeliveryOrderFormValues } from "../schema"

export const useFormValidation = (form: UseFormReturn<DeliveryOrderFormValues>) => {
  const [hasErrors, setHasErrors] = useState(false)

  useEffect(() => {
    const subscription = form.watch(() => {
      const _hasFormErrors = hasFormErrors(form)
      setHasErrors(_hasFormErrors)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const hasFormErrors = (form: UseFormReturn<DeliveryOrderFormValues>) => {
    const errors = form.formState.errors
    return !!errors.data?.processConfirmations
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
    validateForm,
  }
}

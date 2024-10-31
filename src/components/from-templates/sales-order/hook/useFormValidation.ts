import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { validateFormData, hasFinancialErrors } from "../utils/formUtils"

export const useFormValidation = (form: UseFormReturn<any>) => {
  const [hasErrors, setHasErrors] = useState(false)

  useEffect(() => {
    const subscription = form.watch(() => {
      const hasFinancialErrs = hasFinancialErrors(form)
      setHasErrors(hasFinancialErrs)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const validateForm = () => {
    const errorMessages = validateFormData(form)
    return errorMessages
  }

  return {
    hasErrors,
    validateForm
  }
}
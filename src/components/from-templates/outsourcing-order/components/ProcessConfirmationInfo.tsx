import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { UseFormReturn } from "react-hook-form"
import { PROCESS_STEPS, PROCESS_STEP_LABELS } from "../types/OutsourcingOrder"
import ProcessConfirmationHeader from "./process-confirmation/ProcessConfirmationHeader"
import ProcessConfirmationTabs from "./process-confirmation/ProcessConfirmationTabs"
import ProcessConfirmationStep from "./process-confirmation/ProcessConfirmationStep"
import ProcessConfirmationDeliveryInfo from "./process-confirmation/ProcessConfirmationDeliveryInfo"
import ProcessConfirmationAmountField from "./process-confirmation/ProcessConfirmationAmountField"
import ProcessConfirmationComments from "./process-confirmation/ProcessConfirmationComments"

interface ProcessConfirmationInfoProps {
  form: UseFormReturn<any>
  isEditable: boolean
  isInitializing: boolean
  onConfirm?: (step: string) => void
  onCancelConfirmation?: (step: string) => void
}

const ProcessConfirmationInfo: React.FC<ProcessConfirmationInfoProps> = ({
  form,
  isEditable,
  isInitializing,
  onConfirm,
  onCancelConfirmation,
}) => {
  const processConfirmations = form.watch("data.processConfirmations") || {}

  const renderStepContent = (step: string) => {
    const confirmation = processConfirmations[step] || {}
    const isConfirmed = confirmation?.confirmed

    return (
      <>
        <ProcessConfirmationStep
          step={step}
          stepLabel={PROCESS_STEP_LABELS[step]}
          form={form}
          isEditable={isEditable}
          onConfirm={onConfirm || (() => {})}
          onCancelConfirmation={onCancelConfirmation || (() => {})}
        />

        {step === PROCESS_STEPS.PROCESSING_COMPLETE && (
          <ProcessConfirmationDeliveryInfo form={form} step={step} isEditable={isEditable} />
        )}

        {step === PROCESS_STEPS.FINANCE_AMOUNT_CONFIRM && (
          <ProcessConfirmationAmountField
            form={form}
            step={step}
            isEditable={isEditable}
            fieldName="confirmedAmount"
            label="确认金额"
            icon="mdi:cash-check"
          />
        )}

        {step === PROCESS_STEPS.FINANCE_PAYMENT && (
          <ProcessConfirmationAmountField
            form={form}
            step={step}
            isEditable={isEditable}
            fieldName="paymentAmount"
            label="付款金额"
            icon="mdi:cash-sync"
          />
        )}

        <ProcessConfirmationComments
          form={form}
          step={step}
          isEditable={isEditable}
          isInitializing={isInitializing}
          isConfirmed={isConfirmed}
        />
      </>
    )
  }

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-8'>
        <ProcessConfirmationHeader />

        <ProcessConfirmationTabs processConfirmations={processConfirmations}>
          {Object.values(PROCESS_STEPS).map((step) => (
            <TabsContent key={step} value={step} className='mt-6 focus-visible:outline-none'>
              {renderStepContent(step)}
            </TabsContent>
          ))}
        </ProcessConfirmationTabs>
      </CardContent>
    </Card>
  )
}

export default ProcessConfirmationInfo
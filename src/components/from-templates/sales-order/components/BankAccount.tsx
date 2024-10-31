import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"

interface BankAccountProps {
  form: UseFormReturn<any>
  isEditable: boolean
}

const BankAccount: React.FC<BankAccountProps> = ({ form, isEditable }) => {
  return (
    <Card className='mt-4'>
      <CardContent>
        <h3 className='text-lg font-semibold mb-4'>银行账户明细</h3>
        <div className='flex gap-2'>
          <FormField
            control={form.control}
            name="data.bankAccount.account"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="银行账户"
                    disabled={!isEditable}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.bankAccount.bank"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="开户银行"
                    disabled={!isEditable}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default BankAccount
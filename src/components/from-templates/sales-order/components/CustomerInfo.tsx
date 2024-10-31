"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { Customer, CustomerContact } from "../types/SalesOrder"
import { handleCustomerSelection, handleContactSelection } from "../utils/formUtils"

interface CustomerInfoProps {
  form: UseFormReturn<any>
  customers: Customer[]
  contacts: CustomerContact[]
  fetchContacts: (customerCode: string) => void
  isEditable: boolean
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  form,
  customers,
  contacts,
  fetchContacts,
  isEditable,
}) => {
  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-semibold mb-4">客户信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data.customerInfo.customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>选择客户</FormLabel>
                <FormControl>
                  {isEditable ? (
                    <Select 
                      onValueChange={(value) => {
                        const selectedCustomer = customers.find((c) => c.data_id === value)
                        if (selectedCustomer) {
                          handleCustomerSelection(form, selectedCustomer, fetchContacts)
                        }
                      }} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择客户" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem
                            key={customer.data_id}
                            value={customer.data_id}
                          >
                            {customer.客户名称}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={customers.find((c) => c.data_id === field.value)?.客户名称 || ""}
                      disabled
                      placeholder="客户名称"
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.customerInfo.customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>客户名称</FormLabel>
                <FormControl>
                  <Input {...field} disabled placeholder="客户名称" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.customerInfo.customerCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>客户编码</FormLabel>
                <FormControl>
                  <Input {...field} disabled placeholder="客户编码" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.customerInfo.contactId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>联系人</FormLabel>
                <FormControl>
                  {isEditable ? (
                    <Select 
                      onValueChange={(value) => {
                        const selectedContact = contacts.find((c) => c.data_id === value)
                        if (selectedContact) {
                          handleContactSelection(form, selectedContact)
                        }
                      }} 
                      defaultValue={field.value}
                      disabled={!form.getValues("data.customerInfo.customerId")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择联系人" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem
                            key={contact.data_id}
                            value={contact.data_id}
                          >
                            {contact.联系人姓名}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={form.getValues("data.customerInfo.contactName")}
                      disabled
                      placeholder="联系人姓名"
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.customerInfo.contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>联系人姓名</FormLabel>
                <FormControl>
                  <Input {...field} disabled placeholder="联系人姓名" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.customerInfo.contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>联系人手机号</FormLabel>
                <FormControl>
                  <Input {...field} disabled placeholder="联系人手机号" />
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

export default CustomerInfo
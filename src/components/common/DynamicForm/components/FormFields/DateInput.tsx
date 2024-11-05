import React from "react"
import { Button } from "@nextui-org/react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"

interface DateInputProps {
  field: any
}

const DateInput: React.FC<DateInputProps> = ({ field }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="bordered"
        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
        disabled={field.disabled}
      >
        {field.value ? format(new Date(field.value), "PPP") : <span>选择日期</span>}
        <Icon icon="mdi:calendar" className="ml-auto h-4 w-4 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={field.value ? new Date(field.value) : undefined}
        onSelect={(date) => field.onChange(date?.toISOString())}
        disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
        initialFocus
      />
    </PopoverContent>
  </Popover>
)

export default DateInput
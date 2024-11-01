import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/theme/cn"
import { format } from "date-fns"
import { Icon } from "@iconify/react"

export const leaveRequestConfig = {
  formFields: {
    基本信息: [
      {
        name: "employeeName",
        label: "申请人",
        type: "text",
        required: true,
        placeholder: "请输入申请人姓名",
      },
      {
        name: "department",
        label: "所属部门",
        type: "text",
        required: true,
        placeholder: "请输入所属部门",
      },
      {
        name: "leaveType",
        label: "请假类型",
        type: "custom",
        required: true,
        render: ({ field, form }) => (
          <select className='w-full rounded-md border border-gray-300 px-3 py-2' {...field}>
            <option value=''>请选择请假类型</option>
            <option value='annual'>年假</option>
            <option value='sick'>病假</option>
            <option value='personal'>事假</option>
            <option value='other'>其他</option>
          </select>
        ),
      },
    ],
    请假时间: [
      {
        name: "startDate",
        label: "开始时间",
        type: "custom",
        required: true,
        render: ({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value ? format(new Date(field.value), "PPP") : <span>选择开始日期</span>}
                <Icon icon="mdi:calendar" className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  try {
                    if (date) {
                      const isoDate = date.toISOString()
                      console.log('Setting start date:', isoDate)
                      field.onChange(isoDate)
                    }
                  } catch (error) {
                    console.error('Error setting start date:', error)
                  }
                }}
                disabled={(date) =>
                  date < new Date("2000-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ),
      },
      {
        name: "endDate",
        label: "结束时间",
        type: "custom",
        required: true,
        render: ({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value ? format(new Date(field.value), "PPP") : <span>选择结束日期</span>}
                <Icon icon="mdi:calendar" className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  try {
                    if (date) {
                      const isoDate = date.toISOString()
                      console.log('Setting end date:', isoDate)
                      field.onChange(isoDate)
                    }
                  } catch (error) {
                    console.error('Error setting end date:', error)
                  }
                }}
                disabled={(date) =>
                  date < new Date("2000-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ),
      },
      {
        name: "duration",
        label: "请假时长(天)",
        type: "number",
        required: true,
        placeholder: "请输入请假时长",
      },
    ],
    请假事由: [
      {
        name: "reason",
        label: "请假原因",
        type: "custom",
        required: true,
        render: ({ field }) => (
          <textarea
            className='w-full rounded-md border border-gray-300 px-3 py-2 min-h-[100px]'
            placeholder='请详细说明请假原因'
            {...field}
          />
        ),
      },
      {
        name: "attachment",
        label: "附件",
        type: "file",
        accept: ".pdf,.doc,.docx,.jpg,.png",
        placeholder: "上传相关证明材料",
      },
    ],
  },
  processSteps: [
    {
      key: "directLeader",
      title: "直属领导审批",
      description: "请等待直属领导审批",
      fields: [
        {
          name: "directLeaderComments",
          label: "审批意见",
          type: "custom",
          render: ({ field, isEditable }) => (
            <textarea
              className='w-full rounded-md border border-gray-300 px-3 py-2 min-h-[60px]'
              placeholder='请输入审批意见'
              disabled={!isEditable}
              {...field}
            />
          ),
        },
      ],
    },
    {
      key: "departmentHead",
      title: "部门主管审批",
      description: "请等待部门主管审批",
      fields: [
        {
          name: "departmentHeadComments",
          label: "审批意见",
          type: "custom",
          render: ({ field, isEditable }) => (
            <textarea
              className='w-full rounded-md border border-gray-300 px-3 py-2 min-h-[60px]'
              placeholder='请输入审批意见'
              disabled={!isEditable}
              {...field}
            />
          ),
        },
      ],
    },
  ],
  dependencies: {
    duration: {
      dependsOn: ["startDate", "endDate"],
      calculate: (values) => {
        if (!values.startDate || !values.endDate) return 0
        const start = new Date(values.startDate)
        const end = new Date(values.endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
      },
    },
  },
  customValidators: {
    endDate: (value, allValues) => {
      if (new Date(value) <= new Date(allValues.startDate)) {
        return "结束时间必须大于开始时间"
      }
    },
  },
}
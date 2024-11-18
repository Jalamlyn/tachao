import React from "react"
import { Avatar } from "@nextui-org/react"
import { UserInfo as UserInfoType } from "../types"
import { Icon } from "@iconify/react"

interface UserInfoProps {
  userInfo: UserInfoType
  type: string
}

export const UserInfo: React.FC<UserInfoProps> = ({ userInfo, type }) => (
  <div className='p-2 px-4 mr-2 bg-slate-50 rounded-lg shadow-sm flex items-center gap-4'>
    <Icon icon='ri:account-pin-circle-fill' className='w-6 h-6 text-primary-500' />
    {/* <Avatar src={userInfo?.avatar} name={userInfo?.name?.[0]} size='sm' /> */}
    <div>
      <div className='font-medium'>{userInfo?.name || "未知用户"}</div>
      <div className='text-sm text-gray-500'>
        {type === "platform" && "平台账号"}
        {type === "wechat" && "微信账号"}
        {type === "wecom" && "企业微信账号"}
      </div>
    </div>
  </div>
)

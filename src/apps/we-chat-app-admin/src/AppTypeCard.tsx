import React from "react"
import { Card, CardBody, CardHeader, CardFooter, Image, divider } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface AppTypeCardProps {
  title: string
  headerTitle: string
  icon: string
  onClick: () => void
  description?: string
  imageSrc?: string
}

const AppTypeCard: React.FC<AppTypeCardProps> = ({ title, headerTitle, icon, onClick, description, imageSrc }) => {
  return (
    <Card isPressable className='w-full h-[300px] bg-slate-700 hover:bg-slate-950' onPress={onClick}>
      <CardHeader className='absolute z-10 top-1 flex-col items-start'>
        <p className='text-tiny text-white/60 uppercase font-bold'>{headerTitle}</p>
        <h4 className='text-white font-medium text-large'>{title}</h4>
      </CardHeader>
      <Image
        removeWrapper
        alt={`${title} background`}
        className='z-0 w-full h-full object-cover'
        // src={imageSrc || ``}
      />
      <CardFooter className='absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100'>
        <div className='flex flex-grow gap-2 items-center'>
          <Icon icon={icon} width={24} height={24} className='text-white' />
          <div className='flex flex-col'>
            <p className='text-tiny text-white/60'>{description || title}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default AppTypeCard

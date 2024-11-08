import React from "react"
import { Card, CardBody, CardHeader, CardFooter, Image } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

interface AppTypeCardProps {
  title: string
  headerTitle: string
  icon: string
  onClick: () => void
  description?: string
  imageSrc?: string
}

const AppTypeCard: React.FC<AppTypeCardProps> = ({ 
  title, 
  headerTitle, 
  icon, 
  onClick, 
  description, 
  imageSrc 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        isPressable 
        className='w-full h-[300px] bg-gradient-to-br from-default-100 to-default-200 hover:from-default-200 hover:to-default-300' 
        onPress={onClick}
      >
        <CardHeader className='absolute z-10 top-1 flex-col items-start'>
          <p className='text-tiny text-default-600 uppercase font-bold'>{headerTitle}</p>
          <h4 className='text-default-900 font-medium text-large'>{title}</h4>
        </CardHeader>
        
        {imageSrc ? (
          <Image
            removeWrapper
            alt={`${title} background`}
            className='z-0 w-full h-full object-cover opacity-50'
            src={imageSrc}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Icon icon={icon} className="w-32 h-32" />
          </div>
        )}
        
        <CardFooter className='absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100'>
          <div className='flex flex-grow gap-2 items-center'>
            <Icon icon={icon} width={24} height={24} className='text-default-500' />
            <div className='flex flex-col'>
              <p className='text-tiny text-default-500'>{description || title}</p>
            </div>
          </div>
        </CardFooter>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-5" />
      </Card>
    </motion.div>
  )
}

export default AppTypeCard
import React from "react"
import { Button } from "@nextui-org/button"
import { Icon } from "@iconify/react"
import ResourceSelectButton from "@/components/common/ResourceSelectButton"

interface ProductDetailsActionsProps {
  isEditable: boolean
  onAddProduct: () => void
  onSelectProducts: (selectedProducts: any[]) => void
}

const ProductDetailsActions: React.FC<ProductDetailsActionsProps> = ({
  isEditable,
  onAddProduct,
  onSelectProducts,
}) => {
  if (!isEditable) return null

  return (
    <div className="flex gap-2 mt-4">
      <Button
        endContent={<Icon icon="mdi:plus" className="mr-2" />}
        onClick={onAddProduct}
        variant="flat"
      >
        添加产品
      </Button>
      <ResourceSelectButton
        resourceName="银隆加工物料表"
        appId=""
        onSelect={onSelectProducts}
        buttonText="从物料表选择"
        buttonProps={{
          variant: "flat",
          endContent: <Icon icon="mdi:table-search" className="mr-2" />,
        }}
      />
    </div>
  )
}

export default ProductDetailsActions
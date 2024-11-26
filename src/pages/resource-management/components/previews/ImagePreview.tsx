import React from "react"
import { Card, CardBody, Image } from "@nextui-org/react"

interface ImagePreviewProps {
  data: {
    url: string
    description?: string
  }
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ data }) => {
  return (
    <Card>
      <CardBody>
        <div className="flex flex-col items-center gap-4 p-4">
          <Image
            src={data.url}
            alt={data.description || "Image preview"}
            className="max-w-full h-auto rounded-lg"
          />
          {data.description && (
            <p className="text-sm text-default-600 text-center">{data.description}</p>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default ImagePreview
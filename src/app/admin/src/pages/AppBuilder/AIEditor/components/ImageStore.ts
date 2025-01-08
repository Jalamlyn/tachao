import AIFormAgent from "@/service/agents/AIFormAgent"

class ImageStore {
  private _images: string[] = []

  get images(): string[] {
    return this._images
  }

  addImage(image: string) {
    this._images.push(image)
  }

  removeImage(image: string) {
    this._images = this._images.filter((img) => img !== image)
  }

  clear() {
    this._images = []
  }
}

export const imageStore = new ImageStore()

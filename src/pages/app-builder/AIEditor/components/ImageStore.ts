import AIFormAgent from "@/service/agents/AIFormAgent"

class ImageStore {
  private _images: string[] = []

  get images(): string[] {
    return this._images
  }

  set images(newImages: string[]) {
    this._images = newImages
    // 当图片列表改变时，同步分析缓存
    AIFormAgent.syncImageAnalysisCache()
  }

  addImage(image: string) {
    this._images.push(image)
    AIFormAgent.syncImageAnalysisCache()
  }

  removeImage(image: string) {
    this._images = this._images.filter((img) => img !== image)
    AIFormAgent.clearImageAnalysis(image)
    AIFormAgent.syncImageAnalysisCache()
  }

  clear() {
    this._images = []
    AIFormAgent.clearImageAnalysis()
  }
}

export const imageStore = new ImageStore()

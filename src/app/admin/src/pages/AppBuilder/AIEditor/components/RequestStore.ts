import { makeAutoObservable } from "mobx"

export interface RequestRecord {
  id: string
  method: "GET" | "SET"
  timestamp: number
  params: any
  response: any
}

class RequestStore {
  private static instance: RequestStore
  requests: RequestRecord[] = []

  private constructor() {
    makeAutoObservable(this)
  }

  public static getInstance(): RequestStore {
    if (!RequestStore.instance) {
      RequestStore.instance = new RequestStore()
    }
    return RequestStore.instance
  }

  addRequest(request: Omit<RequestRecord, "id" | "timestamp">) {
    this.requests.push({
      ...request,
      id: Date.now().toString(),
      timestamp: Date.now(),
    })
  }

  clear() {
    this.requests = []
  }

  get latestRequests() {
    return [...this.requests].reverse()
  }
}

export const requestStore = RequestStore.getInstance()
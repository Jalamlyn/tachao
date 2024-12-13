import { message } from "@/components/Message"

export interface TokenServiceConfig {
  defaultBalance?: number
  storageKey?: string
}

class TokenService {
  private static instance: TokenService
  private storageKey: string
  private defaultBalance: number

  private constructor(config: TokenServiceConfig = {}) {
    this.storageKey = config.storageKey || 'towerTokens'
    this.defaultBalance = config.defaultBalance || 10
    this.initializeBalance()
  }

  public static getInstance(config?: TokenServiceConfig): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService(config)
    }
    return TokenService.instance
  }

  private initializeBalance(): void {
    if (localStorage.getItem(this.storageKey) === null) {
      localStorage.setItem(this.storageKey, this.defaultBalance.toString())
    }
  }

  public getBalance(): number {
    return parseFloat(localStorage.getItem(this.storageKey) || '0')
  }

  public async deductTokens(amount: number): Promise<boolean> {
    const balance = this.getBalance()
    if (balance < amount) {
      message.error(`塔币余额不足，当前余额：${balance}，需要：${amount}`)
      return false
    }
    localStorage.setItem(this.storageKey, (balance - amount).toString())
    return true
  }

  public addTokens(amount: number): void {
    const balance = this.getBalance()
    localStorage.setItem(this.storageKey, (balance + amount).toString())
  }

  public async checkBalance(amount: number): Promise<boolean> {
    const balance = this.getBalance()
    return balance >= amount
  }
}

export default TokenService.getInstance()
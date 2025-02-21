import { message } from "./Message"

interface UserOptions {
  envType?: "pre" | "prod"
  onError?: (error: any) => void
}

interface RegisterParams {
  phone: string
  password: string
}

interface LoginParams {
  phone: string
  password: string
}

/**
 * 用户注册
 */
export const cloudRegister = async (params: RegisterParams, appId) => {
  try {
    const { data } = await window.mo_app.models.user.create({
      data: {
        sjh: params.phone,
        mm: params.password,
        wyyyID: appId,
      },
    })
    return { id: data.id }
  } catch (error) {
    console.error("Error registering user:", error)
    onError?.(error)
    message.error("注册失败，请稍后重试")
    throw error
  }
}

/**
 * 用户登录
 */
export const cloudLogin = async (params: LoginParams, appId) => {
  try {
    const response = await window.mo_app.models.user.list({
      filter: {
        where: {
          $and: [{ sjh: { $eq: params.phone } }, { mm: { $eq: params.password } }, { wyyyID: { $eq: appId } }],
        },
      },
      pageSize: 1,
      pageNumber: 1,
    })

    return response
  } catch (error) {
    console.error("Error logging in:", error)
    onError?.(error)
    message.error("登录失败，请稍后重试")
    throw error
  }
}

import React from 'react'

export interface AppContextType {
  appId: string | null
  runtimeContext?: {
    user?: any
    api?: any
  }
}

export const AppContext = React.createContext<AppContextType>({
  appId: null,
  runtimeContext: undefined
})

export const useAppContext = () => React.useContext(AppContext)
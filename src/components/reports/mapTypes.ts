export interface MapDataItem {
  name: string
  address: string
  coordinates?: [number, number]
  value: number
  [key: string]: any
}

export interface MapTooltipConfig {
  formatter?: (data: MapDataItem) => string
  fields?: Array<{
    key: string
    label: string
    format?: (value: any) => string
  }>
}

export interface MapStyleConfig {
  backgroundColor?: string
  pointColor?: string | ((value: number, min: number, max: number) => string)
  symbolSize?: number | ((value: number, clustering: boolean) => number)
  styleJson?: any[]
}

export interface MapControls {
  clustering?: boolean
  darkMode?: boolean
  zoom?: boolean
  [key: string]: boolean | undefined
}

export interface MapComponentProps {
  // 基础配置
  data: MapDataItem[]
  title?: string
  apiKey?: string
  
  // 视图配置
  center?: [number, number]
  zoom?: number
  style?: MapStyleConfig
  
  // 交互配置
  tooltip?: MapTooltipConfig
  clustering?: boolean
  enableDarkMode?: boolean
  
  // 控件配置
  controls?: MapControls
  
  // 事件处理
  onPointClick?: (data: MapDataItem) => void
  onViewChange?: (center: [number, number], zoom: number) => void
  
  // 样式
  className?: string
  containerStyle?: React.CSSProperties
}
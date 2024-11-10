/**
 * 布局类型定义
 */
export type LayoutType = 'grid' | 'flex' | 'flow'

/**
 * 响应式值类型
 */
export type ResponsiveValue<T> = {
  base?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

/**
 * 网格布局配置
 */
export interface GridConfig {
  cols?: ResponsiveValue<number>
  rows?: ResponsiveValue<number>
  gap?: ResponsiveValue<number | string>
  rowGap?: ResponsiveValue<number | string>
  colGap?: ResponsiveValue<number | string>
}

/**
 * 弹性布局配置
 */
export interface FlexConfig {
  direction?: ResponsiveValue<'row' | 'column'>
  wrap?: ResponsiveValue<'nowrap' | 'wrap' | 'wrap-reverse'>
  justify?: ResponsiveValue<'start' | 'end' | 'center' | 'between' | 'around'>
  align?: ResponsiveValue<'start' | 'end' | 'center' | 'stretch' | 'baseline'>
  gap?: ResponsiveValue<number | string>
}

/**
 * 流式布局配置
 */
export interface FlowConfig {
  minChildWidth?: ResponsiveValue<string>
  gap?: ResponsiveValue<number | string>
}

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  type: LayoutType
  grid?: GridConfig
  flex?: FlexConfig
  flow?: FlowConfig
  className?: string
}

/**
 * 布局项配置接口
 */
export interface LayoutItemConfig {
  // Grid 项配置
  colSpan?: ResponsiveValue<number>
  rowSpan?: ResponsiveValue<number>
  colStart?: ResponsiveValue<number>
  rowStart?: ResponsiveValue<number>
  
  // Flex 项配置
  grow?: ResponsiveValue<number>
  shrink?: ResponsiveValue<number>
  basis?: ResponsiveValue<string>
  order?: ResponsiveValue<number>
  
  // 通用配置
  align?: ResponsiveValue<'start' | 'end' | 'center' | 'stretch'>
  justify?: ResponsiveValue<'start' | 'end' | 'center'>
  padding?: ResponsiveValue<string>
  margin?: ResponsiveValue<string>
  className?: string
}
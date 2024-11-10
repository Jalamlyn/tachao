import type { 
  ResponsiveValue,
  GridConfig,
  FlexConfig,
  FlowConfig,
  LayoutConfig 
} from '../../types/layout'

/**
 * 生成响应式类名
 */
export const createResponsiveClasses = <T>(
  prefix: string,
  value: ResponsiveValue<T> | undefined
): string[] => {
  if (!value) return []
  
  const classes: string[] = []
  
  if (value.base !== undefined) classes.push(`${prefix}-${value.base}`)
  if (value.sm !== undefined) classes.push(`sm:${prefix}-${value.sm}`)
  if (value.md !== undefined) classes.push(`md:${prefix}-${value.md}`)
  if (value.lg !== undefined) classes.push(`lg:${prefix}-${value.lg}`)
  if (value.xl !== undefined) classes.push(`xl:${prefix}-${value.xl}`)
  if (value['2xl'] !== undefined) classes.push(`2xl:${prefix}-${value['2xl']}`)
  
  return classes
}

/**
 * 生成网格布局类名
 */
export const generateGridClasses = (config: GridConfig = {}): string[] => {
  const classes: string[] = ['grid']
  
  // 列配置
  if (config.cols) {
    classes.push(...createResponsiveClasses('grid-cols', config.cols))
  }
  
  // 行配置
  if (config.rows) {
    classes.push(...createResponsiveClasses('grid-rows', config.rows))
  }
  
  // 间距配置
  if (config.gap) {
    classes.push(...createResponsiveClasses('gap', config.gap))
  }
  
  if (config.rowGap) {
    classes.push(...createResponsiveClasses('gap-y', config.rowGap))
  }
  
  if (config.colGap) {
    classes.push(...createResponsiveClasses('gap-x', config.colGap))
  }
  
  return classes
}

/**
 * 生成弹性布局类名
 */
export const generateFlexClasses = (config: FlexConfig = {}): string[] => {
  const classes: string[] = ['flex']
  
  // 方向
  if (config.direction) {
    classes.push(...createResponsiveClasses('flex', config.direction))
  }
  
  // 换行
  if (config.wrap) {
    classes.push(...createResponsiveClasses('flex', config.wrap))
  }
  
  // 主轴对齐
  if (config.justify) {
    classes.push(...createResponsiveClasses('justify', config.justify))
  }
  
  // 交叉轴对齐
  if (config.align) {
    classes.push(...createResponsiveClasses('items', config.align))
  }
  
  // 间距
  if (config.gap) {
    classes.push(...createResponsiveClasses('gap', config.gap))
  }
  
  return classes
}

/**
 * 生成流式布局类名
 */
export const generateFlowClasses = (config: FlowConfig = {}): string[] => {
  const classes: string[] = ['grid', 'auto-rows-auto']
  
  // 最小子项宽度
  if (config.minChildWidth) {
    const width = typeof config.minChildWidth === 'object' 
      ? config.minChildWidth.base 
      : config.minChildWidth
    if (width) {
      classes.push(`grid-cols-[repeat(auto-fit,minmax(${width},1fr))]`)
    }
  }
  
  // 间距
  if (config.gap) {
    classes.push(...createResponsiveClasses('gap', config.gap))
  }
  
  return classes
}

/**
 * 生成布局类名
 */
export const generateLayoutClasses = (config: LayoutConfig): string[] => {
  const classes: string[] = []
  
  switch (config.type) {
    case 'grid':
      classes.push(...generateGridClasses(config.grid))
      break
    case 'flex':
      classes.push(...generateFlexClasses(config.flex))
      break
    case 'flow':
      classes.push(...generateFlowClasses(config.flow))
      break
  }
  
  return classes
}
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'

/**
 * 格式化代码
 */
export const formatCode = (code: string): string => {
  try {
    return prettier.format(code, {
      parser: 'babel',
      plugins: [parserBabel],
      semi: false,
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 80,
      tabWidth: 2,
    })
  } catch (error) {
    console.error('Error formatting code:', error)
    throw new Error('代码格式化失败')
  }
}

/**
 * 将配置对象转换为代码字符串
 */
export const configToCode = (config: any): string => {
  try {
    const code = `export default ${JSON.stringify(config, null, 2)}`
    return formatCode(code)
  } catch (error) {
    console.error('Error converting config to code:', error)
    throw new Error('配置转换失败')
  }
}

/**
 * 将代码字符串转换为配置对象
 */
export const codeToConfig = (code: string): any => {
  try {
    // 移除 export default
    const configString = code.replace(/export\s+default\s+/, '')
    // 解析 JSON
    return JSON.parse(configString)
  } catch (error) {
    console.error('Error parsing code to config:', error)
    throw new Error('代码解析失败')
  }
}
import { logger } from './logger';

// 类型定义
export type SerializableFunction = string | Function;
export type SerializableObject = {
  [key: string]: SerializableFunction | SerializableObject | any;
};

/**
 * 将对象中的函数转换为字符串
 * @param obj 要转换的对象
 * @returns 转换后的对象
 */
export const functionToString = (obj: any): SerializableObject => {
  logger.debug('[functionToString] Starting conversion', { type: typeof obj });

  if (obj === null || obj === undefined) {
    logger.debug('[functionToString] Null or undefined value, returning as is');
    return obj;
  }

  if (typeof obj === 'function') {
    try {
      // 添加函数签名检查
      const funcStr = obj.toString();
      if (!funcStr.startsWith('function') && !funcStr.startsWith('async function') && !funcStr.includes('=>')) {
        const error = new Error('Invalid function format');
        logger.error('[functionToString] Invalid function format detected', error, { funcStr });
        throw error;
      }
      logger.debug('[functionToString] Converting function to string', { 
        preview: funcStr.substring(0, 100) + '...' 
      });
      return `__FUNCTION__${funcStr}`;
    } catch (error) {
      logger.error('[functionToString] Function conversion failed', error as Error);
      throw error;
    }
  }

  if (Array.isArray(obj)) {
    logger.debug('[functionToString] Processing array', { length: obj.length });
    return obj.map((item, index) => {
      try {
        return functionToString(item);
      } catch (error) {
        logger.error('[functionToString] Array item conversion failed', error as Error, { index });
        throw error;
      }
    });
  }

  if (typeof obj === 'object') {
    logger.debug('[functionToString] Processing object', { 
      keys: Object.keys(obj).length 
    });
    const result: SerializableObject = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          result[key] = functionToString(obj[key]);
        } catch (error) {
          logger.error('[functionToString] Object property conversion failed', error as Error, { key });
          throw error;
        }
      }
    }
    return result;
  }

  return obj;
}

/**
 * 将字符串还原为函数
 * @param obj 要还原的对象
 * @returns 还原后的对象
 */
export const stringToFunction = (obj: any): any => {
  logger.debug('[stringToFunction] Starting restoration', { type: typeof obj });

  if (obj === null || obj === undefined) {
    logger.debug('[stringToFunction] Null or undefined value, returning as is');
    return obj;
  }

  if (typeof obj === 'string' && obj.startsWith('__FUNCTION__')) {
    try {
      const functionBody = obj.slice(11); // 移除 __FUNCTION__ 前缀
      
      // 添加安全检查
      if (functionBody.includes('eval') || functionBody.includes('Function')) {
        const error = new Error('Unsafe function content detected');
        logger.error('[stringToFunction] Unsafe function content detected', error, {
          preview: functionBody.substring(0, 100) + '...'
        });
        throw error;
      }

      logger.debug('[stringToFunction] Restoring function from string', {
        preview: functionBody.substring(0, 100) + '...'
      });
      return new Function('return ' + functionBody)();
    } catch (error) {
      logger.error('[stringToFunction] Function restoration failed', error as Error);
      return obj; // 在还原失败时返回原字符串
    }
  }

  if (Array.isArray(obj)) {
    logger.debug('[stringToFunction] Processing array', { length: obj.length });
    return obj.map((item, index) => {
      try {
        return stringToFunction(item);
      } catch (error) {
        logger.error('[stringToFunction] Array item restoration failed', error as Error, { index });
        throw error;
      }
    });
  }

  if (typeof obj === 'object') {
    logger.debug('[stringToFunction] Processing object', { 
      keys: Object.keys(obj).length 
    });
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          result[key] = stringToFunction(obj[key]);
        } catch (error) {
          logger.error('[stringToFunction] Object property restoration failed', error as Error, { key });
          throw error;
        }
      }
    }
    return result;
  }

  return obj;
}

/**
 * 验证函数格式是否合法
 * @param func 要验证的函数
 * @returns 是否合法
 */
export const validateFunction = (func: Function): boolean => {
  try {
    const funcStr = func.toString();
    logger.debug('[validateFunction] Validating function', {
      preview: funcStr.substring(0, 100) + '...'
    });
    
    const isValid = (
      funcStr.startsWith('function') ||
      funcStr.startsWith('async function') ||
      funcStr.includes('=>')
    );

    if (!isValid) {
      logger.warn('[validateFunction] Invalid function format detected', { 
        preview: funcStr.substring(0, 100) + '...' 
      });
    }

    return isValid;
  } catch (error) {
    logger.error('[validateFunction] Validation failed', error as Error);
    return false;
  }
}
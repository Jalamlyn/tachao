export const generateOrderNumber = (prefix: string = 'CP') => {
  return `${prefix}${Date.now()}`;
};
// numberToWords.ts

const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const units = ['', '拾', '佰', '仟'];
const bigUnits = ['', '万', '亿', '兆'];

function numberToWords(num: number): string {
  if (num === 0) return '零元整';

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = '';

  // 处理整数部分
  if (integerPart > 0) {
    result += convertIntegerPart(integerPart) + '元';
  }

  // 处理小数部分
  if (decimalPart > 0) {
    const jiao = Math.floor(decimalPart / 10);
    const fen = decimalPart % 10;

    if (jiao > 0) {
      result += digits[jiao] + '角';
    }
    if (fen > 0) {
      result += digits[fen] + '分';
    }
  } else {
    result += '整';
  }

  return result;
}

function convertIntegerPart(num: number): string {
  let result = '';
  let bigUnitIndex = 0;

  while (num > 0) {
    const section = num % 10000;
    const sectionWords = convertSection(section);

    if (sectionWords !== '零') {
      result = sectionWords + bigUnits[bigUnitIndex] + result;
    } else if (bigUnitIndex > 0) {
      result = bigUnits[bigUnitIndex] + result;
    }

    num = Math.floor(num / 10000);
    bigUnitIndex++;
  }

  return result;
}

function convertSection(num: number): string {
  let result = '';
  let hasZero = false;

  for (let i = 0; i < 4; i++) {
    const digit = num % 10;
    if (digit === 0) {
      hasZero = true;
    } else {
      if (hasZero) {
        result = '零' + result;
        hasZero = false;
      }
      result = digits[digit] + units[i] + result;
    }
    num = Math.floor(num / 10);
  }

  return result;
}

export default numberToWords;
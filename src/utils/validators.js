import dayjs from 'dayjs'
import _ from 'lodash'

const messages = {
  requiredInput: () => '此欄位為必填',
  email: () => '不正確的信箱格式',
  enterEmail: () => '請輸入信箱',
  enterPassword: () => '請輸入密碼',
  inputPositiveInteger: () => '請輸入正整數',
  invalidDateRange: () => '日期區間有誤',
  invalidRange: (min, max) => `請輸入介於 ${min}-${max} 之間的數字`,
  invalidInteger: (place) => `整數最多 ${place} 位數`,
  invalidDecimal: (place) => `小數最多 ${place} 位數`
}

/**
 * 是否空白未填值
 */
const isEmpty = (val) => {
  return !val || String(val).trim().length <= 0
}
/**
 * 是否數字空白未填值（可以是0）
 */
const isNumberEmpty = (val) => {
  return isNaN(val) || String(val).trim().length <= 0
}
/**
 * 是否只包含英文或數字
 */
const isLetterOrDigit = (val) => {
  const regex = /^[a-zA-Z0-9]+$/g
  const result = regex.test(val)
  return result
}
/**
 * 是否為合法email格式
 */
const isValidEmail = (val) => {
  if (!val || val.trim().length <= 0) {
    return true
  }
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  const result = regex.test(val)
  return result
}
/**
 * 是否符合長度限制
 */
const isValidLength = (val, min = 0, max = 99) => {
  if (val && min >= 0 && max >= 0) {
    const len = val.length
    const result = len >= min && len <= max
    return result
  }
  return true
}

/**
 * 是否符合數字範圍區間
 */
const isValidRange = (val, min, max) => {
  if (!_.isNaN(val) && !_.isNaN(min) && !_.isNaN(max)) {
    return Number(val) >= Number(min) && Number(val) <= Number(max)
  }
  return false
}

/**
 * 是否為正整數
 */
const isPositiveInteger = (val, acceptZero = false) => {
  try {
    val = Number(val)
    if (isNaN(val)) {
      return false
    }
    if (!acceptZero && val === 0) {
      return false
    }
    if (val < 0) {
      return false
    }
    if (String(val).includes('.')) {
      return false
    }
    return true
  } catch (err) {
    console.warn('isPositiveInteger:', err)
    return false
  }
}

/**
 * 是否為合法的日期區間
 */
const isValidDateRange = (start, end) => {
  if (!dayjs(start).isValid() || !dayjs(end).isValid()) {
    return false
  }
  if (dayjs(start).isAfter(dayjs(end))) {
    return false
  }
  return true
}

/**
 * 二字串是否相符
 */
const isMatch = (a, b) => {
  return a === b
}

/**
 * 是否為合法的整數、小數位數
 */
const isNumberDigit = (val, intPlace = null, decimalPlace = null) => {
  let expression = '^-?[0-9]';

  // 整數
  if (intPlace !== null) {
    expression += `{0,${intPlace}}`
  } else {
    expression += '*'
  }

  // 小數
  let hasDecimal = val.toString().includes('.');
  if (hasDecimal && decimalPlace !== null) {
    expression += `\\.?[0-9]{0,${decimalPlace}}`;
  }

  expression += '$';
  const regex = new RegExp(expression)
  const result = regex.test(val)
  return result
}

export {
  messages,
  isEmpty,
  isNumberEmpty,
  isValidEmail,
  isValidLength,
  isLetterOrDigit,
  isMatch,
  isPositiveInteger,
  isValidDateRange,
  isValidRange,
  isNumberDigit
}

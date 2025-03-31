import _ from 'lodash'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import duration from 'dayjs/plugin/duration'
dayjs.extend(utc)
dayjs.extend(tz)
dayjs.extend(duration)

export function SnakeToCamel(data) {
  if (data instanceof Array) {
    const newArr = []
    for (let i = 0; i < data.length; i++) {
      newArr[i] = _.mapKeys(data[i], (value, key) => _convertToCamel(key))
    }
    return newArr
  } else {
    return _.mapKeys(data, (value, key) => _convertToCamel(key))
  }
}

function _convertToCamel(string) {
  string = string.toLowerCase()
  return string.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase()
  })
}

export function GetLocalTime(time, defaultValue) {
  if (time) {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  }
  return defaultValue
}

export const getDateString = (date, format = 'YYYY-MM-DD HH:mm:ss', defaultValue) => {
  const timeZone = dayjs.tz.guess()
  if (date) {
    return dayjs.utc(date).tz(timeZone).format(format)
  }
  return defaultValue
}

export const getDateStringNoTz = (date, format = 'YYYY-MM-DD HH:mm:ss', defaultValue) => {
  if (date) {
    return dayjs(date).format(format)
  }
  return defaultValue
}

export const addDays = (days, date = new Date()) => {
  if (!date) {
    date = new Date()
  }
  return dayjs(date).add(days, 'day')
}

export const isDateAfter = (a, b) => {
  return dayjs(a).isAfter(dayjs(b))
}

export const isDateBefore = (a, b) => {
  // console.log('isDateBefore a:', dayjs(a), ', b:', dayjs(b))
  return dayjs(a).isBefore(dayjs(b))
}

export const isDateAfterOrEqual = (a, b) => {
  return dayjs(a).isSame(dayjs(b)) || dayjs(a).isAfter(dayjs(b))
}

export const getNumberFormat = (value, locale, options) => {
  try {
    if (isNaN(value)) {
      return value
    }
    const opts = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options
    }
    const currency = new Intl.NumberFormat(locale, opts)
    return currency.format(value)
  } catch (err) {
    return value
  }
}

export const getCurrencyPriceFormat = value => {
  return value ? `${value.slice(0, 3)} ${getNumberFormat(value.slice(3))}` : '-'
}

export const getTimeZoneList = () => {
  let tzInfoList = []
  const time = new Date()
  const tzs = Intl.supportedValuesOf('timeZone')
  for (let tz of tzs) {
    const d = dayjs.tz(time, tz)
    // console.log(`TimeZone: ${tz}, offset: ${d.utcOffset() / 60}`)
    tzInfoList.push({
      timezone: tz,
      offset: d.utcOffset(),
      offsetHour: d.utcOffset() / 60
    })
  }
  return tzInfoList
}

export const getUserNameFormat = (firstName, lastName) => {
  return `${firstName ? firstName.replace(/\s/g, '') : ''} ${lastName}`.toUpperCase()
}
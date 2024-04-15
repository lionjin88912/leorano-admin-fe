import { boot } from 'quasar/wrappers'
import * as helpers from 'src/utils/helpers'

export default boot(({ app }) => {
  // 可輸入小數點後2位的金額
  app.directive('currency', (el, binding) => {
    let val = binding.value
    if (!val) {
      el.value = ''
      return
    }
    if (isNaN(val)) {
      val = val.replaceAll(',', '')
    }
    if (isNaN(val)) {
      el.value = ''
      return
    }
    const result = helpers.getCurrencyFormat(val)
    // console.log('formated money:', result);
    if (el.hasOwnProperty('value')) {
      el.value = String(result)
    } else {
      el.innerText = String(result)
    }
  })

  // 日期格式(轉時區)
  app.directive('date-tz', (el, binding) => {
    const format = binding.arg || 'YYYY-MM-DD'
    const val = binding.value
    let result = ''
    if (val) {
      result = helpers.getDateString(val, format)
    }
    if (result === 'Invalid Date') {
      result = val
    }
    if (el.hasOwnProperty('value')) {
      el.value = result
    } else {
      el.innerText = result
    }
  })
  // 日期格式(不轉時區)
  app.directive('date-no-tz', (el, binding) => {
    const format = binding.arg || 'YYYY-MM-DD'
    const val = binding.value
    let result = ''
    if (val) {
      result = helpers.getDateStringNoTz(val, format)
    }
    if (result === 'Invalid Date') {
      result = val
    }
    if (el.hasOwnProperty('value')) {
      el.value = result
    } else {
      el.innerText = result
    }
  })
})

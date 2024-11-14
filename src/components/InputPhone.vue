<template>
  <div class="flex no-wrap">
    <q-select v-model="countryCode" :options="countryCodes" option-label="countryNameEn" option-value="phoneCode" label="國碼" class="country-code" outlined dense>
      <template #selected>
        <q-icon :name="countryCode.flag" size="xs" class="q-mb-xs q-mr-xs" />
        {{ countryCode.phoneCode }}
      </template>
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <div class="option-item flex no-wrap items-center">
              <q-icon :name="scope.opt.flag" size="xs" class="q-mb-xs q-mr-xs" />
              <span class="col-grow">{{ scope.opt.countryNameTw }}</span>
              <span>{{ scope.opt.phoneCode }}</span>
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-input v-model="phone" type="tel" label="手機電話" :rules="rules.phone" debounce="500" class="phone-input q-ml-sm" @update:model-value="handleInput" lazy-rules outlined dense />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const countryCodes = ref([
  {
    "flag": "🇹🇼",
    "countryCode": "TW",
    "countryNameTw": "台灣",
    "countryNameCn": "台湾",
    "countryNameEn": "Taiwan",
    "phoneCode": "+886"
  },
  {
    "flag": "🇺🇸",
    "countryCode": "US",
    "countryNameTw": "美國",
    "countryNameCn": "美国",
    "countryNameEn": "United States",
    "phoneCode": "+1"
  },
  {
    "flag": "🇨🇦",
    "countryCode": "CA",
    "countryNameTw": "加拿大",
    "countryNameCn": "加拿大",
    "countryNameEn": "Canada",
    "phoneCode": "+1"
  },
  {
    "flag": "🇬🇧",
    "countryCode": "UK",
    "countryNameTw": "英國",
    "countryNameCn": "英国",
    "countryNameEn": "United Kingdom",
    "phoneCode": "+44"
  },
  {
    "flag": "🇦🇫",
    "countryCode": "AF",
    "countryNameTw": "阿富汗",
    "countryNameCn": "阿富汗",
    "countryNameEn": "Afghanistan",
    "phoneCode": "+93"
  },
  {
    "flag": "🇦🇷",
    "countryCode": "AR",
    "countryNameTw": "阿根廷",
    "countryNameCn": "阿根廷",
    "countryNameEn": "Argentina",
    "phoneCode": "+54"
  },
  {
    "flag": "🇦🇹",
    "countryCode": "AT",
    "countryNameTw": "奧地利",
    "countryNameCn": "奥地利",
    "countryNameEn": "Austria",
    "phoneCode": "+43"
  },
  {
    "flag": "🇦🇺",
    "countryCode": "AU",
    "countryNameTw": "澳大利亞",
    "countryNameCn": "澳大利亚",
    "countryNameEn": "Australia",
    "phoneCode": "+61"
  },
  {
    "flag": "🇧🇭",
    "countryCode": "BH",
    "countryNameTw": "巴林",
    "countryNameCn": "巴林",
    "countryNameEn": "Bahrain",
    "phoneCode": "+973"
  },
  {
    "flag": "🇧🇩",
    "countryCode": "BD",
    "countryNameTw": "孟加拉",
    "countryNameCn": "孟加拉",
    "countryNameEn": "Bengal",
    "phoneCode": "+880"
  },
  {
    "flag": "🇧🇪",
    "countryCode": "BE",
    "countryNameTw": "比利時",
    "countryNameCn": "比利时",
    "countryNameEn": "Belgium",
    "phoneCode": "+32"
  },
  {
    "flag": "🇧🇹",
    "countryCode": "BT",
    "countryNameTw": "不丹",
    "countryNameCn": "不丹",
    "countryNameEn": "Bhutan",
    "phoneCode": "+975"
  },
  {
    "flag": "🇧🇴",
    "countryCode": "BO",
    "countryNameTw": "玻利維亞",
    "countryNameCn": "玻利维亚",
    "countryNameEn": "Bolivia",
    "phoneCode": "+591"
  },
  {
    "flag": "🇧🇷",
    "countryCode": "BR",
    "countryNameTw": "巴西",
    "countryNameCn": "巴西",
    "countryNameEn": "Brazil",
    "phoneCode": "+55"
  },
  {
    "flag": "🇰🇭",
    "countryCode": "KH",
    "countryNameTw": "柬埔寨",
    "countryNameCn": "柬埔寨",
    "countryNameEn": "Cambodia",
    "phoneCode": "+855"
  },
  {
    "flag": "🇨🇲",
    "countryCode": "CM",
    "countryNameTw": "喀麥隆",
    "countryNameCn": "喀麦隆",
    "countryNameEn": "Cameroon",
    "phoneCode": "+237"
  },
  {
    "flag": "🇨🇳",
    "countryCode": "CN",
    "countryNameTw": "中國",
    "countryNameCn": "中国",
    "countryNameEn": "China",
    "phoneCode": "+86"
  },
  {
    "flag": "🇦🇮",
    "countryCode": "AI",
    "countryNameTw": "安圭拉",
    "countryNameCn": "安圭拉",
    "countryNameEn": "Anguilla",
    "phoneCode": "+1264"
  },
  {
    "flag": "🇦🇬",
    "countryCode": "AG",
    "countryNameTw": "安地瓜",
    "countryNameCn": "安地瓜",
    "countryNameEn": "Antigua",
    "phoneCode": "+1268"
  },
  {
    "flag": "🇦🇼",
    "countryCode": "AW",
    "countryNameTw": "阿魯巴",
    "countryNameCn": "阿鲁巴",
    "countryNameEn": "Aruba",
    "phoneCode": "+297"
  },
  {
    "flag": "🇧🇲",
    "countryCode": "BM",
    "countryNameTw": "百慕達",
    "countryNameCn": "百慕达",
    "countryNameEn": "Bermuda",
    "phoneCode": "+1441"
  },
  {
    "flag": "🇩🇴",
    "countryCode": "DO",
    "countryNameTw": "多明尼加",
    "countryNameCn": "多明尼加",
    "countryNameEn": "Dominican",
    "phoneCode": "+1767"
  },
  {
    "flag": "🇬🇩",
    "countryCode": "GD",
    "countryNameTw": "格瑞那達",
    "countryNameCn": "格瑞那达",
    "countryNameEn": "Grenada",
    "phoneCode": "+1473"
  },
  {
    "flag": "🇱🇨",
    "countryCode": "LC",
    "countryNameTw": "聖盧西亞",
    "countryNameCn": "圣卢西亚",
    "countryNameEn": "Saint Lucia",
    "phoneCode": "+1758"
  },
  {
    "flag": "🇨🇴",
    "countryCode": "CO",
    "countryNameTw": "哥倫比亞",
    "countryNameCn": "哥伦比亚",
    "countryNameEn": "Colombia",
    "phoneCode": "+57"
  },
  {
    "flag": "🇸🇬",
    "countryCode": "SG",
    "countryNameTw": "新加坡",
    "countryNameCn": "新加坡",
    "countryNameEn": "Singapore",
    "phoneCode": "+65"
  },
  {
    "flag": "🇨🇬",
    "countryCode": "CG",
    "countryNameTw": "剛果共和國",
    "countryNameCn": "刚果共和国",
    "countryNameEn": "the republic of Congo",
    "phoneCode": "+243"
  },
  {
    "flag": "🇨🇭",
    "countryCode": "CH",
    "countryNameTw": "瑞士",
    "countryNameCn": "瑞士",
    "countryNameEn": "Switzerland",
    "phoneCode": "+41"
  },
  {
    "flag": "🇩🇪",
    "countryCode": "DE",
    "countryNameTw": "德國",
    "countryNameCn": "德国",
    "countryNameEn": "Germany",
    "phoneCode": "+49"
  },
  {
    "flag": "🇩🇰",
    "countryCode": "DK",
    "countryNameTw": "丹麥",
    "countryNameCn": "丹麦",
    "countryNameEn": "Denmark",
    "phoneCode": "+45"
  },
  {
    "flag": "🇪🇬",
    "countryCode": "EG",
    "countryNameTw": "埃及",
    "countryNameCn": "埃及",
    "countryNameEn": "Egypt",
    "phoneCode": "+20"
  },
  {
    "flag": "🇪🇸",
    "countryCode": "ES",
    "countryNameTw": "西班牙",
    "countryNameCn": "西班牙",
    "countryNameEn": "Spain",
    "phoneCode": "+34"
  },
  {
    "flag": "🇸🇻",
    "countryCode": "SV",
    "countryNameTw": "薩爾瓦多",
    "countryNameCn": "萨尔瓦多",
    "countryNameEn": "El Salvador",
    "phoneCode": "+503"
  },
  {
    "flag": "🇫🇮",
    "countryCode": "FI",
    "countryNameTw": "芬蘭",
    "countryNameCn": "芬兰",
    "countryNameEn": "Finland",
    "phoneCode": "+358"
  },
  {
    "flag": "🇫🇯",
    "countryCode": "FJ",
    "countryNameTw": "斐濟",
    "countryNameCn": "斐济",
    "countryNameEn": "Fiji",
    "phoneCode": "+679"
  },
  {
    "flag": "🇫🇷",
    "countryCode": "FR",
    "countryNameTw": "法國",
    "countryNameCn": "法国",
    "countryNameEn": "France",
    "phoneCode": "+33"
  },
  {
    "flag": "🇬🇪",
    "countryCode": "GE",
    "countryNameTw": "喬治亞",
    "countryNameCn": "乔治亚",
    "countryNameEn": "Georgia",
    "phoneCode": "+995"
  },
  {
    "flag": "🇬🇭",
    "countryCode": "GH",
    "countryNameTw": "迦納",
    "countryNameCn": "迦纳",
    "countryNameEn": "Ghana",
    "phoneCode": "+233"
  },
  {
    "flag": "🇬🇷",
    "countryCode": "GR",
    "countryNameTw": "希臘",
    "countryNameCn": "希腊",
    "countryNameEn": "Greece",
    "phoneCode": "+30"
  },
  {
    "flag": "🇬🇹",
    "countryCode": "GT",
    "countryNameTw": "瓜地馬拉",
    "countryNameCn": "瓜地马拉",
    "countryNameEn": "Guatemala",
    "phoneCode": "+502"
  },
  {
    "flag": "🇬🇾",
    "countryCode": "GY",
    "countryNameTw": "蓋亞那",
    "countryNameCn": "盖亚那",
    "countryNameEn": "Guyana",
    "phoneCode": "+967"
  },
  {
    "flag": "🇭🇹",
    "countryCode": "HT",
    "countryNameTw": "海地",
    "countryNameCn": "海地",
    "countryNameEn": "Haiti",
    "phoneCode": "+509"
  },
  {
    "flag": "🇭🇳",
    "countryCode": "HN",
    "countryNameTw": "宏都拉斯",
    "countryNameCn": "宏都拉斯",
    "countryNameEn": "Honduras",
    "phoneCode": "+504"
  },
  {
    "flag": "🇭🇰",
    "countryCode": "HK",
    "countryNameTw": "香港",
    "countryNameCn": "香港",
    "countryNameEn": "Hong Kong",
    "phoneCode": "+852"
  },
  {
    "flag": "🇮🇳",
    "countryCode": "IN",
    "countryNameTw": "印度",
    "countryNameCn": "印度",
    "countryNameEn": "India",
    "phoneCode": "+91"
  },
  {
    "flag": "🇮🇸",
    "countryCode": "IS",
    "countryNameTw": "冰島",
    "countryNameCn": "冰岛",
    "countryNameEn": "Iceland",
    "phoneCode": "+354"
  },
  {
    "flag": "🇮🇩",
    "countryCode": "ID",
    "countryNameTw": "印尼",
    "countryNameCn": "印尼",
    "countryNameEn": "Indonesia",
    "phoneCode": "+62"
  },
  {
    "flag": "🇮🇶",
    "countryCode": "IQ",
    "countryNameTw": "伊拉克",
    "countryNameCn": "伊拉克",
    "countryNameEn": "Iraq",
    "phoneCode": "+964"
  },
  {
    "flag": "🇮🇪",
    "countryCode": "IE",
    "countryNameTw": "愛爾蘭",
    "countryNameCn": "爱尔兰",
    "countryNameEn": "Ireland",
    "phoneCode": "+353"
  },
  {
    "flag": "🇮🇹",
    "countryCode": "IT",
    "countryNameTw": "義大利",
    "countryNameCn": "义大利",
    "countryNameEn": "Italy",
    "phoneCode": "+39"
  },
  {
    "flag": "🇯🇲",
    "countryCode": "JM",
    "countryNameTw": "牙買加",
    "countryNameCn": "牙买加",
    "countryNameEn": "Jamaica",
    "phoneCode": "+1876"
  },
  {
    "flag": "🇯🇴",
    "countryCode": "JO",
    "countryNameTw": "約旦",
    "countryNameCn": "约旦",
    "countryNameEn": "Jordan",
    "phoneCode": "+962"
  },
  {
    "flag": "🇰🇿",
    "countryCode": "KZ",
    "countryNameTw": "哈薩克",
    "countryNameCn": "哈萨克",
    "countryNameEn": "Kazakhstan",
    "phoneCode": "+7"
  },
  {
    "flag": "🇰🇪",
    "countryCode": "KE",
    "countryNameTw": "肯亞",
    "countryNameCn": "肯亚",
    "countryNameEn": "Kenya",
    "phoneCode": "+254"
  },
  {
    "flag": "🇯🇵",
    "countryCode": "JP",
    "countryNameTw": "日本",
    "countryNameCn": "日本",
    "countryNameEn": "Japan",
    "phoneCode": "+81"
  },
  {
    "flag": "🇰🇷",
    "countryCode": "KP",
    "countryNameTw": "韓國",
    "countryNameCn": "韩国",
    "countryNameEn": "Korea",
    "phoneCode": "+82"
  },
  {
    "flag": "🇰🇼",
    "countryCode": "KW",
    "countryNameTw": "科威特",
    "countryNameCn": "科威特",
    "countryNameEn": "Kuwait",
    "phoneCode": "+965"
  },
  {
    "flag": "🇱🇺",
    "countryCode": "LU",
    "countryNameTw": "盧森堡",
    "countryNameCn": "卢森堡",
    "countryNameEn": "Luxembourg",
    "phoneCode": "+352"
  },
  {
    "flag": "🇲🇴",
    "countryCode": "MO",
    "countryNameTw": "澳門",
    "countryNameCn": "澳门",
    "countryNameEn": "Macao",
    "phoneCode": "+853"
  },
  {
    "flag": "🇲🇰",
    "countryCode": "MK",
    "countryNameTw": "馬其頓",
    "countryNameCn": "马其顿",
    "countryNameEn": "Macedonia",
    "phoneCode": "+389"
  },
  {
    "flag": "🇲🇬",
    "countryCode": "MG",
    "countryNameTw": "馬達加斯加",
    "countryNameCn": "马达加斯加",
    "countryNameEn": "Madagascar",
    "phoneCode": "+261"
  },
  {
    "flag": "🇲🇾",
    "countryCode": "ML",
    "countryNameTw": "馬來西亞",
    "countryNameCn": "马来西亚",
    "countryNameEn": "Malaysia",
    "phoneCode": "+60"
  },
  {
    "flag": "🇲🇻",
    "countryCode": "MV",
    "countryNameTw": "馬爾地夫",
    "countryNameCn": "马尔地夫",
    "countryNameEn": "Maldives",
    "phoneCode": "+960"
  },
  {
    "flag": "🇲🇽",
    "countryCode": "MX",
    "countryNameTw": "墨西哥",
    "countryNameCn": "墨西哥",
    "countryNameEn": "Mexico",
    "phoneCode": "+52"
  },
  {
    "flag": "🇲🇦",
    "countryCode": "MA",
    "countryNameTw": "摩洛哥",
    "countryNameCn": "摩洛哥",
    "countryNameEn": "Morocco",
    "phoneCode": "+212"
  },
  {
    "flag": "🇳🇴",
    "countryCode": "NO",
    "countryNameTw": "挪威",
    "countryNameCn": "挪威",
    "countryNameEn": "Norway",
    "phoneCode": "+47"
  },
  {
    "flag": "🇳🇷",
    "countryCode": "NR",
    "countryNameTw": "諾魯",
    "countryNameCn": "诺鲁",
    "countryNameEn": "Noruu",
    "phoneCode": "+674"
  },
  {
    "flag": "🇳🇿",
    "countryCode": "NZ",
    "countryNameTw": "紐西蘭",
    "countryNameCn": "纽西兰",
    "countryNameEn": "New Zealand",
    "phoneCode": "+64"
  },
  {
    "flag": "🇳🇮",
    "countryCode": "NI",
    "countryNameTw": "尼加拉瓜",
    "countryNameCn": "尼加拉瓜",
    "countryNameEn": "Nicaragua",
    "phoneCode": "+505"
  },
  {
    "flag": "🇳🇬",
    "countryCode": "NG",
    "countryNameTw": "奈及利亞",
    "countryNameCn": "奈及利亚",
    "countryNameEn": "Nigeria",
    "phoneCode": "+234"
  },
  {
    "flag": "🇵🇰",
    "countryCode": "PK",
    "countryNameTw": "巴基斯坦",
    "countryNameCn": "巴基斯坦",
    "countryNameEn": "Pakistan",
    "phoneCode": "+92"
  },
  {
    "flag": "🇵🇦",
    "countryCode": "PA",
    "countryNameTw": "巴拿馬",
    "countryNameCn": "巴拿马",
    "countryNameEn": "Panama",
    "phoneCode": "+507"
  },
  {
    "flag": "🇵🇬",
    "countryCode": "PG",
    "countryNameTw": "巴布亞紐幾內亞",
    "countryNameCn": "巴布亚纽几内亚",
    "countryNameEn": "Papua New Guinea",
    "phoneCode": "+675"
  },
  {
    "flag": "🇵🇹",
    "countryCode": "PT",
    "countryNameTw": "葡萄牙",
    "countryNameCn": "葡萄牙",
    "countryNameEn": "Portugal",
    "phoneCode": "+351"
  },
  {
    "flag": "🇵🇾",
    "countryCode": "PY",
    "countryNameTw": "巴拉圭",
    "countryNameCn": "巴拉圭",
    "countryNameEn": "Paraguay",
    "phoneCode": "+595"
  },
  {
    "flag": "🇷🇴",
    "countryCode": "RO",
    "countryNameTw": "羅馬尼亞",
    "countryNameCn": "罗马尼亚",
    "countryNameEn": "Romania",
    "phoneCode": "+40"
  },
  {
    "flag": "🇷🇺",
    "countryCode": "RU",
    "countryNameTw": "俄羅斯",
    "countryNameCn": "俄罗斯",
    "countryNameEn": "Russia",
    "phoneCode": "+7"
  },
  {
    "flag": "🇷🇼",
    "countryCode": "RW",
    "countryNameTw": "盧旺達",
    "countryNameCn": "卢旺达",
    "countryNameEn": "Rwanda",
    "phoneCode": "+250"
  },
  {
    "flag": "🇸🇦",
    "countryCode": "SA",
    "countryNameTw": "沙烏地阿拉伯",
    "countryNameCn": "沙乌地阿拉伯",
    "countryNameEn": "Saudi Arabia",
    "phoneCode": "+966"
  },
  {
    "flag": "🇸🇾",
    "countryCode": "SY",
    "countryNameTw": "敘利亞",
    "countryNameCn": "叙利亚",
    "countryNameEn": "Syria",
    "phoneCode": "+381"
  },
  {
    "flag": "🇸🇨",
    "countryCode": "SC",
    "countryNameTw": "塞席爾",
    "countryNameCn": "塞席尔",
    "countryNameEn": "Seychelles",
    "phoneCode": "+248"
  },
  {
    "flag": "🇱🇰",
    "countryCode": "LK",
    "countryNameTw": "斯里蘭卡",
    "countryNameCn": "斯里兰卡",
    "countryNameEn": "Sri Lanka",
    "phoneCode": "+94"
  },
  {
    "flag": "🇸🇩",
    "countryCode": "SD",
    "countryNameTw": "蘇丹",
    "countryNameCn": "苏丹",
    "countryNameEn": "Sudan",
    "phoneCode": "+249"
  },
  {
    "flag": "🇸🇪",
    "countryCode": "SE",
    "countryNameTw": "瑞典",
    "countryNameCn": "瑞典",
    "countryNameEn": "Sweden",
    "phoneCode": "+46"
  },
  {
    "flag": "🇹🇭",
    "countryCode": "TL",
    "countryNameTw": "泰國",
    "countryNameCn": "泰国",
    "countryNameEn": "Thailand",
    "phoneCode": "+66"
  },
  {
    "flag": "🇹🇴",
    "countryCode": "TO",
    "countryNameTw": "湯加群島",
    "countryNameCn": "汤加群岛",
    "countryNameEn": "Tonga Islands",
    "phoneCode": "+676"
  },
  {
    "flag": "🇹🇷",
    "countryCode": "TR",
    "countryNameTw": "土耳其",
    "countryNameCn": "土耳其",
    "countryNameEn": "Turkey",
    "phoneCode": "+90"
  },
  {
    "flag": "🇺🇬",
    "countryCode": "UG",
    "countryNameTw": "烏干達",
    "countryNameCn": "乌干达",
    "countryNameEn": "Uganda",
    "phoneCode": "+256"
  },
  {
    "flag": "🇺🇦",
    "countryCode": "UA",
    "countryNameTw": "烏克蘭",
    "countryNameCn": "乌克兰",
    "countryNameEn": "Ukraine",
    "phoneCode": "+380"
  },
  {
    "flag": "🇦🇪",
    "countryCode": "AE",
    "countryNameTw": "阿拉伯聯合大公國",
    "countryNameCn": "阿拉伯联合大公国",
    "countryNameEn": "United Arab Emirates",
    "phoneCode": "+971"
  },
  {
    "flag": "🇺🇾",
    "countryCode": "UY",
    "countryNameTw": "烏拉圭",
    "countryNameCn": "乌拉圭",
    "countryNameEn": "Uruguay",
    "phoneCode": "+598"
  },
  {
    "flag": "🇺🇿",
    "countryCode": "UZ",
    "countryNameTw": "烏茲別克",
    "countryNameCn": "乌兹别克",
    "countryNameEn": "Uzbekistan",
    "phoneCode": "+998"
  },
  {
    "flag": "🇻🇪",
    "countryCode": "VE",
    "countryNameTw": "委內瑞拉",
    "countryNameCn": "委内瑞拉",
    "countryNameEn": "Venezuela",
    "phoneCode": "+58"
  },
  {
    "flag": "🇾🇪",
    "countryCode": "YE",
    "countryNameTw": "葉門",
    "countryNameCn": "叶门",
    "countryNameEn": "Yemen",
    "phoneCode": "+967"
  }
])

const emit = defineEmits(['update:modelValue'])
const countryCode = computed({
  get: () => {
    let code = props.modelValue.split(' ')[0] || '+886'
    return countryCodes.value.find(c => c.phoneCode === code)
  },
  set: (val) => {
    console.log('select:' + val + ' ' + phone.value);
    emit('update:modelValue', val.phoneCode + ' ' + phone.value)
  }
})
const phone = computed(() =>{
  const value = props.modelValue.split(' ')[1] || ''

  // 移除開頭的 0
  let processed = value.startsWith('0') ? value.slice(1) : value

  // 移除所有非數字字符
  processed = processed.replace(/\D/g, '')

  // 每三位加入空格
  return processed.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
})

const rules = computed(() => {
  return {
    phone: [
      val => /^\d{3}\s\d{3}\s\d{3}$/.test(val) || '手機號碼格式錯誤',
    ]
  }
})
const handleInput = (value) => {
  // 移除所有非數字字符
  let processed = value.replace(/\D/g, '')
  
  // 如果開頭是 0，移除它
  if (processed.startsWith('0')) {
    processed = processed.slice(1)
  }
  
  // 限制長度為 9 位
  processed = processed.slice(0, 9)
  
  emit('update:modelValue', countryCode.value.phoneCode + ' ' + processed)
}
</script>

<style scoped>
.country-code {
  flex: none;
  width: 120px;
}
.phone-input {
  flex: 1;
}
.option-item {
  width: 180px;
}
</style>

<template>
  <div v-if="!loading" class="iframe-container flex column items-center">
    <div v-if="status == 'error' && message" class="warning q-mt-sm">{{ message }}</div>
    <p v-if="status == 'success'" class="iframe-title">您的 Le Oràno 邀請碼</p>
    <q-btn v-if="status == 'success'" class="btn full-width" :label="code" @click="copyCode" @touchend.prevent="copyCode" flat>
      <q-icon v-if="!showCopyTooltip" name="content_copy" size="28px" class="btn-tip"></q-icon>
      <div v-else class="btn-tip">已複製</div>
    </q-btn>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { router } from 'src/router'
import { getMarketingCode } from 'src/api'

onMounted(async () => {
  await getCode()
})

const loading = ref(true)
const status = ref()
const message = ref()
const code = ref()
const getCode = async () => {
  loading.value = true
  const id = router.currentRoute.value.query.id
  const card_numberd = router.currentRoute.value.query.card_number
  const hash_code = await sha256(getBrowserFingerprint())
  const res = await getMarketingCode(id, { hash: hash_code, card_number: card_numberd })
  if (res.code == 0) {
    status.value = 'success'
    code.value = res.data
  } else {
    status.value = 'error'
    switch (res.code) {
      case 11014:
        message.value = '推薦碼已用罄'
        break
      case 11017:
        message.value = '請輸入正確之國泰世華世界卡卡號'
        break
    }
  }
  loading.value = false
}

function getBrowserFingerprint() {
  const fingerprint = {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  }
  return JSON.stringify(fingerprint)
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

async function copyCode() {
  let permission = await navigator.permissions.query({ name: 'clipboard-write' });
  if (permission.state == 'granted' || permission.state == 'prompt') {
    await navigator.clipboard.writeText(code.value);
    showCopySuccess()
  } else {
  const textarea = document.createElement('textarea')
    textarea.value = code.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      showCopySuccess()
    } catch (err) {
      console.error('複製失敗:', err)
    }
    document.body.removeChild(textarea)
  }
}

const showCopyTooltip = ref(false)
function showCopySuccess() {
  showCopyTooltip.value = true
  setTimeout(() => {
    showCopyTooltip.value = false
  }, 2000)
}
</script>

<style scoped>
.iframe-container {
  font-family: 'Noto Serif TC', 'Times New Roman', serif;
}
.iframe-title {
  font-size: 2.14rem;
  font-weight: 700;
  color: #fff;
  margin-top: 2.28rem;
}
.warning {
  letter-spacing: 0.2em;
  background-color: #D21C1C;
  color: #fff;
  border-radius: .25rem;
  padding: .25rem 1rem;
}
.btn {
  position: relative;
  max-width: 585px;
  min-height: 4.63rem;
  font-size: 2.14rem;
  background-color: #F7ECDA;
  color: #0E3456;
  margin-top: 1.14rem;
  border-radius: 0.85rem;
}

.btn-tip {
  position: absolute;
  right: 1rem;
  font-size: 1.42rem;
}

@media (max-width: 1230px) {
  .iframe-title {
    font-size: 1.42rem;
  }
  .btn {
    min-height: 2.88rem;
    font-size: 1.28rem;
    border-radius: 0.57rem;
  }
  .btn-tip {
    font-size: 1.08rem;
  }
}
</style>

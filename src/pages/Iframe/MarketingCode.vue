<template>
  <div class="flex justify-center items-center window-height">
    <q-inner-loading :showing="loading" label="Loading..." />
    <div v-if="!loading">
      <q-card class="q-px-xl q-py-lg" :class="{'bg-teal-1 text-teal-8 cursor-pointer': status === 'success', 'bg-red-1 text-red-8': status === 'error'}" flat bordered>
        <q-card-section>
          <div class="text-h6">{{ message }}</div>
        </q-card-section>
      </q-card>
    </div>
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
    message.value = `推薦碼：${res.data}`
    code.value = res.data
  } else {
    status.value = 'error'
    switch (res.code) {
      case 1:
        message.value = '推薦碼已用罄'
        break
      case 2:
        message.value = '查無此活動'
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
</script>

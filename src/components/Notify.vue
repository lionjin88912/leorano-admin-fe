<template>
  <div></div>
</template>

<script setup>
import { watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAppStore } from 'src/stores/app';

const $q = useQuasar()
const appStore = useAppStore()

watch(appStore.api_response, async () => {
  if (
    appStore.api_response.code != undefined &&
    appStore.api_response.message != "" &&
    appStore.api_response.method &&
    appStore.api_response.method != "get"
  ) {
    await showNotify("top", appStore.api_response.code == 0 ? "success" : "error")
  }
  await appStore.catchApi({ code: "", message: "" })
});

const alert = {
  success: { color: 'teal', message: '操作成功', icon: 'tag_faces' },
  error: { color: 'negative', message: '操作失敗', icon: 'warning' }
}

const showNotify = (position, status = null) => {
  const { color, textColor, multiLine, icon, message, avatar } = alert[status]

  $q.notify({
    color,
    textColor,
    icon: icon,
    message,
    position,
    avatar,
    multiLine,
    timeout: Math.random() * 3000
  })
}
</script>

<style scoped></style>

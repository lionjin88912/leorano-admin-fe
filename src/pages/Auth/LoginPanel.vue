<template>
  <q-form class="login-form absolute-center rounded-2 q-pa-lg" @submit="onSubmit">
    <div class="content">
      <div class="text-headline">
        <img class="" src="logo.svg" />
        <div class="q-pt-none">後台登入</div>
      </div>
      <div class="full-width q-py-lg">
        <q-input class="q-mb-sm" v-model="form.email" placeholder="信箱" :rules="rules.email" outlined />
        <q-input v-model="form.password" type="password" placeholder="密碼" :rules="rules.password" outlined />
      </div>
      <q-btn size="lg" class="q-py-sm q-mx-auto no-shadow text-weight-bold" type="submit" color="primary" label="登入"
        no-caps />
    </div>
  </q-form>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { isValidEmail, isEmpty, messages } from 'src/utils/validators.js'
import { reactive, computed } from 'vue'
import to from 'await-to-js';
import { useAppStore } from 'src/stores/app';
import { router } from 'src/router'

const $q = useQuasar();
const appStore = useAppStore();
const form = reactive({
  email: '',
  password: '',
})

const rules = computed(() => {
  return {
    email: [
      val => !isEmpty(val) || messages.enterEmail(),
      val => isValidEmail(val) || messages.email()
    ],
    password: [
      val => !isEmpty(val) || messages.enterPassword()
    ],
  }
})

const onSubmit = async () => {
  const payload = {
    email: form.email,
    password: form.password
  }

  $q.loading.show();
  const [err, res] = await to(appStore.login(payload))
  $q.loading.hide();
  if (err) {
    console.error('login error:', err)
    return
  }
  router.push('/hotels')
}
</script>

<style lang="scss" scoped>
.login-form {
  width: min(520px, 85vw);
  background-color: #FFF;

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
}
</style>

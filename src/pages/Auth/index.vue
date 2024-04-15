<template>
  <div class="flex flex-center">
    <q-img loading="eager" no-transition style="z-index: -1" src="bg.jpg" fit="cover"
      class="full-width full-height absolute-center" />
    <login-panel />
  </div>
</template>

<script>
import LoginPanel from './LoginPanel'


export default {
  components: { LoginPanel },
  name: 'Login',
  setup() {

    return {}
  },
}
</script>

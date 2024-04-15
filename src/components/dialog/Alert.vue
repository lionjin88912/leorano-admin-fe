<template>
  <q-dialog v-model="isShow" persistent>
    <q-card class="container">
      <q-card-section>
        <slot name="content">
          <div v-if="message" class="flex column flex-center no-wrap q-gutter-sm q-pt-md">
            <q-icon :name="iconName" color="warning" size="34px"></q-icon>
            <div class="message q-py-sm">{{ message }}</div>
          </div>
        </slot>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :label="$t('app.confirm')" color="primary" v-close-popup @click="$emit('confirm')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import { ref, reactive, toRefs } from "vue";
export default {
  setup(props, context) {
    const isShow = ref(false);
    const state = reactive({
      type: "info", // info, positve, warn, error
      message: "",
      iconName: "notifications",
      data: {}
    })

    const show = ({ message, iconName, type, data = {} }) => {
      isShow.value = true;
      state.message = message;
      state.data = data;
      if (type) {
        state.type = type;
      }
      if (iconName) {
        state.iconName = iconName;
      }
    };

    context.expose({ show });

    return {
      isShow,
      ...toRefs(state),
      show,
    };
  },
};
</script>
<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 250px;

  .title {
    font-size: 18px;
    font-weight: 500;
  }

  .message {
    font-size: 16px;
  }
}
</style>

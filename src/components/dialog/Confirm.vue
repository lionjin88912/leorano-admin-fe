<template>
  <q-dialog v-model="isShow" persistent>
    <q-card class="container">
      <q-card-section class="row items-center">
        <div class="title">{{ state.title }}</div>
        <q-space />
        <q-btn icon="close" v-close-popup rounded flat dense @click="$emit('cancel')"></q-btn>
      </q-card-section>
      <q-card-section>
        <slot name="content">
          <div v-if="hasMessage" class="flex row items-center no-wrap q-gutter-sm">
            <q-icon :name="state.iconName" color="warning" size="50px"></q-icon>
            <div class="q-px-sm">
              <div class="message" v-for="(message, index) of state.messages" :key="index">
                {{ message }}
              </div>
              <div class="hint">{{ state.hint }}</div>
            </div>
          </div>
        </slot>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="取消" v-close-popup flat @click="$emit('cancel')" />
        <q-btn color="negative" label="確認" v-close-popup @click="$emit('confirm', state.data)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { ref, reactive, toRefs, computed } from "vue";
const isShow = ref(false);
const state = reactive<DialogData>({
  type: "info", // info, positve, warn, error
  title: null,
  messages: null,
  hint: null,
  iconName: "warning",
  data: {}
})

const hasMessage = computed(() => {
  return state.messages && state.messages.length > 0;
});

type DialogData = {
  title: string | null,
  messages?: string | string[] | null,
  message?: string,
  hint: string | null,
  iconName: string | undefined,
  type: string | null,
  data: any
}
const show = ({ title, messages, message, hint, iconName, type, data = {} }: DialogData) => {
  isShow.value = true;
  state.data = data;
  state.title = title;
  if (message) {
    state.messages = [message]
  } else {
    state.messages = messages
  }
  state.hint = hint;
  if (type) {
    state.type = type;
  }
  if (iconName) {
    state.iconName = iconName;
  }
};

defineExpose({ show })
</script>
<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 350px;

  .title {
    font-size: 18px;
    font-weight: 500;
  }

  .message {
    font-size: 16px;
  }

  .hint {
    font-size: 12px;
    color: $red-5;
  }
}
</style>

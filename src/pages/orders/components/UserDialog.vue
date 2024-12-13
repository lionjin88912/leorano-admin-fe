<template>
  <q-dialog class="common-dialog" v-model="visible">
    <q-card class="container">
      <q-card-section class="sticky-top">
        <div class="flex">
          <div class="text-h6">{{ LABEL[state.type] }}</div>
          <q-space></q-space>
          <q-btn icon="close" flat dense rounded v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="content">
        <UserSelector v-model="state.memberId" :order-member="state.member" :required="true" />
      </q-card-section>
      <q-card-actions class="sticky-bottom">
        <div class="flex-1 items-center justify-end q-gutter-md">
          <q-btn class="dialog-button" outline label="Cancel" color="primary" v-close-popup />
          <q-btn class="dialog-button" type="submit" label="Save" color="primary" @click="doSubmit" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import UserSelector from '../components/UserSelector.vue';

const state = reactive({
  memberId: null,
  member: [],
  type: ''
});

const visible = ref(false)
const LABEL = {
  user: '修改訂購人',
  passenger: '修改出行人'
}
const show = async ({ data }) => {
  state.memberId = data.id;
  state.member = data;
  state.type = data.type;
  visible.value = true;
}

const emit = defineEmits(['confirm']);
function doSubmit() {
  emit('confirm', {
    type: state.type,
    user_id: state.memberId
  });
  visible.value = false;
}

defineExpose({
  show
});

</script>

<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 450px;
  max-width: 100%;

  .content {
    padding-top: 0px;

    &-scroll {
      width: 650px;
      height: 400px;
    }
  }
}
</style>

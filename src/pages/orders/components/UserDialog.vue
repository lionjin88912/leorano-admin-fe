<template>
  <q-dialog class="common-dialog" v-model="visible">
    <q-card class="container">
      <q-card-section class="sticky-top">
        <div class="flex">
          <div class="text-h6">修改出行人</div>
          <q-space></q-space>
          <q-btn icon="close" flat dense rounded v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="content">
        <UserSelector v-model="memberId" :order-member="member" :required="true" />
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
import { ref } from 'vue';
import UserSelector from '../components/UserSelector.vue';

const memberId = ref();
const member = ref([]);

const visible = ref(false)
const show = async ({ data }) => {
  memberId.value = data.id;
  member.value = data;
  visible.value = true;
}

const emit = defineEmits(['confirm']);
function doSubmit() {
  emit('confirm', memberId.value);
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

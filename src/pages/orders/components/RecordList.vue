<template>
  <div class="timeline-input q-mb-md">
    <q-input type="textarea" v-model="recordContent" placeholder="新增訂單記錄" dense outlined />
    <q-btn label="新增" color="primary" class="add-btn q-px-md" size="14px" @click="createHistory" dense unelevated />
  </div>
  <div v-for="(historys, date) in datas" :key="date">
    <div class="text-bold q-mb-sm">{{ date }}</div>
    <div class="timeline q-pl-md q-ml-md">
      <div v-for="history in historys" :key="history.time" class="timeline-item q-my-md">
        <span class="text-caption text-bold">{{ history.time }}</span>
        <span class="text-grey q-ml-sm">{{ history.user }}</span>
        <div class="bg-grey-2 q-px-md q-py-sm q-mt-xs rounded-borders" flat>
          <p v-html="ln2br(history.content)" class="q-ma-none"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrderHistory, createOrderHistory } from 'src/api';
import to from 'await-to-js';

const props = defineProps({
  orderNumber: String,
  type: String
})

const ln2br = (str) => {
  return str.replace(/\n/g, '<br>');
}

const datas = ref([]);
onMounted(() => {
  getList();
})
const getList = async () => {
  const [err, res] = await to(getOrderHistory(props.orderNumber));
  datas.value = res.data;
}

const recordContent = ref('')
const createHistory = async () => {
  const [err, res] = await to(createOrderHistory(props.orderNumber, {
    content: recordContent.value,
    type: props.type,
    idempotent_uuid: generateUuid()
  }));
  recordContent.value = '';
  getList();
}

const generateUuid = () => {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyz'
  
  // 生成一個隨機字元的函數
  const getRandomChar = () => {
    return characters.charAt(Math.floor(Math.random() * characters.length));
  };
  
  // 生成4組4個字元的區塊
  const generateBlock = () => {
    return Array.from({length: 4}, () => getRandomChar()).join('');
  };

  return [
    generateBlock(),
    generateBlock(),
    generateBlock(),
    generateBlock()
  ].join('-');
}
</script>

<style lang="scss" scoped>
.timeline-input {
  position: relative;
  .add-btn {
    position: absolute;
    bottom: 5px;
    right: 5px
  }
}
.timeline {
  border-left: 2px solid $grey-4;
  .timeline-item {
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: 5px;
      left: -23px;
      width: 12px;
      height: 12px;
      background-color: $blue-grey-5;
      border-radius: 50%;
      border: 2px solid #fff;
    }
  }
}
</style>
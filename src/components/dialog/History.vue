<template>
  <q-dialog class="common-dialog" v-model="isShow">
    <q-card class="dialog-inner">
      <q-card-section>
        <div class="row q-col-gutter-x-md">
          <div class="history-list col-xs-12 col-sm-8">
            <div v-for="(historys, date) in datas" :key="date">
              <div class="text-h6 q-mb-xs">{{ date }}</div>
              <q-timeline color="primary" class="history-card bg-grey-1 q-mb-md">
                  <q-timeline-entry
                    v-for="history in historys"
                    :key="history.time"
                    :subtitle="`${history.time} ${history.user}`"
                    :body="history.content"
                  />
              </q-timeline>
            </div>
          </div>
          <div class="col-xs-12 col-sm-4 q-gutter-y-sm">
            <h6>新增紀錄</h6>
            <q-input placeholder="請輸入紀錄內容" v-model="state.content" type="textarea" autogrow outlined />
            <q-btn label="新增" color="primary" class="float-right" @click="createHistory" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { getOrderHistory, createOrderHistory } from 'src/api';
import to from 'await-to-js';
import _ from "lodash";

const isShow = ref(false);
const state = reactive({
  id: null,
  content: null,
  type: null,
})
const show = ({ orderId, type }) => {
  isShow.value = true;
  state.id = orderId;
  state.type = type;
  getList();
};

const datas = ref([]);
const getList = async () => {
  const [err, res] = await to(getOrderHistory(state.id));
  datas.value = res.data;
}

const createHistory = async () => {
  const [err, res] = await to(createOrderHistory(state.id, {
    content: state.content,
    type: state.type,
    idempotent_uuid: generateUuid()
  }));
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

defineExpose({ show });
</script>

<style lang="scss" scoped>
.dialog-inner {
  min-width: 90vw !important;
  height: 600px;
  padding: 15px !important;
  .history-list {
    overflow-y: auto;
  }
  .history-list {
    max-height: calc(100vh - 120px);
  }
  .history-card {
    padding: 20px 20px 0;
    border-radius: 10px;
  }
}
@media (min-width: $breakpoint-md-min) {
  .dialog-inner {
    min-width: 860px !important;
  }
}
</style>

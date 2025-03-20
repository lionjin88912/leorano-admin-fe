<template>
  <q-dialog class="common-dialog" v-model="isShow">
    <q-card class="dialog-inner">
      <q-card-section class="row items-start">
        <div class="col-6">
          <div class="flex justify-between items-end q-mb-sm">
            <div class="text-h6">待辦清單</div>
            <q-btn label="儲存" color="primary" @click="updateTodo" unelevated />
          </div>
          <div class="bg-grey-2 q-pa-md rounded-borders">
            <TodoList v-model="todo" />
          </div>
        </div>
        <div class="col-6 q-pl-xl">
          <RecordList :orderNumber="state.order_number" :type="state.type" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { getOrderTodo, updateOrderTodo } from 'src/api';
import TodoList from './TodoList.vue';
import RecordList from './RecordList.vue';
import to from 'await-to-js';

const isShow = ref(false);
const state = reactive({
  order_number: null,
  type: null,
})
const show = ({ orderNumber, type }) => {
  isShow.value = true;
  state.order_number = orderNumber;
  state.type = type;

  getTodo();
};

const todo = ref([]);
const getTodo = async () => {
  const [err, res] = await to(getOrderTodo(state.order_number));
  todo.value = res.data;
}
const updateTodo = async () => {
  const [err, res] = await to(updateOrderTodo(state.order_number, todo.value));
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

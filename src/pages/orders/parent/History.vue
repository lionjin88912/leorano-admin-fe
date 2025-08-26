<template>
  <div class="row items-start q-mt-md q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-card flat bordered>
        <q-card-section>
          <div>
            <div class="flex justify-between items-end q-mb-sm">
              <div class="text-h6">待辦清單</div>
              <q-btn label="儲存" color="primary" @click="updateTodo" unelevated />
            </div>
            <div class="bg-grey-2 q-pa-md rounded-borders">
              <TodoList v-model="todo" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-md-6">
      <RecordList :orderNumber="orderNumber" type="parent" />
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { ref, onMounted } from 'vue';
import { getOrderTodo, updateOrderTodo } from 'src/api';
import TodoList from '../components/TodoList.vue';
import RecordList from '../components/RecordList.vue';
import to from 'await-to-js';

const $q = useQuasar();
const props = defineProps({
  orderNumber: {
    type: String,
    required: true
  }
})

onMounted(() => {
  getTodo();
});

const todo = ref([]);
const getTodo = async () => {
  $q.loading.show();
  const [err, res] = await to(getOrderTodo(props.orderNumber));
  if (err) {
    console.error("getOrderTodo error:", err);
    return;
  }
  todo.value = res.data;
  $q.loading.hide();
}
const updateTodo = async () => {
  const [err, res] = await to(updateOrderTodo(props.orderNumber, {
    todo: todo.value
  }));
}
</script>
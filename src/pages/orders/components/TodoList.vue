<template>
  <div v-for="(todo, index) in model" :key="index" class="flex justify-between no-wrap">
    <q-checkbox v-model="todo.status" :label="todo.content" :class="{'text-strike': todo.status }" />
    <q-btn icon="delete" color="negative" class="q-px-sm" @click="removeTodo(index)" dense flat />
  </div>
  <div class="row q-gutter-x-sm q-mt-md">
    <q-input v-model="todoContent" placeholder="新增待辦事項" class="col" dense outlined />
    <q-btn label="新增" color="primary" class="add-btn q-px-md" @click="addTodo" outline />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const model = defineModel()

const todoContent = ref('')
const addTodo = () => {
  if (todoContent.value.trim() === '') return
  model.value.push({
    content: todoContent.value,
    status: false
  })
  todoContent.value = ''
}

const removeTodo = (index) => {
  model.value.splice(index, 1)
}
</script>

<style scoped>
.add-btn {
  width: max-content;
}
</style>
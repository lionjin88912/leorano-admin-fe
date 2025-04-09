<template>
  <div v-for="(todo, index) in model" :key="index" class="flex justify-between no-wrap">
    <q-checkbox v-model="todo.status" :label="todo.content" :class="{'text-strike': todo.status }" />
    <q-btn icon="delete" color="negative" class="q-px-sm" @click="removeTodo(index)" dense flat />
  </div>
  <div class="flex q-gutter-sm q-mt-none">
    <q-btn v-for="(prompt, index) in TODO_PROMPT" :key="index" color="primary" :label="prompt" class="prompt-btn" @click="addPrompt(prompt)" outline rounded />
  </div>
  <div class="row q-gutter-x-sm q-mt-sm">
    <q-input v-model="todoContent" placeholder="新增待辦事項" class="col" dense outlined />
    <q-btn label="新增" color="primary" class="add-btn q-px-md" @click="addTodo" outline />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const model = defineModel()

const TODO_PROMPT = [
  '客戶需求是否完整確認(加床、餐食)',
  '付款是否完整',
  '出發前的電話確認'
]
const addPrompt = (prompt) => {
  todoContent.value = prompt
  addTodo()
}

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
.prompt-btn {
  font-size: .75rem;
}
</style>
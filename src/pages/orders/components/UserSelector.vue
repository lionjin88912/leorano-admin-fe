<template>
  <div class="flex justify-between items-start q-gutter-x-lg">
    <p>
      編號：
      <router-link :to="{ name: 'EditMember', params: { id: model.id } }" target="_blank">
        {{ model.id && model.id || '' }}
      </router-link><br />
      姓名：{{ model.id && model.name || '' }}<br />
      信箱：{{ model.id && model.email || '' }}<br />
    </p>
    <div v-if="!disable" class="flex justify-end q-gutter-x-sm">
      <!-- 修改按鈕 - 只在 selector 沒有顯示時顯示 -->
      <q-btn 
        v-if="!showSelector"
        :label="`修改${label}`" 
        color="primary" 
        outline 
        @click="showSelectorInput" 
      />
      
      <!-- q-select - 只在需要時顯示 -->
      <q-select
        v-if="showSelector"
        v-model="selector"
        :options="options"
        option-label="name"
        option-value="id"
        use-input
        input-debounce="500"
        :loading="loading"
        placeholder="搜尋會員姓名、Email、電話"
        clearable
        dense
        outlined
        class="search-select"
        @filter="filterFn"
        @update:model-value="onSelectorChange"
        no-option-label="查無會員資料"
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.name }}</q-item-label>
              <q-item-label caption>{{ scope.opt.email }}</q-item-label>
              <q-item-label caption>ID: {{ scope.opt.id }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        
        <template v-slot:selected-item="scope">
          <span>{{ scope.opt.name }} ({{ scope.opt.id }})</span>
        </template>
      </q-select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getMemberList } from 'src/api';
import { isEmpty, messages } from 'src/utils/validators';
import to from 'await-to-js';

const props = defineProps({
  label: {
    type: String,
    default: '會員'
  },
  required: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  }
});

const selector = ref(null);
const showSelector = ref(false);
const loading = ref(false);
const options = ref([]);

// 顯示 q-select 輸入框
const showSelectorInput = () => {
  showSelector.value = true;
};

// 處理 selector 變更
const onSelectorChange = (newValue) => {
  if (newValue && newValue.id) {
    // 更新 model
    model.value = newValue;
    
    // 清空 selector 並隱藏 q-select
    selector.value = null;
    showSelector.value = false;
    options.value = [];
  }
};

const searchMember = async (keyword) => {
  if (!keyword) {
    options.value = [];
    return;
  }
  
  loading.value = true;
  const [err, res] = await to(getMemberList({
    page: 1,
    limit: 1000, // 設定一個很大的值
    search: keyword,
  }));

  if (res && res.data) {
    options.value = res.data;
  } else {
    options.value = [];
  }
  loading.value = false;
};

const filterFn = (val, update) => {
  update(async () => {
    await searchMember(val);
  });
};

const model = defineModel();
</script>

<style lang="scss" scoped>
.search-select {
  width: 300px;
}
</style>
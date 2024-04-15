<template>
  <div>
    <section class="row justify-between q-mb-lg">
      <div class="flex q-gutter-sm">
        <q-select v-model="currentCountry" label="國家" :options="countryOptions" :input-debounce="500" dense outlined
          use-input fill-input hide-selected @update:model-value="doSearch" @filter="onFilter"></q-select>
        <q-input v-model="searchData.cityName" :debounce="500" style="width: 240px" placeholder="城市名稱" dense outlined>
          <template v-slot:append>
            <q-icon class="cursor-pointer" name="search" @click="doSearch" />
          </template>
        </q-input>
      </div>
      <q-btn color="primary" label="新增城市" @click="doEdit(null)" />
    </section>
    <q-table class="data-table" :rows="cityList" :columns="cityColumns" :loading="loading"
      :rows-per-page-options="[50, 20, 10]" row-key="name">
      <template v-slot:body-cell-name="props">
        <q-td class="link" @click="doEdit(props.row)">
          {{ props.row.name }}
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td>
          <div class="flex no-wrap items-center justify-center q-gutter-sm">
            <q-btn icon="edit" text-color="primary" @click="doEdit(props.row)" rounded dense flat />
            <q-btn icon="delete" text-color="negative" @click="doDelete(props.row)" rounded dense flat />
          </div>
        </q-td>
      </template>
    </q-table>
    <CityEditDialog ref="editDialog" @updated="doSearch"></CityEditDialog>
    <Confirm ref="confirmRef" @confirm="onDeleteConfirm"></Confirm>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { cityColumns } from './enums'
import CityEditDialog from './components/CityEditDialog.vue'
import Confirm from 'src/components/dialog/Confirm.vue'
import _ from "lodash";
import to from 'await-to-js';
import { DeleteCity } from 'src/api';

const editDialog = ref();
const confirmRef = ref();
const $q = useQuasar();
const loading = ref(false)

const currentCountry = ref();
const allOptions = ref([])
const countryOptions = ref([]);
const countryFilterText = ref('');
const searchData = reactive({
  cityName: null
})

const emit = defineEmits(['city-reload'])
const props = defineProps({
  countryList: {
    type: Array,
    default() {
      return [];
    }
  },
  cityList: {
    type: Array,
    default() {
      return [];
    }
  },
});

const doEdit = (item) => {
  editDialog.value.show({
    data: item,
    country: currentCountry.value,
    countryList: allOptions.value
  });
}

const doDelete = (item) => {
  confirmRef.value.show({
    title: '刪除確認',
    message: '確認要刪除嗎？',
    data: item
  });
}

const onDeleteConfirm = async (data) => {
  $q.loading.show();
  const [err, res] = await to(DeleteCity(data.id));
  $q.loading.hide();

  if (err) {
    console.error('delete city error:', err);
    return;
  }
  doSearch();
}

const doSearch = () => {
  if (!currentCountry.value) {
    return;
  }
  emit('city-reload', {
    countryId: currentCountry.value?.value,
    name: searchData.cityName,
  });
}

// const filteredCountryOptions = computed(() => {
//   if (countryFilterText.value) {
//     return countryOptions.value.filter(d => _.toLower(d.label).includes(_.toLower(countryFilterText.value.trim())))
//   }
//   return countryOptions.value;
// });

// const onFilterCountry = (val) => {
//   countryFilterText.value = val;
// }
const onFilter = (val, update, abort) => {
  update(() => {
    if (val) {
      countryOptions.value = allOptions.value.filter(d => _.toLower(d.label).includes(_.toLower(val)))
    } else {
      countryOptions.value = allOptions.value
    }
  })
}

watch(searchData, (_newVal) => {
  doSearch();
});

watch(currentCountry, (newVal) => {
  doSearch();
})

onMounted(() => {
  if (props.countryList.length > 0) {
    allOptions.value = props.countryList.map(d => {
      return {
        label: d.name,
        value: d.id,
      }
    });
    countryOptions.value = allOptions.value;
    currentCountry.value = allOptions.value[0];
  }
})

</script>

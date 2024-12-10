<template>
  <div class="q-gutter-y-lg">
    <div class="flex q-gutter-x-sm">
      <q-space />
      <q-btn label="全部比對 Room 和 Rate" color="primary" @click="doCompareAll" outline />
      <q-btn label="儲存" color="primary" @click="savePlan" />
    </div>
    <q-table :rows="rows" :columns="planCompareColumns" :rows-per-page-options="rowPageOptions" class="data-table" row-key="id">
      <template v-slot:body-cell-room="props">
        <q-td class="text-center">
          <q-select v-model="models[props.row.id].room" :options="roomOptions" label="Room *" :error="models[props.row.id].isEdit && isEmpty(models[props.row.id].room)" :error-message="messages.requiredInput()" map-options emit-value hide-bottom-space outlined dense use-input fill-input hide-selected input-debounce="500" />
        </q-td>
      </template>
      <template v-slot:body-cell-rate="props">
        <q-td class="text-center">
          <q-select v-model="models[props.row.id].rate" :options="rateOptions" label="Rate *" :error="models[props.row.id].isEdit && isEmpty(models[props.row.id].rate)" :error-message="messages.requiredInput()" map-options emit-value hide-bottom-space outlined dense use-input fill-input hide-selected input-debounce="500" />
        </q-td>
      </template>
      <template v-slot:body-cell-operation="props">
        <q-td style="width: 230px;">
          <q-btn label="比對 Room 和 Rate" color="primary" @click="doCompare(props.row)" :disabled="props.row.room && props.row.rate" outline />
          <q-icon v-if="models[props.row.id].isEdit !== null" name="o_check_circle" size="md" :color="models[props.row.id].isEdit ? 'grey-4' : 'green-6'" class="check-icon q-ml-sm"></q-icon>
        </q-td>
      </template>
    </q-table>
    <div class="flex justify-end">
      <q-btn label="儲存" color="primary" @click="savePlan" />
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { ref, watch } from 'vue';
import { planCompareColumns } from '../enums';
import { GetHotelPlanList, GetHotelRoomList, GetHotelRateList, UpdateHotelPlan } from 'src/api';
import { isEmpty, messages } from 'src/utils/validators';
import to from 'await-to-js';

const rowPageOptions = ref([50, 10, 20])
const props = defineProps({
  propsData: Object
});

const roomOptions = ref([]);
const rateOptions = ref([]);
watch(() => props.propsData, async (newVal) => {
  hotelData.value = newVal;
  doSearch();
  roomOptions.value = await getHotelRoomList();
  rateOptions.value = await getHotelRateList();
})

const $q = useQuasar();
const rows = ref([]);
const models = ref({});
const hotelData = ref();
const doSearch = async () => {
  $q.loading.show();
  const [err, res] = await to(GetHotelPlanList({
    hotel_code: hotelData.value.hotel_code,
  }));
  $q.loading.hide();

  if (err) {
    console.error('GetHotelPlanList error:', err);
    return;
  }
  rows.value = res.data.filter(row => row.rate_code);
  rows.value.forEach(row => {
    models.value[row.id] = {
      rate_plan_type: row.rate_plan_type,
      room: row.room ? row.room.id : null,
      rate: row.rate ? row.rate.id : null,
      isEdit: null
    }
  });
}

const getHotelRoomList = async (name) => {
  const [err, res] = await to(GetHotelRoomList({
    hotel_code: hotelData.value.hotel_code,
    name
  }))
  if (err) {
    console.error('getHotelRoomList error:', err)
    return []
  }
  const list = res.data.map(row => {
    return {
      value: row.id,
      label: row.name
    }
  })
  return list
}

const getHotelRateList = async (name) => {
  const [err, res] = await to(GetHotelRateList({
    hotel_code: hotelData.value.hotel_code,
    name
  }))
  if (err) {
    console.error('getHotelRateList error:', err)
    return []
  }
  const list = res.data.map(row => {
    return {
      value: row.id,
      label: row.name,
      tags: row.tags
    }
  })
  return list
}

/* 編輯 Start */
watch(models, (newVal, oldVal) => {
  if (!oldVal) return;
  
  for (let [key, row] of Object.entries(newVal)) {
    let oriRow = rows.value.find(row => row.id === parseInt(key));
    if (row.room || row.rate) {
      if (oriRow.room == null || oriRow.rate == null || row.room !== oriRow.room.id || row.rate !== oriRow.rate.id) {
        row.isEdit = true;
      } else if (row.isEdit === true) {
        row.isEdit = null;
      }
    }
  };
}, { deep: true });
/* 編輯 End */

const doCompare = (row) => {
  let room = row.rate_plan_type.slice(0, 3);
  let rate = row.rate_plan_type.slice(3);
  let roomList = rateOptions.value.find(d => d.tags.includes(room));
  let rateList = roomOptions.value.find(d => d.tags.includes(rate));
}

const doCompareAll = () => {
}

const savePlan = () => {
  $q.loading.show();
  rows.value.forEach(async (row, index) => {
    if (models.value[row.id].isEdit) {
      if (row.room == null || row.rate == null) {
        $q.notify({
          position: 'top',
          message: '表單驗證未通過',
          color: 'negative',
          icon: 'warning'
        });
        return;
      }

      let [err, res] = await to(UpdateHotelPlan(row.id, {
        id: row.id,
        hotel_room_id: models.value[row.id].room,
        hotel_rate_id: models.value[row.id].rate,
      }));
      if (res) {
        rows.value[index] = JSON.parse(JSON.stringify(res.data));
        models.value[row.id].isEdit = false;
      }
    }
  })
  $q.loading.hide();
}
</script>

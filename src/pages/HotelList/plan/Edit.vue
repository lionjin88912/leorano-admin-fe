<template>
  <div class="q-gutter-y-lg">
    <div class="flex q-gutter-x-sm">
      <q-btn-group outline>
        <q-btn color="primary" label="依照 Room 分群" @click="changeGroupType('room')" :outline="groupType !== 'room'" />
        <q-btn color="primary" label="依照 Rate 分群" @click="changeGroupType('rate')" :outline="groupType !== 'rate'" />
      </q-btn-group>
      <q-space />
      <q-btn v-if="isActiveAllCompare" label="全部比對 Room 和 Rate" color="primary" @click="doCompareAll" outline />
      <q-btn v-if="isActiveSaveRoomCode" label="更新 Room Code" color="primary" @click="saveRoomCode" />
      <q-btn v-if="isActiveSaveRateCode" label="更新 Rate Code" color="primary" @click="saveRateCode" />
      <q-btn label="儲存" color="primary" @click="savePlan" />
    </div>
    <q-card v-for="(group, index) in groupRows" :key="index" flat bordered>
      <q-card-section class="plan-row bg-light-blue-1">
        <div class="row q-gutter-x-lg">
          <div class="text-subtitle2 plan-type">Rate Plan Type</div>
          <div class="text-subtitle2 col">Room</div>
          <div class="text-subtitle2 col">Rate</div>
          <div class="text-subtitle2 col">Tags</div>
          <div class="text-subtitle2 plan-operation">操作</div>
        </div>
      </q-card-section>
      <q-card-section v-for="row in group" :key="row.id" class="plan-row">
        <q-form ref="formRef" class="row q-gutter-x-lg text-grey-7">
          <div class="plan-type">{{ row.rate_plan_type }}</div>
          <div class="col">
            <q-select v-model="models[row.id].room" :options="models[row.id].roomOptions" placeholder="Room *" :rules="rules.room" @filter="(val, update, abort) => onfilterRoom(val, update, abort, row.id)" map-options emit-value hide-bottom-space outlined dense use-input fill-input hide-selected input-debounce="500" />
            <div class="text-grey-6">{{ newTpRoom(row) }}</div>
            <div v-if="roomOptions.length > 0 && models[row.id].room" class="row items-center q-gutter-x-xs q-mt-xs">
              <q-badge v-if="models[row.id].isEditRoomCode" :label="newRoomCode(row)" color="grey-4" class="text-black" />
              <q-icon v-if="models[row.id].isEditRoomCode" name="arrow_right_alt" />
              <q-badge :label="row.tmp_room_code" color="grey-4" class="text-black" />
            </div>
          </div>
          <div class="col">
            <q-select v-model="models[row.id].rate" :options="models[row.id].rateOptions" placeholder="Rate *" :rules="rules.rate" @filter="(val, update, abort) => onfilterRate(val, update, abort, row.id)" map-options emit-value hide-bottom-space outlined dense use-input fill-input hide-selected input-debounce="500" />
            <div class="text-grey-6">{{ newTpRate(row) }}</div>
            <div v-if="rateOptions.length > 0 && models[row.id].rate" class="row items-center q-gutter-x-xs q-mt-xs">
              <q-badge v-if="models[row.id].isEditRateCode" :label="newRateCode(row)" color="grey-4" class="text-black" />
              <q-icon v-if="models[row.id].isEditRateCode" name="arrow_right_alt" />
              <q-badge :label="row.tmp_rate_code" color="grey-4" class="text-black" />
            </div>
          </div>
          <div class="col">
            <div @click="showTagSelect(row)">
              <q-field class="cursor-pointer" placeholder="Tags" :hide-bottom-space="false" :hide-hint="false" outlined dense>
                <template v-slot:control>
                  <template v-if="models[row.id].tags">
                    <div class="flex q-gutter-sm">
                      <q-badge v-for="(tag, index) of models[row.id].tags" :key="index" color="green-6">{{ tag.name }}</q-badge>
                    </div>
                  </template>
                </template>
              </q-field>
            </div>
          </div>
          <div class="plan-operation">
            <q-btn v-if="(!row.room || !row.rate) && (isActiveAllCompare || isActiveCompare(row.rate_plan_type))" label="比對" color="primary q-mb-sm" @click="doCompare(row)" outline />
            <div v-if="models[row.id].isEditPlan !== null" class="flex items-center q-gutter-x-xs" :class="models[row.id].isEditPlan ? 'text-grey-5' : 'text-teal'">
              <q-icon name="check"></q-icon><span>更新方案</span>
            </div>
            <div v-if="models[row.id].isEditRoomCode !== null" class="flex items-center q-gutter-x-xs" :class="models[row.id].isEditRoomCode ? 'text-grey-5' : 'text-teal'">
              <q-icon name="check"></q-icon><span>更新 Room Code</span>
            </div>
            <div v-if="models[row.id].isEditRateCode !== null" class="flex items-center q-gutter-x-xs" :class="models[row.id].isEditRateCode ? 'text-grey-5' : 'text-teal'">
              <q-icon name="check"></q-icon><span>更新 Rate Code</span>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
    <SelectTag ref="selectTagRef" @selected="onTagSelected" :multiple="isMultipleTag" />
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { GetHotelPlanList, GetHotelRoomList, GetHotelRateList, UpdateHotelRoom, UpdateHotelRate, UpdateHotelPlan } from 'src/api';
import { isEmpty, messages } from 'src/utils/validators';
import SelectTag from 'src/components/dialog/SelectTag.vue';
import to from 'await-to-js';
import _ from 'lodash'

const props = defineProps({
  propsData: Object
});

const rules = computed(() => {
  return {
    room: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    rate: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
  }
});

const roomOptions = ref([]);
const rateOptions = ref([]);
watch(() => props.propsData, async (newVal) => {
  hotelData.value = newVal;
  roomOptions.value = await getHotelRoomList();
  rateOptions.value = await getHotelRateList();
  doSearch();
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
  rows.value = res.data.filter(row => row.is_enabled);
  rows.value.forEach(row => {
    row.tmp_room_code = row.rate_plan_type.slice(0, 3);
    row.tmp_rate_code = row.rate_plan_type.slice(3);
    models.value[row.id] = {
      rate_plan_type: row.rate_plan_type,
      room: row.room ? row.room.id : null,
      rate: row.rate ? row.rate.id : null,
      tags: [...(row.rate ? row.rate.tags : [] || []), ...(row.tags || [])],
      isEditPlan: null,
      isEditRoomCode: null,
      isEditRateCode: null,
      roomOptions: JSON.parse(JSON.stringify(roomOptions.value)),
      rateOptions: JSON.parse(JSON.stringify(rateOptions.value))
    }
  });
}

// 切換分群類型
const groupType = ref('room');
const pagination = ref({
  rowsPerPage: 0
})
const changeGroupType = (type) => {
  groupType.value = type;
}
const groupRows = computed(() => {
  if (groupType.value === 'room') {
    return Object.groupBy(rows.value, row => row.tmp_room_code);
  } else {
    return Object.groupBy(rows.value, row => row.tmp_rate_code);
  }
});

/* Room 資訊 Start */
// 取得列表
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
      label: row.name,
      code: row.code
    }
  })
  return list
}
// 過濾 Room
const onfilterRoom = async (val, update, abort, index) => {
  if (val === '') {
    update(() => {
      models.value[index].roomOptions = roomOptions.value
    });
    return
  }
  update(() => {
    models.value[index].roomOptions = roomOptions.value.filter(d => _.toLower(d.label).includes(_.toLower(val)))
  });
}
// 新舊資料比對
const newTpRoom = row => {
  return (row.tp_room || []).join('\n')
}
// 取得 Room Code
const newRoomCode = row => {
  let code = roomOptions.value.find(room => room.value === models.value[row.id].room).code;
  return code;
}
// 更新 Room Code
const isActiveSaveRoomCode = computed(() => {
  return Object.values(models.value).some(row => row.isEditRoomCode);
})
const saveRoomCode = async () => {
  $q.loading.show();
  for (let [key, row] of Object.entries(models.value)) {
    if (row.isEditRoomCode) {
      let room = roomOptions.value.find(room => room.value === row.room)
      let [err, res] = await to(UpdateHotelRoom(room.value, {
        id: room.value,
        code: row.rate_plan_type.slice(0, 3)
      }));
      if (res) {
        room.code = row.rate_plan_type.slice(0, 3);
        models.value[key].isEditRoomCode = false;
        setTimeout(() => {
        }, 5000);
      }
    }
  }
  $q.loading.hide();
}
/* Room 資訊 End */

/* Rate 資訊 Start */
// 取得列表
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
      code: row.code
    }
  })
  return list
}
// 過濾 Rate
const onfilterRate = async (val, update, abort, index) => {
  if (val === '') {
    update(() => {
      models.value[index].rateOptions = rateOptions.value
    });
    return
  }
  update(() => {
    models.value[index].rateOptions = rateOptions.value.filter(d => _.toLower(d.label).includes(_.toLower(val)))
  });
}
// 新舊資料比對
const newTpRate = row => {
  return (row.tp_rate || []).join('\n')
}
// 取得 Rate Code
const newRateCode = row => {
  let code = rateOptions.value.find(rate => rate.value === models.value[row.id].rate).code;
  return code;
}
// 更新 Rate Code
const isActiveSaveRateCode = computed(() => {
  return Object.values(models.value).some(row => row.isEditRateCode);
})
const saveRateCode = async () => {
  $q.loading.show();
  for (let [key, row] of Object.entries(models.value)) {
    if (row.isEditRateCode) {
      let rate = rateOptions.value.find(rate => rate.value === row.rate)
      let [err, res] = await to(UpdateHotelRate(rate.value, {
        id: rate.value,
        code: row.rate_plan_type.slice(3)
      }));
      if (res) {
        rate.code = row.rate_plan_type.slice(3);
        models.value[key].isEditRateCode = false;
        setTimeout(() => {
          models.value[key].isEditRateCode = null;
        }, 5000);
      }
    }
  }
  $q.loading.hide();
}
/* Rate 資訊 End */

/* Tag 資訊 Start */
const selectTagRef = ref();
const isMultipleTag = ref(true);
const tagType = {
  id: 16,
  name: 'Benefit'
}
const editRowIndex = ref(null);
const showTagSelect = (row) => {
  selectTagRef.value.show({
    tagTypeId: tagType.id,
    tagTypeName: tagType.name,
    selection: row.tags || [],
    fixedSelection: row.rate.tags || []
  });
  editRowIndex.value = row.id;
};
const onTagSelected = ({ selection }) => {
  models.value[editRowIndex.value].tags = selection;
}
/* Tag 資訊 End */

/* 編輯 Start */
watch(models, (newVal, oldVal) => {
  if (!oldVal) return;
  
  for (let [key, row] of Object.entries(newVal)) {
    let oriRow = rows.value.find(row => row.id === parseInt(key));
    if (row.room || row.rate) {
      let isEditRoom = oriRow.room == null || row.room !== oriRow.room.id;
      let isEditRate = oriRow.rate == null || row.rate !== oriRow.rate.id;
      let isEditTag = JSON.stringify(row.tags.map(tag => tag.id).sort()) != JSON.stringify([...(oriRow.rate ? oriRow.rate.tags : [] || []), ...(oriRow.tags || [])].map(tag => tag.id).sort());
      if (isEditRoom || isEditRate || isEditTag) {
        row.isEditPlan = true;
      } else if (row.isEditPlan === true) {
        row.isEditPlan = null;
      }

      let roomCode = row.rate_plan_type.slice(0, 3);
      if (row.room && roomCode !== roomOptions.value.find(room => room.value === row.room).code) {
        row.isEditRoomCode = true;
      } else if (row.isEditRoomCode === true) {
        row.isEditRoomCode = null;
      }

      let rateCode = row.rate_plan_type.slice(3);
      if (row.rate && rateCode !== rateOptions.value.find(rate => rate.value === row.rate).code) {
        row.isEditRateCode = true;
      } else if (row.isEditRateCode === true) {
        row.isEditRateCode = null;
      }
    }
  };
}, { deep: true });
/* 編輯 End */

/* 比對 Start */
const isActiveCompare = (ratePlanType) => {
  let planRoom = ratePlanType.slice(0, 3);
  let planRate = ratePlanType.slice(3);
  return roomOptions.value.some(room => room.code === planRoom) || rateOptions.value.some(rate => rate.code === planRate);
};
const doCompare = (row) => {
  // 沒有 Room 資料才要比對
  if (!row.room) {
    let planRoom = row.rate_plan_type.slice(0, 3);
    let room = roomOptions.value.find(room => room.code === planRoom);
    if (room) {
      models.value[row.id].room = room.value;
    }
  }
  // 沒有 Rate 資料才要比對
  if (!row.rate) {
    let planRate = row.rate_plan_type.slice(3);
    let rate = rateOptions.value.find(rate => rate.code === planRate);
    if (rate) {
      models.value[row.id].rate = rate.value;
    }
  }
}
/* 比對 End */

/* 全部比對 Start */
const isActiveAllCompare = computed(() => {
  if (rows.value.length === 0)
    return false;

  let rowsNeedCompare = rows.value.filter(row => !row.room || !row.rate);
  if (rowsNeedCompare.length === 0)
    return false;

  let newRoomCodeList = [... new Set(rowsNeedCompare.map(row => row.tmp_room_code))];
  let newRateCodeList = [... new Set(rowsNeedCompare.map(row => row.tmp_rate_code))];
  return roomOptions.value.some(room => newRoomCodeList.includes(room.code)) || rateOptions.value.some(rate => newRateCodeList.includes(rate.code));
})
const doCompareAll = () => {
  rows.value.forEach(row => {
    doCompare(row);
  })
}
/* 全部比對 End */
const formRef = ref();
const savePlan = () => {
  $q.loading.show();
  rows.value.forEach(async (row, index) => {
    if (models.value[row.id].isEditPlan) {
      if (!await formRef.value[index].validate()) {
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
        tags: models.value[row.id].tags.map(tag => tag.id)
      }));
      if (res) {
        rows.value[index] = JSON.parse(JSON.stringify(res.data));
        rows.value[index].tmp_room_code = rows.value[index].rate_plan_type.slice(0, 3);
        rows.value[index].tmp_rate_code = rows.value[index].rate_plan_type.slice(3);
        models.value[row.id].isEditPlan = false;
      }
    }
  })
  $q.loading.hide();
}
</script>

<style lang="scss" scoped>
.plan-row {
  border-top: 1px solid $grey-4;
  .plan-type {
    width: 100px;
  }
  .plan-operation {
    width: 130px;
  }
}
</style>
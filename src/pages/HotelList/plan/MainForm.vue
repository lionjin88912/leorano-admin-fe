<template>
  <div class="flex-1">
    <q-form ref="form" class="edit-form q-gutter-md">
      <div class="flex justify-end q-gutter-x-md">
        <q-toggle v-model="model.is_reviewed" left-label label="已比對"
          @update:model-value="(val) => updateStatus('is_reviewed', val)"></q-toggle>
        <q-toggle v-model="model.is_enabled" left-label label="上架"
          @update:model-value="(val) => updateStatus('is_enabled', val)"></q-toggle>
      </div>
      <div class="flex-1">
        <q-select class="edit-form-field q-pr-lg" v-model="model.room.id" :options="roomOptions" label="Room *"
          map-options emit-value hide-bottom-space outlined dense use-input fill-input hide-selected input-debounce="500"
          @filter="onRoomFilter">
          <template #prepend>
            <q-icon name="info" size="24px" color="primary" @click.stop.prevent>
              <RawDataInfo data-name="Room" :raw-datas="roomRawDatas"></RawDataInfo>
            </q-icon>
          </template>
        </q-select>
        <q-select class="edit-form-field" v-model="model.rate.id" :options="rateOptions" label="Rate *" map-options
          emit-value hide-bottom-space outlined dense use-input fill-input hide-selected input-debounce="500"
          @filter="onRateFilter">
          <template #prepend>
            <q-icon name="info" size="24px" color="primary" @click.stop.prevent>
              <RawDataInfo data-name="Rate" :raw-datas="rateRawDatas"></RawDataInfo>
            </q-icon>
          </template>
        </q-select>
      </div>
      <div class="flex-1">
        <q-input class="edit-form-field q-pr-lg" v-model="model.rate_plan_type" label="Rate Plan Type" hide-bottom-space
          outlined readonly dense></q-input>
        <q-input class="edit-form-field q-pr-lg" v-model="model.rate_code" label="Rate Code" hide-bottom-space outlined
          readonly dense></q-input>
        <q-input class="edit-form-field" v-model="rateCategory" label="Rate Category" hide-bottom-space outlined readonly
          dense></q-input>
      </div>
      <div class="bg-grey-2">
        <q-expansion-item header-class="text-primary" label="新舊資料比對" :content-inset-level="0" switch-toggle-side dense
          expand-separator @show="emit('comparing')" @hide="emit('compared')" default-opened>
          <div class="flex-1 column q-pa-md">
            <div class="flex q-gutter-x-sm q-pb-sm">
              <q-input v-model="newTpRoom" class="flex-1" label="New Room" type="textarea" :rows="1" autogrow outlined
                dense readonly></q-input>
              <q-input v-model="prevTpRoom" class="flex-1" label="Previous Room" type="textarea" :rows="1" autogrow
                outlined dense readonly></q-input>
            </div>
            <div class="flex q-gutter-x-sm q-pb-sm">
              <q-input v-model="newTpRate" class="flex-1" label="New Rate" type="textarea" rows="3" autogrow outlined
                dense readonly></q-input>
              <q-input v-model="prevTpRate" class="flex-1" label="Previous Rate" type="textarea" rows="3" autogrow
                outlined dense readonly></q-input>
            </div>
            <div class="flex q-gutter-x-sm q-pb">
              <q-input v-model="newTpDesc" class="flex-1" label="New Desc" type="textarea"
                input-style="min-height: 100px;" autogrow outlined dense readonly></q-input>
              <q-input v-model="prevTpDesc" class="flex-1" label="Previous Desc" type="textarea"
                input-style="min-height: 100px;" autogrow outlined dense readonly></q-input>
            </div>
          </div>
        </q-expansion-item>
      </div>
      <div @click="showTagSelect()">
        <q-field class="edit-form-field cursor-pointer" label="Tags" :hide-bottom-space="false" :hide-hint="false"
          :stack-label="isStackLabel(computedTags)" outlined dense>
          <template v-slot:control>
            <template v-if="computedTags">
              <div class="tag-list">
                <div v-for="(tag, index) of computedTags" :key="index" class="tag">{{ tag.name }}</div>
              </div>
            </template>
          </template>
        </q-field>
      </div>
      <q-input v-model="model.desc" label="Description" type="textarea" hide-bottom-space outlined autogrow
        input-style="min-height: 100px;" readonly dense></q-input>
      <q-input v-model="model.cancellation" label="Cancel Policy" type="textarea" hide-bottom-space outlined autogrow
        input-style="min-height: 100px;" readonly dense></q-input>
      <div>
        <div class="flex q-gutter-sm">
          <span class="text-bold">Guarantee Type:</span>
          <span class="text-grey-7">{{ model.guarantee_type }}</span>
        </div>
        <div class="flex q-gutter-sm">
          <span class="text-bold">Non-Refundable:</span>
          <span class="text-grey-7">{{ model.is_non_refundable }}</span>
        </div>
        <div class="flex q-gutter-sm">
          <span class="text-bold">Cancel Deadline:</span>
          <span class="text-grey-7">{{ getDateString(model.cancel_deadline, 'YYYY-MM-DD HH:mm') }}</span>
        </div>
      </div>
    </q-form>
    <SelectTag ref="selectTagRef" @selected="onTagSelected" :multiple="isMultipleTag" />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar';
import to from 'await-to-js';
import SelectTag from 'src/components/dialog/SelectTag.vue';
import RawDataInfo from './RawDataInfo.vue';
import { GetHotelRoomList, GetHotelRateList } from 'src/api';
import { getDateString } from 'src/utils/helpers';
import { RateCategoryList } from '../enums';

const emit = defineEmits(['comparing', 'compared', 'update:status'])
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {}
    }
  },
  hotelData: Object
});

const $q = useQuasar();
const form = ref();
const selectTagRef = ref();
const model = ref({ room: {}, rate: {} });
const isMultipleTag = ref(true);
const hotel = ref();
const tagType = {
  id: 16,
  name: 'Benefit'
}
const roomOptions = ref([]);
const rateOptions = ref([]);

const roomRawDatas = ref([]);
const rateRawDatas = ref([]);

const showTagSelect = () => {
  selectTagRef.value.show({
    tagTypeId: tagType.id,
    tagTypeName: tagType.name,
    selection: model.value.tags || [],
    fixedSelection: model.value.rate.tags || []
  });
};

const onTagSelected = ({ selection }) => {
  const newSelection = selection.filter(d => {
    return !model.value.rate.tags.find(c => c.id === d.id)
  });
  model.value.tags = newSelection;
}

const getHotelRoomList = async (name) => {
  const [err, res] = await to(GetHotelRoomList({
    hotel_code: model.value.hotel_code,
    name
  }))
  if (err) {
    console.error('getHotelRoomList error:', err)
    return []
  }
  const list = res.data.map((d) => {
    return {
      value: d.id,
      label: d.name
    }
  })
  return list
}

const getHotelRateList = async (name) => {
  const [err, res] = await to(GetHotelRateList({
    hotel_code: model.value.hotel_code,
    name
  }))
  if (err) {
    console.error('getHotelRateList error:', err)
    return []
  }
  const list = res.data.map((d) => {
    return {
      value: d.id,
      label: d.name,
      tags: d.tags
    }
  })
  return list
}

const isStackLabel = (items) => {
  return items && items.length > 0;
}

const updateStatus = (key, val) => {
  let data = {}
  data[key] = val
  emit('update:status', data);
}

const onRoomFilter = (val, update) => {
  update(async () => {
    roomOptions.value = await getHotelRoomList(val)
  })
}

const onRateFilter = (val, update) => {
  update(async () => {
    rateOptions.value = await getHotelRateList(val)
  })
}

const computedTags = computed(() => {
  return [...(model.value.rate.tags || []), ...(model.value.tags || [])];
})

const rateCategory = computed(() => {
  if (!model.value.rate_category || model.value.rate_category.trim().length <= 0) {
    return 'N/A'
  }
  return RateCategoryList.find(d => d.value == model.value.rate_category)?.label || model.value.rate_category
})

const newTpRoom = computed(() => {
  return (model.value.tp_room || []).join('\n')
})

const prevTpRoom = computed(() => {
  return (model.value.tp_previous_room || []).join('\n')
})

const newTpRate = computed(() => {
  return (model.value.tp_rate || []).join('\n')
})

const prevTpRate = computed(() => {
  return (model.value.tp_previous_rate || []).join('\n')
})

const newTpDesc = computed(() => {
  return (model.value.tp_desc || []).join('\n')
})

const prevTpDesc = computed(() => {
  return (model.value.tp_previous_desc || []).join('\n')
})

watch(() => props.data, async (newVal) => {
  if (!props.data.hotel_code) {
    return;
  }
  $q.loading.show();
  hotel.value = props.hotelData;
  model.value = props.data;
  model.value.room = Object.assign({}, model.value.room)
  model.value.rate = Object.assign({}, model.value.rate)
  model.value.desc = (props.data.tp_desc || []).join('\n')
  model.value.rate_plan_type = model.value.rate_plan_type || 'N/A'
  model.value.rate_code = model.value.rate_code || 'N/A'
  model.value.cancellation = (props.data.tp_cancellation || []).join('\n');

  roomRawDatas.value = [
    ...(model.value.tp_room || []),
    ...(model.value.tp_room_detail || []),
    ...(model.value.tp_room_rate || [])
  ];
  rateRawDatas.value = [
    ...(model.value.tp_rate || []),
    ...(model.value.tp_rate_comment || []),
    ...(model.value.tp_rate_desc || []),
  ]


  roomOptions.value = await getHotelRoomList();
  rateOptions.value = await getHotelRateList();
  $q.loading.hide();
})

const validate = async () => {
  return await form.value.validate();
}

const getModel = () => {
  return {
    id: model.value.id,
    hotel_room_id: model.value.room.id,
    hotel_rate_id: model.value.rate.id,
    tags: model.value.tags.map(d => d.id),
    is_enabled: model.value.is_enabled
  }
}

defineExpose({ validate, getModel })

</script>
<style lang="scss" scoped>
.edit-form {
  display: flex;
  flex: 1;
  flex-direction: column;

  // width: 450px;
  &-field {
    display: flex;
    flex: 1;
    // max-width: 300px;

    &.full {
      // cursor: pointer;
      max-width: 100%;
    }
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;

  .tag {
    padding: 1px 4px;
    margin: 4px;
    border-radius: 4px;
    background-color: $green-5;
    color: $grey-1;
    font-size: 12px;

    &:hover {
      background-color: $green-7;
    }
  }
}

.opacity-15 {
  opacity: 0.15;
}
</style>

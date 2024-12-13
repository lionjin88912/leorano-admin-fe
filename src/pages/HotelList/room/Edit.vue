<template>
  <div>
    <section>
      <div class="flex justify-between q-pb-lg">
        <q-input v-model="searchData.name" :debounce="500" label="房型名稱" clearable dense outlined />
        <div id="relativeButton" class="flex q-gutter-x-sm">
          <q-btn label="新增" color="primary" @click="addRoom" outline />
          <q-btn label="儲存" color="primary" @click="saveRoom" />
        </div>
      </div>
      <div id="fixedButton" class="fixed-button flex column q-gutter-y-sm hidden">
        <q-btn icon="add" color="primary" class="bg-white" @click="addRoom" round outline />
        <q-btn icon="save" color="primary" @click="saveRoom" round />
      </div>
      <q-form ref="formRef" v-for="row in filterRows" :key="row.id" class="room-item relative row bg-grey-1 q-pa-md q-mb-lg border-radius-md" flat>
        <q-icon v-if="row.isEdit !== null" name="o_check_circle" size="md" :color="row.isEdit ? 'grey-4' : 'green-6'" class="check-icon text-right"></q-icon>
        <div class="row q-col-gutter-xs col-xs-12 col-sm col-lg-7 q-pr-sm-md">
          <q-input v-model='row.name' label='Name *' class="col-xs-12 col-sm-6" :rules="rules.name" @blur="doAutoCode(row)" lazy-rules dense outlined />
          <q-input v-model='row.code' label='Code *' class="col-xs-12 col-sm-6" :rules="rules.code" lazy-rules dense outlined />
          <q-input v-model='row.langs[0].name' label='繁中 Name' class="col-xs-12 col-sm-6" lazy-rules dense outlined />
          <q-input v-model='row.langs[1].name' label='簡中 Name' class="col-xs-12 col-sm-6" lazy-rules dense outlined />
          <q-input v-model='row.size' label='Size' class="col-4" lazy-rules dense outlined />
          <q-input v-model='row.max_guest_number' label='Max Guset Number' class="col-4" suffix="Person" :rules="rules.max_guest_number" lazy-rules dense outlined />
          <div class="col-4 cursor-pointer" @click="showTagSelect(row, 'Bed')" >
            <q-field v-model="row.bedType" label="Bed Type" :hide-hint="false" :stack-label="!!row.bedType" outlined dense>
              <template v-slot:control>
                <div v-if="row.bedType">
                  <q-badge color="green-6">{{ row.bedType.name }}</q-badge>
                </div>
              </template>
            </q-field>
          </div>
          <div class="col-xs-12 cursor-pointer" @click="showTagSelect(row, 'View')">
            <q-field label="View" :hide-hint="false" :stack-label="isStackLabel(row.views)" outlined dense>
              <template v-slot:control>
                <template v-if="row.views && row.views.length > 0">
                  <div class="flex q-gutter-sm">
                    <q-badge v-for="(tag, index) of row.views" :key="index" color="green-6">{{ tag.name }}</q-badge>
                  </div>
                </template>
              </template>
            </q-field>
          </div>
        </div>
        <div class="room-image col-xs-12 col-sm col-lg-5 q-pl-sm-md q-pt-lg q-pt-sm-none">
          <div class="flex q-gutter-sm items-center q-mb-md">
            <q-btn color="primary" label="選擇圖片" @click="showMedia(row)" outline />
            <p class="q-mb-none">最多可選 10 張</p>
          </div>
          <div class="row q-col-gutter-xs">
            <div v-for="(v, index) in row.photos" :key="index" class="image-wrap" :class="{ 'pick': v.is_cover }">
              <q-img class="cursor-pointer" :class="{ 'cover': v.is_cover }" :src="releaseUrl(v)" :ratio="1" fit="cover" spinner-color="white" loading="lazy" @click="setCover(row, index)">
                <div v-if="v.is_cover" class="absolute-bottom text-subtitle2 text-center">
                  封面
                </div>
              </q-img>
            </div>
          </div>
        </div>
      </q-form>
    </section>
    <GetMedia ref="mediaRef" v-if="hotelData" :hotelId="hotelData.id" :max-amount="maxImageAmount" :propsDefault="defaultPhotos" @handleMedia="onPhotoSelected" />
    <SelectTag ref="selectTagRef" @selected="onTagSelected" :multiple="isMultipleTag" />
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { GetHotelRoomList, CreateHotelRoom, UpdateHotelRoom, UpdateHotelRoomLang } from 'src/api';
import { isEmpty, isPositiveInteger, messages } from 'src/utils/validators';
import GetMedia from 'src/pages/HotelList/GetMedia.vue';
import SelectTag from 'src/components/dialog/SelectTag.vue';
import to from 'await-to-js';
import _ from "lodash";

const props = defineProps({
  propsData: Object
});

const rules = computed(() => {
  return {
    name: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    code: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    max_guest_number: [
      // val => !isEmpty(val) || messages.requiredInput(),
      val => isEmpty(val) || isPositiveInteger(val) || messages.inputPositiveInteger()
    ]
  }
});

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      document.getElementById('fixedButton').classList.add('hidden');
    } else {
      document.getElementById('fixedButton').classList.remove('hidden');
    }
  }, {
    rootMargin: '-25px 0px 25px 0px',
    threshold: 1.0
  });
  observer.observe(document.getElementById('relativeButton'));
})

const $q = useQuasar();
const oriRows = ref([]);
const doSearch = async () => {
  $q.loading.show();
  const [err, res] = await to(GetHotelRoomList({
    hotel_code: hotelData.value.hotel_code
  }));
  $q.loading.hide();

  if (err) {
    console.error('GetHotelRoomList error:', err);
    return;
  }
  oriRows.value = res.data;
  oriRows.value.forEach(row => {
    let langs = row.langs.map(lang => lang.lang);
    if (!langs.includes('zh-TW')) {
      row.langs.unshift({ lang: 'zh-TW', name: '' });
    }
    if (!langs.includes('zh-CN')) {
      row.langs.push({ lang: 'zh-CN', name: '' });
    }
    row.bedType = row.tags.find(d => d.tag_type_id === 3);
    row.views = row.tags.filter(d => d.tag_type_id === 10);
    row.isEdit = null
  });
  newRows.value = JSON.parse(JSON.stringify(oriRows.value));
}
const hotelData = ref();
watch(() => props.propsData, (newVal) => {
  hotelData.value = newVal;
  doSearch();
})

/* 搜尋 Start */
const newRows = ref([]);
const searchData = reactive({
  name: '',
});
const filterRows = computed(() => {
  if (!searchData.name || searchData.name.trim().length <= 0) {
    return newRows.value;
  } else {
    return newRows.value.filter(row => {
      let keywords = searchData.name.toLowerCase().split(' ');
      return keywords.some(keyword => row.name.toLowerCase().includes(keyword));
    });
  }
});
/* 搜尋 End */

/* 編輯 Start */
watch(newRows, (newVal, oldVal) => {
  if (!oldVal) return;
  
  newVal.forEach((row, index) => {
    if (row.id) {
      let oriRow = JSON.parse(JSON.stringify(oriRows.value[index]));
      let newRow = JSON.parse(JSON.stringify(row));
      delete oriRow.isEdit;
      delete newRow.isEdit;
      if (JSON.stringify(newRow) !== JSON.stringify(oriRow)) {
        row.isEdit = true;
      } else if (row.isEdit === true) {
        row.isEdit = null;
      }
    }
  });
}, { deep: true });
/* 編輯 End */

/* 自動產生 Code Start */
const doAutoCode = (room) => {
  if (room.code) {
    return;
  }
  room.code = _.snakeCase(room.name);
}
/* 自動產生 Code End */

/* 選擇 Tag Start */
const isStackLabel = (items) => {
  return items && items.length > 0;
}

const editRoom = ref();
const isMultipleTag = ref(true);
const selectTagRef = ref();
const tagTypeList = {
  "Amenity": { value: 2, label: "Room Amenity" },
  "Bed": { value: 3, label: "Bedding Type" },
  "View": { value: 10, label: "Hotel Room View Type" }
}
const showTagSelect = (room, typeName) => {
  let selection = [];
  isMultipleTag.value = true;
  switch (typeName) {
    case "View":
      selection = room.views || [];
      break;
    case "Bed":
      selection = room.bedType ? [room.bedType] : [];
      isMultipleTag.value = false;
      break;
  }
  selectTagRef.value.show({
    tagTypeId: tagTypeList[typeName].value,
    tagTypeName: typeName,
    selection: selection
  });
  editRoom.value = room;
};
const onTagSelected = ({ selection, tagTypeName }) => {
  switch (tagTypeName) {
    case "View":
      editRoom.value.views = selection;
      break;
    case "Bed":
      editRoom.value.bedType = selection[0];
      break;
  }
}
/* 選擇 Tag End */

/* 圖片 Start */
const maxImageAmount = ref(10);
const mediaRef = ref();
const defaultPhotos = ref({});
const currentCoverMediaId = ref();
const showMedia = (room) => {
  const defaults = {};
  for (let photo of (room.photos || [])) {
    defaults[photo.media_id] = {
      media_id: photo.media_id,
      url_format: photo.src
    }
    if (photo.is_cover) {
      currentCoverMediaId.value = photo.media_id;
    }
  }
  defaultPhotos.value = defaults;
  mediaRef.value.handleOpenModal();
  editRoom.value = room;
};
const onPhotoSelected = (datas) => {
  editRoom.value.photos = [];
  for (const [key, value] of Object.entries(datas)) {
    editRoom.value.photos.push({
      id: value.id,
      media_id: key,
      url: value.src,
      // url_format: value.src,
      is_cover: key === currentCoverMediaId.value
    })
  }
}
const setCover = (room, index) => {
  let cover = room.photos.find(photo => photo.is_cover);
  if (cover) {
    cover.is_cover = false;
  }
  room.photos[index].is_cover = true;
  currentCoverMediaId.value = room.photos[index].media_id;
};
const releaseUrl = (item) => {
  return item.url?.replace("%s", "M")
}
/* 圖片 End */

/* 新增房型 Start */
const addRoom = async () => {
  await newRows.value.push({
    code: '',
    name: '',
    hotel_code: hotelData.value.hotel_code,
    max_guest_number: 3,
    size: null,
    langs: [
      {
        lang: 'zh-TW',
        name: ''
      }, {
        lang: 'zh-CN',
        name: ''
      }
    ],
    bedType: null,
    views: [],
    photos: [],
    isEdit: true
  })
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
}
/* 新增房型 End */

/* 儲存 Start */
const getModel = (model) => {
  const tags = [
    ...model.views.map(d => d.id),
  ];
  if (model.bedType) {
    tags.push(model.bedType.id)
  }
  return {
    id: model.id,
    name: model.name,
    code: model.code,
    hotel_code: model.hotel_code,
    size: model.size,
    summary: model.summary,
    desc: model.desc,
    photos: model.photos,
    max_guest_number: Number(model.max_guest_number),
    tags,
    langs: model.langs.map(lang => ({
      lang: lang.lang,
      name: lang.name
    }))
  }
}
const formRef = ref();
const saveRoom = () => {
  $q.loading.show();
  newRows.value.forEach(async (row, index) => {
    if (!await formRef.value[index].validate()) {
      $q.notify({
        position: 'top',
        message: '表單驗證未通過',
        color: 'negative',
        icon: 'warning'
      });
      return;
    }
    const data = await getModel(row);
    let err, res;
    if (!row.id) {
      [err, res] = await to(CreateHotelRoom(data));
    } else if (row.isEdit) {
      [err, res] = await to(UpdateHotelRoom(row.id, data));
    }
    if (res) {
      row.id = res.data.id;
      oriRows.value[index] = JSON.parse(JSON.stringify(row));
      row.isEdit = false;
    }
  })
  $q.loading.hide();
}
/* 儲存 End */
</script>

<style lang="scss" scoped>
.room-item {
  border-radius: 5px;
  .q-input {
    padding-bottom: 20px;
  }
}
.image-wrap {
  width: 20%;
  &.pick .q-img {
    border: 3px solid $positive;
  }
  .text-subtitle2 {
    padding: 5px;
  }
}
.fixed-button {
  position: fixed;
  bottom: 80px;
  right: 25px;
  z-index: 2;
}
.check-icon {
  margin-bottom: 10px;
  margin-left: auto;
}
@media (min-width: $breakpoint-sm-min) {
  .room-item {
    .q-input:nth-last-child(-n + 2) {
      padding-bottom: 0;
    }
  }
  .check-icon {
    position: absolute;
    top: 12px;
    right: 12px;
  }
  .room-image {
    border-left: 1px dashed $grey-5;
  }
  .image-wrap {
    width: 25%;
  }
}
@media (min-width: 860px) {
  .image-wrap {
    width: 20%;
  }
}
</style>

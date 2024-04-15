<template>
  <div class="flex-1">
    <q-form ref="form" class="edit-form q-gutter-md">
      <div class="flex-1">
        <q-input class="edit-form-field q-pr-lg" v-model="model.name" label="Name *" :rules="rules.name" hide-bottom-space
          lazy-rules outlined dense @blur="doAutoCode"></q-input>
        <q-input class="edit-form-field" v-model="model.code" label="Code *" :rules="rules.code" hide-bottom-space
          lazy-rules outlined dense></q-input>
      </div>
      <div class="flex-1">
        <q-input class="edit-form-field q-pr-lg" v-model="model.size" label="Size" hide-bottom-space lazy-rules outlined
          dense></q-input>
        <q-input class="edit-form-field" v-model="model.max_guest_number" type="number" label="Max Guest Number"
          suffix="Person" :rules="rules.max_guest_number" hide-bottom-space lazy-rules outlined dense></q-input>
      </div>
      <div class="flex-1" @click="showTagSelect('Bed')">
        <q-field class="edit-form-field cursor-pointer" v-model="model.bedType" label="Bed Type" hide-bottom-space
          :hide-hint="false" :stack-label="!!model.bedType" outlined dense>
          <template v-slot:control>
            <div v-if="model.bedType">
              <div class="tag-list">
                <div class="tag">{{ model.bedType.name }}</div>
              </div>
            </div>
          </template>
        </q-field>
      </div>
      <div @click="showTagSelect('View')">
        <q-field class="edit-form-field cursor-pointer" label="View" :hide-bottom-space="false" :hide-hint="false"
          :stack-label="isStackLabel(model.views)" outlined dense>
          <template v-slot:control>
            <template v-if="model.views && model.views.length > 0">
              <div class="tag-list">
                <div v-for="(tag, index) of model.views" :key="index" class="tag">{{ tag.name }}</div>
              </div>
            </template>
          </template>
        </q-field>
      </div>
      <div @click="showTagSelect('Amenity')">
        <q-field class="edit-form-field cursor-pointer" label="Amenities" :stack-label="isStackLabel(model.amenities)"
          outlined dense>
          <template v-slot:control>
            <template v-if="model.amenities && model.amenities.length > 0">
              <div class="tag-list">
                <div v-for="(tag, index) of model.amenities" :key="index" class="tag">{{ tag.name }}</div>
              </div>
            </template>
          </template>
        </q-field>
      </div>
      <q-input v-model="model.summary" label="Summary" hide-bottom-space lazy-rules outlined dense></q-input>
      <q-input v-model="model.desc" label="Description" type="textarea" hide-bottom-space lazy-rules outlined autogrow
        dense input-style="min-height: 100px;"></q-input>
      <div class="q-py-sm">
        <div class="text-bold text-grey-9">房型圖片</div>
        <div class="flex q-gutter-md items-center">
          <div class="text-grey-7">最多可選 {{ maxImageAmount }} 張圖片</div>
          <q-btn label="選擇圖片" color="primary" @click="mediaRef.handleOpenModal()" outline></q-btn>
        </div>
        <div class="flex items-start q-gutter-md q-pa-md">
          <div class="flex column items-center justify-center" v-for="(v, index) in model.photos" :key="index">
            <q-img class="hotel-img" :class="{ 'cover': v.is_cover }" :src="releaseUrl(v)" fit="cover" width="160px"
              height="120px" spinner-color="white" loading="lazy" @click="setCover(index)" />
            <div v-if="v.is_cover" class="cover-text">封面</div>
          </div>
        </div>
      </div>
    </q-form>
    <GetMedia ref="mediaRef" :hotelId="hotel.id" :max-amount="maxImageAmount" :propsDefault="defaultPhotos"
      @handleMedia="onPhotoSelected" />
    <SelectTag ref="selectTagRef" @selected="onTagSelected" :multiple="isMultipleTag" />
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useQuasar } from 'quasar';
import _ from "lodash";
import { isEmpty, isPositiveInteger, messages } from 'src/utils/validators';
import GetMedia from 'src/pages/HotelList/GetMedia.vue';
import SelectTag from 'src/components/dialog/SelectTag.vue';

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
const mediaRef = ref();
const selectTagRef = ref();
const model = ref({});
const hotel = ref();
const maxImageAmount = ref(10);
const isMultipleTag = ref(true);
const tagTypeList = {
  "Amenity": { value: 2, label: "Room Amenity" },
  "Bed": { value: 3, label: "Bedding Type" },
  "View": { value: 10, label: "Hotel Room View Type" }
}
const currentCoverMediaId = ref();

const isStackLabel = (items) => {
  return items && items.length > 0;
}

const showTagSelect = (typeName) => {
  let selection = [];
  isMultipleTag.value = true;
  switch (typeName) {
    case "View":
      selection = model.value.views || [];
      break;
    case "Amenity":
      selection = model.value.amenities || [];
      break;
    case "Bed":
      selection = model.value.bedType ? [model.value.bedType] : [];
      isMultipleTag.value = false;
      break;
  }
  selectTagRef.value.show({
    tagTypeId: tagTypeList[typeName].value,
    tagTypeName: typeName,
    selection: selection
  });
};

const onTagSelected = ({ selection, tagTypeName }) => {
  // console.log('onTagSelected:', selection);
  switch (tagTypeName) {
    case "View":
      model.value.views = selection;
      break;
    case "Amenity":
      model.value.amenities = selection;
      break;
    case "Bed":
      model.value.bedType = selection[0];
      break;
  }
}
const onPhotoSelected = (datas) => {
  // console.log('onPhotoSelected:', datas);
  model.value.photos = [];
  for (const [key, value] of Object.entries(datas)) {
    model.value.photos.push({
      id: value.id,
      media_id: key,
      url: value.src,
      // url_format: value.src,
      is_cover: value.is_cover || key === currentCoverMediaId.value
    })
  }
}

const defaultPhotos = computed(() => {
  const defaults = {};
  for (let photo of (model.value.photos || [])) {
    defaults[photo.media_id] = {
      media_id: photo.media_id,
      url_format: photo.src,
      is_cover: photo.is_cover
    }
  }
  return defaults;
});

const setCover = (index) => {
  // console.log('setCover:', model.value.photos)
  for (let i in model.value.photos) {
    model.value.photos[i].is_cover = (Number(i) === Number(index))
    if (model.value.photos[i].is_cover) {
      currentCoverMediaId.value = model.value.photos[i].media_id
    }
  }
};

const releaseUrl = (item) => {
  return item.url?.replace("%s", "M")
}

const doAutoCode = () => {
  if (model.value.code) {
    return;
  }
  model.value.code = _.snakeCase(model.value.name);
}

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
    ],
    // bedType: [
    //   val => !isEmpty(val) || messages.requiredInput()
    // ],
    // size: [
    //   val => !isEmpty(val) || messages.requiredInput()
    // ],
    // summary: [
    //   val => !isEmpty(val) || messages.requiredInput()
    // ],
    // desc: [
    //   val => !isEmpty(val) || messages.requiredInput()
    // ],
  }
});

watchEffect(() => {
  // console.log('hotelData:', props.hotelData);
  hotel.value = props.hotelData;
  model.value = props.data;
  model.value.hotel_code = hotel.value.hotel_code;
  for (let photo of (model.value.photos || [])) {
    if (photo.is_cover) {
      currentCoverMediaId.value = photo.media_id
    }
  }
})

const validate = async () => {
  return await form.value.validate();
}

const getModel = () => {
  const tags = [
    ...model.value.views.map(d => d.id),
    ...model.value.amenities.map(d => d.id)
  ];
  if (model.value.bedType) {
    tags.push(model.value.bedType.id)
  }
  return {
    id: model.value.id,
    name: model.value.name,
    code: model.value.code,
    hotel_code: model.value.hotel_code,
    size: model.value.size,
    summary: model.value.summary,
    desc: model.value.desc,
    photos: model.value.photos,
    max_guest_number: Number(model.value.max_guest_number),
    tags
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

.hotel-img {
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid $grey-3;

  &:hover {
    opacity: .8;
    border: 1px solid $grey-5;
  }

  &.cover {
    border: 3px solid $positive;
  }
}

.cover-text {
  font-size: 16px;
  color: $grey-6;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;

  .tag {
    padding: 1px 4px;
    margin: 4px;
    border-radius: 4px;
    background-color: $green-6;
    color: $grey-1;
    font-size: 12px;

    // &:hover {
    //   background-color: $green-7;
    // }
  }
}
</style>

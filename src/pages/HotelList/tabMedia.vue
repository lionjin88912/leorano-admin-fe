<template >
  <div style="min-height: 70vh">
    <div class="flex items-center q-pb-md q-gutter-md">
      <uploader btn-text="上傳圖片" title="酒店圖片上傳，建議尺寸: 1280x720" :accept="accept" image-validation
        @handleUpload="handleUpload" />
      <q-btn color="negative" label="刪除相片" :disable="selection.length <= 0" @click="doDelete"></q-btn>
      <div v-if="selection.length > 0" class="text-grey-6">已選取 {{ selection.length }} 張相片</div>
    </div>
    <section class="row">
      <q-card class="col-2 q-ma-sm img-card" v-for="(item, index) in datas" :key="index" :title="item.caption" flat
        @click="onSelection(item)">
        <div class="absolute-top-left q-mt-xs q-ml-xs rou">
          <q-icon class="bg-grey-1 text-bold" :name="selectIcon(item)" color="green-6" size="18px"></q-icon>
        </div>
        <img :src="releaseUrl(item.url_format)" loading="lazy">
        <div class="img-card-caption">
          {{ item.caption || '無標題' }}
        </div>
        <div class="flex items-center img-card-zoom">
          <q-icon v-if="item.use_count > 0" name="warning" color="warning" size="16px">
            <q-tooltip>該照片被引用中</q-tooltip>
          </q-icon>
          <q-icon name="zoom_in" size="28px" color="grey-1" @click.stop>
            <q-popup-proxy ref="popRef" cover transition-hide="scale" @show="onPopup">
              <div class="zoom-container" v-close-popup>
                <q-img class="zoom-container-img" :ratio="1" fit="contain" :src="releaseUrl(item.url_format)"></q-img>
                <q-icon class="zoom-container-close" name="cancel" size="24px" color="grey-5"></q-icon>
              </div>
            </q-popup-proxy>
          </q-icon>
        </div>
      </q-card>
    </section>
    <Confirm ref="confirmRef" @confirm="onDeleteConfirm"></Confirm>
  </div>
</template>
<script setup lang="ts">

import { useQuasar } from 'quasar';
import { watch, ref, computed } from 'vue';
import to from 'await-to-js';
import { RequestUploadImage, RequestHotelMedia, deleteHotelMedia } from 'src/api'
import uploader from 'components/uploader.vue';
import Confirm from 'src/components/dialog/Confirm.vue';

const props = defineProps({
  propsData: Object
})

const $q = useQuasar();
const confirmRef = ref()
const popRef = ref()
const accept = ref(['image/jpg', 'image/jpeg', 'image/png', 'image/webp'])
const hotelId = ref(0)
const datas = ref<any[]>([])

const selection = ref<any[]>([]);

const handleUpload = (files: File[]) => {
  RequestUploadImage(hotelId.value, { files: files }).then(async () => {
    await getMeta()
  })
}

const getMeta = async () => {
  await RequestHotelMedia(hotelId.value, { limit: 5000 }).then((res) => {
    datas.value = res.data
  })
}

const releaseUrl = (url: string) => {
  return url.replace("%s", "M")
}

const onSelection = (item: any) => {
  const selected = selection.value.find((d: any) => Number(d.id) === Number(item.id));
  if (selected) {
    onRemove(item);
  } else {
    selection.value.push(item);
  }
}

const onRemove = (item: any) => {
  // 固定項目不可取消選取
  if (isRemovable(item)) {
    selection.value = selection.value.filter((d: any) => Number(d.id) !== Number(item.id));
  }
};

const isRemovable = (_item: any) => {
  return true;
}

const doDelete = () => {
  let messages = ['相片刪除後不可復原', '確定刪除？']
  const photoUsed = !!selection.value.find((d: any) => d.use_count > 0)
  confirmRef.value.show({
    title: '刪除相片',
    messages,
    hint: photoUsed ? '有使用中的相片被選取' : null
  });
}

const onDeleteConfirm = async (_data: any) => {
  $q.loading.show();
  const media_ids = selection.value.map((d: any) => d.media_id)
  const [err, res] = await to(deleteHotelMedia(hotelId.value, { media_ids }));
  $q.loading.hide();

  if (err) {
    console.error('delete hotel media error:', err);
    return;
  }
  clearSelection()
  getMeta()
}

const onPopup = (event: Event) => {
  const pop = popRef.value.find((d: any) => d.currentComponent?.ref?.contentEl !== null)
  if (pop) {
    const el = pop.currentComponent.ref.contentEl
    el.style.left = '50%'
    el.style.transform = 'translateX(-50%)'
    el.style.transition = 'ease 0.3s'
  }
}

const clearSelection = () => {
  selection.value = []
}

const isSelected = (item: any) => {
  return !!selection.value.find((d: any) => d.id === item.id)
}

const selectIcon = computed(() => (item: any) => {
  return isSelected(item) ? 'check' : ''
})

watch(() => props.propsData, async () => {
  hotelId.value = props.propsData?.id
  await getMeta()
})

</script>

<style scoped lang="scss">
.img-card {
  position: relative;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &-caption {
    font-size: 12px;
    white-space: nowrap;
    text-align: center;
    padding: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-zoom {
    position: absolute;
    top: 5px;
    right: 5px;
    text-shadow: 1px 0px 10px #666;
  }
}

.zoom-container {
  position: relative;
  width: 720px;
  background-color: $grey-10;
  overflow: hidden;

  &-close {
    cursor: pointer;
    position: absolute;
    top: 5px;
    right: 5px;
    text-shadow: 1px 0px 10px #666;
  }
}
</style>

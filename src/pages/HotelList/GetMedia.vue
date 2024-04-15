<template>
  <q-dialog ref="dialogRef" v-model="card">
    <q-card class="container">
      <q-card-section class="content">
        <div class="pos-sticky">
          <div class="flex">
            <q-space></q-space>
            <q-btn icon="close" v-close-popup rounded flat dense></q-btn>
          </div>
          <div class="flex items-center justify-center q-gutter-md q-pb-sm">
            <q-btn color="primary" @click="handleSubmit">確定</q-btn>
            <q-btn color="primary" @click="handleResetPick" outline>清除已選</q-btn>
          </div>
        </div>
        <q-scroll-area class="content-scroll wide">
          <div class="flex">
            <div class="img-card" :class="{ 'picked': isPicked(item.media_id) }" v-for="(item, index) in data"
              :key="index" :title="item.caption">
              <q-img class="cursor-pointer" :src="releaseUrl(item.url_format)" spinner-color="white" loading="lazy"
                @click="() => handlePick(item)">
                <div class="img-card-caption absolute-bottom">
                  {{ item.caption || '無標題' }}
                </div>
              </q-img>
              <q-icon class="img-card-zoom" name="zoom_in" size="28px" color="grey-1">
                <q-popup-proxy ref="popRef" cover transition-hide="scale" @show="onPopup">
                  <div class="zoom-container" v-close-popup>
                    <q-img class="zoom-container-img" :ratio="1" fit="contain" :src="releaseUrl(item.url_format)"></q-img>
                    <q-icon class="zoom-container-close" name="cancel" size="24px" color="grey-5"></q-icon>
                  </div>
                </q-popup-proxy>
              </q-icon>
            </div>
          </div>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { RequestHotelMedia } from 'src/api'
import to from 'await-to-js';

const props = defineProps({
  hotelId: Number,
  handleMedia: Function,
  propsDefault: Object,
  maxAmount: { // 最大選取數
    type: Number,
    default() {
      return 5
    }
  }
})

const emit = defineEmits(['handleMedia']);

const $q = useQuasar();
const dialogRef = ref();
const popRef = ref()
const card = ref(false);
const data = ref<any[]>([])
const pick = ref<any>({})

const handleOpenModal = async () => {
  const [err, res] = await to(RequestHotelMedia(props.hotelId, { limit: 5000 }))

  if (err) {
    console.error("getHotelMedia error:", err);
    return;
  }

  data.value = res.data
  card.value = true
  // pick.value = { ...props.propsDefault }
  if (props.propsDefault) {
    for (let img of data.value) {
      if (props.propsDefault.hasOwnProperty(img.media_id)) {
        pick.value[img.media_id] = {
          id: img.id,
          src: img.url_format,
        }
      }
    }
  }
}

const handlePick = (item: any) => {
  const id = item.media_id;
  const val = item.url_format
  // 檢查是否存在 存在就刪除
  if (pick.value.hasOwnProperty(id)) {
    delete pick.value[id]
    return
  }
  // 檢查上限
  if (Object.keys(pick.value).length >= props.maxAmount) {
    $q.notify({
      type: 'warning',
      position: 'top',
      icon: 'announcement',
      textColor: 'grey-1',
      iconColor: 'grey-1',
      message: `最多可選擇 ${props.maxAmount} 張照片`,
      timeout: 2000
    });
    return
  }

  // 不存在且沒超過就加入
  pick.value[id] = {
    id: item.id,
    src: val,
    isCover: false
  }
}

const handleSubmit = () => {
  card.value = false
  emit('handleMedia', pick.value)

}
const handleResetPick = () => {
  pick.value = {}
}

const isPicked = (id: any) => {
  return pick.value.hasOwnProperty(id);
}

const releaseUrl = (url: string) => {
  return url.replace("%s", "M")
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

defineExpose({ handleOpenModal });
</script>

<style lang="scss" scoped>
.container {
  padding: 0px 0px 16px;
  min-width: 450px;
  max-width: 100%;
  overflow: hidden;

  .content {
    &-title {
      font-weight: bold;
      font-size: 18px;
      padding: 8px 8px;
    }

    &-scroll {
      width: 100%;
      height: 780px;
      max-height: calc(90vh - 200px);

      &.wide {
        width: calc(100vw - 200px);
        max-width: 1200px;
      }
    }

    .img-card {
      display: flex;
      position: relative;
      width: 224px;
      height: 126px;
      cursor: pointer;
      border: 1px solid $grey-4;
      border-radius: 4px;
      margin: 4px;

      &:hover {
        opacity: .9;
        border: 1px solid $grey-5;
      }

      &.picked {
        border: 3px solid #0000FF;
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

.pos-sticky {
  position: sticky;
  background-color: #FFF;
  overflow: hidden;
  top: 0;
  z-index: 100;
}
</style>

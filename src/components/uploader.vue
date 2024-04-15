<template>
  <div>
    <q-btn :label="btnLabel" color="primary" @click="card = true" />
    <q-dialog v-model="card">
      <q-card class="container">
        <q-uploader class="uploader" :label='title' multiple batch :accept="acceptString" :factory="handleUploader"
          @added="onAdded" @uploaded="onFileUploaded" @failed="onUploadFailed" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useQuasar } from 'quasar';

const props = defineProps({
  title: {
    type: String,
    default() {
      return "Batch Upload"
    }
  },
  btnText: String,
  uploadUrl: String,
  accept: {
    type: Array,
    default() {
      return []
    }
  },
  imageValidation: {
    type: Boolean,
    default() {
      return false;
    }
  }
});

const emit = defineEmits(['handleUpload', 'uploaded', 'failed']);

const $q = useQuasar();
const card = ref(false)
const btnLabel = computed(() => props.btnText)
const acceptString = computed(() => (props.accept || []).join(','))
// const MAX_WIDTH = 1280;
// const MAX_HEIGHT = 720;
const MAX_RATIO = 1.8;
const MIN_RATIO = 1.6;

const onAdded = (files) => {
  // console.log('onAdded:', files)
  // if (props.imageValidation) {
  //   for (let file of files) {
  //     isValidImageSize(file)
  //   }
  // }
}

// const isValidImageSize = async (file) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const objectURL = URL.createObjectURL(file);
//       const img = document.createElement('img');
//       img.onload = () => {
//         const imgRatio = (img.width / img.height).toFixed(2);
//         console.log(`Image Width: ${img.width}, Height: ${img.height}, Ratio:${imgRatio}`);
//         // if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
//         if (imgRatio < MIN_RATIO || imgRatio > MAX_RATIO) {
//           $q.notify({
//             position: 'top',
//             type: 'warning',
//             icon: 'warning',
//             iconColor: 'white',
//             textColor: 'white',
//             message: `圖片:${file.name}，尺寸不符合規範`,
//             timeout: 5000
//           })
//           resolve(false)
//         }
//         resolve(true)
//       }
//       img.src = objectURL;
//     } catch (err) {
//       console.warn('check image validation failed:', err);
//       resolve(false);
//     }
//   })
// }

const handleUploader = async (files = []) => {
  return new Promise(async (resolve) => {
    // if (props.imageValidation) {
    //   const validFiles = [];
    //   for (let img of files) {
    //     const isValid = await isValidImageSize(img);
    //     if (isValid) {
    //       validFiles.push(img)
    //     }
    //   }
    //   if (validFiles.length > 0) {
    //     emit('handleUpload', validFiles)
    //   }
    // } else {
    //   emit('handleUpload', files)
    // }
    emit('handleUpload', files)
    card.value = false
    resolve()
  })
}

const onFileUploaded = (info) => {
  emit('uploaded', info);
};

const onUploadFailed = (info) => {
  emit('failed', info);
};
</script>

<style lang="scss" scoped>
.container {
  max-width: 90vw;
  width: 900px;
  min-height: 600px;
}

.uploader {
  width: 100%;
  min-height: 500px;

  :deep() .q-uploader {
    &__list {
      display: flex;
      flex-wrap: wrap;
      flex: none;
    }

    &__file {
      margin: 8px;
      border-radius: 5px;
      width: 200px;
      height: 200px;

      &.q-uploader__file--img {
        background-size: contain;
        background-position: center center;
      }
    }
  }
}
</style>

<template>
  <div class="column user-info">
    <div class="user-info-title">審核結果</div>
    <div class="column">
      <q-btn class="q-mt-sm" color="primary" label="通過" @click="handleApply" />
      <q-btn class="q-mt-sm" color="white" text-color="black" outline label="補資料" @click="() => openModal('replenish')" />
      <q-btn class="q-mt-sm" color="deep-orange" label="駁回" @click="() => openModal('reject')" />
    </div>
  </div>
  <div v-if="replenishModel">
    <q-dialog v-model="replenishModel">
      <q-card style="width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">補資料</div>
        </q-card-section>
        <q-form @submit="handleReplenish">
          <q-card-section class="q-gutter-y-md column">
            <div class="q-gutter-sm">
              <q-btn color="teal" label="個人相片" @click="handleSetTemplate('isPhoto')" />
              <q-btn color="orange" label="個人年收入" @click="handleSetTemplate('isIncome')" />
            </div>
            <q-input type="textarea" v-model="replenishData.reason" label='其他說明' placeholder="其他說明" required />
          </q-card-section>
          <q-card-section>
            <q-card-actions align="center">
              <q-btn outline color="primary" label="取消" v-close-popup />
              <q-btn type="submit" color="primary" label="送出" />
            </q-card-actions>
          </q-card-section>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
  <div v-if="rejectModel">
    <q-dialog v-model="rejectModel">
      <q-card style="width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">駁回</div>
        </q-card-section>
        <q-form @submit="handleReject">
          <q-card-section class="q-gutter-y-md column">
            <q-input type="textarea" v-model="rejectData.reason" label='駁回原因 *' placeholder="請填寫駁回原因"
              :rules="rules.reason" outlined />
            <q-checkbox v-model="isBlock" label="封鎖註冊信箱與電話" color="teal" />
            <q-input v-if="isBlock" v-model="rejectData.blockReason" label='封鎖原因 *' placeholder="請填寫封鎖原因"
              :rules="rules.blockReason" outlined />
          </q-card-section>
          <q-card-section>
            <q-card-actions align="center">
              <q-btn outline color="primary" label="取消" v-close-popup />
              <q-btn type="submit" color="primary" label="送出" />
            </q-card-actions>
          </q-card-section>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { isEmpty, messages } from 'src/utils/validators.js'
import _ from 'lodash'

const props = defineProps({
  propsData: Object,
})
const emit = defineEmits(['handleUpdate'])

const replenishModel = ref(false)
const rejectModel = ref(false)
const isBlock = ref(false)
const rejectData = ref({
  reason: "",
  blockReason: ""
})
const replenishData = ref({
  reason: "",
})

const openModal = (key) => {
  if (key == 'reject') {
    rejectModel.value = true
  } else {
    replenishModel.value = true
  }
}

const handleApply = () => {
  emit('handleUpdate', makeData("apply", {}))
}

const handleReplenish = () => {
  const arr = replenishData.value.reason.split('\n').filter(d => d.trim().length > 0)
  const reason = arr.join('\n').trim()
  emit('handleUpdate', makeData("supplementary", {
    supplementary: reason
  }))
  replenishModel.value = false
}

const handleReject = () => {
  const data = {
    is_block: isBlock.value,
    reason: rejectData.value.reason,
  }

  if (isBlock.value) {
    data["block_reason"] = isBlock.value && rejectData.value.blockReason
  }

  emit('handleUpdate', makeData("reject", data))
  rejectModel.value = false
}

function makeData(action, data) {
  return {
    action: action,
    id: props.propsData.id,
    data: {
      data: data
    }
  }
}

const handleSetTemplate = (key) => {
  const template = {
    "isIncome": {
      "en": "Please provide proof of your annual income.",
      "zh-CN": "请提供您的年收证明",
      "zh-TW": "請提供您的年收證明"
    },
    "isPhoto": {
      "en": "Please provide a clearer photo.",
      "zh-CN": "请提供一张更为清晰的照片",
      "zh-TW": "請提供一張更為清晰的照片"
    },
  }

  const text = template[key][props.propsData.lang]
  replenishData.value.reason = `${text}\n${replenishData.value.reason}`
}

const rules = computed(() => {
  return {
    reason: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    blockReason: [
      val => isBlock.value ? !isEmpty(val) || messages.requiredInput() : true
    ],
  }
});
</script>

<style lang="scss" scoped>
.user-info {
  overflow: hidden;
  padding: 0px 2px;

  &-title {
    font-weight: bold;
    font-size: 16px;
    padding-bottom: 12px;
  }

  &-field {
    padding-bottom: 6px;

    .field-label {
      text-transform: capitalize;
      font-weight: 500;
      color: $grey-10;
    }

    .field-text {
      white-space: break-spaces;
      word-break: break-all;
      font-weight: 400;
      color: $grey-7;
    }
  }
}
</style>

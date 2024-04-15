<template>
  <div class="column user-info">
    <div class="user-info-field">
      <div class="field-label">審核時間</div>
      <div class="field-text">{{ getDateString(data.verified_at, 'YYYY-MM-DD HH:mm') }}</div>
    </div>
    <div class="user-info-field">
      <div class="field-label">審核人員</div>
      <div class="field-text">{{ data.admin?.username }}</div>
    </div>
    <q-btn class="q-mt-sm" color="white" text-color="black" outline label="編輯會員資料" @click="goToEdit" />
    <q-btn class="q-mt-sm" color="primary" label="通過" @click="handleApply" />
    <q-btn class="q-mt-sm" color="deep-orange" label="駁回" @click="() => openModal('reject')" />
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { router } from 'src/router'
import { getDateString } from 'src/utils/helpers'
import { isEmpty, messages } from 'src/utils/validators.js'

const emit = defineEmits(['handleUpdate']);
const props = defineProps({
  propsData: Object
})

const rejectModel = ref();
const isBlock = ref(false)
const rejectData = ref({
  reason: "",
  blockReason: ""
})

const goToEdit = () => {
  router.push({
    name: 'ApplyMemberEdit',
    params: {
      id: data.value.id
    }
  })
}

const handleApply = () => {
  emit('handleUpdate', {
    action: "apply",
    id: props.propsData.id,
    data: {
      data: props.propsData
    }
  })
}

const openModal = (key) => {
  if (key == 'reject') {
    rejectModel.value = true
  }
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

const data = computed(() => {
  return props.propsData;
})
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

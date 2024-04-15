<template>
  <q-dialog class="common-dialog" v-model="visible">
    <q-card class="container">
      <q-form @submit="onSubmit">
        <q-card-section class="sticky-top">
          <div class="flex">
            <div class="text-h6">{{ title }}</div>
            <q-space></q-space>
            <q-btn icon="close" flat dense rounded v-close-popup />
          </div>
        </q-card-section>
        <q-card-section class="content">
          <q-scroll-area class="content-scroll">
            <div class="flex column q-gutter-y-md">
              <q-input v-model="model.name" label="品牌名稱 *" :rules="rules.required" hide-bottom-space outlined dense />
              <selectGroup label="集團" :default='{ id: model.hotel_group_id, name: model.hotel_group_name }'
                @handleCallBack='onGroupSelected' />
              <q-input v-model="model.hotel_chain" label="Hotel Chain" maxlength="2" outlined dense
                @blur="onHotelChainBlur" />
              <div>
                <q-toggle v-model='model.is_enabled' label="上架狀態" left-label checked-icon='check' color='green'
                  unchecked-icon='clear' />
              </div>
            </div>
          </q-scroll-area>
        </q-card-section>
        <q-card-actions align="right">
          <div class="flex q-gutter-x-md">
            <q-btn class="dialog-button" outline color="primary" label="取消" v-close-popup />
            <q-btn class="dialog-button" type="submit" color="primary" :label="btnLabel" />
          </div>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import selectGroup from 'src/components/selectGroup.vue'
import { createNewModel, HotelBrand, ModelKeys } from 'src/model';
import { isEmpty, messages } from 'src/utils/validators';
import _ from 'lodash'

const emit = defineEmits(['updated'])

const visible = ref(false);
const title = ref('')
const btnLabel = ref('送出')
const model = ref<HotelBrand>({} as HotelBrand)

const onHotelChainBlur = () => {
  model.value.hotel_chain = _.toUpper(model.value.hotel_chain)
}

const onGroupSelected = (group: any) => {
  model.value.hotel_group_id = group.val
}

const onSubmit = () => {
  emit('updated', model.value)
}

interface DialogData {
  data: HotelBrand
}

const show = (data: DialogData) => {
  visible.value = true
  if (data.data) {
    model.value = Object.assign({}, data.data)
    title.value = '編輯酒店品牌'
    btnLabel.value = '確定送出'
  } else {
    model.value = createNewModel(ModelKeys.HotelBrand)
    title.value = '新增酒店品牌'
    btnLabel.value = '確定新增'
  }
}

const hide = () => {
  visible.value = false
}

const rules = computed(() => {
  return {
    required: [
      (val: string) => !isEmpty(val) || messages.requiredInput()
    ]
  }
})

defineExpose({ show, hide })

</script>

<style scoped lang="scss">
.container {
  padding: 0px 16px 16px;
  min-width: 450px;
  max-width: 100%;

  .content {
    &-scroll {
      width: 450px;
      height: 250px;
    }
  }
}
</style>

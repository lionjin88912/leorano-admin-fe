<template>
  <div v-if="showView" class="flex-1">
    <q-form ref="form" class="edit-form q-gutter-md" :greedy="false">
      <q-input v-model="model.title" label="推播主題" style="width: 400px;" hint="只有後台可見" hide-bottom-space lazy-rules dense
        outlined>
      </q-input>
      <div style="max-width: 250px;" @click="showTagSelect()">
        <q-field v-model="model.tag" class="edit-form-field cursor-pointer" :rules="rules.tag" stack-label label-slot
          lazy-rules hide-bottom-space outlined dense @update:model-value="onValueChanged">
          <template #label>
            <span class="field-label">推播標籤 *</span>
          </template>
          <template v-slot:control>
            <div class="q-gutter-x-sm q-pl-xl">
              <q-chip v-if="model.tag" :label="model.tag.name" color="green-7" text-color="grey-1" size="md"></q-chip>
            </div>
          </template>
        </q-field>
      </div>
      <div class="flex">
        <q-select v-model="model.accept.type" style="min-width: 250px;" label="發送對象 *" :options="targetOptions"
          :rules="rules.target" :readonly="isEdit" emit-value map-options outlined dense hide-bottom-space hide-hint
          @update:model-value="onTargetChanged"></q-select>
        <div v-if="!isEdit" class="flex items-baseline q-pl-sm q-gutter-x-sm">
          <q-btn v-if="model.accept.type === 'users'" label="自訂" color="white" text-color="grey-7"
            @click="onCustomList"></q-btn>
          <q-btn v-if="model.accept.type === 'import'" label="Excel 上傳名單" color="white" text-color="grey-7"
            @click="fileRef.click()">
            <input ref="fileRef" type="file" :accept="acceptFileList.join(',')" class="hidden"
              @change="onImportList($event)">
          </q-btn>
          <q-icon v-if="hasCustomList" class="cursor-pointer self-center" name="view_list" size="32px" color="primary">
            <q-popup-proxy>
              <div class="q-pa-md">
                <div v-for="(email, index) of model.accept.data" :key="index">
                  {{ index + 1 }}. {{ email }}
                </div>
              </div>
            </q-popup-proxy>
            <q-tooltip>自訂清單</q-tooltip>
          </q-icon>
        </div>
      </div>
      <span class="text-bold q-mt-lg">發送條件 *</span>
      <q-field class="q-mt-none" lazy-rules hide-bottom-space borderless>
        <template v-slot:control>
          <div class="q-gutter-x-sm q-pb-sm q-pl-md">
            <div class="flex items-center">
              <div class="inner-label">期間</div>
              <q-option-group v-model="model.rule.during" :options="DuringOptions" inline></q-option-group>
            </div>
            <div class="flex items-center">
              <div class="inner-label">行為記錄</div>
              <q-option-group v-model="model.rule.conducts" type="checkbox" :options="ConductOptions"
                inline></q-option-group>
            </div>
          </div>
        </template>
      </q-field>
      <q-separator class="q-my-sm"></q-separator>
      <div class="flex-1 column">
        <span class="text-bold">發送時間 *</span>
        <div class="flex items-center q-gutter-x-md q-pl-md">
          <!-- <q-radio v-model="timeStrategy" val="immediately" label="立即發送"></q-radio>
          <div>或</div> -->
          <q-radio v-model="timeStrategy" val="schedule" label="週期發送"></q-radio>
        </div>
      </div>
      <div class="flex q-gutter-x-md q-pl-md">
        <DateField v-model="duration" label="發送期間 *" style="width: 250px;" :stack-label="dateStackLabel"
          :rules="rules.dateRange" :disable="!isEditable" :error="dateError" :error-message="dateErrorMessage"
          hide-bottom-space lazy-rules outlined dense :range="true" @update:model-value="onDateRangeSelected"></DateField>
        <q-select class="no-field-component-padding" v-model="model.action_time" :options="hourOptions" label=""
          map-options emit-value outlined dense :disable="isImmediately">
          <template #prepend>
            <q-icon name="schedule" size="24px" color="grey-7"></q-icon>
          </template>
        </q-select>
      </div>
      <q-field class="q-mt-none" :disable="isImmediately" lazy-rules hide-bottom-space borderless>
        <template v-slot:control>
          <div class="q-gutter-x-sm q-pb-sm q-ml-md">
            <div class="flex items-center">
              <q-radio v-model="frequencyAll" class="q-pr-md" label="每日發送" val="all" name="frequency"
                @update:model-value="onFrequencyAll"></q-radio>
              <div>或</div>
            </div>
            <div class="flex items-center">
              <q-option-group v-model="model.frequency" type="checkbox" :options="FrequencyOptions" inline
                @update:model-value="onFrequencyChanged"></q-option-group>
            </div>
          </div>
        </template>
      </q-field>
      <q-separator class="q-my-sm"></q-separator>
      <span class="text-bold q-mt-lg">發送方式</span>
      <q-field class="q-mt-none" v-model="model.tag" lazy-rules hide-bottom-space borderless>
        <template v-slot:control>
          <q-checkbox v-model="sysNotify" label="通知" :val="true" color="grey-8" disable></q-checkbox>
          <q-checkbox v-model="model.has_notification" label="推播" :val="true"></q-checkbox>
        </template>
      </q-field>
      <q-input v-model="model.link.path" label="到達頁 *" :rules="rules.required" hide-bottom-space lazy-rules dense
        outlined>
      </q-input>
      <q-input v-model="model.content" type="textarea" label="內容 *" :maxlength="200" counter :rows="6"
        :rules="rules.required" hide-bottom-space outlined dense></q-input>
    </q-form>
    <SelectTag ref="selectTagRef" @selected="onTagSelected" :multiple="false" :max-length="20" />
    <CustomListDialog ref="customListRef" @confirm="onCustomListSelected"></CustomListDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect, onMounted, PropType } from 'vue'
import { useQuasar } from 'quasar';
import _ from 'lodash';
import XLSX from 'xlsx-js-style'
import { isEmpty, isPositiveInteger, isValidRange, isValidDateRange, messages } from 'src/utils/validators';
import DatePicker from 'src/components/DatePicker.vue';
import DateField from 'src/components/DateField.vue'
import SelectTag from 'src/components/dialog/SelectTag.vue';
import CustomListDialog from './CustomListDialog.vue';
import { useMetaStore } from 'src/stores/meta';
import { isDateBefore, getDateStringNoTz } from 'src/utils/helpers';
import { MarketingNotify } from 'src/model'
import { DuringOptions, ConductOptions, FrequencyOptions } from '../../enums';

const props = defineProps({
  data: {
    type: Object as PropType<MarketingNotify>,
    default() {
      return {}
    }
  },
  isEdit: {
    type: Boolean,
    default() {
      return false
    }
  }
});

const $q = useQuasar();
const metaStore = useMetaStore();
const form = ref();
const fileRef = ref();
const selectTagRef = ref();
const customListRef = ref();
const model = ref<MarketingNotify>(<MarketingNotify>{});
const targetOptions = ref<any>([]);

const dateError = ref<boolean>(false);
const dateErrorMessage = ref<string>("結束日期不可早於今日");
// const conductAll = ref('all')
const frequencyAll = ref('all')
const sysNotify = ref(true)
const acceptFileList = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
]

const tagType = {
  id: 17,
  name: 'Notification'
}
const timeStrategy = ref('schedule')
const duration = ref<any>({})

const isStackLabel = (items: any) => {
  return !!items;
}

const showTagSelect = () => {
  selectTagRef.value.show({
    tagTypeId: tagType.id,
    tagTypeName: tagType.name,
    selection: model.value.tag ? [model.value.tag] : []
  });
};

const onTagSelected = ({ selection }: any) => {
  // console.log('onTagSelected:', selection);
  model.value.tag = selection[0];
}

const onTargetChanged = () => {
  model.value.accept.data = null
}

const onDateRangeSelected = (range: any) => {
  // console.log('onDateRangeSelected:', range)
  dateError.value = false;
  model.value.date_range.start_date = range ? range.from : null;
  model.value.date_range.end_date = range ? range.to : null;

  if (range && isDateBefore(range.to, getDateStringNoTz(new Date(), 'YYYY-MM-DD'))) {
    dateError.value = true;
  } else {
    form.value.resetValidation();
  }
}

const onValueChanged = (value: any) => {
  form.value.resetValidation();
}

const onFrequencyAll = (value: any) => {
  if (value) {
    model.value.frequency = []
  }
}

const onFrequencyChanged = (value: any) => {
  if (value.length > 0) {
    frequencyAll.value = ''
  } else {
    frequencyAll.value = 'all'
  }
}

// 自訂通知清單
const onCustomList = () => {
  const data = Array.isArray(model.value.accept.data) ? model.value.accept.data : []
  customListRef.value.show(data)
}

const onCustomListSelected = (list: string[]) => {
  // console.log('onCustomerListSelected:', list)
  model.value.accept.data = list
  form.value.resetValidation();
}

//Excel匯入
const onImportList = async (event: Event) => {
  const files = (<HTMLInputElement>event.target).files
  if (!files || files.length <= 0) {
    return
  }
  const file = await files[0].arrayBuffer()
  const workbook = XLSX.read(file)
  // console.log('workbook:', workbook)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const datas = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  // console.log('datas:', datas);
  model.value.accept.data = datas.map((d: any) => d.join(''))
  form.value.resetValidation();
}

const initMembershipOptions = async () => {
  const datas = await metaStore.getMembershipList();
  targetOptions.value = [
    { label: '所有會籍', value: 0 },
    ...datas.map((d: any) => {
      return { label: d.title, value: d.id }
    }),
    { label: 'Excel匯入', value: 'import' },
    { label: '自訂', value: 'users' },
  ];
}

const hourOptions = computed(() => {
  let list = []
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, '0') + ':00'
    list.push({ label: hour, value: hour })
  }
  return list
})

const hasCustomList = computed(() => {
  return Array.isArray(model.value.accept.data) && model.value.accept.data.length > 0
})

const isImmediately = computed(() => {
  return timeStrategy.value === 'immediately'
})

const isEditable = computed(() => {
  if (isImmediately.value) {
    return false
  }
  return !props.isEdit || (!model.value.date_range?.start_date || isDateBefore(getDateStringNoTz(new Date(), 'YYYY-MM-DD'), duration.value.from))
})

const rules = computed(() => {
  return {
    required: [
      (val: any) => !isEmpty(val) || messages.requiredInput()
    ],
    tag: [
      (val: any) => !!model.value.tag || messages.requiredInput()
    ],
    target: [
      (val: any) => isTargetInput() || messages.requiredInput()
    ],
    dateRange: [
      (val: any) => !isEmpty(model.value.date_range.start_date) || messages.requiredInput(),
      (val: any) => !isEmpty(model.value.date_range.end_date) || messages.requiredInput(),
      (val: any) => !isDateBefore(duration.value.to, getDateStringNoTz(new Date(), 'YYYY-MM-DD')) || messages.requiredInput()
    ],
  }
});

const isTargetInput = () => {
  if (props.isEdit) {
    return true
  }
  if (typeof model.value.accept.type === 'number') {
    return true
  }
  if (typeof model.value.accept.type === 'string'
    && Array.isArray(model.value.accept.data) && model.value.accept.data.length > 0) {
    return true
  }
  return false
}

const dateStackLabel = computed(() => {
  return !!(model.value.date_range.start_date || model.value.date_range.end_date)
})

const setDuration = () => {
  if (model.value.date_range?.start_date && model.value.date_range?.end_date) {
    duration.value = Object.assign({}, {
      from: getDateStringNoTz(model.value.date_range.start_date, 'YYYY-MM-DD'),
      to: getDateStringNoTz(model.value.date_range.end_date, 'YYYY-MM-DD')
    })
  } else {
    duration.value = Object.assign({})
  }
}

const validate = async () => {
  return await form.value.validate();
}

const getModel = () => {
  let acceptType = model.value.accept.type
  let acceptData: any = model.value.accept.type

  if (typeof acceptType === 'number') {
    if (acceptType === 0) {
      acceptData = 0
    }
    acceptType = 'membership'
  } else if (typeof acceptType === 'string') {
    // 自訂、excel匯入的資料
    acceptData = model.value.accept.data
  }

  let data = {
    lang: 'en',
    id: model.value.id,
    title: model.value.title,
    tag_id: model.value.tag?.id,
    accept: {
      type: acceptType,
      data: acceptData
    },
    rule: model.value.rule,
    date_range: {
      start_date: duration.value.from,
      end_date: duration.value.to
    },
    frequency: model.value.frequency.length <= 0 ? [1, 2, 3, 4, 5, 6, 7] : model.value.frequency,
    action_time: model.value.action_time,
    link_path: model.value.link.path,
    has_notification: model.value.has_notification,
    content: model.value.content
  };
  return data;
}

const showView = computed(() => {
  return model.value?.accept
})

watch(() => props.data, (newVal: MarketingNotify) => {
  model.value = newVal;
  // console.log('model:', model.value)
  if (model.value.frequency?.length === 0) {
    frequencyAll.value = 'all'
  } else {
    frequencyAll.value = ''
  }
  setDuration()
})

onMounted(async () => {
  initMembershipOptions();
  model.value = props.data
})

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

    &.small {
      max-width: 160px;
    }

    &.full {
      // cursor: pointer;
      max-width: 100%;
    }
  }
}

.field-label {
  font-size: 18px;
}

.inner-label {
  width: 60px;
  text-align: right;
}

:deep().no-field-component-padding {

  &.q-field {
    .q-field__inner {
      .q-field__control {
        .q-field__control-container {
          padding-top: 4px;
        }
      }
    }
  }
}
</style>

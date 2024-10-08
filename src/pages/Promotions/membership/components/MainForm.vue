<template>
  <div v-if="model?.membership" class="flex-1">
    <q-form ref="form" class="edit-form q-gutter-md" :greedy="false">
      <q-input class="edit-form-field" v-model="model.title" label="活動名稱 *" :maxlength="40" :rules="rules.required"
        hide-bottom-space lazy-rules dense outlined></q-input>
      <q-input v-model="model.desc" label="說明 *" type="textarea" input-style="min-height: 80px;" :maxlength="250"
        :rules="rules.required" autogrow hide-bottom-space lazy-rules dense outlined></q-input>
      <q-field v-model="model.membership_id" :rules="rules.membership" :disable="!isEditable" stack-label label-slot
        hide-bottom-space lazy-rules outlined dense>
        <template #label>
          <span class="field-label">會籍 *</span>
        </template>
        <template v-slot:control>
          <div class="q-gutter-x-sm q-pl-xl">
            <q-option-group v-model="model.membership_id" :options="membershipOptions" inline
              @update:model-value="onMembershipChanged"></q-option-group>
          </div>
        </template>
      </q-field>
      <q-field :rules="rules.rangeNumber" :disable="!isEditable" label-slot stack-label hide-bottom-space lazy-rules
        outlined dense>
        <template #label>
          <span class="field-label">優惠 *</span>
        </template>
        <template #default>
          <div class="flex q-pl-xl q-pb-sm q-gutter-x-sm items-center">
            <q-option-group v-model="model.unit" :options="unitOptions" :disable="!unitEditable" inline></q-option-group>
            <!-- <q-radio v-model="model.unit" name="valueType" val="percent" label="比例"></q-radio>
            <q-radio v-model="model.unit" name="valueType" val="dollars" label="金額"></q-radio> -->
            <div class="flex q-gutter-x-sm bordered q-pa-xs rounded-borders">
              <input class="text-right no-border no-outline" style="width: 80px;" v-model="model.value" type="number"
                min="0" @update:model-value="onValueChanged" />
              <span>{{ valueSuffix }}</span>
            </div>
          </div>
        </template>
      </q-field>
      <div class="flex-1">
        <q-field class="cursor-pointer q-pr-md" style="min-width: 220px;" label="有效期限 *" :stack-label="dateStackLabel"
          :rules="rules.dateRange" :disable="!isEditable" :error="dateError" :error-message="dateErrorMessage"
          hide-bottom-space lazy-rules outlined dense>
          <template #default>
            <DatePicker :date="duration" :range="true" @updated="onDateRangeSelected"></DatePicker>
          </template>
          <template v-slot:control>
            <div v-if="model.start_date && model.end_date">
              {{ duration.from }} ～ {{ duration.to }}
            </div>
          </template>
        </q-field>
        <q-input input-class="text-right" v-model="model.total" label="數量 *" type="number" suffix="組"
          :rules="rules.number" min="1" :disable="!isEditable" hide-bottom-space lazy-rules dense outlined>
        </q-input>
        <q-toggle v-model="model.auto_create" color="green" label="系統自動產生行銷碼" />
      </div>
      <q-input v-model="model.note" type="textarea" :rows="3" label="備註(僅後台可見)" hide-bottom-space outlined
        dense></q-input>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useQuasar } from 'quasar';
import { isEmpty, isPositiveInteger, isValidRange, isValidDateRange, messages } from 'src/utils/validators';
import DatePicker from 'src/components/DatePicker.vue';
import { useMetaStore } from 'src/stores/meta';
import { isDateBefore, getDateStringNoTz } from 'src/utils/helpers';

const props = defineProps({
  data: {
    type: Object,
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
const model = ref();
const membershipOptions = ref<any>([]);

const dateError = ref<boolean>(false);
const dateErrorMessage = ref<string>("結束日期不可早於今日");

const onDateRangeSelected = (range: any) => {
  // console.log('onDateRangeSelected:', range)
  dateError.value = false;
  model.value.start_date = range ? range.from : null;
  model.value.end_date = range ? range.to : null;

  if (range && isDateBefore(range.to, getDateStringNoTz(new Date(), 'YYYY-MM-DD'))) {
    dateError.value = true;
  } else {
    form.value.resetValidation();
  }
}

const onValueChanged = (value: any) => {
  form.value.resetValidation();
}

const unitOptions = [
  { label: '比例', value: 'percent' },
  { label: '金額', value: 'dollars' }
]

const initMembershipOptions = async () => {
  const datas = await metaStore.getMembershipList();
  membershipOptions.value = [
    ...datas.map((d: any) => {
      return { label: d.title, value: d.id }
    }),
    { label: 'All', value: 0 }
  ];
}

const onMembershipChanged = (value: any) => {
  if (!value || value === 0) {
    model.value.unit = 'dollars'
  }
}

const isEditable = computed(() => {
  return !props.isEdit || (!model.value.start_date || isDateBefore(getDateStringNoTz(new Date(), 'YYYY-MM-DD'), duration.value.from))
})

const unitEditable = computed(() => {
  return model.value.membership_id && Number(model.value.membership_id) > 0
})

const rules = computed(() => {
  return {
    required: [
      (val: any) => !isEmpty(val) || messages.requiredInput()
    ],
    membership: [
      (val: any) => val || Number(val) >= 0 || messages.requiredInput()
    ],
    dateRange: [
      (val: any) => !isEmpty(model.value.start_date) || messages.requiredInput(),
      (val: any) => !isEmpty(model.value.end_date) || messages.requiredInput(),
      (val: any) => !isDateBefore(duration.value.to, getDateStringNoTz(new Date(), 'YYYY-MM-DD')) || messages.requiredInput()
    ],
    rangeNumber: [
      (val: any) => !isEmpty(model.value.value) || messages.requiredInput(),
      (val: any) => isPositiveInteger(model.value.value, true) || messages.inputPositiveInteger(),
      (val: any) => model.value.unit === 'dollars' || isValidRange(model.value.value, 0, 100) || messages.invalidRange(0, 100)
    ],
    number: [
      (val: any) => !isEmpty(val) || messages.requiredInput(),
      (val: any) => isPositiveInteger(val) || messages.inputPositiveInteger(),
    ],
  }
});

const dateStackLabel = computed(() => {
  return !!(model.value.start_date || model.value.end_date)
})

const duration: any = computed(() => {
  if (model.value.start_date && model.value.end_date) {
    return {
      from: getDateStringNoTz(model.value.start_date, 'YYYY-MM-DD'),
      to: getDateStringNoTz(model.value.end_date, 'YYYY-MM-DD')
    }
  }
  return null
})

const valueSuffix = computed(() => {
  if (!model.value.unit) {
    return ''
  }
  return model.value.unit === 'percent' ? '％' : 'USD'
})

watchEffect(() => {
  model.value = props.data;
  model.value.membership_id = props.data.membership?.id;
})

const validate = async () => {
  return await form.value.validate();
}

const getModel = () => {
  return {
    lang: 'en',
    id: model.value.id,
    title: model.value.title,
    desc: model.value.desc,
    membership_id: model.value.membership_id,
    unit: model.value.unit,
    value: Number(model.value.value),
    start_date: duration.value.from,
    end_date: duration.value.to,
    total: Number(model.value.total),
    auto_create: model.value.auto_create,
    note: model.value.note
  };
}

onMounted(async () => {
  initMembershipOptions();
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
</style>

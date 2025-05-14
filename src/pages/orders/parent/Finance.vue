<template>
  <q-card v-if="model" class="q-mt-md" flat bordered>
    <q-card-section>
      <div class="flex q-gutter-sm q-mb-md">
        <q-space />
        <q-btn label="取消" color="primary" class="q-px-lg" @click="cancelEdit" outline />
        <q-btn label="儲存" color="primary" class="q-px-lg" @click="saveOrder" unelevated />
      </div>
      <div class="finance-list row text-bold q-col-gutter-sm q-mb-sm q-mt-none">
        <div class="item-type">項目</div>
        <div class="item-cate">類別</div>
        <div class="item-order">訂單</div>
        <div class="col">名稱 <span class="text-negative">*</span></div>
        <div class="item-price">金額</div>
        <div class="item-rate">匯率 <span class="text-negative">*</span></div>
        <div class="item-rate">金額 USD</div>
        <div class="item-ticket text-center">收據/支單號</div>
        <div v-if="!isClosed" class="item-delete text-center">刪除</div>
      </div>
      <div v-for="(finance, index) in model.finance" :key="index" class="finance-list row items-start q-col-gutter-x-sm q-mb-sm">
        <q-select v-model="finance.type" :options="financeOptions" class="item-type" :readonly="finance.id != ''" :disable="finance.is_post || isClosed" emit-value map-options dense outlined>
          <template v-slot:selected-item="scope">
            <q-badge :color="scope.opt.color" class="q-px-xs" outline>
              {{ scope.opt.label }}
            </q-badge>
          </template>
        </q-select>
        <q-select v-model="finance.cate" :options="financeCateOptions[finance.type]" class="item-cate" :disable="finance.is_post || isClosed" emit-value map-options dense outlined />
        <q-select v-model="finance.order_number" :options="orderOptions" class="item-order" :disable="finance.is_post || isClosed" emit-value map-options dense outlined />
        <q-input v-model="finance.title" class="col" :rules="rules.required" :disable="finance.is_post || isClosed" dense outlined />
        <InputCurrencyPrice v-model:currency="finance.currency" v-model:price="finance.amount" class="item-price" @update:currency="changeCurrency(finance)" :rules="rules.finance_amount" :disable="finance.is_post || isClosed" />
        <q-input v-model="finance.exchange_rate" class="item-rate" :rules="rules.exchange_rate" :disable="finance.is_post || isClosed" dense outlined />
        <q-input v-model="financeUSD[index]" class="item-rate" :disable="finance.is_post || isClosed" dense outlined readonly />
        <div class="item-ticket text-center">
          <div v-if="finance.type == 'expense'">
            <router-link v-if="finance.ticket_number" :to="`/accounting/payment/${finance.ticket_number}`" class="text-primary q-my-sm block">
              <q-icon name="check" v-if="finance.is_post" class="text-teal" />
              {{ finance.ticket_number }}
            </router-link>
            <q-badge v-if="!disable && finance.id != '' && finance.ticket_number == ''" label="產生支單" class="q-py-xs cursor-pointer q-my-sm" />
          </div>
          <div v-else>
            <q-badge v-if="!disable && finance.id != '' && finance.ticket_number == ''" label="產生收據" class="q-py-xs cursor-pointer q-my-sm" />
          </div>
        </div>
        <div v-if="!isClosed" class="item-delete text-center">
          <q-btn v-if="finance.ticket_number == ''" icon="delete" color="negative" class="full-height q-px-sm" @click="deleteFinance(index)" flat />
        </div>
      </div>
      <q-separator />
      <div class="finance-list text-bold flex items-center q-col-gutter-x-sm q-mt-sm">
        <div class="col text-right">小計</div>
        <div class="item-text text-h6 text-right">{{ getNumberFormat(financeSum) }}</div>
        <div class="item-ticket"></div>
        <div v-if="!isClosed" class="item-delete"></div>
      </div>
      <div v-if="!isClosed" class="q-my-md row justify-center">
        <q-btn label="新增收入/支出" color="primary" @click="addFinance" outline />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { ref, computed, onMounted } from 'vue';
import { useMetaStore } from "src/stores/meta";
import { getOrderParent, updateOrderParent } from 'src/api'
import { isEmpty, isNumberDigit, messages } from 'src/utils/validators';
import { financeOptions, financeCateOptions } from '../enums';
import { getNumberFormat, GetLocalTime } from 'src/utils/helpers';
import InputCurrencyPrice from 'src/components/InputCurrencyPrice.vue';
import to from 'await-to-js';

const $q = useQuasar();
const props = defineProps({
  orderNumber: {
    type: String,
    required: true
  }
})

const rules = computed(() => {
  return {
    required: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    finance_amount: [
      val => isNumberDigit(val, null, 2) || messages.invalidDecimal(2)
    ],
    exchange_rate: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isNumberDigit(val, 4, 5) || `${messages.invalidInteger(4)}，${messages.invalidDecimal(5)}`
    ]
  }
});

onMounted(() => {
  getData();
})

const isClosed = ref(false);
const model = ref();
const getData = async () => {
  $q.loading.show();
  const [err, res] = await to(getOrderParent(props.orderNumber));

  if (err) {
    console.error("getOrderParent error:", err);
    return;
  }
  res.data.finance = [
      {
        "id": 1,
        "type": "revenue",
        "cate": "other",
        "order_number": "C25032702461510",
        "title": "客人付款",
        "amount": 10800,
        "is_post": false,
        "currency": "TWD",
        "exchange_rate": 0.03,
        "ticket_number": ""
      },
      {
        "id": 2,
        "type": "expense",
        "cate": "other",
        "order_number": "C25032702461510",
        "title": "已付款",
        "amount": 300,
        "is_post": true,
        "currency": "USD",
        "exchange_rate": 1,
        "ticket_number": "2504180002"
      },
      {
        "id": 3,
        "type": "expense",
        "cate": "other",
        "order_number": "C25032702474691",
        "title": "已產生支單，未付款",
        "amount": 1000.22,
        "is_post": false,
        "currency": "USD",
        "exchange_rate": 1,
        "ticket_number": "2504180003"
      },
      {
        "id": 4,
        "type": "expense",
        "cate": "other",
        "order_number": "C25032702461510",
        "title": "未產生支單",
        "amount": "",
        "is_post": false,
        "currency": "USD",
        "exchange_rate": 1,
        "ticket_number": ""
      }
    ]
  model.value = res.data;
  if (model.value.todo == null) {
    model.value.todo = [];
  }
  $q.loading.hide();
}

const cancelEdit = () => {
	router.go(0);
}
const saveOrder = async () => {
  $q.loading.show();
  const [err, res] = await to(updateOrderParent(model.value.order_number, {
    name: model.value.name,
    subs: selectedSubOrder.value,
    todo: model.value.todo
  }));
  if (err) {
    console.error("updateOrderParent error:", err);
    return;
  }
  $q.loading.hide();
}

/* 訂單選項 Start */
const orderOptions = computed(() => {
  return [
    { value: props.orderNumber, label: props.orderNumber },
    ...model.value.subs.map((d) => {
      return {
        label: d.order_number,
        value: d.order_number
      }
    })
  ]
});
/* 訂單選項 End */

/* 編輯訂單收入支出 Start */
const metaStore = useMetaStore();
const addFinance = async () => {
  model.value.finance.push({
    id: '',
    type: 'revenue',
    cate: 'other',
    order: props.orderNumber,
    title: '',
    currency: 'TWD',
    amount: '',
    exchange_rate: _.round(await metaStore.getExchangeRate('TWD', 'USD'), 2),
    is_post: false,
    ticket_number: ''
	});
}
const changeCurrency = async (finance) => {
  finance.exchange_rate = _.round(await metaStore.getExchangeRate(finance.currency, 'USD'), 2);
}
function deleteFinance (index) {
  model.value.finance.splice(index, 1);
}
/* 編輯訂單收入支出 End */

// 換算美金
const financeUSD = computed(() => {
  return model.value.finance.map((d) => {
    return Number(d.amount) * Number(d.exchange_rate);
  });
});

// 小計金額
const financeSum = computed(() => {
  return model.value.finance.reduce((acc, cur) => {
    if (cur.type === 'revenue') {
      return acc + Number(cur.amount) * Number(cur.exchange_rate);
    } else {
      return acc - Number(cur.amount) * Number(cur.exchange_rate);
    }
  }, 0);
});
</script>

<style lang="scss" scoped>
.finance-list {
  .item-type {
    width: 95px;
  }
  .item-cate {
    width: 135px;
  }
  .item-order {
    width: 210px;
  }
  .item-price {
    width: 170px;
  }
  .item-rate {
    width: 90px;
  }
  .item-ticket {
    width: 120px;
  }
  .item-delete {
    width: 50px;
  }
}
</style>
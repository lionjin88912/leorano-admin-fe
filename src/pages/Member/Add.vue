<template>
  <div>
    <BreadCrumbs class="q-pb-md"></BreadCrumbs>
    <q-form @submit="doConfirm">
      <div class="flex justify-between q-mb-md">
        <div class="flex q-gutter-md">
          <uploader btn-text="上傳檔案" :accept="['.xlsx', '.xls']" @handleUpload="handleUpload" />
          <q-btn flat color="primary" label="範例檔案" @click="loadExample" />
        </div>
        <q-btn type="submit" color="primary" label="新增" />
      </div>
      <q-table v-if="isSubmit" class="data-table" :columns="addColumns" :rows="data" :rows-per-page-options="[50, 20, 10]" row-key="name" no-data-label="無新增資料">
        <template v-slot:body-cell="props">
          <q-td :props="props">
            <q-input v-model="props.row[props.col.name]" type="text" dense borderless :rules="props.col.name != 'note' ? rules.required : []" />
          </q-td>
        </template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">{{ addStatus[props.row.status].label }}</q-td>
        </template>
        <template v-slot:body-cell-gender="props">
          <q-td :props="props">
            <q-select v-model="props.row.gender" dense borderless :options="SexualOptions" :rules="rules.required"/>
          </q-td>
        </template>
        <template v-slot:body-cell-title="props">
          <q-td :props="props">
            <q-select v-model="props.row.title" dense borderless :options="TitleOptions" :rules="rules.required"/>
          </q-td>
        </template>
        <template v-slot:body-cell-membership_code="props">
          <q-td :props="props">
            <q-select v-model="props.row.membership_code" dense borderless :options="MembershipOptions" :rules="rules.required"/>
          </q-td>
        </template>
      </q-table>
       <q-table v-else class="data-table" :columns="addColumns" :rows="data" row-key="name" :rows-per-page-options="[50, 20, 10]" no-data-label="無新增資料">
        <template v-slot:body-cell-status="props">
          <q-td :props="props" :class="`text-${addStatus[props.row.status].color}`">
            {{ addStatus[props.row.status].label }}
          </q-td>
        </template>
       </q-table>
    </q-form>
    <Confirm ref="confirmRef" @confirm="onConfirm"></Confirm>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { tabArr, addColumns, addStatus, TitleOptions, SexualOptions } from './enums';
import { CreateUser } from 'src/api'
import { isEmpty, messages } from 'src/utils/validators';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import uploader from 'components/uploader.vue';
import Confirm from 'src/components/dialog/Confirm.vue';
import XLSX from 'xlsx-js-style';
import to from 'await-to-js'

const data = ref([]);

const $q = useQuasar();
function transposedArray (twoDimensionArray) {
  // 找出 twoDimensionArray 中最長的陣列
  let maxLength = Math.max(...twoDimensionArray.map(arr => arr.length));
  return Array.from({ length: maxLength }, (_, i) => twoDimensionArray.map(arr => arr[i]));
}

const MembershipOptions = tabArr.map((item) => item.text);
const loadExample = () => {
  // $q.loading.show({ message: "導出Excel資料" });
  const headers = addColumns.filter((item) => !['status'].includes(item.name)).map((item) => item.label);
  let excelDatas = [
    [],
    [],
    SexualOptions,
    TitleOptions,
    [],
    ['+886900000000'],
    MembershipOptions,
    []
  ];
  excelDatas = [headers, ...transposedArray(excelDatas)];
  const ws = XLSX.utils.aoa_to_sheet(excelDatas);
  const wsCols = [{ wpx: 80 }, { wpx: 80 }, { wpx: 80 }, { wpx: 60 }, { wpx: 120 }, { wpx: 120 }, { wpx: 80 }, { wpx: 200 }];
  ws['!cols'] = wsCols;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  const filename = `新增會員範例.xlsx`;
  XLSX.writeFileXLSX(wb, filename);
}

const handleUpload = async (files) => {
  let result = [];
  Promise.all(files.map(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        json.forEach((col) => {
          if (col.length > 0 && col[0] !== '*姓氏') {
            result.push({
              status: 0,
              last_name: col[0] || '',
              first_name: col[1] || '',
              gender: col[2] || '',
              title: col[3] || '',
              email: col[4] || '',
              phone: col[5] || '',
              membership_code: col[6] || '',
              note: col[7] || ''
            });
          }
        });
        resolve();
      };
    });
  })).then(() => {
    result = Array.from(new Set(result.map((list) => JSON.stringify(list))), JSON.parse); 
    data.value = result;
  });
}

const rules = computed(() => {
  return {
    required: [
      (val) => !isEmpty(val) || messages.requiredInput()
    ]
  }
})

const confirmRef = ref();
const doConfirm = () => {
  if (data.value.length === 0 || data.value.every((item) => item.status !== 0)) {
    $q.notify({ type: 'negative', message: '請上傳檔案' });
    return;
  }
  confirmRef.value.show({
    title: '新增會員資料',
    message: '送出後將新增所有會員資料，確認送出嗎？'
  });
}

const onConfirm = () => {
  handleSubmit();
}

const isSubmit = ref(false);
async function handleSubmit () {
  $q.loading.show();
  isSubmit.value = true;
  // 針對 data.value 回圈處理，等待全部處理完後再關閉 loading
  for (let i = 0; i < data.value.length; i++) {
    let item = { ...data.value[i] };
    delete item.status;
    
    let [err, res] = await to(CreateUser(item));
    if (res.code == 0) {
      // 新增成功
      data.value[i].status = 1;
    } else {
      // 新增失敗
      data.value[i].status = 2;
    }

  };
  $q.loading.hide();
}

</script>


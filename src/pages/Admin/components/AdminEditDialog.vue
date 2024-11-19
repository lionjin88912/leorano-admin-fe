<template>
  <q-dialog class="common-dialog" v-model="visible" persistent>
    <q-card class="container">
      <q-card-section class="sticky-top">
        <div class="flex">
          <div class="text-h6">{{ title }}</div>
          <q-space></q-space>
          <q-btn icon="close" flat dense rounded v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="content">
        <q-form v-if="model" ref="mainForm" @submit="doSubmit" class="edit-form q-gutter-y-md">
          <q-input v-model="model.username" label="使用者名稱" :rules="rules.username" outlined dense />
          <q-input v-model="model.email" label="Email" :rules="rules.email" outlined dense />
          <q-select v-model="model.role_id" :options="roleOptions" label="權限" outlined dense emit-value map-options disable />
          <div class="flex no-wrap q-gutter-sm">
            <q-input v-model="model.password" label="密碼" class="input-password" :type="isPwd ? 'password' : 'text'" :rules="rules.password" autocomplete="new-password" outlined dense>
              <template v-slot:append>
                <q-btn flat dense round :icon="isPwd ? 'visibility_off' : 'visibility'" @click="isPwd = !isPwd"/>
              </template>
            </q-input>
            <div>
              <q-btn label="自動產生" color="primary" class="generate-btn text-no-wrap" @click="generatePassword" />
            </div>
          </div>
          <q-select v-model="model.status" :options="statusOptions" label="狀態" outlined dense emit-value map-options/>
        </q-form>
      </q-card-section>
      <q-card-actions class="sticky-bottom" align="right">
        <q-btn flat label="取消" color="primary" v-close-popup />
        <q-btn flat label="儲存" color="primary" @click="doSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
    
<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { EditMode } from 'src/pages/enums';
import { statusOptions, roleOptions } from 'src/pages/Admin/enums';
import { isEmpty, isValidEmail, messages } from 'src/utils/validators';
import { RequestAdmin, CreateAdmin, UpdateAdmin } from 'src/api';
import to from 'await-to-js'

const isPwd = ref(true)

const rules = computed(() => {
  return {
    username: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    email: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isValidEmail(val) || messages.email()
    ],
    password: [
      val => isEdit.value || !isEmpty(val) || messages.requiredInput(),
      val => {
        if (!val) return true; // 如果沒有填寫密碼，跳過驗證
        if (val.length < 8) return '密碼長度至少需要8碼';
        const validChars = /^[a-zA-Z0-9!@#$%]+$/;
        return validChars.test(val) || '密碼只能包含英文大小寫、數字和特殊符號(!@#$%)';
      }
    ],
  }
})

const createEmptyModel = () => {
  return {
    username: '',
    email: '',
    password: '',
    status: 1,
    role_id: 1
  }
}

const visible = ref(false)
const title = ref('');
const mode = ref();
const model = ref();
const show = async ({ data }) => {
  visible.value = true;
  if (data) {
    title.value = '編輯帳號';
    mode.value = EditMode.Edit;
    await reloadModel(data.id);
  } else {
    title.value = '新增帳號';
    mode.value = EditMode.New;
    model.value = createEmptyModel();
  }
};
defineExpose({
  show
});

const isEdit = computed(() => {
  return mode.value === EditMode.Edit;
});

const reloadModel = async (id) => {
  const [err, res] = await to(RequestAdmin(id));
  if (err) {
    console.error('reload model error:', err);
    return {};
  }
  model.value = res.data;
}

const generatePassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%'
  
  // 確保密碼至少包含每種類型的一個字符
  let password = ''
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  password += symbols.charAt(Math.floor(Math.random() * symbols.length))
  
  // 剩下四碼隨機
  const allChars = lowercase + uppercase + numbers + symbols
  for (let i = 0; i < 4; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }
  
  // 打亂順序
  password = password.split('').sort(() => Math.random() - 0.5).join('')
  
  model.value.password = password
  isPwd.value = false  // Show the generated password
}

const $q = useQuasar();
const mainForm = ref();
const emit = defineEmits(['updated'])
const doSubmit = async () => {
  if (!await mainForm.value.validate()) {
    console.warn("表單驗證未通過");
    return;
  }
  $q.loading.show();
  const api = isEdit.value ? UpdateAdmin(model.value.id, model.value) : CreateAdmin(model.value);
  const [err, res] = await to(api);
  $q.loading.hide();

  if (err) {
    console.error('main update error:', err);
    return;
  }
  visible.value = false;
  emit('updated');
}
</script>

<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 450px;
  max-width: 100%;

  .content {
    padding-top: 0px;

    &-scroll {
      width: 650px;
      height: 400px;
    }
  }

  .edit-form {
    width: 450px;
  }

  .input-password {
    width: 100%;
  }

  .generate-btn {
    height: 40px;
  }
}
</style>
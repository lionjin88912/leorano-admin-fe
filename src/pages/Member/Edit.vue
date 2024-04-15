<template>
  <div>
    <BreadCrumbs class="q-pb-md"></BreadCrumbs>
    <q-form @submit="doConfirm">
      <div class="column">
        <div class="flex justify-end">
          <!-- <uploader class="q-pr-md" btn-text="上傳文件" @handleUpload="handleUpload" /> -->
          <q-btn type="submit" color="primary" label="更新會員資料" />
        </div>
        <div class="flex items-center q-pb-sm">
          <q-img :src="data && data.photo" spinner-color="white" class="avatar">
            <div class="select-file" @click="openFileInput">
              <input ref="fileInputRef" type="file" accept="image/jpeg,image/jpg" @change="handleFileChange" hidden />
              選擇照片
            </div>
          </q-img>
          <InfoRow>
            <div class="info-field q-gutter-md">
              <q-input v-model="data.first_name" label='名' dense outlined />
              <q-input v-model="data.last_name" label='姓氏' dense outlined />
              <q-input v-model="data.nickname" label='暱稱' dense outlined />
            </div>
            <div class="info-field q-gutter-md">
              <q-select v-model="data.gender" :options="SexualOptions" label='性別' style="min-width:170px;" dense
                outlined />
              <q-select v-model="data.title" :options="TitleOptions" label='稱謂' style="min-width:170px;" dense outlined />
              <q-input v-model="birthday" label='生日' dense outlined />
            </div>
          </InfoRow>
        </div>
        <q-tabs v-model="currentTab" class="text-grey" active-color="primary" indicator-color="primary" align="left"
          narrow-indicator>
          <q-tab v-for="(item, index) in tabs" :key="index" :name="item.value" :label="item.label" />
        </q-tabs>
        <q-separator />
        <InfoRow v-if="currentTab === tabs[0].value">
          <div class="flex-1 wrap">
            <div class="flex-1 column">
              <div class="info-field q-gutter-md">
                <!-- <q-field class="info-field-input" label='會籍期限' dense outlined stack-label>
                  <template v-slot:control>
                    {{ expiredAt }}
                  </template>
                </q-field> -->
                <q-input v-model="expiredAt" label='會籍期限' readonly dense outlined />
              </div>
              <div class="info-field q-gutter-md">
                <q-input v-model="data.email" label='E-mail' readonly dense outlined />
                <q-input v-model="data.phone" label='電話' readonly dense outlined />
              </div>
              <q-separator class="q-mr-xl q-my-md"></q-separator>
              <div class="info-field q-gutter-md">
                <q-input v-model="data.invite_code" label='推薦碼' readonly dense outlined />
                <q-input v-model.number="data.invite_times" class="invite-times" type="number" label="可推薦用戶數" suffix="人"
                  :readonly="!data.invite_code" outlined dense />
              </div>
            </div>
            <div class="flex-1 column">
              <div class="q-pt-sm">
                <div class="text-bold text-grey-9">相關文件</div>
                <div v-if="files.length <= 0" class="text-grey-6">(無相關文件)</div>
              </div>
              <div class="q-mt-sm">
                <uploader btn-text="上傳文件" @handleUpload="handleUpload" />
                <div class="cursor-pointer text-blue-8 q-mt-md" v-for="(val, id) in files" :key="id"
                  @click="handleDownloadFile(val)">
                  <div class="no-wrap">
                    <span>{{ id + 1 }}.&nbsp;</span>
                    <span>{{ val }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </InfoRow>
        <InfoRow v-if="currentTab === tabs[1].value">
          <div class="flex-1 q-gutter-x-md">
            <div class="flex column">
              <div class="info-field q-mt-md">
                <div class="info-field-label text-left">所在地</div>
              </div>
              <div class="info-field q-gutter-md">
                <q-input v-model="data.country" label='國家' dense outlined />
                <q-input v-model="data.city" label='城市' dense outlined />
              </div>
              <div class="info-field q-mt-md">
                <div class="info-field-label text-left">教育 & 工作</div>
              </div>
              <div class="info-field q-gutter-md">
                <q-input v-model="data.income" type="number" label='年收入' dense outlined />
                <q-input v-model="data.education" label='教育程度' dense outlined />
              </div>
              <div class="info-field q-gutter-md">
                <q-input v-model="data.company" label='公司名稱' dense outlined />
                <q-input v-model="data.profession" label='職稱' dense outlined />
              </div>
              <div class="info-field q-mt-md">
                <div class="info-field-label text-left">社群</div>
              </div>
              <div class="info-field q-gutter-md">
                <q-input type="text" v-model="ig" label='instagram' prefix="@" dense outlined />
                <q-input v-model="data.linkedin" label='linkedin' dense outlined />
              </div>
            </div>
            <div class="flex-1 column">
              <div class="info-field q-mt-md">
                <div class="info-field-label text-left">備註</div>
              </div>
              <div class="info-field">
                <q-input style="width: 100%; max-width: 400px;" v-model="data.note" :rows="9" type="textarea" dense
                  outlined />
              </div>
            </div>
          </div>
        </InfoRow>
        <InfoRow v-if="currentTab === tabs[2].value">
          <div class="info-field row">
            <div class="col col-xs-12 col-sm-6 col-md-4 col-lg-4" v-for="(item, index) in loyalties" :key="index">
              <q-input v-model="item.value" :label="item.label" class="q-pa-sm" dense outlined />
            </div>
          </div>
        </InfoRow>
      </div>
    </q-form>
    <Confirm ref="confirmRef" @confirm="onConfirm"></Confirm>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { RequestUser, GetLoyalty, SaveUserProfile, RequestUploadUserFile, RequestDownloadFile } from 'src/api';
import uploader from 'components/uploader.vue';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import { getDateString } from 'src/utils/helpers';
import InfoRow from '../orders/components/InfoRow.vue';
import { TitleOptions, SexualOptions } from './enums';
import Confirm from 'src/components/dialog/Confirm.vue';

const to = require('await-to-js').default
const $q = useQuasar();
const route = useRoute();

const data: any = ref({
  first_name: "",
  last_name: "",
  nickname: "",
  birthday: "",
  gender: "",
  country: "",
  city: "",
  profession: "",
  company: "",
  income: "",
  education: "",
  linkedin: "",
  instagram: "",
  invite_code: "",
  invite_times: 0,
  note: null
});
const confirmRef = ref()
const ig = ref("")
const fileInputRef: any = ref(null);
const files: any = ref([])
const loyalties: any = ref([]);
const id = route.params.id;
const currentTab = ref('register')
const tabs = ref([
  { label: '註冊資料', value: 'register' },
  { label: '基本資料', value: 'basic' },
  { label: 'Loyalty Program', value: 'royalty' }
])

onMounted(async () => {
  getData();
})

const getData = async () => {
  $q.loading.show();

  let [err, res] = await to(RequestUser(id));

  if (err) {
    console.error('getUser error:', err);
    $q.loading.hide();
    return;
  }

  files.value = res.data.files || [];
  const profile = res.data.profile;

  data.value = profile;
  data.value.loyalties = res.data.loyalties;
  data.value.linkedin = profile.linkedin || '';
  data.value.company = profile.company || '';
  if (data.value.instagram) {
    ig.value = JSON.parse(data.value.instagram).user_account;
  }

  [err, res] = await to(GetLoyalty());
  $q.loading.hide();

  if (err) {
    console.error('getRoyalty error:', err);
    return;
  }

  loyalties.value = res.data.map((item: any) => {
    let hotelGroup: any = data.value.loyalties?.find((d: any) => d.hotel_group_id == item.id);
    return {
      id: item.id,
      label: item.loyalty_plan,
      value: hotelGroup?.code || ""
    }
  }) || []
}

const birthday = computed(() => {
  return getDateString(data.value.birthday, 'YYYY-MM-DD')
})
const expiredAt = computed(() => {
  if (data.value.MembershipRecords && data.value.MembershipRecords.length > 0) {
    return getDateString(data.value.MembershipRecords[0].expired_at, "YYYY-MM-DD")
  }
  return ''
})

const handleFileChange = (event: any) => {
  const file = fileInputRef.value?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;
      data.value.photo = base64String
    };
    reader.readAsDataURL(file);
  }
}

const openFileInput = () => {
  fileInputRef.value.click()
};

const doConfirm = () => {
  confirmRef.value.show({
    title: '更新會員資料',
    message: '送出後會員資料將立即更新，確認送出嗎？'
  })
}

const onConfirm = () => {
  handleSubmit()
}

const handleSubmit = async () => {
  $q.loading.show();
  data.value.income = +data.value.income;
  const reqData = {
    loyalties: loyalties.value.filter((d: any) => d.value != ""),
    user: data.value
  };
  const [err, res] = await to(SaveUserProfile(id, reqData));
  $q.loading.hide();

  if (err) {
    console.error('submit error:', err);
  }
}

const handleUpload = async (files: File[]) => {
  $q.loading.show();
  const [err, res] = await to(RequestUploadUserFile(id, { files: files }));
  $q.loading.hide();
  if (err) {
    console.error('upload error:', err);
    return;
  }
  getData()
}

const handleDownloadFile = async (fileName: string) => {
  $q.loading.show();

  const [err, res] = await to(RequestDownloadFile(id, { fileName: fileName }, { responseType: 'blob' }));
  $q.loading.hide();

  if (err) {
    console.error('download file error:', err);
    return;
  }

  const url = window.URL.createObjectURL(new Blob([res]));
  const link = document.createElement('a');

  link.href = url;
  console.log(url)
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
}
</script>

<style lang="scss" scoped>
.info-field-input {
  min-width: 200px;
}

.avatar {
  position: relative;
  border-radius: 100%;
  border: 1px solid $grey-3;
  width: 160px;
  height: 160px;

  .select-file {
    cursor: pointer;
    position: absolute;
    bottom: 0px;
    background: rgba($grey-10, .5);
    width: 100%;
    text-align: center;
    transition: ease .3s;

    &:hover {
      background: rgba($grey-10, .8);
    }
  }
}

.invite-times {
  width: 180px;

  :deep() input {
    text-align: right;
  }
}
</style>

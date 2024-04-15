<template>
  <div>
    <BreadCrumbs class="q-pb-md"></BreadCrumbs>
    <q-form @submit="doConfirm">
      <div class="column">
        <div class="flex justify-end">
          <uploader class="q-pr-md" btn-text="上傳文件" @handleUpload="handleUpload" />
          <q-btn type="submit" color="primary" label="更新會員資料" />
        </div>
        <div class="q-ml-md">
          <InfoRow title="註冊資料">
            <div class="flex q-pt-sm">
              <div class="flex q-pt-sm relative-position">
                <q-icon class="absolute-top-right q-pt-sm" name="history" size="20px" color="primary">
                  <q-tooltip class="bg-transparent" self="center left">
                    <q-img :src="data && data.photo" spinner-color="white" class="avatar" />
                  </q-tooltip>
                </q-icon>
                <q-img :src="data && data.user_profile.photo" spinner-color="white" class="avatar">
                  <div class="select-file" @click="openFileInput">
                    <input ref="fileInputRef" type="file" accept="image/jpeg,image/jpg" @change="handleFileChange"
                      hidden />
                    選擇照片
                  </div>
                </q-img>
              </div>
              <div class="flex-1 wrap">
                <div class="flex column">
                  <div class="info-field">
                    <div class="info-field-label">申請日期</div>
                    <div class="info-field-text">{{ getDateString(data.user_profile?.created_at, "YYYY-MM-DD") }}</div>
                  </div>
                  <div class="info-field">
                    <div class="info-field-label">E-mail</div>
                    <div class="info-field-text flex items-center q-gutter-x-xs">
                      <div>{{ data.user_profile.email }}</div>
                      <q-icon v-if="data.email" name="history" size="20px" color="primary">
                        <q-tooltip><span class="tooltip-text">{{ data.email }}</span></q-tooltip>
                      </q-icon>
                    </div>
                  </div>
                  <div class="info-field">
                    <div class="info-field-label">電話</div>
                    <div class="info-field-text">
                      <div class="info-field-text flex items-center q-gutter-x-xs">
                        <div>{{ data && data.user_profile.phone }}</div>
                        <q-icon v-if="data.phone" name="history" size="20px" color="primary">
                          <q-tooltip><span class="tooltip-text">{{ data.phone }}</span></q-tooltip>
                        </q-icon>
                      </div>
                    </div>
                  </div>
                  <div class="info-field">
                    <div class="info-field-label">推薦碼</div>
                    <div class="info-field-text">{{ data.user_profile.invite_code || 'N/A' }}</div>
                  </div>
                  <div class="info-field">
                    <div class="info-field-label"></div>
                    <q-input v-model.number="data.user_profile.invite_times" class="invite-times" type="number"
                      :readonly="!data.user_profile.invite_code" prefix="可推薦用戶數" suffix="人" filled dense />
                  </div>
                </div>
                <div v-if="files.length > 0" class="flex-1">
                  <div class="info-field">
                    <div class="info-field-label">相關文件</div>
                    <div class="info-field-text q-mt-md">
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
              </div>
            </div>
            <div class="flex-1 bordered-dash q-my-md q-mx-lg"></div>
            <div class="info-field">
              <div class="info-field-label text-left">基本資訊</div>
            </div>
            <div class="info-field q-gutter-md">
              <q-input v-model="data.user_profile.first_name" label='名' dense outlined>
                <template #append>
                  <q-icon name="history" size="20px" color="primary">
                    <q-tooltip><span class="tooltip-text">{{ data.first_name || 'N/A' }}</span></q-tooltip>
                  </q-icon>
                </template>
              </q-input>
              <q-input v-model="data.user_profile.last_name" label='姓氏' dense outlined>
                <template #append>
                  <q-icon name="history" size="20px" color="primary">
                    <q-tooltip><span class="tooltip-text">{{ data.last_name || 'N/A' }}</span></q-tooltip>
                  </q-icon>
                </template>
              </q-input>
              <q-input v-model="data.user_profile.nickname" label='暱稱' dense outlined>
                <template #append>
                  <q-icon name="history" size="20px" color="primary">
                    <q-tooltip><span class="tooltip-text">{{ data.nickname || 'N/A' }}</span></q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="info-field q-gutter-md">
              <q-field label="生日" dense outlined stack-label style="width:195px;">
                <template #default>
                  <DatePicker :date="data.user_profile.birthday" @updated="(val) => data.user_profile.birthday = val" />
                </template>
                <template v-slot:control>
                  <div>{{ getDateString(data.user_profile.birthday, 'YYYY-MM-DD') }}</div>
                </template>
                <template #append>
                  <q-icon name="history" size="20px" color="primary">
                    <q-tooltip><span class="tooltip-text">{{ getDateString(data.birthday, 'YYYY-MM-DD') || 'N/A'
                    }}</span></q-tooltip>
                  </q-icon>
                </template>
              </q-field>
              <q-select v-model="data.user_profile.gender" :options="SexualOptions" label='性別' style="min-width:195px;"
                dense outlined>
                <template #append>
                  <q-icon name="history" size="20px" color="primary">
                    <q-tooltip><span class="tooltip-text">{{ data.gender || 'N/A' }}</span></q-tooltip>
                  </q-icon>
                </template>
              </q-select>
              <q-select v-model="data.user_profile.title" :options="TitleOptions" label='稱謂' style="min-width:195px;"
                dense outlined>
                <template #append>
                  <q-icon name="history" size="20px" color="primary">
                    <q-tooltip><span class="tooltip-text">{{ data.title || 'N/A' }}</span></q-tooltip>
                  </q-icon>
                </template>
              </q-select>
            </div>
            <div class="flex-1 q-gutter-x-md">
              <div class="flex column">
                <div class="info-field q-mt-md">
                  <div class="info-field-label text-left">所在地</div>
                </div>
                <div class="info-field q-gutter-md">
                  <q-input v-model="data.user_profile.country" label='國家' dense outlined>
                    <template #append>
                      <q-icon name="history" size="20px" color="primary">
                        <q-tooltip><span class="tooltip-text">{{ data.country || 'N/A' }}</span></q-tooltip>
                      </q-icon>
                    </template>
                  </q-input>
                  <q-input v-model="data.user_profile.city" label='城市' dense outlined>
                    <template #append>
                      <q-icon name="history" size="20px" color="primary">
                        <q-tooltip><span class="tooltip-text">{{ data.city || 'N/A' }}</span></q-tooltip>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="info-field q-mt-md">
                  <div class="info-field-label text-left">教育 & 工作</div>
                </div>
                <div class="info-field q-gutter-md">
                  <q-input v-model="data.user_profile.income" type="number" label='年收入' dense outlined>
                    <template #append>
                      <q-icon name="history" size="20px" color="primary">
                        <q-tooltip><span class="tooltip-text">{{ data.income || 'N/A' }}</span></q-tooltip>
                      </q-icon>
                    </template>
                  </q-input>
                  <q-input v-model="data.user_profile.education" label='教育程度' dense outlined>
                    <template #append>
                      <q-icon name="history" size="20px" color="primary">
                        <q-tooltip><span class="tooltip-text">{{ data.education || 'N/A' }}</span></q-tooltip>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="info-field q-gutter-md">
                  <q-input v-model="data.user_profile.company" label='公司名稱' dense outlined>
                    <template #append>
                      <q-icon name="history" size="20px" color="primary">
                        <q-tooltip><span class="tooltip-text">{{ data.company || 'N/A' }}</span></q-tooltip>
                      </q-icon>
                    </template>
                  </q-input>
                  <q-input v-model="data.user_profile.profession" label='職稱' dense outlined>
                    <template #append>
                      <q-icon name="history" size="20px" color="primary">
                        <q-tooltip><span class="tooltip-text">{{ data.profession || 'N/A' }}</span></q-tooltip>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="info-field q-mt-md">
                  <div class="info-field-label text-left">社群</div>
                </div>
                <div class="info-field q-gutter-md">
                  <q-input type="text" v-model="ig" label='instagram' prefix="@" dense outlined />
                  <q-input v-model="data.user_profile.linkedin" label='linkedin' dense outlined />
                </div>
              </div>
              <div class="flex-1 column">
                <div class="info-field q-mt-md">
                  <div class="info-field-label text-left">備註</div>
                </div>
                <div class="info-field">
                  <q-input style="width: 100%; max-width: 400px;" v-model="data.user_profile.note" :rows="9"
                    type="textarea" dense outlined />
                </div>
              </div>
            </div>
          </InfoRow>
        </div>
        <div class="flex justify-end">
          <q-btn type="submit" color="primary" label="更新會員資料" />
        </div>
      </div>
    </q-form>
    <Confirm ref="confirmRef" @confirm="onConfirm"></Confirm>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { router } from 'src/router';
import {
  RequestDownloadFile,
  RequestRegisterRecord,
  RequestUploadUserFile,
  // SaveRegisterRecord
  SaveUserProfile
} from 'src/api';
import uploader from 'components/uploader.vue';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import InfoRow from 'src/pages/orders/components/InfoRow.vue';
import DatePicker from 'src/components/DatePicker.vue';
import { TitleOptions, SexualOptions } from '../enums';
import { getDateString, getDateStringNoTz } from 'src/utils/helpers';
import Confirm from 'src/components/dialog/Confirm.vue';

const data = ref({
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
  photo: "",
  user_profile: {}
});
const confirmRef = ref()
const ig = ref("")
const fileInputRef = ref(null);
const id = router.currentRoute.value.params.id;
const files = ref([])

const getData = () => {
  return RequestRegisterRecord(id).then((res) => {
    data.value = { ...res.data.record }
    files.value = res.data.files || []
    if (data.value.user_profile.instagram) {
      ig.value = JSON.parse(data.value.user_profile.instagram).user_account
    }
  })
}

const openFileInput = () => {
  fileInputRef.value.click()
};

const handleFileChange = (event) => {
  const file = fileInputRef.value.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;

      data.value.user_profile.photo = base64String
    };
    reader.readAsDataURL(file);
  }
}

const doConfirm = () => {
  confirmRef.value.show({
    message: '送出後會員資料將立即更新，確認送出嗎？'
  })
}

const onConfirm = () => {
  handleSubmit()
}

const handleSubmit = async () => {
  const newData = {
    user: {
      first_name: data.value.user_profile.first_name,
      last_name: data.value.user_profile.last_name,
      nickname: data.value.user_profile.nickname,
      birthday: getDateStringNoTz(data.value.user_profile.birthday, 'YYYY-MM-DD'),
      gender: data.value.user_profile.gender,
      title: data.value.user_profile.title,
      country: data.value.user_profile.country,
      city: data.value.user_profile.city,
      income: Number(data.value.user_profile?.income || 0),
      education: data.value.user_profile.education,
      company: data.value.user_profile.company || "",
      profession: data.value.user_profile.profession,
      linkedin: data.value.user_profile.linkedin || "",
      note: data.value.user_profile.note,
      photo: data.value.user_profile.photo,
      invite_times: data.value.user_profile.invite_times || 0
    }
  }
  await SaveUserProfile(data.value.user_id, newData)
}
const handleUpload = (files) => {
  RequestUploadUserFile(data.value.user_id, { files: files }).then(async () => {
    // reload file
    getData()
  })
}

const handleDownloadFile = (fileName) => {
  RequestDownloadFile(
    data.value.user_id,
    { fileName: fileName },
    {
      responseType: 'blob', // 這裡告訴axios返回二進制數據
    }).then(async (res) => {
      const url = window.URL.createObjectURL(new Blob([res]));

      const link = document.createElement('a');

      link.href = url;
      console.log(url)
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    })
}

onMounted(async () => {
  await getData()
})

</script>

<style lang="scss" scoped>
.info-field {
  display: flex;

  &-title {
    font-weight: 500;
    font-size: 16px;
  }

  &-label {
    font-weight: 500;
    color: $grey-10;
    padding-right: 8px;
  }

  &-text {
    color: $grey-7;
  }
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

.tooltip-text {
  font-size: 16px;
}
</style>

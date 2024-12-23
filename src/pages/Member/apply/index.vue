<template>
  <div>
    <BreadCrumbs class="q-pb-md"></BreadCrumbs>
    <q-form class='row'>
      <q-input v-model='filter.search' dense class='q-mx-md q-my-sm' style='width: 240px' outlined placeholder='Search'
        :debounce="500">
        <template v-slot:append>
          <q-icon class='cursor-pointer' name='search' @click="getList" />
        </template>
      </q-input>
      <q-space />
    </q-form>
    <TabComponent :tabArr='tabArr' :currentTab="currentTab" @update:model-value="handleClick"></TabComponent>
    <TableCardComponent ref='tableChildRef' :propsFilter='filter' :columns='enumColumns' :handleCallApi='getList'>
      <template v-slot:body="slotProps">
        <q-tr :props="slotProps.props" no-hover>
          <q-td class="q-pa-none" auto-width>
            <q-card class="q-ma-sm ">
              <q-card-section>
                <div class='row q-mb-lg'>
                  <div class="col-2 column user-info">
                    <div class="user-info-title">申請日期</div>
                    <div class="user-info-field">
                      <div class="field-label">
                        {{ getDateString(slotProps.props.row.user_profile?.created_at, 'YYYY-MM-DD HH:mm') }}
                      </div>
                      <div class="q-pt-md">
                        <q-img :src="slotProps.props.row.photo" spinner-color="white" ratio="1" style="max-width:200px;"
                          img-class="rounded-max bordered" />
                      </div>
                    </div>
                  </div>
                  <div class="col-8 row q-ml-md">
                    <div class="col-3 column user-info">
                      <div class="user-info-title">註冊資料</div>
                      <div class="user-info-field">
                        <div class="field-label">E-mail</div>
                        <div class="field-text">{{ slotProps.props.row.user_profile.email }}</div>
                      </div>
                      <div class="user-info-field">
                        <div class="field-label">電話</div>
                        <div class="field-text">{{ slotProps.props.row.user_profile.phone }}</div>
                      </div>
                      <div class="user-info-field">
                        <div class="field-label">申請會籍</div>
                        <div class="field-text">{{ slotProps.props.row.member_ship }}</div>
                      </div>
                      <div class="user-info-field">
                        <div class="field-label">推薦人</div>
                        <div class="field-text">
                          <template v-if="slotProps.props.row.marketing">
                            {{ slotProps.props.row.marketing?.membership_event?.title || 'N/A' }}
                          </template>
                          <template v-else-if="slotProps.props.row.invite_user">
                            <div class="flex q-gutter-x-xs">
                              <div>{{ slotProps.props.row.invite_user.first_name }}</div>
                              <div>{{ slotProps.props.row.invite_user.last_name }}</div>
                            </div>
                          </template>
                          <template v-else>N/A</template>
                        </div>
                      </div>
                      <div class="user-info-field">
                        <div class="field-label">來源</div>
                        <div class="field-text">
                          {{ slotProps.props.row.other_source || slotProps.props.row.source }}
                        </div>
                      </div>
                      <div class="user-info-field">
                        <div class="field-label">語系</div>
                        <div class="field-text">{{ slotProps.props.row.lang }}</div>
                      </div>
                    </div>
                    <div class="col user-info">
                      <div class="user-info-title">基本資料</div>
                      <div class="flex row q-mr-auto">
                        <div class="col">
                          <div class="user-info-field">
                            <div class="field-label">first name</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.first_name }}</div>
                          </div>
                          <div class="user-info-field">
                            <div class="field-label">last name</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.last_name }}</div>
                          </div>
                          <div class="user-info-field">
                            <div class="field-label">nickname</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.nickname }}</div>
                          </div>
                          <div class="user-info-field">
                            <div class="field-label">生日</div>
                            <div class="field-text">
                              {{ getDateString(slotProps.props.row.user_profile.birthday, 'YYYY-MM-DD') }}
                            </div>
                          </div>
                          <div class="user-info-field">
                            <div class="field-label">性別</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.gender }}</div>
                          </div>
                        </div>
                        <div class="col">
                          <div class="user-info-field">
                            <div class="field-label">稱謂</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.title }}</div>
                          </div>
                          <div class="user-info-field">
                            <div class="field-label">年收入</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.income }}</div>
                          </div>
                          <div class="user-info-field">
                            <div class="field-label">教育程度</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.education }}</div>
                          </div>
                          <div class="user-info-field">
                            <div class="field-label">國家</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.country }}</div>
                          </div>
                          <div class="user-info-field">
                            <div class="field-label">城市</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.city }}</div>
                          </div>
                          <div class="user-info-field">
                            <div class="field-label">公司</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.company }}</div>
                          </div>
                          <div class="user-info-field">
                            <div class="field-label">職稱</div>
                            <div class="field-text">{{ slotProps.props.row.user_profile.profession }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-3 column user-info">
                      <div class="user-info-title">社群帳號</div>
                      <div class="user-info-field">
                        <div class="field-label">Instagram</div>
                        <div class="field-text">@{{ instagramParse(slotProps.props.row.user_profile.instagram) }}</div>
                      </div>
                      <div class="user-info-field">
                        <div class="field-label">Linkedin</div>
                        <div class="field-text">{{ slotProps.props.row.user_profile.linkedin }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col column">
                    <component :is='currentTabComponent' :propsData='slotProps.props.row' @handleUpdate='handleUpdate'>
                    </component>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-td>
        </q-tr>
      </template>
    </TableCardComponent>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import TableCardComponent from 'components/TableCardComponent.vue';
import { RequestRegisterRecords, RequestRegisterRecordAction } from 'src/api'
import { columns as enumColumns, tabArr } from './enums';
import { router } from 'src/router';
import TabComponent from 'src/components/TabComponent.vue';
import apply from './components/apply.vue'
import finished from './components/finished.vue'
import replenish from './components/replenish.vue'
import expired from './components/expired.vue'
import reject from './components/reject.vue'
import { getDateString } from 'src/utils/helpers'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';

const tableChildRef = ref(null)

const filter = reactive({
  search: router.currentRoute.value.query.search || '',
  status: parseInt(router.currentRoute.value.query.status) || tabArr[0].val
})

const currentTab = computed(() => {
  return tabArr.find((item) => item.val === filter.status)
})

const instagramParse = (data) => {
  if (data) {
    const ig = JSON.parse(data);
    return ig.user_account
  }
  return "";
}

function getList(params = {}) {
  return RequestRegisterRecords({
    ...filter,
    ...params
  })
}

const handleClick = (tabItem) => {
  filter.status = tabItem.val
}

const handleUpdate = async (val) => {
  await RequestRegisterRecordAction(val.id, val.action, val.data).then(async () => {
    tableChildRef.value.handleReload()
    // await getList()
  })

  // RequestUpdateHotel(data.value.id,val).then( () => {
  //   readApi(data.value.id)
  // })
}

const currentTabComponent = computed(() => {
  switch (filter.status) {
    case 1:
      return apply;
    case 2:
      return finished;
    case 4:
      return replenish;
    case 5:
      return reject;
    case 3:
      return expired;
    default:
      return '';
  }
})
</script>

<style lang="scss" scoped>
.q-btn .q-focus-helper {
  display: none;
}

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

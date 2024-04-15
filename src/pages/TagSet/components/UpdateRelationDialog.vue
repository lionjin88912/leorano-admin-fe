<template>
  <q-dialog class="common-dialog" v-model="visible" persistent>
    <q-card class="container">
      <q-card-section class="sticky-top">
        <div class="flex">
          <div class="text-h6">
            刪除標籤 <span class="text-bold">{{ model.name }}</span> 引用關聯
          </div>
          <q-space></q-space>
          <q-btn icon="close" flat dense rounded v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="content">
        <div>
          <!-- <div class="flex q-gutter-x-md q-pb-md">
            <div>將所有引用處移轉為：</div>
            <q-select v-model="currentTypeId"></q-select>
          </div> -->
          <div class="flex q-pb-sm">
            <div class="text-bold q-pr-sm">{{ model.name }}</div>
            <div>被引用在下列情境，</div>
            <div class="text-red">刪除後將失去相關標籤設定</div>
          </div>
          <q-tabs v-model="currentTab" class="text-grey-8" active-color="primary" indicator-color="primary"
            narrow-indicator no-caps align="left" dense>
            <q-tab v-for="(tab, index) of tabs" :key="index" content-class="q-px-lg"
              :label="`${tab.label} (${tab.amount})`" :name="tab.value" />
          </q-tabs>
          <q-separator></q-separator>
          <q-scroll-area class="content-scroll">
            <q-tab-panels v-model="currentTab" keep-alive animated>
              <q-tab-panel :name="currentTab" class="q-px-none">
                <div class="ref-list" v-for="(data, index) of model[currentTab]" :key="index">
                  <div class="ref-list-item q-gutter-x-md">
                    <div class="sn">{{ index + 1 }}.</div>
                    <template v-if="currentTab === 'plans'">
                      <div class="flex q-gutter-x-md cursor-pointer" @click="goto(data)">
                        <div class="flex items-center q-gutter-x-sm">
                          <div class="label">Rate Code</div>
                          <div class="name">{{ data.rate_code }}</div>
                        </div>
                        <div class="flex items-center q-gutter-x-sm">
                          <div class="label">Rate type</div>
                          <div class="name">{{ data.rate_type }}</div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div>
                        <!-- <div class="flex items-center q-gutter-x-sm">
                          <div class="label">ID</div>
                          <div class="id">{{ data.id }}</div>
                        </div> -->
                        <div class="flex items-center q-gutter-x-sm">
                          <!-- <div class="label">名稱</div> -->
                          <div class="name cursor-pointer" @click="goto(data)">{{ data.name }}</div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-scroll-area>
        </div>
      </q-card-section>
      <q-card-actions class="sticky-bottom" align="center">
        <div class="flex-1 items-center justify-end q-gutter-md">
          <q-btn class="dialog-button" outline label="Cancel" color="primary" v-close-popup />
          <q-btn class="dialog-button" type="submit" label="Delete" color="negative" @click="doSubmit" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { deleteTag } from 'src/api';
import to from 'await-to-js';

const emit = defineEmits(['updated'])
const $q = useQuasar();
const router = useRouter();
const visible = ref(false)
const model = ref();
const tabs = ref<any[]>([]);
const currentTab = ref();

interface DialogData {
  data: any
  typeList: any[]
}

const show = async ({ data, typeList }: DialogData) => {
  visible.value = true;
  model.value = data;
  initTabs()
};

const doSubmit = async () => {
  $q.loading.show();
  const [err, res] = await to(deleteTag(model.value.id));
  $q.loading.hide();

  if (err) {
    console.error('Update Tag Relation error:', err);
    return;
  }
  emit('updated');
  visible.value = false
}

const initTabs = () => {
  tabs.value = []
  if (model.value) {
    const checklist = [
      { label: '推播通知', value: 'notifies' },
      { label: '酒店方案', value: 'plans' },
      { label: '酒店房價', value: 'rates' },
      { label: '酒店房型', value: 'rooms' }
    ]
    for (let cate of checklist) {
      if (model.value.hasOwnProperty(cate.value) && model.value[cate.value].length > 0) {
        tabs.value.push({ ...cate, amount: model.value[cate.value].length })
      }
    }
  }
  currentTab.value = tabs.value[0].value
}

const goto = (data: any) => {
  let url = ''
  if (currentTab.value === 'notifies') {
    url = `/notifications/marketing?id=${data.id}`
  } else {
    url = `/hotels/edit/${data.hotel_id}`
  }
  window.open(url, '_blank')
}

defineExpose({
  show
});

</script>
<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 450px;
  max-width: 100%;

  .content {
    &-scroll {
      width: 550px;
      height: 300px;
    }
  }
}

.ref-list {
  font-size: 16px;

  &-item {
    display: flex;
    align-items: center;
    color: $grey-7;
    margin-bottom: 6px;
    transition: ease 0.2s;

    &:hover {
      background-color: $grey-2;
    }

    .sn {
      color: $grey-6;
      font-size: 16px;
      font-weight: bold;
      min-width: 30px;
      text-align: right;
    }

    .label {
      color: $grey-6;
      font-size: 14px;
      min-width: 30px;
      text-align: right;
    }

    .id {
      color: $grey-5;
      font-weight: bold;
      font-size: 14px;
    }

    .name {
      color: $primary;
      font-weight: bold;
      font-size: 16px;
    }
  }
}
</style>

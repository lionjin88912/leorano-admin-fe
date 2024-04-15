<template>
  <section class='column  q-mb-lg'>
    <section class='q-mb-lg'>
      <q-table table-header-class='text-blue-grey-9 bg-light-blue-1' :rows='data' :columns='langColumns' row-key='id'
        hidde-title flat bordered>
        <template v-slot:body-cell-is_published='props'>
          <q-td>
            <q-toggle v-model='props.row.is_published' checked-icon='check' color='green' unchecked-icon='clear'
              @click='() => changeStatus(props.row.id)' :disable='props.row.id == 0' />
          </q-td>

          <!--          <span v-else> - </span>-->
        </template>
      </q-table>
    </section>

  </section>
</template>

<script>

import { onMounted, ref, reactive } from 'vue'
import { langColumns } from './enums'
import { RequestUpdateLangStatus } from 'src/api'
export default {
  name: 'tabLang',
  props: {
    handleUpdate: Function,
    propsData: {
      is_virtuoso_hotel: false,
      email: '',
      web_site: '',
      country_id: 0,
      city_id: 0,
      lat: '',
      lng: '',
      phone: '',
      fax: '',
      langs: {},
      id: 0
    }
  },
  setup(props) {
    const ogData = reactive(props.propsData)
    const data = ref([])

    const options = ref([
      {
        name: '英文',
        val: 'en'
      },
      {
        name: '繁中',
        val: 'zh-TW'
      },
      {
        name: '簡中',
        val: 'zh-CN'
      },
    ])

    onMounted(() => {
      let op = options.value.map((v) => {
        const langs = ogData.langs
        const hasLang = v.val in langs

        return {
          id: hasLang ? langs[v.val].id : 0,
          name: v.name,
          updated_at: hasLang ? langs[v.val].updated_at : '-',
          is_published: hasLang ? langs[v.val].isPublished : '-'
        }
      })
      data.value = op

      // console.log(op)
    })


    return {
      langColumns,
      options,
      data


    }
  },
  methods: {
    changeStatus(langId) {
      if (langId != 0)
        RequestUpdateLangStatus(this.propsData.id, langId)
          .then(res => console.log(res))
    }
  }
}
</script>

<style scoped></style>

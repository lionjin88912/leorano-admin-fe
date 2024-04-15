<template>
  <section class='column  q-mb-lg'>
    <section class='q-mb-lg'>
      <span class='label'>平台禮遇</span>
      <q-table
        table-header-class='text-blue-grey-9 bg-light-blue-1'

        :columns='benefitColumns'
        row-key='id'
        hidde-title
        flat
        bordered
        no-data-label='待新增'

      >

      </q-table>
    </section>
    <section class='q-mb-lg'>
      <span class='label'>活動禮遇</span>
      <q-table
        table-header-class='text-blue-grey-9 bg-light-blue-1'

        :columns='benefitColumns'
        row-key='id'
        hidde-title
        flat
        bordered
        no-data-label='待新增'

      >

      </q-table>
    </section>

  </section>

</template>

<script>

import {benefitColumns} from './enums'
export default {
  name: 'tabBenefits',
  props : {
    raw : Object
  },
  setup() {

    return {
      benefitColumns


    }
  },
  methods: {

  }
}
</script>

<style scoped>



</style>

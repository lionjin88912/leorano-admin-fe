<template>
  <q-table :rows='rows' :columns='columns' class="no-border" separator="none" :loading='loading' row-key='id' hide-header
    flat bordered no-data-label='無資料' v-model:pagination='pagination' @request='handlePaging'>
    <template v-slot:body="tableProps">
      <slot name="body" :props="tableProps"></slot>
    </template>
  </q-table>
</template>

<script>
import { ref, onMounted, watch, defineExpose } from 'vue'
export default {
  name: 'tableComponent',
  props: {
    propRows: [],
    propsColumns: Array,
    handleCallApi: Function,
    propsFilter: Object
  },
  setup(props, context) {
    const filter = ref(props.propsFilter)
    const loading = ref(true)
    const rows = ref(props.propRows)
    const columns = ref(props.propsColumns)
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0, // 初始化 qrowsNumber
      perPageArray: [10, 20, 50],
    })


    onMounted(async () => {

      props.handleCallApi().then((res) => {
        loading.value = false
        rows.value = res.data
        pagination.value.rowsNumber = res.paging.total_rows

        return res
      })
    })

    const handlePaging = (data) => {
      loading.value = true
      const pg = data.pagination
      props.handleCallApi({
        limit: pg.rowsPerPage,
        page: pg.page,
      }).then((res) => {

        loading.value = false
        rows.value = res.data
        pagination.value.page = res.paging.page
        pagination.value.rowsPerPage = res.paging.limit
      })
    }

    const handleCreate = () => {
      loading.value = true
      props.handleCallApi({
        limit: pagination.value.rowsPerPage,
        page: 1,
        ...filter
      }).then(res => {

        rows.value = res.data
        pagination.value.page = res.paging.page
        pagination.value.rowsPerPage = res.paging.limit
      }).finally(() => { loading.value = false })
    }

    const handleUpdate = (res) => {

      const rowIndex = rows.value.findIndex((row) => row.id == res.id);

      if (rowIndex !== -1) {
        rows.value[rowIndex] = { ...rows.value[rowIndex], ...res };
      }
    }

    watch(props.propsFilter, (val) => {

      filter.value = val
      loading.value = true
      props.handleCallApi({
        limit: pagination.value.rowsPerPage,
        page: 1,
        ...filter.value
      }).then(res => {

        rows.value = res.data
        pagination.value.page = res.paging.page
        pagination.value.rowsPerPage = res.paging.limit
        pagination.value.rowsNumber = res.paging.total_rows
      }).finally(() => { loading.value = false })

    })

    const handleReload = () => {

      loading.value = true
      props.handleCallApi({
        limit: pagination.value.rowsPerPage,
        page: 1,
        ...filter
      }).then(res => {

        rows.value = res.data
        pagination.value.page = res.paging.page
        pagination.value.rowsPerPage = res.paging.limit
      }).finally(() => { loading.value = false })
    }

    context.expose({ handleReload, handleUpdate, handleCreate });

    return {
      handlePaging,
      pagination,
      columns,
      loading,
      rows,
    }
  }
}
</script>

<style scoped>
.no-border {
  border: none;
  box-shadow: none;
}
</style>

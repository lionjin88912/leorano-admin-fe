<template>
  <q-popup-proxy class="popup-dialog">
    <div class="popup-dialog-content">
      <div class="title">{{ props.dataName }} 原始資料</div>
      <ul>
        <li class="item" v-for="(data, index) of props.rawDatas" :key="index">
          {{ data }}
        </li>
      </ul>
      &nbsp;
    </div>
  </q-popup-proxy>
</template>
<script setup>
const props = defineProps({
  dataName: {
    type: String,
    default() {
      return null
    }
  },
  rawDatas: {
    type: Array,
    default() {
      return []
    }
  }
})
</script>
<style lang="scss" scoped>
.popup-dialog {
  &-content {
    max-width: 720px;
    max-height: 400px;
    margin: 24px;

    ul {
      list-style: disc;
    }

    .title {
      font-size: 16px;
      font-weight: bold;
      color: $primary;
    }

    .item {
      font-size: 14px;
      color: $grey-7;
      padding: 2px 0px;
    }
  }
}
</style>
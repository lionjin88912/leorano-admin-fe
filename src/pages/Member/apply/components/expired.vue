<template>
  <div class="column user-info">
    <div class="user-info-field">
      <div class="field-label">過期時間</div>
      <div class="field-text">{{ getDateString(propsData.expired_at, 'YYYY-MM-DD') }}</div>
    </div>
    <!-- <div class="user-info-field">
      <div class="field-label">審核時間</div>
      <div class="field-text">{{ getDateString(data.verified_at, 'YYYY-MM-DD HH:mm') }}</div>
    </div>
    <div class="user-info-field">
      <div class="field-label">審核人員</div>
      <div class="field-text">{{ data.admin?.username }}</div>
    </div> -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getDateString } from 'src/utils/helpers'
const props = defineProps({
  propsData: Object
})
const data = ref(props.propsData)
</script>

<style lang="scss" scoped>
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

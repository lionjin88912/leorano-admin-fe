<template>
  <div class="column user-info">
    <div class="user-info-field">
      <div class="field-label">過期時間</div>
      <div class="field-text">{{ helpers.getDateString(propsData.expired_at, 'YYYY-MM-DD') }}
      </div>
    </div>
    <div class="user-info-field">
      <div class="field-label">審核時間</div>
      <div class="field-text">{{ helpers.getDateString(propsData.verified_at, 'YYYY-MM-DD HH:mm') }}</div>
    </div>
    <div class="user-info-field">
      <div class="field-label">審核人員</div>
      <div class="field-text">{{ propsData.admin?.username }}</div>
    </div>
    <div class="user-info-field">
      <div class="field-label">駁回原因</div>
      <div class="field-text">{{ propsData.reject_reason }}</div>
    </div>
    <!-- <q-input type="textarea" placeholder="駁回原因" readonly borderless /> -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as helpers from 'src/utils/helpers';

const props = defineProps({
  propsData: Object,
})
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

<template>
  <div class="info">
    <div v-if="title" class="info-title flex items-center">
      <span>{{ title }}</span>
      <slot name="caption"></slot>
    </div>
    <div v-if="title" class="info-separator"></div>
    <div class="info-content">
      <slot name="default"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  title: String
})
</script>
<style lang="scss" >
.info {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 8px 0px;
  // max-width: 768px;

  &-title {
    color: $grey-10;
    font-weight: bold;
    margin-left: 8px;
    font-size: 16px;
  }

  &-separator {
    width: 100%;
    height: 2px;
    background-color: $grey-6;
    margin: 2px 0px 6px;
  }

  &-content {
    margin: 0px 16px;

    .info-field {
      display: flex;
      padding: 4px 0px;

      &-label {
        color: $grey-9;
        font-weight: 500;
        padding-right: 8px;
        width: 140px;
        text-align: right;
        white-space: nowrap;

        &.text-left {
          text-align: left;
        }

        &.auto-width {
          width: auto;
        }

        &.regular {
          font-weight: 400;
        }
      }

      &-text {
        color: $grey-7;
        word-wrap: break-word;
        word-break: break-all;

        .price {
          min-width: 70px;
          text-align: right;
        }
      }

      &-link {
        cursor: pointer;
        color: $primary;
        // width: 140px;
        text-align: right;
        padding-right: 6px;
      }

      &-list {
        list-style: disc;
        padding-left: 16px;
      }
    }
  }

}
</style>

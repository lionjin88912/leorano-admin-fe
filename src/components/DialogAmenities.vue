<template>
  <q-dialog v-model="isShow" @hide="onDialogHide">
    <q-card class="q-pa-sm" style="width: min(420px, 80vw); min-height: 350px">
      <q-card-section class="row justify-between">
        <span class="text-h6">所有設施</span>
        <q-btn rounded dense icon="close" flat color="primary" v-close-popup />
      </q-card-section>

      <div class="row">
        <q-list class="col" padding>
          <q-item-label header>現有</q-item-label>

          <q-item v-for="(item, idx) in dataList" :key="`tp-${idx}`">
            <q-item-section>
              <q-item-label> <span class="text-grey-10"> ◼ </span> {{ item }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator vertical inset />
        </q-list>
        <q-separator spaced vertical />

        <q-list class="col" padding>
          <q-item-label header>Travelport</q-item-label>

          <q-item v-for="(tpItem, tpIdx) in tpList" :key="`tp-${tpIdx}`">
            <q-item-section>
              <q-item-label> <span class="text-grey-10"> ◼ </span> {{ tpItem }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'

export default {
  name: 'DialogAmenities',
  props: {
    modelValue: {
      type: Boolean,
      require: true,
    },
    tpList: {
      type: Array,
      require: true,
    },
    dataList: {
      type: Array,
      require: true,
    },
  },
  emits: [...useDialogPluginComponent.emits, 'update:modelValue'],
  setup(props, { emit }) {
    const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()
    function onOKClick() {
      // on OK, it is REQUIRED to
      // call onDialogOK (with optional payload)
      onDialogOK()
      // or with payload: onDialogOK({ ... })
      // ...and it will also hide the dialog automatically
    }
    const isShow = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val),
    })
    return {
      isShow,
      dialogRef,
      onOKClick,
      onDialogHide,
    }
  },
}
</script>

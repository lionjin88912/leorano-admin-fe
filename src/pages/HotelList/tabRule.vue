<template>
  <q-form @submit='handleSubmit'>
    <section class='row  q-mb-lg'>
      <div class='q-gutter-sm row'>

        <div>
          <span class='label'>選擇入住時間</span>
          <q-input filled v-model='start' mask='time' :rules="['time']">
            <template v-slot:append>
              <q-icon name='access_time' class='cursor-pointer'>
                <q-popup-proxy cover transition-show='scale' transition-hide='scale'>
                  <q-time v-model='start' format24h>
                    <div class='row items-center justify-end'>
                      <q-btn v-close-popup label='Ok' color='primary' flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div>
          <span class='label'>選擇退房時間</span>
          <q-input filled v-model='end' mask='time' :rules="['time']">
            <template v-slot:append>
              <q-icon name='access_time' class='cursor-pointer'>
                <q-popup-proxy cover transition-show='scale' transition-hide='scale'>
                  <q-time v-model='end' format24h>
                    <div class='row items-center justify-end'>
                      <q-btn v-close-popup label='Ok' color='primary' flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

    </section>
    <section class='row  q-mb-lg q-pl-md q-pb-lg'>
      <div style='width:90%;'>

        <q-range v-model='age' style='min-width: 100%;margin : 0 20px 0 0' :min='0' :max='20' markers marker-labels
          switch-marker-labels-side label-always switch-label-side :left-label-value='"嬰兒年齡 " + age.min + " 歲以下"'
          :right-label-value='"兒童年齡 :" + age.max + " 歲以下"' track-color='purple' color='purple' />

      </div>
    </section>
    <section class='q-mt-lg'>
      <q-btn label='儲存' type='submit' color='primary' />
    </section>
  </q-form>
</template>

<script>

import { ref, watch } from 'vue'
export default {
  name: 'tabRule',
  props: {
    propsData: Object
  },
  setup(props, { emit }) {
    const data = ref(props.propsData)
    const age = ref({ min: data.value.babe_age, max: data.value.child_age })
    const start = ref(props.propsData.check_in_time)
    const end = ref(props.propsData.check_out_time)

    const handleSubmit = () => {

      emit('handleUpdate', {
        key: 'rule', hotel: {
          check_in_time: start.value,
          check_out_time: end.value,
          child_age: `${age.value.max}`,
          babe_age: `${age.value.min}`

        }
      })
    }
    watch(() => age.value.min, newVal => {
      age.value.min = newVal
    })
    watch(() => age.value.max, newVal => {
      age.value.max = newVal
    })
    return {
      handleSubmit,
      data,
      age,
      start,
      end,

    }
  },
  methods: {

  }
}
</script>check_in_time

<style scoped></style>

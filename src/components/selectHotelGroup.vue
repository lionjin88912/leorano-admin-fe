<template>
  <q-select
    outlined
    dense
    clearable
    use-input
    use-chips
    emit-value
    :multiple='isMultiple'
    input-debounce='0'
    label='選擇酒店集團'
    v-model='model'
    :options='group_options'
    map-options
    option-value='id'
    option-label='name'
    @filter='filterFn'
    @update:modelValue='handleSelection'
  />
</template>

<script>
import { ref, watch,nextTick } from 'vue'
import { RequestGroupByName } from 'src/api'
export default {
  name: 'selectHotelGroup',
  props: {
    handleCallBack : Function,
    multiple : Boolean,
    default: {
      type : Object,
      validator: function (value) {
        // 驗證 value 是否包含指定的鍵和相應的類型
        return (
          value.hasOwnProperty('id') &&
          typeof value.key1 === 'number' &&
          value.hasOwnProperty('name') &&
          typeof value.key2 === 'string'
        );
      },
    }
  },
  setup(props,{emit}) {
    const model = ref(null)

    const group_options = ref([])
    const isMultiple = ref(props.multiple)
    const filterFn = (val, update) => {
      if (val === '') {
        update(() => {
          group_options.value = [];
        });
      } else {

        update(
          getRequest(val).then((res) => {
            if (res.code != 0) return;

            let newArr = res.data.map( (item) => {

              return {
                id : item.id,
                name : item.name,

              }
            });
            nextTick(() => {
              group_options.value = newArr;
            });
            return  newArr
          })
        )
      }
    }
    const getRequest = (val) => {
      return  RequestGroupByName({
        name: val,
        limit : 5000,
      })
    }

    const handleSelection = (values) => {

      emit('handleCallBack',values)
    }


    watch(() => props.default, (newValue) => {
        if( newValue.id != '' && newValue.name != '')
        model.value = newValue
    });

    return {
      handleSelection,
      filterFn,
      isMultiple,
      model,
      group_options
    }
  },
  methods : {


  }
}
</script>

<style scoped>

</style>

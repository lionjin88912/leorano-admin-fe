<template>
  <q-dialog v-model="isShow" persistent>
    <q-card class="container">
      <q-form @submit="onSubmit">
        <q-card-section class="row items-center q-pr-none">
          <div class="title">{{ title }}</div>
          <q-btn icon="close" v-close-popup rounded flat dense @click="$emit('cancel')"></q-btn>
        </q-card-section>
        <q-card-section>
          <div class="message q-py-sm">{{ message }}</div>
          <div>
            <q-input :rules="rules.textArea" :label="inputHint" :type="inputType" :rows="5" :max-rows="10"
              v-model="textArea" :outlined="outlined" hide-hint hide-bottom-space autofocus lazy-rules />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" label="取消" v-close-popup flat @click="$emit('cancel')" />
          <q-btn color="negative" label="確認" v-close-popup @click="$emit('confirm', data)" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script>
import { ref, reactive, toRefs, computed } from "vue";
import { messages, isEmpty } from "src/utils/validators";

export default {
  emit: ["confirm"],
  setup(props, context) {
    const isShow = ref(false);
    const state = reactive({
      data: {},
      title: null,
      message: "",
      textArea: "",
      inputHint: "",
      multiple: true, // 多行輸入
    });

    const rules = computed(() => {
      return {
        textArea: [
          val => !isEmpty(val) || messages.requiredInput,
        ]
      };
    });

    const inputType = computed(() => {
      return state.multiple ? "textarea" : "text";
    })

    const outlined = computed(() => {
      return state.multiple ? true : false;
    });

    const show = ({ title, message, inputHint, multiple = true, data = {} }) => {
      isShow.value = true;
      state.title = title;
      state.message = message;
      state.data = data;
      // 寫入輸入框的預設值
      state.textArea = data.name;
      state.inputHint = inputHint;
      state.multiple = multiple;
    };

    const onSubmit = async () => {
      isShow.value = false;
      context.emit("confirm", {
        type: 'delete',
        data: state.data
      });
    };

    context.expose({ show });

    return {
      isShow,
      ...toRefs(state),
      rules,
      inputType,
      outlined,
      show,
      onSubmit,
    };
  },
};
</script>
<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 350px;

  .title {
    font-size: 18px;
    font-weight: 500;
  }

  .message {
    font-size: 16px;
  }
}
</style>

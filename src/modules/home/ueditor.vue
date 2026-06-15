<template>
  <div >
    <VueUeditorWrap v-model="content"
      editor-id="editor"
      :config="editorConfig"
      :editorDependencies="['ueditor.config.js','ueditor.all.js']"
    />

  </div>
</template>

<script setup>
import {ref, watchEffect, computed, onMounted} from 'vue';
import {VueUeditorWrap} from 'vue-ueditor-wrap';
import * as api from '@/core/script/api.js';


const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const content = ref(props.content);

const emit = defineEmits(['updateContent']);

const fn = {
};

watchEffect((onInvalid) => {
  emit('updateContent', content.value)
})

watchEffect(() => {
  content.value = props.content;
})

const viewportHeight = ref(window.innerHeight || document.documentElement.clientHeight)
const editorConfig = {
  // 后端服务地址，后端处理参考
  // https://open.modstart.com/ueditor-plus/backend.html

  initialFrameHeight:  viewportHeight.value - 593,
  initialFrameWidth: '100%',
  serverUrl: api.url2.home.academy.handle, // '/api/path/to/server', //
  loadConfigFromServer: true,
  autoHeightEnabled: false,
  serverResponsePrepare: function (res) {
    // console.log('serverResponsePrepare', res.data);
    return res.data;
  },
  serverHeaders: api.getHttpDefaultHeaders(),
  UEDITOR_HOME_URL: '/static/UEditorPlus/',
  UEDITOR_CORS_URL: '/static/UEditorPlus/',
  // 上传
  uploadServiceEnable: false,
}




</script>
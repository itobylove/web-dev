<template>
  <div class="content">
    <div class="body">
      <t-tabs v-model="tabsDom" v-bind="tabsConfig">
        <keep-alive>
          <t-tab-panel v-for="(tab, index) in tabsList" :value="tab.name" :destroyOnHide="tab.destroyOnHide || false" :label="tab.label" >
            <div class="table">
              <component  v-if="tabPanel[index].hasComponent || false" :is="tabPanel[index].component" :table="tabPanel[index].table"></component>
              <div v-else v-html="tabPanel[index].content "></div>
            </div>
          </t-tab-panel>
        </keep-alive>
      </t-tabs>
    </div>
  </div>
</template>
<script setup>
import { watchEffect, ref} from 'vue';
const props = defineProps({
  tabsList: {
    type: Array,
    default: () => []
  },
  tabPanel: {
    type: Array,
    default: () => []
  }
});
//  标签
const tabsDom = ref(props.tabsList[0]?.name || '');
const tabsConfig = {
  theme: 'card',
  swipeable: false,//禁止滑动 移动端的配置项
  onChange(newValue) {
    tabsDom.value = newValue
  }
};

//默认设置为第一个tabs展示
watchEffect(() => {
  if (props.tabsList?.length > 0 && !tabsDom.value) {
    tabsDom.value = props.tabsList[0].name;
  }
});
</script>
<style scoped>
.content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  > .body {
    overflow: hidden;
    flex: 1;
    flex-shrink: 0;

    > .t-tabs > .t-tabs__content > div .table {
      width: 100%;
      height: 100%;
      position: relative;

      > div {
        width: 100%;
        height: 100%;
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        font-weight: bold;
      }
    }
  }
}
</style>
<template>
  <div class="tree-mind">
    <div v-for="node in data" :key="node.id">
      <Node :node="node"></Node>
    </div>
    <div v-if="data.length===0">empty list</div>
  </div>
</template>

<script>
import Node from './node.vue';

export default {
  name: 'TreeMind',
  components: {Node},
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  }
};
</script>

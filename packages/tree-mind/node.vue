<template>
  <div v-show="expanded">{{ node.label }}</div>
</template>

<script>
export default {
  name: 'Node',
  props: {
    node: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      expanded: true
    };
  }
};
</script>

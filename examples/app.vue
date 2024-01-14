<template>
  <div class="demo" id="app">
    <TreeMind :data="tree" :props="props">
      <span slot-scope="{ node, data }">
        <label class="name">{{ node.label }}</label>
        <button style="top:17px;" class="remove" @click="append(data)">+</button>
        <button class="remove" @click="removeNode(node, data)">x</button>
      </span>
    </TreeMind>
  </div>
</template>

<script>
import {tree} from './tree';
let id = 1000;
export default {
  data() {
    return {
      tree,
      props: {
        children: 'children',
        label: 'name',
        disabled: 'disabled'
      }
    };
  },
  methods: {
    append(data) {
      const newChild = { id: id++, name: 'testtest' + id, children: [] };
      if (!data.children) {
        data.children = [];
      }
      data.children.push(newChild);
      this.tree = [...this.tree];
    },
    removeNode(node, data) {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex((d) => d.id === data.id);
      children.splice(index, 1);
      this.tree = [...this.tree];
    },
    push() {
      this.tree.push({
        name: '能力域' + ++id
      });
    },
    zoomChange(zoom) {
      this.$refs.tree.setZoom(zoom);
    }
  }
};
</script>

<style lang="scss" scoped>
.demo {

  .name {
    display: inline-block;
     width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .remove {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 16px;
    height: 16px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    border: 1px solid #ccc;
    color: #fff;
    border-radius: 50%;
    line-height: 14px;
    padding: 0;
  }
}
</style>
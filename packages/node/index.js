import Node from '../tree-mind/node.vue';

Node.install = function(Vue) {
  Vue.component(Node.name, Node);
};

export default Node;

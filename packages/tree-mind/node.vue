<template>
  <div class="vp-node">
    <div :id="node.id" class="vp-node-content" :class="'level' + node.level"
      :style="{ width: width + 'px', height: height + 'px', borderColor: color.border, boxShadow: color.boxShadow, color: color.label }" @click.stop="expandNode">
      <node-content :node="node" :render-content="renderContent" />
    </div>
    <div v-show="expanded">
      <Node v-for="n in node.childNodes" :key="n.id" :node="n" @node-expand="handleChildNodeExpand" />
    </div>
  </div>
</template>
<script>
// import { useNodeExpandEventBroadcast } from './model/useNodeExpandEventBroadcast';

export default {
  name: 'Node',
  props: {
    node: {
      type: Object,
      required: true
    },
    width: {
      type: Number,
      default: 200
    },
    height: {
      type: Number,
      default: 30
    },
    accordion: Boolean,
    renderContent: Function
  },
  components: {
    NodeContent: {
      props: {
        node: {
          required: true
        }
      },
      render(h) {
        const parent = this.$parent;
        const tree = parent.tree;
        const node = this.node;
        const { data, store } = node;
        return (
          parent.renderContent
            ? parent.renderContent.call(parent._renderProxy, h, { _self: tree.$vnode.context, node, data, store })
            : tree.$scopedSlots.default
              ? tree.$scopedSlots.default({ node, data })
              : <span class="vp-name">{ node.label }</span>
        );
      }
    }
  },
  data() {
    return {
      visible: false,
      expanded: false,
      label: null,
      tree: null
    };
  },
  computed: {
    color() {
      return this.tree.colors[this.node.level - 1];
    }
  },
  watch: {
    'node.expanded'(val) {
      this.expanded = val;
      this.$nextTick(() => {
        this.tree.draw();
      });
      // if (val) {
      //   childNodeRendered.value = true
      // }
    }
  },
  methods: {
    mouseenter() {
      const el = document.createElement('div');
      el.innerText = this.node.label;
      el.style.position = 'fixed';
      el.style.visibility = 'hidden';
      el.style.zIndex = '-1';
      document.body.append(el);
      if (el.clientWidth > this.width) {
        this.visible = true;
      }
      el.remove();
    },
    expandNode() {
      if (this.node.isLeaf) return;
      if (this.expanded) {
        this.tree && this.tree.$emit('node-collapse', this.node.data, this.node, this);
        this.node.collapse();
      } else {
        this.node.expand();
        this.$emit('node-expand', this.node.data, this.node, this);
      }
    },
    handleChildNodeExpand(nodeData, node, instance) {
      // broadcastExpanded(node);
      this.tree && this.tree.$emit('node-expand', nodeData, node, instance);
    }
  },
  created() {
    const parent = this.$parent;

    if (parent.isTree) {
      this.tree = parent;
    } else {
      this.tree = parent.tree;
    }
    const tree = this.tree;
    if (!tree) {
      console.warn('Can not find node\'s tree.');
    }

    const props = tree.props || {};
    const childrenKey = props['children'] || 'children';

    this.$watch(`node.data.${childrenKey}`, () => {
      this.node.updateChildren();
    });

    if (this.node.expanded) {
      this.expanded = true;
    }
  }
};

</script>

<template>
  <div class="vp-tree-mind" :class="{ 'vp-move': isMouseDown }" @mousedown="mousedown">
    <canvas ref="canvas" class="vp-canvas" :style="{ zoom: zoom }"></canvas>
    <div v-if="root" ref="nodeBox" :style="nodeStyle">
      <Node v-for="node in root.childNodes" :key="node.id" :accordion="accordion" :node="node"
        :render-content="renderContent" />
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import TreeStore from './model/store';
import Node from './node.vue';

const nodeProp = {
  width: 200,
  height: 30,
  power: 30
};
const treeProp = {
  width: 900,
  height: 600,
  top: 0,
  left: 0,
  offsetTop: 20,
  offsetLeft: 30
};

let startX = 0;
let startY = 0;
let scrollTop = 0;
let scrollLeft = 0;
let ctx = null;
export default {
  name: 'TreeMind',
  components: {Node},
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    props: {
      type: Object,
      default: () => ({
        children: 'children',
        label: 'label',
        disabled: 'disabled'
      })
    },
    colors: {
      type: Array,
      default() {
        return [{
          border: '#3A70E3',
          label: '#6BB0FF',
          boxShadow: 'inset 0px 0px 20px 0px rgba(17, 40, 255, 0.66)'
        }, {
          border: '#02A9A5',
          label: '#2FF8E1',
          boxShadow: 'inset 0px 0px 20px 0px rgba(15, 198, 194, 0.6)'
        }, {
          border: '#B45800',
          label: '#F8AB3D',
          boxShadow: 'inset 0px 0px 20px 0px rgba(255, 161, 0, 0.5)'
        }];
      }
    },
    nodeKey: String,
    defaultExpandAll: {
      type: Boolean,
      default: true
    },
    accordion: Boolean,
    renderContent: Function
  },
  computed: {
    nodeStyle() {
      return {
        position: 'absolute',
        zoom: this.zoom,
        top: treeProp.offsetTop + 'px',
        left: treeProp.offsetLeft + 'px'
      };
    }
  },
  data() {
    return {
      zoom: 1,
      canvas: undefined,
      // nodeBox: undefined,
      store: null,
      root: null,
      currentNode: null,
      isMouseDown: false
    };
  },
  created() {
    this.isTree = true;

    this.store = new TreeStore({
      key: this.nodeKey,
      data: this.data,
      props: this.props,
      // currentNodeKey: currentNodeKey,
      // defaultExpandedKeys: defaultExpandedKeys,
      defaultExpandAll: this.defaultExpandAll
    });
    this.store.initialize();
    this.root = this.store.root;
    // const instance = getCurrentInstance();
  },
  mounted() {
    ctx = this.$refs.canvas.getContext('2d');
    this.initEvent();

    this.$nextTick(function() {
      this.$el.style.width = treeProp.width + 'px';
      this.$el.style.height = treeProp.height + 'px';
      this.root && this.draw();
    });
  },
  watch: {
    data: {
      deep: true,
      handler(newValue) {
        this.store.setData(newValue);
        this.$nextTick(function() {
          this.draw();
        });
      }
    }
  },
  methods: {
    draw() {
    // 计算父容器偏移量
      const treeRect = this.$el.getBoundingClientRect();
      treeProp.top = treeRect.top;
      treeProp.left = treeRect.left;

      // 设置画布大小
      this.$refs.canvas.height = Math.max(this.$refs.nodeBox.clientHeight + treeProp.offsetTop, treeProp.height);
      this.$refs.canvas.width = Math.max(this.$refs.nodeBox.clientWidth + treeProp.offsetLeft, treeProp.width);
      // 绘制前清空画布
      ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      ctx.beginPath();

      _.each(this.root.childNodes, (node) => {
        this.drawNode(node);
      });
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    },
    drawNode(node) {
      if (node.childNodes && node.childNodes.length > 0 && node.expanded) {
        const pEl = document.getElementById(node.id);
        const pRect = pEl.getBoundingClientRect();

        const { top, left } = treeProp;
        const { width, height } = nodeProp;

        _.each(node.childNodes, (n) => {
          const el = document.getElementById(n.id);
          const rect = el.getBoundingClientRect();
          const scrollLeft = this.$el.scrollLeft;
          const scrollTop = this.$el.scrollTop;

          const x1 = (pRect.x - left) + width + (left - left / this.zoom) + scrollLeft / this.zoom;
          const y1 = pRect.y + height / 2 - top + (top - top / this.zoom) + scrollTop / this.zoom;

          const x2 = (rect.x - left) + (left - left / this.zoom) + scrollLeft / this.zoom;
          const y2 = (rect.y - top) + height / 2 + (top - top / this.zoom) + scrollTop / this.zoom;

          this.bezierCurve(Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2));
          this.drawNode(n);
        });
      }
    },
    bezierCurve(startX, startY, endX, endY) {
      const { height, power } = nodeProp;
      ctx.moveTo(startX, startY);
      if (endY > startY) {
        ctx.bezierCurveTo(startX + power, startY + height / 2, endX - power, endY - height / 2, endX, endY);
      } else if (endY < startY) {
        ctx.bezierCurveTo(startX + power, startY - height / 2, endX - power, endY + height / 2, endX, endY);
      } else if (endY === startY) {
        ctx.lineTo(endX, endY);
      }
    },
    initEvent() {
      document.addEventListener('mouseup', this.mouseup);
      document.addEventListener('mousemove', this.mousemove);
    },
    mousedown(event) {
      this.isMouseDown = true;
      startX = event.pageX;
      startY = event.pageY;
      scrollTop = this.$el.scrollTop;
      scrollLeft = this.$el.scrollLeft;
    },
    mouseup() {
      this.isMouseDown = false;
    },
    mousemove(event) {
      if (this.isMouseDown) {
        const tree = this.$el;
        const maxTop = tree.scrollHeight - tree.clientHeight;
        const maxLeft = tree.scrollWidth - tree.clientWidth;
        const top = scrollTop + (startY - event.pageY);
        const left = scrollLeft + (startX - event.pageX);
        tree.scrollTop = Math.min(Math.max(top, 0), maxTop);
        tree.scrollLeft = Math.min(Math.max(left, 0), maxLeft);
      }
    },
    setZoom(zom) {
      this.zoom = zom;
    }
  },
  destroyed() {
    document.removeEventListener('mouseup', this.mouseup);
    document.removeEventListener('mousemove', this.mousemove);
  }
};
</script>

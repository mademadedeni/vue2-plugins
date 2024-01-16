import TreeNode from './node';

export default class store {
  constructor(options) {
    this.defaultExpandAll = true;
    this.root = null;
    this.key = '';
    this.props = null;
    this.currentNode = null;

    for (const option in options) {
      if (options.hasOwnProperty(option)) {
        this[option] = options[option];
      }
    }

    this.nodesMap = {};
  }

  initialize() {
    this.root = new TreeNode({
      data: this.data,
      store: this
    });
    this.root.initialize();

    // if (this.lazy && this.load) {
    //   const loadFn = this.load
    //   loadFn(this.root, (data) => {
    //     this.root.doCreateChildren(data)
    //     this._initDefaultCheckedNodes()
    //   })
    // } else {
    //   this._initDefaultCheckedNodes()
    // }
  }

  registerNode(node) {
    const key = this.key;
    if (!node || !node.data) return;

    if (!key) {
      this.nodesMap[node.id] = node;
    } else {
      const nodeKey = node.key;
      if (nodeKey !== undefined) this.nodesMap[node.key] = node;
    }
  }

  deregisterNode(node) {
    const key = this.key;
    if (!key || !node || !node.data) return;

    node.childNodes.forEach((child) => {
      this.deregisterNode(child);
    });

    delete this.nodesMap[node.key];
  }

  setData(newVal) {
    const instanceChanged = newVal !== this.root.data;
    if (instanceChanged) {
      this.root.setData(newVal);
    } else {
      this.root.updateChildren();
    }
  }
}

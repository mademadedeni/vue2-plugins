import { NODE_KEY, markNodeData } from './util';

function getPropertyFromData(node, prop) {
  const props = node.store.props;
  const data = node.data || {};
  const config = props[prop];

  if (typeof config === 'function') {
    return config(data, node);
  } else if (typeof config === 'string') {
    return data[config];
  } else if (typeof config === 'undefined') {
    const dataProp = data[prop];
    return dataProp === undefined ? '' : dataProp;
  }
};
let nodeIdSeed = 0;
class TreeNode {
  constructor(options) {
    this.id = String(nodeIdSeed++);
    this.data = null;
    this.expanded = true;
    this.parent = null;
    this.canFocus = true;
    this.store = null;
    this.isLeaf = false;

    for (const name in options) {
      if (options.hasOwnProperty(name)) {
        this[name] = options[name];
      }
    }

    // internal
    this.level = 0;
    this.childNodes = [];

    if (this.parent) {
      this.level = this.parent.level + 1;
    }
  }

  get label() {
    return getPropertyFromData(this, 'label');
  }

  get key() {
    const nodeKey = this.store.key;
    if (this.data) return this.data[nodeKey];
    return null;
  }

  get disabled() {
    return getPropertyFromData(this, 'disabled');
  }

  initialize() {
    const store = this.store;
    if (!store) {
      throw new Error('[TreeNode]store is required!');
    }
    store.registerNode(this);
    this.setData(this.data);

    if (!Array.isArray(this.data)) {
      markNodeData(this, this.data);
    }

    this.expanded = this.store.defaultExpandAll;
    // this.isLeaf = !this.childNodes || this.childNodes.length === 0;
  }

  setData(data) {
    if (!Array.isArray(data)) {
      markNodeData(this, data);
    }

    this.data = data;
    this.childNodes = [];

    let children;
    if (this.level === 0 && Array.isArray(this.data)) {
      children = this.data;
    } else {
      children = getPropertyFromData(this, 'children') || [];
    }

    for (let i = 0, j = children.length; i < j; i++) {
      this.insertChild({ data: children[i] });
    }
  }

  insertChild(child, index) {
    if (!child) throw new Error('InsertChild error: child is required.');

    if (!(child instanceof TreeNode)) {
      Object.assign(child, {
        parent: this,
        store: this.store
      });
      child = new TreeNode(child);
      if (child instanceof TreeNode) {
        child.initialize();
      }
    }

    child.level = this.level + 1;

    if (typeof index === 'undefined' || index < 0) {
      this.childNodes.push(child);
    } else {
      this.childNodes.splice(index, 0, child);
    }

    this.updateLeafState();
  }

  updateLeafState() {
    const childNodes = this.childNodes;
    this.isLeaf = !childNodes || childNodes.length === 0;
  }

  getChildren(forceInit = false) {
    // this is data
    if (this.level === 0) return this.data;
    const data = this.data;
    if (!data) return null;

    const props = this.store.props;
    let children = 'children';
    if (props) {
      children = props.children || 'children';
    }

    if (data[children] === undefined) {
      data[children] = null;
    }

    if (forceInit && !data[children]) {
      data[children] = [];
    }

    return data[children];
  }

  updateChildren() {
    const newData = this.getChildren() || [];
    const oldData = this.childNodes.map((node) => node.data);

    const newDataMap = {};
    const newNodes = [];

    newData.forEach((item, index) => {
      const key = item[NODE_KEY];
      const isNodeExists =
        !!key && oldData.findIndex((data) => data[NODE_KEY] === key) >= 0;
      if (isNodeExists) {
        newDataMap[key] = { index, data: item };
      } else {
        newNodes.push({ index, data: item });
      }
    });

    if (!this.store.lazy) {
      oldData.forEach((item) => {
        if (!newDataMap[item[NODE_KEY]]) this.removeChildByData(item);
      });
    }

    newNodes.forEach(({ index, data }) => {
      this.insertChild({ data }, index);
    });

    this.updateLeafState();
  }

  removeChild(child) {
    const children = this.getChildren() || [];
    const dataIndex = children.indexOf(child.data);
    if (dataIndex > -1) {
      children.splice(dataIndex, 1);
    }

    const index = this.childNodes.indexOf(child);

    if (index > -1) {
      this.store && this.store.deregisterNode(child);
      child.parent = null;
      this.childNodes.splice(index, 1);
    }

    this.updateLeafState();
  }

  removeChildByData(data) {
    let targetNode = null;

    for (let i = 0; i < this.childNodes.length; i++) {
      if (this.childNodes[i].data === data) {
        targetNode = this.childNodes[i];
        break;
      }
    }

    if (targetNode) {
      this.removeChild(targetNode);
    }
  }

  expand(callback, expandParent) {
    if (expandParent) {
      let parent = this.parent;
      while (parent.level > 0) {
        parent.expanded = true;
        parent = parent.parent;
      }
    }
    this.expanded = true;
    if (callback) callback();
    this.childNodes.forEach((item) => {
      item.canFocus = true;
    });
  }

  collapse() {
    this.expanded = false;
    this.childNodes.forEach((item) => {
      item.canFocus = false;
    });
  }
}

export default TreeNode;

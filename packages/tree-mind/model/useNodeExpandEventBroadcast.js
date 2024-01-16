export function useNodeExpandEventBroadcast(props) {
  const parentNodeMap = null;
  const currentNodeMap = {
    treeNodeExpand: (node) => {
      if (props.node !== node) {
        props.node.collapse();
      }
    },
    children: []
  };

  if (parentNodeMap) {
    parentNodeMap.children.push(currentNodeMap);
  }

  // provide('TreeNodeMap', currentNodeMap);

  return {
    broadcastExpanded: (node) => {
      if (!props.accordion) return;
      for (const childNode of currentNodeMap.children) {
        childNode.treeNodeExpand(node);
      }
    }
  };
}

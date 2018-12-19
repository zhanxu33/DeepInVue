function patch(oldVnode: VNode | Element, vnode: VNode): VNode {
  let i: number, elm: Node, parent: Node;
  const insertedVnodeQueue: VNodeQueue = [];
  // 调用module中的pre hook
  for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();

  // 如果传入的是Element 转成空的vnode
  if (!isVnode(oldVnode)) {
    oldVnode = emptyNodeAt(oldVnode);
  }

  // sameVnode时(sel和key相同) 调用patchVnode
  if (sameVnode(oldVnode, vnode)) {
    patchVnode(oldVnode, vnode, insertedVnodeQueue);
  } else {
    elm = oldVnode.elm as Node;
    parent = api.parentNode(elm);

    // 创建新的dom节点 vnode.elm
    createElm(vnode, insertedVnodeQueue);

    if (parent !== null) {
      // 插入dom
      api.insertBefore(parent, vnode.elm as Node, api.nextSibling(elm));
      // 移除旧dom
      removeVnodes(parent, [oldVnode], 0, 0);
    }
  }

  // 调用元素上的insert hook，注意insert hook在module上不支持
  for (i = 0; i < insertedVnodeQueue.length; ++i) {
    (((insertedVnodeQueue[i].data as VNodeData).hook as Hooks).insert as any)(insertedVnodeQueue[i]);
  }

  // 调用module post hook
  for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
  return vnode;
}

function emptyNodeAt(elm: Element) {
  const id = elm.id ? '#' + elm.id : '';
  const c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
  return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
}

// key和selector相同
function sameVnode(vnode1: VNode, vnode2: VNode): boolean {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}
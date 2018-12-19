function patchVnode(oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {
  let i: any, hook: any;
  // 调用 prepatch hook
  if (isDef((i = vnode.data)) && isDef((hook = i.hook)) && isDef((i = hook.prepatch))) {
    i(oldVnode, vnode);
  }
  const elm = (vnode.elm = oldVnode.elm as Node);
  let oldCh = oldVnode.children;
  let ch = vnode.children;
  if (oldVnode === vnode) return;
  if (vnode.data !== undefined) {
    // 调用module上的 update hook
    for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
    i = vnode.data.hook;
    // 调用vnode上的update hook
    if (isDef(i) && isDef((i = i.update))) i(oldVnode, vnode);
  }
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      // 新旧节点均存在children，且不一样时，对children进行diff
      // thunk中会做相关优化和这个相关
      if (oldCh !== ch) updateChildren(elm, oldCh as Array<VNode>, ch as Array<VNode>, insertedVnodeQueue);
    } else if (isDef(ch)) {
      // 旧节点不存在children 新节点有children
      // 旧节点存在text 置空
      if (isDef(oldVnode.text)) api.setTextContent(elm, '');
      // 加入新的vnode
      addVnodes(elm, null, ch as Array<VNode>, 0, (ch as Array<VNode>).length - 1, insertedVnodeQueue);
    } else if (isDef(oldCh)) {
      // 新节点不存在children 旧节点存在children 移除旧节点的children
      removeVnodes(elm, oldCh as Array<VNode>, 0, (oldCh as Array<VNode>).length - 1);
    } else if (isDef(oldVnode.text)) {
      // 旧节点存在text 置空
      api.setTextContent(elm, '');
    }
  } else if (oldVnode.text !== vnode.text) {
    // 更新text
    api.setTextContent(elm, vnode.text as string);
  }
  // 调用 postpatch hook
  if (isDef(hook) && isDef((i = hook.postpatch))) {
    i(oldVnode, vnode);
  }
}
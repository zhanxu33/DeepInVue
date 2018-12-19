function addVnodes(parentElm: Node, before: Node | null, vnodes: Array<VNode>, startIdx: number, endIdx: number, insertedVnodeQueue: VNodeQueue) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx];
    if (ch != null) {
      api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
    }
  }
}

function removeVnodes(parentElm: Node, vnodes: Array<VNode>, startIdx: number, endIdx: number): void {
  for (; startIdx <= endIdx; ++startIdx) {
    let i: any, listeners: number, rm: () => void, ch = vnodes[startIdx];
    if (ch != null) {
      if (isDef(ch.sel)) {
        // 调用destory hook
        invokeDestroyHook(ch);
        // 计算需要调用removecallback的次数 只有全部调用了才会移除dom
        listeners = cbs.remove.length + 1;
        rm = createRmCb(ch.elm as Node, listeners);
        // 调用module中是remove hook
        for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
        // 调用vnode的remove hook
        if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
          i(ch, rm);
        } else {
          rm();
        }
      } else { // Text node
        api.removeChild(parentElm, ch.elm as Node);
      }
    }
  }
}

// 调用destory hook
// 如果存在children 递归调用
function invokeDestroyHook(vnode: VNode) {
  let i: any, j: number, data = vnode.data;
  if (data !== undefined) {
    if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
    for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
    if (vnode.children !== undefined) {
      for (j = 0; j < vnode.children.length; ++j) {
        i = vnode.children[j];
        if (i != null && typeof i !== "string") {
          invokeDestroyHook(i);
        }
      }
    }
  }
}

// 只有当所有的remove hook都调用了remove callback才会移除dom
function createRmCb(childElm: Node, listeners: number) {
  return function rmCb() {
    if (--listeners === 0) {
      const parent = api.parentNode(childElm);
      api.removeChild(parent, childElm);
    }
  };
}
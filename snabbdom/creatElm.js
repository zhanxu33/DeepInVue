// 创建真正的dom节点
function createElm(vnode: VNode, insertedVnodeQueue: VNodeQueue): Node {
  let i: any, data = vnode.data;

  // 调用元素的init hook
  if (data !== undefined) {
    if (isDef(i = data.hook) && isDef(i = i.init)) {
      i(vnode);
      data = vnode.data;
    }
  }
  let children = vnode.children, sel = vnode.sel;
  // 注释节点
  if (sel === '!') {
    if (isUndef(vnode.text)) {
      vnode.text = '';
    }
    // 创建注释节点
    vnode.elm = api.createComment(vnode.text as string);
  } else if (sel !== undefined) {
    // Parse selector
    const hashIdx = sel.indexOf('#');
    const dotIdx = sel.indexOf('.', hashIdx);
    const hash = hashIdx > 0 ? hashIdx : sel.length;
    const dot = dotIdx > 0 ? dotIdx : sel.length;
    const tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
    const elm = vnode.elm = isDef(data) && isDef(i = (data as VNodeData).ns) ? api.createElementNS(i, tag)
                                                                             : api.createElement(tag);
    if (hash < dot) elm.setAttribute('id', sel.slice(hash + 1, dot));
    if (dotIdx > 0) elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '));

    // 调用 module 中的create hook
    for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);

    // 挂载子节点
    if (is.array(children)) {
      for (i = 0; i < children.length; ++i) {
        const ch = children[i];
        if (ch != null) {
          api.appendChild(elm, createElm(ch as VNode, insertedVnodeQueue));
        }
      }
    } else if (is.primitive(vnode.text)) {
      api.appendChild(elm, api.createTextNode(vnode.text));
    }
    i = (vnode.data as VNodeData).hook; // Reuse variable
    // 调用 vnode 上的hook
    if (isDef(i)) {
      // 调用create hook
      if (i.create) i.create(emptyNode, vnode);
      // insert hook存储起来 等dom插入后才会调用，这里用个数组来保存能避免调用时再次对vnode树做遍历
      if (i.insert) insertedVnodeQueue.push(vnode);
    }
  } else {
    // 文本节点
    vnode.elm = api.createTextNode(vnode.text as string);
  }
  return vnode.elm;
}
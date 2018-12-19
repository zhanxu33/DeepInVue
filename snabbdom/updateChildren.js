function updateChildren(parentElm: Node, oldCh: Array<VNode>, newCh: Array<VNode>, insertedVnodeQueue: VNodeQueue) {
  let oldStartIdx = 0,
    newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx: any;
  let idxInOld: number;
  let elmToMove: VNode;
  let before: any;

  // 遍历oldCh newCh，对节点进行比较和更新
  // 每轮比较最多处理一个节点，算法复杂度O(n)
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 如果进行比较的4个节点中存在空节点，为空的节点下标向中间推进，继续下个循环
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx];
      // 新旧开始节点相同，直接调用patchVnode进行更新，下标向中间推进
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
      // 新旧结束节点相同，逻辑同上
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
      // 旧开始节点等于新的节点节点，说明节点向右移动了，调用patchVnode进行更新
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
      // 旧开始节点等于新的结束节点，说明节点向右移动了
      // 具体移动到哪，因为新节点处于末尾，所以添加到旧结束节点（会随着updateChildren左移）的后面
      // 注意这里需要移动dom，因为节点右移了，而为什么是插入oldEndVnode的后面呢？
      // 可以分为两个情况来理解：
      // 1. 当循环刚开始，下标都还没有移动，那移动到oldEndVnode的后面就相当于是最后面，是合理的
      // 2. 循环已经执行过一部分了，因为每次比较结束后，下标都会向中间靠拢，而且每次都会处理一个节点,
      // 这时下标左右两边已经处理完成，可以把下标开始到结束区域当成是并未开始循环的一个整体，
      // 所以插入到oldEndVnode后面是合理的（在当前循环来说，也相当于是最后面，同1）
      api.insertBefore(parentElm, oldStartVnode.elm as Node, api.nextSibling(oldEndVnode.elm as Node));
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
      // 旧的结束节点等于新的开始节点，说明节点是向左移动了，逻辑同上
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
      api.insertBefore(parentElm, oldEndVnode.elm as Node, oldStartVnode.elm as Node);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
      // 如果以上4种情况都不匹配，可能存在下面2种情况
      // 1. 这个节点是新创建的
      // 2. 这个节点在原来的位置是处于中间的（oldStartIdx和endStartIdx之间）
    } else {
      // 如果oldKeyToIdx不存在，创建 key 到 index 的映射
      // 而且也存在各种细微的优化，只会创建一次，并且已经完成的部分不需要映射
      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      // 拿到在oldCh下对应的下标
      idxInOld = oldKeyToIdx[newStartVnode.key as string];
      // 如果下标不存在，说明这个节点是新创建的
      if (isUndef(idxInOld)) {
        // New element
        // 插入到oldStartVnode的前面（对于当前循环来说，相当于最前面）
        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm as Node);
        newStartVnode = newCh[++newStartIdx];
      } else {
        // 如果是已经存在的节点 找到需要移动位置的节点
        elmToMove = oldCh[idxInOld];
        // 虽然key相同了，但是seletor不相同，需要调用createElm来创建新的dom节点
        if (elmToMove.sel !== newStartVnode.sel) {
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm as Node);
        } else {
          // 否则调用patchVnode对旧vnode做更新
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
          // 在oldCh中将当前已经处理的vnode置空，等下次循环到这个下标的时候直接跳过
          oldCh[idxInOld] = undefined as any;
          // 插入到oldStartVnode的前面（对于当前循环来说，相当于最前面）
          api.insertBefore(parentElm, elmToMove.elm as Node, oldStartVnode.elm as Node);
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
  }
  // 循环结束后，可能会存在两种情况
  // 1. oldCh已经全部处理完成，而newCh还有新的节点，需要对剩下的每个项都创建新的dom
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      // 2. newCh已经全部处理完成，而oldCh还有旧的节点，需要将多余的节点移除
    } else {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }
}
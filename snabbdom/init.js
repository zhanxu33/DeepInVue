export interface Module {
  pre: PreHook;
  create: CreateHook;
  update: UpdateHook;
  destroy: DestroyHook;
  remove: RemoveHook;
  post: PostHook;
}

export function init(modules: Array<Partial<Module>>, domApi?: DOMAPI) {
  // cbs 用于收集module中的hook
  let i: number,
    j: number,
    cbs = {} as ModuleHooks;

  const api: DOMAPI = domApi !== undefined ? domApi : htmlDomApi;

  // 收集module中的hook
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      const hook = modules[j][hooks[i]];
      if (hook !== undefined) {
        (cbs[hooks[i]] as Array<any>).push(hook);
      }
    }
  }

  function emptyNodeAt(elm: Element) {
    // ...
  }

  function createRmCb(childElm: Node, listeners: number) {
    // ...
  }

  // 创建真正的dom节点
  function createElm(vnode: VNode, insertedVnodeQueue: VNodeQueue): Node {
    // ...
  }

  function addVnodes(
    parentElm: Node,
    before: Node | null,
    vnodes: Array<VNode>,
    startIdx: number,
    endIdx: number,
    insertedVnodeQueue: VNodeQueue
  ) {
    // ...
  }

  // 调用destory hook
  // 如果存在children 递归调用
  function invokeDestroyHook(vnode: VNode) {
    // ...
  }

  function removeVnodes(parentElm: Node, vnodes: Array<VNode>, startIdx: number, endIdx: number): void {
    // ...
  }

  function updateChildren(parentElm: Node, oldCh: Array<VNode>, newCh: Array<VNode>, insertedVnodeQueue: VNodeQueue) {
    // ...
  }

  function patchVnode(oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {
    // ...
  }

  return function patch(oldVnode: VNode | Element, vnode: VNode): VNode {
    // ...
  };
}
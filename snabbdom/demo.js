/* 数据结构
export interface VNode {
  sel: string | undefined; 选择器
  data: VNodeData | undefined; 绑定的数据
  children: Array<VNode | string> | undefined; 子节点数组
  elm: Node | undefined; 真实dom elm 的引用
  text: string | undefined; 文本节点
  key: Key | undefined;
}

export interface VNodeData {
  props?: Props;
  attrs?: Attrs;
  class?: Classes;
  style?: VNodeStyle;
  dataset?: Dataset;
  on?: On;
  hero?: Hero;
  attachData?: AttachData;
  hook?: Hooks;
  key?: Key;
  ns?: string; // for SVGs
  fn?: () => VNode; // for thunks
  args?: Array<any>; // for thunks
  [key: string]: any; // for any other 3rd party module
}
*/

// 具体用法
var snabbdom = require('snabbdom');
var patch = snabbdom.init([ // patch主要是创建或更新DOM树
  // Init patch function with chosen modules,
  require('snabbdom/modules/class').default, // makes it easy to toggle classes
  require('snabbdom/modules/props').default, // for setting properties on DOM elements
  require('snabbdom/modules/style').default, // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners').default // attaches event listeners
]);
var h = require('snabbdom/h').default; // 生成虚拟dom(vnode)的方法

var container = document.getElementById('container');

var vnode = h('div#container.two.classes', { on: { click: someFn } }, [
  h('span', { style: { fontWeight: 'bold' } }, 'This is bold'),
  ' and this is just normal text',
  h('a', { props: { href: '/foo' } }, "I'll take you places!")
]);
// Patch into empty DOM element – this modifies the DOM as a side effect
// 对比2个虚拟dom，然后更新，这里是element和虚拟dom
patch(container, vnode);

var newVnode = h('div#container.two.classes', { on: { click: anotherEventHandler } }, [
  h('span', { style: { fontWeight: 'normal', fontStyle: 'italic' } }, 'This is now italic type'),
  ' and this is still just normal text',
  h('a', { props: { href: '/bar' } }, "I'll take you places!")
]);
// Second `patch` invocation
// 对比2个虚拟dom，然后更新
patch(vnode, newVnode); // Snabbdom efficiently updates the old view to the new state
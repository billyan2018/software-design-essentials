/*! markmap-view v0.2.6 | MIT License */
(function (exports, d3) {
'use strict';

function _interopNamespace(e) {
if (e && e.__esModule) return e;
var n = Object.create(null);
if (e) {
Object.keys(e).forEach(function (k) {
n[k] = e[k];
});
}
n['default'] = e;
return Object.freeze(n);
}

var d3__namespace = /*#__PURE__*/_interopNamespace(d3);

function _extends$1() {
  _extends$1 = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends$1.apply(this, arguments);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}

function count(node) {
  var sum = 0,
      children = node.children,
      i = children && children.length;
  if (!i) sum = 1;else while (--i >= 0) {
    sum += children[i].value;
  }
  node.value = sum;
}

function node_count () {
  return this.eachAfter(count);
}

function node_each (callback) {
  var node = this,
      current,
      next = [node],
      children,
      i,
      n;

  do {
    current = next.reverse(), next = [];

    while (node = current.pop()) {
      callback(node), children = node.children;
      if (children) for (i = 0, n = children.length; i < n; ++i) {
        next.push(children[i]);
      }
    }
  } while (next.length);

  return this;
}

function node_eachBefore (callback) {
  var node = this,
      nodes = [node],
      children,
      i;

  while (node = nodes.pop()) {
    callback(node), children = node.children;
    if (children) for (i = children.length - 1; i >= 0; --i) {
      nodes.push(children[i]);
    }
  }

  return this;
}

function node_eachAfter (callback) {
  var node = this,
      nodes = [node],
      next = [],
      children,
      i,
      n;

  while (node = nodes.pop()) {
    next.push(node), children = node.children;
    if (children) for (i = 0, n = children.length; i < n; ++i) {
      nodes.push(children[i]);
    }
  }

  while (node = next.pop()) {
    callback(node);
  }

  return this;
}

function node_sum (value) {
  return this.eachAfter(function (node) {
    var sum = +value(node.data) || 0,
        children = node.children,
        i = children && children.length;

    while (--i >= 0) {
      sum += children[i].value;
    }

    node.value = sum;
  });
}

function node_sort (compare) {
  return this.eachBefore(function (node) {
    if (node.children) {
      node.children.sort(compare);
    }
  });
}

function node_path (end) {
  var start = this,
      ancestor = leastCommonAncestor(start, end),
      nodes = [start];

  while (start !== ancestor) {
    start = start.parent;
    nodes.push(start);
  }

  var k = nodes.length;

  while (end !== ancestor) {
    nodes.splice(k, 0, end);
    end = end.parent;
  }

  return nodes;
}

function leastCommonAncestor(a, b) {
  if (a === b) return a;
  var aNodes = a.ancestors(),
      bNodes = b.ancestors(),
      c = null;
  a = aNodes.pop();
  b = bNodes.pop();

  while (a === b) {
    c = a;
    a = aNodes.pop();
    b = bNodes.pop();
  }

  return c;
}

function node_ancestors () {
  var node = this,
      nodes = [node];

  while (node = node.parent) {
    nodes.push(node);
  }

  return nodes;
}

function node_descendants () {
  var nodes = [];
  this.each(function (node) {
    nodes.push(node);
  });
  return nodes;
}

function node_leaves () {
  var leaves = [];
  this.eachBefore(function (node) {
    if (!node.children) {
      leaves.push(node);
    }
  });
  return leaves;
}

function node_links () {
  var root = this,
      links = [];
  root.each(function (node) {
    if (node !== root) {
      // Don’t include the root’s parent, if any.
      links.push({
        source: node.parent,
        target: node
      });
    }
  });
  return links;
}

function hierarchy(data, children) {
  var root = new Node(data),
      valued = +data.value && (root.value = data.value),
      node,
      nodes = [root],
      child,
      childs,
      i,
      n;
  if (children == null) children = defaultChildren;

  while (node = nodes.pop()) {
    if (valued) node.value = +node.data.value;

    if ((childs = children(node.data)) && (n = childs.length)) {
      node.children = new Array(n);

      for (i = n - 1; i >= 0; --i) {
        nodes.push(child = node.children[i] = new Node(childs[i]));
        child.parent = node;
        child.depth = node.depth + 1;
      }
    }
  }

  return root.eachBefore(computeHeight);
}

function node_copy() {
  return hierarchy(this).eachBefore(copyData);
}

function defaultChildren(d) {
  return d.children;
}

function copyData(node) {
  node.data = node.data.data;
}

function computeHeight(node) {
  var height = 0;

  do {
    node.height = height;
  } while ((node = node.parent) && node.height < ++height);
}
function Node(data) {
  this.data = data;
  this.depth = this.height = 0;
  this.parent = null;
}
Node.prototype = hierarchy.prototype = {
  constructor: Node,
  count: node_count,
  each: node_each,
  eachAfter: node_eachAfter,
  eachBefore: node_eachBefore,
  sum: node_sum,
  sort: node_sort,
  path: node_path,
  ancestors: node_ancestors,
  descendants: node_descendants,
  leaves: node_leaves,
  links: node_links,
  copy: node_copy
};

var version = "2.1.1";

var defaults = Object.freeze({
  children: function children(data) {
    return data.children;
  },
  nodeSize: function nodeSize(node) {
    return node.data.size;
  },
  spacing: 0
}); // Create a layout function with customizable options. Per D3-style, the
// options can be set at any time using setter methods. The layout function
// will compute the tree node positions based on the options in effect at the
// time it is called.

function flextree(options) {
  var opts = Object.assign({}, defaults, options);

  function accessor(name) {
    var opt = opts[name];
    return typeof opt === 'function' ? opt : function () {
      return opt;
    };
  }

  function layout(tree) {
    var wtree = wrap(getWrapper(), tree, function (node) {
      return node.children;
    });
    wtree.update();
    return wtree.data;
  }

  function getFlexNode() {
    var nodeSize = accessor('nodeSize');

    var _spacing = accessor('spacing');

    return /*#__PURE__*/function (_hierarchy$prototype$) {
      _inheritsLoose(FlexNode, _hierarchy$prototype$);

      function FlexNode(data) {
        return _hierarchy$prototype$.call(this, data) || this;
      }

      var _proto = FlexNode.prototype;

      _proto.copy = function copy() {
        var c = wrap(this.constructor, this, function (node) {
          return node.children;
        });
        c.each(function (node) {
          return node.data = node.data.data;
        });
        return c;
      };

      _proto.spacing = function spacing(oNode) {
        return _spacing(this, oNode);
      };

      FlexNode.maxExtents = function maxExtents(e0, e1) {
        return {
          top: Math.min(e0.top, e1.top),
          bottom: Math.max(e0.bottom, e1.bottom),
          left: Math.min(e0.left, e1.left),
          right: Math.max(e0.right, e1.right)
        };
      };

      _createClass(FlexNode, [{
        key: "size",
        get: function get() {
          return nodeSize(this);
        }
      }, {
        key: "nodes",
        get: function get() {
          return this.descendants();
        }
      }, {
        key: "xSize",
        get: function get() {
          return this.size[0];
        }
      }, {
        key: "ySize",
        get: function get() {
          return this.size[1];
        }
      }, {
        key: "top",
        get: function get() {
          return this.y;
        }
      }, {
        key: "bottom",
        get: function get() {
          return this.y + this.ySize;
        }
      }, {
        key: "left",
        get: function get() {
          return this.x - this.xSize / 2;
        }
      }, {
        key: "right",
        get: function get() {
          return this.x + this.xSize / 2;
        }
      }, {
        key: "root",
        get: function get() {
          var ancs = this.ancestors();
          return ancs[ancs.length - 1];
        }
      }, {
        key: "numChildren",
        get: function get() {
          return this.hasChildren ? this.children.length : 0;
        }
      }, {
        key: "hasChildren",
        get: function get() {
          return !this.noChildren;
        }
      }, {
        key: "noChildren",
        get: function get() {
          return this.children === null;
        }
      }, {
        key: "firstChild",
        get: function get() {
          return this.hasChildren ? this.children[0] : null;
        }
      }, {
        key: "lastChild",
        get: function get() {
          return this.hasChildren ? this.children[this.numChildren - 1] : null;
        }
      }, {
        key: "extents",
        get: function get() {
          return (this.children || []).reduce(function (acc, kid) {
            return FlexNode.maxExtents(acc, kid.extents);
          }, this.nodeExtents);
        }
      }, {
        key: "nodeExtents",
        get: function get() {
          return {
            top: this.top,
            bottom: this.bottom,
            left: this.left,
            right: this.right
          };
        }
      }]);

      return FlexNode;
    }(hierarchy.prototype.constructor);
  }

  function getWrapper() {
    var FlexNode = getFlexNode();
    var nodeSize = accessor('nodeSize');

    var _spacing2 = accessor('spacing');

    return /*#__PURE__*/function (_FlexNode) {
      _inheritsLoose(_class, _FlexNode);

      function _class(data) {
        var _this;

        _this = _FlexNode.call(this, data) || this;
        Object.assign(_assertThisInitialized(_this), {
          x: 0,
          y: 0,
          relX: 0,
          prelim: 0,
          shift: 0,
          change: 0,
          lExt: _assertThisInitialized(_this),
          lExtRelX: 0,
          lThr: null,
          rExt: _assertThisInitialized(_this),
          rExtRelX: 0,
          rThr: null
        });
        return _this;
      }

      var _proto2 = _class.prototype;

      _proto2.spacing = function spacing(oNode) {
        return _spacing2(this.data, oNode.data);
      };

      _proto2.update = function update() {
        layoutChildren(this);
        resolveX(this);
        return this;
      };

      _createClass(_class, [{
        key: "size",
        get: function get() {
          return nodeSize(this.data);
        }
      }, {
        key: "x",
        get: function get() {
          return this.data.x;
        },
        set: function set(v) {
          this.data.x = v;
        }
      }, {
        key: "y",
        get: function get() {
          return this.data.y;
        },
        set: function set(v) {
          this.data.y = v;
        }
      }]);

      return _class;
    }(FlexNode);
  }

  function wrap(FlexClass, treeData, children) {
    var _wrap = function _wrap(data, parent) {
      var node = new FlexClass(data);
      Object.assign(node, {
        parent: parent,
        depth: parent === null ? 0 : parent.depth + 1,
        height: 0,
        length: 1
      });
      var kidsData = children(data) || [];
      node.children = kidsData.length === 0 ? null : kidsData.map(function (kd) {
        return _wrap(kd, node);
      });

      if (node.children) {
        Object.assign(node, node.children.reduce(function (hl, kid) {
          return {
            height: Math.max(hl.height, kid.height + 1),
            length: hl.length + kid.length
          };
        }, node));
      }

      return node;
    };

    return _wrap(treeData, null);
  }

  Object.assign(layout, {
    nodeSize: function nodeSize(arg) {
      return arguments.length ? (opts.nodeSize = arg, layout) : opts.nodeSize;
    },
    spacing: function spacing(arg) {
      return arguments.length ? (opts.spacing = arg, layout) : opts.spacing;
    },
    children: function children(arg) {
      return arguments.length ? (opts.children = arg, layout) : opts.children;
    },
    hierarchy: function hierarchy(treeData, children) {
      var kids = typeof children === 'undefined' ? opts.children : children;
      return wrap(getFlexNode(), treeData, kids);
    },
    dump: function dump(tree) {
      var nodeSize = accessor('nodeSize');

      var _dump = function _dump(i0) {
        return function (node) {
          var i1 = i0 + '  ';
          var i2 = i0 + '    ';
          var x = node.x,
              y = node.y;
          var size = nodeSize(node);
          var kids = node.children || [];
          var kdumps = kids.length === 0 ? ' ' : "," + i1 + "children: [" + i2 + kids.map(_dump(i2)).join(i2) + i1 + "]," + i0;
          return "{ size: [" + size.join(', ') + "]," + i1 + "x: " + x + ", y: " + y + kdumps + "},";
        };
      };

      return _dump('\n')(tree);
    }
  });
  return layout;
}
flextree.version = version;

var layoutChildren = function layoutChildren(w, y) {
  if (y === void 0) {
    y = 0;
  }

  w.y = y;
  (w.children || []).reduce(function (acc, kid) {
    var i = acc[0],
        lastLows = acc[1];
    layoutChildren(kid, w.y + w.ySize); // The lowest vertical coordinate while extreme nodes still point
    // in current subtree.

    var lowY = (i === 0 ? kid.lExt : kid.rExt).bottom;
    if (i !== 0) separate(w, i, lastLows);
    var lows = updateLows(lowY, i, lastLows);
    return [i + 1, lows];
  }, [0, null]);
  shiftChange(w);
  positionRoot(w);
  return w;
}; // Resolves the relative coordinate properties - relX and prelim --
// to set the final, absolute x coordinate for each node. This also sets
// `prelim` to 0, so that `relX` for each node is its x-coordinate relative
// to its parent.


var resolveX = function resolveX(w, prevSum, parentX) {
  // A call to resolveX without arguments is assumed to be for the root of
  // the tree. This will set the root's x-coord to zero.
  if (typeof prevSum === 'undefined') {
    prevSum = -w.relX - w.prelim;
    parentX = 0;
  }

  var sum = prevSum + w.relX;
  w.relX = sum + w.prelim - parentX;
  w.prelim = 0;
  w.x = parentX + w.relX;
  (w.children || []).forEach(function (k) {
    return resolveX(k, sum, w.x);
  });
  return w;
}; // Process shift and change for all children, to add intermediate spacing to
// each child's modifier.


var shiftChange = function shiftChange(w) {
  (w.children || []).reduce(function (acc, child) {
    var lastShiftSum = acc[0],
        lastChangeSum = acc[1];
    var shiftSum = lastShiftSum + child.shift;
    var changeSum = lastChangeSum + shiftSum + child.change;
    child.relX += changeSum;
    return [shiftSum, changeSum];
  }, [0, 0]);
}; // Separates the latest child from its previous sibling

/* eslint-disable complexity */


var separate = function separate(w, i, lows) {
  var lSib = w.children[i - 1];
  var curSubtree = w.children[i];
  var rContour = lSib;
  var rSumMods = lSib.relX;
  var lContour = curSubtree;
  var lSumMods = curSubtree.relX;
  var isFirst = true;

  while (rContour && lContour) {
    if (rContour.bottom > lows.lowY) lows = lows.next; // How far to the left of the right side of rContour is the left side
    // of lContour? First compute the center-to-center distance, then add
    // the "spacing"

    var dist = rSumMods + rContour.prelim - (lSumMods + lContour.prelim) + rContour.xSize / 2 + lContour.xSize / 2 + rContour.spacing(lContour);

    if (dist > 0 || dist < 0 && isFirst) {
      lSumMods += dist; // Move subtree by changing relX.

      moveSubtree(curSubtree, dist);
      distributeExtra(w, i, lows.index, dist);
    }

    isFirst = false; // Advance highest node(s) and sum(s) of modifiers

    var rightBottom = rContour.bottom;
    var leftBottom = lContour.bottom;

    if (rightBottom <= leftBottom) {
      rContour = nextRContour(rContour);
      if (rContour) rSumMods += rContour.relX;
    }

    if (rightBottom >= leftBottom) {
      lContour = nextLContour(lContour);
      if (lContour) lSumMods += lContour.relX;
    }
  } // Set threads and update extreme nodes. In the first case, the
  // current subtree is taller than the left siblings.


  if (!rContour && lContour) setLThr(w, i, lContour, lSumMods); // In the next case, the left siblings are taller than the current subtree
  else if (rContour && !lContour) setRThr(w, i, rContour, rSumMods);
};
/* eslint-enable complexity */
// Move subtree by changing relX.


var moveSubtree = function moveSubtree(subtree, distance) {
  subtree.relX += distance;
  subtree.lExtRelX += distance;
  subtree.rExtRelX += distance;
};

var distributeExtra = function distributeExtra(w, curSubtreeI, leftSibI, dist) {
  var curSubtree = w.children[curSubtreeI];
  var n = curSubtreeI - leftSibI; // Are there intermediate children?

  if (n > 1) {
    var delta = dist / n;
    w.children[leftSibI + 1].shift += delta;
    curSubtree.shift -= delta;
    curSubtree.change -= dist - delta;
  }
};

var nextLContour = function nextLContour(w) {
  return w.hasChildren ? w.firstChild : w.lThr;
};

var nextRContour = function nextRContour(w) {
  return w.hasChildren ? w.lastChild : w.rThr;
};

var setLThr = function setLThr(w, i, lContour, lSumMods) {
  var firstChild = w.firstChild;
  var lExt = firstChild.lExt;
  var curSubtree = w.children[i];
  lExt.lThr = lContour; // Change relX so that the sum of modifier after following thread is correct.

  var diff = lSumMods - lContour.relX - firstChild.lExtRelX;
  lExt.relX += diff; // Change preliminary x coordinate so that the node does not move.

  lExt.prelim -= diff; // Update extreme node and its sum of modifiers.

  firstChild.lExt = curSubtree.lExt;
  firstChild.lExtRelX = curSubtree.lExtRelX;
}; // Mirror image of setLThr.


var setRThr = function setRThr(w, i, rContour, rSumMods) {
  var curSubtree = w.children[i];
  var rExt = curSubtree.rExt;
  var lSib = w.children[i - 1];
  rExt.rThr = rContour;
  var diff = rSumMods - rContour.relX - curSubtree.rExtRelX;
  rExt.relX += diff;
  rExt.prelim -= diff;
  curSubtree.rExt = lSib.rExt;
  curSubtree.rExtRelX = lSib.rExtRelX;
}; // Position root between children, taking into account their modifiers


var positionRoot = function positionRoot(w) {
  if (w.hasChildren) {
    var k0 = w.firstChild;
    var kf = w.lastChild;
    var prelim = (k0.prelim + k0.relX - k0.xSize / 2 + kf.relX + kf.prelim + kf.xSize / 2) / 2;
    Object.assign(w, {
      prelim: prelim,
      lExt: k0.lExt,
      lExtRelX: k0.lExtRelX,
      rExt: kf.rExt,
      rExtRelX: kf.rExtRelX
    });
  }
}; // Make/maintain a linked list of the indexes of left siblings and their
// lowest vertical coordinate.


var updateLows = function updateLows(lowY, index, lastLows) {
  // Remove siblings that are hidden by the new subtree.
  while (lastLows !== null && lowY >= lastLows.lowY) {
    lastLows = lastLows.next;
  } // Prepend the new subtree.


  return {
    lowY: lowY,
    index: index,
    next: lastLows
  };
};

/*! markmap-common v0.1.5 | MIT License */
class Hook {
  constructor() {
    this.listeners = [];
  }

  tap(fn) {
    this.listeners.push(fn);
    return () => this.revoke(fn);
  }

  revoke(fn) {
    const i = this.listeners.indexOf(fn);
    if (i >= 0) this.listeners.splice(i, 1);
  }

  revokeAll() {
    this.listeners.splice(0);
  }

  call(...args) {
    for (const fn of this.listeners) {
      fn(...args);
    }
  }

}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const uniqId = Math.random().toString(36).slice(2, 8);
let globalIndex = 0;

function getId() {
  globalIndex += 1;
  return `mm-${uniqId}-${globalIndex}`;
}

function noop() {// noop
}

function walkTree(tree, callback, key = 'c') {
  const walk = (item, parent) => callback(item, () => {
    var _item$key;

    (_item$key = item[key]) == null ? void 0 : _item$key.forEach(child => {
      walk(child, item);
    });
  }, parent);

  walk(tree);
}

function arrayFrom(arrayLike) {
  if (Array.from) return Array.from(arrayLike);
  const array = [];

  for (let i = 0; i < arrayLike.length; i += 1) {
    array.push(arrayLike[i]);
  }

  return array;
}

function addClass(className, ...rest) {
  const classList = (className || '').split(' ').filter(Boolean);
  rest.forEach(item => {
    if (item && classList.indexOf(item) < 0) classList.push(item);
  });
  return classList.join(' ');
}

function childSelector(filter) {
  if (typeof filter === 'string') {
    const tagName = filter;

    filter = el => el.tagName === tagName;
  }

  const filterFn = filter;
  return function selector() {
    let nodes = arrayFrom(this.childNodes);
    if (filterFn) nodes = nodes.filter(node => filterFn(node));
    return nodes;
  };
}

function memoize(fn) {
  const cache = {};
  return function memoized(...args) {
    const key = `${args[0]}`;
    let data = cache[key];

    if (!data) {
      data = {
        value: fn(...args)
      };
      cache[key] = data;
    }

    return data.value;
  };
}

function createElement(tagName, props, attrs) {
  const el = document.createElement(tagName);

  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      el[key] = value;
    });
  }

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  }

  return el;
}

const memoizedPreloadJS = memoize(url => {
  document.head.append(createElement('link', {
    rel: 'preload',
    as: 'script',
    href: url
  }));
});

function loadJSItem(item, context) {
  if (item.type === 'script') {
    return new Promise((resolve, reject) => {
      var _item$data;

      document.head.append(createElement('script', _extends({}, item.data, {
        onload: resolve,
        onerror: reject
      }))); // Run inline script synchronously

      if (!((_item$data = item.data) != null && _item$data.src)) resolve();
    });
  }

  if (item.type === 'iife') {
    const {
      fn,
      getParams
    } = item.data;
    fn(...((getParams == null ? void 0 : getParams(context)) || []));
  }
}

function loadCSSItem(item) {
  if (item.type === 'style') {
    document.head.append(createElement('style', {
      textContent: item.data
    }));
  } else if (item.type === 'stylesheet') {
    document.head.append(createElement('link', _extends({
      rel: 'stylesheet'
    }, item.data)));
  }
}

async function loadJS(items, context) {
  const needPreload = items.filter(item => {
    var _item$data2;

    return item.type === 'script' && ((_item$data2 = item.data) == null ? void 0 : _item$data2.src);
  });
  if (needPreload.length > 1) needPreload.forEach(item => memoizedPreloadJS(item.data.src));
  context = _extends({
    getMarkmap: () => window.markmap
  }, context);

  for (const item of items) {
    await loadJSItem(item, context);
  }
}

function loadCSS(items) {
  for (const item of items) {
    loadCSSItem(item);
  }
}

function linkWidth(nodeData) {
  const data = nodeData.data;
  return Math.max(6 - 2 * data.d, 1.5);
}

function adjustSpacing(tree, spacing) {
  walkTree(tree, (d, next) => {
    d.ySizeInner = d.ySize - spacing;
    d.y += spacing;
    next();
  }, 'children');
}

function minBy(numbers, by) {
  const index = d3__namespace.minIndex(numbers, by);
  return numbers[index];
}

function stopPropagation(e) {
  e.stopPropagation();
}

function createViewHooks() {
  return {
    transformHtml: new Hook()
  };
}
/**
 * A global hook to refresh all markmaps when called.
 */


const refreshHook = new Hook();
class Markmap {
  constructor(svg, opts) {
    this.options = void 0;
    this.state = void 0;
    this.svg = void 0;
    this.styleNode = void 0;
    this.g = void 0;
    this.zoom = void 0;
    this.viewHooks = void 0;
    this.revokers = [];
    ['handleZoom', 'handleClick'].forEach(key => {
      this[key] = this[key].bind(this);
    });
    this.viewHooks = createViewHooks();
    this.svg = svg.datum ? svg : d3__namespace.select(svg);
    this.styleNode = this.svg.append('style');
    this.zoom = d3__namespace.zoom().on('zoom', this.handleZoom);
    this.options = _extends$1({}, Markmap.defaultOptions, opts);
    this.state = {
      id: this.options.id || getId()
    };
    this.g = this.svg.append('g').attr('class', `${this.state.id}-g`);
    this.updateStyle();
    this.svg.call(this.zoom);
    this.revokers.push(refreshHook.tap(() => {
      this.setData();
    }));
  }

  getStyleContent() {
    const {
      style,
      nodeFont
    } = this.options;
    const {
      id
    } = this.state;
    const extraStyle = typeof style === 'function' ? style(id) : '';
    const styleText = `\
.${id} { line-height: 1; }
.${id} a { color: #0097e6; }
.${id} a:hover { color: #00a8ff; }
.${id}-g > path { fill: none; }
.${id}-g > g > circle { cursor: pointer; }
.${id}-fo > div { display: inline-block; font: ${nodeFont}; white-space: nowrap; }
.${id}-fo code { font-size: calc(1em - 2px); color: #555; background-color: #f0f0f0; border-radius: 2px; }
.${id}-fo :not(pre) > code { padding: .2em .4em; }
.${id}-fo del { text-decoration: line-through; }
.${id}-fo em { font-style: italic; }
.${id}-fo strong { font-weight: bolder; }
.${id}-fo pre { margin: 0; padding: .2em .4em; }
${extraStyle}
`;
    return styleText;
  }

  updateStyle() {
    this.svg.attr('class', addClass(this.svg.attr('class'), this.state.id));
    this.styleNode.text(this.getStyleContent());
  }

  handleZoom(e) {
    const {
      transform
    } = e;
    this.g.attr('transform', transform);
  }

  handleClick(e, d) {
    var _data$p;

    const {
      data
    } = d;
    data.p = _extends$1({}, data.p, {
      f: !((_data$p = data.p) != null && _data$p.f)
    });
    this.renderData(d.data);
  }

  initializeData(node) {
    let i = 0;
    const {
      nodeFont,
      color,
      nodeMinHeight
    } = this.options;
    const {
      id
    } = this.state;
    const container = document.createElement('div');
    const containerClass = `${id}-container`;
    container.className = addClass(container.className, `${id}-fo`, containerClass);
    const style = document.createElement('style');
    style.textContent = `
${this.getStyleContent()}
.${containerClass} {
  position: absolute;
  width: 0;
  height: 0;
  top: -100px;
  left: -100px;
  overflow: hidden;
  font: ${nodeFont};
}
.${containerClass} > div {
  display: inline-block;
}
`;
    document.body.append(style, container);
    walkTree(node, (item, next) => {
      var _item$c;

      item.c = (_item$c = item.c) == null ? void 0 : _item$c.map(child => _extends$1({}, child));
      i += 1;
      const el = document.createElement('div');
      el.innerHTML = item.v;
      container.append(el);
      item.p = _extends$1({}, item.p, {
        // unique ID
        i,
        el
      });
      color(item); // preload colors

      next();
    });
    const nodes = arrayFrom(container.childNodes);
    this.viewHooks.transformHtml.call(this, nodes);
    walkTree(node, (item, next, parent) => {
      var _parent$p;

      const rect = item.p.el.getBoundingClientRect();
      item.v = item.p.el.innerHTML;
      item.p.s = [Math.ceil(rect.width), Math.max(Math.ceil(rect.height), nodeMinHeight)]; // TODO keep keys for unchanged objects
      // unique key, should be based on content

      item.p.k = `${(parent == null ? void 0 : (_parent$p = parent.p) == null ? void 0 : _parent$p.i) || ''}.${item.p.i}:${item.v}`;
      next();
    });
    container.remove();
    style.remove();
  }

  setOptions(opts) {
    Object.assign(this.options, opts);
  }

  setData(data, opts) {
    if (data) this.state.data = data;
    this.initializeData(this.state.data);
    if (opts) this.setOptions(opts);
    this.renderData();
  }

  renderData(originData) {
    var _origin$data$p$x, _origin$data$p$y;

    if (!this.state.data) return;
    const {
      spacingHorizontal,
      paddingX,
      spacingVertical,
      autoFit,
      color
    } = this.options;
    const {
      id
    } = this.state;
    const layout = flextree().children(d => {
      var _d$p;

      return !((_d$p = d.p) != null && _d$p.f) && d.c;
    }).nodeSize(d => {
      const [width, height] = d.data.p.s;
      return [height, width + (width ? paddingX * 2 : 0) + spacingHorizontal];
    }).spacing((a, b) => {
      return a.parent === b.parent ? spacingVertical : spacingVertical * 2;
    });
    const tree = layout.hierarchy(this.state.data);
    layout(tree);
    adjustSpacing(tree, spacingHorizontal);
    const descendants = tree.descendants().reverse();
    const links = tree.links();
    const linkShape = d3__namespace.linkHorizontal();
    const minX = d3__namespace.min(descendants, d => d.x - d.xSize / 2);
    const maxX = d3__namespace.max(descendants, d => d.x + d.xSize / 2);
    const minY = d3__namespace.min(descendants, d => d.y);
    const maxY = d3__namespace.max(descendants, d => d.y + d.ySizeInner);
    Object.assign(this.state, {
      minX,
      maxX,
      minY,
      maxY
    });
    if (autoFit) this.fit();
    const origin = originData && descendants.find(item => item.data === originData) || tree;
    const x0 = (_origin$data$p$x = origin.data.p.x0) != null ? _origin$data$p$x : origin.x;
    const y0 = (_origin$data$p$y = origin.data.p.y0) != null ? _origin$data$p$y : origin.y; // Update the nodes

    const node = this.g.selectAll(childSelector('g')).data(descendants, d => d.data.p.k);
    const nodeEnter = node.enter().append('g').attr('transform', d => `translate(${y0 + origin.ySizeInner - d.ySizeInner},${x0 + origin.xSize / 2 - d.xSize})`);
    const nodeExit = this.transition(node.exit());
    nodeExit.select('rect').attr('width', 0).attr('x', d => d.ySizeInner);
    nodeExit.select('foreignObject').style('opacity', 0);
    nodeExit.attr('transform', d => `translate(${origin.y + origin.ySizeInner - d.ySizeInner},${origin.x + origin.xSize / 2 - d.xSize})`).remove();
    const nodeMerge = node.merge(nodeEnter);
    this.transition(nodeMerge).attr('transform', d => `translate(${d.y},${d.x - d.xSize / 2})`);
    const rect = nodeMerge.selectAll(childSelector('rect')).data(d => [d], d => d.data.p.k).join(enter => {
      return enter.append('rect').attr('x', d => d.ySizeInner).attr('y', d => d.xSize - linkWidth(d) / 2).attr('width', 0).attr('height', linkWidth);
    }, update => update, exit => exit.remove());
    this.transition(rect).attr('x', -1).attr('width', d => d.ySizeInner + 2).attr('fill', d => color(d.data));
    const circle = nodeMerge.selectAll(childSelector('circle')).data(d => d.data.c ? [d] : [], d => d.data.p.k).join(enter => {
      return enter.append('circle').attr('stroke-width', '1.5').attr('cx', d => d.ySizeInner).attr('cy', d => d.xSize).attr('r', 0).on('click', this.handleClick);
    }, update => update, exit => exit.remove());
    this.transition(circle).attr('r', 6).attr('stroke', d => color(d.data)).attr('fill', d => {
      var _d$data$p;

      return (_d$data$p = d.data.p) != null && _d$data$p.f && d.data.c ? color(d.data) : '#fff';
    });
    const foreignObject = nodeMerge.selectAll(childSelector('foreignObject')).data(d => [d], d => d.data.p.k).join(enter => {
      const fo = enter.append('foreignObject').attr('class', `${id}-fo`).attr('x', paddingX).attr('y', 0).style('opacity', 0).attr('height', d => d.xSize).on('mousedown', stopPropagation).on('dblclick', stopPropagation);
      fo.append('xhtml:div').select(function select(d) {
        const node = d.data.p.el.cloneNode(true);
        this.replaceWith(node);
        return node;
      }).attr('xmlns', 'http://www.w3.org/1999/xhtml');
      return fo;
    }, update => update, exit => exit.remove()).attr('width', d => Math.max(0, d.ySizeInner - paddingX * 2));
    this.transition(foreignObject).style('opacity', 1); // Update the links

    const path = this.g.selectAll(childSelector('path')).data(links, d => d.target.data.p.k).join(enter => {
      const source = [y0 + origin.ySizeInner, x0 + origin.xSize / 2];
      return enter.insert('path', 'g').attr('d', linkShape({
        source,
        target: source
      }));
    }, update => update, exit => {
      const source = [origin.y + origin.ySizeInner, origin.x + origin.xSize / 2];
      return this.transition(exit).attr('d', linkShape({
        source,
        target: source
      })).remove();
    });
    this.transition(path).attr('stroke', d => color(d.target.data)).attr('stroke-width', d => linkWidth(d.target)).attr('d', d => {
      const source = [d.source.y + d.source.ySizeInner, d.source.x + d.source.xSize / 2];
      const target = [d.target.y, d.target.x + d.target.xSize / 2];
      return linkShape({
        source,
        target
      });
    });
    descendants.forEach(d => {
      d.data.p.x0 = d.x;
      d.data.p.y0 = d.y;
    });
  }

  transition(sel) {
    const {
      duration
    } = this.options;
    return sel.transition().duration(duration);
  }
  /**
   * Fit the content to the viewport.
   */


  async fit() {
    const svgNode = this.svg.node();
    const {
      width: offsetWidth,
      height: offsetHeight
    } = svgNode.getBoundingClientRect();
    const {
      fitRatio
    } = this.options;
    const {
      minX,
      maxX,
      minY,
      maxY
    } = this.state;
    const naturalWidth = maxY - minY;
    const naturalHeight = maxX - minX;
    const scale = Math.min(offsetWidth / naturalWidth * fitRatio, offsetHeight / naturalHeight * fitRatio, 2);
    const initialZoom = d3__namespace.zoomIdentity.translate((offsetWidth - naturalWidth * scale) / 2 - minY * scale, (offsetHeight - naturalHeight * scale) / 2 - minX * scale).scale(scale);
    return this.transition(this.svg).call(this.zoom.transform, initialZoom).end().catch(noop);
  }
  /**
   * Pan the content to make the provided node visible in the viewport.
   */


  async ensureView(node, padding) {
    let g;
    let itemData;
    this.g.selectAll(childSelector('g')).each(function walk(d) {
      if (d.data === node) {
        g = this;
        itemData = d;
      }
    });
    if (!g || !itemData) return;
    const svgNode = this.svg.node();
    const relRect = svgNode.getBoundingClientRect();
    const transform = d3__namespace.zoomTransform(svgNode);
    const [left, right] = [itemData.y, itemData.y + itemData.ySizeInner + 2].map(x => x * transform.k + transform.x);
    const [top, bottom] = [itemData.x - itemData.xSize / 2, itemData.x + itemData.xSize / 2].map(y => y * transform.k + transform.y); // Skip if the node includes or is included in the container.

    const pd = _extends$1({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, padding);

    const dxs = [pd.left - left, relRect.width - pd.right - right];
    const dys = [pd.top - top, relRect.height - pd.bottom - bottom];
    const dx = dxs[0] * dxs[1] > 0 ? minBy(dxs, Math.abs) / transform.k : 0;
    const dy = dys[0] * dys[1] > 0 ? minBy(dys, Math.abs) / transform.k : 0;

    if (dx || dy) {
      const newTransform = transform.translate(dx, dy);
      return this.transition(this.svg).call(this.zoom.transform, newTransform).end().catch(noop);
    }
  }
  /**
   * Scale content with it pinned at the center of the viewport.
   */


  async rescale(scale) {
    const svgNode = this.svg.node();
    const {
      width: offsetWidth,
      height: offsetHeight
    } = svgNode.getBoundingClientRect();
    const halfWidth = offsetWidth / 2;
    const halfHeight = offsetHeight / 2;
    const transform = d3__namespace.zoomTransform(svgNode);
    const newTransform = transform.translate((halfWidth - transform.x) * (1 - scale) / transform.k, (halfHeight - transform.y) * (1 - scale) / transform.k).scale(scale);
    return this.transition(this.svg).call(this.zoom.transform, newTransform).end().catch(noop);
  }

  destroy() {
    this.svg.remove();
    this.revokers.forEach(fn => {
      fn();
    });
  }

  static create(svg, opts, data) {
    const mm = new Markmap(svg, opts);

    if (data) {
      mm.setData(data);
      mm.fit(); // always fit for the first render
    }

    return mm;
  }

}
Markmap.defaultOptions = {
  duration: 500,
  nodeFont: '300 16px/20px sans-serif',
  nodeMinHeight: 16,
  spacingVertical: 5,
  spacingHorizontal: 80,
  autoFit: false,
  fitRatio: 0.95,
  color: (colorFn => node => colorFn(node.p.i))(d3__namespace.scaleOrdinal(d3__namespace.schemeCategory10)),
  paddingX: 8
};

exports.Markmap = Markmap;
exports.loadCSS = loadCSS;
exports.loadJS = loadJS;
exports.refreshHook = refreshHook;

}(this.markmap = this.markmap || {}, d3));

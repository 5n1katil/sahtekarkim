(function () {
  'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function _arrayWithoutHoles(r) {
    if (Array.isArray(r)) return _arrayLikeToArray(r);
  }
  function asyncGeneratorStep(n, t, e, r, o, a, c) {
    try {
      var i = n[a](c),
        u = i.value;
    } catch (n) {
      return void e(n);
    }
    i.done ? t(u) : Promise.resolve(u).then(r, o);
  }
  function _asyncToGenerator(n) {
    return function () {
      var t = this,
        e = arguments;
      return new Promise(function (r, o) {
        var a = n.apply(t, e);
        function _next(n) {
          asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
        }
        function _throw(n) {
          asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
        }
        _next(void 0);
      });
    };
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function _iterableToArray(r) {
    if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = true,
        o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = true, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function ownKeys$1(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys$1(Object(t), true).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o,
      r,
      i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r[n];
    }
    return t;
  }
  function _regenerator() {
    /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
    var e,
      t,
      r = "function" == typeof Symbol ? Symbol : {},
      n = r.iterator || "@@iterator",
      o = r.toStringTag || "@@toStringTag";
    function i(r, n, o, i) {
      var c = n && n.prototype instanceof Generator ? n : Generator,
        u = Object.create(c.prototype);
      return _regeneratorDefine(u, "_invoke", function (r, n, o) {
        var i,
          c,
          u,
          f = 0,
          p = o || [],
          y = false,
          G = {
            p: 0,
            n: 0,
            v: e,
            a: d,
            f: d.bind(e, 4),
            d: function (t, r) {
              return i = t, c = 0, u = e, G.n = r, a;
            }
          };
        function d(r, n) {
          for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
            var o,
              i = p[t],
              d = G.p,
              l = i[2];
            r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
          }
          if (o || r > 1) return a;
          throw y = true, n;
        }
        return function (o, p, l) {
          if (f > 1) throw TypeError("Generator is already running");
          for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
            i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
            try {
              if (f = 2, i) {
                if (c || (o = "next"), t = i[o]) {
                  if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                  if (!t.done) return t;
                  u = t.value, c < 2 && (c = 0);
                } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
                i = e;
              } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
            } catch (t) {
              i = e, c = 1, u = t;
            } finally {
              f = 1;
            }
          }
          return {
            value: t,
            done: y
          };
        };
      }(r, o, i), true), u;
    }
    var a = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    t = Object.getPrototypeOf;
    var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
        return this;
      }), t),
      u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
    function f(e) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
      return this;
    }), _regeneratorDefine(u, "toString", function () {
      return "[object Generator]";
    }), (_regenerator = function () {
      return {
        w: i,
        m: f
      };
    })();
  }
  function _regeneratorDefine(e, r, n, t) {
    var i = Object.defineProperty;
    try {
      i({}, "", {});
    } catch (e) {
      i = 0;
    }
    _regeneratorDefine = function (e, r, n, t) {
      function o(r, n) {
        _regeneratorDefine(e, r, function (e) {
          return this._invoke(r, n, e);
        });
      }
      r ? i ? i(e, r, {
        value: n,
        enumerable: !t,
        configurable: !t,
        writable: !t
      }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
    }, _regeneratorDefine(e, r, n, t);
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _toConsumableArray(r) {
    return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var es_array_concat = {};

  var esnext_globalThis = {};

  var es_globalThis = {};

  var hasRequiredEs_globalThis;
  function requireEs_globalThis() {
    if (hasRequiredEs_globalThis) return es_globalThis;
    hasRequiredEs_globalThis = 1;
    var $ = require_export();
    var globalThis = requireGlobalThis();

    // `globalThis` object
    // https://tc39.es/ecma262/#sec-globalthis
    $({
      global: true,
      forced: globalThis.globalThis !== globalThis
    }, {
      globalThis: globalThis
    });
    return es_globalThis;
  }

  var hasRequiredEsnext_globalThis;
  function requireEsnext_globalThis() {
    if (hasRequiredEsnext_globalThis) return esnext_globalThis;
    hasRequiredEsnext_globalThis = 1;
    // TODO: Remove from `core-js@4`
    requireEs_globalThis();
    return esnext_globalThis;
  }

  requireEsnext_globalThis();

  var globalThis_1;
  var hasRequiredGlobalThis;
  function requireGlobalThis() {
    if (hasRequiredGlobalThis) return globalThis_1;
    hasRequiredGlobalThis = 1;
    var check = function check(it) {
      return it && it.Math === Math && it;
    };

    // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    globalThis_1 =
    // eslint-disable-next-line es/no-global-this -- safe
    check((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) == 'object' && globalThis) || check((typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' && window) ||
    // eslint-disable-next-line no-restricted-globals -- safe
    check((typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self) || check(_typeof(commonjsGlobal) == 'object' && commonjsGlobal) || check(_typeof(globalThis_1) == 'object' && globalThis_1) ||
    // eslint-disable-next-line no-new-func -- fallback
    function () {
      return this;
    }() || Function('return this')();
    return globalThis_1;
  }

  var es_object_getOwnPropertyDescriptor = {};

  var fails;
  var hasRequiredFails;
  function requireFails() {
    if (hasRequiredFails) return fails;
    hasRequiredFails = 1;
    fails = function fails(exec) {
      try {
        return !!exec();
      } catch (error) {
        return true;
      }
    };
    return fails;
  }

  var es_regexp_exec = {};

  var es_string_replace = {};

  var es_object_toString = {};

  var sharedStore = {exports: {}};

  var isPure;
  var hasRequiredIsPure;
  function requireIsPure() {
    if (hasRequiredIsPure) return isPure;
    hasRequiredIsPure = 1;
    isPure = false;
    return isPure;
  }

  var defineGlobalProperty;
  var hasRequiredDefineGlobalProperty;
  function requireDefineGlobalProperty() {
    if (hasRequiredDefineGlobalProperty) return defineGlobalProperty;
    hasRequiredDefineGlobalProperty = 1;
    var globalThis = requireGlobalThis();

    // eslint-disable-next-line es/no-object-defineproperty -- safe
    var defineProperty = Object.defineProperty;
    defineGlobalProperty = function defineGlobalProperty(key, value) {
      try {
        defineProperty(globalThis, key, {
          value: value,
          configurable: true,
          writable: true
        });
      } catch (error) {
        globalThis[key] = value;
      }
      return value;
    };
    return defineGlobalProperty;
  }

  var hasRequiredSharedStore;
  function requireSharedStore() {
    if (hasRequiredSharedStore) return sharedStore.exports;
    hasRequiredSharedStore = 1;
    var IS_PURE = requireIsPure();
    var globalThis = requireGlobalThis();
    var defineGlobalProperty = requireDefineGlobalProperty();
    var SHARED = '__core-js_shared__';
    var store = sharedStore.exports = globalThis[SHARED] || defineGlobalProperty(SHARED, {});
    (store.versions || (store.versions = [])).push({
      version: '3.45.1',
      mode: IS_PURE ? 'pure' : 'global',
      copyright: '© 2014-2025 Denis Pushkarev (zloirock.ru)',
      license: 'https://github.com/zloirock/core-js/blob/v3.45.1/LICENSE',
      source: 'https://github.com/zloirock/core-js'
    });
    return sharedStore.exports;
  }

  var shared;
  var hasRequiredShared;
  function requireShared() {
    if (hasRequiredShared) return shared;
    hasRequiredShared = 1;
    var store = requireSharedStore();
    shared = function shared(key, value) {
      return store[key] || (store[key] = value || {});
    };
    return shared;
  }

  var functionBindNative;
  var hasRequiredFunctionBindNative;
  function requireFunctionBindNative() {
    if (hasRequiredFunctionBindNative) return functionBindNative;
    hasRequiredFunctionBindNative = 1;
    var fails = requireFails();
    functionBindNative = !fails(function () {
      // eslint-disable-next-line es/no-function-prototype-bind -- safe
      var test = function () {/* empty */}.bind();
      // eslint-disable-next-line no-prototype-builtins -- safe
      return typeof test != 'function' || test.hasOwnProperty('prototype');
    });
    return functionBindNative;
  }

  var functionUncurryThis;
  var hasRequiredFunctionUncurryThis;
  function requireFunctionUncurryThis() {
    if (hasRequiredFunctionUncurryThis) return functionUncurryThis;
    hasRequiredFunctionUncurryThis = 1;
    var NATIVE_BIND = requireFunctionBindNative();
    var FunctionPrototype = Function.prototype;
    var call = FunctionPrototype.call;
    // eslint-disable-next-line es/no-function-prototype-bind -- safe
    var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);
    functionUncurryThis = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
      return function () {
        return call.apply(fn, arguments);
      };
    };
    return functionUncurryThis;
  }

  var isNullOrUndefined;
  var hasRequiredIsNullOrUndefined;
  function requireIsNullOrUndefined() {
    if (hasRequiredIsNullOrUndefined) return isNullOrUndefined;
    hasRequiredIsNullOrUndefined = 1;
    // we can't use just `it == null` since of `document.all` special case
    // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
    isNullOrUndefined = function isNullOrUndefined(it) {
      return it === null || it === undefined;
    };
    return isNullOrUndefined;
  }

  var requireObjectCoercible;
  var hasRequiredRequireObjectCoercible;
  function requireRequireObjectCoercible() {
    if (hasRequiredRequireObjectCoercible) return requireObjectCoercible;
    hasRequiredRequireObjectCoercible = 1;
    var isNullOrUndefined = requireIsNullOrUndefined();
    var $TypeError = TypeError;

    // `RequireObjectCoercible` abstract operation
    // https://tc39.es/ecma262/#sec-requireobjectcoercible
    requireObjectCoercible = function requireObjectCoercible(it) {
      if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
      return it;
    };
    return requireObjectCoercible;
  }

  var toObject;
  var hasRequiredToObject;
  function requireToObject() {
    if (hasRequiredToObject) return toObject;
    hasRequiredToObject = 1;
    var requireObjectCoercible = requireRequireObjectCoercible();
    var $Object = Object;

    // `ToObject` abstract operation
    // https://tc39.es/ecma262/#sec-toobject
    toObject = function toObject(argument) {
      return $Object(requireObjectCoercible(argument));
    };
    return toObject;
  }

  var hasOwnProperty_1;
  var hasRequiredHasOwnProperty;
  function requireHasOwnProperty() {
    if (hasRequiredHasOwnProperty) return hasOwnProperty_1;
    hasRequiredHasOwnProperty = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var toObject = requireToObject();
    var hasOwnProperty = uncurryThis({}.hasOwnProperty);

    // `HasOwnProperty` abstract operation
    // https://tc39.es/ecma262/#sec-hasownproperty
    // eslint-disable-next-line es/no-object-hasown -- safe
    hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
      return hasOwnProperty(toObject(it), key);
    };
    return hasOwnProperty_1;
  }

  var es_function_name = {};

  var descriptors;
  var hasRequiredDescriptors;
  function requireDescriptors() {
    if (hasRequiredDescriptors) return descriptors;
    hasRequiredDescriptors = 1;
    var fails = requireFails();

    // Detect IE8's incomplete defineProperty implementation
    descriptors = !fails(function () {
      // eslint-disable-next-line es/no-object-defineproperty -- required for testing
      return Object.defineProperty({}, 1, {
        get: function get() {
          return 7;
        }
      })[1] !== 7;
    });
    return descriptors;
  }

  var functionName;
  var hasRequiredFunctionName;
  function requireFunctionName() {
    if (hasRequiredFunctionName) return functionName;
    hasRequiredFunctionName = 1;
    var DESCRIPTORS = requireDescriptors();
    var hasOwn = requireHasOwnProperty();
    var FunctionPrototype = Function.prototype;
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;
    var EXISTS = hasOwn(FunctionPrototype, 'name');
    // additional protection from minified / mangled / dropped function names
    var PROPER = EXISTS && function something() {/* empty */}.name === 'something';
    var CONFIGURABLE = EXISTS && (!DESCRIPTORS || DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable);
    functionName = {
      EXISTS: EXISTS,
      PROPER: PROPER,
      CONFIGURABLE: CONFIGURABLE
    };
    return functionName;
  }

  var es_array_join = {};

  var arrayMethodIsStrict;
  var hasRequiredArrayMethodIsStrict;
  function requireArrayMethodIsStrict() {
    if (hasRequiredArrayMethodIsStrict) return arrayMethodIsStrict;
    hasRequiredArrayMethodIsStrict = 1;
    var fails = requireFails();
    arrayMethodIsStrict = function arrayMethodIsStrict(METHOD_NAME, argument) {
      var method = [][METHOD_NAME];
      return !!method && fails(function () {
        // eslint-disable-next-line no-useless-call -- required for testing
        method.call(null, argument || function () {
          return 1;
        }, 1);
      });
    };
    return arrayMethodIsStrict;
  }

  var hasRequiredEs_array_join;
  function requireEs_array_join() {
    if (hasRequiredEs_array_join) return es_array_join;
    hasRequiredEs_array_join = 1;
    var $ = require_export();
    var uncurryThis = requireFunctionUncurryThis();
    var IndexedObject = requireIndexedObject();
    var toIndexedObject = requireToIndexedObject();
    var arrayMethodIsStrict = requireArrayMethodIsStrict();
    var nativeJoin = uncurryThis([].join);
    var ES3_STRINGS = IndexedObject !== Object;
    var FORCED = ES3_STRINGS || !arrayMethodIsStrict('join', ',');

    // `Array.prototype.join` method
    // https://tc39.es/ecma262/#sec-array.prototype.join
    $({
      target: 'Array',
      proto: true,
      forced: FORCED
    }, {
      join: function join(separator) {
        return nativeJoin(toIndexedObject(this), separator === undefined ? ',' : separator);
      }
    });
    return es_array_join;
  }

  requireEs_array_join();

  var makeBuiltIn = {exports: {}};

  var isCallable;
  var hasRequiredIsCallable;
  function requireIsCallable() {
    if (hasRequiredIsCallable) return isCallable;
    hasRequiredIsCallable = 1;
    // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
    var documentAll = (typeof document === "undefined" ? "undefined" : _typeof(document)) == 'object' && document.all;

    // `IsCallable` abstract operation
    // https://tc39.es/ecma262/#sec-iscallable
    // eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
    isCallable = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
      return typeof argument == 'function' || argument === documentAll;
    } : function (argument) {
      return typeof argument == 'function';
    };
    return isCallable;
  }

  var inspectSource;
  var hasRequiredInspectSource;
  function requireInspectSource() {
    if (hasRequiredInspectSource) return inspectSource;
    hasRequiredInspectSource = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var isCallable = requireIsCallable();
    var store = requireSharedStore();
    var functionToString = uncurryThis(Function.toString);

    // this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
    if (!isCallable(store.inspectSource)) {
      store.inspectSource = function (it) {
        return functionToString(it);
      };
    }
    inspectSource = store.inspectSource;
    return inspectSource;
  }

  var weakMapBasicDetection;
  var hasRequiredWeakMapBasicDetection;
  function requireWeakMapBasicDetection() {
    if (hasRequiredWeakMapBasicDetection) return weakMapBasicDetection;
    hasRequiredWeakMapBasicDetection = 1;
    var globalThis = requireGlobalThis();
    var isCallable = requireIsCallable();
    var WeakMap = globalThis.WeakMap;
    weakMapBasicDetection = isCallable(WeakMap) && /native code/.test(String(WeakMap));
    return weakMapBasicDetection;
  }

  var isObject;
  var hasRequiredIsObject;
  function requireIsObject() {
    if (hasRequiredIsObject) return isObject;
    hasRequiredIsObject = 1;
    var isCallable = requireIsCallable();
    isObject = function isObject(it) {
      return _typeof(it) == 'object' ? it !== null : isCallable(it);
    };
    return isObject;
  }

  var objectDefineProperty = {};

  var documentCreateElement;
  var hasRequiredDocumentCreateElement;
  function requireDocumentCreateElement() {
    if (hasRequiredDocumentCreateElement) return documentCreateElement;
    hasRequiredDocumentCreateElement = 1;
    var globalThis = requireGlobalThis();
    var isObject = requireIsObject();
    var document = globalThis.document;
    // typeof document.createElement is 'object' in old IE
    var EXISTS = isObject(document) && isObject(document.createElement);
    documentCreateElement = function documentCreateElement(it) {
      return EXISTS ? document.createElement(it) : {};
    };
    return documentCreateElement;
  }

  var ie8DomDefine;
  var hasRequiredIe8DomDefine;
  function requireIe8DomDefine() {
    if (hasRequiredIe8DomDefine) return ie8DomDefine;
    hasRequiredIe8DomDefine = 1;
    var DESCRIPTORS = requireDescriptors();
    var fails = requireFails();
    var createElement = requireDocumentCreateElement();

    // Thanks to IE8 for its funny defineProperty
    ie8DomDefine = !DESCRIPTORS && !fails(function () {
      // eslint-disable-next-line es/no-object-defineproperty -- required for testing
      return Object.defineProperty(createElement('div'), 'a', {
        get: function get() {
          return 7;
        }
      }).a !== 7;
    });
    return ie8DomDefine;
  }

  var v8PrototypeDefineBug;
  var hasRequiredV8PrototypeDefineBug;
  function requireV8PrototypeDefineBug() {
    if (hasRequiredV8PrototypeDefineBug) return v8PrototypeDefineBug;
    hasRequiredV8PrototypeDefineBug = 1;
    var DESCRIPTORS = requireDescriptors();
    var fails = requireFails();

    // V8 ~ Chrome 36-
    // https://bugs.chromium.org/p/v8/issues/detail?id=3334
    v8PrototypeDefineBug = DESCRIPTORS && fails(function () {
      // eslint-disable-next-line es/no-object-defineproperty -- required for testing
      return Object.defineProperty(function () {/* empty */}, 'prototype', {
        value: 42,
        writable: false
      }).prototype !== 42;
    });
    return v8PrototypeDefineBug;
  }

  var anObject;
  var hasRequiredAnObject;
  function requireAnObject() {
    if (hasRequiredAnObject) return anObject;
    hasRequiredAnObject = 1;
    var isObject = requireIsObject();
    var $String = String;
    var $TypeError = TypeError;

    // `Assert: Type(argument) is Object`
    anObject = function anObject(argument) {
      if (isObject(argument)) return argument;
      throw new $TypeError($String(argument) + ' is not an object');
    };
    return anObject;
  }

  var functionCall;
  var hasRequiredFunctionCall;
  function requireFunctionCall() {
    if (hasRequiredFunctionCall) return functionCall;
    hasRequiredFunctionCall = 1;
    var NATIVE_BIND = requireFunctionBindNative();
    var call = Function.prototype.call;
    // eslint-disable-next-line es/no-function-prototype-bind -- safe
    functionCall = NATIVE_BIND ? call.bind(call) : function () {
      return call.apply(call, arguments);
    };
    return functionCall;
  }

  var getBuiltIn;
  var hasRequiredGetBuiltIn;
  function requireGetBuiltIn() {
    if (hasRequiredGetBuiltIn) return getBuiltIn;
    hasRequiredGetBuiltIn = 1;
    var globalThis = requireGlobalThis();
    var isCallable = requireIsCallable();
    var aFunction = function aFunction(argument) {
      return isCallable(argument) ? argument : undefined;
    };
    getBuiltIn = function getBuiltIn(namespace, method) {
      return arguments.length < 2 ? aFunction(globalThis[namespace]) : globalThis[namespace] && globalThis[namespace][method];
    };
    return getBuiltIn;
  }

  var objectIsPrototypeOf;
  var hasRequiredObjectIsPrototypeOf;
  function requireObjectIsPrototypeOf() {
    if (hasRequiredObjectIsPrototypeOf) return objectIsPrototypeOf;
    hasRequiredObjectIsPrototypeOf = 1;
    var uncurryThis = requireFunctionUncurryThis();
    objectIsPrototypeOf = uncurryThis({}.isPrototypeOf);
    return objectIsPrototypeOf;
  }

  var es_symbol = {};

  var es_symbol_description = {};

  var classofRaw;
  var hasRequiredClassofRaw;
  function requireClassofRaw() {
    if (hasRequiredClassofRaw) return classofRaw;
    hasRequiredClassofRaw = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var toString = uncurryThis({}.toString);
    var stringSlice = uncurryThis(''.slice);
    classofRaw = function classofRaw(it) {
      return stringSlice(toString(it), 8, -1);
    };
    return classofRaw;
  }

  var classof;
  var hasRequiredClassof;
  function requireClassof() {
    if (hasRequiredClassof) return classof;
    hasRequiredClassof = 1;
    var TO_STRING_TAG_SUPPORT = requireToStringTagSupport();
    var isCallable = requireIsCallable();
    var classofRaw = requireClassofRaw();
    var wellKnownSymbol = requireWellKnownSymbol();
    var TO_STRING_TAG = wellKnownSymbol('toStringTag');
    var $Object = Object;

    // ES3 wrong here
    var CORRECT_ARGUMENTS = classofRaw(function () {
      return arguments;
    }()) === 'Arguments';

    // fallback for IE11 Script Access Denied error
    var tryGet = function tryGet(it, key) {
      try {
        return it[key];
      } catch (error) {/* empty */}
    };

    // getting tag from ES6+ `Object.prototype.toString`
    classof = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
      var O, tag, result;
      return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
      // builtinTag case
      : CORRECT_ARGUMENTS ? classofRaw(O)
      // ES3 arguments fallback
      : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
    };
    return classof;
  }

  var toString;
  var hasRequiredToString;
  function requireToString() {
    if (hasRequiredToString) return toString;
    hasRequiredToString = 1;
    var classof = requireClassof();
    var $String = String;
    toString = function toString(argument) {
      if (classof(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
      return $String(argument);
    };
    return toString;
  }

  var es_object_getOwnPropertyNames = {};

  var objectGetOwnPropertyNamesExternal = {};

  var es_array_slice = {};

  var isArray;
  var hasRequiredIsArray;
  function requireIsArray() {
    if (hasRequiredIsArray) return isArray;
    hasRequiredIsArray = 1;
    var classof = requireClassofRaw();

    // `IsArray` abstract operation
    // https://tc39.es/ecma262/#sec-isarray
    // eslint-disable-next-line es/no-array-isarray -- safe
    isArray = Array.isArray || function isArray(argument) {
      return classof(argument) === 'Array';
    };
    return isArray;
  }

  var isConstructor;
  var hasRequiredIsConstructor;
  function requireIsConstructor() {
    if (hasRequiredIsConstructor) return isConstructor;
    hasRequiredIsConstructor = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var fails = requireFails();
    var isCallable = requireIsCallable();
    var classof = requireClassof();
    var getBuiltIn = requireGetBuiltIn();
    var inspectSource = requireInspectSource();
    var noop = function noop() {/* empty */};
    var construct = getBuiltIn('Reflect', 'construct');
    var constructorRegExp = /^\s*(?:class|function)\b/;
    var exec = uncurryThis(constructorRegExp.exec);
    var INCORRECT_TO_STRING = !constructorRegExp.test(noop);
    var isConstructorModern = function isConstructor(argument) {
      if (!isCallable(argument)) return false;
      try {
        construct(noop, [], argument);
        return true;
      } catch (error) {
        return false;
      }
    };
    var isConstructorLegacy = function isConstructor(argument) {
      if (!isCallable(argument)) return false;
      switch (classof(argument)) {
        case 'AsyncFunction':
        case 'GeneratorFunction':
        case 'AsyncGeneratorFunction':
          return false;
      }
      try {
        // we can't check .prototype since constructors produced by .bind haven't it
        // `Function#toString` throws on some built-it function in some legacy engines
        // (for example, `DOMQuad` and similar in FF41-)
        return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
      } catch (error) {
        return true;
      }
    };
    isConstructorLegacy.sham = true;

    // `IsConstructor` abstract operation
    // https://tc39.es/ecma262/#sec-isconstructor
    isConstructor = !construct || fails(function () {
      var called;
      return isConstructorModern(isConstructorModern.call) || !isConstructorModern(Object) || !isConstructorModern(function () {
        called = true;
      }) || called;
    }) ? isConstructorLegacy : isConstructorModern;
    return isConstructor;
  }

  var es_math_trunc = {};

  var hasRequiredEs_math_trunc;
  function requireEs_math_trunc() {
    if (hasRequiredEs_math_trunc) return es_math_trunc;
    hasRequiredEs_math_trunc = 1;
    var $ = require_export();
    var trunc = requireMathTrunc();

    // `Math.trunc` method
    // https://tc39.es/ecma262/#sec-math.trunc
    $({
      target: 'Math',
      stat: true
    }, {
      trunc: trunc
    });
    return es_math_trunc;
  }

  requireEs_math_trunc();

  var mathTrunc;
  var hasRequiredMathTrunc;
  function requireMathTrunc() {
    if (hasRequiredMathTrunc) return mathTrunc;
    hasRequiredMathTrunc = 1;
    var ceil = Math.ceil;
    var floor = Math.floor;

    // `Math.trunc` method
    // https://tc39.es/ecma262/#sec-math.trunc
    // eslint-disable-next-line es/no-math-trunc -- safe
    mathTrunc = Math.trunc || function trunc(x) {
      var n = +x;
      return (n > 0 ? floor : ceil)(n);
    };
    return mathTrunc;
  }

  var toIntegerOrInfinity;
  var hasRequiredToIntegerOrInfinity;
  function requireToIntegerOrInfinity() {
    if (hasRequiredToIntegerOrInfinity) return toIntegerOrInfinity;
    hasRequiredToIntegerOrInfinity = 1;
    var trunc = requireMathTrunc();

    // `ToIntegerOrInfinity` abstract operation
    // https://tc39.es/ecma262/#sec-tointegerorinfinity
    toIntegerOrInfinity = function toIntegerOrInfinity(argument) {
      var number = +argument;
      // eslint-disable-next-line no-self-compare -- NaN check
      return number !== number || number === 0 ? 0 : trunc(number);
    };
    return toIntegerOrInfinity;
  }

  var toAbsoluteIndex;
  var hasRequiredToAbsoluteIndex;
  function requireToAbsoluteIndex() {
    if (hasRequiredToAbsoluteIndex) return toAbsoluteIndex;
    hasRequiredToAbsoluteIndex = 1;
    var toIntegerOrInfinity = requireToIntegerOrInfinity();
    var max = Math.max;
    var min = Math.min;

    // Helper for a popular repeating case of the spec:
    // Let integer be ? ToInteger(index).
    // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
    toAbsoluteIndex = function toAbsoluteIndex(index, length) {
      var integer = toIntegerOrInfinity(index);
      return integer < 0 ? max(integer + length, 0) : min(integer, length);
    };
    return toAbsoluteIndex;
  }

  var toLength;
  var hasRequiredToLength;
  function requireToLength() {
    if (hasRequiredToLength) return toLength;
    hasRequiredToLength = 1;
    var toIntegerOrInfinity = requireToIntegerOrInfinity();
    var min = Math.min;

    // `ToLength` abstract operation
    // https://tc39.es/ecma262/#sec-tolength
    toLength = function toLength(argument) {
      var len = toIntegerOrInfinity(argument);
      return len > 0 ? min(len, 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
    };
    return toLength;
  }

  var lengthOfArrayLike;
  var hasRequiredLengthOfArrayLike;
  function requireLengthOfArrayLike() {
    if (hasRequiredLengthOfArrayLike) return lengthOfArrayLike;
    hasRequiredLengthOfArrayLike = 1;
    var toLength = requireToLength();

    // `LengthOfArrayLike` abstract operation
    // https://tc39.es/ecma262/#sec-lengthofarraylike
    lengthOfArrayLike = function lengthOfArrayLike(obj) {
      return toLength(obj.length);
    };
    return lengthOfArrayLike;
  }

  var createPropertyDescriptor;
  var hasRequiredCreatePropertyDescriptor;
  function requireCreatePropertyDescriptor() {
    if (hasRequiredCreatePropertyDescriptor) return createPropertyDescriptor;
    hasRequiredCreatePropertyDescriptor = 1;
    createPropertyDescriptor = function createPropertyDescriptor(bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value: value
      };
    };
    return createPropertyDescriptor;
  }

  var createProperty;
  var hasRequiredCreateProperty;
  function requireCreateProperty() {
    if (hasRequiredCreateProperty) return createProperty;
    hasRequiredCreateProperty = 1;
    var DESCRIPTORS = requireDescriptors();
    var definePropertyModule = requireObjectDefineProperty();
    var createPropertyDescriptor = requireCreatePropertyDescriptor();
    createProperty = function createProperty(object, key, value) {
      if (DESCRIPTORS) definePropertyModule.f(object, key, createPropertyDescriptor(0, value));else object[key] = value;
    };
    return createProperty;
  }

  var es_string_match = {};

  var es_regexp_flags = {};

  var regexpFlagsDetection;
  var hasRequiredRegexpFlagsDetection;
  function requireRegexpFlagsDetection() {
    if (hasRequiredRegexpFlagsDetection) return regexpFlagsDetection;
    hasRequiredRegexpFlagsDetection = 1;
    var globalThis = requireGlobalThis();
    var fails = requireFails();

    // babel-minify and Closure Compiler transpiles RegExp('.', 'd') -> /./d and it causes SyntaxError
    var RegExp = globalThis.RegExp;
    var FLAGS_GETTER_IS_CORRECT = !fails(function () {
      var INDICES_SUPPORT = true;
      try {
        RegExp('.', 'd');
      } catch (error) {
        INDICES_SUPPORT = false;
      }
      var O = {};
      // modern V8 bug
      var calls = '';
      var expected = INDICES_SUPPORT ? 'dgimsy' : 'gimsy';
      var addGetter = function addGetter(key, chr) {
        // eslint-disable-next-line es/no-object-defineproperty -- safe
        Object.defineProperty(O, key, {
          get: function get() {
            calls += chr;
            return true;
          }
        });
      };
      var pairs = {
        dotAll: 's',
        global: 'g',
        ignoreCase: 'i',
        multiline: 'm',
        sticky: 'y'
      };
      if (INDICES_SUPPORT) pairs.hasIndices = 'd';
      for (var key in pairs) addGetter(key, pairs[key]);

      // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
      var result = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get.call(O);
      return result !== expected || calls !== expected;
    });
    regexpFlagsDetection = {
      correct: FLAGS_GETTER_IS_CORRECT
    };
    return regexpFlagsDetection;
  }

  var regexpFlags;
  var hasRequiredRegexpFlags;
  function requireRegexpFlags() {
    if (hasRequiredRegexpFlags) return regexpFlags;
    hasRequiredRegexpFlags = 1;
    var anObject = requireAnObject();

    // `RegExp.prototype.flags` getter implementation
    // https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
    regexpFlags = function regexpFlags() {
      var that = anObject(this);
      var result = '';
      if (that.hasIndices) result += 'd';
      if (that.global) result += 'g';
      if (that.ignoreCase) result += 'i';
      if (that.multiline) result += 'm';
      if (that.dotAll) result += 's';
      if (that.unicode) result += 'u';
      if (that.unicodeSets) result += 'v';
      if (that.sticky) result += 'y';
      return result;
    };
    return regexpFlags;
  }

  var hasRequiredEs_regexp_flags;
  function requireEs_regexp_flags() {
    if (hasRequiredEs_regexp_flags) return es_regexp_flags;
    hasRequiredEs_regexp_flags = 1;
    var DESCRIPTORS = requireDescriptors();
    var defineBuiltInAccessor = requireDefineBuiltInAccessor();
    var regExpFlagsDetection = requireRegexpFlagsDetection();
    var regExpFlagsGetterImplementation = requireRegexpFlags();

    // `RegExp.prototype.flags` getter
    // https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
    if (DESCRIPTORS && !regExpFlagsDetection.correct) {
      defineBuiltInAccessor(RegExp.prototype, 'flags', {
        configurable: true,
        get: regExpFlagsGetterImplementation
      });
      regExpFlagsDetection.correct = true;
    }
    return es_regexp_flags;
  }

  requireEs_regexp_flags();

  var defineBuiltIn;
  var hasRequiredDefineBuiltIn;
  function requireDefineBuiltIn() {
    if (hasRequiredDefineBuiltIn) return defineBuiltIn;
    hasRequiredDefineBuiltIn = 1;
    var isCallable = requireIsCallable();
    var definePropertyModule = requireObjectDefineProperty();
    var makeBuiltIn = requireMakeBuiltIn();
    var defineGlobalProperty = requireDefineGlobalProperty();
    defineBuiltIn = function defineBuiltIn(O, key, value, options) {
      if (!options) options = {};
      var simple = options.enumerable;
      var name = options.name !== undefined ? options.name : key;
      if (isCallable(value)) makeBuiltIn(value, name, options);
      if (options.global) {
        if (simple) O[key] = value;else defineGlobalProperty(key, value);
      } else {
        try {
          if (!options.unsafe) delete O[key];else if (O[key]) simple = true;
        } catch (error) {/* empty */}
        if (simple) O[key] = value;else definePropertyModule.f(O, key, {
          value: value,
          enumerable: false,
          configurable: !options.nonConfigurable,
          writable: !options.nonWritable
        });
      }
      return O;
    };
    return defineBuiltIn;
  }

  var fixRegexpWellKnownSymbolLogic;
  var hasRequiredFixRegexpWellKnownSymbolLogic;
  function requireFixRegexpWellKnownSymbolLogic() {
    if (hasRequiredFixRegexpWellKnownSymbolLogic) return fixRegexpWellKnownSymbolLogic;
    hasRequiredFixRegexpWellKnownSymbolLogic = 1;
    // TODO: Remove from `core-js@4` since it's moved to entry points
    requireEs_regexp_exec();
    var call = requireFunctionCall();
    var defineBuiltIn = requireDefineBuiltIn();
    var regexpExec = requireRegexpExec();
    var fails = requireFails();
    var wellKnownSymbol = requireWellKnownSymbol();
    var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
    var SPECIES = wellKnownSymbol('species');
    var RegExpPrototype = RegExp.prototype;
    fixRegexpWellKnownSymbolLogic = function fixRegexpWellKnownSymbolLogic(KEY, exec, FORCED, SHAM) {
      var SYMBOL = wellKnownSymbol(KEY);
      var DELEGATES_TO_SYMBOL = !fails(function () {
        // String methods call symbol-named RegExp methods
        var O = {};
        O[SYMBOL] = function () {
          return 7;
        };
        return ''[KEY](O) !== 7;
      });
      var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
        // Symbol-named RegExp methods call .exec
        var execCalled = false;
        var re = /a/;
        if (KEY === 'split') {
          // We can't use real regex here since it causes deoptimization
          // and serious performance degradation in V8
          // https://github.com/zloirock/core-js/issues/306
          re = {};
          // RegExp[@@split] doesn't call the regex's exec method, but first creates
          // a new one. We need to return the patched regex when creating the new one.
          re.constructor = {};
          re.constructor[SPECIES] = function () {
            return re;
          };
          re.flags = '';
          re[SYMBOL] = /./[SYMBOL];
        }
        re.exec = function () {
          execCalled = true;
          return null;
        };
        re[SYMBOL]('');
        return !execCalled;
      });
      if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || FORCED) {
        var nativeRegExpMethod = /./[SYMBOL];
        var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
          var $exec = regexp.exec;
          if ($exec === regexpExec || $exec === RegExpPrototype.exec) {
            if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
              // The native String method already delegates to @@method (this
              // polyfilled function), leasing to infinite recursion.
              // We avoid it by directly calling the native @@method method.
              return {
                done: true,
                value: call(nativeRegExpMethod, regexp, str, arg2)
              };
            }
            return {
              done: true,
              value: call(nativeMethod, str, regexp, arg2)
            };
          }
          return {
            done: false
          };
        });
        defineBuiltIn(String.prototype, KEY, methods[0]);
        defineBuiltIn(RegExpPrototype, SYMBOL, methods[1]);
      }
      if (SHAM) createNonEnumerableProperty(RegExpPrototype[SYMBOL], 'sham', true);
    };
    return fixRegexpWellKnownSymbolLogic;
  }

  var tryToString;
  var hasRequiredTryToString;
  function requireTryToString() {
    if (hasRequiredTryToString) return tryToString;
    hasRequiredTryToString = 1;
    var $String = String;
    tryToString = function tryToString(argument) {
      try {
        return $String(argument);
      } catch (error) {
        return 'Object';
      }
    };
    return tryToString;
  }

  var aCallable;
  var hasRequiredACallable;
  function requireACallable() {
    if (hasRequiredACallable) return aCallable;
    hasRequiredACallable = 1;
    var isCallable = requireIsCallable();
    var tryToString = requireTryToString();
    var $TypeError = TypeError;

    // `Assert: IsCallable(argument) is true`
    aCallable = function aCallable(argument) {
      if (isCallable(argument)) return argument;
      throw new $TypeError(tryToString(argument) + ' is not a function');
    };
    return aCallable;
  }

  var getMethod;
  var hasRequiredGetMethod;
  function requireGetMethod() {
    if (hasRequiredGetMethod) return getMethod;
    hasRequiredGetMethod = 1;
    var aCallable = requireACallable();
    var isNullOrUndefined = requireIsNullOrUndefined();

    // `GetMethod` abstract operation
    // https://tc39.es/ecma262/#sec-getmethod
    getMethod = function getMethod(V, P) {
      var func = V[P];
      return isNullOrUndefined(func) ? undefined : aCallable(func);
    };
    return getMethod;
  }

  var stringMultibyte;
  var hasRequiredStringMultibyte;
  function requireStringMultibyte() {
    if (hasRequiredStringMultibyte) return stringMultibyte;
    hasRequiredStringMultibyte = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var toIntegerOrInfinity = requireToIntegerOrInfinity();
    var toString = requireToString();
    var requireObjectCoercible = requireRequireObjectCoercible();
    var charAt = uncurryThis(''.charAt);
    var charCodeAt = uncurryThis(''.charCodeAt);
    var stringSlice = uncurryThis(''.slice);
    var createMethod = function createMethod(CONVERT_TO_STRING) {
      return function ($this, pos) {
        var S = toString(requireObjectCoercible($this));
        var position = toIntegerOrInfinity(pos);
        var size = S.length;
        var first, second;
        if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
        first = charCodeAt(S, position);
        return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? charAt(S, position) : first : CONVERT_TO_STRING ? stringSlice(S, position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
      };
    };
    stringMultibyte = {
      // `String.prototype.codePointAt` method
      // https://tc39.es/ecma262/#sec-string.prototype.codepointat
      codeAt: createMethod(false),
      // `String.prototype.at` method
      // https://github.com/mathiasbynens/String.prototype.at
      charAt: createMethod(true)
    };
    return stringMultibyte;
  }

  var advanceStringIndex;
  var hasRequiredAdvanceStringIndex;
  function requireAdvanceStringIndex() {
    if (hasRequiredAdvanceStringIndex) return advanceStringIndex;
    hasRequiredAdvanceStringIndex = 1;
    var charAt = requireStringMultibyte().charAt;

    // `AdvanceStringIndex` abstract operation
    // https://tc39.es/ecma262/#sec-advancestringindex
    advanceStringIndex = function advanceStringIndex(S, index, unicode) {
      return index + (unicode ? charAt(S, index).length : 1);
    };
    return advanceStringIndex;
  }

  var regexpGetFlags;
  var hasRequiredRegexpGetFlags;
  function requireRegexpGetFlags() {
    if (hasRequiredRegexpGetFlags) return regexpGetFlags;
    hasRequiredRegexpGetFlags = 1;
    var call = requireFunctionCall();
    var hasOwn = requireHasOwnProperty();
    var isPrototypeOf = requireObjectIsPrototypeOf();
    var regExpFlagsDetection = requireRegexpFlagsDetection();
    var regExpFlagsGetterImplementation = requireRegexpFlags();
    var RegExpPrototype = RegExp.prototype;
    regexpGetFlags = regExpFlagsDetection.correct ? function (it) {
      return it.flags;
    } : function (it) {
      return !regExpFlagsDetection.correct && isPrototypeOf(RegExpPrototype, it) && !hasOwn(it, 'flags') ? call(regExpFlagsGetterImplementation, it) : it.flags;
    };
    return regexpGetFlags;
  }

  var regexpExecAbstract;
  var hasRequiredRegexpExecAbstract;
  function requireRegexpExecAbstract() {
    if (hasRequiredRegexpExecAbstract) return regexpExecAbstract;
    hasRequiredRegexpExecAbstract = 1;
    var call = requireFunctionCall();
    var anObject = requireAnObject();
    var isCallable = requireIsCallable();
    var classof = requireClassofRaw();
    var regexpExec = requireRegexpExec();
    var $TypeError = TypeError;

    // `RegExpExec` abstract operation
    // https://tc39.es/ecma262/#sec-regexpexec
    regexpExecAbstract = function regexpExecAbstract(R, S) {
      var exec = R.exec;
      if (isCallable(exec)) {
        var result = call(exec, R, S);
        if (result !== null) anObject(result);
        return result;
      }
      if (classof(R) === 'RegExp') return call(regexpExec, R, S);
      throw new $TypeError('RegExp#exec called on incompatible receiver');
    };
    return regexpExecAbstract;
  }

  var hasRequiredEs_string_match;
  function requireEs_string_match() {
    if (hasRequiredEs_string_match) return es_string_match;
    hasRequiredEs_string_match = 1;
    var call = requireFunctionCall();
    var uncurryThis = requireFunctionUncurryThis();
    var fixRegExpWellKnownSymbolLogic = requireFixRegexpWellKnownSymbolLogic();
    var anObject = requireAnObject();
    var isObject = requireIsObject();
    var toLength = requireToLength();
    var toString = requireToString();
    var requireObjectCoercible = requireRequireObjectCoercible();
    var getMethod = requireGetMethod();
    var advanceStringIndex = requireAdvanceStringIndex();
    var getRegExpFlags = requireRegexpGetFlags();
    var regExpExec = requireRegexpExecAbstract();
    var stringIndexOf = uncurryThis(''.indexOf);

    // @@match logic
    fixRegExpWellKnownSymbolLogic('match', function (MATCH, nativeMatch, maybeCallNative) {
      return [
      // `String.prototype.match` method
      // https://tc39.es/ecma262/#sec-string.prototype.match
      function match(regexp) {
        var O = requireObjectCoercible(this);
        var matcher = isObject(regexp) ? getMethod(regexp, MATCH) : undefined;
        return matcher ? call(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString(O));
      },
      // `RegExp.prototype[@@match]` method
      // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
      function (string) {
        var rx = anObject(this);
        var S = toString(string);
        var res = maybeCallNative(nativeMatch, rx, S);
        if (res.done) return res.value;
        var flags = toString(getRegExpFlags(rx));
        if (stringIndexOf(flags, 'g') === -1) return regExpExec(rx, S);
        var fullUnicode = stringIndexOf(flags, 'u') !== -1;
        rx.lastIndex = 0;
        var A = [];
        var n = 0;
        var result;
        while ((result = regExpExec(rx, S)) !== null) {
          var matchStr = toString(result[0]);
          A[n] = matchStr;
          if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
          n++;
        }
        return n === 0 ? null : A;
      }];
    });
    return es_string_match;
  }

  requireEs_string_match();

  var environmentUserAgent;
  var hasRequiredEnvironmentUserAgent;
  function requireEnvironmentUserAgent() {
    if (hasRequiredEnvironmentUserAgent) return environmentUserAgent;
    hasRequiredEnvironmentUserAgent = 1;
    var globalThis = requireGlobalThis();
    var navigator = globalThis.navigator;
    var userAgent = navigator && navigator.userAgent;
    environmentUserAgent = userAgent ? String(userAgent) : '';
    return environmentUserAgent;
  }

  var environmentV8Version;
  var hasRequiredEnvironmentV8Version;
  function requireEnvironmentV8Version() {
    if (hasRequiredEnvironmentV8Version) return environmentV8Version;
    hasRequiredEnvironmentV8Version = 1;
    var globalThis = requireGlobalThis();
    var userAgent = requireEnvironmentUserAgent();
    var process = globalThis.process;
    var Deno = globalThis.Deno;
    var versions = process && process.versions || Deno && Deno.version;
    var v8 = versions && versions.v8;
    var match, version;
    if (v8) {
      match = v8.split('.');
      // in old Chrome, versions of V8 isn't V8 = Chrome / 10
      // but their correct versions are not interesting for us
      version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
    }

    // BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
    // so check `userAgent` even if `.v8` exists, but 0
    if (!version && userAgent) {
      match = userAgent.match(/Edge\/(\d+)/);
      if (!match || match[1] >= 74) {
        match = userAgent.match(/Chrome\/(\d+)/);
        if (match) version = +match[1];
      }
    }
    environmentV8Version = version;
    return environmentV8Version;
  }

  var arrayMethodHasSpeciesSupport;
  var hasRequiredArrayMethodHasSpeciesSupport;
  function requireArrayMethodHasSpeciesSupport() {
    if (hasRequiredArrayMethodHasSpeciesSupport) return arrayMethodHasSpeciesSupport;
    hasRequiredArrayMethodHasSpeciesSupport = 1;
    var fails = requireFails();
    var wellKnownSymbol = requireWellKnownSymbol();
    var V8_VERSION = requireEnvironmentV8Version();
    var SPECIES = wellKnownSymbol('species');
    arrayMethodHasSpeciesSupport = function arrayMethodHasSpeciesSupport(METHOD_NAME) {
      // We can't use this feature detection in V8 since it causes
      // deoptimization and serious performance degradation
      // https://github.com/zloirock/core-js/issues/677
      return V8_VERSION >= 51 || !fails(function () {
        var array = [];
        var constructor = array.constructor = {};
        constructor[SPECIES] = function () {
          return {
            foo: 1
          };
        };
        return array[METHOD_NAME](Boolean).foo !== 1;
      });
    };
    return arrayMethodHasSpeciesSupport;
  }

  var hasRequiredEs_array_slice;
  function requireEs_array_slice() {
    if (hasRequiredEs_array_slice) return es_array_slice;
    hasRequiredEs_array_slice = 1;
    var $ = require_export();
    var isArray = requireIsArray();
    var isConstructor = requireIsConstructor();
    var isObject = requireIsObject();
    var toAbsoluteIndex = requireToAbsoluteIndex();
    var lengthOfArrayLike = requireLengthOfArrayLike();
    var toIndexedObject = requireToIndexedObject();
    var createProperty = requireCreateProperty();
    var wellKnownSymbol = requireWellKnownSymbol();
    var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();
    var nativeSlice = requireArraySlice();
    var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');
    var SPECIES = wellKnownSymbol('species');
    var $Array = Array;
    var max = Math.max;

    // `Array.prototype.slice` method
    // https://tc39.es/ecma262/#sec-array.prototype.slice
    // fallback for not array-like ES3 strings and DOM objects
    $({
      target: 'Array',
      proto: true,
      forced: !HAS_SPECIES_SUPPORT
    }, {
      slice: function slice(start, end) {
        var O = toIndexedObject(this);
        var length = lengthOfArrayLike(O);
        var k = toAbsoluteIndex(start, length);
        var fin = toAbsoluteIndex(end === undefined ? length : end, length);
        // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
        var Constructor, result, n;
        if (isArray(O)) {
          Constructor = O.constructor;
          // cross-realm fallback
          if (isConstructor(Constructor) && (Constructor === $Array || isArray(Constructor.prototype))) {
            Constructor = undefined;
          } else if (isObject(Constructor)) {
            Constructor = Constructor[SPECIES];
            if (Constructor === null) Constructor = undefined;
          }
          if (Constructor === $Array || Constructor === undefined) {
            return nativeSlice(O, k, fin);
          }
        }
        result = new (Constructor === undefined ? $Array : Constructor)(max(fin - k, 0));
        for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
        result.length = n;
        return result;
      }
    });
    return es_array_slice;
  }

  requireEs_array_slice();

  var arraySlice;
  var hasRequiredArraySlice;
  function requireArraySlice() {
    if (hasRequiredArraySlice) return arraySlice;
    hasRequiredArraySlice = 1;
    var uncurryThis = requireFunctionUncurryThis();
    arraySlice = uncurryThis([].slice);
    return arraySlice;
  }

  var hasRequiredObjectGetOwnPropertyNamesExternal;
  function requireObjectGetOwnPropertyNamesExternal() {
    if (hasRequiredObjectGetOwnPropertyNamesExternal) return objectGetOwnPropertyNamesExternal;
    hasRequiredObjectGetOwnPropertyNamesExternal = 1;
    /* eslint-disable es/no-object-getownpropertynames -- safe */
    var classof = requireClassofRaw();
    var toIndexedObject = requireToIndexedObject();
    var $getOwnPropertyNames = requireObjectGetOwnPropertyNames().f;
    var arraySlice = requireArraySlice();
    var windowNames = (typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
    var getWindowNames = function getWindowNames(it) {
      try {
        return $getOwnPropertyNames(it);
      } catch (error) {
        return arraySlice(windowNames);
      }
    };

    // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
    objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
      return windowNames && classof(it) === 'Window' ? getWindowNames(it) : $getOwnPropertyNames(toIndexedObject(it));
    };
    return objectGetOwnPropertyNamesExternal;
  }

  var hasRequiredEs_object_getOwnPropertyNames;
  function requireEs_object_getOwnPropertyNames() {
    if (hasRequiredEs_object_getOwnPropertyNames) return es_object_getOwnPropertyNames;
    hasRequiredEs_object_getOwnPropertyNames = 1;
    var $ = require_export();
    var fails = requireFails();
    var getOwnPropertyNames = requireObjectGetOwnPropertyNamesExternal().f;

    // eslint-disable-next-line es/no-object-getownpropertynames -- required for testing
    var FAILS_ON_PRIMITIVES = fails(function () {
      return !Object.getOwnPropertyNames(1);
    });

    // `Object.getOwnPropertyNames` method
    // https://tc39.es/ecma262/#sec-object.getownpropertynames
    $({
      target: 'Object',
      stat: true,
      forced: FAILS_ON_PRIMITIVES
    }, {
      getOwnPropertyNames: getOwnPropertyNames
    });
    return es_object_getOwnPropertyNames;
  }

  requireEs_object_getOwnPropertyNames();

  var objectGetOwnPropertyNames = {};

  var arrayIncludes;
  var hasRequiredArrayIncludes;
  function requireArrayIncludes() {
    if (hasRequiredArrayIncludes) return arrayIncludes;
    hasRequiredArrayIncludes = 1;
    var toIndexedObject = requireToIndexedObject();
    var toAbsoluteIndex = requireToAbsoluteIndex();
    var lengthOfArrayLike = requireLengthOfArrayLike();

    // `Array.prototype.{ indexOf, includes }` methods implementation
    var createMethod = function createMethod(IS_INCLUDES) {
      return function ($this, el, fromIndex) {
        var O = toIndexedObject($this);
        var length = lengthOfArrayLike(O);
        if (length === 0) return !IS_INCLUDES && -1;
        var index = toAbsoluteIndex(fromIndex, length);
        var value;
        // Array#includes uses SameValueZero equality algorithm
        // eslint-disable-next-line no-self-compare -- NaN check
        if (IS_INCLUDES && el !== el) while (length > index) {
          value = O[index++];
          // eslint-disable-next-line no-self-compare -- NaN check
          if (value !== value) return true;
          // Array#indexOf ignores holes, Array#includes - not
        } else for (; length > index; index++) {
          if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
        }
        return !IS_INCLUDES && -1;
      };
    };
    arrayIncludes = {
      // `Array.prototype.includes` method
      // https://tc39.es/ecma262/#sec-array.prototype.includes
      includes: createMethod(true),
      // `Array.prototype.indexOf` method
      // https://tc39.es/ecma262/#sec-array.prototype.indexof
      indexOf: createMethod(false)
    };
    return arrayIncludes;
  }

  var hiddenKeys;
  var hasRequiredHiddenKeys;
  function requireHiddenKeys() {
    if (hasRequiredHiddenKeys) return hiddenKeys;
    hasRequiredHiddenKeys = 1;
    hiddenKeys = {};
    return hiddenKeys;
  }

  var objectKeysInternal;
  var hasRequiredObjectKeysInternal;
  function requireObjectKeysInternal() {
    if (hasRequiredObjectKeysInternal) return objectKeysInternal;
    hasRequiredObjectKeysInternal = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var hasOwn = requireHasOwnProperty();
    var toIndexedObject = requireToIndexedObject();
    var indexOf = requireArrayIncludes().indexOf;
    var hiddenKeys = requireHiddenKeys();
    var push = uncurryThis([].push);
    objectKeysInternal = function objectKeysInternal(object, names) {
      var O = toIndexedObject(object);
      var i = 0;
      var result = [];
      var key;
      for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
      // Don't enum bug & hidden keys
      while (names.length > i) if (hasOwn(O, key = names[i++])) {
        ~indexOf(result, key) || push(result, key);
      }
      return result;
    };
    return objectKeysInternal;
  }

  var enumBugKeys;
  var hasRequiredEnumBugKeys;
  function requireEnumBugKeys() {
    if (hasRequiredEnumBugKeys) return enumBugKeys;
    hasRequiredEnumBugKeys = 1;
    // IE8- don't enum bug keys
    enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];
    return enumBugKeys;
  }

  var hasRequiredObjectGetOwnPropertyNames;
  function requireObjectGetOwnPropertyNames() {
    if (hasRequiredObjectGetOwnPropertyNames) return objectGetOwnPropertyNames;
    hasRequiredObjectGetOwnPropertyNames = 1;
    var internalObjectKeys = requireObjectKeysInternal();
    var enumBugKeys = requireEnumBugKeys();
    var hiddenKeys = enumBugKeys.concat('length', 'prototype');

    // `Object.getOwnPropertyNames` method
    // https://tc39.es/ecma262/#sec-object.getownpropertynames
    // eslint-disable-next-line es/no-object-getownpropertynames -- safe
    objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
      return internalObjectKeys(O, hiddenKeys);
    };
    return objectGetOwnPropertyNames;
  }

  var objectGetOwnPropertySymbols = {};

  var hasRequiredObjectGetOwnPropertySymbols;
  function requireObjectGetOwnPropertySymbols() {
    if (hasRequiredObjectGetOwnPropertySymbols) return objectGetOwnPropertySymbols;
    hasRequiredObjectGetOwnPropertySymbols = 1;
    // eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
    objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;
    return objectGetOwnPropertySymbols;
  }

  var ownKeys;
  var hasRequiredOwnKeys;
  function requireOwnKeys() {
    if (hasRequiredOwnKeys) return ownKeys;
    hasRequiredOwnKeys = 1;
    var getBuiltIn = requireGetBuiltIn();
    var uncurryThis = requireFunctionUncurryThis();
    var getOwnPropertyNamesModule = requireObjectGetOwnPropertyNames();
    var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
    var anObject = requireAnObject();
    var concat = uncurryThis([].concat);

    // all object keys, includes non-enumerable and symbols
    ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
      var keys = getOwnPropertyNamesModule.f(anObject(it));
      var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
      return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
    };
    return ownKeys;
  }

  var copyConstructorProperties;
  var hasRequiredCopyConstructorProperties;
  function requireCopyConstructorProperties() {
    if (hasRequiredCopyConstructorProperties) return copyConstructorProperties;
    hasRequiredCopyConstructorProperties = 1;
    var hasOwn = requireHasOwnProperty();
    var ownKeys = requireOwnKeys();
    var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
    var definePropertyModule = requireObjectDefineProperty();
    copyConstructorProperties = function copyConstructorProperties(target, source, exceptions) {
      var keys = ownKeys(source);
      var defineProperty = definePropertyModule.f;
      var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
          defineProperty(target, key, getOwnPropertyDescriptor(source, key));
        }
      }
    };
    return copyConstructorProperties;
  }

  var hasRequiredEs_symbol_description;
  function requireEs_symbol_description() {
    if (hasRequiredEs_symbol_description) return es_symbol_description;
    hasRequiredEs_symbol_description = 1;
    var $ = require_export();
    var DESCRIPTORS = requireDescriptors();
    var globalThis = requireGlobalThis();
    var uncurryThis = requireFunctionUncurryThis();
    var hasOwn = requireHasOwnProperty();
    var isCallable = requireIsCallable();
    var isPrototypeOf = requireObjectIsPrototypeOf();
    var toString = requireToString();
    var defineBuiltInAccessor = requireDefineBuiltInAccessor();
    var copyConstructorProperties = requireCopyConstructorProperties();
    var NativeSymbol = globalThis.Symbol;
    var SymbolPrototype = NativeSymbol && NativeSymbol.prototype;
    if (DESCRIPTORS && isCallable(NativeSymbol) && (!('description' in SymbolPrototype) ||
    // Safari 12 bug
    NativeSymbol().description !== undefined)) {
      var EmptyStringDescriptionStore = {};
      // wrap Symbol constructor for correct work with undefined description
      var SymbolWrapper = function _Symbol() {
        var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString(arguments[0]);
        var result = isPrototypeOf(SymbolPrototype, this)
        // eslint-disable-next-line sonarjs/inconsistent-function-call -- ok
        ? new NativeSymbol(description)
        // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
        : description === undefined ? NativeSymbol() : NativeSymbol(description);
        if (description === '') EmptyStringDescriptionStore[result] = true;
        return result;
      };
      copyConstructorProperties(SymbolWrapper, NativeSymbol);
      SymbolWrapper.prototype = SymbolPrototype;
      SymbolPrototype.constructor = SymbolWrapper;
      var NATIVE_SYMBOL = String(NativeSymbol('description detection')) === 'Symbol(description detection)';
      var thisSymbolValue = uncurryThis(SymbolPrototype.valueOf);
      var symbolDescriptiveString = uncurryThis(SymbolPrototype.toString);
      var regexp = /^Symbol\((.*)\)[^)]+$/;
      var replace = uncurryThis(''.replace);
      var stringSlice = uncurryThis(''.slice);
      defineBuiltInAccessor(SymbolPrototype, 'description', {
        configurable: true,
        get: function description() {
          var symbol = thisSymbolValue(this);
          if (hasOwn(EmptyStringDescriptionStore, symbol)) return '';
          var string = symbolDescriptiveString(symbol);
          var desc = NATIVE_SYMBOL ? stringSlice(string, 7, -1) : replace(string, regexp, '$1');
          return desc === '' ? undefined : desc;
        }
      });
      $({
        global: true,
        constructor: true,
        forced: true
      }, {
        Symbol: SymbolWrapper
      });
    }
    return es_symbol_description;
  }

  requireEs_symbol_description();

  var web_domCollections_forEach = {};

  var domIterables;
  var hasRequiredDomIterables;
  function requireDomIterables() {
    if (hasRequiredDomIterables) return domIterables;
    hasRequiredDomIterables = 1;
    // iterable DOM collections
    // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
    domIterables = {
      CSSRuleList: 0,
      CSSStyleDeclaration: 0,
      CSSValueList: 0,
      ClientRectList: 0,
      DOMRectList: 0,
      DOMStringList: 0,
      DOMTokenList: 1,
      DataTransferItemList: 0,
      FileList: 0,
      HTMLAllCollection: 0,
      HTMLCollection: 0,
      HTMLFormElement: 0,
      HTMLSelectElement: 0,
      MediaList: 0,
      MimeTypeArray: 0,
      NamedNodeMap: 0,
      NodeList: 1,
      PaintRequestList: 0,
      Plugin: 0,
      PluginArray: 0,
      SVGLengthList: 0,
      SVGNumberList: 0,
      SVGPathSegList: 0,
      SVGPointList: 0,
      SVGStringList: 0,
      SVGTransformList: 0,
      SourceBufferList: 0,
      StyleSheetList: 0,
      TextTrackCueList: 0,
      TextTrackList: 0,
      TouchList: 0
    };
    return domIterables;
  }

  var domTokenListPrototype;
  var hasRequiredDomTokenListPrototype;
  function requireDomTokenListPrototype() {
    if (hasRequiredDomTokenListPrototype) return domTokenListPrototype;
    hasRequiredDomTokenListPrototype = 1;
    // in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
    var documentCreateElement = requireDocumentCreateElement();
    var classList = documentCreateElement('span').classList;
    var DOMTokenListPrototype = classList && classList.constructor && classList.constructor.prototype;
    domTokenListPrototype = DOMTokenListPrototype === Object.prototype ? undefined : DOMTokenListPrototype;
    return domTokenListPrototype;
  }

  var functionUncurryThisClause;
  var hasRequiredFunctionUncurryThisClause;
  function requireFunctionUncurryThisClause() {
    if (hasRequiredFunctionUncurryThisClause) return functionUncurryThisClause;
    hasRequiredFunctionUncurryThisClause = 1;
    var classofRaw = requireClassofRaw();
    var uncurryThis = requireFunctionUncurryThis();
    functionUncurryThisClause = function functionUncurryThisClause(fn) {
      // Nashorn bug:
      //   https://github.com/zloirock/core-js/issues/1128
      //   https://github.com/zloirock/core-js/issues/1130
      if (classofRaw(fn) === 'Function') return uncurryThis(fn);
    };
    return functionUncurryThisClause;
  }

  var functionBindContext;
  var hasRequiredFunctionBindContext;
  function requireFunctionBindContext() {
    if (hasRequiredFunctionBindContext) return functionBindContext;
    hasRequiredFunctionBindContext = 1;
    var uncurryThis = requireFunctionUncurryThisClause();
    var aCallable = requireACallable();
    var NATIVE_BIND = requireFunctionBindNative();
    var bind = uncurryThis(uncurryThis.bind);

    // optional / simple context binding
    functionBindContext = function functionBindContext(fn, that) {
      aCallable(fn);
      return that === undefined ? fn : NATIVE_BIND ? bind(fn, that) : function /* ...args */
      () {
        return fn.apply(that, arguments);
      };
    };
    return functionBindContext;
  }

  var arraySpeciesConstructor;
  var hasRequiredArraySpeciesConstructor;
  function requireArraySpeciesConstructor() {
    if (hasRequiredArraySpeciesConstructor) return arraySpeciesConstructor;
    hasRequiredArraySpeciesConstructor = 1;
    var isArray = requireIsArray();
    var isConstructor = requireIsConstructor();
    var isObject = requireIsObject();
    var wellKnownSymbol = requireWellKnownSymbol();
    var SPECIES = wellKnownSymbol('species');
    var $Array = Array;

    // a part of `ArraySpeciesCreate` abstract operation
    // https://tc39.es/ecma262/#sec-arrayspeciescreate
    arraySpeciesConstructor = function arraySpeciesConstructor(originalArray) {
      var C;
      if (isArray(originalArray)) {
        C = originalArray.constructor;
        // cross-realm fallback
        if (isConstructor(C) && (C === $Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
          C = C[SPECIES];
          if (C === null) C = undefined;
        }
      }
      return C === undefined ? $Array : C;
    };
    return arraySpeciesConstructor;
  }

  var arraySpeciesCreate;
  var hasRequiredArraySpeciesCreate;
  function requireArraySpeciesCreate() {
    if (hasRequiredArraySpeciesCreate) return arraySpeciesCreate;
    hasRequiredArraySpeciesCreate = 1;
    var arraySpeciesConstructor = requireArraySpeciesConstructor();

    // `ArraySpeciesCreate` abstract operation
    // https://tc39.es/ecma262/#sec-arrayspeciescreate
    arraySpeciesCreate = function arraySpeciesCreate(originalArray, length) {
      return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
    };
    return arraySpeciesCreate;
  }

  var arrayIteration;
  var hasRequiredArrayIteration;
  function requireArrayIteration() {
    if (hasRequiredArrayIteration) return arrayIteration;
    hasRequiredArrayIteration = 1;
    var bind = requireFunctionBindContext();
    var uncurryThis = requireFunctionUncurryThis();
    var IndexedObject = requireIndexedObject();
    var toObject = requireToObject();
    var lengthOfArrayLike = requireLengthOfArrayLike();
    var arraySpeciesCreate = requireArraySpeciesCreate();
    var push = uncurryThis([].push);

    // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
    var createMethod = function createMethod(TYPE) {
      var IS_MAP = TYPE === 1;
      var IS_FILTER = TYPE === 2;
      var IS_SOME = TYPE === 3;
      var IS_EVERY = TYPE === 4;
      var IS_FIND_INDEX = TYPE === 6;
      var IS_FILTER_REJECT = TYPE === 7;
      var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
      return function ($this, callbackfn, that, specificCreate) {
        var O = toObject($this);
        var self = IndexedObject(O);
        var length = lengthOfArrayLike(self);
        var boundFunction = bind(callbackfn, that);
        var index = 0;
        var create = specificCreate || arraySpeciesCreate;
        var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
        var value, result;
        for (; length > index; index++) if (NO_HOLES || index in self) {
          value = self[index];
          result = boundFunction(value, index, O);
          if (TYPE) {
            if (IS_MAP) target[index] = result; // map
            else if (result) switch (TYPE) {
              case 3:
                return true;
              // some
              case 5:
                return value;
              // find
              case 6:
                return index;
              // findIndex
              case 2:
                push(target, value);
              // filter
            } else switch (TYPE) {
              case 4:
                return false;
              // every
              case 7:
                push(target, value);
              // filterReject
            }
          }
        }
        return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
      };
    };
    arrayIteration = {
      // `Array.prototype.forEach` method
      // https://tc39.es/ecma262/#sec-array.prototype.foreach
      forEach: createMethod(0),
      // `Array.prototype.map` method
      // https://tc39.es/ecma262/#sec-array.prototype.map
      map: createMethod(1),
      // `Array.prototype.filter` method
      // https://tc39.es/ecma262/#sec-array.prototype.filter
      filter: createMethod(2),
      // `Array.prototype.some` method
      // https://tc39.es/ecma262/#sec-array.prototype.some
      some: createMethod(3),
      // `Array.prototype.every` method
      // https://tc39.es/ecma262/#sec-array.prototype.every
      every: createMethod(4),
      // `Array.prototype.find` method
      // https://tc39.es/ecma262/#sec-array.prototype.find
      find: createMethod(5),
      // `Array.prototype.findIndex` method
      // https://tc39.es/ecma262/#sec-array.prototype.findIndex
      findIndex: createMethod(6),
      // `Array.prototype.filterReject` method
      // https://github.com/tc39/proposal-array-filtering
      filterReject: createMethod(7)
    };
    return arrayIteration;
  }

  var arrayForEach;
  var hasRequiredArrayForEach;
  function requireArrayForEach() {
    if (hasRequiredArrayForEach) return arrayForEach;
    hasRequiredArrayForEach = 1;
    var $forEach = requireArrayIteration().forEach;
    var arrayMethodIsStrict = requireArrayMethodIsStrict();
    var STRICT_METHOD = arrayMethodIsStrict('forEach');

    // `Array.prototype.forEach` method implementation
    // https://tc39.es/ecma262/#sec-array.prototype.foreach
    arrayForEach = !STRICT_METHOD ? function forEach(callbackfn /* , thisArg */) {
      return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      // eslint-disable-next-line es/no-array-prototype-foreach -- safe
    } : [].forEach;
    return arrayForEach;
  }

  var hasRequiredWeb_domCollections_forEach;
  function requireWeb_domCollections_forEach() {
    if (hasRequiredWeb_domCollections_forEach) return web_domCollections_forEach;
    hasRequiredWeb_domCollections_forEach = 1;
    var globalThis = requireGlobalThis();
    var DOMIterables = requireDomIterables();
    var DOMTokenListPrototype = requireDomTokenListPrototype();
    var forEach = requireArrayForEach();
    var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
    var handlePrototype = function handlePrototype(CollectionPrototype) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
        createNonEnumerableProperty(CollectionPrototype, 'forEach', forEach);
      } catch (error) {
        CollectionPrototype.forEach = forEach;
      }
    };
    for (var COLLECTION_NAME in DOMIterables) {
      if (DOMIterables[COLLECTION_NAME]) {
        handlePrototype(globalThis[COLLECTION_NAME] && globalThis[COLLECTION_NAME].prototype);
      }
    }
    handlePrototype(DOMTokenListPrototype);
    return web_domCollections_forEach;
  }

  requireWeb_domCollections_forEach();

  var es_symbol_constructor = {};

  var symbolConstructorDetection;
  var hasRequiredSymbolConstructorDetection;
  function requireSymbolConstructorDetection() {
    if (hasRequiredSymbolConstructorDetection) return symbolConstructorDetection;
    hasRequiredSymbolConstructorDetection = 1;
    /* eslint-disable es/no-symbol -- required for testing */
    var V8_VERSION = requireEnvironmentV8Version();
    var fails = requireFails();
    var globalThis = requireGlobalThis();
    var $String = globalThis.String;

    // eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
    symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails(function () {
      var symbol = Symbol('symbol detection');
      // Chrome 38 Symbol has incorrect toString conversion
      // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
      // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
      // of course, fail.
      return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
      // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
      !Symbol.sham && V8_VERSION && V8_VERSION < 41;
    });
    return symbolConstructorDetection;
  }

  var objectDefineProperties = {};

  var es_object_keys = {};

  var hasRequiredEs_object_keys;
  function requireEs_object_keys() {
    if (hasRequiredEs_object_keys) return es_object_keys;
    hasRequiredEs_object_keys = 1;
    var $ = require_export();
    var toObject = requireToObject();
    var nativeKeys = requireObjectKeys();
    var fails = requireFails();
    var FAILS_ON_PRIMITIVES = fails(function () {
      nativeKeys(1);
    });

    // `Object.keys` method
    // https://tc39.es/ecma262/#sec-object.keys
    $({
      target: 'Object',
      stat: true,
      forced: FAILS_ON_PRIMITIVES
    }, {
      keys: function keys(it) {
        return nativeKeys(toObject(it));
      }
    });
    return es_object_keys;
  }

  requireEs_object_keys();

  var objectKeys;
  var hasRequiredObjectKeys;
  function requireObjectKeys() {
    if (hasRequiredObjectKeys) return objectKeys;
    hasRequiredObjectKeys = 1;
    var internalObjectKeys = requireObjectKeysInternal();
    var enumBugKeys = requireEnumBugKeys();

    // `Object.keys` method
    // https://tc39.es/ecma262/#sec-object.keys
    // eslint-disable-next-line es/no-object-keys -- safe
    objectKeys = Object.keys || function keys(O) {
      return internalObjectKeys(O, enumBugKeys);
    };
    return objectKeys;
  }

  var hasRequiredObjectDefineProperties;
  function requireObjectDefineProperties() {
    if (hasRequiredObjectDefineProperties) return objectDefineProperties;
    hasRequiredObjectDefineProperties = 1;
    var DESCRIPTORS = requireDescriptors();
    var V8_PROTOTYPE_DEFINE_BUG = requireV8PrototypeDefineBug();
    var definePropertyModule = requireObjectDefineProperty();
    var anObject = requireAnObject();
    var toIndexedObject = requireToIndexedObject();
    var objectKeys = requireObjectKeys();

    // `Object.defineProperties` method
    // https://tc39.es/ecma262/#sec-object.defineproperties
    // eslint-disable-next-line es/no-object-defineproperties -- safe
    objectDefineProperties.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
      anObject(O);
      var props = toIndexedObject(Properties);
      var keys = objectKeys(Properties);
      var length = keys.length;
      var index = 0;
      var key;
      while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
      return O;
    };
    return objectDefineProperties;
  }

  var html;
  var hasRequiredHtml;
  function requireHtml() {
    if (hasRequiredHtml) return html;
    hasRequiredHtml = 1;
    var getBuiltIn = requireGetBuiltIn();
    html = getBuiltIn('document', 'documentElement');
    return html;
  }

  var sharedKey;
  var hasRequiredSharedKey;
  function requireSharedKey() {
    if (hasRequiredSharedKey) return sharedKey;
    hasRequiredSharedKey = 1;
    var shared = requireShared();
    var uid = requireUid();
    var keys = shared('keys');
    sharedKey = function sharedKey(key) {
      return keys[key] || (keys[key] = uid(key));
    };
    return sharedKey;
  }

  var objectCreate;
  var hasRequiredObjectCreate;
  function requireObjectCreate() {
    if (hasRequiredObjectCreate) return objectCreate;
    hasRequiredObjectCreate = 1;
    /* global ActiveXObject -- old IE, WSH */
    var anObject = requireAnObject();
    var definePropertiesModule = requireObjectDefineProperties();
    var enumBugKeys = requireEnumBugKeys();
    var hiddenKeys = requireHiddenKeys();
    var html = requireHtml();
    var documentCreateElement = requireDocumentCreateElement();
    var sharedKey = requireSharedKey();
    var GT = '>';
    var LT = '<';
    var PROTOTYPE = 'prototype';
    var SCRIPT = 'script';
    var IE_PROTO = sharedKey('IE_PROTO');
    var EmptyConstructor = function EmptyConstructor() {/* empty */};
    var scriptTag = function scriptTag(content) {
      return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
    };

    // Create object with fake `null` prototype: use ActiveX Object with cleared prototype
    var NullProtoObjectViaActiveX = function NullProtoObjectViaActiveX(activeXDocument) {
      activeXDocument.write(scriptTag(''));
      activeXDocument.close();
      var temp = activeXDocument.parentWindow.Object;
      // eslint-disable-next-line no-useless-assignment -- avoid memory leak
      activeXDocument = null;
      return temp;
    };

    // Create object with fake `null` prototype: use iframe Object with cleared prototype
    var NullProtoObjectViaIFrame = function NullProtoObjectViaIFrame() {
      // Thrash, waste and sodomy: IE GC bug
      var iframe = documentCreateElement('iframe');
      var JS = 'java' + SCRIPT + ':';
      var iframeDocument;
      iframe.style.display = 'none';
      html.appendChild(iframe);
      // https://github.com/zloirock/core-js/issues/475
      iframe.src = String(JS);
      iframeDocument = iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.write(scriptTag('document.F=Object'));
      iframeDocument.close();
      return iframeDocument.F;
    };

    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    // avoid IE GC bug
    var activeXDocument;
    var _NullProtoObject = function NullProtoObject() {
      try {
        activeXDocument = new ActiveXObject('htmlfile');
      } catch (error) {/* ignore */}
      _NullProtoObject = typeof document != 'undefined' ? document.domain && activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame() : NullProtoObjectViaActiveX(activeXDocument); // WSH
      var length = enumBugKeys.length;
      while (length--) delete _NullProtoObject[PROTOTYPE][enumBugKeys[length]];
      return _NullProtoObject();
    };
    hiddenKeys[IE_PROTO] = true;

    // `Object.create` method
    // https://tc39.es/ecma262/#sec-object.create
    // eslint-disable-next-line es/no-object-create -- safe
    objectCreate = Object.create || function create(O, Properties) {
      var result;
      if (O !== null) {
        EmptyConstructor[PROTOTYPE] = anObject(O);
        result = new EmptyConstructor();
        EmptyConstructor[PROTOTYPE] = null;
        // add "__proto__" for Object.getPrototypeOf polyfill
        result[IE_PROTO] = O;
      } else result = _NullProtoObject();
      return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
    };
    return objectCreate;
  }

  var objectPropertyIsEnumerable = {};

  var hasRequiredObjectPropertyIsEnumerable;
  function requireObjectPropertyIsEnumerable() {
    if (hasRequiredObjectPropertyIsEnumerable) return objectPropertyIsEnumerable;
    hasRequiredObjectPropertyIsEnumerable = 1;
    var $propertyIsEnumerable = {}.propertyIsEnumerable;
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    // Nashorn ~ JDK8 bug
    var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({
      1: 2
    }, 1);

    // `Object.prototype.propertyIsEnumerable` method implementation
    // https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
    objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
      var descriptor = getOwnPropertyDescriptor(this, V);
      return !!descriptor && descriptor.enumerable;
    } : $propertyIsEnumerable;
    return objectPropertyIsEnumerable;
  }

  var wellKnownSymbolWrapped = {};

  var hasRequiredWellKnownSymbolWrapped;
  function requireWellKnownSymbolWrapped() {
    if (hasRequiredWellKnownSymbolWrapped) return wellKnownSymbolWrapped;
    hasRequiredWellKnownSymbolWrapped = 1;
    var wellKnownSymbol = requireWellKnownSymbol();
    wellKnownSymbolWrapped.f = wellKnownSymbol;
    return wellKnownSymbolWrapped;
  }

  var path;
  var hasRequiredPath;
  function requirePath() {
    if (hasRequiredPath) return path;
    hasRequiredPath = 1;
    var globalThis = requireGlobalThis();
    path = globalThis;
    return path;
  }

  var wellKnownSymbolDefine;
  var hasRequiredWellKnownSymbolDefine;
  function requireWellKnownSymbolDefine() {
    if (hasRequiredWellKnownSymbolDefine) return wellKnownSymbolDefine;
    hasRequiredWellKnownSymbolDefine = 1;
    var path = requirePath();
    var hasOwn = requireHasOwnProperty();
    var wrappedWellKnownSymbolModule = requireWellKnownSymbolWrapped();
    var defineProperty = requireObjectDefineProperty().f;
    wellKnownSymbolDefine = function wellKnownSymbolDefine(NAME) {
      var _Symbol = path.Symbol || (path.Symbol = {});
      if (!hasOwn(_Symbol, NAME)) defineProperty(_Symbol, NAME, {
        value: wrappedWellKnownSymbolModule.f(NAME)
      });
    };
    return wellKnownSymbolDefine;
  }

  var symbolDefineToPrimitive;
  var hasRequiredSymbolDefineToPrimitive;
  function requireSymbolDefineToPrimitive() {
    if (hasRequiredSymbolDefineToPrimitive) return symbolDefineToPrimitive;
    hasRequiredSymbolDefineToPrimitive = 1;
    var call = requireFunctionCall();
    var getBuiltIn = requireGetBuiltIn();
    var wellKnownSymbol = requireWellKnownSymbol();
    var defineBuiltIn = requireDefineBuiltIn();
    symbolDefineToPrimitive = function symbolDefineToPrimitive() {
      var _Symbol = getBuiltIn('Symbol');
      var SymbolPrototype = _Symbol && _Symbol.prototype;
      var valueOf = SymbolPrototype && SymbolPrototype.valueOf;
      var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
      if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
        // `Symbol.prototype[@@toPrimitive]` method
        // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
        // eslint-disable-next-line no-unused-vars -- required for .length
        defineBuiltIn(SymbolPrototype, TO_PRIMITIVE, function (hint) {
          return call(valueOf, this);
        }, {
          arity: 1
        });
      }
    };
    return symbolDefineToPrimitive;
  }

  var setToStringTag;
  var hasRequiredSetToStringTag;
  function requireSetToStringTag() {
    if (hasRequiredSetToStringTag) return setToStringTag;
    hasRequiredSetToStringTag = 1;
    var defineProperty = requireObjectDefineProperty().f;
    var hasOwn = requireHasOwnProperty();
    var wellKnownSymbol = requireWellKnownSymbol();
    var TO_STRING_TAG = wellKnownSymbol('toStringTag');
    setToStringTag = function setToStringTag(target, TAG, STATIC) {
      if (target && !STATIC) target = target.prototype;
      if (target && !hasOwn(target, TO_STRING_TAG)) {
        defineProperty(target, TO_STRING_TAG, {
          configurable: true,
          value: TAG
        });
      }
    };
    return setToStringTag;
  }

  var hasRequiredEs_symbol_constructor;
  function requireEs_symbol_constructor() {
    if (hasRequiredEs_symbol_constructor) return es_symbol_constructor;
    hasRequiredEs_symbol_constructor = 1;
    var $ = require_export();
    var globalThis = requireGlobalThis();
    var call = requireFunctionCall();
    var uncurryThis = requireFunctionUncurryThis();
    var IS_PURE = requireIsPure();
    var DESCRIPTORS = requireDescriptors();
    var NATIVE_SYMBOL = requireSymbolConstructorDetection();
    var fails = requireFails();
    var hasOwn = requireHasOwnProperty();
    var isPrototypeOf = requireObjectIsPrototypeOf();
    var anObject = requireAnObject();
    var toIndexedObject = requireToIndexedObject();
    var toPropertyKey = requireToPropertyKey();
    var $toString = requireToString();
    var createPropertyDescriptor = requireCreatePropertyDescriptor();
    var nativeObjectCreate = requireObjectCreate();
    var objectKeys = requireObjectKeys();
    var getOwnPropertyNamesModule = requireObjectGetOwnPropertyNames();
    var getOwnPropertyNamesExternal = requireObjectGetOwnPropertyNamesExternal();
    var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
    var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
    var definePropertyModule = requireObjectDefineProperty();
    var definePropertiesModule = requireObjectDefineProperties();
    var propertyIsEnumerableModule = requireObjectPropertyIsEnumerable();
    var defineBuiltIn = requireDefineBuiltIn();
    var defineBuiltInAccessor = requireDefineBuiltInAccessor();
    var shared = requireShared();
    var sharedKey = requireSharedKey();
    var hiddenKeys = requireHiddenKeys();
    var uid = requireUid();
    var wellKnownSymbol = requireWellKnownSymbol();
    var wrappedWellKnownSymbolModule = requireWellKnownSymbolWrapped();
    var defineWellKnownSymbol = requireWellKnownSymbolDefine();
    var defineSymbolToPrimitive = requireSymbolDefineToPrimitive();
    var setToStringTag = requireSetToStringTag();
    var InternalStateModule = requireInternalState();
    var $forEach = requireArrayIteration().forEach;
    var HIDDEN = sharedKey('hidden');
    var SYMBOL = 'Symbol';
    var PROTOTYPE = 'prototype';
    var setInternalState = InternalStateModule.set;
    var getInternalState = InternalStateModule.getterFor(SYMBOL);
    var ObjectPrototype = Object[PROTOTYPE];
    var $Symbol = globalThis.Symbol;
    var SymbolPrototype = $Symbol && $Symbol[PROTOTYPE];
    var RangeError = globalThis.RangeError;
    var TypeError = globalThis.TypeError;
    var QObject = globalThis.QObject;
    var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
    var nativeDefineProperty = definePropertyModule.f;
    var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
    var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
    var push = uncurryThis([].push);
    var AllSymbols = shared('symbols');
    var ObjectPrototypeSymbols = shared('op-symbols');
    var WellKnownSymbolsStore = shared('wks');

    // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
    var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

    // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
    var fallbackDefineProperty = function fallbackDefineProperty(O, P, Attributes) {
      var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
      if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
      nativeDefineProperty(O, P, Attributes);
      if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
        nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
      }
    };
    var setSymbolDescriptor = DESCRIPTORS && fails(function () {
      return nativeObjectCreate(nativeDefineProperty({}, 'a', {
        get: function get() {
          return nativeDefineProperty(this, 'a', {
            value: 7
          }).a;
        }
      })).a !== 7;
    }) ? fallbackDefineProperty : nativeDefineProperty;
    var wrap = function wrap(tag, description) {
      var symbol = AllSymbols[tag] = nativeObjectCreate(SymbolPrototype);
      setInternalState(symbol, {
        type: SYMBOL,
        tag: tag,
        description: description
      });
      if (!DESCRIPTORS) symbol.description = description;
      return symbol;
    };
    var $defineProperty = function defineProperty(O, P, Attributes) {
      if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
      anObject(O);
      var key = toPropertyKey(P);
      anObject(Attributes);
      if (hasOwn(AllSymbols, key)) {
        if (!Attributes.enumerable) {
          if (!hasOwn(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, nativeObjectCreate(null)));
          O[HIDDEN][key] = true;
        } else {
          if (hasOwn(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
          Attributes = nativeObjectCreate(Attributes, {
            enumerable: createPropertyDescriptor(0, false)
          });
        }
        return setSymbolDescriptor(O, key, Attributes);
      }
      return nativeDefineProperty(O, key, Attributes);
    };
    var $defineProperties = function defineProperties(O, Properties) {
      anObject(O);
      var properties = toIndexedObject(Properties);
      var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
      $forEach(keys, function (key) {
        if (!DESCRIPTORS || call($propertyIsEnumerable, properties, key)) $defineProperty(O, key, properties[key]);
      });
      return O;
    };
    var $create = function create(O, Properties) {
      return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
    };
    var $propertyIsEnumerable = function propertyIsEnumerable(V) {
      var P = toPropertyKey(V);
      var enumerable = call(nativePropertyIsEnumerable, this, P);
      if (this === ObjectPrototype && hasOwn(AllSymbols, P) && !hasOwn(ObjectPrototypeSymbols, P)) return false;
      return enumerable || !hasOwn(this, P) || !hasOwn(AllSymbols, P) || hasOwn(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
    };
    var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
      var it = toIndexedObject(O);
      var key = toPropertyKey(P);
      if (it === ObjectPrototype && hasOwn(AllSymbols, key) && !hasOwn(ObjectPrototypeSymbols, key)) return;
      var descriptor = nativeGetOwnPropertyDescriptor(it, key);
      if (descriptor && hasOwn(AllSymbols, key) && !(hasOwn(it, HIDDEN) && it[HIDDEN][key])) {
        descriptor.enumerable = true;
      }
      return descriptor;
    };
    var $getOwnPropertyNames = function getOwnPropertyNames(O) {
      var names = nativeGetOwnPropertyNames(toIndexedObject(O));
      var result = [];
      $forEach(names, function (key) {
        if (!hasOwn(AllSymbols, key) && !hasOwn(hiddenKeys, key)) push(result, key);
      });
      return result;
    };
    var $getOwnPropertySymbols = function $getOwnPropertySymbols(O) {
      var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
      var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
      var result = [];
      $forEach(names, function (key) {
        if (hasOwn(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwn(ObjectPrototype, key))) {
          push(result, AllSymbols[key]);
        }
      });
      return result;
    };

    // `Symbol` constructor
    // https://tc39.es/ecma262/#sec-symbol-constructor
    if (!NATIVE_SYMBOL) {
      $Symbol = function _Symbol() {
        if (isPrototypeOf(SymbolPrototype, this)) throw new TypeError('Symbol is not a constructor');
        var description = !arguments.length || arguments[0] === undefined ? undefined : $toString(arguments[0]);
        var tag = uid(description);
        var _setter = function setter(value) {
          var $this = this === undefined ? globalThis : this;
          if ($this === ObjectPrototype) call(_setter, ObjectPrototypeSymbols, value);
          if (hasOwn($this, HIDDEN) && hasOwn($this[HIDDEN], tag)) $this[HIDDEN][tag] = false;
          var descriptor = createPropertyDescriptor(1, value);
          try {
            setSymbolDescriptor($this, tag, descriptor);
          } catch (error) {
            if (!(error instanceof RangeError)) throw error;
            fallbackDefineProperty($this, tag, descriptor);
          }
        };
        if (DESCRIPTORS && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, {
          configurable: true,
          set: _setter
        });
        return wrap(tag, description);
      };
      SymbolPrototype = $Symbol[PROTOTYPE];
      defineBuiltIn(SymbolPrototype, 'toString', function toString() {
        return getInternalState(this).tag;
      });
      defineBuiltIn($Symbol, 'withoutSetter', function (description) {
        return wrap(uid(description), description);
      });
      propertyIsEnumerableModule.f = $propertyIsEnumerable;
      definePropertyModule.f = $defineProperty;
      definePropertiesModule.f = $defineProperties;
      getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
      getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
      getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;
      wrappedWellKnownSymbolModule.f = function (name) {
        return wrap(wellKnownSymbol(name), name);
      };
      if (DESCRIPTORS) {
        // https://tc39.es/ecma262/#sec-symbol.prototype.description
        defineBuiltInAccessor(SymbolPrototype, 'description', {
          configurable: true,
          get: function description() {
            return getInternalState(this).description;
          }
        });
        if (!IS_PURE) {
          defineBuiltIn(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, {
            unsafe: true
          });
        }
      }
    }
    $({
      global: true,
      constructor: true,
      wrap: true,
      forced: !NATIVE_SYMBOL,
      sham: !NATIVE_SYMBOL
    }, {
      Symbol: $Symbol
    });
    $forEach(objectKeys(WellKnownSymbolsStore), function (name) {
      defineWellKnownSymbol(name);
    });
    $({
      target: SYMBOL,
      stat: true,
      forced: !NATIVE_SYMBOL
    }, {
      useSetter: function useSetter() {
        USE_SETTER = true;
      },
      useSimple: function useSimple() {
        USE_SETTER = false;
      }
    });
    $({
      target: 'Object',
      stat: true,
      forced: !NATIVE_SYMBOL,
      sham: !DESCRIPTORS
    }, {
      // `Object.create` method
      // https://tc39.es/ecma262/#sec-object.create
      create: $create,
      // `Object.defineProperty` method
      // https://tc39.es/ecma262/#sec-object.defineproperty
      defineProperty: $defineProperty,
      // `Object.defineProperties` method
      // https://tc39.es/ecma262/#sec-object.defineproperties
      defineProperties: $defineProperties,
      // `Object.getOwnPropertyDescriptor` method
      // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
      getOwnPropertyDescriptor: $getOwnPropertyDescriptor
    });
    $({
      target: 'Object',
      stat: true,
      forced: !NATIVE_SYMBOL
    }, {
      // `Object.getOwnPropertyNames` method
      // https://tc39.es/ecma262/#sec-object.getownpropertynames
      getOwnPropertyNames: $getOwnPropertyNames
    });

    // `Symbol.prototype[@@toPrimitive]` method
    // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
    defineSymbolToPrimitive();

    // `Symbol.prototype[@@toStringTag]` property
    // https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
    setToStringTag($Symbol, SYMBOL);
    hiddenKeys[HIDDEN] = true;
    return es_symbol_constructor;
  }

  var es_symbol_for = {};

  var symbolRegistryDetection;
  var hasRequiredSymbolRegistryDetection;
  function requireSymbolRegistryDetection() {
    if (hasRequiredSymbolRegistryDetection) return symbolRegistryDetection;
    hasRequiredSymbolRegistryDetection = 1;
    var NATIVE_SYMBOL = requireSymbolConstructorDetection();

    /* eslint-disable es/no-symbol -- safe */
    symbolRegistryDetection = NATIVE_SYMBOL && !!Symbol['for'] && !!Symbol.keyFor;
    return symbolRegistryDetection;
  }

  var hasRequiredEs_symbol_for;
  function requireEs_symbol_for() {
    if (hasRequiredEs_symbol_for) return es_symbol_for;
    hasRequiredEs_symbol_for = 1;
    var $ = require_export();
    var getBuiltIn = requireGetBuiltIn();
    var hasOwn = requireHasOwnProperty();
    var toString = requireToString();
    var shared = requireShared();
    var NATIVE_SYMBOL_REGISTRY = requireSymbolRegistryDetection();
    var StringToSymbolRegistry = shared('string-to-symbol-registry');
    var SymbolToStringRegistry = shared('symbol-to-string-registry');

    // `Symbol.for` method
    // https://tc39.es/ecma262/#sec-symbol.for
    $({
      target: 'Symbol',
      stat: true,
      forced: !NATIVE_SYMBOL_REGISTRY
    }, {
      'for': function _for(key) {
        var string = toString(key);
        if (hasOwn(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
        var symbol = getBuiltIn('Symbol')(string);
        StringToSymbolRegistry[string] = symbol;
        SymbolToStringRegistry[symbol] = string;
        return symbol;
      }
    });
    return es_symbol_for;
  }

  var es_symbol_keyFor = {};

  var hasRequiredEs_symbol_keyFor;
  function requireEs_symbol_keyFor() {
    if (hasRequiredEs_symbol_keyFor) return es_symbol_keyFor;
    hasRequiredEs_symbol_keyFor = 1;
    var $ = require_export();
    var hasOwn = requireHasOwnProperty();
    var isSymbol = requireIsSymbol();
    var tryToString = requireTryToString();
    var shared = requireShared();
    var NATIVE_SYMBOL_REGISTRY = requireSymbolRegistryDetection();
    var SymbolToStringRegistry = shared('symbol-to-string-registry');

    // `Symbol.keyFor` method
    // https://tc39.es/ecma262/#sec-symbol.keyfor
    $({
      target: 'Symbol',
      stat: true,
      forced: !NATIVE_SYMBOL_REGISTRY
    }, {
      keyFor: function keyFor(sym) {
        if (!isSymbol(sym)) throw new TypeError(tryToString(sym) + ' is not a symbol');
        if (hasOwn(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
      }
    });
    return es_symbol_keyFor;
  }

  var es_json_stringify = {};

  var getJsonReplacerFunction;
  var hasRequiredGetJsonReplacerFunction;
  function requireGetJsonReplacerFunction() {
    if (hasRequiredGetJsonReplacerFunction) return getJsonReplacerFunction;
    hasRequiredGetJsonReplacerFunction = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var isArray = requireIsArray();
    var isCallable = requireIsCallable();
    var classof = requireClassofRaw();
    var toString = requireToString();
    var push = uncurryThis([].push);
    getJsonReplacerFunction = function getJsonReplacerFunction(replacer) {
      if (isCallable(replacer)) return replacer;
      if (!isArray(replacer)) return;
      var rawLength = replacer.length;
      var keys = [];
      for (var i = 0; i < rawLength; i++) {
        var element = replacer[i];
        if (typeof element == 'string') push(keys, element);else if (typeof element == 'number' || classof(element) === 'Number' || classof(element) === 'String') push(keys, toString(element));
      }
      var keysLength = keys.length;
      var root = true;
      return function (key, value) {
        if (root) {
          root = false;
          return value;
        }
        if (isArray(this)) return value;
        for (var j = 0; j < keysLength; j++) if (keys[j] === key) return value;
      };
    };
    return getJsonReplacerFunction;
  }

  var hasRequiredEs_json_stringify;
  function requireEs_json_stringify() {
    if (hasRequiredEs_json_stringify) return es_json_stringify;
    hasRequiredEs_json_stringify = 1;
    var $ = require_export();
    var getBuiltIn = requireGetBuiltIn();
    var apply = requireFunctionApply();
    var call = requireFunctionCall();
    var uncurryThis = requireFunctionUncurryThis();
    var fails = requireFails();
    var isCallable = requireIsCallable();
    var isSymbol = requireIsSymbol();
    var arraySlice = requireArraySlice();
    var getReplacerFunction = requireGetJsonReplacerFunction();
    var NATIVE_SYMBOL = requireSymbolConstructorDetection();
    var $String = String;
    var $stringify = getBuiltIn('JSON', 'stringify');
    var exec = uncurryThis(/./.exec);
    var charAt = uncurryThis(''.charAt);
    var charCodeAt = uncurryThis(''.charCodeAt);
    var replace = uncurryThis(''.replace);
    var numberToString = uncurryThis(1.1.toString);
    var tester = /[\uD800-\uDFFF]/g;
    var low = /^[\uD800-\uDBFF]$/;
    var hi = /^[\uDC00-\uDFFF]$/;
    var WRONG_SYMBOLS_CONVERSION = !NATIVE_SYMBOL || fails(function () {
      var symbol = getBuiltIn('Symbol')('stringify detection');
      // MS Edge converts symbol values to JSON as {}
      return $stringify([symbol]) !== '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify({
        a: symbol
      }) !== '{}'
      // V8 throws on boxed symbols
      || $stringify(Object(symbol)) !== '{}';
    });

    // https://github.com/tc39/proposal-well-formed-stringify
    var ILL_FORMED_UNICODE = fails(function () {
      return $stringify("\uDF06\uD834") !== "\"\\udf06\\ud834\"" || $stringify("\uDEAD") !== "\"\\udead\"";
    });
    var stringifyWithSymbolsFix = function stringifyWithSymbolsFix(it, replacer) {
      var args = arraySlice(arguments);
      var $replacer = getReplacerFunction(replacer);
      if (!isCallable($replacer) && (it === undefined || isSymbol(it))) return; // IE8 returns string on undefined
      args[1] = function (key, value) {
        // some old implementations (like WebKit) could pass numbers as keys
        if (isCallable($replacer)) value = call($replacer, this, $String(key), value);
        if (!isSymbol(value)) return value;
      };
      return apply($stringify, null, args);
    };
    var fixIllFormed = function fixIllFormed(match, offset, string) {
      var prev = charAt(string, offset - 1);
      var next = charAt(string, offset + 1);
      if (exec(low, match) && !exec(hi, next) || exec(hi, match) && !exec(low, prev)) {
        return "\\u" + numberToString(charCodeAt(match, 0), 16);
      }
      return match;
    };
    if ($stringify) {
      // `JSON.stringify` method
      // https://tc39.es/ecma262/#sec-json.stringify
      $({
        target: 'JSON',
        stat: true,
        arity: 3,
        forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE
      }, {
        // eslint-disable-next-line no-unused-vars -- required for `.length`
        stringify: function stringify(it, replacer, space) {
          var args = arraySlice(arguments);
          var result = apply(WRONG_SYMBOLS_CONVERSION ? stringifyWithSymbolsFix : $stringify, null, args);
          return ILL_FORMED_UNICODE && typeof result == 'string' ? replace(result, tester, fixIllFormed) : result;
        }
      });
    }
    return es_json_stringify;
  }

  var es_object_getOwnPropertySymbols = {};

  var hasRequiredEs_object_getOwnPropertySymbols;
  function requireEs_object_getOwnPropertySymbols() {
    if (hasRequiredEs_object_getOwnPropertySymbols) return es_object_getOwnPropertySymbols;
    hasRequiredEs_object_getOwnPropertySymbols = 1;
    var $ = require_export();
    var NATIVE_SYMBOL = requireSymbolConstructorDetection();
    var fails = requireFails();
    var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
    var toObject = requireToObject();

    // V8 ~ Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
    // https://bugs.chromium.org/p/v8/issues/detail?id=3443
    var FORCED = !NATIVE_SYMBOL || fails(function () {
      getOwnPropertySymbolsModule.f(1);
    });

    // `Object.getOwnPropertySymbols` method
    // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
    $({
      target: 'Object',
      stat: true,
      forced: FORCED
    }, {
      getOwnPropertySymbols: function getOwnPropertySymbols(it) {
        var $getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
        return $getOwnPropertySymbols ? $getOwnPropertySymbols(toObject(it)) : [];
      }
    });
    return es_object_getOwnPropertySymbols;
  }

  var hasRequiredEs_symbol;
  function requireEs_symbol() {
    if (hasRequiredEs_symbol) return es_symbol;
    hasRequiredEs_symbol = 1;
    // TODO: Remove this module from `core-js@4` since it's split to modules listed below
    requireEs_symbol_constructor();
    requireEs_symbol_for();
    requireEs_symbol_keyFor();
    requireEs_json_stringify();
    requireEs_object_getOwnPropertySymbols();
    return es_symbol;
  }

  requireEs_symbol();

  var es_symbol_iterator = {};

  var hasRequiredEs_symbol_iterator;
  function requireEs_symbol_iterator() {
    if (hasRequiredEs_symbol_iterator) return es_symbol_iterator;
    hasRequiredEs_symbol_iterator = 1;
    var defineWellKnownSymbol = requireWellKnownSymbolDefine();

    // `Symbol.iterator` well-known symbol
    // https://tc39.es/ecma262/#sec-symbol.iterator
    defineWellKnownSymbol('iterator');
    return es_symbol_iterator;
  }

  requireEs_symbol_iterator();

  var addToUnscopables;
  var hasRequiredAddToUnscopables;
  function requireAddToUnscopables() {
    if (hasRequiredAddToUnscopables) return addToUnscopables;
    hasRequiredAddToUnscopables = 1;
    var wellKnownSymbol = requireWellKnownSymbol();
    var create = requireObjectCreate();
    var defineProperty = requireObjectDefineProperty().f;
    var UNSCOPABLES = wellKnownSymbol('unscopables');
    var ArrayPrototype = Array.prototype;

    // Array.prototype[@@unscopables]
    // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
    if (ArrayPrototype[UNSCOPABLES] === undefined) {
      defineProperty(ArrayPrototype, UNSCOPABLES, {
        configurable: true,
        value: create(null)
      });
    }

    // add a key to Array.prototype[@@unscopables]
    addToUnscopables = function addToUnscopables(key) {
      ArrayPrototype[UNSCOPABLES][key] = true;
    };
    return addToUnscopables;
  }

  var iterators;
  var hasRequiredIterators;
  function requireIterators() {
    if (hasRequiredIterators) return iterators;
    hasRequiredIterators = 1;
    iterators = {};
    return iterators;
  }

  var web_domCollections_iterator = {};

  var hasRequiredWeb_domCollections_iterator;
  function requireWeb_domCollections_iterator() {
    if (hasRequiredWeb_domCollections_iterator) return web_domCollections_iterator;
    hasRequiredWeb_domCollections_iterator = 1;
    var globalThis = requireGlobalThis();
    var DOMIterables = requireDomIterables();
    var DOMTokenListPrototype = requireDomTokenListPrototype();
    var ArrayIteratorMethods = requireEs_array_iterator();
    var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
    var setToStringTag = requireSetToStringTag();
    var wellKnownSymbol = requireWellKnownSymbol();
    var ITERATOR = wellKnownSymbol('iterator');
    var ArrayValues = ArrayIteratorMethods.values;
    var handlePrototype = function handlePrototype(CollectionPrototype, COLLECTION_NAME) {
      if (CollectionPrototype) {
        // some Chrome versions have non-configurable methods on DOMTokenList
        if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
          createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
        } catch (error) {
          CollectionPrototype[ITERATOR] = ArrayValues;
        }
        setToStringTag(CollectionPrototype, COLLECTION_NAME, true);
        if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
          // some Chrome versions have non-configurable methods on DOMTokenList
          if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
            createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
          } catch (error) {
            CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
          }
        }
      }
    };
    for (var COLLECTION_NAME in DOMIterables) {
      handlePrototype(globalThis[COLLECTION_NAME] && globalThis[COLLECTION_NAME].prototype, COLLECTION_NAME);
    }
    handlePrototype(DOMTokenListPrototype, 'DOMTokenList');
    return web_domCollections_iterator;
  }

  requireWeb_domCollections_iterator();

  var es_object_getPrototypeOf = {};

  var correctPrototypeGetter;
  var hasRequiredCorrectPrototypeGetter;
  function requireCorrectPrototypeGetter() {
    if (hasRequiredCorrectPrototypeGetter) return correctPrototypeGetter;
    hasRequiredCorrectPrototypeGetter = 1;
    var fails = requireFails();
    correctPrototypeGetter = !fails(function () {
      function F() {/* empty */}
      F.prototype.constructor = null;
      // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
      return Object.getPrototypeOf(new F()) !== F.prototype;
    });
    return correctPrototypeGetter;
  }

  var hasRequiredEs_object_getPrototypeOf;
  function requireEs_object_getPrototypeOf() {
    if (hasRequiredEs_object_getPrototypeOf) return es_object_getPrototypeOf;
    hasRequiredEs_object_getPrototypeOf = 1;
    var $ = require_export();
    var fails = requireFails();
    var toObject = requireToObject();
    var nativeGetPrototypeOf = requireObjectGetPrototypeOf();
    var CORRECT_PROTOTYPE_GETTER = requireCorrectPrototypeGetter();
    var FAILS_ON_PRIMITIVES = fails(function () {
      nativeGetPrototypeOf(1);
    });

    // `Object.getPrototypeOf` method
    // https://tc39.es/ecma262/#sec-object.getprototypeof
    $({
      target: 'Object',
      stat: true,
      forced: FAILS_ON_PRIMITIVES,
      sham: !CORRECT_PROTOTYPE_GETTER
    }, {
      getPrototypeOf: function getPrototypeOf(it) {
        return nativeGetPrototypeOf(toObject(it));
      }
    });
    return es_object_getPrototypeOf;
  }

  requireEs_object_getPrototypeOf();

  var objectGetPrototypeOf;
  var hasRequiredObjectGetPrototypeOf;
  function requireObjectGetPrototypeOf() {
    if (hasRequiredObjectGetPrototypeOf) return objectGetPrototypeOf;
    hasRequiredObjectGetPrototypeOf = 1;
    var hasOwn = requireHasOwnProperty();
    var isCallable = requireIsCallable();
    var toObject = requireToObject();
    var sharedKey = requireSharedKey();
    var CORRECT_PROTOTYPE_GETTER = requireCorrectPrototypeGetter();
    var IE_PROTO = sharedKey('IE_PROTO');
    var $Object = Object;
    var ObjectPrototype = $Object.prototype;

    // `Object.getPrototypeOf` method
    // https://tc39.es/ecma262/#sec-object.getprototypeof
    // eslint-disable-next-line es/no-object-getprototypeof -- safe
    objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
      var object = toObject(O);
      if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
      var constructor = object.constructor;
      if (isCallable(constructor) && object instanceof constructor) {
        return constructor.prototype;
      }
      return object instanceof $Object ? ObjectPrototype : null;
    };
    return objectGetPrototypeOf;
  }

  var iteratorsCore;
  var hasRequiredIteratorsCore;
  function requireIteratorsCore() {
    if (hasRequiredIteratorsCore) return iteratorsCore;
    hasRequiredIteratorsCore = 1;
    var fails = requireFails();
    var isCallable = requireIsCallable();
    var isObject = requireIsObject();
    var create = requireObjectCreate();
    var getPrototypeOf = requireObjectGetPrototypeOf();
    var defineBuiltIn = requireDefineBuiltIn();
    var wellKnownSymbol = requireWellKnownSymbol();
    var IS_PURE = requireIsPure();
    var ITERATOR = wellKnownSymbol('iterator');
    var BUGGY_SAFARI_ITERATORS = false;

    // `%IteratorPrototype%` object
    // https://tc39.es/ecma262/#sec-%iteratorprototype%-object
    var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

    /* eslint-disable es/no-array-prototype-keys -- safe */
    if ([].keys) {
      arrayIterator = [].keys();
      // Safari 8 has buggy iterators w/o `next`
      if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;else {
        PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
        if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
      }
    }
    var NEW_ITERATOR_PROTOTYPE = !isObject(IteratorPrototype) || fails(function () {
      var test = {};
      // FF44- legacy iterators case
      return IteratorPrototype[ITERATOR].call(test) !== test;
    });
    if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);

    // `%IteratorPrototype%[@@iterator]()` method
    // https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
    if (!isCallable(IteratorPrototype[ITERATOR])) {
      defineBuiltIn(IteratorPrototype, ITERATOR, function () {
        return this;
      });
    }
    iteratorsCore = {
      IteratorPrototype: IteratorPrototype,
      BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
    };
    return iteratorsCore;
  }

  var iteratorCreateConstructor;
  var hasRequiredIteratorCreateConstructor;
  function requireIteratorCreateConstructor() {
    if (hasRequiredIteratorCreateConstructor) return iteratorCreateConstructor;
    hasRequiredIteratorCreateConstructor = 1;
    var IteratorPrototype = requireIteratorsCore().IteratorPrototype;
    var create = requireObjectCreate();
    var createPropertyDescriptor = requireCreatePropertyDescriptor();
    var setToStringTag = requireSetToStringTag();
    var Iterators = requireIterators();
    var returnThis = function returnThis() {
      return this;
    };
    iteratorCreateConstructor = function iteratorCreateConstructor(IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
      var TO_STRING_TAG = NAME + ' Iterator';
      IteratorConstructor.prototype = create(IteratorPrototype, {
        next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next)
      });
      setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
      Iterators[TO_STRING_TAG] = returnThis;
      return IteratorConstructor;
    };
    return iteratorCreateConstructor;
  }

  var functionUncurryThisAccessor;
  var hasRequiredFunctionUncurryThisAccessor;
  function requireFunctionUncurryThisAccessor() {
    if (hasRequiredFunctionUncurryThisAccessor) return functionUncurryThisAccessor;
    hasRequiredFunctionUncurryThisAccessor = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var aCallable = requireACallable();
    functionUncurryThisAccessor = function functionUncurryThisAccessor(object, key, method) {
      try {
        // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
        return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
      } catch (error) {/* empty */}
    };
    return functionUncurryThisAccessor;
  }

  var isPossiblePrototype;
  var hasRequiredIsPossiblePrototype;
  function requireIsPossiblePrototype() {
    if (hasRequiredIsPossiblePrototype) return isPossiblePrototype;
    hasRequiredIsPossiblePrototype = 1;
    var isObject = requireIsObject();
    isPossiblePrototype = function isPossiblePrototype(argument) {
      return isObject(argument) || argument === null;
    };
    return isPossiblePrototype;
  }

  var aPossiblePrototype;
  var hasRequiredAPossiblePrototype;
  function requireAPossiblePrototype() {
    if (hasRequiredAPossiblePrototype) return aPossiblePrototype;
    hasRequiredAPossiblePrototype = 1;
    var isPossiblePrototype = requireIsPossiblePrototype();
    var $String = String;
    var $TypeError = TypeError;
    aPossiblePrototype = function aPossiblePrototype(argument) {
      if (isPossiblePrototype(argument)) return argument;
      throw new $TypeError("Can't set " + $String(argument) + ' as a prototype');
    };
    return aPossiblePrototype;
  }

  var objectSetPrototypeOf;
  var hasRequiredObjectSetPrototypeOf;
  function requireObjectSetPrototypeOf() {
    if (hasRequiredObjectSetPrototypeOf) return objectSetPrototypeOf;
    hasRequiredObjectSetPrototypeOf = 1;
    /* eslint-disable no-proto -- safe */
    var uncurryThisAccessor = requireFunctionUncurryThisAccessor();
    var isObject = requireIsObject();
    var requireObjectCoercible = requireRequireObjectCoercible();
    var aPossiblePrototype = requireAPossiblePrototype();

    // `Object.setPrototypeOf` method
    // https://tc39.es/ecma262/#sec-object.setprototypeof
    // Works with __proto__ only. Old v8 can't work with null proto objects.
    // eslint-disable-next-line es/no-object-setprototypeof -- safe
    objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
      var CORRECT_SETTER = false;
      var test = {};
      var setter;
      try {
        setter = uncurryThisAccessor(Object.prototype, '__proto__', 'set');
        setter(test, []);
        CORRECT_SETTER = test instanceof Array;
      } catch (error) {/* empty */}
      return function setPrototypeOf(O, proto) {
        requireObjectCoercible(O);
        aPossiblePrototype(proto);
        if (!isObject(O)) return O;
        if (CORRECT_SETTER) setter(O, proto);else O.__proto__ = proto;
        return O;
      };
    }() : undefined);
    return objectSetPrototypeOf;
  }

  var iteratorDefine;
  var hasRequiredIteratorDefine;
  function requireIteratorDefine() {
    if (hasRequiredIteratorDefine) return iteratorDefine;
    hasRequiredIteratorDefine = 1;
    var $ = require_export();
    var call = requireFunctionCall();
    var IS_PURE = requireIsPure();
    var FunctionName = requireFunctionName();
    var isCallable = requireIsCallable();
    var createIteratorConstructor = requireIteratorCreateConstructor();
    var getPrototypeOf = requireObjectGetPrototypeOf();
    var setPrototypeOf = requireObjectSetPrototypeOf();
    var setToStringTag = requireSetToStringTag();
    var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
    var defineBuiltIn = requireDefineBuiltIn();
    var wellKnownSymbol = requireWellKnownSymbol();
    var Iterators = requireIterators();
    var IteratorsCore = requireIteratorsCore();
    var PROPER_FUNCTION_NAME = FunctionName.PROPER;
    var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
    var IteratorPrototype = IteratorsCore.IteratorPrototype;
    var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
    var ITERATOR = wellKnownSymbol('iterator');
    var KEYS = 'keys';
    var VALUES = 'values';
    var ENTRIES = 'entries';
    var returnThis = function returnThis() {
      return this;
    };
    iteratorDefine = function iteratorDefine(Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
      createIteratorConstructor(IteratorConstructor, NAME, next);
      var getIterationMethod = function getIterationMethod(KIND) {
        if (KIND === DEFAULT && defaultIterator) return defaultIterator;
        if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];
        switch (KIND) {
          case KEYS:
            return function keys() {
              return new IteratorConstructor(this, KIND);
            };
          case VALUES:
            return function values() {
              return new IteratorConstructor(this, KIND);
            };
          case ENTRIES:
            return function entries() {
              return new IteratorConstructor(this, KIND);
            };
        }
        return function () {
          return new IteratorConstructor(this);
        };
      };
      var TO_STRING_TAG = NAME + ' Iterator';
      var INCORRECT_VALUES_NAME = false;
      var IterablePrototype = Iterable.prototype;
      var nativeIterator = IterablePrototype[ITERATOR] || IterablePrototype['@@iterator'] || DEFAULT && IterablePrototype[DEFAULT];
      var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
      var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
      var CurrentIteratorPrototype, methods, KEY;

      // fix native
      if (anyNativeIterator) {
        CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
        if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
          if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
            if (setPrototypeOf) {
              setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
            } else if (!isCallable(CurrentIteratorPrototype[ITERATOR])) {
              defineBuiltIn(CurrentIteratorPrototype, ITERATOR, returnThis);
            }
          }
          // Set @@toStringTag to native iterators
          setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
          if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
        }
      }

      // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
      if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
        if (!IS_PURE && CONFIGURABLE_FUNCTION_NAME) {
          createNonEnumerableProperty(IterablePrototype, 'name', VALUES);
        } else {
          INCORRECT_VALUES_NAME = true;
          defaultIterator = function values() {
            return call(nativeIterator, this);
          };
        }
      }

      // export additional methods
      if (DEFAULT) {
        methods = {
          values: getIterationMethod(VALUES),
          keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
          entries: getIterationMethod(ENTRIES)
        };
        if (FORCED) for (KEY in methods) {
          if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
            defineBuiltIn(IterablePrototype, KEY, methods[KEY]);
          }
        } else $({
          target: NAME,
          proto: true,
          forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME
        }, methods);
      }

      // define iterator
      if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
        defineBuiltIn(IterablePrototype, ITERATOR, defaultIterator, {
          name: DEFAULT
        });
      }
      Iterators[NAME] = defaultIterator;
      return methods;
    };
    return iteratorDefine;
  }

  var createIterResultObject;
  var hasRequiredCreateIterResultObject;
  function requireCreateIterResultObject() {
    if (hasRequiredCreateIterResultObject) return createIterResultObject;
    hasRequiredCreateIterResultObject = 1;
    // `CreateIterResultObject` abstract operation
    // https://tc39.es/ecma262/#sec-createiterresultobject
    createIterResultObject = function createIterResultObject(value, done) {
      return {
        value: value,
        done: done
      };
    };
    return createIterResultObject;
  }

  var es_array_iterator;
  var hasRequiredEs_array_iterator;
  function requireEs_array_iterator() {
    if (hasRequiredEs_array_iterator) return es_array_iterator;
    hasRequiredEs_array_iterator = 1;
    var toIndexedObject = requireToIndexedObject();
    var addToUnscopables = requireAddToUnscopables();
    var Iterators = requireIterators();
    var InternalStateModule = requireInternalState();
    var defineProperty = requireObjectDefineProperty().f;
    var defineIterator = requireIteratorDefine();
    var createIterResultObject = requireCreateIterResultObject();
    var IS_PURE = requireIsPure();
    var DESCRIPTORS = requireDescriptors();
    var ARRAY_ITERATOR = 'Array Iterator';
    var setInternalState = InternalStateModule.set;
    var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

    // `Array.prototype.entries` method
    // https://tc39.es/ecma262/#sec-array.prototype.entries
    // `Array.prototype.keys` method
    // https://tc39.es/ecma262/#sec-array.prototype.keys
    // `Array.prototype.values` method
    // https://tc39.es/ecma262/#sec-array.prototype.values
    // `Array.prototype[@@iterator]` method
    // https://tc39.es/ecma262/#sec-array.prototype-@@iterator
    // `CreateArrayIterator` internal method
    // https://tc39.es/ecma262/#sec-createarrayiterator
    es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
      setInternalState(this, {
        type: ARRAY_ITERATOR,
        target: toIndexedObject(iterated),
        // target
        index: 0,
        // next index
        kind: kind // kind
      });
      // `%ArrayIteratorPrototype%.next` method
      // https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
    }, function () {
      var state = getInternalState(this);
      var target = state.target;
      var index = state.index++;
      if (!target || index >= target.length) {
        state.target = null;
        return createIterResultObject(undefined, true);
      }
      switch (state.kind) {
        case 'keys':
          return createIterResultObject(index, false);
        case 'values':
          return createIterResultObject(target[index], false);
      }
      return createIterResultObject([index, target[index]], false);
    }, 'values');

    // argumentsList[@@iterator] is %ArrayProto_values%
    // https://tc39.es/ecma262/#sec-createunmappedargumentsobject
    // https://tc39.es/ecma262/#sec-createmappedargumentsobject
    var values = Iterators.Arguments = Iterators.Array;

    // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
    addToUnscopables('keys');
    addToUnscopables('values');
    addToUnscopables('entries');

    // V8 ~ Chrome 45- bug
    if (!IS_PURE && DESCRIPTORS && values.name !== 'values') try {
      defineProperty(values, 'name', {
        value: 'values'
      });
    } catch (error) {/* empty */}
    return es_array_iterator;
  }

  requireEs_array_iterator();

  var es_string_iterator = {};

  var hasRequiredEs_string_iterator;
  function requireEs_string_iterator() {
    if (hasRequiredEs_string_iterator) return es_string_iterator;
    hasRequiredEs_string_iterator = 1;
    var charAt = requireStringMultibyte().charAt;
    var toString = requireToString();
    var InternalStateModule = requireInternalState();
    var defineIterator = requireIteratorDefine();
    var createIterResultObject = requireCreateIterResultObject();
    var STRING_ITERATOR = 'String Iterator';
    var setInternalState = InternalStateModule.set;
    var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

    // `String.prototype[@@iterator]` method
    // https://tc39.es/ecma262/#sec-string.prototype-@@iterator
    defineIterator(String, 'String', function (iterated) {
      setInternalState(this, {
        type: STRING_ITERATOR,
        string: toString(iterated),
        index: 0
      });
      // `%StringIteratorPrototype%.next` method
      // https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
    }, function next() {
      var state = getInternalState(this);
      var string = state.string;
      var index = state.index;
      var point;
      if (index >= string.length) return createIterResultObject(undefined, true);
      point = charAt(string, index);
      state.index += point.length;
      return createIterResultObject(point, false);
    });
    return es_string_iterator;
  }

  requireEs_string_iterator();

  var useSymbolAsUid;
  var hasRequiredUseSymbolAsUid;
  function requireUseSymbolAsUid() {
    if (hasRequiredUseSymbolAsUid) return useSymbolAsUid;
    hasRequiredUseSymbolAsUid = 1;
    /* eslint-disable es/no-symbol -- required for testing */
    var NATIVE_SYMBOL = requireSymbolConstructorDetection();
    useSymbolAsUid = NATIVE_SYMBOL && !Symbol.sham && _typeof(Symbol.iterator) == 'symbol';
    return useSymbolAsUid;
  }

  var isSymbol;
  var hasRequiredIsSymbol;
  function requireIsSymbol() {
    if (hasRequiredIsSymbol) return isSymbol;
    hasRequiredIsSymbol = 1;
    var getBuiltIn = requireGetBuiltIn();
    var isCallable = requireIsCallable();
    var isPrototypeOf = requireObjectIsPrototypeOf();
    var USE_SYMBOL_AS_UID = requireUseSymbolAsUid();
    var $Object = Object;
    isSymbol = USE_SYMBOL_AS_UID ? function (it) {
      return _typeof(it) == 'symbol';
    } : function (it) {
      var $Symbol = getBuiltIn('Symbol');
      return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
    };
    return isSymbol;
  }

  var ordinaryToPrimitive;
  var hasRequiredOrdinaryToPrimitive;
  function requireOrdinaryToPrimitive() {
    if (hasRequiredOrdinaryToPrimitive) return ordinaryToPrimitive;
    hasRequiredOrdinaryToPrimitive = 1;
    var call = requireFunctionCall();
    var isCallable = requireIsCallable();
    var isObject = requireIsObject();
    var $TypeError = TypeError;

    // `OrdinaryToPrimitive` abstract operation
    // https://tc39.es/ecma262/#sec-ordinarytoprimitive
    ordinaryToPrimitive = function ordinaryToPrimitive(input, pref) {
      var fn, val;
      if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
      if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
      if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
      throw new $TypeError("Can't convert object to primitive value");
    };
    return ordinaryToPrimitive;
  }

  var toPrimitive;
  var hasRequiredToPrimitive;
  function requireToPrimitive() {
    if (hasRequiredToPrimitive) return toPrimitive;
    hasRequiredToPrimitive = 1;
    var call = requireFunctionCall();
    var isObject = requireIsObject();
    var isSymbol = requireIsSymbol();
    var getMethod = requireGetMethod();
    var ordinaryToPrimitive = requireOrdinaryToPrimitive();
    var wellKnownSymbol = requireWellKnownSymbol();
    var $TypeError = TypeError;
    var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

    // `ToPrimitive` abstract operation
    // https://tc39.es/ecma262/#sec-toprimitive
    toPrimitive = function toPrimitive(input, pref) {
      if (!isObject(input) || isSymbol(input)) return input;
      var exoticToPrim = getMethod(input, TO_PRIMITIVE);
      var result;
      if (exoticToPrim) {
        if (pref === undefined) pref = 'default';
        result = call(exoticToPrim, input, pref);
        if (!isObject(result) || isSymbol(result)) return result;
        throw new $TypeError("Can't convert object to primitive value");
      }
      if (pref === undefined) pref = 'number';
      return ordinaryToPrimitive(input, pref);
    };
    return toPrimitive;
  }

  var toPropertyKey;
  var hasRequiredToPropertyKey;
  function requireToPropertyKey() {
    if (hasRequiredToPropertyKey) return toPropertyKey;
    hasRequiredToPropertyKey = 1;
    var toPrimitive = requireToPrimitive();
    var isSymbol = requireIsSymbol();

    // `ToPropertyKey` abstract operation
    // https://tc39.es/ecma262/#sec-topropertykey
    toPropertyKey = function toPropertyKey(argument) {
      var key = toPrimitive(argument, 'string');
      return isSymbol(key) ? key : key + '';
    };
    return toPropertyKey;
  }

  var hasRequiredObjectDefineProperty;
  function requireObjectDefineProperty() {
    if (hasRequiredObjectDefineProperty) return objectDefineProperty;
    hasRequiredObjectDefineProperty = 1;
    var DESCRIPTORS = requireDescriptors();
    var IE8_DOM_DEFINE = requireIe8DomDefine();
    var V8_PROTOTYPE_DEFINE_BUG = requireV8PrototypeDefineBug();
    var anObject = requireAnObject();
    var toPropertyKey = requireToPropertyKey();
    var $TypeError = TypeError;
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    var $defineProperty = Object.defineProperty;
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var ENUMERABLE = 'enumerable';
    var CONFIGURABLE = 'configurable';
    var WRITABLE = 'writable';

    // `Object.defineProperty` method
    // https://tc39.es/ecma262/#sec-object.defineproperty
    objectDefineProperty.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPropertyKey(P);
      anObject(Attributes);
      if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
        var current = $getOwnPropertyDescriptor(O, P);
        if (current && current[WRITABLE]) {
          O[P] = Attributes.value;
          Attributes = {
            configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
            enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
            writable: false
          };
        }
      }
      return $defineProperty(O, P, Attributes);
    } : $defineProperty : function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPropertyKey(P);
      anObject(Attributes);
      if (IE8_DOM_DEFINE) try {
        return $defineProperty(O, P, Attributes);
      } catch (error) {/* empty */}
      if ('get' in Attributes || 'set' in Attributes) throw new $TypeError('Accessors not supported');
      if ('value' in Attributes) O[P] = Attributes.value;
      return O;
    };
    return objectDefineProperty;
  }

  var createNonEnumerableProperty;
  var hasRequiredCreateNonEnumerableProperty;
  function requireCreateNonEnumerableProperty() {
    if (hasRequiredCreateNonEnumerableProperty) return createNonEnumerableProperty;
    hasRequiredCreateNonEnumerableProperty = 1;
    var DESCRIPTORS = requireDescriptors();
    var definePropertyModule = requireObjectDefineProperty();
    var createPropertyDescriptor = requireCreatePropertyDescriptor();
    createNonEnumerableProperty = DESCRIPTORS ? function (object, key, value) {
      return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
    } : function (object, key, value) {
      object[key] = value;
      return object;
    };
    return createNonEnumerableProperty;
  }

  var internalState;
  var hasRequiredInternalState;
  function requireInternalState() {
    if (hasRequiredInternalState) return internalState;
    hasRequiredInternalState = 1;
    var NATIVE_WEAK_MAP = requireWeakMapBasicDetection();
    var globalThis = requireGlobalThis();
    var isObject = requireIsObject();
    var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
    var hasOwn = requireHasOwnProperty();
    var shared = requireSharedStore();
    var sharedKey = requireSharedKey();
    var hiddenKeys = requireHiddenKeys();
    var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
    var TypeError = globalThis.TypeError;
    var WeakMap = globalThis.WeakMap;
    var set, get, has;
    var enforce = function enforce(it) {
      return has(it) ? get(it) : set(it, {});
    };
    var getterFor = function getterFor(TYPE) {
      return function (it) {
        var state;
        if (!isObject(it) || (state = get(it)).type !== TYPE) {
          throw new TypeError('Incompatible receiver, ' + TYPE + ' required');
        }
        return state;
      };
    };
    if (NATIVE_WEAK_MAP || shared.state) {
      var store = shared.state || (shared.state = new WeakMap());
      /* eslint-disable no-self-assign -- prototype methods protection */
      store.get = store.get;
      store.has = store.has;
      store.set = store.set;
      /* eslint-enable no-self-assign -- prototype methods protection */
      set = function set(it, metadata) {
        if (store.has(it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
        metadata.facade = it;
        store.set(it, metadata);
        return metadata;
      };
      get = function get(it) {
        return store.get(it) || {};
      };
      has = function has(it) {
        return store.has(it);
      };
    } else {
      var STATE = sharedKey('state');
      hiddenKeys[STATE] = true;
      set = function set(it, metadata) {
        if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
        metadata.facade = it;
        createNonEnumerableProperty(it, STATE, metadata);
        return metadata;
      };
      get = function get(it) {
        return hasOwn(it, STATE) ? it[STATE] : {};
      };
      has = function has(it) {
        return hasOwn(it, STATE);
      };
    }
    internalState = {
      set: set,
      get: get,
      has: has,
      enforce: enforce,
      getterFor: getterFor
    };
    return internalState;
  }

  var hasRequiredMakeBuiltIn;
  function requireMakeBuiltIn() {
    if (hasRequiredMakeBuiltIn) return makeBuiltIn.exports;
    hasRequiredMakeBuiltIn = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var fails = requireFails();
    var isCallable = requireIsCallable();
    var hasOwn = requireHasOwnProperty();
    var DESCRIPTORS = requireDescriptors();
    var CONFIGURABLE_FUNCTION_NAME = requireFunctionName().CONFIGURABLE;
    var inspectSource = requireInspectSource();
    var InternalStateModule = requireInternalState();
    var enforceInternalState = InternalStateModule.enforce;
    var getInternalState = InternalStateModule.get;
    var $String = String;
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    var defineProperty = Object.defineProperty;
    var stringSlice = uncurryThis(''.slice);
    var replace = uncurryThis(''.replace);
    var join = uncurryThis([].join);
    var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails(function () {
      return defineProperty(function () {/* empty */}, 'length', {
        value: 8
      }).length !== 8;
    });
    var TEMPLATE = String(String).split('String');
    var makeBuiltIn$1 = makeBuiltIn.exports = function (value, name, options) {
      if (stringSlice($String(name), 0, 7) === 'Symbol(') {
        name = '[' + replace($String(name), /^Symbol\(([^)]*)\).*$/, '$1') + ']';
      }
      if (options && options.getter) name = 'get ' + name;
      if (options && options.setter) name = 'set ' + name;
      if (!hasOwn(value, 'name') || CONFIGURABLE_FUNCTION_NAME && value.name !== name) {
        if (DESCRIPTORS) defineProperty(value, 'name', {
          value: name,
          configurable: true
        });else value.name = name;
      }
      if (CONFIGURABLE_LENGTH && options && hasOwn(options, 'arity') && value.length !== options.arity) {
        defineProperty(value, 'length', {
          value: options.arity
        });
      }
      try {
        if (options && hasOwn(options, 'constructor') && options.constructor) {
          if (DESCRIPTORS) defineProperty(value, 'prototype', {
            writable: false
          });
          // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
        } else if (value.prototype) value.prototype = undefined;
      } catch (error) {/* empty */}
      var state = enforceInternalState(value);
      if (!hasOwn(state, 'source')) {
        state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
      }
      return value;
    };

    // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    // eslint-disable-next-line no-extend-native -- required
    Function.prototype.toString = makeBuiltIn$1(function toString() {
      return isCallable(this) && getInternalState(this).source || inspectSource(this);
    }, 'toString');
    return makeBuiltIn.exports;
  }

  var defineBuiltInAccessor;
  var hasRequiredDefineBuiltInAccessor;
  function requireDefineBuiltInAccessor() {
    if (hasRequiredDefineBuiltInAccessor) return defineBuiltInAccessor;
    hasRequiredDefineBuiltInAccessor = 1;
    var makeBuiltIn = requireMakeBuiltIn();
    var defineProperty = requireObjectDefineProperty();
    defineBuiltInAccessor = function defineBuiltInAccessor(target, name, descriptor) {
      if (descriptor.get) makeBuiltIn(descriptor.get, name, {
        getter: true
      });
      if (descriptor.set) makeBuiltIn(descriptor.set, name, {
        setter: true
      });
      return defineProperty.f(target, name, descriptor);
    };
    return defineBuiltInAccessor;
  }

  var hasRequiredEs_function_name;
  function requireEs_function_name() {
    if (hasRequiredEs_function_name) return es_function_name;
    hasRequiredEs_function_name = 1;
    var DESCRIPTORS = requireDescriptors();
    var FUNCTION_NAME_EXISTS = requireFunctionName().EXISTS;
    var uncurryThis = requireFunctionUncurryThis();
    var defineBuiltInAccessor = requireDefineBuiltInAccessor();
    var FunctionPrototype = Function.prototype;
    var functionToString = uncurryThis(FunctionPrototype.toString);
    var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
    var regExpExec = uncurryThis(nameRE.exec);
    var NAME = 'name';

    // Function instances `.name` property
    // https://tc39.es/ecma262/#sec-function-instances-name
    if (DESCRIPTORS && !FUNCTION_NAME_EXISTS) {
      defineBuiltInAccessor(FunctionPrototype, NAME, {
        configurable: true,
        get: function get() {
          try {
            return regExpExec(nameRE, functionToString(this))[1];
          } catch (error) {
            return '';
          }
        }
      });
    }
    return es_function_name;
  }

  requireEs_function_name();

  var es_regexp_toString = {};

  var hasRequiredEs_regexp_toString;
  function requireEs_regexp_toString() {
    if (hasRequiredEs_regexp_toString) return es_regexp_toString;
    hasRequiredEs_regexp_toString = 1;
    var PROPER_FUNCTION_NAME = requireFunctionName().PROPER;
    var defineBuiltIn = requireDefineBuiltIn();
    var anObject = requireAnObject();
    var $toString = requireToString();
    var fails = requireFails();
    var getRegExpFlags = requireRegexpGetFlags();
    var TO_STRING = 'toString';
    var RegExpPrototype = RegExp.prototype;
    var nativeToString = RegExpPrototype[TO_STRING];
    var NOT_GENERIC = fails(function () {
      return nativeToString.call({
        source: 'a',
        flags: 'b'
      }) !== '/a/b';
    });
    // FF44- RegExp#toString has a wrong name
    var INCORRECT_NAME = PROPER_FUNCTION_NAME && nativeToString.name !== TO_STRING;

    // `RegExp.prototype.toString` method
    // https://tc39.es/ecma262/#sec-regexp.prototype.tostring
    if (NOT_GENERIC || INCORRECT_NAME) {
      defineBuiltIn(RegExpPrototype, TO_STRING, function toString() {
        var R = anObject(this);
        var pattern = $toString(R.source);
        var flags = $toString(getRegExpFlags(R));
        return '/' + pattern + '/' + flags;
      }, {
        unsafe: true
      });
    }
    return es_regexp_toString;
  }

  requireEs_regexp_toString();

  var uid;
  var hasRequiredUid;
  function requireUid() {
    if (hasRequiredUid) return uid;
    hasRequiredUid = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var id = 0;
    var postfix = Math.random();
    var toString = uncurryThis(1.1.toString);
    uid = function uid(key) {
      return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
    };
    return uid;
  }

  var wellKnownSymbol;
  var hasRequiredWellKnownSymbol;
  function requireWellKnownSymbol() {
    if (hasRequiredWellKnownSymbol) return wellKnownSymbol;
    hasRequiredWellKnownSymbol = 1;
    var globalThis = requireGlobalThis();
    var shared = requireShared();
    var hasOwn = requireHasOwnProperty();
    var uid = requireUid();
    var NATIVE_SYMBOL = requireSymbolConstructorDetection();
    var USE_SYMBOL_AS_UID = requireUseSymbolAsUid();
    var _Symbol = globalThis.Symbol;
    var WellKnownSymbolsStore = shared('wks');
    var createWellKnownSymbol = USE_SYMBOL_AS_UID ? _Symbol['for'] || _Symbol : _Symbol && _Symbol.withoutSetter || uid;
    wellKnownSymbol = function wellKnownSymbol(name) {
      if (!hasOwn(WellKnownSymbolsStore, name)) {
        WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(_Symbol, name) ? _Symbol[name] : createWellKnownSymbol('Symbol.' + name);
      }
      return WellKnownSymbolsStore[name];
    };
    return wellKnownSymbol;
  }

  var toStringTagSupport;
  var hasRequiredToStringTagSupport;
  function requireToStringTagSupport() {
    if (hasRequiredToStringTagSupport) return toStringTagSupport;
    hasRequiredToStringTagSupport = 1;
    var wellKnownSymbol = requireWellKnownSymbol();
    var TO_STRING_TAG = wellKnownSymbol('toStringTag');
    var test = {};
    test[TO_STRING_TAG] = 'z';
    toStringTagSupport = String(test) === '[object z]';
    return toStringTagSupport;
  }

  var objectToString;
  var hasRequiredObjectToString;
  function requireObjectToString() {
    if (hasRequiredObjectToString) return objectToString;
    hasRequiredObjectToString = 1;
    var TO_STRING_TAG_SUPPORT = requireToStringTagSupport();
    var classof = requireClassof();

    // `Object.prototype.toString` method implementation
    // https://tc39.es/ecma262/#sec-object.prototype.tostring
    objectToString = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
      return '[object ' + classof(this) + ']';
    };
    return objectToString;
  }

  var hasRequiredEs_object_toString;
  function requireEs_object_toString() {
    if (hasRequiredEs_object_toString) return es_object_toString;
    hasRequiredEs_object_toString = 1;
    var TO_STRING_TAG_SUPPORT = requireToStringTagSupport();
    var defineBuiltIn = requireDefineBuiltIn();
    var toString = requireObjectToString();

    // `Object.prototype.toString` method
    // https://tc39.es/ecma262/#sec-object.prototype.tostring
    if (!TO_STRING_TAG_SUPPORT) {
      defineBuiltIn(Object.prototype, 'toString', toString, {
        unsafe: true
      });
    }
    return es_object_toString;
  }

  requireEs_object_toString();

  var es_reflect_apply = {};

  var hasRequiredEs_reflect_apply;
  function requireEs_reflect_apply() {
    if (hasRequiredEs_reflect_apply) return es_reflect_apply;
    hasRequiredEs_reflect_apply = 1;
    var $ = require_export();
    var functionApply = requireFunctionApply();
    var aCallable = requireACallable();
    var anObject = requireAnObject();
    var fails = requireFails();

    // MS Edge argumentsList argument is optional
    var OPTIONAL_ARGUMENTS_LIST = !fails(function () {
      // eslint-disable-next-line es/no-reflect -- required for testing
      Reflect.apply(function () {/* empty */});
    });

    // `Reflect.apply` method
    // https://tc39.es/ecma262/#sec-reflect.apply
    $({
      target: 'Reflect',
      stat: true,
      forced: OPTIONAL_ARGUMENTS_LIST
    }, {
      apply: function apply(target, thisArgument, argumentsList) {
        return functionApply(aCallable(target), thisArgument, anObject(argumentsList));
      }
    });
    return es_reflect_apply;
  }

  requireEs_reflect_apply();

  var functionApply;
  var hasRequiredFunctionApply;
  function requireFunctionApply() {
    if (hasRequiredFunctionApply) return functionApply;
    hasRequiredFunctionApply = 1;
    var NATIVE_BIND = requireFunctionBindNative();
    var FunctionPrototype = Function.prototype;
    var apply = FunctionPrototype.apply;
    var call = FunctionPrototype.call;

    // eslint-disable-next-line es/no-function-prototype-bind, es/no-reflect -- safe
    functionApply = (typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) == 'object' && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function () {
      return call.apply(apply, arguments);
    });
    return functionApply;
  }

  var getSubstitution;
  var hasRequiredGetSubstitution;
  function requireGetSubstitution() {
    if (hasRequiredGetSubstitution) return getSubstitution;
    hasRequiredGetSubstitution = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var toObject = requireToObject();
    var floor = Math.floor;
    var charAt = uncurryThis(''.charAt);
    var replace = uncurryThis(''.replace);
    var stringSlice = uncurryThis(''.slice);
    // eslint-disable-next-line redos/no-vulnerable -- safe
    var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
    var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

    // `GetSubstitution` abstract operation
    // https://tc39.es/ecma262/#sec-getsubstitution
    getSubstitution = function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
      var tailPos = position + matched.length;
      var m = captures.length;
      var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
      if (namedCaptures !== undefined) {
        namedCaptures = toObject(namedCaptures);
        symbols = SUBSTITUTION_SYMBOLS;
      }
      return replace(replacement, symbols, function (match, ch) {
        var capture;
        switch (charAt(ch, 0)) {
          case '$':
            return '$';
          case '&':
            return matched;
          case '`':
            return stringSlice(str, 0, position);
          case "'":
            return stringSlice(str, tailPos);
          case '<':
            capture = namedCaptures[stringSlice(ch, 1, -1)];
            break;
          default:
            // \d\d?
            var n = +ch;
            if (n === 0) return match;
            if (n > m) {
              var f = floor(n / 10);
              if (f === 0) return match;
              if (f <= m) return captures[f - 1] === undefined ? charAt(ch, 1) : captures[f - 1] + charAt(ch, 1);
              return match;
            }
            capture = captures[n - 1];
        }
        return capture === undefined ? '' : capture;
      });
    };
    return getSubstitution;
  }

  var hasRequiredEs_string_replace;
  function requireEs_string_replace() {
    if (hasRequiredEs_string_replace) return es_string_replace;
    hasRequiredEs_string_replace = 1;
    var apply = requireFunctionApply();
    var call = requireFunctionCall();
    var uncurryThis = requireFunctionUncurryThis();
    var fixRegExpWellKnownSymbolLogic = requireFixRegexpWellKnownSymbolLogic();
    var fails = requireFails();
    var anObject = requireAnObject();
    var isCallable = requireIsCallable();
    var isObject = requireIsObject();
    var toIntegerOrInfinity = requireToIntegerOrInfinity();
    var toLength = requireToLength();
    var toString = requireToString();
    var requireObjectCoercible = requireRequireObjectCoercible();
    var advanceStringIndex = requireAdvanceStringIndex();
    var getMethod = requireGetMethod();
    var getSubstitution = requireGetSubstitution();
    var getRegExpFlags = requireRegexpGetFlags();
    var regExpExec = requireRegexpExecAbstract();
    var wellKnownSymbol = requireWellKnownSymbol();
    var REPLACE = wellKnownSymbol('replace');
    var max = Math.max;
    var min = Math.min;
    var concat = uncurryThis([].concat);
    var push = uncurryThis([].push);
    var stringIndexOf = uncurryThis(''.indexOf);
    var stringSlice = uncurryThis(''.slice);
    var maybeToString = function maybeToString(it) {
      return it === undefined ? it : String(it);
    };

    // IE <= 11 replaces $0 with the whole match, as if it was $&
    // https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
    var REPLACE_KEEPS_$0 = function () {
      // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
      return 'a'.replace(/./, '$0') === '$0';
    }();

    // Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
    var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function () {
      if (/./[REPLACE]) {
        return /./[REPLACE]('a', '$0') === '';
      }
      return false;
    }();
    var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
      var re = /./;
      re.exec = function () {
        var result = [];
        result.groups = {
          a: '7'
        };
        return result;
      };
      // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
      return ''.replace(re, '$<a>') !== '7';
    });

    // @@replace logic
    fixRegExpWellKnownSymbolLogic('replace', function (_, nativeReplace, maybeCallNative) {
      var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';
      return [
      // `String.prototype.replace` method
      // https://tc39.es/ecma262/#sec-string.prototype.replace
      function replace(searchValue, replaceValue) {
        var O = requireObjectCoercible(this);
        var replacer = isObject(searchValue) ? getMethod(searchValue, REPLACE) : undefined;
        return replacer ? call(replacer, searchValue, O, replaceValue) : call(nativeReplace, toString(O), searchValue, replaceValue);
      },
      // `RegExp.prototype[@@replace]` method
      // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
      function (string, replaceValue) {
        var rx = anObject(this);
        var S = toString(string);
        if (typeof replaceValue == 'string' && stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) === -1 && stringIndexOf(replaceValue, '$<') === -1) {
          var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
          if (res.done) return res.value;
        }
        var functionalReplace = isCallable(replaceValue);
        if (!functionalReplace) replaceValue = toString(replaceValue);
        var flags = toString(getRegExpFlags(rx));
        var global = stringIndexOf(flags, 'g') !== -1;
        var fullUnicode;
        if (global) {
          fullUnicode = stringIndexOf(flags, 'u') !== -1;
          rx.lastIndex = 0;
        }
        var results = [];
        var result;
        while (true) {
          result = regExpExec(rx, S);
          if (result === null) break;
          push(results, result);
          if (!global) break;
          var matchStr = toString(result[0]);
          if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        }
        var accumulatedResult = '';
        var nextSourcePosition = 0;
        for (var i = 0; i < results.length; i++) {
          result = results[i];
          var matched = toString(result[0]);
          var position = max(min(toIntegerOrInfinity(result.index), S.length), 0);
          var captures = [];
          var replacement;
          // NOTE: This is equivalent to
          //   captures = result.slice(1).map(maybeToString)
          // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
          // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
          // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
          for (var j = 1; j < result.length; j++) push(captures, maybeToString(result[j]));
          var namedCaptures = result.groups;
          if (functionalReplace) {
            var replacerArgs = concat([matched], captures, position, S);
            if (namedCaptures !== undefined) push(replacerArgs, namedCaptures);
            replacement = toString(apply(replaceValue, undefined, replacerArgs));
          } else {
            replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
          }
          if (position >= nextSourcePosition) {
            accumulatedResult += stringSlice(S, nextSourcePosition, position) + replacement;
            nextSourcePosition = position + matched.length;
          }
        }
        return accumulatedResult + stringSlice(S, nextSourcePosition);
      }];
    }, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);
    return es_string_replace;
  }

  requireEs_string_replace();

  var es_regexp_constructor = {};

  var isForced_1;
  var hasRequiredIsForced;
  function requireIsForced() {
    if (hasRequiredIsForced) return isForced_1;
    hasRequiredIsForced = 1;
    var fails = requireFails();
    var isCallable = requireIsCallable();
    var replacement = /#|\.prototype\./;
    var isForced = function isForced(feature, detection) {
      var value = data[normalize(feature)];
      return value === POLYFILL ? true : value === NATIVE ? false : isCallable(detection) ? fails(detection) : !!detection;
    };
    var normalize = isForced.normalize = function (string) {
      return String(string).replace(replacement, '.').toLowerCase();
    };
    var data = isForced.data = {};
    var NATIVE = isForced.NATIVE = 'N';
    var POLYFILL = isForced.POLYFILL = 'P';
    isForced_1 = isForced;
    return isForced_1;
  }

  var inheritIfRequired;
  var hasRequiredInheritIfRequired;
  function requireInheritIfRequired() {
    if (hasRequiredInheritIfRequired) return inheritIfRequired;
    hasRequiredInheritIfRequired = 1;
    var isCallable = requireIsCallable();
    var isObject = requireIsObject();
    var setPrototypeOf = requireObjectSetPrototypeOf();

    // makes subclassing work correct for wrapped built-ins
    inheritIfRequired = function inheritIfRequired($this, dummy, Wrapper) {
      var NewTarget, NewTargetPrototype;
      if (
      // it can work only with native `setPrototypeOf`
      setPrototypeOf &&
      // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
      isCallable(NewTarget = dummy.constructor) && NewTarget !== Wrapper && isObject(NewTargetPrototype = NewTarget.prototype) && NewTargetPrototype !== Wrapper.prototype) setPrototypeOf($this, NewTargetPrototype);
      return $this;
    };
    return inheritIfRequired;
  }

  var isRegexp;
  var hasRequiredIsRegexp;
  function requireIsRegexp() {
    if (hasRequiredIsRegexp) return isRegexp;
    hasRequiredIsRegexp = 1;
    var isObject = requireIsObject();
    var classof = requireClassofRaw();
    var wellKnownSymbol = requireWellKnownSymbol();
    var MATCH = wellKnownSymbol('match');

    // `IsRegExp` abstract operation
    // https://tc39.es/ecma262/#sec-isregexp
    isRegexp = function isRegexp(it) {
      var isRegExp;
      return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classof(it) === 'RegExp');
    };
    return isRegexp;
  }

  var regexpStickyHelpers;
  var hasRequiredRegexpStickyHelpers;
  function requireRegexpStickyHelpers() {
    if (hasRequiredRegexpStickyHelpers) return regexpStickyHelpers;
    hasRequiredRegexpStickyHelpers = 1;
    var fails = requireFails();
    var globalThis = requireGlobalThis();

    // babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
    var $RegExp = globalThis.RegExp;
    var UNSUPPORTED_Y = fails(function () {
      var re = $RegExp('a', 'y');
      re.lastIndex = 2;
      return re.exec('abcd') !== null;
    });

    // UC Browser bug
    // https://github.com/zloirock/core-js/issues/1008
    var MISSED_STICKY = UNSUPPORTED_Y || fails(function () {
      return !$RegExp('a', 'y').sticky;
    });
    var BROKEN_CARET = UNSUPPORTED_Y || fails(function () {
      // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
      var re = $RegExp('^r', 'gy');
      re.lastIndex = 2;
      return re.exec('str') !== null;
    });
    regexpStickyHelpers = {
      BROKEN_CARET: BROKEN_CARET,
      MISSED_STICKY: MISSED_STICKY,
      UNSUPPORTED_Y: UNSUPPORTED_Y
    };
    return regexpStickyHelpers;
  }

  var proxyAccessor;
  var hasRequiredProxyAccessor;
  function requireProxyAccessor() {
    if (hasRequiredProxyAccessor) return proxyAccessor;
    hasRequiredProxyAccessor = 1;
    var defineProperty = requireObjectDefineProperty().f;
    proxyAccessor = function proxyAccessor(Target, Source, key) {
      key in Target || defineProperty(Target, key, {
        configurable: true,
        get: function get() {
          return Source[key];
        },
        set: function set(it) {
          Source[key] = it;
        }
      });
    };
    return proxyAccessor;
  }

  var setSpecies;
  var hasRequiredSetSpecies;
  function requireSetSpecies() {
    if (hasRequiredSetSpecies) return setSpecies;
    hasRequiredSetSpecies = 1;
    var getBuiltIn = requireGetBuiltIn();
    var defineBuiltInAccessor = requireDefineBuiltInAccessor();
    var wellKnownSymbol = requireWellKnownSymbol();
    var DESCRIPTORS = requireDescriptors();
    var SPECIES = wellKnownSymbol('species');
    setSpecies = function setSpecies(CONSTRUCTOR_NAME) {
      var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
      if (DESCRIPTORS && Constructor && !Constructor[SPECIES]) {
        defineBuiltInAccessor(Constructor, SPECIES, {
          configurable: true,
          get: function get() {
            return this;
          }
        });
      }
    };
    return setSpecies;
  }

  var regexpUnsupportedDotAll;
  var hasRequiredRegexpUnsupportedDotAll;
  function requireRegexpUnsupportedDotAll() {
    if (hasRequiredRegexpUnsupportedDotAll) return regexpUnsupportedDotAll;
    hasRequiredRegexpUnsupportedDotAll = 1;
    var fails = requireFails();
    var globalThis = requireGlobalThis();

    // babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
    var $RegExp = globalThis.RegExp;
    regexpUnsupportedDotAll = fails(function () {
      var re = $RegExp('.', 's');
      return !(re.dotAll && re.test('\n') && re.flags === 's');
    });
    return regexpUnsupportedDotAll;
  }

  var regexpUnsupportedNcg;
  var hasRequiredRegexpUnsupportedNcg;
  function requireRegexpUnsupportedNcg() {
    if (hasRequiredRegexpUnsupportedNcg) return regexpUnsupportedNcg;
    hasRequiredRegexpUnsupportedNcg = 1;
    var fails = requireFails();
    var globalThis = requireGlobalThis();

    // babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
    var $RegExp = globalThis.RegExp;
    regexpUnsupportedNcg = fails(function () {
      var re = $RegExp('(?<a>b)', 'g');
      return re.exec('b').groups.a !== 'b' || 'b'.replace(re, '$<a>c') !== 'bc';
    });
    return regexpUnsupportedNcg;
  }

  var hasRequiredEs_regexp_constructor;
  function requireEs_regexp_constructor() {
    if (hasRequiredEs_regexp_constructor) return es_regexp_constructor;
    hasRequiredEs_regexp_constructor = 1;
    var DESCRIPTORS = requireDescriptors();
    var globalThis = requireGlobalThis();
    var uncurryThis = requireFunctionUncurryThis();
    var isForced = requireIsForced();
    var inheritIfRequired = requireInheritIfRequired();
    var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
    var create = requireObjectCreate();
    var getOwnPropertyNames = requireObjectGetOwnPropertyNames().f;
    var isPrototypeOf = requireObjectIsPrototypeOf();
    var isRegExp = requireIsRegexp();
    var toString = requireToString();
    var getRegExpFlags = requireRegexpGetFlags();
    var stickyHelpers = requireRegexpStickyHelpers();
    var proxyAccessor = requireProxyAccessor();
    var defineBuiltIn = requireDefineBuiltIn();
    var fails = requireFails();
    var hasOwn = requireHasOwnProperty();
    var enforceInternalState = requireInternalState().enforce;
    var setSpecies = requireSetSpecies();
    var wellKnownSymbol = requireWellKnownSymbol();
    var UNSUPPORTED_DOT_ALL = requireRegexpUnsupportedDotAll();
    var UNSUPPORTED_NCG = requireRegexpUnsupportedNcg();
    var MATCH = wellKnownSymbol('match');
    var NativeRegExp = globalThis.RegExp;
    var RegExpPrototype = NativeRegExp.prototype;
    var SyntaxError = globalThis.SyntaxError;
    var exec = uncurryThis(RegExpPrototype.exec);
    var charAt = uncurryThis(''.charAt);
    var replace = uncurryThis(''.replace);
    var stringIndexOf = uncurryThis(''.indexOf);
    var stringSlice = uncurryThis(''.slice);
    // TODO: Use only proper RegExpIdentifierName
    var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
    var re1 = /a/g;
    var re2 = /a/g;

    // "new" should create a new object, old webkit bug
    var CORRECT_NEW = new NativeRegExp(re1) !== re1;
    var MISSED_STICKY = stickyHelpers.MISSED_STICKY;
    var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;
    var BASE_FORCED = DESCRIPTORS && (!CORRECT_NEW || MISSED_STICKY || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG || fails(function () {
      re2[MATCH] = false;
      // RegExp constructor can alter flags and IsRegExp works correct with @@match
      // eslint-disable-next-line sonarjs/inconsistent-function-call -- required for testing
      return NativeRegExp(re1) !== re1 || NativeRegExp(re2) === re2 || String(NativeRegExp(re1, 'i')) !== '/a/i';
    }));
    var handleDotAll = function handleDotAll(string) {
      var length = string.length;
      var index = 0;
      var result = '';
      var brackets = false;
      var chr;
      for (; index <= length; index++) {
        chr = charAt(string, index);
        if (chr === '\\') {
          result += chr + charAt(string, ++index);
          continue;
        }
        if (!brackets && chr === '.') {
          result += '[\\s\\S]';
        } else {
          if (chr === '[') {
            brackets = true;
          } else if (chr === ']') {
            brackets = false;
          }
          result += chr;
        }
      }
      return result;
    };
    var handleNCG = function handleNCG(string) {
      var length = string.length;
      var index = 0;
      var result = '';
      var named = [];
      var names = create(null);
      var brackets = false;
      var ncg = false;
      var groupid = 0;
      var groupname = '';
      var chr;
      for (; index <= length; index++) {
        chr = charAt(string, index);
        if (chr === '\\') {
          chr += charAt(string, ++index);
        } else if (chr === ']') {
          brackets = false;
        } else if (!brackets) switch (true) {
          case chr === '[':
            brackets = true;
            break;
          case chr === '(':
            result += chr;
            // ignore non-capturing groups
            if (stringSlice(string, index + 1, index + 3) === '?:') {
              continue;
            }
            if (exec(IS_NCG, stringSlice(string, index + 1))) {
              index += 2;
              ncg = true;
            }
            groupid++;
            continue;
          case chr === '>' && ncg:
            if (groupname === '' || hasOwn(names, groupname)) {
              throw new SyntaxError('Invalid capture group name');
            }
            names[groupname] = true;
            named[named.length] = [groupname, groupid];
            ncg = false;
            groupname = '';
            continue;
        }
        if (ncg) groupname += chr;else result += chr;
      }
      return [result, named];
    };

    // `RegExp` constructor
    // https://tc39.es/ecma262/#sec-regexp-constructor
    if (isForced('RegExp', BASE_FORCED)) {
      var RegExpWrapper = function RegExp(pattern, flags) {
        var thisIsRegExp = isPrototypeOf(RegExpPrototype, this);
        var patternIsRegExp = isRegExp(pattern);
        var flagsAreUndefined = flags === undefined;
        var groups = [];
        var rawPattern = pattern;
        var rawFlags, dotAll, sticky, handled, result, state;
        if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
          return pattern;
        }
        if (patternIsRegExp || isPrototypeOf(RegExpPrototype, pattern)) {
          pattern = pattern.source;
          if (flagsAreUndefined) flags = getRegExpFlags(rawPattern);
        }
        pattern = pattern === undefined ? '' : toString(pattern);
        flags = flags === undefined ? '' : toString(flags);
        rawPattern = pattern;
        if (UNSUPPORTED_DOT_ALL && 'dotAll' in re1) {
          dotAll = !!flags && stringIndexOf(flags, 's') > -1;
          if (dotAll) flags = replace(flags, /s/g, '');
        }
        rawFlags = flags;
        if (MISSED_STICKY && 'sticky' in re1) {
          sticky = !!flags && stringIndexOf(flags, 'y') > -1;
          if (sticky && UNSUPPORTED_Y) flags = replace(flags, /y/g, '');
        }
        if (UNSUPPORTED_NCG) {
          handled = handleNCG(pattern);
          pattern = handled[0];
          groups = handled[1];
        }
        result = inheritIfRequired(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype, RegExpWrapper);
        if (dotAll || sticky || groups.length) {
          state = enforceInternalState(result);
          if (dotAll) {
            state.dotAll = true;
            state.raw = RegExpWrapper(handleDotAll(pattern), rawFlags);
          }
          if (sticky) state.sticky = true;
          if (groups.length) state.groups = groups;
        }
        if (pattern !== rawPattern) try {
          // fails in old engines, but we have no alternatives for unsupported regex syntax
          createNonEnumerableProperty(result, 'source', rawPattern === '' ? '(?:)' : rawPattern);
        } catch (error) {/* empty */}
        return result;
      };
      for (var keys = getOwnPropertyNames(NativeRegExp), index = 0; keys.length > index;) {
        proxyAccessor(RegExpWrapper, NativeRegExp, keys[index++]);
      }
      RegExpPrototype.constructor = RegExpWrapper;
      RegExpWrapper.prototype = RegExpPrototype;
      defineBuiltIn(globalThis, 'RegExp', RegExpWrapper, {
        constructor: true
      });
    }

    // https://tc39.es/ecma262/#sec-get-regexp-@@species
    setSpecies('RegExp');
    return es_regexp_constructor;
  }

  requireEs_regexp_constructor();

  var regexpExec;
  var hasRequiredRegexpExec;
  function requireRegexpExec() {
    if (hasRequiredRegexpExec) return regexpExec;
    hasRequiredRegexpExec = 1;
    /* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
    /* eslint-disable regexp/no-useless-quantifier -- testing */
    var call = requireFunctionCall();
    var uncurryThis = requireFunctionUncurryThis();
    var toString = requireToString();
    var regexpFlags = requireRegexpFlags();
    var stickyHelpers = requireRegexpStickyHelpers();
    var shared = requireShared();
    var create = requireObjectCreate();
    var getInternalState = requireInternalState().get;
    var UNSUPPORTED_DOT_ALL = requireRegexpUnsupportedDotAll();
    var UNSUPPORTED_NCG = requireRegexpUnsupportedNcg();
    var nativeReplace = shared('native-string-replace', String.prototype.replace);
    var nativeExec = RegExp.prototype.exec;
    var patchedExec = nativeExec;
    var charAt = uncurryThis(''.charAt);
    var indexOf = uncurryThis(''.indexOf);
    var replace = uncurryThis(''.replace);
    var stringSlice = uncurryThis(''.slice);
    var UPDATES_LAST_INDEX_WRONG = function () {
      var re1 = /a/;
      var re2 = /b*/g;
      call(nativeExec, re1, 'a');
      call(nativeExec, re2, 'a');
      return re1.lastIndex !== 0 || re2.lastIndex !== 0;
    }();
    var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;

    // nonparticipating capturing group, copied from es5-shim's String#split patch.
    var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
    var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;
    if (PATCH) {
      patchedExec = function exec(string) {
        var re = this;
        var state = getInternalState(re);
        var str = toString(string);
        var raw = state.raw;
        var result, reCopy, lastIndex, match, i, object, group;
        if (raw) {
          raw.lastIndex = re.lastIndex;
          result = call(patchedExec, raw, str);
          re.lastIndex = raw.lastIndex;
          return result;
        }
        var groups = state.groups;
        var sticky = UNSUPPORTED_Y && re.sticky;
        var flags = call(regexpFlags, re);
        var source = re.source;
        var charsAdded = 0;
        var strCopy = str;
        if (sticky) {
          flags = replace(flags, 'y', '');
          if (indexOf(flags, 'g') === -1) {
            flags += 'g';
          }
          strCopy = stringSlice(str, re.lastIndex);
          // Support anchored sticky behavior.
          if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt(str, re.lastIndex - 1) !== '\n')) {
            source = '(?: ' + source + ')';
            strCopy = ' ' + strCopy;
            charsAdded++;
          }
          // ^(? + rx + ) is needed, in combination with some str slicing, to
          // simulate the 'y' flag.
          reCopy = new RegExp('^(?:' + source + ')', flags);
        }
        if (NPCG_INCLUDED) {
          reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
        }
        if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
        match = call(nativeExec, sticky ? reCopy : re, strCopy);
        if (sticky) {
          if (match) {
            match.input = stringSlice(match.input, charsAdded);
            match[0] = stringSlice(match[0], charsAdded);
            match.index = re.lastIndex;
            re.lastIndex += match[0].length;
          } else re.lastIndex = 0;
        } else if (UPDATES_LAST_INDEX_WRONG && match) {
          re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
        }
        if (NPCG_INCLUDED && match && match.length > 1) {
          // Fix browsers whose `exec` methods don't consistently return `undefined`
          // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
          call(nativeReplace, match[0], reCopy, function () {
            for (i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undefined) match[i] = undefined;
            }
          });
        }
        if (match && groups) {
          match.groups = object = create(null);
          for (i = 0; i < groups.length; i++) {
            group = groups[i];
            object[group[0]] = match[group[1]];
          }
        }
        return match;
      };
    }
    regexpExec = patchedExec;
    return regexpExec;
  }

  var hasRequiredEs_regexp_exec;
  function requireEs_regexp_exec() {
    if (hasRequiredEs_regexp_exec) return es_regexp_exec;
    hasRequiredEs_regexp_exec = 1;
    var $ = require_export();
    var exec = requireRegexpExec();

    // `RegExp.prototype.exec` method
    // https://tc39.es/ecma262/#sec-regexp.prototype.exec
    $({
      target: 'RegExp',
      proto: true,
      forced: /./.exec !== exec
    }, {
      exec: exec
    });
    return es_regexp_exec;
  }

  requireEs_regexp_exec();

  var es_string_split = {};

  var aConstructor;
  var hasRequiredAConstructor;
  function requireAConstructor() {
    if (hasRequiredAConstructor) return aConstructor;
    hasRequiredAConstructor = 1;
    var isConstructor = requireIsConstructor();
    var tryToString = requireTryToString();
    var $TypeError = TypeError;

    // `Assert: IsConstructor(argument) is true`
    aConstructor = function aConstructor(argument) {
      if (isConstructor(argument)) return argument;
      throw new $TypeError(tryToString(argument) + ' is not a constructor');
    };
    return aConstructor;
  }

  var speciesConstructor;
  var hasRequiredSpeciesConstructor;
  function requireSpeciesConstructor() {
    if (hasRequiredSpeciesConstructor) return speciesConstructor;
    hasRequiredSpeciesConstructor = 1;
    var anObject = requireAnObject();
    var aConstructor = requireAConstructor();
    var isNullOrUndefined = requireIsNullOrUndefined();
    var wellKnownSymbol = requireWellKnownSymbol();
    var SPECIES = wellKnownSymbol('species');

    // `SpeciesConstructor` abstract operation
    // https://tc39.es/ecma262/#sec-speciesconstructor
    speciesConstructor = function speciesConstructor(O, defaultConstructor) {
      var C = anObject(O).constructor;
      var S;
      return C === undefined || isNullOrUndefined(S = anObject(C)[SPECIES]) ? defaultConstructor : aConstructor(S);
    };
    return speciesConstructor;
  }

  var hasRequiredEs_string_split;
  function requireEs_string_split() {
    if (hasRequiredEs_string_split) return es_string_split;
    hasRequiredEs_string_split = 1;
    var call = requireFunctionCall();
    var uncurryThis = requireFunctionUncurryThis();
    var fixRegExpWellKnownSymbolLogic = requireFixRegexpWellKnownSymbolLogic();
    var anObject = requireAnObject();
    var isObject = requireIsObject();
    var requireObjectCoercible = requireRequireObjectCoercible();
    var speciesConstructor = requireSpeciesConstructor();
    var advanceStringIndex = requireAdvanceStringIndex();
    var toLength = requireToLength();
    var toString = requireToString();
    var getMethod = requireGetMethod();
    var regExpExec = requireRegexpExecAbstract();
    var stickyHelpers = requireRegexpStickyHelpers();
    var fails = requireFails();
    var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;
    var MAX_UINT32 = 0xFFFFFFFF;
    var min = Math.min;
    var push = uncurryThis([].push);
    var stringSlice = uncurryThis(''.slice);

    // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
    // Weex JS has frozen built-in prototypes, so use try / catch wrapper
    var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
      // eslint-disable-next-line regexp/no-empty-group -- required for testing
      var re = /(?:)/;
      var originalExec = re.exec;
      re.exec = function () {
        return originalExec.apply(this, arguments);
      };
      var result = 'ab'.split(re);
      return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
    });
    var BUGGY = 'abbc'.split(/(b)*/)[1] === 'c' ||
    // eslint-disable-next-line regexp/no-empty-group -- required for testing
    'test'.split(/(?:)/, -1).length !== 4 || 'ab'.split(/(?:ab)*/).length !== 2 || '.'.split(/(.?)(.?)/).length !== 4 ||
    // eslint-disable-next-line regexp/no-empty-capturing-group, regexp/no-empty-group -- required for testing
    '.'.split(/()()/).length > 1 || ''.split(/.?/).length;

    // @@split logic
    fixRegExpWellKnownSymbolLogic('split', function (SPLIT, nativeSplit, maybeCallNative) {
      var internalSplit = '0'.split(undefined, 0).length ? function (separator, limit) {
        return separator === undefined && limit === 0 ? [] : call(nativeSplit, this, separator, limit);
      } : nativeSplit;
      return [
      // `String.prototype.split` method
      // https://tc39.es/ecma262/#sec-string.prototype.split
      function split(separator, limit) {
        var O = requireObjectCoercible(this);
        var splitter = isObject(separator) ? getMethod(separator, SPLIT) : undefined;
        return splitter ? call(splitter, separator, O, limit) : call(internalSplit, toString(O), separator, limit);
      },
      // `RegExp.prototype[@@split]` method
      // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
      //
      // NOTE: This cannot be properly polyfilled in engines that don't support
      // the 'y' flag.
      function (string, limit) {
        var rx = anObject(this);
        var S = toString(string);
        if (!BUGGY) {
          var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);
          if (res.done) return res.value;
        }
        var C = speciesConstructor(rx, RegExp);
        var unicodeMatching = rx.unicode;
        var flags = (rx.ignoreCase ? 'i' : '') + (rx.multiline ? 'm' : '') + (rx.unicode ? 'u' : '') + (UNSUPPORTED_Y ? 'g' : 'y');
        // ^(? + rx + ) is needed, in combination with some S slicing, to
        // simulate the 'y' flag.
        var splitter = new C(UNSUPPORTED_Y ? '^(?:' + rx.source + ')' : rx, flags);
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (S.length === 0) return regExpExec(splitter, S) === null ? [S] : [];
        var p = 0;
        var q = 0;
        var A = [];
        while (q < S.length) {
          splitter.lastIndex = UNSUPPORTED_Y ? 0 : q;
          var z = regExpExec(splitter, UNSUPPORTED_Y ? stringSlice(S, q) : S);
          var e;
          if (z === null || (e = min(toLength(splitter.lastIndex + (UNSUPPORTED_Y ? q : 0)), S.length)) === p) {
            q = advanceStringIndex(S, q, unicodeMatching);
          } else {
            push(A, stringSlice(S, p, q));
            if (A.length === lim) return A;
            for (var i = 1; i <= z.length - 1; i++) {
              push(A, z[i]);
              if (A.length === lim) return A;
            }
            q = p = e;
          }
        }
        push(A, stringSlice(S, p));
        return A;
      }];
    }, BUGGY || !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y);
    return es_string_split;
  }

  requireEs_string_split();

  var indexedObject;
  var hasRequiredIndexedObject;
  function requireIndexedObject() {
    if (hasRequiredIndexedObject) return indexedObject;
    hasRequiredIndexedObject = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var fails = requireFails();
    var classof = requireClassofRaw();
    var $Object = Object;
    var split = uncurryThis(''.split);

    // fallback for non-array-like ES3 and non-enumerable old V8 strings
    indexedObject = fails(function () {
      // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
      // eslint-disable-next-line no-prototype-builtins -- safe
      return !$Object('z').propertyIsEnumerable(0);
    }) ? function (it) {
      return classof(it) === 'String' ? split(it, '') : $Object(it);
    } : $Object;
    return indexedObject;
  }

  var toIndexedObject;
  var hasRequiredToIndexedObject;
  function requireToIndexedObject() {
    if (hasRequiredToIndexedObject) return toIndexedObject;
    hasRequiredToIndexedObject = 1;
    // toObject with fallback for non-array-like ES3 strings
    var IndexedObject = requireIndexedObject();
    var requireObjectCoercible = requireRequireObjectCoercible();
    toIndexedObject = function toIndexedObject(it) {
      return IndexedObject(requireObjectCoercible(it));
    };
    return toIndexedObject;
  }

  var hasRequiredEs_object_getOwnPropertyDescriptor;
  function requireEs_object_getOwnPropertyDescriptor() {
    if (hasRequiredEs_object_getOwnPropertyDescriptor) return es_object_getOwnPropertyDescriptor;
    hasRequiredEs_object_getOwnPropertyDescriptor = 1;
    var $ = require_export();
    var fails = requireFails();
    var toIndexedObject = requireToIndexedObject();
    var nativeGetOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
    var DESCRIPTORS = requireDescriptors();
    var FORCED = !DESCRIPTORS || fails(function () {
      nativeGetOwnPropertyDescriptor(1);
    });

    // `Object.getOwnPropertyDescriptor` method
    // https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
    $({
      target: 'Object',
      stat: true,
      forced: FORCED,
      sham: !DESCRIPTORS
    }, {
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
        return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
      }
    });
    return es_object_getOwnPropertyDescriptor;
  }

  requireEs_object_getOwnPropertyDescriptor();

  var objectGetOwnPropertyDescriptor = {};

  var hasRequiredObjectGetOwnPropertyDescriptor;
  function requireObjectGetOwnPropertyDescriptor() {
    if (hasRequiredObjectGetOwnPropertyDescriptor) return objectGetOwnPropertyDescriptor;
    hasRequiredObjectGetOwnPropertyDescriptor = 1;
    var DESCRIPTORS = requireDescriptors();
    var call = requireFunctionCall();
    var propertyIsEnumerableModule = requireObjectPropertyIsEnumerable();
    var createPropertyDescriptor = requireCreatePropertyDescriptor();
    var toIndexedObject = requireToIndexedObject();
    var toPropertyKey = requireToPropertyKey();
    var hasOwn = requireHasOwnProperty();
    var IE8_DOM_DEFINE = requireIe8DomDefine();

    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    // `Object.getOwnPropertyDescriptor` method
    // https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
    objectGetOwnPropertyDescriptor.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
      O = toIndexedObject(O);
      P = toPropertyKey(P);
      if (IE8_DOM_DEFINE) try {
        return $getOwnPropertyDescriptor(O, P);
      } catch (error) {/* empty */}
      if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
    };
    return objectGetOwnPropertyDescriptor;
  }

  var _export;
  var hasRequired_export;
  function require_export() {
    if (hasRequired_export) return _export;
    hasRequired_export = 1;
    var globalThis = requireGlobalThis();
    var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
    var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
    var defineBuiltIn = requireDefineBuiltIn();
    var defineGlobalProperty = requireDefineGlobalProperty();
    var copyConstructorProperties = requireCopyConstructorProperties();
    var isForced = requireIsForced();

    /*
      options.target         - name of the target object
      options.global         - target is the global object
      options.stat           - export as static methods of target
      options.proto          - export as prototype methods of target
      options.real           - real prototype method for the `pure` version
      options.forced         - export even if the native feature is available
      options.bind           - bind methods to the target, required for the `pure` version
      options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
      options.unsafe         - use the simple assignment of property instead of delete + defineProperty
      options.sham           - add a flag to not completely full polyfills
      options.enumerable     - export as enumerable property
      options.dontCallGetSet - prevent calling a getter on target
      options.name           - the .name of the function if it does not match the key
    */
    _export = function _export(options, source) {
      var TARGET = options.target;
      var GLOBAL = options.global;
      var STATIC = options.stat;
      var FORCED, target, key, targetProperty, sourceProperty, descriptor;
      if (GLOBAL) {
        target = globalThis;
      } else if (STATIC) {
        target = globalThis[TARGET] || defineGlobalProperty(TARGET, {});
      } else {
        target = globalThis[TARGET] && globalThis[TARGET].prototype;
      }
      if (target) for (key in source) {
        sourceProperty = source[key];
        if (options.dontCallGetSet) {
          descriptor = getOwnPropertyDescriptor(target, key);
          targetProperty = descriptor && descriptor.value;
        } else targetProperty = target[key];
        FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
        // contained in target
        if (!FORCED && targetProperty !== undefined) {
          if (_typeof(sourceProperty) == _typeof(targetProperty)) continue;
          copyConstructorProperties(sourceProperty, targetProperty);
        }
        // add a flag to not completely full polyfills
        if (options.sham || targetProperty && targetProperty.sham) {
          createNonEnumerableProperty(sourceProperty, 'sham', true);
        }
        defineBuiltIn(target, key, sourceProperty, options);
      }
    };
    return _export;
  }

  var doesNotExceedSafeInteger;
  var hasRequiredDoesNotExceedSafeInteger;
  function requireDoesNotExceedSafeInteger() {
    if (hasRequiredDoesNotExceedSafeInteger) return doesNotExceedSafeInteger;
    hasRequiredDoesNotExceedSafeInteger = 1;
    var $TypeError = TypeError;
    var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

    doesNotExceedSafeInteger = function doesNotExceedSafeInteger(it) {
      if (it > MAX_SAFE_INTEGER) throw $TypeError('Maximum allowed index exceeded');
      return it;
    };
    return doesNotExceedSafeInteger;
  }

  var hasRequiredEs_array_concat;
  function requireEs_array_concat() {
    if (hasRequiredEs_array_concat) return es_array_concat;
    hasRequiredEs_array_concat = 1;
    var $ = require_export();
    var fails = requireFails();
    var isArray = requireIsArray();
    var isObject = requireIsObject();
    var toObject = requireToObject();
    var lengthOfArrayLike = requireLengthOfArrayLike();
    var doesNotExceedSafeInteger = requireDoesNotExceedSafeInteger();
    var createProperty = requireCreateProperty();
    var arraySpeciesCreate = requireArraySpeciesCreate();
    var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();
    var wellKnownSymbol = requireWellKnownSymbol();
    var V8_VERSION = requireEnvironmentV8Version();
    var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');

    // We can't use this feature detection in V8 since it causes
    // deoptimization and serious performance degradation
    // https://github.com/zloirock/core-js/issues/679
    var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function () {
      var array = [];
      array[IS_CONCAT_SPREADABLE] = false;
      return array.concat()[0] !== array;
    });
    var isConcatSpreadable = function isConcatSpreadable(O) {
      if (!isObject(O)) return false;
      var spreadable = O[IS_CONCAT_SPREADABLE];
      return spreadable !== undefined ? !!spreadable : isArray(O);
    };
    var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport('concat');

    // `Array.prototype.concat` method
    // https://tc39.es/ecma262/#sec-array.prototype.concat
    // with adding support of @@isConcatSpreadable and @@species
    $({
      target: 'Array',
      proto: true,
      arity: 1,
      forced: FORCED
    }, {
      // eslint-disable-next-line no-unused-vars -- required for `.length`
      concat: function concat(arg) {
        var O = toObject(this);
        var A = arraySpeciesCreate(O, 0);
        var n = 0;
        var i, k, length, len, E;
        for (i = -1, length = arguments.length; i < length; i++) {
          E = i === -1 ? O : arguments[i];
          if (isConcatSpreadable(E)) {
            len = lengthOfArrayLike(E);
            doesNotExceedSafeInteger(n + len);
            for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
          } else {
            doesNotExceedSafeInteger(n + 1);
            createProperty(A, n++, E);
          }
        }
        A.length = n;
        return A;
      }
    });
    return es_array_concat;
  }

  requireEs_array_concat();

  var es_array_filter = {};

  var hasRequiredEs_array_filter;
  function requireEs_array_filter() {
    if (hasRequiredEs_array_filter) return es_array_filter;
    hasRequiredEs_array_filter = 1;
    var $ = require_export();
    var $filter = requireArrayIteration().filter;
    var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();
    var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');

    // `Array.prototype.filter` method
    // https://tc39.es/ecma262/#sec-array.prototype.filter
    // with adding support of @@species
    $({
      target: 'Array',
      proto: true,
      forced: !HAS_SPECIES_SUPPORT
    }, {
      filter: function filter(callbackfn /* , thisArg */) {
        return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      }
    });
    return es_array_filter;
  }

  requireEs_array_filter();

  var es_string_includes = {};

  var notARegexp;
  var hasRequiredNotARegexp;
  function requireNotARegexp() {
    if (hasRequiredNotARegexp) return notARegexp;
    hasRequiredNotARegexp = 1;
    var isRegExp = requireIsRegexp();
    var $TypeError = TypeError;
    notARegexp = function notARegexp(it) {
      if (isRegExp(it)) {
        throw new $TypeError("The method doesn't accept regular expressions");
      }
      return it;
    };
    return notARegexp;
  }

  var correctIsRegexpLogic;
  var hasRequiredCorrectIsRegexpLogic;
  function requireCorrectIsRegexpLogic() {
    if (hasRequiredCorrectIsRegexpLogic) return correctIsRegexpLogic;
    hasRequiredCorrectIsRegexpLogic = 1;
    var wellKnownSymbol = requireWellKnownSymbol();
    var MATCH = wellKnownSymbol('match');
    correctIsRegexpLogic = function correctIsRegexpLogic(METHOD_NAME) {
      var regexp = /./;
      try {
        '/./'[METHOD_NAME](regexp);
      } catch (error1) {
        try {
          regexp[MATCH] = false;
          return '/./'[METHOD_NAME](regexp);
        } catch (error2) {/* empty */}
      }
      return false;
    };
    return correctIsRegexpLogic;
  }

  var hasRequiredEs_string_includes;
  function requireEs_string_includes() {
    if (hasRequiredEs_string_includes) return es_string_includes;
    hasRequiredEs_string_includes = 1;
    var $ = require_export();
    var uncurryThis = requireFunctionUncurryThis();
    var notARegExp = requireNotARegexp();
    var requireObjectCoercible = requireRequireObjectCoercible();
    var toString = requireToString();
    var correctIsRegExpLogic = requireCorrectIsRegexpLogic();
    var stringIndexOf = uncurryThis(''.indexOf);

    // `String.prototype.includes` method
    // https://tc39.es/ecma262/#sec-string.prototype.includes
    $({
      target: 'String',
      proto: true,
      forced: !correctIsRegExpLogic('includes')
    }, {
      includes: function includes(searchString /* , position = 0 */) {
        return !!~stringIndexOf(toString(requireObjectCoercible(this)), toString(notARegExp(searchString)), arguments.length > 1 ? arguments[1] : undefined);
      }
    });
    return es_string_includes;
  }

  requireEs_string_includes();

  var es_array_includes = {};

  var hasRequiredEs_array_includes;
  function requireEs_array_includes() {
    if (hasRequiredEs_array_includes) return es_array_includes;
    hasRequiredEs_array_includes = 1;
    var $ = require_export();
    var $includes = requireArrayIncludes().includes;
    var fails = requireFails();
    var addToUnscopables = requireAddToUnscopables();

    // FF99+ bug
    var BROKEN_ON_SPARSE = fails(function () {
      // eslint-disable-next-line es/no-array-prototype-includes -- detection
      return !Array(1).includes();
    });

    // `Array.prototype.includes` method
    // https://tc39.es/ecma262/#sec-array.prototype.includes
    $({
      target: 'Array',
      proto: true,
      forced: BROKEN_ON_SPARSE
    }, {
      includes: function includes(el /* , fromIndex = 0 */) {
        return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
      }
    });

    // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
    addToUnscopables('includes');
    return es_array_includes;
  }

  requireEs_array_includes();

  var es_array_map = {};

  var hasRequiredEs_array_map;
  function requireEs_array_map() {
    if (hasRequiredEs_array_map) return es_array_map;
    hasRequiredEs_array_map = 1;
    var $ = require_export();
    var $map = requireArrayIteration().map;
    var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();
    var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');

    // `Array.prototype.map` method
    // https://tc39.es/ecma262/#sec-array.prototype.map
    // with adding support of @@species
    $({
      target: 'Array',
      proto: true,
      forced: !HAS_SPECIES_SUPPORT
    }, {
      map: function map(callbackfn /* , thisArg */) {
        return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      }
    });
    return es_array_map;
  }

  requireEs_array_map();

  var es_array_sort = {};

  var deletePropertyOrThrow;
  var hasRequiredDeletePropertyOrThrow;
  function requireDeletePropertyOrThrow() {
    if (hasRequiredDeletePropertyOrThrow) return deletePropertyOrThrow;
    hasRequiredDeletePropertyOrThrow = 1;
    var tryToString = requireTryToString();
    var $TypeError = TypeError;
    deletePropertyOrThrow = function deletePropertyOrThrow(O, P) {
      if (!delete O[P]) throw new $TypeError('Cannot delete property ' + tryToString(P) + ' of ' + tryToString(O));
    };
    return deletePropertyOrThrow;
  }

  var arraySort;
  var hasRequiredArraySort;
  function requireArraySort() {
    if (hasRequiredArraySort) return arraySort;
    hasRequiredArraySort = 1;
    var arraySlice = requireArraySlice();
    var floor = Math.floor;
    var _sort = function sort(array, comparefn) {
      var length = array.length;
      if (length < 8) {
        // insertion sort
        var i = 1;
        var element, j;
        while (i < length) {
          j = i;
          element = array[i];
          while (j && comparefn(array[j - 1], element) > 0) {
            array[j] = array[--j];
          }
          if (j !== i++) array[j] = element;
        }
      } else {
        // merge sort
        var middle = floor(length / 2);
        var left = _sort(arraySlice(array, 0, middle), comparefn);
        var right = _sort(arraySlice(array, middle), comparefn);
        var llength = left.length;
        var rlength = right.length;
        var lindex = 0;
        var rindex = 0;
        while (lindex < llength || rindex < rlength) {
          array[lindex + rindex] = lindex < llength && rindex < rlength ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++] : lindex < llength ? left[lindex++] : right[rindex++];
        }
      }
      return array;
    };
    arraySort = _sort;
    return arraySort;
  }

  var environmentFfVersion;
  var hasRequiredEnvironmentFfVersion;
  function requireEnvironmentFfVersion() {
    if (hasRequiredEnvironmentFfVersion) return environmentFfVersion;
    hasRequiredEnvironmentFfVersion = 1;
    var userAgent = requireEnvironmentUserAgent();
    var firefox = userAgent.match(/firefox\/(\d+)/i);
    environmentFfVersion = !!firefox && +firefox[1];
    return environmentFfVersion;
  }

  var environmentIsIeOrEdge;
  var hasRequiredEnvironmentIsIeOrEdge;
  function requireEnvironmentIsIeOrEdge() {
    if (hasRequiredEnvironmentIsIeOrEdge) return environmentIsIeOrEdge;
    hasRequiredEnvironmentIsIeOrEdge = 1;
    var UA = requireEnvironmentUserAgent();
    environmentIsIeOrEdge = /MSIE|Trident/.test(UA);
    return environmentIsIeOrEdge;
  }

  var environmentWebkitVersion;
  var hasRequiredEnvironmentWebkitVersion;
  function requireEnvironmentWebkitVersion() {
    if (hasRequiredEnvironmentWebkitVersion) return environmentWebkitVersion;
    hasRequiredEnvironmentWebkitVersion = 1;
    var userAgent = requireEnvironmentUserAgent();
    var webkit = userAgent.match(/AppleWebKit\/(\d+)\./);
    environmentWebkitVersion = !!webkit && +webkit[1];
    return environmentWebkitVersion;
  }

  var hasRequiredEs_array_sort;
  function requireEs_array_sort() {
    if (hasRequiredEs_array_sort) return es_array_sort;
    hasRequiredEs_array_sort = 1;
    var $ = require_export();
    var uncurryThis = requireFunctionUncurryThis();
    var aCallable = requireACallable();
    var toObject = requireToObject();
    var lengthOfArrayLike = requireLengthOfArrayLike();
    var deletePropertyOrThrow = requireDeletePropertyOrThrow();
    var toString = requireToString();
    var fails = requireFails();
    var internalSort = requireArraySort();
    var arrayMethodIsStrict = requireArrayMethodIsStrict();
    var FF = requireEnvironmentFfVersion();
    var IE_OR_EDGE = requireEnvironmentIsIeOrEdge();
    var V8 = requireEnvironmentV8Version();
    var WEBKIT = requireEnvironmentWebkitVersion();
    var test = [];
    var nativeSort = uncurryThis(test.sort);
    var push = uncurryThis(test.push);

    // IE8-
    var FAILS_ON_UNDEFINED = fails(function () {
      test.sort(undefined);
    });
    // V8 bug
    var FAILS_ON_NULL = fails(function () {
      test.sort(null);
    });
    // Old WebKit
    var STRICT_METHOD = arrayMethodIsStrict('sort');
    var STABLE_SORT = !fails(function () {
      // feature detection can be too slow, so check engines versions
      if (V8) return V8 < 70;
      if (FF && FF > 3) return;
      if (IE_OR_EDGE) return true;
      if (WEBKIT) return WEBKIT < 603;
      var result = '';
      var code, chr, value, index;

      // generate an array with more 512 elements (Chakra and old V8 fails only in this case)
      for (code = 65; code < 76; code++) {
        chr = String.fromCharCode(code);
        switch (code) {
          case 66:
          case 69:
          case 70:
          case 72:
            value = 3;
            break;
          case 68:
          case 71:
            value = 4;
            break;
          default:
            value = 2;
        }
        for (index = 0; index < 47; index++) {
          test.push({
            k: chr + index,
            v: value
          });
        }
      }
      test.sort(function (a, b) {
        return b.v - a.v;
      });
      for (index = 0; index < test.length; index++) {
        chr = test[index].k.charAt(0);
        if (result.charAt(result.length - 1) !== chr) result += chr;
      }
      return result !== 'DGBEFHACIJK';
    });
    var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD || !STABLE_SORT;
    var getSortCompare = function getSortCompare(comparefn) {
      return function (x, y) {
        if (y === undefined) return -1;
        if (x === undefined) return 1;
        if (comparefn !== undefined) return +comparefn(x, y) || 0;
        return toString(x) > toString(y) ? 1 : -1;
      };
    };

    // `Array.prototype.sort` method
    // https://tc39.es/ecma262/#sec-array.prototype.sort
    $({
      target: 'Array',
      proto: true,
      forced: FORCED
    }, {
      sort: function sort(comparefn) {
        if (comparefn !== undefined) aCallable(comparefn);
        var array = toObject(this);
        if (STABLE_SORT) return comparefn === undefined ? nativeSort(array) : nativeSort(array, comparefn);
        var items = [];
        var arrayLength = lengthOfArrayLike(array);
        var itemsLength, index;
        for (index = 0; index < arrayLength; index++) {
          if (index in array) push(items, array[index]);
        }
        internalSort(items, getSortCompare(comparefn));
        itemsLength = lengthOfArrayLike(items);
        index = 0;
        while (index < itemsLength) array[index] = items[index++];
        while (index < arrayLength) deletePropertyOrThrow(array, index++);
        return array;
      }
    });
    return es_array_sort;
  }

  requireEs_array_sort();

  var es_object_entries = {};

  var objectToArray;
  var hasRequiredObjectToArray;
  function requireObjectToArray() {
    if (hasRequiredObjectToArray) return objectToArray;
    hasRequiredObjectToArray = 1;
    var DESCRIPTORS = requireDescriptors();
    var fails = requireFails();
    var uncurryThis = requireFunctionUncurryThis();
    var objectGetPrototypeOf = requireObjectGetPrototypeOf();
    var objectKeys = requireObjectKeys();
    var toIndexedObject = requireToIndexedObject();
    var $propertyIsEnumerable = requireObjectPropertyIsEnumerable().f;
    var propertyIsEnumerable = uncurryThis($propertyIsEnumerable);
    var push = uncurryThis([].push);

    // in some IE versions, `propertyIsEnumerable` returns incorrect result on integer keys
    // of `null` prototype objects
    var IE_BUG = DESCRIPTORS && fails(function () {
      // eslint-disable-next-line es/no-object-create -- safe
      var O = Object.create(null);
      O[2] = 2;
      return !propertyIsEnumerable(O, 2);
    });

    // `Object.{ entries, values }` methods implementation
    var createMethod = function createMethod(TO_ENTRIES) {
      return function (it) {
        var O = toIndexedObject(it);
        var keys = objectKeys(O);
        var IE_WORKAROUND = IE_BUG && objectGetPrototypeOf(O) === null;
        var length = keys.length;
        var i = 0;
        var result = [];
        var key;
        while (length > i) {
          key = keys[i++];
          if (!DESCRIPTORS || (IE_WORKAROUND ? key in O : propertyIsEnumerable(O, key))) {
            push(result, TO_ENTRIES ? [key, O[key]] : O[key]);
          }
        }
        return result;
      };
    };
    objectToArray = {
      // `Object.entries` method
      // https://tc39.es/ecma262/#sec-object.entries
      entries: createMethod(true),
      // `Object.values` method
      // https://tc39.es/ecma262/#sec-object.values
      values: createMethod(false)
    };
    return objectToArray;
  }

  var hasRequiredEs_object_entries;
  function requireEs_object_entries() {
    if (hasRequiredEs_object_entries) return es_object_entries;
    hasRequiredEs_object_entries = 1;
    var $ = require_export();
    var $entries = requireObjectToArray().entries;

    // `Object.entries` method
    // https://tc39.es/ecma262/#sec-object.entries
    $({
      target: 'Object',
      stat: true
    }, {
      entries: function entries(O) {
        return $entries(O);
      }
    });
    return es_object_entries;
  }

  requireEs_object_entries();

  var es_object_values = {};

  var hasRequiredEs_object_values;
  function requireEs_object_values() {
    if (hasRequiredEs_object_values) return es_object_values;
    hasRequiredEs_object_values = 1;
    var $ = require_export();
    var $values = requireObjectToArray().values;

    // `Object.values` method
    // https://tc39.es/ecma262/#sec-object.values
    $({
      target: 'Object',
      stat: true
    }, {
      values: function values(O) {
        return $values(O);
      }
    });
    return es_object_values;
  }

  requireEs_object_values();

  var es_promise = {};

  var es_promise_constructor = {};

  var environment;
  var hasRequiredEnvironment;
  function requireEnvironment() {
    if (hasRequiredEnvironment) return environment;
    hasRequiredEnvironment = 1;
    /* global Bun, Deno -- detection */
    var globalThis = requireGlobalThis();
    var userAgent = requireEnvironmentUserAgent();
    var classof = requireClassofRaw();
    var userAgentStartsWith = function userAgentStartsWith(string) {
      return userAgent.slice(0, string.length) === string;
    };
    environment = function () {
      if (userAgentStartsWith('Bun/')) return 'BUN';
      if (userAgentStartsWith('Cloudflare-Workers')) return 'CLOUDFLARE';
      if (userAgentStartsWith('Deno/')) return 'DENO';
      if (userAgentStartsWith('Node.js/')) return 'NODE';
      if (globalThis.Bun && typeof Bun.version == 'string') return 'BUN';
      if (globalThis.Deno && _typeof(Deno.version) == 'object') return 'DENO';
      if (classof(globalThis.process) === 'process') return 'NODE';
      if (globalThis.window && globalThis.document) return 'BROWSER';
      return 'REST';
    }();
    return environment;
  }

  var environmentIsNode;
  var hasRequiredEnvironmentIsNode;
  function requireEnvironmentIsNode() {
    if (hasRequiredEnvironmentIsNode) return environmentIsNode;
    hasRequiredEnvironmentIsNode = 1;
    var ENVIRONMENT = requireEnvironment();
    environmentIsNode = ENVIRONMENT === 'NODE';
    return environmentIsNode;
  }

  var anInstance;
  var hasRequiredAnInstance;
  function requireAnInstance() {
    if (hasRequiredAnInstance) return anInstance;
    hasRequiredAnInstance = 1;
    var isPrototypeOf = requireObjectIsPrototypeOf();
    var $TypeError = TypeError;
    anInstance = function anInstance(it, Prototype) {
      if (isPrototypeOf(Prototype, it)) return it;
      throw new $TypeError('Incorrect invocation');
    };
    return anInstance;
  }

  var validateArgumentsLength;
  var hasRequiredValidateArgumentsLength;
  function requireValidateArgumentsLength() {
    if (hasRequiredValidateArgumentsLength) return validateArgumentsLength;
    hasRequiredValidateArgumentsLength = 1;
    var $TypeError = TypeError;
    validateArgumentsLength = function validateArgumentsLength(passed, required) {
      if (passed < required) throw new $TypeError('Not enough arguments');
      return passed;
    };
    return validateArgumentsLength;
  }

  var environmentIsIos;
  var hasRequiredEnvironmentIsIos;
  function requireEnvironmentIsIos() {
    if (hasRequiredEnvironmentIsIos) return environmentIsIos;
    hasRequiredEnvironmentIsIos = 1;
    var userAgent = requireEnvironmentUserAgent();

    // eslint-disable-next-line redos/no-vulnerable -- safe
    environmentIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(userAgent);
    return environmentIsIos;
  }

  var task;
  var hasRequiredTask;
  function requireTask() {
    if (hasRequiredTask) return task;
    hasRequiredTask = 1;
    var globalThis = requireGlobalThis();
    var apply = requireFunctionApply();
    var bind = requireFunctionBindContext();
    var isCallable = requireIsCallable();
    var hasOwn = requireHasOwnProperty();
    var fails = requireFails();
    var html = requireHtml();
    var arraySlice = requireArraySlice();
    var createElement = requireDocumentCreateElement();
    var validateArgumentsLength = requireValidateArgumentsLength();
    var IS_IOS = requireEnvironmentIsIos();
    var IS_NODE = requireEnvironmentIsNode();
    var set = globalThis.setImmediate;
    var clear = globalThis.clearImmediate;
    var process = globalThis.process;
    var Dispatch = globalThis.Dispatch;
    var Function = globalThis.Function;
    var MessageChannel = globalThis.MessageChannel;
    var String = globalThis.String;
    var counter = 0;
    var queue = {};
    var ONREADYSTATECHANGE = 'onreadystatechange';
    var $location, defer, channel, port;
    fails(function () {
      // Deno throws a ReferenceError on `location` access without `--location` flag
      $location = globalThis.location;
    });
    var run = function run(id) {
      if (hasOwn(queue, id)) {
        var fn = queue[id];
        delete queue[id];
        fn();
      }
    };
    var runner = function runner(id) {
      return function () {
        run(id);
      };
    };
    var eventListener = function eventListener(event) {
      run(event.data);
    };
    var globalPostMessageDefer = function globalPostMessageDefer(id) {
      // old engines have not location.origin
      globalThis.postMessage(String(id), $location.protocol + '//' + $location.host);
    };

    // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
    if (!set || !clear) {
      set = function setImmediate(handler) {
        validateArgumentsLength(arguments.length, 1);
        var fn = isCallable(handler) ? handler : Function(handler);
        var args = arraySlice(arguments, 1);
        queue[++counter] = function () {
          apply(fn, undefined, args);
        };
        defer(counter);
        return counter;
      };
      clear = function clearImmediate(id) {
        delete queue[id];
      };
      // Node.js 0.8-
      if (IS_NODE) {
        defer = function defer(id) {
          process.nextTick(runner(id));
        };
        // Sphere (JS game engine) Dispatch API
      } else if (Dispatch && Dispatch.now) {
        defer = function defer(id) {
          Dispatch.now(runner(id));
        };
        // Browsers with MessageChannel, includes WebWorkers
        // except iOS - https://github.com/zloirock/core-js/issues/624
      } else if (MessageChannel && !IS_IOS) {
        channel = new MessageChannel();
        port = channel.port2;
        channel.port1.onmessage = eventListener;
        defer = bind(port.postMessage, port);
        // Browsers with postMessage, skip WebWorkers
        // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
      } else if (globalThis.addEventListener && isCallable(globalThis.postMessage) && !globalThis.importScripts && $location && $location.protocol !== 'file:' && !fails(globalPostMessageDefer)) {
        defer = globalPostMessageDefer;
        globalThis.addEventListener('message', eventListener, false);
        // IE8-
      } else if (ONREADYSTATECHANGE in createElement('script')) {
        defer = function defer(id) {
          html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
            html.removeChild(this);
            run(id);
          };
        };
        // Rest old browsers
      } else {
        defer = function defer(id) {
          setTimeout(runner(id), 0);
        };
      }
    }
    task = {
      set: set,
      clear: clear
    };
    return task;
  }

  var safeGetBuiltIn;
  var hasRequiredSafeGetBuiltIn;
  function requireSafeGetBuiltIn() {
    if (hasRequiredSafeGetBuiltIn) return safeGetBuiltIn;
    hasRequiredSafeGetBuiltIn = 1;
    var globalThis = requireGlobalThis();
    var DESCRIPTORS = requireDescriptors();

    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    // Avoid NodeJS experimental warning
    safeGetBuiltIn = function safeGetBuiltIn(name) {
      if (!DESCRIPTORS) return globalThis[name];
      var descriptor = getOwnPropertyDescriptor(globalThis, name);
      return descriptor && descriptor.value;
    };
    return safeGetBuiltIn;
  }

  var queue;
  var hasRequiredQueue;
  function requireQueue() {
    if (hasRequiredQueue) return queue;
    hasRequiredQueue = 1;
    var Queue = function Queue() {
      this.head = null;
      this.tail = null;
    };
    Queue.prototype = {
      add: function add(item) {
        var entry = {
          item: item,
          next: null
        };
        var tail = this.tail;
        if (tail) tail.next = entry;else this.head = entry;
        this.tail = entry;
      },
      get: function get() {
        var entry = this.head;
        if (entry) {
          var next = this.head = entry.next;
          if (next === null) this.tail = null;
          return entry.item;
        }
      }
    };
    queue = Queue;
    return queue;
  }

  var environmentIsIosPebble;
  var hasRequiredEnvironmentIsIosPebble;
  function requireEnvironmentIsIosPebble() {
    if (hasRequiredEnvironmentIsIosPebble) return environmentIsIosPebble;
    hasRequiredEnvironmentIsIosPebble = 1;
    var userAgent = requireEnvironmentUserAgent();
    environmentIsIosPebble = /ipad|iphone|ipod/i.test(userAgent) && typeof Pebble != 'undefined';
    return environmentIsIosPebble;
  }

  var environmentIsWebosWebkit;
  var hasRequiredEnvironmentIsWebosWebkit;
  function requireEnvironmentIsWebosWebkit() {
    if (hasRequiredEnvironmentIsWebosWebkit) return environmentIsWebosWebkit;
    hasRequiredEnvironmentIsWebosWebkit = 1;
    var userAgent = requireEnvironmentUserAgent();
    environmentIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent);
    return environmentIsWebosWebkit;
  }

  var microtask_1;
  var hasRequiredMicrotask;
  function requireMicrotask() {
    if (hasRequiredMicrotask) return microtask_1;
    hasRequiredMicrotask = 1;
    var globalThis = requireGlobalThis();
    var safeGetBuiltIn = requireSafeGetBuiltIn();
    var bind = requireFunctionBindContext();
    var macrotask = requireTask().set;
    var Queue = requireQueue();
    var IS_IOS = requireEnvironmentIsIos();
    var IS_IOS_PEBBLE = requireEnvironmentIsIosPebble();
    var IS_WEBOS_WEBKIT = requireEnvironmentIsWebosWebkit();
    var IS_NODE = requireEnvironmentIsNode();
    var MutationObserver = globalThis.MutationObserver || globalThis.WebKitMutationObserver;
    var document = globalThis.document;
    var process = globalThis.process;
    var Promise = globalThis.Promise;
    var microtask = safeGetBuiltIn('queueMicrotask');
    var notify, toggle, node, promise, then;

    // modern engines have queueMicrotask method
    if (!microtask) {
      var queue = new Queue();
      var flush = function flush() {
        var parent, fn;
        if (IS_NODE && (parent = process.domain)) parent.exit();
        while (fn = queue.get()) try {
          fn();
        } catch (error) {
          if (queue.head) notify();
          throw error;
        }
        if (parent) parent.enter();
      };

      // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
      // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
      if (!IS_IOS && !IS_NODE && !IS_WEBOS_WEBKIT && MutationObserver && document) {
        toggle = true;
        node = document.createTextNode('');
        new MutationObserver(flush).observe(node, {
          characterData: true
        });
        notify = function notify() {
          node.data = toggle = !toggle;
        };
        // environments with maybe non-completely correct, but existent Promise
      } else if (!IS_IOS_PEBBLE && Promise && Promise.resolve) {
        // Promise.resolve without an argument throws an error in LG WebOS 2
        promise = Promise.resolve(undefined);
        // workaround of WebKit ~ iOS Safari 10.1 bug
        promise.constructor = Promise;
        then = bind(promise.then, promise);
        notify = function notify() {
          then(flush);
        };
        // Node.js without promises
      } else if (IS_NODE) {
        notify = function notify() {
          process.nextTick(flush);
        };
        // for other environments - macrotask based on:
        // - setImmediate
        // - MessageChannel
        // - window.postMessage
        // - onreadystatechange
        // - setTimeout
      } else {
        // `webpack` dev server bug on IE global methods - use bind(fn, global)
        macrotask = bind(macrotask, globalThis);
        notify = function notify() {
          macrotask(flush);
        };
      }
      microtask = function microtask(fn) {
        if (!queue.head) notify();
        queue.add(fn);
      };
    }
    microtask_1 = microtask;
    return microtask_1;
  }

  var hostReportErrors;
  var hasRequiredHostReportErrors;
  function requireHostReportErrors() {
    if (hasRequiredHostReportErrors) return hostReportErrors;
    hasRequiredHostReportErrors = 1;
    hostReportErrors = function hostReportErrors(a, b) {
      try {
        // eslint-disable-next-line no-console -- safe
        arguments.length === 1 ? console.error(a) : console.error(a, b);
      } catch (error) {/* empty */}
    };
    return hostReportErrors;
  }

  var perform;
  var hasRequiredPerform;
  function requirePerform() {
    if (hasRequiredPerform) return perform;
    hasRequiredPerform = 1;
    perform = function perform(exec) {
      try {
        return {
          error: false,
          value: exec()
        };
      } catch (error) {
        return {
          error: true,
          value: error
        };
      }
    };
    return perform;
  }

  var promiseNativeConstructor;
  var hasRequiredPromiseNativeConstructor;
  function requirePromiseNativeConstructor() {
    if (hasRequiredPromiseNativeConstructor) return promiseNativeConstructor;
    hasRequiredPromiseNativeConstructor = 1;
    var globalThis = requireGlobalThis();
    promiseNativeConstructor = globalThis.Promise;
    return promiseNativeConstructor;
  }

  var es_promise_finally = {};

  var newPromiseCapability = {};

  var hasRequiredNewPromiseCapability;
  function requireNewPromiseCapability() {
    if (hasRequiredNewPromiseCapability) return newPromiseCapability;
    hasRequiredNewPromiseCapability = 1;
    var aCallable = requireACallable();
    var $TypeError = TypeError;
    var PromiseCapability = function PromiseCapability(C) {
      var resolve, reject;
      this.promise = new C(function ($$resolve, $$reject) {
        if (resolve !== undefined || reject !== undefined) throw new $TypeError('Bad Promise constructor');
        resolve = $$resolve;
        reject = $$reject;
      });
      this.resolve = aCallable(resolve);
      this.reject = aCallable(reject);
    };

    // `NewPromiseCapability` abstract operation
    // https://tc39.es/ecma262/#sec-newpromisecapability
    newPromiseCapability.f = function (C) {
      return new PromiseCapability(C);
    };
    return newPromiseCapability;
  }

  var promiseResolve;
  var hasRequiredPromiseResolve;
  function requirePromiseResolve() {
    if (hasRequiredPromiseResolve) return promiseResolve;
    hasRequiredPromiseResolve = 1;
    var anObject = requireAnObject();
    var isObject = requireIsObject();
    var newPromiseCapability = requireNewPromiseCapability();
    promiseResolve = function promiseResolve(C, x) {
      anObject(C);
      if (isObject(x) && x.constructor === C) return x;
      var promiseCapability = newPromiseCapability.f(C);
      var resolve = promiseCapability.resolve;
      resolve(x);
      return promiseCapability.promise;
    };
    return promiseResolve;
  }

  var hasRequiredEs_promise_finally;
  function requireEs_promise_finally() {
    if (hasRequiredEs_promise_finally) return es_promise_finally;
    hasRequiredEs_promise_finally = 1;
    var $ = require_export();
    var IS_PURE = requireIsPure();
    var NativePromiseConstructor = requirePromiseNativeConstructor();
    var fails = requireFails();
    var getBuiltIn = requireGetBuiltIn();
    var isCallable = requireIsCallable();
    var speciesConstructor = requireSpeciesConstructor();
    var promiseResolve = requirePromiseResolve();
    var defineBuiltIn = requireDefineBuiltIn();
    var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;

    // Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
    var NON_GENERIC = !!NativePromiseConstructor && fails(function () {
      // eslint-disable-next-line unicorn/no-thenable -- required for testing
      NativePromisePrototype['finally'].call({
        then: function then() {/* empty */}
      }, function () {/* empty */});
    });

    // `Promise.prototype.finally` method
    // https://tc39.es/ecma262/#sec-promise.prototype.finally
    $({
      target: 'Promise',
      proto: true,
      real: true,
      forced: NON_GENERIC
    }, {
      'finally': function _finally(onFinally) {
        var C = speciesConstructor(this, getBuiltIn('Promise'));
        var isFunction = isCallable(onFinally);
        return this.then(isFunction ? function (x) {
          return promiseResolve(C, onFinally()).then(function () {
            return x;
          });
        } : onFinally, isFunction ? function (e) {
          return promiseResolve(C, onFinally()).then(function () {
            throw e;
          });
        } : onFinally);
      }
    });

    // makes sure that native promise-based APIs `Promise#finally` properly works with patched `Promise#then`
    if (!IS_PURE && isCallable(NativePromiseConstructor)) {
      var method = getBuiltIn('Promise').prototype['finally'];
      if (NativePromisePrototype['finally'] !== method) {
        defineBuiltIn(NativePromisePrototype, 'finally', method, {
          unsafe: true
        });
      }
    }
    return es_promise_finally;
  }

  requireEs_promise_finally();

  var promiseConstructorDetection;
  var hasRequiredPromiseConstructorDetection;
  function requirePromiseConstructorDetection() {
    if (hasRequiredPromiseConstructorDetection) return promiseConstructorDetection;
    hasRequiredPromiseConstructorDetection = 1;
    var globalThis = requireGlobalThis();
    var NativePromiseConstructor = requirePromiseNativeConstructor();
    var isCallable = requireIsCallable();
    var isForced = requireIsForced();
    var inspectSource = requireInspectSource();
    var wellKnownSymbol = requireWellKnownSymbol();
    var ENVIRONMENT = requireEnvironment();
    var IS_PURE = requireIsPure();
    var V8_VERSION = requireEnvironmentV8Version();
    var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
    var SPECIES = wellKnownSymbol('species');
    var SUBCLASSING = false;
    var NATIVE_PROMISE_REJECTION_EVENT = isCallable(globalThis.PromiseRejectionEvent);
    var FORCED_PROMISE_CONSTRUCTOR = isForced('Promise', function () {
      var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(NativePromiseConstructor);
      var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(NativePromiseConstructor);
      // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // We can't detect it synchronously, so just check versions
      if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
      // We need Promise#{ catch, finally } in the pure version for preventing prototype pollution
      if (IS_PURE && !(NativePromisePrototype['catch'] && NativePromisePrototype['finally'])) return true;
      // We can't use @@species feature detection in V8 since it causes
      // deoptimization and performance degradation
      // https://github.com/zloirock/core-js/issues/679
      if (!V8_VERSION || V8_VERSION < 51 || !/native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) {
        // Detect correctness of subclassing with @@species support
        var promise = new NativePromiseConstructor(function (resolve) {
          resolve(1);
        });
        var FakePromise = function FakePromise(exec) {
          exec(function () {/* empty */}, function () {/* empty */});
        };
        var constructor = promise.constructor = {};
        constructor[SPECIES] = FakePromise;
        SUBCLASSING = promise.then(function () {/* empty */}) instanceof FakePromise;
        if (!SUBCLASSING) return true;
        // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
      }
      return !GLOBAL_CORE_JS_PROMISE && (ENVIRONMENT === 'BROWSER' || ENVIRONMENT === 'DENO') && !NATIVE_PROMISE_REJECTION_EVENT;
    });
    promiseConstructorDetection = {
      CONSTRUCTOR: FORCED_PROMISE_CONSTRUCTOR,
      REJECTION_EVENT: NATIVE_PROMISE_REJECTION_EVENT,
      SUBCLASSING: SUBCLASSING
    };
    return promiseConstructorDetection;
  }

  var hasRequiredEs_promise_constructor;
  function requireEs_promise_constructor() {
    if (hasRequiredEs_promise_constructor) return es_promise_constructor;
    hasRequiredEs_promise_constructor = 1;
    var $ = require_export();
    var IS_PURE = requireIsPure();
    var IS_NODE = requireEnvironmentIsNode();
    var globalThis = requireGlobalThis();
    var path = requirePath();
    var call = requireFunctionCall();
    var defineBuiltIn = requireDefineBuiltIn();
    var setPrototypeOf = requireObjectSetPrototypeOf();
    var setToStringTag = requireSetToStringTag();
    var setSpecies = requireSetSpecies();
    var aCallable = requireACallable();
    var isCallable = requireIsCallable();
    var isObject = requireIsObject();
    var anInstance = requireAnInstance();
    var speciesConstructor = requireSpeciesConstructor();
    var task = requireTask().set;
    var microtask = requireMicrotask();
    var hostReportErrors = requireHostReportErrors();
    var perform = requirePerform();
    var Queue = requireQueue();
    var InternalStateModule = requireInternalState();
    var NativePromiseConstructor = requirePromiseNativeConstructor();
    var PromiseConstructorDetection = requirePromiseConstructorDetection();
    var newPromiseCapabilityModule = requireNewPromiseCapability();
    var PROMISE = 'Promise';
    var FORCED_PROMISE_CONSTRUCTOR = PromiseConstructorDetection.CONSTRUCTOR;
    var NATIVE_PROMISE_REJECTION_EVENT = PromiseConstructorDetection.REJECTION_EVENT;
    var NATIVE_PROMISE_SUBCLASSING = PromiseConstructorDetection.SUBCLASSING;
    var getInternalPromiseState = InternalStateModule.getterFor(PROMISE);
    var setInternalState = InternalStateModule.set;
    var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
    var PromiseConstructor = NativePromiseConstructor;
    var PromisePrototype = NativePromisePrototype;
    var TypeError = globalThis.TypeError;
    var document = globalThis.document;
    var process = globalThis.process;
    var newPromiseCapability = newPromiseCapabilityModule.f;
    var newGenericPromiseCapability = newPromiseCapability;
    var DISPATCH_EVENT = !!(document && document.createEvent && globalThis.dispatchEvent);
    var UNHANDLED_REJECTION = 'unhandledrejection';
    var REJECTION_HANDLED = 'rejectionhandled';
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    var HANDLED = 1;
    var UNHANDLED = 2;
    var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

    // helpers
    var isThenable = function isThenable(it) {
      var then;
      return isObject(it) && isCallable(then = it.then) ? then : false;
    };
    var callReaction = function callReaction(reaction, state) {
      var value = state.value;
      var ok = state.state === FULFILLED;
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (state.rejection === UNHANDLED) onHandleUnhandled(state);
            state.rejection = HANDLED;
          }
          if (handler === true) result = value;else {
            if (domain) domain.enter();
            result = handler(value); // can throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(new TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            call(then, result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (error) {
        if (domain && !exited) domain.exit();
        reject(error);
      }
    };
    var notify = function notify(state, isReject) {
      if (state.notified) return;
      state.notified = true;
      microtask(function () {
        var reactions = state.reactions;
        var reaction;
        while (reaction = reactions.get()) {
          callReaction(reaction, state);
        }
        state.notified = false;
        if (isReject && !state.rejection) onUnhandled(state);
      });
    };
    var dispatchEvent = function dispatchEvent(name, promise, reason) {
      var event, handler;
      if (DISPATCH_EVENT) {
        event = document.createEvent('Event');
        event.promise = promise;
        event.reason = reason;
        event.initEvent(name, false, true);
        globalThis.dispatchEvent(event);
      } else event = {
        promise: promise,
        reason: reason
      };
      if (!NATIVE_PROMISE_REJECTION_EVENT && (handler = globalThis['on' + name])) handler(event);else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
    };
    var onUnhandled = function onUnhandled(state) {
      call(task, globalThis, function () {
        var promise = state.facade;
        var value = state.value;
        var IS_UNHANDLED = isUnhandled(state);
        var result;
        if (IS_UNHANDLED) {
          result = perform(function () {
            if (IS_NODE) {
              process.emit('unhandledRejection', value, promise);
            } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
          });
          // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
          state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
          if (result.error) throw result.value;
        }
      });
    };
    var isUnhandled = function isUnhandled(state) {
      return state.rejection !== HANDLED && !state.parent;
    };
    var onHandleUnhandled = function onHandleUnhandled(state) {
      call(task, globalThis, function () {
        var promise = state.facade;
        if (IS_NODE) {
          process.emit('rejectionHandled', promise);
        } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
      });
    };
    var bind = function bind(fn, state, unwrap) {
      return function (value) {
        fn(state, value, unwrap);
      };
    };
    var internalReject = function internalReject(state, value, unwrap) {
      if (state.done) return;
      state.done = true;
      if (unwrap) state = unwrap;
      state.value = value;
      state.state = REJECTED;
      notify(state, true);
    };
    var _internalResolve = function internalResolve(state, value, unwrap) {
      if (state.done) return;
      state.done = true;
      if (unwrap) state = unwrap;
      try {
        if (state.facade === value) throw new TypeError("Promise can't be resolved itself");
        var then = isThenable(value);
        if (then) {
          microtask(function () {
            var wrapper = {
              done: false
            };
            try {
              call(then, value, bind(_internalResolve, wrapper, state), bind(internalReject, wrapper, state));
            } catch (error) {
              internalReject(wrapper, error, state);
            }
          });
        } else {
          state.value = value;
          state.state = FULFILLED;
          notify(state, false);
        }
      } catch (error) {
        internalReject({
          done: false
        }, error, state);
      }
    };

    // constructor polyfill
    if (FORCED_PROMISE_CONSTRUCTOR) {
      // 25.4.3.1 Promise(executor)
      PromiseConstructor = function Promise(executor) {
        anInstance(this, PromisePrototype);
        aCallable(executor);
        call(Internal, this);
        var state = getInternalPromiseState(this);
        try {
          executor(bind(_internalResolve, state), bind(internalReject, state));
        } catch (error) {
          internalReject(state, error);
        }
      };
      PromisePrototype = PromiseConstructor.prototype;

      // eslint-disable-next-line no-unused-vars -- required for `.length`
      Internal = function Promise(executor) {
        setInternalState(this, {
          type: PROMISE,
          done: false,
          notified: false,
          parent: false,
          reactions: new Queue(),
          rejection: false,
          state: PENDING,
          value: null
        });
      };

      // `Promise.prototype.then` method
      // https://tc39.es/ecma262/#sec-promise.prototype.then
      Internal.prototype = defineBuiltIn(PromisePrototype, 'then', function then(onFulfilled, onRejected) {
        var state = getInternalPromiseState(this);
        var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
        state.parent = true;
        reaction.ok = isCallable(onFulfilled) ? onFulfilled : true;
        reaction.fail = isCallable(onRejected) && onRejected;
        reaction.domain = IS_NODE ? process.domain : undefined;
        if (state.state === PENDING) state.reactions.add(reaction);else microtask(function () {
          callReaction(reaction, state);
        });
        return reaction.promise;
      });
      OwnPromiseCapability = function OwnPromiseCapability() {
        var promise = new Internal();
        var state = getInternalPromiseState(promise);
        this.promise = promise;
        this.resolve = bind(_internalResolve, state);
        this.reject = bind(internalReject, state);
      };
      newPromiseCapabilityModule.f = newPromiseCapability = function newPromiseCapability(C) {
        return C === PromiseConstructor || C === PromiseWrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
      };
      if (!IS_PURE && isCallable(NativePromiseConstructor) && NativePromisePrototype !== Object.prototype) {
        nativeThen = NativePromisePrototype.then;
        if (!NATIVE_PROMISE_SUBCLASSING) {
          // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
          defineBuiltIn(NativePromisePrototype, 'then', function then(onFulfilled, onRejected) {
            var that = this;
            return new PromiseConstructor(function (resolve, reject) {
              call(nativeThen, that, resolve, reject);
            }).then(onFulfilled, onRejected);
            // https://github.com/zloirock/core-js/issues/640
          }, {
            unsafe: true
          });
        }

        // make `.constructor === Promise` work for native promise-based APIs
        try {
          delete NativePromisePrototype.constructor;
        } catch (error) {/* empty */}

        // make `instanceof Promise` work for native promise-based APIs
        if (setPrototypeOf) {
          setPrototypeOf(NativePromisePrototype, PromisePrototype);
        }
      }
    }

    // `Promise` constructor
    // https://tc39.es/ecma262/#sec-promise-executor
    $({
      global: true,
      constructor: true,
      wrap: true,
      forced: FORCED_PROMISE_CONSTRUCTOR
    }, {
      Promise: PromiseConstructor
    });
    PromiseWrapper = path.Promise;
    setToStringTag(PromiseConstructor, PROMISE, false, true);
    setSpecies(PROMISE);
    return es_promise_constructor;
  }

  var es_promise_all = {};

  var isArrayIteratorMethod;
  var hasRequiredIsArrayIteratorMethod;
  function requireIsArrayIteratorMethod() {
    if (hasRequiredIsArrayIteratorMethod) return isArrayIteratorMethod;
    hasRequiredIsArrayIteratorMethod = 1;
    var wellKnownSymbol = requireWellKnownSymbol();
    var Iterators = requireIterators();
    var ITERATOR = wellKnownSymbol('iterator');
    var ArrayPrototype = Array.prototype;

    // check on default Array iterator
    isArrayIteratorMethod = function isArrayIteratorMethod(it) {
      return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
    };
    return isArrayIteratorMethod;
  }

  var getIteratorMethod;
  var hasRequiredGetIteratorMethod;
  function requireGetIteratorMethod() {
    if (hasRequiredGetIteratorMethod) return getIteratorMethod;
    hasRequiredGetIteratorMethod = 1;
    var classof = requireClassof();
    var getMethod = requireGetMethod();
    var isNullOrUndefined = requireIsNullOrUndefined();
    var Iterators = requireIterators();
    var wellKnownSymbol = requireWellKnownSymbol();
    var ITERATOR = wellKnownSymbol('iterator');
    getIteratorMethod = function getIteratorMethod(it) {
      if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR) || getMethod(it, '@@iterator') || Iterators[classof(it)];
    };
    return getIteratorMethod;
  }

  var getIterator;
  var hasRequiredGetIterator;
  function requireGetIterator() {
    if (hasRequiredGetIterator) return getIterator;
    hasRequiredGetIterator = 1;
    var call = requireFunctionCall();
    var aCallable = requireACallable();
    var anObject = requireAnObject();
    var tryToString = requireTryToString();
    var getIteratorMethod = requireGetIteratorMethod();
    var $TypeError = TypeError;
    getIterator = function getIterator(argument, usingIterator) {
      var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
      if (aCallable(iteratorMethod)) return anObject(call(iteratorMethod, argument));
      throw new $TypeError(tryToString(argument) + ' is not iterable');
    };
    return getIterator;
  }

  var iteratorClose;
  var hasRequiredIteratorClose;
  function requireIteratorClose() {
    if (hasRequiredIteratorClose) return iteratorClose;
    hasRequiredIteratorClose = 1;
    var call = requireFunctionCall();
    var anObject = requireAnObject();
    var getMethod = requireGetMethod();
    iteratorClose = function iteratorClose(iterator, kind, value) {
      var innerResult, innerError;
      anObject(iterator);
      try {
        innerResult = getMethod(iterator, 'return');
        if (!innerResult) {
          if (kind === 'throw') throw value;
          return value;
        }
        innerResult = call(innerResult, iterator);
      } catch (error) {
        innerError = true;
        innerResult = error;
      }
      if (kind === 'throw') throw value;
      if (innerError) throw innerResult;
      anObject(innerResult);
      return value;
    };
    return iteratorClose;
  }

  var iterate;
  var hasRequiredIterate;
  function requireIterate() {
    if (hasRequiredIterate) return iterate;
    hasRequiredIterate = 1;
    var bind = requireFunctionBindContext();
    var call = requireFunctionCall();
    var anObject = requireAnObject();
    var tryToString = requireTryToString();
    var isArrayIteratorMethod = requireIsArrayIteratorMethod();
    var lengthOfArrayLike = requireLengthOfArrayLike();
    var isPrototypeOf = requireObjectIsPrototypeOf();
    var getIterator = requireGetIterator();
    var getIteratorMethod = requireGetIteratorMethod();
    var iteratorClose = requireIteratorClose();
    var $TypeError = TypeError;
    var Result = function Result(stopped, result) {
      this.stopped = stopped;
      this.result = result;
    };
    var ResultPrototype = Result.prototype;
    iterate = function iterate(iterable, unboundFunction, options) {
      var that = options && options.that;
      var AS_ENTRIES = !!(options && options.AS_ENTRIES);
      var IS_RECORD = !!(options && options.IS_RECORD);
      var IS_ITERATOR = !!(options && options.IS_ITERATOR);
      var INTERRUPTED = !!(options && options.INTERRUPTED);
      var fn = bind(unboundFunction, that);
      var iterator, iterFn, index, length, result, next, step;
      var stop = function stop(condition) {
        if (iterator) iteratorClose(iterator, 'normal');
        return new Result(true, condition);
      };
      var callFn = function callFn(value) {
        if (AS_ENTRIES) {
          anObject(value);
          return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
        }
        return INTERRUPTED ? fn(value, stop) : fn(value);
      };
      if (IS_RECORD) {
        iterator = iterable.iterator;
      } else if (IS_ITERATOR) {
        iterator = iterable;
      } else {
        iterFn = getIteratorMethod(iterable);
        if (!iterFn) throw new $TypeError(tryToString(iterable) + ' is not iterable');
        // optimisation for array iterators
        if (isArrayIteratorMethod(iterFn)) {
          for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
            result = callFn(iterable[index]);
            if (result && isPrototypeOf(ResultPrototype, result)) return result;
          }
          return new Result(false);
        }
        iterator = getIterator(iterable, iterFn);
      }
      next = IS_RECORD ? iterable.next : iterator.next;
      while (!(step = call(next, iterator)).done) {
        try {
          result = callFn(step.value);
        } catch (error) {
          iteratorClose(iterator, 'throw', error);
        }
        if (_typeof(result) == 'object' && result && isPrototypeOf(ResultPrototype, result)) return result;
      }
      return new Result(false);
    };
    return iterate;
  }

  var es_array_from = {};

  var callWithSafeIterationClosing;
  var hasRequiredCallWithSafeIterationClosing;
  function requireCallWithSafeIterationClosing() {
    if (hasRequiredCallWithSafeIterationClosing) return callWithSafeIterationClosing;
    hasRequiredCallWithSafeIterationClosing = 1;
    var anObject = requireAnObject();
    var iteratorClose = requireIteratorClose();

    // call something on iterator step with safe closing on error
    callWithSafeIterationClosing = function callWithSafeIterationClosing(iterator, fn, value, ENTRIES) {
      try {
        return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
      } catch (error) {
        iteratorClose(iterator, 'throw', error);
      }
    };
    return callWithSafeIterationClosing;
  }

  var arrayFrom;
  var hasRequiredArrayFrom;
  function requireArrayFrom() {
    if (hasRequiredArrayFrom) return arrayFrom;
    hasRequiredArrayFrom = 1;
    var bind = requireFunctionBindContext();
    var call = requireFunctionCall();
    var toObject = requireToObject();
    var callWithSafeIterationClosing = requireCallWithSafeIterationClosing();
    var isArrayIteratorMethod = requireIsArrayIteratorMethod();
    var isConstructor = requireIsConstructor();
    var lengthOfArrayLike = requireLengthOfArrayLike();
    var createProperty = requireCreateProperty();
    var getIterator = requireGetIterator();
    var getIteratorMethod = requireGetIteratorMethod();
    var $Array = Array;

    // `Array.from` method implementation
    // https://tc39.es/ecma262/#sec-array.from
    arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
      var O = toObject(arrayLike);
      var IS_CONSTRUCTOR = isConstructor(this);
      var argumentsLength = arguments.length;
      var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
      var iteratorMethod = getIteratorMethod(O);
      var index = 0;
      var length, result, step, iterator, next, value;
      // if the target is not iterable or it's an array with the default iterator - use a simple case
      if (iteratorMethod && !(this === $Array && isArrayIteratorMethod(iteratorMethod))) {
        result = IS_CONSTRUCTOR ? new this() : [];
        iterator = getIterator(O, iteratorMethod);
        next = iterator.next;
        for (; !(step = call(next, iterator)).done; index++) {
          value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
          createProperty(result, index, value);
        }
      } else {
        length = lengthOfArrayLike(O);
        result = IS_CONSTRUCTOR ? new this(length) : $Array(length);
        for (; length > index; index++) {
          value = mapping ? mapfn(O[index], index) : O[index];
          createProperty(result, index, value);
        }
      }
      result.length = index;
      return result;
    };
    return arrayFrom;
  }

  var hasRequiredEs_array_from;
  function requireEs_array_from() {
    if (hasRequiredEs_array_from) return es_array_from;
    hasRequiredEs_array_from = 1;
    var $ = require_export();
    var from = requireArrayFrom();
    var checkCorrectnessOfIteration = requireCheckCorrectnessOfIteration();
    var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
      // eslint-disable-next-line es/no-array-from -- required for testing
      Array.from(iterable);
    });

    // `Array.from` method
    // https://tc39.es/ecma262/#sec-array.from
    $({
      target: 'Array',
      stat: true,
      forced: INCORRECT_ITERATION
    }, {
      from: from
    });
    return es_array_from;
  }

  requireEs_array_from();

  var checkCorrectnessOfIteration;
  var hasRequiredCheckCorrectnessOfIteration;
  function requireCheckCorrectnessOfIteration() {
    if (hasRequiredCheckCorrectnessOfIteration) return checkCorrectnessOfIteration;
    hasRequiredCheckCorrectnessOfIteration = 1;
    var wellKnownSymbol = requireWellKnownSymbol();
    var ITERATOR = wellKnownSymbol('iterator');
    var SAFE_CLOSING = false;
    try {
      var called = 0;
      var iteratorWithReturn = {
        next: function next() {
          return {
            done: !!called++
          };
        },
        'return': function _return() {
          SAFE_CLOSING = true;
        }
      };
      iteratorWithReturn[ITERATOR] = function () {
        return this;
      };
      // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
      Array.from(iteratorWithReturn, function () {
        throw 2;
      });
    } catch (error) {/* empty */}
    checkCorrectnessOfIteration = function checkCorrectnessOfIteration(exec, SKIP_CLOSING) {
      try {
        if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
      } catch (error) {
        return false;
      } // workaround of old WebKit + `eval` bug
      var ITERATION_SUPPORT = false;
      try {
        var object = {};
        object[ITERATOR] = function () {
          return {
            next: function next() {
              return {
                done: ITERATION_SUPPORT = true
              };
            }
          };
        };
        exec(object);
      } catch (error) {/* empty */}
      return ITERATION_SUPPORT;
    };
    return checkCorrectnessOfIteration;
  }

  var promiseStaticsIncorrectIteration;
  var hasRequiredPromiseStaticsIncorrectIteration;
  function requirePromiseStaticsIncorrectIteration() {
    if (hasRequiredPromiseStaticsIncorrectIteration) return promiseStaticsIncorrectIteration;
    hasRequiredPromiseStaticsIncorrectIteration = 1;
    var NativePromiseConstructor = requirePromiseNativeConstructor();
    var checkCorrectnessOfIteration = requireCheckCorrectnessOfIteration();
    var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;
    promiseStaticsIncorrectIteration = FORCED_PROMISE_CONSTRUCTOR || !checkCorrectnessOfIteration(function (iterable) {
      NativePromiseConstructor.all(iterable).then(undefined, function () {/* empty */});
    });
    return promiseStaticsIncorrectIteration;
  }

  var hasRequiredEs_promise_all;
  function requireEs_promise_all() {
    if (hasRequiredEs_promise_all) return es_promise_all;
    hasRequiredEs_promise_all = 1;
    var $ = require_export();
    var call = requireFunctionCall();
    var aCallable = requireACallable();
    var newPromiseCapabilityModule = requireNewPromiseCapability();
    var perform = requirePerform();
    var iterate = requireIterate();
    var PROMISE_STATICS_INCORRECT_ITERATION = requirePromiseStaticsIncorrectIteration();

    // `Promise.all` method
    // https://tc39.es/ecma262/#sec-promise.all
    $({
      target: 'Promise',
      stat: true,
      forced: PROMISE_STATICS_INCORRECT_ITERATION
    }, {
      all: function all(iterable) {
        var C = this;
        var capability = newPromiseCapabilityModule.f(C);
        var resolve = capability.resolve;
        var reject = capability.reject;
        var result = perform(function () {
          var $promiseResolve = aCallable(C.resolve);
          var values = [];
          var counter = 0;
          var remaining = 1;
          iterate(iterable, function (promise) {
            var index = counter++;
            var alreadyCalled = false;
            remaining++;
            call($promiseResolve, C, promise).then(function (value) {
              if (alreadyCalled) return;
              alreadyCalled = true;
              values[index] = value;
              --remaining || resolve(values);
            }, reject);
          });
          --remaining || resolve(values);
        });
        if (result.error) reject(result.value);
        return capability.promise;
      }
    });
    return es_promise_all;
  }

  var es_promise_catch = {};

  var hasRequiredEs_promise_catch;
  function requireEs_promise_catch() {
    if (hasRequiredEs_promise_catch) return es_promise_catch;
    hasRequiredEs_promise_catch = 1;
    var $ = require_export();
    var IS_PURE = requireIsPure();
    var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;
    var NativePromiseConstructor = requirePromiseNativeConstructor();
    var getBuiltIn = requireGetBuiltIn();
    var isCallable = requireIsCallable();
    var defineBuiltIn = requireDefineBuiltIn();
    var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;

    // `Promise.prototype.catch` method
    // https://tc39.es/ecma262/#sec-promise.prototype.catch
    $({
      target: 'Promise',
      proto: true,
      forced: FORCED_PROMISE_CONSTRUCTOR,
      real: true
    }, {
      'catch': function _catch(onRejected) {
        return this.then(undefined, onRejected);
      }
    });

    // makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
    if (!IS_PURE && isCallable(NativePromiseConstructor)) {
      var method = getBuiltIn('Promise').prototype['catch'];
      if (NativePromisePrototype['catch'] !== method) {
        defineBuiltIn(NativePromisePrototype, 'catch', method, {
          unsafe: true
        });
      }
    }
    return es_promise_catch;
  }

  var es_promise_race = {};

  var hasRequiredEs_promise_race;
  function requireEs_promise_race() {
    if (hasRequiredEs_promise_race) return es_promise_race;
    hasRequiredEs_promise_race = 1;
    var $ = require_export();
    var call = requireFunctionCall();
    var aCallable = requireACallable();
    var newPromiseCapabilityModule = requireNewPromiseCapability();
    var perform = requirePerform();
    var iterate = requireIterate();
    var PROMISE_STATICS_INCORRECT_ITERATION = requirePromiseStaticsIncorrectIteration();

    // `Promise.race` method
    // https://tc39.es/ecma262/#sec-promise.race
    $({
      target: 'Promise',
      stat: true,
      forced: PROMISE_STATICS_INCORRECT_ITERATION
    }, {
      race: function race(iterable) {
        var C = this;
        var capability = newPromiseCapabilityModule.f(C);
        var reject = capability.reject;
        var result = perform(function () {
          var $promiseResolve = aCallable(C.resolve);
          iterate(iterable, function (promise) {
            call($promiseResolve, C, promise).then(capability.resolve, reject);
          });
        });
        if (result.error) reject(result.value);
        return capability.promise;
      }
    });
    return es_promise_race;
  }

  var es_promise_reject = {};

  var hasRequiredEs_promise_reject;
  function requireEs_promise_reject() {
    if (hasRequiredEs_promise_reject) return es_promise_reject;
    hasRequiredEs_promise_reject = 1;
    var $ = require_export();
    var newPromiseCapabilityModule = requireNewPromiseCapability();
    var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;

    // `Promise.reject` method
    // https://tc39.es/ecma262/#sec-promise.reject
    $({
      target: 'Promise',
      stat: true,
      forced: FORCED_PROMISE_CONSTRUCTOR
    }, {
      reject: function reject(r) {
        var capability = newPromiseCapabilityModule.f(this);
        var capabilityReject = capability.reject;
        capabilityReject(r);
        return capability.promise;
      }
    });
    return es_promise_reject;
  }

  var es_promise_resolve = {};

  var hasRequiredEs_promise_resolve;
  function requireEs_promise_resolve() {
    if (hasRequiredEs_promise_resolve) return es_promise_resolve;
    hasRequiredEs_promise_resolve = 1;
    var $ = require_export();
    var getBuiltIn = requireGetBuiltIn();
    var IS_PURE = requireIsPure();
    var NativePromiseConstructor = requirePromiseNativeConstructor();
    var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;
    var promiseResolve = requirePromiseResolve();
    var PromiseConstructorWrapper = getBuiltIn('Promise');
    var CHECK_WRAPPER = IS_PURE && !FORCED_PROMISE_CONSTRUCTOR;

    // `Promise.resolve` method
    // https://tc39.es/ecma262/#sec-promise.resolve
    $({
      target: 'Promise',
      stat: true,
      forced: IS_PURE || FORCED_PROMISE_CONSTRUCTOR
    }, {
      resolve: function resolve(x) {
        return promiseResolve(CHECK_WRAPPER && this === PromiseConstructorWrapper ? NativePromiseConstructor : this, x);
      }
    });
    return es_promise_resolve;
  }

  var hasRequiredEs_promise;
  function requireEs_promise() {
    if (hasRequiredEs_promise) return es_promise;
    hasRequiredEs_promise = 1;
    // TODO: Remove this module from `core-js@4` since it's split to modules listed below
    requireEs_promise_constructor();
    requireEs_promise_all();
    requireEs_promise_catch();
    requireEs_promise_race();
    requireEs_promise_reject();
    requireEs_promise_resolve();
    return es_promise;
  }

  requireEs_promise();

  var es_string_trim = {};

  var whitespaces;
  var hasRequiredWhitespaces;
  function requireWhitespaces() {
    if (hasRequiredWhitespaces) return whitespaces;
    hasRequiredWhitespaces = 1;
    // a string of all valid unicode whitespaces
    whitespaces = "\t\n\x0B\f\r \xA0\u1680\u2000\u2001\u2002" + "\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
    return whitespaces;
  }

  var stringTrim;
  var hasRequiredStringTrim;
  function requireStringTrim() {
    if (hasRequiredStringTrim) return stringTrim;
    hasRequiredStringTrim = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var requireObjectCoercible = requireRequireObjectCoercible();
    var toString = requireToString();
    var whitespaces = requireWhitespaces();
    var replace = uncurryThis(''.replace);
    var ltrim = RegExp('^[' + whitespaces + ']+');
    var rtrim = RegExp('(^|[^' + whitespaces + '])[' + whitespaces + ']+$');

    // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
    var createMethod = function createMethod(TYPE) {
      return function ($this) {
        var string = toString(requireObjectCoercible($this));
        if (TYPE & 1) string = replace(string, ltrim, '');
        if (TYPE & 2) string = replace(string, rtrim, '$1');
        return string;
      };
    };
    stringTrim = {
      // `String.prototype.{ trimLeft, trimStart }` methods
      // https://tc39.es/ecma262/#sec-string.prototype.trimstart
      start: createMethod(1),
      // `String.prototype.{ trimRight, trimEnd }` methods
      // https://tc39.es/ecma262/#sec-string.prototype.trimend
      end: createMethod(2),
      // `String.prototype.trim` method
      // https://tc39.es/ecma262/#sec-string.prototype.trim
      trim: createMethod(3)
    };
    return stringTrim;
  }

  var stringTrimForced;
  var hasRequiredStringTrimForced;
  function requireStringTrimForced() {
    if (hasRequiredStringTrimForced) return stringTrimForced;
    hasRequiredStringTrimForced = 1;
    var PROPER_FUNCTION_NAME = requireFunctionName().PROPER;
    var fails = requireFails();
    var whitespaces = requireWhitespaces();
    var non = "\u200B\x85\u180E";

    // check that a method works with the correct list
    // of whitespaces and has a correct name
    stringTrimForced = function stringTrimForced(METHOD_NAME) {
      return fails(function () {
        return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() !== non || PROPER_FUNCTION_NAME && whitespaces[METHOD_NAME].name !== METHOD_NAME;
      });
    };
    return stringTrimForced;
  }

  var hasRequiredEs_string_trim;
  function requireEs_string_trim() {
    if (hasRequiredEs_string_trim) return es_string_trim;
    hasRequiredEs_string_trim = 1;
    var $ = require_export();
    var $trim = requireStringTrim().trim;
    var forcedStringTrimMethod = requireStringTrimForced();

    // `String.prototype.trim` method
    // https://tc39.es/ecma262/#sec-string.prototype.trim
    $({
      target: 'String',
      proto: true,
      forced: forcedStringTrimMethod('trim')
    }, {
      trim: function trim() {
        return $trim(this);
      }
    });
    return es_string_trim;
  }

  requireEs_string_trim();

  var es_object_fromEntries = {};

  var hasRequiredEs_object_fromEntries;
  function requireEs_object_fromEntries() {
    if (hasRequiredEs_object_fromEntries) return es_object_fromEntries;
    hasRequiredEs_object_fromEntries = 1;
    var $ = require_export();
    var iterate = requireIterate();
    var createProperty = requireCreateProperty();

    // `Object.fromEntries` method
    // https://tc39.es/ecma262/#sec-object.fromentries
    $({
      target: 'Object',
      stat: true
    }, {
      fromEntries: function fromEntries(iterable) {
        var obj = {};
        iterate(iterable, function (k, v) {
          createProperty(obj, k, v);
        }, {
          AS_ENTRIES: true
        });
        return obj;
      }
    });
    return es_object_fromEntries;
  }

  requireEs_object_fromEntries();

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }
  function hasInvalidChars(name) {
    return /[.#$\[\]\/]/.test(name);
  }

  var _excluded = ["spyGuessLimit"],
    _excluded2 = ["creatorName", "spyGuessLimit"];
  var anonymousSignInPromise = null;

  // Konumlar ve kategoriler için veri havuzları
  var POOLS = {
    locations: ["Havalimanı", "Hastane", "Restoran", "Okul", "Polis Merkezi", "İtfaiye", "Kütüphane", "Müze", "Sinema", "Stadyum", "Plaj", "Park", "Alışveriş Merkezi", "Tren Garı", "Otobüs Terminali", "Otel", "Üniversite", "Ofis", "Fabrika", "Banka", "Hayvanat Bahçesi", "Lunapark", "Çiftlik", "Akvaryum", "Tiyatro", "Kumarhane", "Uzay İstasyonu", "Korsan Gemisi", "Çöl", "Orman", "Dağ", "Köy", "Liman", "Denizaltı", "Depo"],
    "Ünlü Türk Oyuncular": ["Kıvanç Tatlıtuğ", "Beren Saat", "Halit Ergenç", "Bergüzar Korel", "Kenan İmirzalıoğlu", "Tuba Büyüküstün", "Engin Akyürek", "Burak Özçivit", "Fahriye Evcen", "Çağatay Ulusoy", "Elçin Sangu", "Neslihan Atagül", "Serenay Sarıkaya", "Haluk Bilginer", "Nurgül Yeşilçay", "Binnur Kaya", "Demet Özdemir", "Özcan Deniz", "Aslı Enver", "Meryem Uzerli", "Nesrin Cavadzade", "Hazal Kaya", "Aras Bulut İynemli", "Cansu Dere", "İlker Kaleli", "Tolga Sarıtaş", "Hande Erçel", "Gülse Birsel", "Şener Şen", "Demet Evgar", "Afra Saraçoğlu", "Kadir İnanır", "Türkan Şoray", "Kerem Bürsin", "Birce Akalay"],
    "Türk Şarkıcılar": ["Sezen Aksu", "Tarkan", "Ajda Pekkan", "Sertab Erener", "Hadise", "Barış Manço", "Zeki Müren", "Mabel Matiz", "Kenan Doğulu", "Gülşen", "Edis", "Murat Boz", "Aleyna Tilki", "Berkay", "Teoman", "Gökhan Özen", "Sıla", "Hakan Peker", "Ceza", "Sagopa Kajmer", "Mustafa Sandal", "İbrahim Tatlıses", "Nil Karaibrahimgil", "Yıldız Tilbe", "Demet Akalın", "Hande Yener", "Nazan Öncel", "Funda Arar", "Gökçe", "İrem Derici", "Mahsun Kırmızıgül", "Cem Adrian", "Zehra"],
    "Medya ve Influencerlar": ["Acun Ilıcalı", "Beyazıt Öztürk", "Mehmet Ali Erbil", "Okan Bayülgen", "Cüneyt Özdemir", "Çağla Şikel", "Ece Üner", "Seren Serengil", "Seda Sayan", "Müge Anlı", "Fatih Portakal", "Ali İhsan Varol", "Enes Batur", "Danla Bilic", "Orkun Işıtmak", "Reynmen", "Ruhi Çenet", "Barış Özcan", "Duygu Özaslan", "Doğan Kabak", "Meryem Can", "Berkcan Güven", "Cemre Solmaz", "Kendine Müzisyen", "Furkan Yaman", "Tolga Çevik", "Mesut Can Tomay", "Kafalar", "Büşra Pekin", "Şeyma Subaşı", "Haluk Levent", "Ceyda Kasabalı", "Yasemin Sakallıoğlu"],
    "Politikacılar": ["Recep Tayyip Erdoğan", "Kemal Kılıçdaroğlu", "Devlet Bahçeli", "Meral Akşener", "Ekrem İmamoğlu", "Mansur Yavaş", "Abdullah Gül", "Ahmet Davutoğlu", "Ali Babacan", "Binali Yıldırım", "Süleyman Soylu", "Bekir Bozdağ", "Mehmet Şimşek", "Fuat Oktay", "Numan Kurtulmuş", "Nureddin Nebati", "Hulusi Akar", "Fahrettin Koca", "Mevlüt Çavuşoğlu", "Selahattin Demirtaş", "Figen Yüksekdağ", "Ahmet Türk", "Pervin Buldan", "Doğu Perinçek", "Temel Karamollaoğlu", "Muharrem İnce", "Ümit Özdağ", "Ömer Çelik", "Tanju Özcan", "Veli Ağbaba", "Mustafa Sarıgül", "Tansu Çiller", "Necmettin Erbakan", "İsmet İnönü"],
    "Animasyon Karakterleri": ["Mickey Mouse", "Bugs Bunny", "Homer Simpson", "Bart Simpson", "Lisa Simpson", "Marge Simpson", "SpongeBob SquarePants", "Patrick Star", "Squidward Tentacles", "Dora the Explorer", "Shrek", "Donkey", "Fiona", "Rick Sanchez", "Morty Smith", "Naruto Uzumaki", "Sasuke Uchiha", "Son Goku", "Vegeta", "Pikachu", "Ash Ketchum", "Tom Cat", "Jerry Mouse", "Scooby-Doo", "Fred Flintstone", "Wilma Flintstone", "Barney Rubble", "Betty Rubble", "Popeye", "Olive Oyl", "Donald Duck", "Goofy", "Woody", "Buzz Lightyear"],
    "Dizi Karakterleri": ["Polat Alemdar", "Memati Baş", "Süleyman Çakır", "Ezel Bayraktar", "Ramiz Karaeski", "Behlül Haznedar", "Bihter Yöreoğlu", "Adnan Ziyagil", "Fatmagül Ketenci Ilgaz", "Kerim Ilgaz", "Mecnun Çınar", "Leyla Yıldız", "İsmail Abi", "Behzat Ç.", "Harun", "Yaman Koper", "Mira Beylice", "Feriha Yılmaz", "Emir Sarrafoğlu", "Hürrem Sultan", "Kanuni Sultan Süleyman", "Şehzade Mustafa", "Mihrimah Sultan", "Mahmut", "Yıldız", "Ender", "Onur", "Seymen Karadağ", "Ferhunde", "Ali Rıza Bey", "Deniz", "Zeynep", "Ömer", "Ali Kaptan"],
    "Fantastik Karakterler": ["Harry Potter", "Hermione Granger", "Ron Weasley", "Albus Dumbledore", "Lord Voldemort", "Gandalf", "Frodo Baggins", "Aragorn", "Legolas", "Gimli", "Bilbo Baggins", "Samwise Gamgee", "Galadriel", "Saruman", "Gollum", "Sauron", "Jon Snow", "Daenerys Targaryen", "Tyrion Lannister", "Cersei Lannister", "Arya Stark", "Eddard Stark", "Robb Stark", "Bran Stark", "Night King", "Geralt of Rivia", "Yennefer", "Dandelion", "Triss Merigold", "Batman", "Superman", "Wonder Woman", "Iron Man", "Spider-Man"],
    "En iyiler (Karışık)": ["Recep Tayyip Erdoğan", "Ekrem İmamoğlu", "Mansur Yavaş", "Kemal Kılıçdaroğlu", "Meral Akşener", "Devlet Bahçeli", "Aleyna Tilki", "Tarkan", "Sezen Aksu", "Ajda Pekkan", "Hadise", "Zeynep Bastık", "Kenan Doğulu", "Edis", "Mabel Matiz", "Buray", "Demet Akalın", "Cem Yılmaz", "Şahan Gökbakar", "Hasan Can Kaya", "Acun Ilıcalı", "Barış Özcan", "Enes Batur", "Reynmen", "Danla Bilic", "Orkun Işıtmak", "Kıvanç Tatlıtuğ", "Beren Saat", "Serenay Sarıkaya", "Çağatay Ulusoy", "Hande Erçel", "Burak Özçivit", "Afra Saraçoğlu", "Mert Ramazan Demir", "Pınar Deniz", "Aras Bulut İynemli", "Kerem Bürsin", "Engin Akyürek", "Hazal Kaya", "Cristiano Ronaldo", "Lionel Messi", "Kylian Mbappé", "Erling Haaland", "Neymar", "Karim Benzema", "Robert Lewandowski", "Zlatan İbrahimović", "Diego Maradona", "Pelé", "Ronaldinho", "David Beckham", "Novak Djokovic", "Roger Federer", "Rafael Nadal", "Michael Phelps", "Usain Bolt", "Simone Biles", "LeBron James", "Stephen Curry", "Giannis Antetokounmpo", "Nikola Jokic", "Michael Jordan", "Muhammad Ali", "Mike Tyson", "Khabib Nurmagomedov", "Conor McGregor", "Harry Potter", "Hermione Granger", "Ron Weasley", "Lord Voldemort", "Albus Dumbledore", "Batman", "Superman", "Wonder Woman", "Spider-Man", "Iron Man", "Captain America", "Thor", "Loki", "Thanos", "Black Panther", "Deadpool", "Joker", "Harley Quinn", "Homer Simpson", "Bart Simpson", "SpongeBob SquarePants", "Patrick Star", "Rick Sanchez", "Morty Smith", "BoJack Horseman", "Walter White", "Jesse Pinkman", "Saul Goodman", "Eleven", "Jon Snow", "Daenerys Targaryen", "Arya Stark", "Tyrion Lannister", "Darth Vader", "Luke Skywalker", "Yoda", "The Mandalorian", "Grogu"]
  };

  // Havuzları global olarak dışa aktar
  window.POOLS = POOLS;

  // Fisher–Yates karıştırma yardımcıları
  function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }
  function samplePool(list, n) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var _ref = [list[j], list[i]];
      list[i] = _ref[0];
      list[j] = _ref[1];
    }
    return list.slice(0, n);
  }

  // Tüm oyunla ilgili mantık bu nesnede bulunur.
  var gameLogic = {
    getUid: function () {
      var _getUid = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              if (window.auth) {
                _context.n = 1;
                break;
              }
              return _context.a(2, null);
            case 1:
              if (!(window.auth.currentUser && window.auth.currentUser.uid)) {
                _context.n = 2;
                break;
              }
              return _context.a(2, window.auth.currentUser.uid);
            case 2:
              if (!anonymousSignInPromise) {
                anonymousSignInPromise = new Promise(function (resolve) {
                  var unsubscribe = window.auth.onAuthStateChanged(function (user) {
                    if (user && user.uid) {
                      unsubscribe();
                      resolve(user.uid);
                    }
                  });
                  window.auth.signInAnonymously().catch(function (err) {
                    console.error("Anonim giriş hatası:", err);
                    unsubscribe();
                    resolve(null);
                  });
                });
              }
              return _context.a(2, anonymousSignInPromise);
          }
        }, _callee);
      }));
      function getUid() {
        return _getUid.apply(this, arguments);
      }
      return getUid;
    }(),
    saveSettings: function () {
      var _saveSettings = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(settings) {
        var uid, spyGuessLimit, rest;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _context2.n = 1;
              return this.getUid();
            case 1:
              uid = _context2.v;
              if (uid) {
                _context2.n = 2;
                break;
              }
              throw new Error("Kimlik doğrulaması tamamlanamadı");
            case 2:
              spyGuessLimit = settings.spyGuessLimit, rest = _objectWithoutProperties(settings, _excluded);
              return _context2.a(2, window.db.ref("savedSettings/".concat(uid)).set(_objectSpread2(_objectSpread2({}, rest), {}, {
                spyGuessLimit: spyGuessLimit
              })));
          }
        }, _callee2, this);
      }));
      function saveSettings(_x) {
        return _saveSettings.apply(this, arguments);
      }
      return saveSettings;
    }(),
    loadSettings: function () {
      var _loadSettings = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
        var uid, snap;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              _context3.n = 1;
              return this.getUid();
            case 1:
              uid = _context3.v;
              if (uid) {
                _context3.n = 2;
                break;
              }
              return _context3.a(2, null);
            case 2:
              _context3.n = 3;
              return window.db.ref("savedSettings/".concat(uid)).get();
            case 3:
              snap = _context3.v;
              return _context3.a(2, snap.exists() ? snap.val() : null);
          }
        }, _callee3, this);
      }));
      function loadSettings() {
        return _loadSettings.apply(this, arguments);
      }
      return loadSettings;
    }(),
    /** Oda oluştur */
    createRoom: function () {
      var _createRoom = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(options) {
        var _ref2, creatorName, spyGuessLimit, settings, roomCode, uid, updates;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              _ref2 = options || {}, creatorName = _ref2.creatorName, spyGuessLimit = _ref2.spyGuessLimit, settings = _objectWithoutProperties(_ref2, _excluded2);
              roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
              _context4.n = 1;
              return this.getUid();
            case 1:
              uid = _context4.v;
              if (uid) {
                _context4.n = 2;
                break;
              }
              alert("Kimlik doğrulaması tamamlanamadı. Lütfen tekrar deneyin.");
              return _context4.a(2, null);
            case 2:
              updates = {};
              updates["rooms/".concat(roomCode, "/settings")] = _objectSpread2(_objectSpread2({}, settings), {}, {
                spyGuessLimit: spyGuessLimit
              });
              updates["rooms/".concat(roomCode, "/players/").concat(uid)] = {
                name: creatorName,
                isCreator: true
              };
              _context4.n = 3;
              return window.db.ref().update(updates);
            case 3:
              localStorage.setItem("roomCode", roomCode);
              localStorage.setItem("playerName", creatorName);
              localStorage.setItem("isCreator", "true");
              return _context4.a(2, roomCode);
          }
        }, _callee4, this);
      }));
      function createRoom(_x2) {
        return _createRoom.apply(this, arguments);
      }
      return createRoom;
    }(),
    /** Odaya katıl */
    joinRoom: function () {
      var _joinRoom = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(playerName, roomCode) {
        var roomRef, snapshot, roomData, players, uid, playerRef, updatedPlayers;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              roomRef = window.db.ref("rooms/" + roomCode);
              _context5.n = 1;
              return roomRef.get();
            case 1:
              snapshot = _context5.v;
              if (snapshot.exists()) {
                _context5.n = 2;
                break;
              }
              throw new Error("Oda bulunamadı!");
            case 2:
              roomData = snapshot.val();
              players = roomData.players || {};
              if (!(Object.keys(players).length >= ROOM_PLAYER_LIMIT)) {
                _context5.n = 3;
                break;
              }
              throw new Error("Oda dolu!");
            case 3:
              _context5.n = 4;
              return this.getUid();
            case 4:
              uid = _context5.v;
              if (uid) {
                _context5.n = 5;
                break;
              }
              throw new Error("Kimlik doğrulanamadı");
            case 5:
              playerRef = window.db.ref("rooms/".concat(roomCode, "/players/").concat(uid));
              _context5.n = 6;
              return playerRef.set({
                name: playerName,
                isCreator: false
              });
            case 6:
              updatedPlayers = _objectSpread2(_objectSpread2({}, players), {}, _defineProperty({}, uid, {
                name: playerName,
                isCreator: false
              }));
              return _context5.a(2, Object.values(updatedPlayers).map(function (p) {
                return p.name;
              }));
          }
        }, _callee5, this);
      }));
      function joinRoom(_x3, _x4) {
        return _joinRoom.apply(this, arguments);
      }
      return joinRoom;
    }(),
    /** Oyunculara roller atayın */
    assignRoles: function () {
      var _assignRoles = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(roomCode) {
        var settingsRef, playersRef, _yield$Promise$all, _yield$Promise$all2, settingsSnap, playersSnap, settings, players, uids, spyCount, spies, updates, gameType, isLocationGame, isCategoryGame, pool, chosenLocation, categoryName, allItems, _pool, chosenRole;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              settingsRef = window.db.ref("rooms/".concat(roomCode, "/settings"));
              playersRef = window.db.ref("rooms/".concat(roomCode, "/players"));
              _context6.n = 1;
              return Promise.all([settingsRef.get(), playersRef.get()]);
            case 1:
              _yield$Promise$all = _context6.v;
              _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
              settingsSnap = _yield$Promise$all2[0];
              playersSnap = _yield$Promise$all2[1];
              if (!(!settingsSnap.exists() || !playersSnap.exists())) {
                _context6.n = 2;
                break;
              }
              throw new Error("Oda bulunamadı");
            case 2:
              settings = settingsSnap.val();
              players = playersSnap.val() || {};
              uids = Object.keys(players);
              spyCount = Math.min(settings.spyCount || 0, uids.length);
              spies = samplePool([].concat(uids), spyCount);
              updates = {};
              updates["rooms/".concat(roomCode, "/spies")] = spies;
              gameType = settings.gameType;
              isLocationGame = gameType === "location";
              isCategoryGame = gameType === "category";
              if (!isLocationGame) {
                _context6.n = 3;
                break;
              }
              pool = samplePool(_toConsumableArray(POOLS.locations), settings.poolSize);
              chosenLocation = randomFrom(pool);
              uids.forEach(function (uid) {
                var isSpy = spies.includes(uid);
                updates["rooms/".concat(roomCode, "/playerRoles/").concat(uid)] = isSpy ? {
                  isSpy: true,
                  role: "Sahtekar",
                  location: null,
                  allLocations: pool,
                  guessesLeft: settings.spyGuessLimit
                } : {
                  isSpy: false,
                  role: "Masum",
                  location: chosenLocation,
                  allLocations: pool
                };
              });
              _context6.n = 6;
              break;
            case 3:
              if (!isCategoryGame) {
                _context6.n = 5;
                break;
              }
              categoryName = settings.categoryName;
              allItems = POOLS[categoryName] || [];
              _pool = samplePool(_toConsumableArray(allItems), settings.poolSize);
              if (!(_pool.length < 1)) {
                _context6.n = 4;
                break;
              }
              throw new Error("Kategori havuzunda yeterli öğe yok");
            case 4:
              chosenRole = randomFrom(_pool);
              uids.forEach(function (uid) {
                var isSpy = spies.includes(uid);
                updates["rooms/".concat(roomCode, "/playerRoles/").concat(uid)] = isSpy ? {
                  isSpy: true,
                  role: "Sahtekar",
                  location: null,
                  allLocations: _pool,
                  guessesLeft: settings.spyGuessLimit
                } : {
                  isSpy: false,
                  role: chosenRole,
                  location: categoryName,
                  allLocations: _pool
                };
              });
              _context6.n = 6;
              break;
            case 5:
              throw new Error("Bilinmeyen oyun türü");
            case 6:
              _context6.n = 7;
              return window.db.ref().update(updates);
            case 7:
              return _context6.a(2);
          }
        }, _callee6);
      }));
      function assignRoles(_x5) {
        return _assignRoles.apply(this, arguments);
      }
      return assignRoles;
    }(),
    startGame: function () {
      var _startGame = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(roomCode) {
        var settingsRef, playersRef, _yield$Promise$all3, _yield$Promise$all4, settingsSnap, playersSnap, settings, allPlayers, players, playerCount;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.n) {
            case 0:
              settingsRef = window.db.ref("rooms/".concat(roomCode, "/settings"));
              playersRef = window.db.ref("rooms/".concat(roomCode, "/players"));
              _context7.n = 1;
              return Promise.all([settingsRef.get(), playersRef.get()]);
            case 1:
              _yield$Promise$all3 = _context7.v;
              _yield$Promise$all4 = _slicedToArray(_yield$Promise$all3, 2);
              settingsSnap = _yield$Promise$all4[0];
              playersSnap = _yield$Promise$all4[1];
              settings = settingsSnap.val();
              allPlayers = playersSnap.val() || {};
              players = Object.fromEntries(Object.entries(allPlayers).filter(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2);
                  _ref4[0];
                  var p = _ref4[1];
                return p && p.name;
              }));
              if (!(Object.keys(players).length !== Object.keys(allPlayers).length)) {
                _context7.n = 2;
                break;
              }
              throw new Error("Tüm oyuncuların bir adı olmalıdır.");
            case 2:
              playerCount = Object.keys(players).length;
              if (!(playerCount < MIN_PLAYERS)) {
                _context7.n = 3;
                break;
              }
              throw new Error("Oyunu başlatmak için en az 3 oyuncu gerekli.");
            case 3:
              _context7.n = 4;
              return this.assignRoles(roomCode);
            case 4:
              _context7.n = 5;
              return window.db.ref("rooms/".concat(roomCode)).update({
                status: "started",
                round: 1,
                phase: "clue",
                votes: null,
                voteResult: null,
                votingStarted: false,
                voteRequests: null
              });
            case 5:
              _context7.n = 6;
              break;
            case 6:
              return _context7.a(2);
          }
        }, _callee7, this);
      }));
      function startGame(_x6) {
        return _startGame.apply(this, arguments);
      }
      return startGame;
    }(),
    restartGame: function () {
      var _restartGame = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(roomCode) {
        var roomRef, settingsRef, playersRef, _yield$Promise$all5, _yield$Promise$all6, settingsSnap, playersSnap, settings, players, playerCount;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.n) {
            case 0:
              roomRef = window.db.ref("rooms/".concat(roomCode));
              settingsRef = roomRef.child("settings");
              playersRef = roomRef.child("players");
              _context8.n = 1;
              return Promise.all([settingsRef.get(), playersRef.get()]);
            case 1:
              _yield$Promise$all5 = _context8.v;
              _yield$Promise$all6 = _slicedToArray(_yield$Promise$all5, 2);
              settingsSnap = _yield$Promise$all6[0];
              playersSnap = _yield$Promise$all6[1];
              settings = settingsSnap.val();
              players = playersSnap.val() || {};
              playerCount = Object.keys(players).length;
              if (!(playerCount < MIN_PLAYERS)) {
                _context8.n = 2;
                break;
              }
              throw new Error("Oyunu başlatmak için en az 3 oyuncu gerekli.");
            case 2:
              _context8.n = 3;
              return roomRef.update({
                status: "waiting",
                round: 0,
                votes: null,
                voteResult: null,
                votingStarted: false,
                voteRequests: null,
                spies: null,
                playerRoles: null,
                winner: null,
                spyParityWin: null,
                lastGuess: null
              });
            case 3:
              _context8.n = 4;
              break;
            case 4:
              _context8.n = 5;
              return this.startGame(roomCode);
            case 5:
              return _context8.a(2);
          }
        }, _callee8, this);
      }));
      function restartGame(_x7) {
        return _restartGame.apply(this, arguments);
      }
      return restartGame;
    }(),
    /** Odayı sil */
    deleteRoom: function deleteRoom(roomCode) {
      return window.db.ref("rooms/" + roomCode).remove();
    },
    /** Odadan çık */
    leaveRoom: function () {
      var _leaveRoom = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(roomCode) {
        var uid, playerRef;
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.n) {
            case 0:
              _context9.n = 1;
              return this.getUid();
            case 1:
              uid = _context9.v;
              if (uid) {
                _context9.n = 2;
                break;
              }
              return _context9.a(2, Promise.resolve());
            case 2:
              playerRef = window.db.ref("rooms/".concat(roomCode, "/players/").concat(uid));
              localStorage.clear();
              return _context9.a(2, playerRef.remove());
          }
        }, _callee9, this);
      }));
      function leaveRoom(_x8) {
        return _leaveRoom.apply(this, arguments);
      }
      return leaveRoom;
    }(),
    /** Oyuncuları canlı dinle */
    listenPlayers: function listenPlayers(roomCode, callback) {
      var playersRef = window.db.ref("rooms/".concat(roomCode, "/players"));
      playersRef.on("value", function (snapshot) {
        var playersObj = snapshot.val() || {};
        var playersArr = Object.entries(playersObj).map(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
            uid = _ref6[0],
            p = _ref6[1];
          return _objectSpread2({
            uid: uid
          }, p);
        });

        // Hem isim dizisini hem de ham oyuncu nesnesini geri çağrıya aktar
        var playerNames = playersArr.map(function (p) {
          return p.name;
        });
        callback(playerNames, playersObj);
        var uids = Object.keys(playersObj);

        // Oda tamamen boşaldıysa kapat
        if (uids.length === 0) {
          window.db.ref("rooms/" + roomCode).remove();
          localStorage.clear();
          location.reload();
        }

        // Kurucu ayrıldıysa ve oyun başlamadıysa odayı kapat
        var roomRef = window.db.ref("rooms/".concat(roomCode));
        roomRef.get().then(function (snap) {
          var _data$settings;
          var data = snap.val();
          var creatorUid = data === null || data === void 0 || (_data$settings = data.settings) === null || _data$settings === void 0 ? void 0 : _data$settings.creatorUid;
          if (data && data.status !== "started" && (!creatorUid || !uids.includes(creatorUid))) {
            roomRef.remove();
            localStorage.clear();
            location.reload();
          }
        });
      });
    },
    /** Oda ve oyun durumunu canlı dinle */
    listenRoom: function listenRoom(roomCode) {
      var _this = this;
      var roomRef = window.db.ref("rooms/" + roomCode);
      roomRef.on("value", /*#__PURE__*/function () {
        var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(snapshot) {
          var roomData, playersObj, players, playerListEl, uid, _document$getElementB, _document$getElementB2, _roomData$settings, myRole, isCategoryGame, roleEl, unknownText, label, locLabel;
          return _regenerator().w(function (_context9) {
            while (1) switch (_context9.n) {
              case 0:
                roomData = snapshot.val();
                if (roomData) {
                  _context9.n = 1;
                  break;
                }
                return _context9.a(2);
              case 1:
                // Oyuncu listesi güncelle
                playersObj = roomData.players || {};
                players = Object.values(playersObj).map(function (p) {
                  return p.name;
                });
                playerListEl = document.getElementById("playerList");
                if (playerListEl) {
                  playerListEl.innerHTML = players.map(function (p) {
                    return "<li>".concat(escapeHtml(p), "</li>");
                  }).join("");
                }

                // Oyun başladıysa rol göster
                if (!(roomData.status === "started")) {
                  _context9.n = 3;
                  break;
                }
                _context9.n = 2;
                return _this.getUid();
              case 2:
                uid = _context9.v;
                if (uid && roomData.playerRoles && roomData.playerRoles[uid]) {
                  myRole = roomData.playerRoles[uid];
                  (_document$getElementB = document.getElementById("roomInfo")) === null || _document$getElementB === void 0 || _document$getElementB.classList.add("hidden");
                  (_document$getElementB2 = document.getElementById("playerRoleInfo")) === null || _document$getElementB2 === void 0 || _document$getElementB2.classList.remove("hidden");
                  isCategoryGame = ((_roomData$settings = roomData.settings) === null || _roomData$settings === void 0 ? void 0 : _roomData$settings.gameType) === "category";
                  roleEl = document.getElementById("roleMessage");
                  if (myRole.isSpy) {
                    unknownText = isCategoryGame ? "Rolü bilmiyorsun." : "Konumu bilmiyorsun.";
                    label = isCategoryGame ? "Olası roller" : "Olası konumlar";
                    roleEl.textContent = "\uD83C\uDFAD Sen B\u0130R SAHTEKARSIN! ".concat(unknownText, " ").concat(label, ": ").concat(myRole.allLocations.join(", "));
                  } else {
                    locLabel = isCategoryGame ? "Kategori" : "Konum";
                    roleEl.textContent = "\u2705 ".concat(locLabel, ": ").concat(myRole.location, " | Rol\xFCn: ").concat(myRole.role);
                  }
                }
              case 3:
                return _context9.a(2);
            }
          }, _callee9);
        }));
        return function (_x8) {
          return _ref7.apply(this, arguments);
        };
      }());
    },
    // Oylamayı başlatma isteği kaydet
    startVote: function startVote(roomCode, uid) {
      var _this2 = this;
      var requestRef = window.db.ref("rooms/".concat(roomCode, "/voteRequests/").concat(uid));
      requestRef.set(true).then(function () {
        var roomRef = window.db.ref("rooms/".concat(roomCode));
        roomRef.get().then(function (snap) {
          if (!snap.exists()) return;
          var data = snap.val();
          var requests = data.voteRequests || {};
          var players = data.players || {};
          if (Object.keys(requests).length === Object.keys(players).length) {
            _this2.startVoting(roomCode);
          }
        });
      });
    },
    startVoting: function startVoting(roomCode) {
      var ref = window.db.ref("rooms/" + roomCode);
      ref.update({
        votingStarted: true,
        votes: null,
        voteResult: null,
        voteRequests: null
      });
    },
    guessLocation: function guessLocation(roomCode, spyUid, guess) {
      var ref = window.db.ref("rooms/" + roomCode);
      ref.get().then(function (snap) {
        var _data$settings2;
        if (!snap.exists()) return;
        var data = snap.val();
        var roles = data.playerRoles || {};
        var spyRole = roles[spyUid];
        if (!spyRole) return;
        var guessesLeft = spyRole.guessesLeft || 0;
        if (guessesLeft <= 0) return;
        var correctAnswer = null;
        var gameType = (_data$settings2 = data.settings) === null || _data$settings2 === void 0 ? void 0 : _data$settings2.gameType;
        for (var uid in roles) {
          var r = roles[uid];
          if (r && !r.isSpy) {
            correctAnswer = gameType === "category" ? r.role : r.location;
            break;
          }
        }
        if (!correctAnswer) return;
        var preserveVotingStarted = data.votingStarted;
        var preserveVotes = data.votes;
        if (guess === correctAnswer) {
          var winUpdate = {
            status: "finished",
            winner: "spy",
            lastGuess: {
              spy: spyUid,
              guess: guess,
              correct: true
            },
            votingStarted: false,
            votes: null,
            voteResult: null,
            voteRequests: null
          };
          ref.update(winUpdate);
          } else {
          guessesLeft -= 1;
          var updates = {};
          updates["playerRoles/".concat(spyUid, "/guessesLeft")] = guessesLeft;
          if (guessesLeft <= 0) {
            updates.status = "finished";
            updates.winner = "innocent";
            updates.votingStarted = false;
            updates.votes = null;
            updates.voteResult = null;
            updates.voteRequests = null;
            updates.lastGuess = {
              spy: spyUid,
              guess: guess,
              correct: false,
              guessesLeft: 0
            };
          } else {
            updates.lastGuess = {
              spy: spyUid,
              guess: guess,
              correct: false,
              guessesLeft: guessesLeft
            };
            if (typeof preserveVotingStarted !== "undefined") {
              updates.votingStarted = preserveVotingStarted;
            }
            if (typeof preserveVotes !== "undefined") {
              updates.votes = preserveVotes;
            }
          }
          ref.update(updates);
        }
      });
    },
    submitVote: function submitVote(roomCode, voter, target) {
      if (target === voter) {
        alert("Kendine oy veremezsin.");
        return;
      }
      var _this3 = this;
      var ref = window.db.ref("rooms/" + roomCode);
      ref.child("votes/".concat(voter)).set(target).then(function () {
        ref.get().then(function (snap) {
          if (!snap.exists()) return;
          var data = snap.val();
          if (voter !== (data.settings && data.settings.creatorUid)) return;
          var activePlayers = Object.keys(data.playerRoles || {});
          var votes = data.votes || {};
          var activeVoteCount = Object.keys(votes).filter(function (v) {
            return activePlayers.includes(v);
          }).length;
          if (activeVoteCount >= activePlayers.length && !data.voteResult) {
            _this3.tallyVotes(roomCode);
          }
        });
      });
    },
    tallyVotes: function tallyVotes(roomCode) {
      var ref = window.db.ref("rooms/" + roomCode);
      ref.get().then(function (snap) {
        if (!snap.exists()) return;
        var data = snap.val();
        var players = Object.keys(data.playerRoles || {});
        var votes = data.votes || {};
        var voteEntries = Object.entries(votes).filter(function (_ref8) {
          var _ref9 = _slicedToArray(_ref8, 1),
            voter = _ref9[0];
          return players.includes(voter);
        });
        if (voteEntries.length < players.length) return;
        var counts = {};
        voteEntries.forEach(function (_ref0) {
          var _ref1 = _slicedToArray(_ref0, 2),
            t = _ref1[1];
          counts[t] = (counts[t] || 0) + 1;
        });
        console.log("[tallyVotes] Vote counts:", counts);
        var max = Math.max.apply(Math, _toConsumableArray(Object.values(counts)));
        var top = Object.keys(counts).filter(function (p) {
          return counts[p] === max;
        });
        if (top.length !== 1) {
          ref.update({
            votes: null,
            votingStarted: false,
            voteResult: {
              tie: true
            }
          });
          return;
        }
        var voted = top[0];
        var votedRole = data.playerRoles && data.playerRoles[voted];
        var isSpy = votedRole ? votedRole.isSpy : false;
        // Ensure undefined fields are sent as null to avoid Firebase update errors
        var role = votedRole && votedRole.role !== void 0 ? votedRole.role : null;
        var location = votedRole && votedRole.location !== void 0 ? votedRole.location : null;
        console.log("[tallyVotes] Player ".concat(voted, " received ").concat(counts[voted], " votes. Eliminated: ").concat(!isSpy));
        var updates = {
          voteResult: {
            voted: voted,
            isSpy: isSpy,
            role: role,
            location: location
          },
          votingStarted: false
        };
          if (isSpy) {
            updates.status = "finished";
            updates.winner = "innocent";
          }
        ref.update(updates);
      });
    },
    endRound: function endRound(roomCode) {
      var _this4 = this;
      var ref = window.db.ref("rooms/" + roomCode);
      ref.get().then(function (snap) {
        if (!snap.exists()) return;
        var data = snap.val();
        var removals = [];
        if (data.voteResult && data.voteResult.voted && !data.voteResult.isSpy) {
          removals.push(ref.child("players/".concat(data.voteResult.voted)).remove());
          removals.push(ref.child("playerRoles/".concat(data.voteResult.voted)).remove());
        }
        Promise.all(removals).then(function () {
          _this4.checkSpyWin(roomCode).then(function (spyWon) {
            if (spyWon) {
              ref.update({
                status: "finished"
              });
              return;
            }
            ref.update({
              voteResult: null
            }).then(function () {
              _this4.nextRound(roomCode);
            });
          });
        });
      });
    },
    checkSpyWin: function checkSpyWin(roomCode) {
      var ref = window.db.ref("rooms/" + roomCode);
      return ref.get().then(function (snap) {
        if (!snap.exists()) return false;
        var data = snap.val();
        var players = Object.keys(data.players || {});
        var activeSpies = (data.spies || []).filter(function (s) {
          return players.includes(s);
        });
        var innocentCount = players.length - activeSpies.length;
        if (innocentCount <= 1) {
          ref.update({
            status: "finished",
            winner: "spy",
            spyParityWin: true
          });
          return true;
        }
        return false;
      });
    },
    nextRound: function nextRound(roomCode) {
      var ref = window.db.ref("rooms/" + roomCode);
      ref.get().then(function (snap) {
        if (!snap.exists()) return;
        var data = snap.val();
        var nextRound = (data.round || 1) + 1;
        ref.update({
          round: nextRound,
          votes: null,
          voteResult: null,
          votingStarted: false,
          voteRequests: null
        });
      });
    }
  };

  // Global fallback for compatibility
  gameLogic.POOLS = POOLS;
  window.gameLogic = gameLogic;

  console.log('main.js yüklendi');

  var MIN_PLAYERS = 3;
  var DEFAULT_PLAYER_COUNT = 20; // Eski güvenlik kurallarıyla uyum için oyuncu sayısını varsayılanla gönder
  var ROOM_PLAYER_LIMIT = 20;

  // Kullanıcının anonim şekilde doğrulandığından emin ol
  if (window.auth && !window.auth.currentUser) {
    window.auth.signInAnonymously().catch(function (err) {
      console.error("Anonim giriş hatası:", err);
    });
  }
  // Sayfa yenilendiğinde oyun bilgilerini koru, yeni oturumda sıfırla
  try {
    var nav = performance.getEntriesByType("navigation")[0];
    var isReload = nav ? nav.type === "reload" : performance.navigation.type === 1;
    if (!isReload) {
      localStorage.clear();
    }
  } catch (err) {
    console.warn("Gezinme performans kontrolü başarısız oldu:", err);
  }
  var currentRoomCode = localStorage.getItem("roomCode") || null;
  var currentPlayerName = localStorage.getItem("playerName") || null;
  var isCreator = localStorage.getItem("isCreator") === "true";
  var currentPlayers = [];
  var playerUidMap = {};
  var currentUid = null;
  if (window.auth && typeof window.auth.onAuthStateChanged === "function") {
    window.auth.onAuthStateChanged(/*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(user) {
      var roomRef;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            currentUid = user ? user.uid : null;
            if (user) {
              currentRoomCode = localStorage.getItem("roomCode") || null;
              currentPlayerName = localStorage.getItem("playerName") || null;
              isCreator = localStorage.getItem("isCreator") === "true";
              if (currentRoomCode && currentPlayerName) {
                roomRef = window.db.ref("rooms/" + currentRoomCode);
                roomRef.get().then(function (roomSnap) {
                  if (!roomSnap.exists()) {
                    localStorage.clear();
                    currentRoomCode = null;
                    currentPlayerName = null;
                    isCreator = false;
                    showSetupJoin();
                    return;
                  }
                  var uid = user.uid;
                  var playerRef = window.db.ref("rooms/".concat(currentRoomCode, "/players/").concat(uid));
                  if (typeof currentPlayerName === "string" && currentPlayerName.trim() !== "") {
                    playerRef.set({
                      name: currentPlayerName,
                      isCreator: isCreator
                    });
                  } else {
                    console.error("Geçersiz veya boş oyuncu adı, veritabanı güncellemesi atlandı.");
                  }
                  showRoomUI(currentRoomCode, currentPlayerName, isCreator);
                  listenPlayersAndRoom(currentRoomCode);
                  gameLogic.listenRoom(currentRoomCode);
                  window.db.ref("rooms/" + currentRoomCode).once("value", function (snapshot) {
                    var roomData = snapshot.val();
                    if (roomData && roomData.status === "started" && roomData.playerRoles && roomData.playerRoles[currentUid]) {
                      var _document$getElementB, _document$getElementB2, _roomData$settings;
                      (_document$getElementB = document.getElementById("leaveRoomBtn")) === null || _document$getElementB === void 0 || _document$getElementB.classList.add("hidden");
                      (_document$getElementB2 = document.getElementById("backToHomeBtn")) === null || _document$getElementB2 === void 0 || _document$getElementB2.classList.remove("hidden");
                      var myData = roomData.playerRoles[currentUid];
                      document.getElementById("roomInfo").classList.add("hidden");
                      document.getElementById("playerRoleInfo").classList.remove("hidden");
                      var roleMessageEl = document.getElementById("roleMessage");
                      var guessLabel = document.getElementById("guessLabel");
                      var isCategory = ((_roomData$settings = roomData.settings) === null || _roomData$settings === void 0 ? void 0 : _roomData$settings.gameType) === "category";
                      if (myData.role && myData.role.includes("Sahtekar")) {
                        var safeLocations = myData.allLocations.map(escapeHtml).join(", ");
                        roleMessageEl.innerHTML = "\uD83C\uDFAD Sen <b>SAHTEKAR</b>s\u0131n! ".concat(isCategory ? "Rolü" : "Konumu", " bilmiyorsun.<br>") + "".concat(isCategory ? "Olası roller" : "Olası konumlar", ": ").concat(safeLocations);
                        if (guessLabel) {
                          guessLabel.textContent = isCategory ? "Rolü tahmin et:" : "Konumu tahmin et:";
                        }
                      } else if (myData.role) {
                        var safeLocation = escapeHtml(myData.location);
                        var safeRole = escapeHtml(myData.role);
                        roleMessageEl.innerHTML = "\uD83D\uDCCD Konum: <b>".concat(safeLocation, "</b><br>") + "\uD83C\uDFAD Rol\xFCn: <b>".concat(safeRole, "</b>");
                      } else {
                        roleMessageEl.textContent = "Rol bilgisi bulunamadı.";
                      }
                    }
                  });
                });
              } else {
                showSetupJoin();
              }
            } else {
              showSetupJoin();
            }
          case 1:
            return _context.a(2);
        }
      }, _callee);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
  } else {
    console.warn("Firebase Auth yüklenmedi, temel arayüz başlatılıyor");
    showSetupJoin();
  }
  var lastVoteResult = null;
  var gameEnded = false;
  var lastGuessEvent = null;
  var lastVotingState = null;
  var parityHandled = false;
  var lastRoomStatus = null;
    function buildVotingOutcomeMessage(_ref0) {
      var eliminatedName = _ref0.eliminatedName,
        eliminatedIsImpostor = _ref0.eliminatedIsImpostor,
        alivePlayersCount = _ref0.alivePlayersCount,
        aliveImpostorsCount = _ref0.aliveImpostorsCount;
      var safeName = escapeHtml(eliminatedName || "");
      if (eliminatedIsImpostor) {
        return {
          message: "Oylama sonucunda Sahtekar ".concat(safeName, " elendi ve oyunu masumlar kazandı!"),
          gameEnded: true,
          impostorVictory: false
        };
      }
      if (alivePlayersCount > 2) {
        return {
          message: "Oylama sonucunda ".concat(safeName, " elendi. Elenen kişi masumdu — oyun devam ediyor."),
          gameEnded: false,
          impostorVictory: false
        };
      }
      if (alivePlayersCount === 2) {
        if (aliveImpostorsCount >= 1) {
          return {
            message: "Oylama sonucunda ".concat(safeName, " elendi. Elenen kişi masumdu — oyunu sahtekar(lar) kazandı!"),
            gameEnded: true,
            impostorVictory: true
          };
        }
        return {
          message: "Oylama sonucunda ".concat(safeName, " elendi. Elenen kişi masumdu — oyunu masumlar kazandı!"),
          gameEnded: true,
          impostorVictory: false
        };
      }
      return {
        message: "Oylama sonucunda ".concat(safeName, " elendi."),
        gameEnded: false,
        impostorVictory: false
      };
    }
    function renderVoteResultOverlay(roomData) {
      if (!roomData.voteResult || roomData.voteResult.tie) return false;
      var key = JSON.stringify(roomData.voteResult);
      if (key === lastVoteResult) return true;
      lastVoteResult = key;
      var votedUid = roomData.voteResult.voted;
      var votedName = ((playerUidMap[votedUid] ? playerUidMap[votedUid].name : void 0) || votedUid);
      var remaining = Object.keys(roomData.players || {}).filter(function (uid) {
        return uid !== votedUid;
      });
      var activeSpies = (roomData.spies || []).filter(function (id) {
        return remaining.includes(id);
      });
      var alivePlayersCount = remaining.length;
      var aliveImpostorsCount = activeSpies.length;
      showResultOverlay({
        eliminatedIsImpostor: roomData.voteResult.isSpy,
        eliminatedName: votedName,
        alivePlayersCount: alivePlayersCount,
        aliveImpostorsCount: aliveImpostorsCount,
        votedUid: votedUid
      });
      return true;
    }
    function showResultOverlay(_ref1) {
      var eliminatedIsImpostor = _ref1.eliminatedIsImpostor,
        eliminatedName = _ref1.eliminatedName,
        alivePlayersCount = _ref1.alivePlayersCount,
        aliveImpostorsCount = _ref1.aliveImpostorsCount,
        votedUid = _ref1.votedUid;
      var outcome = buildVotingOutcomeMessage({
        eliminatedName: eliminatedName,
        eliminatedIsImpostor: eliminatedIsImpostor,
        alivePlayersCount: alivePlayersCount,
        aliveImpostorsCount: aliveImpostorsCount
      });
      var overlay = document.getElementById("resultOverlay");
      if (!overlay) {
        console.error("resultOverlay element not found");
        return;
      }
      var isEliminatedPlayer = currentUid === votedUid;
      var cls = outcome.impostorVictory ? "impostor-animation" : "innocent-animation";
      var msgDiv = document.createElement("div");
      msgDiv.className = "result-message";
      overlay.innerHTML = "";
      msgDiv.textContent = outcome.message;
      var ga = document.getElementById("gameActions");
      if (outcome.gameEnded) {
        if (ga) ga.classList.add("hidden");
      } else {
        if (ga) ga.classList.remove("hidden");
      }
      overlay.appendChild(msgDiv);
      overlay.classList.remove("hidden", "impostor-animation", "innocent-animation");
      overlay.classList.add(cls);
      if (outcome.gameEnded) {
        var restartBtn = void 0;
        if (isCreator) {
          restartBtn = document.createElement("button");
          restartBtn.id = "restartBtn";
          restartBtn.classList.add("overlay-btn");
          restartBtn.textContent = "Yeniden oyna";
          overlay.appendChild(restartBtn);
        }
        var exitBtn = document.createElement("button");
        exitBtn.id = "exitBtn";
        exitBtn.classList.add("overlay-btn");
        exitBtn.textContent = "Odadan ayrıl";
        overlay.appendChild(exitBtn);
        var hideOverlay = function hideOverlay() {
          overlay.classList.add("hidden");
          overlay.classList.remove("impostor-animation", "innocent-animation");
        };
        if (restartBtn) {
          restartBtn.addEventListener("click", function () {
            hideOverlay();
            gameEnded = false;
            parityHandled = false;
            lastVoteResult = null;
            lastGuessEvent = null;
            restartBtn.disabled = true;
            gameLogic.restartGame(currentRoomCode);
          });
        }
        exitBtn.addEventListener("click", function () {
          hideOverlay();
          gameLogic.leaveRoom(currentRoomCode).finally(function () {
            showSetupJoin();
          });
        });
      } else if (!isEliminatedPlayer) {
        var btn = document.createElement("button");
        btn.id = "continueBtn";
        btn.classList.add("overlay-btn");
        btn.textContent = "Oyuna Devam Et";
        overlay.appendChild(btn);
        btn.addEventListener("click", function () {
          overlay.classList.add("hidden");
          overlay.classList.remove("impostor-animation", "innocent-animation");
          gameLogic.endRound(currentRoomCode);
        });
      }
    }
function showSpyWinOverlay(spyIds, guessed, guessWord) {
      var overlay = document.getElementById("resultOverlay");
      if (!overlay) {
        console.error("resultOverlay element not found");
        return;
      }
      var names = (spyIds || []).map(function (id) {
      var _playerUidMap$id;
      return (_playerUidMap$id = playerUidMap[id]) === null || _playerUidMap$id === void 0 ? void 0 : _playerUidMap$id.name;
    }).filter(function (n) {
      return n && currentPlayers.includes(n);
    }).join(", ");
      gameEnded = true;
      overlay.innerHTML = "";
    var msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
      var safeGuess = escapeHtml(guessed);
      var word = guessWord || "konumu";
      if (safeGuess) {
        var playerNames = names ? "(".concat(names, ") ") : "";
        msgDiv.textContent = "Sahtekar ".concat(playerNames).concat(word, " ").concat(safeGuess, " olarak do\\u011Fru tahmin etti ve oyunu kazand\\u0131");
      } else {
      msgDiv.append("Sahtekar");
      if (names) {
        msgDiv.appendChild(document.createElement("br"));
        var span = document.createElement("span");
        span.className = "impostor-name";
        span.textContent = names;
        msgDiv.appendChild(span);
      }
      msgDiv.append(" kazandı! Oyun Bitti...");
    }
    overlay.appendChild(msgDiv);
    var restartBtn = document.createElement("button");
    restartBtn.id = "restartBtn";
    restartBtn.classList.add("overlay-btn");
    restartBtn.textContent = "Yeniden oyna";
    var exitBtn = document.createElement("button");
    exitBtn.id = "exitBtn";
    exitBtn.classList.add("overlay-btn");
    exitBtn.textContent = "Odadan ayrıl";
    overlay.appendChild(restartBtn);
    overlay.appendChild(exitBtn);
    overlay.classList.remove("hidden", "impostor-animation", "innocent-animation");
    overlay.classList.add("impostor-animation");
    var hideOverlay2 = function hideOverlay2() {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
    };
    restartBtn.addEventListener("click", function () {
      hideOverlay2();
      gameEnded = false;
      parityHandled = false;
      lastVoteResult = null;
      lastGuessEvent = null;
      gameLogic.restartGame(currentRoomCode);
    });
    exitBtn.addEventListener("click", function () {
      hideOverlay2();
      gameLogic.leaveRoom(currentRoomCode).finally(function () {
        showSetupJoin();
      });
    });
  }

    function showSpyFailOverlay(spyIds, guessWord, guessValue) {
      var overlay = document.getElementById("resultOverlay");
      if (!overlay) {
        console.error("resultOverlay element not found");
        return;
      }
      var names = (spyIds || []).map(function (id) {
      var _playerUidMap$id;
      return (_playerUidMap$id = playerUidMap[id]) === null || _playerUidMap$id === void 0 ? void 0 : _playerUidMap$id.name;
    }).filter(function (n) {
      return n && currentPlayers.includes(n);
    }).join(", ");
      gameEnded = true;
      overlay.innerHTML = "";
    var msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
      var word = guessWord || "konumu";
      var nameText = names ? "".concat(names, " ") : "";
      var safeGuess = escapeHtml(guessValue || "");
      // İmpostor'un yanlış tahmini durumunda sadece "konumu" veya "rolü" bilgisini göster
      msgDiv.textContent = "Sahtekar ".concat(nameText).concat(word, " ").concat(safeGuess, " olarak yanl\\u0131\\u015F tahmin etti ve oyunu masumlar kazand\\u0131!");
    overlay.appendChild(msgDiv);
    var restartBtn = document.createElement("button");
    restartBtn.id = "restartBtn";
    restartBtn.classList.add("overlay-btn");
    restartBtn.textContent = "Yeniden oyna";
    var exitBtn = document.createElement("button");
    exitBtn.id = "exitBtn";
    exitBtn.classList.add("overlay-btn");
    exitBtn.textContent = "Odadan ayrıl";
    overlay.appendChild(restartBtn);
    overlay.appendChild(exitBtn);
    overlay.classList.remove("hidden", "impostor-animation", "innocent-animation");
    overlay.classList.add("innocent-animation");
    var hideOverlay3 = function hideOverlay3() {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
    };
    restartBtn.addEventListener("click", function () {
      hideOverlay3();
      gameEnded = false;
      parityHandled = false;
      lastVoteResult = null;
      lastGuessEvent = null;
      gameLogic.restartGame(currentRoomCode);
    });
    exitBtn.addEventListener("click", function () {
      hideOverlay3();
      gameLogic.leaveRoom(currentRoomCode).finally(function () {
        showSetupJoin();
      });
    });
  }
  /** ------------------------
   *  ODA OLUŞTUR
   * ------------------------ */
  function updatePlayerList(players) {
    var listEl = document.getElementById("playerList");
    var countEl = document.getElementById("playerCountDisplay");
    if (!listEl || !countEl) return;
    var validPlayers = (players || []).filter(function (p) {
      return p && p.trim() !== "";
    });
    listEl.innerHTML = validPlayers.map(function (p) {
      return "<li>".concat(escapeHtml(p), "</li>");
    }).join("");
    countEl.textContent = validPlayers.length;
    updateStartButtonState(validPlayers.length);
  }

  function updateStartButtonState(joinedPlayerCount) {
    var startGameBtn = document.getElementById("startGameBtn");
    var warningEl = document.getElementById("startGameWarning");
    if (!startGameBtn) return;
    var hasEnoughPlayers = joinedPlayerCount >= MIN_PLAYERS;
    startGameBtn.disabled = !hasEnoughPlayers;
    startGameBtn.title = hasEnoughPlayers ? "" : "Oyunu başlatmak için en az 3 oyuncu gerekli.";
    if (warningEl) {
      var shouldShowWarning = !hasEnoughPlayers && isCreator && !startGameBtn.classList.contains("hidden");
      warningEl.classList.toggle("hidden", hasEnoughPlayers || !shouldShowWarning);
    }
  }

  /** ------------------------
   *  ODA & OYUNCULARI DİNLE
   * ------------------------ */
  function listenPlayersAndRoom(roomCode) {
    // Oyuncu listesi
    gameLogic.listenPlayers(roomCode, function (playerNames, playersObj) {
      // İsim dizisini kullanarak UI'da oyuncu listesini ve oyuncu sayısını güncelle
      updatePlayerList(playerNames);

      // Ham oyuncu nesnesini eşleştirme ve açılır menüyü doldurma için kullan
      playerUidMap = playersObj || {};

      // Geçerli oyuncuların (isimler) filtrelenmiş bir dizisini tut
      currentPlayers = (playerNames || []).filter(function (p) {
        return p && p.trim() !== "";
      });
      var selectEl = document.getElementById("voteSelect");
      if (selectEl) {
        selectEl.innerHTML = Object.entries(playerUidMap).filter(function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 1),
            uid = _ref3[0];
          return uid !== currentUid;
        }).map(function (_ref4) {
          var _ref5 = _slicedToArray(_ref4, 2),
            uid = _ref5[0],
            p = _ref5[1];
          return "<option value=\"".concat(uid, "\">").concat(escapeHtml(p.name), "</option>");
        }).join("");
      }
    });

    // Oda silinirse herkesi at (oyun bitmediyse)
    window.db.ref("rooms/" + roomCode).on("value", function (snapshot) {
      if (!snapshot.exists() && !gameEnded) {
        localStorage.clear();
        location.reload();
      }
    });

    // Oyun başlama durumunu canlı dinle
    window.db.ref("rooms/" + roomCode).on("value", function (snapshot) {
        var resultEl = document.getElementById("voteResults");
        var outcomeEl = document.getElementById("voteOutcome");
        var roomData = snapshot.val();
        var prevStatus = lastRoomStatus;
        lastRoomStatus = roomData ? roomData.status : null;
        if (roomData && roomData.status === "started" && prevStatus !== "started") {
          var overlay = document.getElementById("resultOverlay");
          if (overlay) {
            overlay.classList.add("hidden");
            overlay.classList.remove("impostor-animation", "innocent-animation");
          }
          gameEnded = false;
          lastVoteResult = null;
          lastGuessEvent = null;
          parityHandled = false;
        }
        if (roomData && roomData.players) {
        playerUidMap = roomData.players;
        currentPlayers = Object.values(playerUidMap).map(function (p) {
          return p.name;
        }).filter(function (p) {
          return p && p.trim() !== "";
        });
        updatePlayerList(currentPlayers);
        var selectEl = document.getElementById("voteSelect");
        if (selectEl) {
          selectEl.innerHTML = Object.entries(playerUidMap).filter(function (_ref6) {
            var _ref7 = _slicedToArray(_ref6, 1),
              uid = _ref7[0];
            return uid !== currentUid;
          }).map(function (_ref8) {
            var _ref9 = _slicedToArray(_ref8, 2),
              uid = _ref9[0],
              p = _ref9[1];
            return "<option value=\"".concat(uid, "\">").concat(escapeHtml(p.name), "</option>");
          }).join("");
        }
      }
      var leaveBtn = document.getElementById("leaveRoomBtn");
      var exitBtn = document.getElementById("backToHomeBtn");
      if (roomData && (roomData.spyParityWin || roomData.status === "finished" && roomData.winner === "spy")) {
        var _roomData$settings2;
        var guessed = roomData.lastGuess && roomData.lastGuess.correct ? roomData.lastGuess.guess : null;
        var guessWord = ((_roomData$settings2 = roomData.settings) === null || _roomData$settings2 === void 0 ? void 0 : _roomData$settings2.gameType) === "category" ? "rolü" : "konumu";
        showSpyWinOverlay(roomData.spies, guessed, guessWord);
        window.db.ref("rooms/".concat(roomCode, "/spyParityWin")).remove();
        return;
      }
      if (roomData && roomData.status === "finished" && roomData.winner === "innocent") {
        var handledByVote = renderVoteResultOverlay(roomData);
        if (handledByVote) return;
        var _roomData$settings3;
          var guessWord = ((_roomData$settings3 = roomData.settings) === null || _roomData$settings3 === void 0 ? void 0 : _roomData$settings3.gameType) === "category" ? "rolü" : "konumu";
          showSpyFailOverlay(roomData.spies, guessWord, roomData.lastGuess && roomData.lastGuess.guess);
        return;
      }
        if (!roomData || roomData.status !== "started") {
          document.getElementById("gameActions").classList.add("hidden");
          leaveBtn === null || leaveBtn === void 0 || leaveBtn.classList.remove("hidden");
          exitBtn === null || exitBtn === void 0 || exitBtn.classList.remove("hidden");
          return;
        }
      leaveBtn === null || leaveBtn === void 0 || leaveBtn.classList.add("hidden");
      exitBtn === null || exitBtn === void 0 || exitBtn.classList.remove("hidden");
      if (roomData.playerRoles && roomData.playerRoles[currentUid]) {
        var _myData$guessesLeft;
        var myData = roomData.playerRoles[currentUid];
        var roleMessageEl = document.getElementById("roleMessage");
        document.getElementById("roomInfo").classList.add("hidden");
        document.getElementById("playerRoleInfo").classList.remove("hidden");
        document.getElementById("gameActions").classList.remove("hidden");
        var guessesLeft = (_myData$guessesLeft = myData.guessesLeft) !== null && _myData$guessesLeft !== void 0 ? _myData$guessesLeft : 0;
        var isSpy = myData.role.includes("Sahtekar");
        if (isSpy && guessesLeft > 0) {
          var _roomData$settings3;
          var safeLocations = myData.allLocations.map(escapeHtml).join(", ");
          var guessSection = document.getElementById("guessSection");
          var guessLabel = document.getElementById("guessLabel");
          guessSection.classList.remove("hidden");
          var guessSelect = document.getElementById("guessSelect");
          guessSelect.innerHTML = myData.allLocations.map(function (loc) {
            return "<option value=\"".concat(escapeHtml(loc), "\">").concat(escapeHtml(loc), "</option>");
          }).join("");
          if (((_roomData$settings3 = roomData.settings) === null || _roomData$settings3 === void 0 ? void 0 : _roomData$settings3.gameType) === "category") {
            roleMessageEl.innerHTML = "\uD83C\uDFAD Sen <b>SAHTEKAR</b>s\u0131n! Rol\xFC bilmiyorsun.<br>" + "Olas\u0131 roller: ".concat(safeLocations);
            if (guessLabel) guessLabel.textContent = "Rolü tahmin et:";
          } else {
            roleMessageEl.innerHTML = "\uD83C\uDFAD Sen <b>SAHTEKAR</b>s\u0131n! Konumu bilmiyorsun.<br>" + "Olas\u0131 konumlar: ".concat(safeLocations);
            if (guessLabel) guessLabel.textContent = "Konumu tahmin et:";
          }
        } else {
          var safeLocation = escapeHtml(myData.location);
          var safeRole = escapeHtml(myData.role);
          roleMessageEl.innerHTML = "\uD83D\uDCCD Konum: <b>".concat(safeLocation, "</b><br>") + "\uD83C\uDFAD Rol\xFCn: <b>".concat(safeRole, "</b>");
          document.getElementById("guessSection").classList.add("hidden");
        }
        var votingInstructionEl = document.getElementById("votingInstruction");
        if (votingInstructionEl) {
          votingInstructionEl.textContent = "Her tur tek kelimelik ipucu verin. Hazır olduğunuzda oylamayı başlatabilirsiniz.";
        }

        // Oylama durumu
        var isVotingPhase = roomData.phase === "voting" || roomData.votingStarted === true;
        var votingStateKey = JSON.stringify({
          votingStarted: roomData.votingStarted,
          votes: roomData.votes
        });
        if (votingStateKey !== lastVotingState) {
          var votingSection = document.getElementById("votingSection");
          var hasVoted = roomData.votes && roomData.votes[currentUid];
          if (votingSection) {
            votingSection.classList.toggle("hidden", !(roomData.votingStarted && !hasVoted));
          }
          var submitVoteBtn = document.getElementById("submitVoteBtn");
          if (submitVoteBtn) submitVoteBtn.disabled = !!hasVoted;
          var votePendingMsg = document.getElementById("votePendingMsg");
          if (votePendingMsg) {
            votePendingMsg.classList.toggle("hidden", !(hasVoted && !roomData.voteResult));
          }
          lastVotingState = votingStateKey;
        }
        var startBtn = document.getElementById("startVotingBtn");
        var waitingEl = document.getElementById("waitingVoteStart");
        var voteRequests = roomData.voteRequests || {};
        var playersCount = Object.keys(roomData.players || {}).length;
        var requestCount = Object.keys(voteRequests).length;
        var hasRequested = !!voteRequests[currentUid];
        var isWaiting = !roomData.votingStarted && hasRequested && requestCount < playersCount;
        if (startBtn) {
          startBtn.classList.toggle("hidden", isVotingPhase || isWaiting);
          startBtn.disabled = isWaiting;
        }
        if (waitingEl) {
          waitingEl.classList.toggle("hidden", !isWaiting);
          if (isWaiting) {
            waitingEl.textContent = "Oylamanın başlaması için diğer oyuncular bekleniyor...";
          }
        }
        if (votingInstructionEl) {
          if (!roomData.votingStarted && !hasRequested) {
            votingInstructionEl.classList.remove("hidden");
            votingInstructionEl.textContent = "Her tur tek kelimelik ipucu verin. Hazır olduğunuzda oylamayı başlatabilirsiniz.";
          } else {
            votingInstructionEl.classList.add("hidden");
          }
        }
        var liveVoteCounts = document.getElementById("liveVoteCounts");
        var voteCountList = document.getElementById("voteCountList");
        if (!roomData.votingStarted || roomData.voteResult) {
          liveVoteCounts === null || liveVoteCounts === void 0 || liveVoteCounts.classList.add("hidden");
          if (voteCountList) voteCountList.innerHTML = "";
        } else {
          liveVoteCounts === null || liveVoteCounts === void 0 || liveVoteCounts.classList.remove("hidden");
          var tally = {};
          Object.values(roomData.votes || {}).forEach(function (uid) {
            tally[uid] = (tally[uid] || 0) + 1;
          });
          var playerMap = roomData.players || playerUidMap;
          var ranked = Object.entries(playerMap).map(function (_ref0) {
            var _ref1 = _slicedToArray(_ref0, 2),
              uid = _ref1[0],
              p = _ref1[1];
            return {
              uid: uid,
              name: p.name,
              count: tally[uid] || 0
            };
          });
          ranked.sort(function (a, b) {
            return b.count - a.count;
          });
          if (voteCountList) {
            voteCountList.innerHTML = ranked.map(function (p, i) {
              return "<li>".concat(i + 1, ") ").concat(escapeHtml(p.name), " \u2013 ").concat(p.count, "</li>");
            }).join("");
          }
        }
        if (roomData.voteResult) {
          if (roomData.voteResult.tie) {
            resultEl.classList.remove("hidden");
            outcomeEl.textContent = "Oylar eşit! Oylama yeniden başlayacak.";
            document.getElementById("nextRoundBtn").classList.add("hidden");
          } else {
            renderVoteResultOverlay(roomData);
            resultEl.classList.add("hidden");
          }
        } else {
          resultEl.classList.add("hidden");
          lastVoteResult = null;
        }
        if (roomData.lastGuess) {
          var guessKey = JSON.stringify(roomData.lastGuess);
          if (guessKey !== lastGuessEvent) {
            var _roomData$settings4;
            lastGuessEvent = guessKey;
              var _guessWord = ((_roomData$settings4 = roomData.settings) === null || _roomData$settings4 === void 0 ? void 0 : _roomData$settings4.gameType) === "category" ? "rolü" : "konumu";
              var isSpyGuess = roomData.lastGuess.spy === currentUid;
              var msg = isSpyGuess ? "Yanl\u0131\u015f tahmin ettin! " + _guessWord + " " + roomData.lastGuess.guess + ". Kalan tahmin hakk\u0131: " + roomData.lastGuess.guessesLeft : "Sahtekar " + _guessWord + " " + roomData.lastGuess.guess + " tahmin etti ama yan\u0131ld\u0131. Kalan tahmin hakk\u0131: " + roomData.lastGuess.guessesLeft;
              alert(msg);
          }
        } else {
          lastGuessEvent = null;
        }
        if (isCreator && roomData.votingStarted && roomData.votes && Object.keys(roomData.votes).length === currentPlayers.length && !roomData.voteResult) {
          gameLogic.tallyVotes(currentRoomCode);
        }
      }
    });
  }

  /** ------------------------
   *  ODA UI GÖSTER
   * ------------------------ */
  function showRoomUI(roomCode, playerName, isCreator) {
    // UI güncelleme
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("playerJoin").classList.add("hidden");
    document.getElementById("roomInfo").classList.remove("hidden");
    document.getElementById("roomCode").textContent = roomCode;
    document.getElementById("roomTitle").textContent = isCreator ? "Oda başarıyla oluşturuldu!" : "Oyun odasına hoş geldiniz!";
    document.getElementById("roomInstructions").textContent = isCreator ? "Diğer oyuncular bu kodla giriş yapabilir." : "Oda kurucusunun oyunu başlatmasını bekleyin.";
    var startGameBtn = document.getElementById("startGameBtn");
    if (startGameBtn) {
      startGameBtn.classList.toggle("hidden", !isCreator);
    }
    document.getElementById("leaveRoomBtn").classList.remove("hidden");
  }
  function showSetupJoin() {
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("playerJoin").classList.remove("hidden");
    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("playerRoleInfo").classList.add("hidden");
    document.getElementById("gameActions").classList.add("hidden");
  }

  /** ------------------------
   *  EVENT LISTENERS
   * ------------------------ */
  function initUI() {
    var gameTypeSelect = document.getElementById("gameType");
    var categoryLabel = document.getElementById("categoryLabel");
    var categorySelect = document.getElementById("categoryName");
    if (categorySelect) {
      categorySelect.innerHTML = "";
      Object.keys(POOLS).filter(function (key) {
        return key !== "locations";
      }).forEach(function (key) {
        var opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key;
        categorySelect.appendChild(opt);
      });
    }
    gameTypeSelect.addEventListener("change", function () {
      var show = gameTypeSelect.value === "category";
      categoryLabel.classList.toggle("hidden", !show);
      categorySelect.classList.toggle("hidden", !show);
    });
    function prefillSettings() {
      return _prefillSettings.apply(this, arguments);
    }
    function _prefillSettings() {
      _prefillSettings = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
        var saved, spyCountEl, spyGuessCountEl, poolSizeEl, voteAnytimeEl, show, _t3;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.p = _context4.n) {
            case 0:
              if (gameLogic.loadSettings) {
                _context4.n = 1;
                break;
              }
              return _context4.a(2);
            case 1:
              _context4.p = 1;
              _context4.n = 2;
              return gameLogic.loadSettings();
            case 2:
              saved = _context4.v;
              if (saved) {
                _context4.n = 3;
                break;
              }
              return _context4.a(2);
            case 3:
              spyCountEl = document.getElementById("spyCount");
              spyGuessCountEl = document.getElementById("spyGuessCount");
              poolSizeEl = document.getElementById("poolSize");
              voteAnytimeEl = document.getElementById("voteAnytime");
              if (saved.spyCount) spyCountEl.value = saved.spyCount;
              if (saved.spyGuessLimit) spyGuessCountEl.value = saved.spyGuessLimit;
              if (saved.poolSize) poolSizeEl.value = saved.poolSize;
              if (typeof saved.voteAnytime !== "undefined") voteAnytimeEl.checked = saved.voteAnytime;
              if (saved.gameType) {
                gameTypeSelect.value = saved.gameType;
                show = saved.gameType === "category";
                categoryLabel.classList.toggle("hidden", !show);
                categorySelect.classList.toggle("hidden", !show);
                if (show && saved.categoryName) {
                  categorySelect.value = saved.categoryName;
                }
              }
              _context4.n = 5;
              break;
            case 4:
              _context4.p = 4;
              _t3 = _context4.v;
              console.warn("Ayarlar yüklenemedi:", _t3);
            case 5:
              return _context4.a(2);
          }
        }, _callee4, null, [[1, 4]]);
      }));
      return _prefillSettings.apply(this, arguments);
    }
    prefillSettings();
    var createRoomBtn = document.getElementById("createRoomBtn");
    var createRoomLoading = document.getElementById("createRoomLoading");
    var saveSettingsBtn = document.getElementById("saveSettingsBtn");
    var joinRoomBtn = document.getElementById("joinRoomBtn");
    saveSettingsBtn.addEventListener("click", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var settings, _t;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            _context2.n = 1;
            return buildSettings();
          case 1:
            settings = _context2.v;
            _context2.p = 2;
            _context2.n = 3;
            return gameLogic.saveSettings(settings);
          case 3:
            alert("Ayarlar kaydedildi!");
            _context2.n = 5;
            break;
          case 4:
            _context2.p = 4;
            _t = _context2.v;
            alert(_t.message || _t);
          case 5:
            return _context2.a(2);
        }
      }, _callee2, null, [[2, 4]]);
    })));
    var createRoomRunning = false;
    function handleCreateRoom() {
      return _handleCreateRoom.apply(this, arguments);
    }
    function _handleCreateRoom() {
      _handleCreateRoom = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
        var creatorName, settings, roomCode, _t4;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.p = _context5.n) {
            case 0:
              if (!createRoomRunning) {
                _context5.n = 1;
                break;
              }
              return _context5.a(2);
            case 1:
              createRoomRunning = true;
              creatorName = document.getElementById("creatorName").value.trim();
              if (!hasInvalidChars(creatorName)) {
                _context5.n = 2;
                break;
              }
              alert("İsminizde geçersiz karakter (. # $ [ ] /) kullanılamaz.");
              createRoomRunning = false;
              return _context5.a(2);
            case 2:
              // Buton tepkisiz görünmesin diye yükleme başlamadan önce kapat
              createRoomBtn.disabled = true;
              createRoomLoading.classList.remove("hidden");
              _context5.p = 3;
              _context5.n = 4;
              return buildSettings();
            case 4:
              settings = _context5.v;
              if (!(!creatorName || isNaN(settings.spyCount) || isNaN(settings.spyGuessLimit))) {
                _context5.n = 5;
                break;
              }
              alert("Lütfen tüm alanları doldurun.");
              return _context5.a(2);
            case 5:
              _context5.n = 6;
              return gameLogic.createRoom(_objectSpread2({
                creatorName: creatorName
              }, settings));
            case 6:
              roomCode = _context5.v;
              if (roomCode) {
                _context5.n = 7;
                break;
              }
              return _context5.a(2);
            case 7:
              currentRoomCode = roomCode;
              currentPlayerName = creatorName;
              isCreator = true;

              // LocalStorage güncelle
              localStorage.setItem("roomCode", currentRoomCode);
              localStorage.setItem("playerName", currentPlayerName);
              localStorage.setItem("isCreator", "true");
              showRoomUI(roomCode, creatorName, true);
              listenPlayersAndRoom(roomCode);
              gameLogic.listenRoom(roomCode);
              _context5.n = 9;
              break;
            case 8:
              _context5.p = 8;
              _t4 = _context5.v;
              alert(_t4.message || _t4);
            case 9:
              _context5.p = 9;
              createRoomRunning = false;
              createRoomBtn.disabled = false;
              createRoomLoading.classList.add("hidden");
              return _context5.f(9);
            case 10:
              return _context5.a(2);
          }
        }, _callee5, null, [[3, 8, 9, 10]]);
      }));
      return _handleCreateRoom.apply(this, arguments);
    }
    createRoomBtn.addEventListener("click", handleCreateRoom);
    createRoomBtn.addEventListener("pointerdown", handleCreateRoom);
    var joinRoomRunning = false;
    function handleJoinRoom() {
      return _handleJoinRoom.apply(this, arguments);
    }
    function _handleJoinRoom() {
      _handleJoinRoom = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
        var joinName, joinCode, _t5;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.p = _context6.n) {
            case 0:
              if (!joinRoomRunning) {
                _context6.n = 1;
                break;
              }
              return _context6.a(2);
            case 1:
              joinRoomRunning = true;
              joinName = document.getElementById("joinName").value.trim();
              joinCode = document.getElementById("joinCode").value.trim().toUpperCase();
              if (!hasInvalidChars(joinName)) {
                _context6.n = 2;
                break;
              }
              alert("İsminizde geçersiz karakter (. # $ [ ] /) kullanılamaz.");
              joinRoomRunning = false;
              return _context6.a(2);
            case 2:
              if (!(!joinName || !joinCode)) {
                _context6.n = 3;
                break;
              }
              alert("Lütfen adınızı ve oda kodunu girin.");
              joinRoomRunning = false;
              return _context6.a(2);
            case 3:
              _context6.p = 3;
              _context6.n = 4;
              return gameLogic.joinRoom(joinName, joinCode);
            case 4:
              _context6.v;
              currentRoomCode = joinCode;
              currentPlayerName = joinName;
              isCreator = false;
              localStorage.setItem("roomCode", currentRoomCode);
              localStorage.setItem("playerName", currentPlayerName);
              localStorage.setItem("isCreator", "false");
              showRoomUI(joinCode, joinName, false);
              listenPlayersAndRoom(joinCode);
              gameLogic.listenRoom(joinCode);
              _context6.n = 6;
              break;
            case 5:
              _context6.p = 5;
              _t5 = _context6.v;
              alert(_t5.message);
              return _context6.a(2);
            case 6:
              _context6.p = 6;
              joinRoomRunning = false;
              return _context6.f(6);
            case 7:
              return _context6.a(2);
          }
        }, _callee6, null, [[3, 5, 6, 7]]);
      }));
      return _handleJoinRoom.apply(this, arguments);
    }
    joinRoomBtn.addEventListener("click", handleJoinRoom);
    joinRoomBtn.addEventListener("pointerdown", handleJoinRoom);
    document.getElementById("leaveRoomBtn").addEventListener("click", function () {
      var action = isCreator ? gameLogic.deleteRoom(currentRoomCode) : gameLogic.leaveRoom(currentRoomCode);
      Promise.resolve(action).then(function () {
        localStorage.clear();
        location.reload();
      });
    });
    document.getElementById("startGameBtn").addEventListener("click", /*#__PURE__*/function () {
      var _ref11 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(e) {
        var btn, joinedPlayerCount, _t2;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              if (currentRoomCode) {
                _context3.n = 1;
                break;
              }
              alert("Oda kodu bulunamadı!");
              return _context3.a(2);
            case 1:
              joinedPlayerCount = currentPlayers.length;
              if (!(joinedPlayerCount < MIN_PLAYERS)) {
                _context3.n = 2;
                break;
              }
              updateStartButtonState(joinedPlayerCount);
              alert("Oyunu başlatmak için en az 3 oyuncu gerekli.");
              return _context3.a(2);
            case 2:
              btn = e.currentTarget;
              btn.disabled = true;
              _context3.p = 3;
              _context3.n = 4;
              return gameLogic.startGame(currentRoomCode);
            case 4:
              _context3.n = 6;
              break;
            case 5:
              _context3.p = 5;
              _t2 = _context3.v;
              alert("Oyunu başlatırken bir hata oluştu: " + (_t2.message || _t2));
            case 6:
              _context3.p = 6;
              btn.disabled = false;
              return _context3.f(6);
            case 7:
              return _context3.a(2);
          }
        }, _callee3, null, [[2, 4, 5, 6]]);
      }));
      return function (_x2) {
        return _ref11.apply(this, arguments);
      };
    }());
    document.getElementById("startVotingBtn").addEventListener("click", function () {
      gameLogic.startVote(currentRoomCode, currentUid);
    });

    // Oy ver
    document.getElementById("submitVoteBtn").addEventListener("click", function () {
      var target = document.getElementById("voteSelect").value;
      if (target) {
        var btn = document.getElementById("submitVoteBtn");
        if (btn) btn.disabled = true;
        var msg = document.getElementById("votePendingMsg");
        if (msg) msg.classList.remove("hidden");
        gameLogic.submitVote(currentRoomCode, currentUid, target);
      }
    });
    document.getElementById("submitGuessBtn").addEventListener("click", function () {
      var guess = document.getElementById("guessSelect").value;
      if (guess) {
        gameLogic.guessLocation(currentRoomCode, currentUid, guess);
      }
    });

    // Sonraki tur
    document.getElementById("nextRoundBtn").addEventListener("click", function () {
      gameLogic.nextRound(currentRoomCode);
    });

    // Rol bilgisini kopyalama
    document.getElementById("copyRoleBtn").addEventListener("click", function () {
      var text = document.getElementById("roleMessage").innerText;
      navigator.clipboard.writeText(text).then(function () {
        return alert("Rolünüz kopyalandı!");
      });
    });

    // Oyundan çık (ana ekrana dön)
    document.getElementById("backToHomeBtn").addEventListener("click", function () {
      var roomCode = localStorage.getItem("roomCode");
      var playerName = localStorage.getItem("playerName");
      var isCreator = localStorage.getItem("isCreator") === "true";
      if (roomCode) {
        var action = isCreator ? gameLogic.deleteRoom(roomCode) : playerName ? gameLogic.leaveRoom(roomCode) : Promise.resolve();
        Promise.resolve(action).then(function () {
          localStorage.clear();
          location.reload();
        });
      } else {
        localStorage.clear();
        location.reload();
      }
    });
  }
  document.addEventListener("DOMContentLoaded", initUI);
  function buildSettings() {
    return _buildSettings.apply(this, arguments);
  }
  function _buildSettings() {
    _buildSettings = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
      var playerCount, spyCount, spyGuessCount, gameType, categoryName, c, poolSize, voteAnytime, creatorUid;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.n) {
          case 0:
            playerCount = DEFAULT_PLAYER_COUNT;
            spyCount = parseInt(document.getElementById("spyCount").value);
            spyGuessCount = parseInt(document.getElementById("spyGuessCount").value);
            gameType = document.getElementById("gameType").value;
            categoryName = null;
            if (gameType === "category") {
              c = document.getElementById("categoryName").value.trim();
              if (c) categoryName = c;
            }
            poolSize = parseInt(document.getElementById("poolSize").value);
            voteAnytime = document.getElementById("voteAnytime").checked;
            _context7.n = 1;
            return gameLogic.getUid();
          case 1:
            creatorUid = _context7.v;
            return _context7.a(2, {
              playerCount: playerCount,
              spyCount: spyCount,
              gameType: gameType,
              categoryName: categoryName,
              poolSize: poolSize,
              voteAnytime: voteAnytime,
              spyGuessLimit: spyGuessCount,
              clueMode: "tek-kelime",
              creatorUid: creatorUid
            });
        }
      }, _callee7);
    }));
    return _buildSettings.apply(this, arguments);
  }

})();

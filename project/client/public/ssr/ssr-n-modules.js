"use strict";
const React = require("react");
const require$$1 = require("@remix-run/router");
const require$$2 = require("react-router");
const ReactDOM = require("react-dom");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const React__namespace = /* @__PURE__ */ _interopNamespaceDefault(React);
const ReactDOM__namespace = /* @__PURE__ */ _interopNamespaceDefault(ReactDOM);
function getAugmentedNamespace(n) {
  if (Object.prototype.hasOwnProperty.call(n, "__esModule")) return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var server = {};
/**
 * React Router DOM v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
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
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
const defaultMethod = "get";
const defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return object != null && typeof object.tagName === "string";
}
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
function createSearchParams(init) {
  if (init === void 0) {
    init = "";
  }
  return new URLSearchParams(typeof init === "string" || Array.isArray(init) || init instanceof URLSearchParams ? init : Object.keys(init).reduce((memo, key) => {
    let value = init[key];
    return memo.concat(Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]);
  }, []));
}
function getSearchParamsForLocation(locationSearch, defaultSearchParams) {
  let searchParams = createSearchParams(locationSearch);
  if (defaultSearchParams) {
    defaultSearchParams.forEach((_, key) => {
      if (!searchParams.has(key)) {
        defaultSearchParams.getAll(key).forEach((value) => {
          searchParams.append(key, value);
        });
      }
    });
  }
  return searchParams;
}
let _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
  if (_formDataSupportsSubmitter === null) {
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      );
      _formDataSupportsSubmitter = false;
    } catch (e) {
      _formDataSupportsSubmitter = true;
    }
  }
  return _formDataSupportsSubmitter;
}
const supportedFormEncTypes = /* @__PURE__ */ new Set(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]);
function getFormEncType(encType) {
  if (encType != null && !supportedFormEncTypes.has(encType)) {
    process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_warning(false, '"' + encType + '" is not a valid `encType` for `<Form>`/`<fetcher.Form>` ' + ('and will default to "' + defaultEncType + '"')) : void 0;
    return null;
  }
  return encType;
}
function getFormSubmissionInfo(target, basename) {
  let method;
  let action;
  let encType;
  let formData;
  let body;
  if (isFormElement(target)) {
    let attr = target.getAttribute("action");
    action = attr ? require$$1.stripBasename(attr, basename) : null;
    method = target.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(target);
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;
    if (form == null) {
      throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');
    }
    let attr = target.getAttribute("formaction") || form.getAttribute("action");
    action = attr ? require$$1.stripBasename(attr, basename) : null;
    method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(form, target);
    if (!isFormDataSubmitterSupported()) {
      let {
        name,
        type,
        value
      } = target;
      if (type === "image") {
        let prefix = name ? name + "." : "";
        formData.append(prefix + "x", "0");
        formData.append(prefix + "y", "0");
      } else if (name) {
        formData.append(name, value);
      }
    }
  } else if (isHtmlElement(target)) {
    throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');
  } else {
    method = defaultMethod;
    action = null;
    encType = defaultEncType;
    body = target;
  }
  if (formData && encType === "text/plain") {
    body = formData;
    formData = void 0;
  }
  return {
    action,
    method: method.toLowerCase(),
    encType,
    formData,
    body
  };
}
const _excluded = ["onClick", "relative", "reloadDocument", "replace", "state", "target", "to", "preventScrollReset", "viewTransition"], _excluded2 = ["aria-current", "caseSensitive", "className", "end", "style", "to", "viewTransition", "children"], _excluded3 = ["fetcherKey", "navigate", "reloadDocument", "replace", "state", "method", "action", "onSubmit", "relative", "preventScrollReset", "viewTransition"];
const REACT_ROUTER_VERSION = "6";
try {
  window.__reactRouterVersion = REACT_ROUTER_VERSION;
} catch (e) {
}
function createBrowserRouter(routes, opts) {
  return require$$1.createRouter({
    basename: opts == null ? void 0 : opts.basename,
    future: _extends({}, opts == null ? void 0 : opts.future, {
      v7_prependBasename: true
    }),
    history: require$$1.createBrowserHistory({
      window: opts == null ? void 0 : opts.window
    }),
    hydrationData: (opts == null ? void 0 : opts.hydrationData) || parseHydrationData(),
    routes,
    mapRouteProperties: require$$2.UNSAFE_mapRouteProperties,
    dataStrategy: opts == null ? void 0 : opts.dataStrategy,
    patchRoutesOnNavigation: opts == null ? void 0 : opts.patchRoutesOnNavigation,
    window: opts == null ? void 0 : opts.window
  }).initialize();
}
function createHashRouter(routes, opts) {
  return require$$1.createRouter({
    basename: opts == null ? void 0 : opts.basename,
    future: _extends({}, opts == null ? void 0 : opts.future, {
      v7_prependBasename: true
    }),
    history: require$$1.createHashHistory({
      window: opts == null ? void 0 : opts.window
    }),
    hydrationData: (opts == null ? void 0 : opts.hydrationData) || parseHydrationData(),
    routes,
    mapRouteProperties: require$$2.UNSAFE_mapRouteProperties,
    dataStrategy: opts == null ? void 0 : opts.dataStrategy,
    patchRoutesOnNavigation: opts == null ? void 0 : opts.patchRoutesOnNavigation,
    window: opts == null ? void 0 : opts.window
  }).initialize();
}
function parseHydrationData() {
  var _window;
  let state = (_window = window) == null ? void 0 : _window.__staticRouterHydrationData;
  if (state && state.errors) {
    state = _extends({}, state, {
      errors: deserializeErrors(state.errors)
    });
  }
  return state;
}
function deserializeErrors(errors) {
  if (!errors) return null;
  let entries = Object.entries(errors);
  let serialized = {};
  for (let [key, val] of entries) {
    if (val && val.__type === "RouteErrorResponse") {
      serialized[key] = new require$$1.UNSAFE_ErrorResponseImpl(val.status, val.statusText, val.data, val.internal === true);
    } else if (val && val.__type === "Error") {
      if (val.__subType) {
        let ErrorConstructor = window[val.__subType];
        if (typeof ErrorConstructor === "function") {
          try {
            let error = new ErrorConstructor(val.message);
            error.stack = "";
            serialized[key] = error;
          } catch (e) {
          }
        }
      }
      if (serialized[key] == null) {
        let error = new Error(val.message);
        error.stack = "";
        serialized[key] = error;
      }
    } else {
      serialized[key] = val;
    }
  }
  return serialized;
}
const ViewTransitionContext = /* @__PURE__ */ React__namespace.createContext({
  isTransitioning: false
});
if (process.env.NODE_ENV !== "production") {
  ViewTransitionContext.displayName = "ViewTransition";
}
const FetchersContext = /* @__PURE__ */ React__namespace.createContext(/* @__PURE__ */ new Map());
if (process.env.NODE_ENV !== "production") {
  FetchersContext.displayName = "Fetchers";
}
const START_TRANSITION = "startTransition";
const startTransitionImpl = React__namespace[START_TRANSITION];
const FLUSH_SYNC = "flushSync";
const flushSyncImpl = ReactDOM__namespace[FLUSH_SYNC];
const USE_ID = "useId";
const useIdImpl = React__namespace[USE_ID];
function startTransitionSafe(cb) {
  if (startTransitionImpl) {
    startTransitionImpl(cb);
  } else {
    cb();
  }
}
function flushSyncSafe(cb) {
  if (flushSyncImpl) {
    flushSyncImpl(cb);
  } else {
    cb();
  }
}
class Deferred {
  constructor() {
    this.status = "pending";
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (value) => {
        if (this.status === "pending") {
          this.status = "resolved";
          resolve(value);
        }
      };
      this.reject = (reason) => {
        if (this.status === "pending") {
          this.status = "rejected";
          reject(reason);
        }
      };
    });
  }
}
function RouterProvider(_ref) {
  let {
    fallbackElement,
    router,
    future
  } = _ref;
  let [state, setStateImpl] = React__namespace.useState(router.state);
  let [pendingState, setPendingState] = React__namespace.useState();
  let [vtContext, setVtContext] = React__namespace.useState({
    isTransitioning: false
  });
  let [renderDfd, setRenderDfd] = React__namespace.useState();
  let [transition, setTransition] = React__namespace.useState();
  let [interruption, setInterruption] = React__namespace.useState();
  let fetcherData = React__namespace.useRef(/* @__PURE__ */ new Map());
  let {
    v7_startTransition
  } = future || {};
  let optInStartTransition = React__namespace.useCallback((cb) => {
    if (v7_startTransition) {
      startTransitionSafe(cb);
    } else {
      cb();
    }
  }, [v7_startTransition]);
  let setState = React__namespace.useCallback((newState, _ref2) => {
    let {
      deletedFetchers,
      flushSync,
      viewTransitionOpts
    } = _ref2;
    newState.fetchers.forEach((fetcher, key) => {
      if (fetcher.data !== void 0) {
        fetcherData.current.set(key, fetcher.data);
      }
    });
    deletedFetchers.forEach((key) => fetcherData.current.delete(key));
    let isViewTransitionUnavailable = router.window == null || router.window.document == null || typeof router.window.document.startViewTransition !== "function";
    if (!viewTransitionOpts || isViewTransitionUnavailable) {
      if (flushSync) {
        flushSyncSafe(() => setStateImpl(newState));
      } else {
        optInStartTransition(() => setStateImpl(newState));
      }
      return;
    }
    if (flushSync) {
      flushSyncSafe(() => {
        if (transition) {
          renderDfd && renderDfd.resolve();
          transition.skipTransition();
        }
        setVtContext({
          isTransitioning: true,
          flushSync: true,
          currentLocation: viewTransitionOpts.currentLocation,
          nextLocation: viewTransitionOpts.nextLocation
        });
      });
      let t = router.window.document.startViewTransition(() => {
        flushSyncSafe(() => setStateImpl(newState));
      });
      t.finished.finally(() => {
        flushSyncSafe(() => {
          setRenderDfd(void 0);
          setTransition(void 0);
          setPendingState(void 0);
          setVtContext({
            isTransitioning: false
          });
        });
      });
      flushSyncSafe(() => setTransition(t));
      return;
    }
    if (transition) {
      renderDfd && renderDfd.resolve();
      transition.skipTransition();
      setInterruption({
        state: newState,
        currentLocation: viewTransitionOpts.currentLocation,
        nextLocation: viewTransitionOpts.nextLocation
      });
    } else {
      setPendingState(newState);
      setVtContext({
        isTransitioning: true,
        flushSync: false,
        currentLocation: viewTransitionOpts.currentLocation,
        nextLocation: viewTransitionOpts.nextLocation
      });
    }
  }, [router.window, transition, renderDfd, fetcherData, optInStartTransition]);
  React__namespace.useLayoutEffect(() => router.subscribe(setState), [router, setState]);
  React__namespace.useEffect(() => {
    if (vtContext.isTransitioning && !vtContext.flushSync) {
      setRenderDfd(new Deferred());
    }
  }, [vtContext]);
  React__namespace.useEffect(() => {
    if (renderDfd && pendingState && router.window) {
      let newState = pendingState;
      let renderPromise = renderDfd.promise;
      let transition2 = router.window.document.startViewTransition(async () => {
        optInStartTransition(() => setStateImpl(newState));
        await renderPromise;
      });
      transition2.finished.finally(() => {
        setRenderDfd(void 0);
        setTransition(void 0);
        setPendingState(void 0);
        setVtContext({
          isTransitioning: false
        });
      });
      setTransition(transition2);
    }
  }, [optInStartTransition, pendingState, renderDfd, router.window]);
  React__namespace.useEffect(() => {
    if (renderDfd && pendingState && state.location.key === pendingState.location.key) {
      renderDfd.resolve();
    }
  }, [renderDfd, transition, state.location, pendingState]);
  React__namespace.useEffect(() => {
    if (!vtContext.isTransitioning && interruption) {
      setPendingState(interruption.state);
      setVtContext({
        isTransitioning: true,
        flushSync: false,
        currentLocation: interruption.currentLocation,
        nextLocation: interruption.nextLocation
      });
      setInterruption(void 0);
    }
  }, [vtContext.isTransitioning, interruption]);
  React__namespace.useEffect(() => {
    process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_warning(fallbackElement == null || !router.future.v7_partialHydration, "`<RouterProvider fallbackElement>` is deprecated when using `v7_partialHydration`, use a `HydrateFallback` component instead") : void 0;
  }, []);
  let navigator = React__namespace.useMemo(() => {
    return {
      createHref: router.createHref,
      encodeLocation: router.encodeLocation,
      go: (n) => router.navigate(n),
      push: (to, state2, opts) => router.navigate(to, {
        state: state2,
        preventScrollReset: opts == null ? void 0 : opts.preventScrollReset
      }),
      replace: (to, state2, opts) => router.navigate(to, {
        replace: true,
        state: state2,
        preventScrollReset: opts == null ? void 0 : opts.preventScrollReset
      })
    };
  }, [router]);
  let basename = router.basename || "/";
  let dataRouterContext = React__namespace.useMemo(() => ({
    router,
    navigator,
    static: false,
    basename
  }), [router, navigator, basename]);
  let routerFuture = React__namespace.useMemo(() => ({
    v7_relativeSplatPath: router.future.v7_relativeSplatPath
  }), [router.future.v7_relativeSplatPath]);
  React__namespace.useEffect(() => require$$2.UNSAFE_logV6DeprecationWarnings(future, router.future), [future, router.future]);
  return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(require$$2.UNSAFE_DataRouterContext.Provider, {
    value: dataRouterContext
  }, /* @__PURE__ */ React__namespace.createElement(require$$2.UNSAFE_DataRouterStateContext.Provider, {
    value: state
  }, /* @__PURE__ */ React__namespace.createElement(FetchersContext.Provider, {
    value: fetcherData.current
  }, /* @__PURE__ */ React__namespace.createElement(ViewTransitionContext.Provider, {
    value: vtContext
  }, /* @__PURE__ */ React__namespace.createElement(require$$2.Router, {
    basename,
    location: state.location,
    navigationType: state.historyAction,
    navigator,
    future: routerFuture
  }, state.initialized || router.future.v7_partialHydration ? /* @__PURE__ */ React__namespace.createElement(MemoizedDataRoutes, {
    routes: router.routes,
    future: router.future,
    state
  }) : fallbackElement))))), null);
}
const MemoizedDataRoutes = /* @__PURE__ */ React__namespace.memo(DataRoutes);
function DataRoutes(_ref3) {
  let {
    routes,
    future,
    state
  } = _ref3;
  return require$$2.UNSAFE_useRoutesImpl(routes, void 0, state, future);
}
function BrowserRouter(_ref4) {
  let {
    basename,
    children,
    future,
    window: window2
  } = _ref4;
  let historyRef = React__namespace.useRef();
  if (historyRef.current == null) {
    historyRef.current = require$$1.createBrowserHistory({
      window: window2,
      v5Compat: true
    });
  }
  let history = historyRef.current;
  let [state, setStateImpl] = React__namespace.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = React__namespace.useCallback((newState) => {
    v7_startTransition && startTransitionImpl ? startTransitionImpl(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  React__namespace.useLayoutEffect(() => history.listen(setState), [history, setState]);
  React__namespace.useEffect(() => require$$2.UNSAFE_logV6DeprecationWarnings(future), [future]);
  return /* @__PURE__ */ React__namespace.createElement(require$$2.Router, {
    basename,
    children,
    location: state.location,
    navigationType: state.action,
    navigator: history,
    future
  });
}
function HashRouter(_ref5) {
  let {
    basename,
    children,
    future,
    window: window2
  } = _ref5;
  let historyRef = React__namespace.useRef();
  if (historyRef.current == null) {
    historyRef.current = require$$1.createHashHistory({
      window: window2,
      v5Compat: true
    });
  }
  let history = historyRef.current;
  let [state, setStateImpl] = React__namespace.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = React__namespace.useCallback((newState) => {
    v7_startTransition && startTransitionImpl ? startTransitionImpl(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  React__namespace.useLayoutEffect(() => history.listen(setState), [history, setState]);
  React__namespace.useEffect(() => require$$2.UNSAFE_logV6DeprecationWarnings(future), [future]);
  return /* @__PURE__ */ React__namespace.createElement(require$$2.Router, {
    basename,
    children,
    location: state.location,
    navigationType: state.action,
    navigator: history,
    future
  });
}
function HistoryRouter(_ref6) {
  let {
    basename,
    children,
    future,
    history
  } = _ref6;
  let [state, setStateImpl] = React__namespace.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = React__namespace.useCallback((newState) => {
    v7_startTransition && startTransitionImpl ? startTransitionImpl(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  React__namespace.useLayoutEffect(() => history.listen(setState), [history, setState]);
  React__namespace.useEffect(() => require$$2.UNSAFE_logV6DeprecationWarnings(future), [future]);
  return /* @__PURE__ */ React__namespace.createElement(require$$2.Router, {
    basename,
    children,
    location: state.location,
    navigationType: state.action,
    navigator: history,
    future
  });
}
if (process.env.NODE_ENV !== "production") {
  HistoryRouter.displayName = "unstable_HistoryRouter";
}
const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const Link = /* @__PURE__ */ React__namespace.forwardRef(function LinkWithRef(_ref7, ref) {
  let {
    onClick,
    relative,
    reloadDocument,
    replace,
    state,
    target,
    to,
    preventScrollReset,
    viewTransition
  } = _ref7, rest = _objectWithoutPropertiesLoose(_ref7, _excluded);
  let {
    basename
  } = React__namespace.useContext(require$$2.UNSAFE_NavigationContext);
  let absoluteHref;
  let isExternal = false;
  if (typeof to === "string" && ABSOLUTE_URL_REGEX.test(to)) {
    absoluteHref = to;
    if (isBrowser) {
      try {
        let currentUrl = new URL(window.location.href);
        let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
        let path = require$$1.stripBasename(targetUrl.pathname, basename);
        if (targetUrl.origin === currentUrl.origin && path != null) {
          to = path + targetUrl.search + targetUrl.hash;
        } else {
          isExternal = true;
        }
      } catch (e) {
        process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_warning(false, '<Link to="' + to + '"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.') : void 0;
      }
    }
  }
  let href = require$$2.useHref(to, {
    relative
  });
  let internalOnClick = useLinkClickHandler(to, {
    replace,
    state,
    target,
    preventScrollReset,
    relative,
    viewTransition
  });
  function handleClick(event) {
    if (onClick) onClick(event);
    if (!event.defaultPrevented) {
      internalOnClick(event);
    }
  }
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    /* @__PURE__ */ React__namespace.createElement("a", _extends({}, rest, {
      href: absoluteHref || href,
      onClick: isExternal || reloadDocument ? onClick : handleClick,
      ref,
      target
    }))
  );
});
if (process.env.NODE_ENV !== "production") {
  Link.displayName = "Link";
}
const NavLink = /* @__PURE__ */ React__namespace.forwardRef(function NavLinkWithRef(_ref8, ref) {
  let {
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    viewTransition,
    children
  } = _ref8, rest = _objectWithoutPropertiesLoose(_ref8, _excluded2);
  let path = require$$2.useResolvedPath(to, {
    relative: rest.relative
  });
  let location = require$$2.useLocation();
  let routerState = React__namespace.useContext(require$$2.UNSAFE_DataRouterStateContext);
  let {
    navigator,
    basename
  } = React__namespace.useContext(require$$2.UNSAFE_NavigationContext);
  let isTransitioning = routerState != null && // Conditional usage is OK here because the usage of a data router is static
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useViewTransitionState(path) && viewTransition === true;
  let toPathname = navigator.encodeLocation ? navigator.encodeLocation(path).pathname : path.pathname;
  let locationPathname = location.pathname;
  let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
  if (!caseSensitive) {
    locationPathname = locationPathname.toLowerCase();
    nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
    toPathname = toPathname.toLowerCase();
  }
  if (nextLocationPathname && basename) {
    nextLocationPathname = require$$1.stripBasename(nextLocationPathname, basename) || nextLocationPathname;
  }
  const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
  let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
  let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
  let renderProps = {
    isActive,
    isPending,
    isTransitioning
  };
  let ariaCurrent = isActive ? ariaCurrentProp : void 0;
  let className;
  if (typeof classNameProp === "function") {
    className = classNameProp(renderProps);
  } else {
    className = [classNameProp, isActive ? "active" : null, isPending ? "pending" : null, isTransitioning ? "transitioning" : null].filter(Boolean).join(" ");
  }
  let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
  return /* @__PURE__ */ React__namespace.createElement(Link, _extends({}, rest, {
    "aria-current": ariaCurrent,
    className,
    ref,
    style,
    to,
    viewTransition
  }), typeof children === "function" ? children(renderProps) : children);
});
if (process.env.NODE_ENV !== "production") {
  NavLink.displayName = "NavLink";
}
const Form = /* @__PURE__ */ React__namespace.forwardRef((_ref9, forwardedRef) => {
  let {
    fetcherKey,
    navigate,
    reloadDocument,
    replace,
    state,
    method = defaultMethod,
    action,
    onSubmit,
    relative,
    preventScrollReset,
    viewTransition
  } = _ref9, props = _objectWithoutPropertiesLoose(_ref9, _excluded3);
  let submit = useSubmit();
  let formAction = useFormAction(action, {
    relative
  });
  let formMethod = method.toLowerCase() === "get" ? "get" : "post";
  let submitHandler = (event) => {
    onSubmit && onSubmit(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    let submitter = event.nativeEvent.submitter;
    let submitMethod = (submitter == null ? void 0 : submitter.getAttribute("formmethod")) || method;
    submit(submitter || event.currentTarget, {
      fetcherKey,
      method: submitMethod,
      navigate,
      replace,
      state,
      relative,
      preventScrollReset,
      viewTransition
    });
  };
  return /* @__PURE__ */ React__namespace.createElement("form", _extends({
    ref: forwardedRef,
    method: formMethod,
    action: formAction,
    onSubmit: reloadDocument ? onSubmit : submitHandler
  }, props));
});
if (process.env.NODE_ENV !== "production") {
  Form.displayName = "Form";
}
function ScrollRestoration(_ref10) {
  let {
    getKey,
    storageKey
  } = _ref10;
  useScrollRestoration({
    getKey,
    storageKey
  });
  return null;
}
if (process.env.NODE_ENV !== "production") {
  ScrollRestoration.displayName = "ScrollRestoration";
}
var DataRouterHook;
(function(DataRouterHook2) {
  DataRouterHook2["UseScrollRestoration"] = "useScrollRestoration";
  DataRouterHook2["UseSubmit"] = "useSubmit";
  DataRouterHook2["UseSubmitFetcher"] = "useSubmitFetcher";
  DataRouterHook2["UseFetcher"] = "useFetcher";
  DataRouterHook2["useViewTransitionState"] = "useViewTransitionState";
})(DataRouterHook || (DataRouterHook = {}));
var DataRouterStateHook;
(function(DataRouterStateHook2) {
  DataRouterStateHook2["UseFetcher"] = "useFetcher";
  DataRouterStateHook2["UseFetchers"] = "useFetchers";
  DataRouterStateHook2["UseScrollRestoration"] = "useScrollRestoration";
})(DataRouterStateHook || (DataRouterStateHook = {}));
function getDataRouterConsoleError(hookName) {
  return hookName + " must be used within a data router.  See https://reactrouter.com/v6/routers/picking-a-router.";
}
function useDataRouterContext(hookName) {
  let ctx = React__namespace.useContext(require$$2.UNSAFE_DataRouterContext);
  !ctx ? process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_invariant(false, getDataRouterConsoleError(hookName)) : require$$1.UNSAFE_invariant(false) : void 0;
  return ctx;
}
function useDataRouterState(hookName) {
  let state = React__namespace.useContext(require$$2.UNSAFE_DataRouterStateContext);
  !state ? process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_invariant(false, getDataRouterConsoleError(hookName)) : require$$1.UNSAFE_invariant(false) : void 0;
  return state;
}
function useLinkClickHandler(to, _temp) {
  let {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative,
    viewTransition
  } = _temp === void 0 ? {} : _temp;
  let navigate = require$$2.useNavigate();
  let location = require$$2.useLocation();
  let path = require$$2.useResolvedPath(to, {
    relative
  });
  return React__namespace.useCallback((event) => {
    if (shouldProcessLinkClick(event, target)) {
      event.preventDefault();
      let replace = replaceProp !== void 0 ? replaceProp : require$$2.createPath(location) === require$$2.createPath(path);
      navigate(to, {
        replace,
        state,
        preventScrollReset,
        relative,
        viewTransition
      });
    }
  }, [location, navigate, path, replaceProp, state, target, to, preventScrollReset, relative, viewTransition]);
}
function useSearchParams(defaultInit) {
  process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_warning(typeof URLSearchParams !== "undefined", "You cannot use the `useSearchParams` hook in a browser that does not support the URLSearchParams API. If you need to support Internet Explorer 11, we recommend you load a polyfill such as https://github.com/ungap/url-search-params.") : void 0;
  let defaultSearchParamsRef = React__namespace.useRef(createSearchParams(defaultInit));
  let hasSetSearchParamsRef = React__namespace.useRef(false);
  let location = require$$2.useLocation();
  let searchParams = React__namespace.useMemo(() => (
    // Only merge in the defaults if we haven't yet called setSearchParams.
    // Once we call that we want those to take precedence, otherwise you can't
    // remove a param with setSearchParams({}) if it has an initial value
    getSearchParamsForLocation(location.search, hasSetSearchParamsRef.current ? null : defaultSearchParamsRef.current)
  ), [location.search]);
  let navigate = require$$2.useNavigate();
  let setSearchParams = React__namespace.useCallback((nextInit, navigateOptions) => {
    const newSearchParams = createSearchParams(typeof nextInit === "function" ? nextInit(searchParams) : nextInit);
    hasSetSearchParamsRef.current = true;
    navigate("?" + newSearchParams, navigateOptions);
  }, [navigate, searchParams]);
  return [searchParams, setSearchParams];
}
function validateClientSideSubmission() {
  if (typeof document === "undefined") {
    throw new Error("You are calling submit during the server render. Try calling submit within a `useEffect` or callback instead.");
  }
}
let fetcherId = 0;
let getUniqueFetcherId = () => "__" + String(++fetcherId) + "__";
function useSubmit() {
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseSubmit);
  let {
    basename
  } = React__namespace.useContext(require$$2.UNSAFE_NavigationContext);
  let currentRouteId = require$$2.UNSAFE_useRouteId();
  return React__namespace.useCallback(function(target, options) {
    if (options === void 0) {
      options = {};
    }
    validateClientSideSubmission();
    let {
      action,
      method,
      encType,
      formData,
      body
    } = getFormSubmissionInfo(target, basename);
    if (options.navigate === false) {
      let key = options.fetcherKey || getUniqueFetcherId();
      router.fetch(key, currentRouteId, options.action || action, {
        preventScrollReset: options.preventScrollReset,
        formData,
        body,
        formMethod: options.method || method,
        formEncType: options.encType || encType,
        flushSync: options.flushSync
      });
    } else {
      router.navigate(options.action || action, {
        preventScrollReset: options.preventScrollReset,
        formData,
        body,
        formMethod: options.method || method,
        formEncType: options.encType || encType,
        replace: options.replace,
        state: options.state,
        fromRouteId: currentRouteId,
        flushSync: options.flushSync,
        viewTransition: options.viewTransition
      });
    }
  }, [router, basename, currentRouteId]);
}
function useFormAction(action, _temp2) {
  let {
    relative
  } = _temp2 === void 0 ? {} : _temp2;
  let {
    basename
  } = React__namespace.useContext(require$$2.UNSAFE_NavigationContext);
  let routeContext = React__namespace.useContext(require$$2.UNSAFE_RouteContext);
  !routeContext ? process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_invariant(false, "useFormAction must be used inside a RouteContext") : require$$1.UNSAFE_invariant(false) : void 0;
  let [match] = routeContext.matches.slice(-1);
  let path = _extends({}, require$$2.useResolvedPath(action ? action : ".", {
    relative
  }));
  let location = require$$2.useLocation();
  if (action == null) {
    path.search = location.search;
    let params = new URLSearchParams(path.search);
    let indexValues = params.getAll("index");
    let hasNakedIndexParam = indexValues.some((v) => v === "");
    if (hasNakedIndexParam) {
      params.delete("index");
      indexValues.filter((v) => v).forEach((v) => params.append("index", v));
      let qs = params.toString();
      path.search = qs ? "?" + qs : "";
    }
  }
  if ((!action || action === ".") && match.route.index) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : require$$1.joinPaths([basename, path.pathname]);
  }
  return require$$2.createPath(path);
}
function useFetcher(_temp3) {
  var _route$matches;
  let {
    key
  } = _temp3 === void 0 ? {} : _temp3;
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseFetcher);
  let state = useDataRouterState(DataRouterStateHook.UseFetcher);
  let fetcherData = React__namespace.useContext(FetchersContext);
  let route = React__namespace.useContext(require$$2.UNSAFE_RouteContext);
  let routeId = (_route$matches = route.matches[route.matches.length - 1]) == null ? void 0 : _route$matches.route.id;
  !fetcherData ? process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_invariant(false, "useFetcher must be used inside a FetchersContext") : require$$1.UNSAFE_invariant(false) : void 0;
  !route ? process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_invariant(false, "useFetcher must be used inside a RouteContext") : require$$1.UNSAFE_invariant(false) : void 0;
  !(routeId != null) ? process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_invariant(false, 'useFetcher can only be used on routes that contain a unique "id"') : require$$1.UNSAFE_invariant(false) : void 0;
  let defaultKey = useIdImpl ? useIdImpl() : "";
  let [fetcherKey, setFetcherKey] = React__namespace.useState(key || defaultKey);
  if (key && key !== fetcherKey) {
    setFetcherKey(key);
  } else if (!fetcherKey) {
    setFetcherKey(getUniqueFetcherId());
  }
  React__namespace.useEffect(() => {
    router.getFetcher(fetcherKey);
    return () => {
      router.deleteFetcher(fetcherKey);
    };
  }, [router, fetcherKey]);
  let load = React__namespace.useCallback((href, opts) => {
    !routeId ? process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_invariant(false, "No routeId available for fetcher.load()") : require$$1.UNSAFE_invariant(false) : void 0;
    router.fetch(fetcherKey, routeId, href, opts);
  }, [fetcherKey, routeId, router]);
  let submitImpl = useSubmit();
  let submit = React__namespace.useCallback((target, opts) => {
    submitImpl(target, _extends({}, opts, {
      navigate: false,
      fetcherKey
    }));
  }, [fetcherKey, submitImpl]);
  let FetcherForm = React__namespace.useMemo(() => {
    let FetcherForm2 = /* @__PURE__ */ React__namespace.forwardRef((props, ref) => {
      return /* @__PURE__ */ React__namespace.createElement(Form, _extends({}, props, {
        navigate: false,
        fetcherKey,
        ref
      }));
    });
    if (process.env.NODE_ENV !== "production") {
      FetcherForm2.displayName = "fetcher.Form";
    }
    return FetcherForm2;
  }, [fetcherKey]);
  let fetcher = state.fetchers.get(fetcherKey) || require$$1.IDLE_FETCHER;
  let data = fetcherData.get(fetcherKey);
  let fetcherWithComponents = React__namespace.useMemo(() => _extends({
    Form: FetcherForm,
    submit,
    load
  }, fetcher, {
    data
  }), [FetcherForm, submit, load, fetcher, data]);
  return fetcherWithComponents;
}
function useFetchers() {
  let state = useDataRouterState(DataRouterStateHook.UseFetchers);
  return Array.from(state.fetchers.entries()).map((_ref11) => {
    let [key, fetcher] = _ref11;
    return _extends({}, fetcher, {
      key
    });
  });
}
const SCROLL_RESTORATION_STORAGE_KEY = "react-router-scroll-positions";
let savedScrollPositions = {};
function useScrollRestoration(_temp4) {
  let {
    getKey,
    storageKey
  } = _temp4 === void 0 ? {} : _temp4;
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseScrollRestoration);
  let {
    restoreScrollPosition,
    preventScrollReset
  } = useDataRouterState(DataRouterStateHook.UseScrollRestoration);
  let {
    basename
  } = React__namespace.useContext(require$$2.UNSAFE_NavigationContext);
  let location = require$$2.useLocation();
  let matches = require$$2.useMatches();
  let navigation = require$$2.useNavigation();
  React__namespace.useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);
  usePageHide(React__namespace.useCallback(() => {
    if (navigation.state === "idle") {
      let key = (getKey ? getKey(location, matches) : null) || location.key;
      savedScrollPositions[key] = window.scrollY;
    }
    try {
      sessionStorage.setItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY, JSON.stringify(savedScrollPositions));
    } catch (error) {
      process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_warning(false, "Failed to save scroll positions in sessionStorage, <ScrollRestoration /> will not work properly (" + error + ").") : void 0;
    }
    window.history.scrollRestoration = "auto";
  }, [storageKey, getKey, navigation.state, location, matches]));
  if (typeof document !== "undefined") {
    React__namespace.useLayoutEffect(() => {
      try {
        let sessionPositions = sessionStorage.getItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY);
        if (sessionPositions) {
          savedScrollPositions = JSON.parse(sessionPositions);
        }
      } catch (e) {
      }
    }, [storageKey]);
    React__namespace.useLayoutEffect(() => {
      let getKeyWithoutBasename = getKey && basename !== "/" ? (location2, matches2) => getKey(
        // Strip the basename to match useLocation()
        _extends({}, location2, {
          pathname: require$$1.stripBasename(location2.pathname, basename) || location2.pathname
        }),
        matches2
      ) : getKey;
      let disableScrollRestoration = router == null ? void 0 : router.enableScrollRestoration(savedScrollPositions, () => window.scrollY, getKeyWithoutBasename);
      return () => disableScrollRestoration && disableScrollRestoration();
    }, [router, basename, getKey]);
    React__namespace.useLayoutEffect(() => {
      if (restoreScrollPosition === false) {
        return;
      }
      if (typeof restoreScrollPosition === "number") {
        window.scrollTo(0, restoreScrollPosition);
        return;
      }
      if (location.hash) {
        let el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (el) {
          el.scrollIntoView();
          return;
        }
      }
      if (preventScrollReset === true) {
        return;
      }
      window.scrollTo(0, 0);
    }, [location, restoreScrollPosition, preventScrollReset]);
  }
}
function useBeforeUnload(callback, options) {
  let {
    capture
  } = options || {};
  React__namespace.useEffect(() => {
    let opts = capture != null ? {
      capture
    } : void 0;
    window.addEventListener("beforeunload", callback, opts);
    return () => {
      window.removeEventListener("beforeunload", callback, opts);
    };
  }, [callback, capture]);
}
function usePageHide(callback, options) {
  let {
    capture
  } = {};
  React__namespace.useEffect(() => {
    let opts = capture != null ? {
      capture
    } : void 0;
    window.addEventListener("pagehide", callback, opts);
    return () => {
      window.removeEventListener("pagehide", callback, opts);
    };
  }, [callback, capture]);
}
function usePrompt(_ref12) {
  let {
    when,
    message
  } = _ref12;
  let blocker = require$$2.useBlocker(when);
  React__namespace.useEffect(() => {
    if (blocker.state === "blocked") {
      let proceed = window.confirm(message);
      if (proceed) {
        setTimeout(blocker.proceed, 0);
      } else {
        blocker.reset();
      }
    }
  }, [blocker, message]);
  React__namespace.useEffect(() => {
    if (blocker.state === "blocked" && !when) {
      blocker.reset();
    }
  }, [blocker, when]);
}
function useViewTransitionState(to, opts) {
  if (opts === void 0) {
    opts = {};
  }
  let vtContext = React__namespace.useContext(ViewTransitionContext);
  !(vtContext != null) ? process.env.NODE_ENV !== "production" ? require$$1.UNSAFE_invariant(false, "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?") : require$$1.UNSAFE_invariant(false) : void 0;
  let {
    basename
  } = useDataRouterContext(DataRouterHook.useViewTransitionState);
  let path = require$$2.useResolvedPath(to, {
    relative: opts.relative
  });
  if (!vtContext.isTransitioning) {
    return false;
  }
  let currentPath = require$$1.stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
  let nextPath = require$$1.stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
  return require$$1.matchPath(path.pathname, nextPath) != null || require$$1.matchPath(path.pathname, currentPath) != null;
}
const dist = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AbortedDeferredError: require$$2.AbortedDeferredError,
  Await: require$$2.Await,
  BrowserRouter,
  Form,
  HashRouter,
  Link,
  MemoryRouter: require$$2.MemoryRouter,
  NavLink,
  Navigate: require$$2.Navigate,
  NavigationType: require$$2.NavigationType,
  Outlet: require$$2.Outlet,
  Route: require$$2.Route,
  Router: require$$2.Router,
  RouterProvider,
  Routes: require$$2.Routes,
  ScrollRestoration,
  UNSAFE_DataRouterContext: require$$2.UNSAFE_DataRouterContext,
  UNSAFE_DataRouterStateContext: require$$2.UNSAFE_DataRouterStateContext,
  UNSAFE_ErrorResponseImpl: require$$1.UNSAFE_ErrorResponseImpl,
  UNSAFE_FetchersContext: FetchersContext,
  UNSAFE_LocationContext: require$$2.UNSAFE_LocationContext,
  UNSAFE_NavigationContext: require$$2.UNSAFE_NavigationContext,
  UNSAFE_RouteContext: require$$2.UNSAFE_RouteContext,
  UNSAFE_ViewTransitionContext: ViewTransitionContext,
  UNSAFE_useRouteId: require$$2.UNSAFE_useRouteId,
  UNSAFE_useScrollRestoration: useScrollRestoration,
  createBrowserRouter,
  createHashRouter,
  createMemoryRouter: require$$2.createMemoryRouter,
  createPath: require$$2.createPath,
  createRoutesFromChildren: require$$2.createRoutesFromChildren,
  createRoutesFromElements: require$$2.createRoutesFromElements,
  createSearchParams,
  defer: require$$2.defer,
  generatePath: require$$2.generatePath,
  isRouteErrorResponse: require$$2.isRouteErrorResponse,
  json: require$$2.json,
  matchPath: require$$2.matchPath,
  matchRoutes: require$$2.matchRoutes,
  parsePath: require$$2.parsePath,
  redirect: require$$2.redirect,
  redirectDocument: require$$2.redirectDocument,
  renderMatches: require$$2.renderMatches,
  replace: require$$2.replace,
  resolvePath: require$$2.resolvePath,
  unstable_HistoryRouter: HistoryRouter,
  unstable_usePrompt: usePrompt,
  useActionData: require$$2.useActionData,
  useAsyncError: require$$2.useAsyncError,
  useAsyncValue: require$$2.useAsyncValue,
  useBeforeUnload,
  useBlocker: require$$2.useBlocker,
  useFetcher,
  useFetchers,
  useFormAction,
  useHref: require$$2.useHref,
  useInRouterContext: require$$2.useInRouterContext,
  useLinkClickHandler,
  useLoaderData: require$$2.useLoaderData,
  useLocation: require$$2.useLocation,
  useMatch: require$$2.useMatch,
  useMatches: require$$2.useMatches,
  useNavigate: require$$2.useNavigate,
  useNavigation: require$$2.useNavigation,
  useNavigationType: require$$2.useNavigationType,
  useOutlet: require$$2.useOutlet,
  useOutletContext: require$$2.useOutletContext,
  useParams: require$$2.useParams,
  useResolvedPath: require$$2.useResolvedPath,
  useRevalidator: require$$2.useRevalidator,
  useRouteError: require$$2.useRouteError,
  useRouteLoaderData: require$$2.useRouteLoaderData,
  useRoutes: require$$2.useRoutes,
  useSearchParams,
  useSubmit,
  useViewTransitionState
}, Symbol.toStringTag, { value: "Module" }));
const require$$3 = /* @__PURE__ */ getAugmentedNamespace(dist);
var hasRequiredServer;
function requireServer() {
  if (hasRequiredServer) return server;
  hasRequiredServer = 1;
  Object.defineProperty(server, "__esModule", { value: true });
  var React$1 = React;
  var router = require$$1;
  var reactRouter = require$$2;
  var reactRouterDom = require$$3;
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = /* @__PURE__ */ Object.create(null);
    if (e) {
      Object.keys(e).forEach(function(k) {
        if (k !== "default") {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function() {
              return e[k];
            }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }
  var React__namespace2 = /* @__PURE__ */ _interopNamespace(React$1);
  function StaticRouter({
    basename,
    children,
    location: locationProp = "/",
    future
  }) {
    if (typeof locationProp === "string") {
      locationProp = reactRouterDom.parsePath(locationProp);
    }
    let action = router.Action.Pop;
    let location = {
      pathname: locationProp.pathname || "/",
      search: locationProp.search || "",
      hash: locationProp.hash || "",
      state: locationProp.state != null ? locationProp.state : null,
      key: locationProp.key || "default"
    };
    let staticNavigator = getStatelessNavigator();
    return /* @__PURE__ */ React__namespace2.createElement(reactRouterDom.Router, {
      basename,
      children,
      location,
      navigationType: action,
      navigator: staticNavigator,
      future,
      static: true
    });
  }
  function StaticRouterProvider({
    context,
    router: router$1,
    hydrate = true,
    nonce
  }) {
    !(router$1 && context) ? process.env.NODE_ENV !== "production" ? router.UNSAFE_invariant(false, "You must provide `router` and `context` to <StaticRouterProvider>") : router.UNSAFE_invariant(false) : void 0;
    let dataRouterContext = {
      router: router$1,
      navigator: getStatelessNavigator(),
      static: true,
      staticContext: context,
      basename: context.basename || "/"
    };
    let fetchersContext = /* @__PURE__ */ new Map();
    let hydrateScript = "";
    if (hydrate !== false) {
      let data = {
        loaderData: context.loaderData,
        actionData: context.actionData,
        errors: serializeErrors(context.errors)
      };
      let json = htmlEscape(JSON.stringify(JSON.stringify(data)));
      hydrateScript = `window.__staticRouterHydrationData = JSON.parse(${json});`;
    }
    let {
      state
    } = dataRouterContext.router;
    return /* @__PURE__ */ React__namespace2.createElement(React__namespace2.Fragment, null, /* @__PURE__ */ React__namespace2.createElement(reactRouterDom.UNSAFE_DataRouterContext.Provider, {
      value: dataRouterContext
    }, /* @__PURE__ */ React__namespace2.createElement(reactRouterDom.UNSAFE_DataRouterStateContext.Provider, {
      value: state
    }, /* @__PURE__ */ React__namespace2.createElement(reactRouterDom.UNSAFE_FetchersContext.Provider, {
      value: fetchersContext
    }, /* @__PURE__ */ React__namespace2.createElement(reactRouterDom.UNSAFE_ViewTransitionContext.Provider, {
      value: {
        isTransitioning: false
      }
    }, /* @__PURE__ */ React__namespace2.createElement(reactRouterDom.Router, {
      basename: dataRouterContext.basename,
      location: state.location,
      navigationType: state.historyAction,
      navigator: dataRouterContext.navigator,
      static: dataRouterContext.static,
      future: {
        v7_relativeSplatPath: router$1.future.v7_relativeSplatPath
      }
    }, /* @__PURE__ */ React__namespace2.createElement(DataRoutes2, {
      routes: router$1.routes,
      future: router$1.future,
      state
    })))))), hydrateScript ? /* @__PURE__ */ React__namespace2.createElement("script", {
      suppressHydrationWarning: true,
      nonce,
      dangerouslySetInnerHTML: {
        __html: hydrateScript
      }
    }) : null);
  }
  function DataRoutes2({
    routes,
    future,
    state
  }) {
    return reactRouter.UNSAFE_useRoutesImpl(routes, void 0, state, future);
  }
  function serializeErrors(errors) {
    if (!errors) return null;
    let entries = Object.entries(errors);
    let serialized = {};
    for (let [key, val] of entries) {
      if (router.isRouteErrorResponse(val)) {
        serialized[key] = {
          ...val,
          __type: "RouteErrorResponse"
        };
      } else if (val instanceof Error) {
        serialized[key] = {
          message: val.message,
          __type: "Error",
          // If this is a subclass (i.e., ReferenceError), send up the type so we
          // can re-create the same type during hydration.
          ...val.name !== "Error" ? {
            __subType: val.name
          } : {}
        };
      } else {
        serialized[key] = val;
      }
    }
    return serialized;
  }
  function getStatelessNavigator() {
    return {
      createHref,
      encodeLocation,
      push(to) {
        throw new Error(`You cannot use navigator.push() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${JSON.stringify(to)})\` somewhere in your app.`);
      },
      replace(to) {
        throw new Error(`You cannot use navigator.replace() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${JSON.stringify(to)}, { replace: true })\` somewhere in your app.`);
      },
      go(delta) {
        throw new Error(`You cannot use navigator.go() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${delta})\` somewhere in your app.`);
      },
      back() {
        throw new Error(`You cannot use navigator.back() on the server because it is a stateless environment.`);
      },
      forward() {
        throw new Error(`You cannot use navigator.forward() on the server because it is a stateless environment.`);
      }
    };
  }
  function createStaticHandler(routes, opts) {
    return router.createStaticHandler(routes, {
      ...opts,
      mapRouteProperties: reactRouter.UNSAFE_mapRouteProperties
    });
  }
  function createStaticRouter(routes, context, opts = {}) {
    let manifest = {};
    let dataRoutes = router.UNSAFE_convertRoutesToDataRoutes(routes, reactRouter.UNSAFE_mapRouteProperties, void 0, manifest);
    let matches = context.matches.map((match) => {
      let route = manifest[match.route.id] || match.route;
      return {
        ...match,
        route
      };
    });
    let msg = (method) => `You cannot use router.${method}() on the server because it is a stateless environment`;
    return {
      get basename() {
        return context.basename;
      },
      get future() {
        var _a, _b;
        return {
          v7_fetcherPersist: false,
          v7_normalizeFormMethod: false,
          v7_partialHydration: ((_a = opts.future) == null ? void 0 : _a.v7_partialHydration) === true,
          v7_prependBasename: false,
          v7_relativeSplatPath: ((_b = opts.future) == null ? void 0 : _b.v7_relativeSplatPath) === true,
          v7_skipActionErrorRevalidation: false
        };
      },
      get state() {
        return {
          historyAction: router.Action.Pop,
          location: context.location,
          matches,
          loaderData: context.loaderData,
          actionData: context.actionData,
          errors: context.errors,
          initialized: true,
          navigation: router.IDLE_NAVIGATION,
          restoreScrollPosition: null,
          preventScrollReset: false,
          revalidation: "idle",
          fetchers: /* @__PURE__ */ new Map(),
          blockers: /* @__PURE__ */ new Map()
        };
      },
      get routes() {
        return dataRoutes;
      },
      get window() {
        return void 0;
      },
      initialize() {
        throw msg("initialize");
      },
      subscribe() {
        throw msg("subscribe");
      },
      enableScrollRestoration() {
        throw msg("enableScrollRestoration");
      },
      navigate() {
        throw msg("navigate");
      },
      fetch() {
        throw msg("fetch");
      },
      revalidate() {
        throw msg("revalidate");
      },
      createHref,
      encodeLocation,
      getFetcher() {
        return router.IDLE_FETCHER;
      },
      deleteFetcher() {
        throw msg("deleteFetcher");
      },
      dispose() {
        throw msg("dispose");
      },
      getBlocker() {
        return router.IDLE_BLOCKER;
      },
      deleteBlocker() {
        throw msg("deleteBlocker");
      },
      patchRoutes() {
        throw msg("patchRoutes");
      },
      _internalFetchControllers: /* @__PURE__ */ new Map(),
      _internalActiveDeferreds: /* @__PURE__ */ new Map(),
      _internalSetRoutes() {
        throw msg("_internalSetRoutes");
      }
    };
  }
  function createHref(to) {
    return typeof to === "string" ? to : reactRouterDom.createPath(to);
  }
  function encodeLocation(to) {
    let href = typeof to === "string" ? to : reactRouterDom.createPath(to);
    href = href.replace(/ $/, "%20");
    let encoded = ABSOLUTE_URL_REGEX2.test(href) ? new URL(href) : new URL(href, "http://localhost");
    return {
      pathname: encoded.pathname,
      search: encoded.search,
      hash: encoded.hash
    };
  }
  const ABSOLUTE_URL_REGEX2 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
  const ESCAPE_LOOKUP = {
    "&": "\\u0026",
    ">": "\\u003e",
    "<": "\\u003c",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029"
  };
  const ESCAPE_REGEX = /[&><\u2028\u2029]/g;
  function htmlEscape(str) {
    return str.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
  }
  server.StaticRouter = StaticRouter;
  server.StaticRouterProvider = StaticRouterProvider;
  server.createStaticHandler = createStaticHandler;
  server.createStaticRouter = createStaticRouter;
  return server;
}
var serverExports = /* @__PURE__ */ requireServer();
exports.Link = Link;
exports.serverExports = serverExports;
exports.useSearchParams = useSearchParams;
//# sourceMappingURL=ssr-n-modules.js.map

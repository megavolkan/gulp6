/*!
  * Bootstrap v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
(function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, 
    global.bootstrap = factory());
})(this, function() {
    "use strict";
    /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/data.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const elementMap = new Map;
    const Data = {
        set(element, key, instance) {
            if (!elementMap.has(element)) {
                elementMap.set(element, new Map);
            }
            const instanceMap = elementMap.get(element);
            // make it clear we only want one instance per element
            // can be removed later when multiple key/instances are fine to be used
                        if (!instanceMap.has(key) && instanceMap.size !== 0) {
                // eslint-disable-next-line no-console
                console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
                return;
            }
            instanceMap.set(key, instance);
        },
        get(element, key) {
            if (elementMap.has(element)) {
                return elementMap.get(element).get(key) || null;
            }
            return null;
        },
        remove(element, key) {
            if (!elementMap.has(element)) {
                return;
            }
            const instanceMap = elementMap.get(element);
            instanceMap.delete(key);
            // free up element references if there are no instances left for an element
                        if (instanceMap.size === 0) {
                elementMap.delete(element);
            }
        }
    };
    /**
   * --------------------------------------------------------------------------
   * Bootstrap util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */    const MAX_UID = 1e6;
    const MILLISECONDS_MULTIPLIER = 1e3;
    const TRANSITION_END = "transitionend";
    /**
   * Properly escape IDs selectors to handle weird IDs
   * @param {string} selector
   * @returns {string}
   */    const parseSelector = selector => {
        if (selector && window.CSS && window.CSS.escape) {
            // document.querySelector needs escaping to handle IDs (html5+) containing for instance /
            selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
        }
        return selector;
    };
    // Shout-out Angus Croll (https://goo.gl/pxwQGp)
        const toType = object => {
        if (object === null || object === undefined) {
            return `${object}`;
        }
        return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
    };
    /**
   * Public Util API
   */    const getUID = prefix => {
        do {
            prefix += Math.floor(Math.random() * MAX_UID);
        } while (document.getElementById(prefix));
        return prefix;
    };
    const getTransitionDurationFromElement = element => {
        if (!element) {
            return 0;
        }
        // Get transition-duration of the element
                let {transitionDuration: transitionDuration, transitionDelay: transitionDelay} = window.getComputedStyle(element);
        const floatTransitionDuration = Number.parseFloat(transitionDuration);
        const floatTransitionDelay = Number.parseFloat(transitionDelay);
        // Return 0 if element or transition duration is not found
                if (!floatTransitionDuration && !floatTransitionDelay) {
            return 0;
        }
        // If multiple durations are defined, take the first
                transitionDuration = transitionDuration.split(",")[0];
        transitionDelay = transitionDelay.split(",")[0];
        return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
    };
    const triggerTransitionEnd = element => {
        element.dispatchEvent(new Event(TRANSITION_END));
    };
    const isElement$1 = object => {
        if (!object || typeof object !== "object") {
            return false;
        }
        if (typeof object.jquery !== "undefined") {
            object = object[0];
        }
        return typeof object.nodeType !== "undefined";
    };
    const getElement = object => {
        // it's a jQuery object or a node element
        if (isElement$1(object)) {
            return object.jquery ? object[0] : object;
        }
        if (typeof object === "string" && object.length > 0) {
            return document.querySelector(parseSelector(object));
        }
        return null;
    };
    const isVisible = element => {
        if (!isElement$1(element) || element.getClientRects().length === 0) {
            return false;
        }
        const elementIsVisible = getComputedStyle(element).getPropertyValue("visibility") === "visible";
        // Handle `details` element as its content may falsie appear visible when it is closed
                const closedDetails = element.closest("details:not([open])");
        if (!closedDetails) {
            return elementIsVisible;
        }
        if (closedDetails !== element) {
            const summary = element.closest("summary");
            if (summary && summary.parentNode !== closedDetails) {
                return false;
            }
            if (summary === null) {
                return false;
            }
        }
        return elementIsVisible;
    };
    const isDisabled = element => {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return true;
        }
        if (element.classList.contains("disabled")) {
            return true;
        }
        if (typeof element.disabled !== "undefined") {
            return element.disabled;
        }
        return element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false";
    };
    const findShadowRoot = element => {
        if (!document.documentElement.attachShadow) {
            return null;
        }
        // Can find the shadow root otherwise it'll return the document
                if (typeof element.getRootNode === "function") {
            const root = element.getRootNode();
            return root instanceof ShadowRoot ? root : null;
        }
        if (element instanceof ShadowRoot) {
            return element;
        }
        // when we don't find a shadow root
                if (!element.parentNode) {
            return null;
        }
        return findShadowRoot(element.parentNode);
    };
    const noop = () => {};
    /**
   * Trick to restart an element's animation
   *
   * @param {HTMLElement} element
   * @return void
   *
   * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
   */    const reflow = element => {
        element.offsetHeight;
 // eslint-disable-line no-unused-expressions
        };
    const getjQuery = () => {
        if (window.jQuery && !document.body.hasAttribute("data-bs-no-jquery")) {
            return window.jQuery;
        }
        return null;
    };
    const DOMContentLoadedCallbacks = [];
    const onDOMContentLoaded = callback => {
        if (document.readyState === "loading") {
            // add listener on the first call when the document is in loading state
            if (!DOMContentLoadedCallbacks.length) {
                document.addEventListener("DOMContentLoaded", () => {
                    for (const callback of DOMContentLoadedCallbacks) {
                        callback();
                    }
                });
            }
            DOMContentLoadedCallbacks.push(callback);
        } else {
            callback();
        }
    };
    const isRTL = () => document.documentElement.dir === "rtl";
    const defineJQueryPlugin = plugin => {
        onDOMContentLoaded(() => {
            const $ = getjQuery();
            /* istanbul ignore if */            if ($) {
                const name = plugin.NAME;
                const JQUERY_NO_CONFLICT = $.fn[name];
                $.fn[name] = plugin.jQueryInterface;
                $.fn[name].Constructor = plugin;
                $.fn[name].noConflict = () => {
                    $.fn[name] = JQUERY_NO_CONFLICT;
                    return plugin.jQueryInterface;
                };
            }
        });
    };
    const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => typeof possibleCallback === "function" ? possibleCallback(...args) : defaultValue;
    const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
        if (!waitForTransition) {
            execute(callback);
            return;
        }
        const durationPadding = 5;
        const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
        let called = false;
        const handler = ({target: target}) => {
            if (target !== transitionElement) {
                return;
            }
            called = true;
            transitionElement.removeEventListener(TRANSITION_END, handler);
            execute(callback);
        };
        transitionElement.addEventListener(TRANSITION_END, handler);
        setTimeout(() => {
            if (!called) {
                triggerTransitionEnd(transitionElement);
            }
        }, emulatedDuration);
    };
    /**
   * Return the previous/next element of a list.
   *
   * @param {array} list    The list of elements
   * @param activeElement   The active element
   * @param shouldGetNext   Choose to get next or previous element
   * @param isCycleAllowed
   * @return {Element|elem} The proper element
   */    const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
        const listLength = list.length;
        let index = list.indexOf(activeElement);
        // if the element does not exist in the list return an element
        // depending on the direction and if cycle is allowed
                if (index === -1) {
            return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
        }
        index += shouldGetNext ? 1 : -1;
        if (isCycleAllowed) {
            index = (index + listLength) % listLength;
        }
        return list[Math.max(0, Math.min(index, listLength - 1))];
    };
    /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/event-handler.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
    const stripNameRegex = /\..*/;
    const stripUidRegex = /::\d+$/;
    const eventRegistry = {};
 // Events storage
        let uidEvent = 1;
    const customEvents = {
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    };
    const nativeEvents = new Set([ "click", "dblclick", "mouseup", "mousedown", "contextmenu", "mousewheel", "DOMMouseScroll", "mouseover", "mouseout", "mousemove", "selectstart", "selectend", "keydown", "keypress", "keyup", "orientationchange", "touchstart", "touchmove", "touchend", "touchcancel", "pointerdown", "pointermove", "pointerup", "pointerleave", "pointercancel", "gesturestart", "gesturechange", "gestureend", "focus", "blur", "change", "reset", "select", "submit", "focusin", "focusout", "load", "unload", "beforeunload", "resize", "move", "DOMContentLoaded", "readystatechange", "error", "abort", "scroll" ]);
    /**
   * Private methods
   */    function makeEventUid(element, uid) {
        return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
    }
    function getElementEvents(element) {
        const uid = makeEventUid(element);
        element.uidEvent = uid;
        eventRegistry[uid] = eventRegistry[uid] || {};
        return eventRegistry[uid];
    }
    function bootstrapHandler(element, fn) {
        return function handler(event) {
            hydrateObj(event, {
                delegateTarget: element
            });
            if (handler.oneOff) {
                EventHandler.off(element, event.type, fn);
            }
            return fn.apply(element, [ event ]);
        };
    }
    function bootstrapDelegationHandler(element, selector, fn) {
        return function handler(event) {
            const domElements = element.querySelectorAll(selector);
            for (let {target: target} = event; target && target !== this; target = target.parentNode) {
                for (const domElement of domElements) {
                    if (domElement !== target) {
                        continue;
                    }
                    hydrateObj(event, {
                        delegateTarget: target
                    });
                    if (handler.oneOff) {
                        EventHandler.off(element, event.type, selector, fn);
                    }
                    return fn.apply(target, [ event ]);
                }
            }
        };
    }
    function findHandler(events, callable, delegationSelector = null) {
        return Object.values(events).find(event => event.callable === callable && event.delegationSelector === delegationSelector);
    }
    function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
        const isDelegated = typeof handler === "string";
        // TODO: tooltip passes `false` instead of selector, so we need to check
                const callable = isDelegated ? delegationFunction : handler || delegationFunction;
        let typeEvent = getTypeEvent(originalTypeEvent);
        if (!nativeEvents.has(typeEvent)) {
            typeEvent = originalTypeEvent;
        }
        return [ isDelegated, callable, typeEvent ];
    }
    function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
        if (typeof originalTypeEvent !== "string" || !element) {
            return;
        }
        let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
        // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
        // this prevents the handler from being dispatched the same way as mouseover or mouseout does
                if (originalTypeEvent in customEvents) {
            const wrapFunction = fn => function(event) {
                if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
                    return fn.call(this, event);
                }
            };
            callable = wrapFunction(callable);
        }
        const events = getElementEvents(element);
        const handlers = events[typeEvent] || (events[typeEvent] = {});
        const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
        if (previousFunction) {
            previousFunction.oneOff = previousFunction.oneOff && oneOff;
            return;
        }
        const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ""));
        const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
        fn.delegationSelector = isDelegated ? handler : null;
        fn.callable = callable;
        fn.oneOff = oneOff;
        fn.uidEvent = uid;
        handlers[uid] = fn;
        element.addEventListener(typeEvent, fn, isDelegated);
    }
    function removeHandler(element, events, typeEvent, handler, delegationSelector) {
        const fn = findHandler(events[typeEvent], handler, delegationSelector);
        if (!fn) {
            return;
        }
        element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
        delete events[typeEvent][fn.uidEvent];
    }
    function removeNamespacedHandlers(element, events, typeEvent, namespace) {
        const storeElementEvent = events[typeEvent] || {};
        for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
            if (handlerKey.includes(namespace)) {
                removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
            }
        }
    }
    function getTypeEvent(event) {
        // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
        event = event.replace(stripNameRegex, "");
        return customEvents[event] || event;
    }
    const EventHandler = {
        on(element, event, handler, delegationFunction) {
            addHandler(element, event, handler, delegationFunction, false);
        },
        one(element, event, handler, delegationFunction) {
            addHandler(element, event, handler, delegationFunction, true);
        },
        off(element, originalTypeEvent, handler, delegationFunction) {
            if (typeof originalTypeEvent !== "string" || !element) {
                return;
            }
            const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
            const inNamespace = typeEvent !== originalTypeEvent;
            const events = getElementEvents(element);
            const storeElementEvent = events[typeEvent] || {};
            const isNamespace = originalTypeEvent.startsWith(".");
            if (typeof callable !== "undefined") {
                // Simplest case: handler is passed, remove that listener ONLY.
                if (!Object.keys(storeElementEvent).length) {
                    return;
                }
                removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
                return;
            }
            if (isNamespace) {
                for (const elementEvent of Object.keys(events)) {
                    removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
                }
            }
            for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
                const handlerKey = keyHandlers.replace(stripUidRegex, "");
                if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
                    removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
                }
            }
        },
        trigger(element, event, args) {
            if (typeof event !== "string" || !element) {
                return null;
            }
            const $ = getjQuery();
            const typeEvent = getTypeEvent(event);
            const inNamespace = event !== typeEvent;
            let jQueryEvent = null;
            let bubbles = true;
            let nativeDispatch = true;
            let defaultPrevented = false;
            if (inNamespace && $) {
                jQueryEvent = $.Event(event, args);
                $(element).trigger(jQueryEvent);
                bubbles = !jQueryEvent.isPropagationStopped();
                nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
                defaultPrevented = jQueryEvent.isDefaultPrevented();
            }
            const evt = hydrateObj(new Event(event, {
                bubbles: bubbles,
                cancelable: true
            }), args);
            if (defaultPrevented) {
                evt.preventDefault();
            }
            if (nativeDispatch) {
                element.dispatchEvent(evt);
            }
            if (evt.defaultPrevented && jQueryEvent) {
                jQueryEvent.preventDefault();
            }
            return evt;
        }
    };
    function hydrateObj(obj, meta = {}) {
        for (const [key, value] of Object.entries(meta)) {
            try {
                obj[key] = value;
            } catch (_unused) {
                Object.defineProperty(obj, key, {
                    configurable: true,
                    get() {
                        return value;
                    }
                });
            }
        }
        return obj;
    }
    /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/manipulator.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */    function normalizeData(value) {
        if (value === "true") {
            return true;
        }
        if (value === "false") {
            return false;
        }
        if (value === Number(value).toString()) {
            return Number(value);
        }
        if (value === "" || value === "null") {
            return null;
        }
        if (typeof value !== "string") {
            return value;
        }
        try {
            return JSON.parse(decodeURIComponent(value));
        } catch (_unused) {
            return value;
        }
    }
    function normalizeDataKey(key) {
        return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
    }
    const Manipulator = {
        setDataAttribute(element, key, value) {
            element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
        },
        removeDataAttribute(element, key) {
            element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
        },
        getDataAttributes(element) {
            if (!element) {
                return {};
            }
            const attributes = {};
            const bsKeys = Object.keys(element.dataset).filter(key => key.startsWith("bs") && !key.startsWith("bsConfig"));
            for (const key of bsKeys) {
                let pureKey = key.replace(/^bs/, "");
                pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
                attributes[pureKey] = normalizeData(element.dataset[key]);
            }
            return attributes;
        },
        getDataAttribute(element, key) {
            return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
        }
    };
    /**
   * --------------------------------------------------------------------------
   * Bootstrap util/config.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Class definition
   */    class Config {
        // Getters
        static get Default() {
            return {};
        }
        static get DefaultType() {
            return {};
        }
        static get NAME() {
            throw new Error('You have to implement the static method "NAME", for each component!');
        }
        _getConfig(config) {
            config = this._mergeConfigObj(config);
            config = this._configAfterMerge(config);
            this._typeCheckConfig(config);
            return config;
        }
        _configAfterMerge(config) {
            return config;
        }
        _mergeConfigObj(config, element) {
            const jsonConfig = isElement$1(element) ? Manipulator.getDataAttribute(element, "config") : {};
 // try to parse
                        return {
                ...this.constructor.Default,
                ...typeof jsonConfig === "object" ? jsonConfig : {},
                ...isElement$1(element) ? Manipulator.getDataAttributes(element) : {},
                ...typeof config === "object" ? config : {}
            };
        }
        _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
            for (const [property, expectedTypes] of Object.entries(configTypes)) {
                const value = config[property];
                const valueType = isElement$1(value) ? "element" : toType(value);
                if (!new RegExp(expectedTypes).test(valueType)) {
                    throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
                }
            }
        }
    }
    /**
   * --------------------------------------------------------------------------
   * Bootstrap base-component.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const VERSION = "5.3.3";
    /**
   * Class definition
   */    class BaseComponent extends Config {
        constructor(element, config) {
            super();
            element = getElement(element);
            if (!element) {
                return;
            }
            this._element = element;
            this._config = this._getConfig(config);
            Data.set(this._element, this.constructor.DATA_KEY, this);
        }
        // Public
        dispose() {
            Data.remove(this._element, this.constructor.DATA_KEY);
            EventHandler.off(this._element, this.constructor.EVENT_KEY);
            for (const propertyName of Object.getOwnPropertyNames(this)) {
                this[propertyName] = null;
            }
        }
        _queueCallback(callback, element, isAnimated = true) {
            executeAfterTransition(callback, element, isAnimated);
        }
        _getConfig(config) {
            config = this._mergeConfigObj(config, this._element);
            config = this._configAfterMerge(config);
            this._typeCheckConfig(config);
            return config;
        }
        // Static
        static getInstance(element) {
            return Data.get(getElement(element), this.DATA_KEY);
        }
        static getOrCreateInstance(element, config = {}) {
            return this.getInstance(element) || new this(element, typeof config === "object" ? config : null);
        }
        static get VERSION() {
            return VERSION;
        }
        static get DATA_KEY() {
            return `bs.${this.NAME}`;
        }
        static get EVENT_KEY() {
            return `.${this.DATA_KEY}`;
        }
        static eventName(name) {
            return `${name}${this.EVENT_KEY}`;
        }
    }
    /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/selector-engine.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */    const getSelector = element => {
        let selector = element.getAttribute("data-bs-target");
        if (!selector || selector === "#") {
            let hrefAttribute = element.getAttribute("href");
            // The only valid content that could double as a selector are IDs or classes,
            // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
            // `document.querySelector` will rightfully complain it is invalid.
            // See https://github.com/twbs/bootstrap/issues/32273
                        if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) {
                return null;
            }
            // Just in case some CMS puts out a full URL with the anchor appended
                        if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) {
                hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
            }
            selector = hrefAttribute && hrefAttribute !== "#" ? hrefAttribute.trim() : null;
        }
        return selector ? selector.split(",").map(sel => parseSelector(sel)).join(",") : null;
    };
    const SelectorEngine = {
        find(selector, element = document.documentElement) {
            return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
        },
        findOne(selector, element = document.documentElement) {
            return Element.prototype.querySelector.call(element, selector);
        },
        children(element, selector) {
            return [].concat(...element.children).filter(child => child.matches(selector));
        },
        parents(element, selector) {
            const parents = [];
            let ancestor = element.parentNode.closest(selector);
            while (ancestor) {
                parents.push(ancestor);
                ancestor = ancestor.parentNode.closest(selector);
            }
            return parents;
        },
        prev(element, selector) {
            let previous = element.previousElementSibling;
            while (previous) {
                if (previous.matches(selector)) {
                    return [ previous ];
                }
                previous = previous.previousElementSibling;
            }
            return [];
        },
        // TODO: this is now unused; remove later along with prev()
        next(element, selector) {
            let next = element.nextElementSibling;
            while (next) {
                if (next.matches(selector)) {
                    return [ next ];
                }
                next = next.nextElementSibling;
            }
            return [];
        },
        focusableChildren(element) {
            const focusables = [ "a", "button", "input", "textarea", "select", "details", "[tabindex]", '[contenteditable="true"]' ].map(selector => `${selector}:not([tabindex^="-"])`).join(",");
            return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
        },
        getSelectorFromElement(element) {
            const selector = getSelector(element);
            if (selector) {
                return SelectorEngine.findOne(selector) ? selector : null;
            }
            return null;
        },
        getElementFromSelector(element) {
            const selector = getSelector(element);
            return selector ? SelectorEngine.findOne(selector) : null;
        },
        getMultipleElementsFromSelector(element) {
            const selector = getSelector(element);
            return selector ? SelectorEngine.find(selector) : [];
        }
    };
    /**
   * --------------------------------------------------------------------------
   * Bootstrap util/component-functions.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */    const enableDismissTrigger = (component, method = "hide") => {
        const clickEvent = `click.dismiss${component.EVENT_KEY}`;
        const name = component.NAME;
        EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function(event) {
            if ([ "A", "AREA" ].includes(this.tagName)) {
                event.preventDefault();
            }
            if (isDisabled(this)) {
                return;
            }
            const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
            const instance = component.getOrCreateInstance(target);
            // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method
                        instance[method]();
        });
    };
    /**
   * --------------------------------------------------------------------------
   * Bootstrap alert.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$f = "alert";
    const DATA_KEY$a = "bs.alert";
    const EVENT_KEY$b = `.${DATA_KEY$a}`;
    const EVENT_CLOSE = `close${EVENT_KEY$b}`;
    const EVENT_CLOSED = `closed${EVENT_KEY$b}`;
    const CLASS_NAME_FADE$5 = "fade";
    const CLASS_NAME_SHOW$8 = "show";
    /**
   * Class definition
   */    class Alert extends BaseComponent {
        // Getters
        static get NAME() {
            return NAME$f;
        }
        // Public
        close() {
            const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
            if (closeEvent.defaultPrevented) {
                return;
            }
            this._element.classList.remove(CLASS_NAME_SHOW$8);
            const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
            this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
        }
        // Private
        _destroyElement() {
            this._element.remove();
            EventHandler.trigger(this._element, EVENT_CLOSED);
            this.dispose();
        }
        // Static
        static jQueryInterface(config) {
            return this.each(function() {
                const data = Alert.getOrCreateInstance(this);
                if (typeof config !== "string") {
                    return;
                }
                if (data[config] === undefined || config.startsWith("_") || config === "constructor") {
                    throw new TypeError(`No method named "${config}"`);
                }
                data[config](this);
            });
        }
    }
    /**
   * Data API implementation
   */    enableDismissTrigger(Alert, "close");
    /**
   * jQuery
   */    defineJQueryPlugin(Alert);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap button.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$e = "button";
    const DATA_KEY$9 = "bs.button";
    const EVENT_KEY$a = `.${DATA_KEY$9}`;
    const DATA_API_KEY$6 = ".data-api";
    const CLASS_NAME_ACTIVE$3 = "active";
    const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
    const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`
    /**
   * Class definition
   */;
    class Button extends BaseComponent {
        // Getters
        static get NAME() {
            return NAME$e;
        }
        // Public
        toggle() {
            // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
            this._element.setAttribute("aria-pressed", this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
        }
        // Static
        static jQueryInterface(config) {
            return this.each(function() {
                const data = Button.getOrCreateInstance(this);
                if (config === "toggle") {
                    data[config]();
                }
            });
        }
    }
    /**
   * Data API implementation
   */    EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, event => {
        event.preventDefault();
        const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
        const data = Button.getOrCreateInstance(button);
        data.toggle();
    });
    /**
   * jQuery
   */    defineJQueryPlugin(Button);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap util/swipe.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$d = "swipe";
    const EVENT_KEY$9 = ".bs.swipe";
    const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
    const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
    const EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
    const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
    const EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
    const POINTER_TYPE_TOUCH = "touch";
    const POINTER_TYPE_PEN = "pen";
    const CLASS_NAME_POINTER_EVENT = "pointer-event";
    const SWIPE_THRESHOLD = 40;
    const Default$c = {
        endCallback: null,
        leftCallback: null,
        rightCallback: null
    };
    const DefaultType$c = {
        endCallback: "(function|null)",
        leftCallback: "(function|null)",
        rightCallback: "(function|null)"
    };
    /**
   * Class definition
   */    class Swipe extends Config {
        constructor(element, config) {
            super();
            this._element = element;
            if (!element || !Swipe.isSupported()) {
                return;
            }
            this._config = this._getConfig(config);
            this._deltaX = 0;
            this._supportPointerEvents = Boolean(window.PointerEvent);
            this._initEvents();
        }
        // Getters
        static get Default() {
            return Default$c;
        }
        static get DefaultType() {
            return DefaultType$c;
        }
        static get NAME() {
            return NAME$d;
        }
        // Public
        dispose() {
            EventHandler.off(this._element, EVENT_KEY$9);
        }
        // Private
        _start(event) {
            if (!this._supportPointerEvents) {
                this._deltaX = event.touches[0].clientX;
                return;
            }
            if (this._eventIsPointerPenTouch(event)) {
                this._deltaX = event.clientX;
            }
        }
        _end(event) {
            if (this._eventIsPointerPenTouch(event)) {
                this._deltaX = event.clientX - this._deltaX;
            }
            this._handleSwipe();
            execute(this._config.endCallback);
        }
        _move(event) {
            this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
        }
        _handleSwipe() {
            const absDeltaX = Math.abs(this._deltaX);
            if (absDeltaX <= SWIPE_THRESHOLD) {
                return;
            }
            const direction = absDeltaX / this._deltaX;
            this._deltaX = 0;
            if (!direction) {
                return;
            }
            execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
        }
        _initEvents() {
            if (this._supportPointerEvents) {
                EventHandler.on(this._element, EVENT_POINTERDOWN, event => this._start(event));
                EventHandler.on(this._element, EVENT_POINTERUP, event => this._end(event));
                this._element.classList.add(CLASS_NAME_POINTER_EVENT);
            } else {
                EventHandler.on(this._element, EVENT_TOUCHSTART, event => this._start(event));
                EventHandler.on(this._element, EVENT_TOUCHMOVE, event => this._move(event));
                EventHandler.on(this._element, EVENT_TOUCHEND, event => this._end(event));
            }
        }
        _eventIsPointerPenTouch(event) {
            return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
        }
        // Static
        static isSupported() {
            return "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;
        }
    }
    /**
   * --------------------------------------------------------------------------
   * Bootstrap carousel.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$c = "carousel";
    const DATA_KEY$8 = "bs.carousel";
    const EVENT_KEY$8 = `.${DATA_KEY$8}`;
    const DATA_API_KEY$5 = ".data-api";
    const ARROW_LEFT_KEY$1 = "ArrowLeft";
    const ARROW_RIGHT_KEY$1 = "ArrowRight";
    const TOUCHEVENT_COMPAT_WAIT = 500;
 // Time for mouse compat events to fire after touch
        const ORDER_NEXT = "next";
    const ORDER_PREV = "prev";
    const DIRECTION_LEFT = "left";
    const DIRECTION_RIGHT = "right";
    const EVENT_SLIDE = `slide${EVENT_KEY$8}`;
    const EVENT_SLID = `slid${EVENT_KEY$8}`;
    const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
    const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
    const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
    const EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
    const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
    const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
    const CLASS_NAME_CAROUSEL = "carousel";
    const CLASS_NAME_ACTIVE$2 = "active";
    const CLASS_NAME_SLIDE = "slide";
    const CLASS_NAME_END = "carousel-item-end";
    const CLASS_NAME_START = "carousel-item-start";
    const CLASS_NAME_NEXT = "carousel-item-next";
    const CLASS_NAME_PREV = "carousel-item-prev";
    const SELECTOR_ACTIVE = ".active";
    const SELECTOR_ITEM = ".carousel-item";
    const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
    const SELECTOR_ITEM_IMG = ".carousel-item img";
    const SELECTOR_INDICATORS = ".carousel-indicators";
    const SELECTOR_DATA_SLIDE = "[data-bs-slide], [data-bs-slide-to]";
    const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
    const KEY_TO_DIRECTION = {
        [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
        [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
    };
    const Default$b = {
        interval: 5e3,
        keyboard: true,
        pause: "hover",
        ride: false,
        touch: true,
        wrap: true
    };
    const DefaultType$b = {
        interval: "(number|boolean)",
        // TODO:v6 remove boolean support
        keyboard: "boolean",
        pause: "(string|boolean)",
        ride: "(boolean|string)",
        touch: "boolean",
        wrap: "boolean"
    };
    /**
   * Class definition
   */    class Carousel extends BaseComponent {
        constructor(element, config) {
            super(element, config);
            this._interval = null;
            this._activeElement = null;
            this._isSliding = false;
            this.touchTimeout = null;
            this._swipeHelper = null;
            this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
            this._addEventListeners();
            if (this._config.ride === CLASS_NAME_CAROUSEL) {
                this.cycle();
            }
        }
        // Getters
        static get Default() {
            return Default$b;
        }
        static get DefaultType() {
            return DefaultType$b;
        }
        static get NAME() {
            return NAME$c;
        }
        // Public
        next() {
            this._slide(ORDER_NEXT);
        }
        nextWhenVisible() {
            // FIXME TODO use `document.visibilityState`
            // Don't call next when the page isn't visible
            // or the carousel or its parent isn't visible
            if (!document.hidden && isVisible(this._element)) {
                this.next();
            }
        }
        prev() {
            this._slide(ORDER_PREV);
        }
        pause() {
            if (this._isSliding) {
                triggerTransitionEnd(this._element);
            }
            this._clearInterval();
        }
        cycle() {
            this._clearInterval();
            this._updateInterval();
            this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
        }
        _maybeEnableCycle() {
            if (!this._config.ride) {
                return;
            }
            if (this._isSliding) {
                EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
                return;
            }
            this.cycle();
        }
        to(index) {
            const items = this._getItems();
            if (index > items.length - 1 || index < 0) {
                return;
            }
            if (this._isSliding) {
                EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
                return;
            }
            const activeIndex = this._getItemIndex(this._getActive());
            if (activeIndex === index) {
                return;
            }
            const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
            this._slide(order, items[index]);
        }
        dispose() {
            if (this._swipeHelper) {
                this._swipeHelper.dispose();
            }
            super.dispose();
        }
        // Private
        _configAfterMerge(config) {
            config.defaultInterval = config.interval;
            return config;
        }
        _addEventListeners() {
            if (this._config.keyboard) {
                EventHandler.on(this._element, EVENT_KEYDOWN$1, event => this._keydown(event));
            }
            if (this._config.pause === "hover") {
                EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
                EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
            }
            if (this._config.touch && Swipe.isSupported()) {
                this._addTouchEventListeners();
            }
        }
        _addTouchEventListeners() {
            for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
                EventHandler.on(img, EVENT_DRAG_START, event => event.preventDefault());
            }
            const endCallBack = () => {
                if (this._config.pause !== "hover") {
                    return;
                }
                // If it's a touch-enabled device, mouseenter/leave are fired as
                // part of the mouse compatibility events on first tap - the carousel
                // would stop cycling until user tapped out of it;
                // here, we listen for touchend, explicitly pause the carousel
                // (as if it's the second time we tap on it, mouseenter compat event
                // is NOT fired) and after a timeout (to allow for mouse compatibility
                // events to fire) we explicitly restart cycling
                                this.pause();
                if (this.touchTimeout) {
                    clearTimeout(this.touchTimeout);
                }
                this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
            };
            const swipeConfig = {
                leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
                rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
                endCallback: endCallBack
            };
            this._swipeHelper = new Swipe(this._element, swipeConfig);
        }
        _keydown(event) {
            if (/input|textarea/i.test(event.target.tagName)) {
                return;
            }
            const direction = KEY_TO_DIRECTION[event.key];
            if (direction) {
                event.preventDefault();
                this._slide(this._directionToOrder(direction));
            }
        }
        _getItemIndex(element) {
            return this._getItems().indexOf(element);
        }
        _setActiveIndicatorElement(index) {
            if (!this._indicatorsElement) {
                return;
            }
            const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
            activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
            activeIndicator.removeAttribute("aria-current");
            const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
            if (newActiveIndicator) {
                newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
                newActiveIndicator.setAttribute("aria-current", "true");
            }
        }
        _updateInterval() {
            const element = this._activeElement || this._getActive();
            if (!element) {
                return;
            }
            const elementInterval = Number.parseInt(element.getAttribute("data-bs-interval"), 10);
            this._config.interval = elementInterval || this._config.defaultInterval;
        }
        _slide(order, element = null) {
            if (this._isSliding) {
                return;
            }
            const activeElement = this._getActive();
            const isNext = order === ORDER_NEXT;
            const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
            if (nextElement === activeElement) {
                return;
            }
            const nextElementIndex = this._getItemIndex(nextElement);
            const triggerEvent = eventName => EventHandler.trigger(this._element, eventName, {
                relatedTarget: nextElement,
                direction: this._orderToDirection(order),
                from: this._getItemIndex(activeElement),
                to: nextElementIndex
            });
            const slideEvent = triggerEvent(EVENT_SLIDE);
            if (slideEvent.defaultPrevented) {
                return;
            }
            if (!activeElement || !nextElement) {
                // Some weirdness is happening, so we bail
                // TODO: change tests that use empty divs to avoid this check
                return;
            }
            const isCycling = Boolean(this._interval);
            this.pause();
            this._isSliding = true;
            this._setActiveIndicatorElement(nextElementIndex);
            this._activeElement = nextElement;
            const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
            const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
            nextElement.classList.add(orderClassName);
            reflow(nextElement);
            activeElement.classList.add(directionalClassName);
            nextElement.classList.add(directionalClassName);
            const completeCallBack = () => {
                nextElement.classList.remove(directionalClassName, orderClassName);
                nextElement.classList.add(CLASS_NAME_ACTIVE$2);
                activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
                this._isSliding = false;
                triggerEvent(EVENT_SLID);
            };
            this._queueCallback(completeCallBack, activeElement, this._isAnimated());
            if (isCycling) {
                this.cycle();
            }
        }
        _isAnimated() {
            return this._element.classList.contains(CLASS_NAME_SLIDE);
        }
        _getActive() {
            return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
        }
        _getItems() {
            return SelectorEngine.find(SELECTOR_ITEM, this._element);
        }
        _clearInterval() {
            if (this._interval) {
                clearInterval(this._interval);
                this._interval = null;
            }
        }
        _directionToOrder(direction) {
            if (isRTL()) {
                return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
            }
            return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
        }
        _orderToDirection(order) {
            if (isRTL()) {
                return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
            }
            return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
        }
        // Static
        static jQueryInterface(config) {
            return this.each(function() {
                const data = Carousel.getOrCreateInstance(this, config);
                if (typeof config === "number") {
                    data.to(config);
                    return;
                }
                if (typeof config === "string") {
                    if (data[config] === undefined || config.startsWith("_") || config === "constructor") {
                        throw new TypeError(`No method named "${config}"`);
                    }
                    data[config]();
                }
            });
        }
    }
    /**
   * Data API implementation
   */    EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function(event) {
        const target = SelectorEngine.getElementFromSelector(this);
        if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
            return;
        }
        event.preventDefault();
        const carousel = Carousel.getOrCreateInstance(target);
        const slideIndex = this.getAttribute("data-bs-slide-to");
        if (slideIndex) {
            carousel.to(slideIndex);
            carousel._maybeEnableCycle();
            return;
        }
        if (Manipulator.getDataAttribute(this, "slide") === "next") {
            carousel.next();
            carousel._maybeEnableCycle();
            return;
        }
        carousel.prev();
        carousel._maybeEnableCycle();
    });
    EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
        const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
        for (const carousel of carousels) {
            Carousel.getOrCreateInstance(carousel);
        }
    });
    /**
   * jQuery
   */    defineJQueryPlugin(Carousel);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap collapse.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$b = "collapse";
    const DATA_KEY$7 = "bs.collapse";
    const EVENT_KEY$7 = `.${DATA_KEY$7}`;
    const DATA_API_KEY$4 = ".data-api";
    const EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
    const EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
    const EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
    const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
    const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
    const CLASS_NAME_SHOW$7 = "show";
    const CLASS_NAME_COLLAPSE = "collapse";
    const CLASS_NAME_COLLAPSING = "collapsing";
    const CLASS_NAME_COLLAPSED = "collapsed";
    const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
    const CLASS_NAME_HORIZONTAL = "collapse-horizontal";
    const WIDTH = "width";
    const HEIGHT = "height";
    const SELECTOR_ACTIVES = ".collapse.show, .collapse.collapsing";
    const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
    const Default$a = {
        parent: null,
        toggle: true
    };
    const DefaultType$a = {
        parent: "(null|element)",
        toggle: "boolean"
    };
    /**
   * Class definition
   */    class Collapse extends BaseComponent {
        constructor(element, config) {
            super(element, config);
            this._isTransitioning = false;
            this._triggerArray = [];
            const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
            for (const elem of toggleList) {
                const selector = SelectorEngine.getSelectorFromElement(elem);
                const filterElement = SelectorEngine.find(selector).filter(foundElement => foundElement === this._element);
                if (selector !== null && filterElement.length) {
                    this._triggerArray.push(elem);
                }
            }
            this._initializeChildren();
            if (!this._config.parent) {
                this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
            }
            if (this._config.toggle) {
                this.toggle();
            }
        }
        // Getters
        static get Default() {
            return Default$a;
        }
        static get DefaultType() {
            return DefaultType$a;
        }
        static get NAME() {
            return NAME$b;
        }
        // Public
        toggle() {
            if (this._isShown()) {
                this.hide();
            } else {
                this.show();
            }
        }
        show() {
            if (this._isTransitioning || this._isShown()) {
                return;
            }
            let activeChildren = [];
            // find active children
                        if (this._config.parent) {
                activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter(element => element !== this._element).map(element => Collapse.getOrCreateInstance(element, {
                    toggle: false
                }));
            }
            if (activeChildren.length && activeChildren[0]._isTransitioning) {
                return;
            }
            const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
            if (startEvent.defaultPrevented) {
                return;
            }
            for (const activeInstance of activeChildren) {
                activeInstance.hide();
            }
            const dimension = this._getDimension();
            this._element.classList.remove(CLASS_NAME_COLLAPSE);
            this._element.classList.add(CLASS_NAME_COLLAPSING);
            this._element.style[dimension] = 0;
            this._addAriaAndCollapsedClass(this._triggerArray, true);
            this._isTransitioning = true;
            const complete = () => {
                this._isTransitioning = false;
                this._element.classList.remove(CLASS_NAME_COLLAPSING);
                this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
                this._element.style[dimension] = "";
                EventHandler.trigger(this._element, EVENT_SHOWN$6);
            };
            const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
            const scrollSize = `scroll${capitalizedDimension}`;
            this._queueCallback(complete, this._element, true);
            this._element.style[dimension] = `${this._element[scrollSize]}px`;
        }
        hide() {
            if (this._isTransitioning || !this._isShown()) {
                return;
            }
            const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
            if (startEvent.defaultPrevented) {
                return;
            }
            const dimension = this._getDimension();
            this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
            reflow(this._element);
            this._element.classList.add(CLASS_NAME_COLLAPSING);
            this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
            for (const trigger of this._triggerArray) {
                const element = SelectorEngine.getElementFromSelector(trigger);
                if (element && !this._isShown(element)) {
                    this._addAriaAndCollapsedClass([ trigger ], false);
                }
            }
            this._isTransitioning = true;
            const complete = () => {
                this._isTransitioning = false;
                this._element.classList.remove(CLASS_NAME_COLLAPSING);
                this._element.classList.add(CLASS_NAME_COLLAPSE);
                EventHandler.trigger(this._element, EVENT_HIDDEN$6);
            };
            this._element.style[dimension] = "";
            this._queueCallback(complete, this._element, true);
        }
        _isShown(element = this._element) {
            return element.classList.contains(CLASS_NAME_SHOW$7);
        }
        // Private
        _configAfterMerge(config) {
            config.toggle = Boolean(config.toggle);
 // Coerce string values
                        config.parent = getElement(config.parent);
            return config;
        }
        _getDimension() {
            return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
        }
        _initializeChildren() {
            if (!this._config.parent) {
                return;
            }
            const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
            for (const element of children) {
                const selected = SelectorEngine.getElementFromSelector(element);
                if (selected) {
                    this._addAriaAndCollapsedClass([ element ], this._isShown(selected));
                }
            }
        }
        _getFirstLevelChildren(selector) {
            const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
            // remove children if greater depth
                        return SelectorEngine.find(selector, this._config.parent).filter(element => !children.includes(element));
        }
        _addAriaAndCollapsedClass(triggerArray, isOpen) {
            if (!triggerArray.length) {
                return;
            }
            for (const element of triggerArray) {
                element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
                element.setAttribute("aria-expanded", isOpen);
            }
        }
        // Static
        static jQueryInterface(config) {
            const _config = {};
            if (typeof config === "string" && /show|hide/.test(config)) {
                _config.toggle = false;
            }
            return this.each(function() {
                const data = Collapse.getOrCreateInstance(this, _config);
                if (typeof config === "string") {
                    if (typeof data[config] === "undefined") {
                        throw new TypeError(`No method named "${config}"`);
                    }
                    data[config]();
                }
            });
        }
    }
    /**
   * Data API implementation
   */    EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function(event) {
        // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
        if (event.target.tagName === "A" || event.delegateTarget && event.delegateTarget.tagName === "A") {
            event.preventDefault();
        }
        for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
            Collapse.getOrCreateInstance(element, {
                toggle: false
            }).toggle();
        }
    });
    /**
   * jQuery
   */    defineJQueryPlugin(Collapse);
    var top = "top";
    var bottom = "bottom";
    var right = "right";
    var left = "left";
    var auto = "auto";
    var basePlacements = [ top, bottom, right, left ];
    var start = "start";
    var end = "end";
    var clippingParents = "clippingParents";
    var viewport = "viewport";
    var popper = "popper";
    var reference = "reference";
    var variationPlacements =  basePlacements.reduce(function(acc, placement) {
        return acc.concat([ placement + "-" + start, placement + "-" + end ]);
    }, []);
    var placements =  [].concat(basePlacements, [ auto ]).reduce(function(acc, placement) {
        return acc.concat([ placement, placement + "-" + start, placement + "-" + end ]);
    }, []);
 // modifiers that need to read the DOM
        var beforeRead = "beforeRead";
    var read = "read";
    var afterRead = "afterRead";
 // pure-logic modifiers
        var beforeMain = "beforeMain";
    var main = "main";
    var afterMain = "afterMain";
 // modifier with the purpose to write to the DOM (or write into a framework state)
        var beforeWrite = "beforeWrite";
    var write = "write";
    var afterWrite = "afterWrite";
    var modifierPhases = [ beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite ];
    function getNodeName(element) {
        return element ? (element.nodeName || "").toLowerCase() : null;
    }
    function getWindow(node) {
        if (node == null) {
            return window;
        }
        if (node.toString() !== "[object Window]") {
            var ownerDocument = node.ownerDocument;
            return ownerDocument ? ownerDocument.defaultView || window : window;
        }
        return node;
    }
    function isElement(node) {
        var OwnElement = getWindow(node).Element;
        return node instanceof OwnElement || node instanceof Element;
    }
    function isHTMLElement(node) {
        var OwnElement = getWindow(node).HTMLElement;
        return node instanceof OwnElement || node instanceof HTMLElement;
    }
    function isShadowRoot(node) {
        // IE 11 has no ShadowRoot
        if (typeof ShadowRoot === "undefined") {
            return false;
        }
        var OwnElement = getWindow(node).ShadowRoot;
        return node instanceof OwnElement || node instanceof ShadowRoot;
    }
    // and applies them to the HTMLElements such as popper and arrow
        function applyStyles(_ref) {
        var state = _ref.state;
        Object.keys(state.elements).forEach(function(name) {
            var style = state.styles[name] || {};
            var attributes = state.attributes[name] || {};
            var element = state.elements[name];
 // arrow is optional + virtual elements
                        if (!isHTMLElement(element) || !getNodeName(element)) {
                return;
            }
 // Flow doesn't support to extend this property, but it's the most
            // effective way to apply styles to an HTMLElement
            // $FlowFixMe[cannot-write]
                        Object.assign(element.style, style);
            Object.keys(attributes).forEach(function(name) {
                var value = attributes[name];
                if (value === false) {
                    element.removeAttribute(name);
                } else {
                    element.setAttribute(name, value === true ? "" : value);
                }
            });
        });
    }
    function effect$2(_ref2) {
        var state = _ref2.state;
        var initialStyles = {
            popper: {
                position: state.options.strategy,
                left: "0",
                top: "0",
                margin: "0"
            },
            arrow: {
                position: "absolute"
            },
            reference: {}
        };
        Object.assign(state.elements.popper.style, initialStyles.popper);
        state.styles = initialStyles;
        if (state.elements.arrow) {
            Object.assign(state.elements.arrow.style, initialStyles.arrow);
        }
        return function() {
            Object.keys(state.elements).forEach(function(name) {
                var element = state.elements[name];
                var attributes = state.attributes[name] || {};
                var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
 // Set all values to an empty string to unset them
                                var style = styleProperties.reduce(function(style, property) {
                    style[property] = "";
                    return style;
                }, {});
 // arrow is optional + virtual elements
                                if (!isHTMLElement(element) || !getNodeName(element)) {
                    return;
                }
                Object.assign(element.style, style);
                Object.keys(attributes).forEach(function(attribute) {
                    element.removeAttribute(attribute);
                });
            });
        };
    }
 // eslint-disable-next-line import/no-unused-modules
        const applyStyles$1 = {
        name: "applyStyles",
        enabled: true,
        phase: "write",
        fn: applyStyles,
        effect: effect$2,
        requires: [ "computeStyles" ]
    };
    function getBasePlacement(placement) {
        return placement.split("-")[0];
    }
    var max = Math.max;
    var min = Math.min;
    var round = Math.round;
    function getUAString() {
        var uaData = navigator.userAgentData;
        if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
            return uaData.brands.map(function(item) {
                return item.brand + "/" + item.version;
            }).join(" ");
        }
        return navigator.userAgent;
    }
    function isLayoutViewport() {
        return !/^((?!chrome|android).)*safari/i.test(getUAString());
    }
    function getBoundingClientRect(element, includeScale, isFixedStrategy) {
        if (includeScale === void 0) {
            includeScale = false;
        }
        if (isFixedStrategy === void 0) {
            isFixedStrategy = false;
        }
        var clientRect = element.getBoundingClientRect();
        var scaleX = 1;
        var scaleY = 1;
        if (includeScale && isHTMLElement(element)) {
            scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
            scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
        }
        var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
        var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
        var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
        var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
        var width = clientRect.width / scaleX;
        var height = clientRect.height / scaleY;
        return {
            width: width,
            height: height,
            top: y,
            right: x + width,
            bottom: y + height,
            left: x,
            x: x,
            y: y
        };
    }
    // means it doesn't take into account transforms.
        function getLayoutRect(element) {
        var clientRect = getBoundingClientRect(element);
 // Use the clientRect sizes if it's not been transformed.
        // Fixes https://github.com/popperjs/popper-core/issues/1223
                var width = element.offsetWidth;
        var height = element.offsetHeight;
        if (Math.abs(clientRect.width - width) <= 1) {
            width = clientRect.width;
        }
        if (Math.abs(clientRect.height - height) <= 1) {
            height = clientRect.height;
        }
        return {
            x: element.offsetLeft,
            y: element.offsetTop,
            width: width,
            height: height
        };
    }
    function contains(parent, child) {
        var rootNode = child.getRootNode && child.getRootNode();
 // First, attempt with faster native method
                if (parent.contains(child)) {
            return true;
        } // then fallback to custom implementation with Shadow DOM support
         else if (rootNode && isShadowRoot(rootNode)) {
            var next = child;
            do {
                if (next && parent.isSameNode(next)) {
                    return true;
                }
 // $FlowFixMe[prop-missing]: need a better way to handle this...
                                next = next.parentNode || next.host;
            } while (next);
        }
 // Give up, the result is false
                return false;
    }
    function getComputedStyle$1(element) {
        return getWindow(element).getComputedStyle(element);
    }
    function isTableElement(element) {
        return [ "table", "td", "th" ].indexOf(getNodeName(element)) >= 0;
    }
    function getDocumentElement(element) {
        // $FlowFixMe[incompatible-return]: assume body is always available
        return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
        element.document) || window.document).documentElement;
    }
    function getParentNode(element) {
        if (getNodeName(element) === "html") {
            return element;
        }
        // this is a quicker (but less type safe) way to save quite some bytes from the bundle
        // $FlowFixMe[incompatible-return]
        // $FlowFixMe[prop-missing]
        return element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
        element.parentNode || (// DOM Element detected
        isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
        // $FlowFixMe[incompatible-call]: HTMLElement is a Node
        getDocumentElement(element);
    }
    function getTrueOffsetParent(element) {
        if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
        getComputedStyle$1(element).position === "fixed") {
            return null;
        }
        return element.offsetParent;
    }
 // `.offsetParent` reports `null` for fixed elements, while absolute elements
    // return the containing block
        function getContainingBlock(element) {
        var isFirefox = /firefox/i.test(getUAString());
        var isIE = /Trident/i.test(getUAString());
        if (isIE && isHTMLElement(element)) {
            // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
            var elementCss = getComputedStyle$1(element);
            if (elementCss.position === "fixed") {
                return null;
            }
        }
        var currentNode = getParentNode(element);
        if (isShadowRoot(currentNode)) {
            currentNode = currentNode.host;
        }
        while (isHTMLElement(currentNode) && [ "html", "body" ].indexOf(getNodeName(currentNode)) < 0) {
            var css = getComputedStyle$1(currentNode);
 // This is non-exhaustive but covers the most common CSS properties that
            // create a containing block.
            // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
                        if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || [ "transform", "perspective" ].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
                return currentNode;
            } else {
                currentNode = currentNode.parentNode;
            }
        }
        return null;
    }
 // Gets the closest ancestor positioned element. Handles some edge cases,
    // such as table ancestors and cross browser bugs.
        function getOffsetParent(element) {
        var window = getWindow(element);
        var offsetParent = getTrueOffsetParent(element);
        while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === "static") {
            offsetParent = getTrueOffsetParent(offsetParent);
        }
        if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle$1(offsetParent).position === "static")) {
            return window;
        }
        return offsetParent || getContainingBlock(element) || window;
    }
    function getMainAxisFromPlacement(placement) {
        return [ "top", "bottom" ].indexOf(placement) >= 0 ? "x" : "y";
    }
    function within(min$1, value, max$1) {
        return max(min$1, min(value, max$1));
    }
    function withinMaxClamp(min, value, max) {
        var v = within(min, value, max);
        return v > max ? max : v;
    }
    function getFreshSideObject() {
        return {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };
    }
    function mergePaddingObject(paddingObject) {
        return Object.assign({}, getFreshSideObject(), paddingObject);
    }
    function expandToHashMap(value, keys) {
        return keys.reduce(function(hashMap, key) {
            hashMap[key] = value;
            return hashMap;
        }, {});
    }
    var toPaddingObject = function toPaddingObject(padding, state) {
        padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
            placement: state.placement
        })) : padding;
        return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
    };
    function arrow(_ref) {
        var _state$modifiersData$;
        var state = _ref.state, name = _ref.name, options = _ref.options;
        var arrowElement = state.elements.arrow;
        var popperOffsets = state.modifiersData.popperOffsets;
        var basePlacement = getBasePlacement(state.placement);
        var axis = getMainAxisFromPlacement(basePlacement);
        var isVertical = [ left, right ].indexOf(basePlacement) >= 0;
        var len = isVertical ? "height" : "width";
        if (!arrowElement || !popperOffsets) {
            return;
        }
        var paddingObject = toPaddingObject(options.padding, state);
        var arrowRect = getLayoutRect(arrowElement);
        var minProp = axis === "y" ? top : left;
        var maxProp = axis === "y" ? bottom : right;
        var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
        var startDiff = popperOffsets[axis] - state.rects.reference[axis];
        var arrowOffsetParent = getOffsetParent(arrowElement);
        var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
        var centerToReference = endDiff / 2 - startDiff / 2;
 // Make sure the arrow doesn't overflow the popper if the center point is
        // outside of the popper bounds
                var min = paddingObject[minProp];
        var max = clientSize - arrowRect[len] - paddingObject[maxProp];
        var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
        var offset = within(min, center, max);
 // Prevents breaking syntax highlighting...
                var axisProp = axis;
        state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, 
        _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
    }
    function effect$1(_ref2) {
        var state = _ref2.state, options = _ref2.options;
        var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
        if (arrowElement == null) {
            return;
        }
 // CSS selector
                if (typeof arrowElement === "string") {
            arrowElement = state.elements.popper.querySelector(arrowElement);
            if (!arrowElement) {
                return;
            }
        }
        if (!contains(state.elements.popper, arrowElement)) {
            return;
        }
        state.elements.arrow = arrowElement;
    }
 // eslint-disable-next-line import/no-unused-modules
        const arrow$1 = {
        name: "arrow",
        enabled: true,
        phase: "main",
        fn: arrow,
        effect: effect$1,
        requires: [ "popperOffsets" ],
        requiresIfExists: [ "preventOverflow" ]
    };
    function getVariation(placement) {
        return placement.split("-")[1];
    }
    var unsetSides = {
        top: "auto",
        right: "auto",
        bottom: "auto",
        left: "auto"
    };
 // Round the offsets to the nearest suitable subpixel based on the DPR.
    // Zooming can change the DPR, but it seems to report a value that will
    // cleanly divide the values into the appropriate subpixels.
        function roundOffsetsByDPR(_ref, win) {
        var x = _ref.x, y = _ref.y;
        var dpr = win.devicePixelRatio || 1;
        return {
            x: round(x * dpr) / dpr || 0,
            y: round(y * dpr) / dpr || 0
        };
    }
    function mapToStyles(_ref2) {
        var _Object$assign2;
        var popper = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
        var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
        var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
            x: x,
            y: y
        }) : {
            x: x,
            y: y
        };
        x = _ref3.x;
        y = _ref3.y;
        var hasX = offsets.hasOwnProperty("x");
        var hasY = offsets.hasOwnProperty("y");
        var sideX = left;
        var sideY = top;
        var win = window;
        if (adaptive) {
            var offsetParent = getOffsetParent(popper);
            var heightProp = "clientHeight";
            var widthProp = "clientWidth";
            if (offsetParent === getWindow(popper)) {
                offsetParent = getDocumentElement(popper);
                if (getComputedStyle$1(offsetParent).position !== "static" && position === "absolute") {
                    heightProp = "scrollHeight";
                    widthProp = "scrollWidth";
                }
            }
 // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it
                        offsetParent = offsetParent;
            if (placement === top || (placement === left || placement === right) && variation === end) {
                sideY = bottom;
                var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
                offsetParent[heightProp];
                y -= offsetY - popperRect.height;
                y *= gpuAcceleration ? 1 : -1;
            }
            if (placement === left || (placement === top || placement === bottom) && variation === end) {
                sideX = right;
                var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
                offsetParent[widthProp];
                x -= offsetX - popperRect.width;
                x *= gpuAcceleration ? 1 : -1;
            }
        }
        var commonStyles = Object.assign({
            position: position
        }, adaptive && unsetSides);
        var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
            x: x,
            y: y
        }, getWindow(popper)) : {
            x: x,
            y: y
        };
        x = _ref4.x;
        y = _ref4.y;
        if (gpuAcceleration) {
            var _Object$assign;
            return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", 
            _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", 
            _Object$assign));
        }
        return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", 
        _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
    }
    function computeStyles(_ref5) {
        var state = _ref5.state, options = _ref5.options;
        var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
        var commonStyles = {
            placement: getBasePlacement(state.placement),
            variation: getVariation(state.placement),
            popper: state.elements.popper,
            popperRect: state.rects.popper,
            gpuAcceleration: gpuAcceleration,
            isFixed: state.options.strategy === "fixed"
        };
        if (state.modifiersData.popperOffsets != null) {
            state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
                offsets: state.modifiersData.popperOffsets,
                position: state.options.strategy,
                adaptive: adaptive,
                roundOffsets: roundOffsets
            })));
        }
        if (state.modifiersData.arrow != null) {
            state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
                offsets: state.modifiersData.arrow,
                position: "absolute",
                adaptive: false,
                roundOffsets: roundOffsets
            })));
        }
        state.attributes.popper = Object.assign({}, state.attributes.popper, {
            "data-popper-placement": state.placement
        });
    }
 // eslint-disable-next-line import/no-unused-modules
        const computeStyles$1 = {
        name: "computeStyles",
        enabled: true,
        phase: "beforeWrite",
        fn: computeStyles,
        data: {}
    };
    var passive = {
        passive: true
    };
    function effect(_ref) {
        var state = _ref.state, instance = _ref.instance, options = _ref.options;
        var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
        var window = getWindow(state.elements.popper);
        var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
        if (scroll) {
            scrollParents.forEach(function(scrollParent) {
                scrollParent.addEventListener("scroll", instance.update, passive);
            });
        }
        if (resize) {
            window.addEventListener("resize", instance.update, passive);
        }
        return function() {
            if (scroll) {
                scrollParents.forEach(function(scrollParent) {
                    scrollParent.removeEventListener("scroll", instance.update, passive);
                });
            }
            if (resize) {
                window.removeEventListener("resize", instance.update, passive);
            }
        };
    }
 // eslint-disable-next-line import/no-unused-modules
        const eventListeners = {
        name: "eventListeners",
        enabled: true,
        phase: "write",
        fn: function fn() {},
        effect: effect,
        data: {}
    };
    var hash$1 = {
        left: "right",
        right: "left",
        bottom: "top",
        top: "bottom"
    };
    function getOppositePlacement(placement) {
        return placement.replace(/left|right|bottom|top/g, function(matched) {
            return hash$1[matched];
        });
    }
    var hash = {
        start: "end",
        end: "start"
    };
    function getOppositeVariationPlacement(placement) {
        return placement.replace(/start|end/g, function(matched) {
            return hash[matched];
        });
    }
    function getWindowScroll(node) {
        var win = getWindow(node);
        var scrollLeft = win.pageXOffset;
        var scrollTop = win.pageYOffset;
        return {
            scrollLeft: scrollLeft,
            scrollTop: scrollTop
        };
    }
    function getWindowScrollBarX(element) {
        // If <html> has a CSS width greater than the viewport, then this will be
        // incorrect for RTL.
        // Popper 1 is broken in this case and never had a bug report so let's assume
        // it's not an issue. I don't think anyone ever specifies width on <html>
        // anyway.
        // Browsers where the left scrollbar doesn't cause an issue report `0` for
        // this (e.g. Edge 2019, IE11, Safari)
        return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
    }
    function getViewportRect(element, strategy) {
        var win = getWindow(element);
        var html = getDocumentElement(element);
        var visualViewport = win.visualViewport;
        var width = html.clientWidth;
        var height = html.clientHeight;
        var x = 0;
        var y = 0;
        if (visualViewport) {
            width = visualViewport.width;
            height = visualViewport.height;
            var layoutViewport = isLayoutViewport();
            if (layoutViewport || !layoutViewport && strategy === "fixed") {
                x = visualViewport.offsetLeft;
                y = visualViewport.offsetTop;
            }
        }
        return {
            width: width,
            height: height,
            x: x + getWindowScrollBarX(element),
            y: y
        };
    }
    // of the `<html>` and `<body>` rect bounds if horizontally scrollable
        function getDocumentRect(element) {
        var _element$ownerDocumen;
        var html = getDocumentElement(element);
        var winScroll = getWindowScroll(element);
        var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
        var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
        var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
        var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
        var y = -winScroll.scrollTop;
        if (getComputedStyle$1(body || html).direction === "rtl") {
            x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
        }
        return {
            width: width,
            height: height,
            x: x,
            y: y
        };
    }
    function isScrollParent(element) {
        // Firefox wants us to check `-x` and `-y` variations as well
        var _getComputedStyle = getComputedStyle$1(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
        return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
    }
    function getScrollParent(node) {
        if ([ "html", "body", "#document" ].indexOf(getNodeName(node)) >= 0) {
            // $FlowFixMe[incompatible-return]: assume body is always available
            return node.ownerDocument.body;
        }
        if (isHTMLElement(node) && isScrollParent(node)) {
            return node;
        }
        return getScrollParent(getParentNode(node));
    }
    /*
  given a DOM element, return the list of all scroll parents, up the list of ancesors
  until we get to the top window object. This list is what we attach scroll listeners
  to, because if any of these parent elements scroll, we'll need to re-calculate the
  reference element's position.
  */    function listScrollParents(element, list) {
        var _element$ownerDocumen;
        if (list === void 0) {
            list = [];
        }
        var scrollParent = getScrollParent(element);
        var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
        var win = getWindow(scrollParent);
        var target = isBody ? [ win ].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
        var updatedList = list.concat(target);
        return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
        updatedList.concat(listScrollParents(getParentNode(target)));
    }
    function rectToClientRect(rect) {
        return Object.assign({}, rect, {
            left: rect.x,
            top: rect.y,
            right: rect.x + rect.width,
            bottom: rect.y + rect.height
        });
    }
    function getInnerBoundingClientRect(element, strategy) {
        var rect = getBoundingClientRect(element, false, strategy === "fixed");
        rect.top = rect.top + element.clientTop;
        rect.left = rect.left + element.clientLeft;
        rect.bottom = rect.top + element.clientHeight;
        rect.right = rect.left + element.clientWidth;
        rect.width = element.clientWidth;
        rect.height = element.clientHeight;
        rect.x = rect.left;
        rect.y = rect.top;
        return rect;
    }
    function getClientRectFromMixedType(element, clippingParent, strategy) {
        return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
    }
 // A "clipping parent" is an overflowable container with the characteristic of
    // clipping (or hiding) overflowing elements with a position different from
    // `initial`
        function getClippingParents(element) {
        var clippingParents = listScrollParents(getParentNode(element));
        var canEscapeClipping = [ "absolute", "fixed" ].indexOf(getComputedStyle$1(element).position) >= 0;
        var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
        if (!isElement(clipperElement)) {
            return [];
        }
 // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414
                return clippingParents.filter(function(clippingParent) {
            return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
        });
    }
 // Gets the maximum area that the element is visible in due to any number of
    // clipping parents
        function getClippingRect(element, boundary, rootBoundary, strategy) {
        var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
        var clippingParents = [].concat(mainClippingParents, [ rootBoundary ]);
        var firstClippingParent = clippingParents[0];
        var clippingRect = clippingParents.reduce(function(accRect, clippingParent) {
            var rect = getClientRectFromMixedType(element, clippingParent, strategy);
            accRect.top = max(rect.top, accRect.top);
            accRect.right = min(rect.right, accRect.right);
            accRect.bottom = min(rect.bottom, accRect.bottom);
            accRect.left = max(rect.left, accRect.left);
            return accRect;
        }, getClientRectFromMixedType(element, firstClippingParent, strategy));
        clippingRect.width = clippingRect.right - clippingRect.left;
        clippingRect.height = clippingRect.bottom - clippingRect.top;
        clippingRect.x = clippingRect.left;
        clippingRect.y = clippingRect.top;
        return clippingRect;
    }
    function computeOffsets(_ref) {
        var reference = _ref.reference, element = _ref.element, placement = _ref.placement;
        var basePlacement = placement ? getBasePlacement(placement) : null;
        var variation = placement ? getVariation(placement) : null;
        var commonX = reference.x + reference.width / 2 - element.width / 2;
        var commonY = reference.y + reference.height / 2 - element.height / 2;
        var offsets;
        switch (basePlacement) {
          case top:
            offsets = {
                x: commonX,
                y: reference.y - element.height
            };
            break;

          case bottom:
            offsets = {
                x: commonX,
                y: reference.y + reference.height
            };
            break;

          case right:
            offsets = {
                x: reference.x + reference.width,
                y: commonY
            };
            break;

          case left:
            offsets = {
                x: reference.x - element.width,
                y: commonY
            };
            break;

          default:
            offsets = {
                x: reference.x,
                y: reference.y
            };
        }
        var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
        if (mainAxis != null) {
            var len = mainAxis === "y" ? "height" : "width";
            switch (variation) {
              case start:
                offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
                break;

              case end:
                offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
                break;
            }
        }
        return offsets;
    }
    function detectOverflow(state, options) {
        if (options === void 0) {
            options = {};
        }
        var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
        var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
        var altContext = elementContext === popper ? reference : popper;
        var popperRect = state.rects.popper;
        var element = state.elements[altBoundary ? altContext : elementContext];
        var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
        var referenceClientRect = getBoundingClientRect(state.elements.reference);
        var popperOffsets = computeOffsets({
            reference: referenceClientRect,
            element: popperRect,
            strategy: "absolute",
            placement: placement
        });
        var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
        var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
 // positive = overflowing the clipping rect
        // 0 or negative = within the clipping rect
                var overflowOffsets = {
            top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
            bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
            left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
            right: elementClientRect.right - clippingClientRect.right + paddingObject.right
        };
        var offsetData = state.modifiersData.offset;
 // Offsets can be applied only to the popper element
                if (elementContext === popper && offsetData) {
            var offset = offsetData[placement];
            Object.keys(overflowOffsets).forEach(function(key) {
                var multiply = [ right, bottom ].indexOf(key) >= 0 ? 1 : -1;
                var axis = [ top, bottom ].indexOf(key) >= 0 ? "y" : "x";
                overflowOffsets[key] += offset[axis] * multiply;
            });
        }
        return overflowOffsets;
    }
    function computeAutoPlacement(state, options) {
        if (options === void 0) {
            options = {};
        }
        var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
        var variation = getVariation(placement);
        var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement) {
            return getVariation(placement) === variation;
        }) : basePlacements;
        var allowedPlacements = placements$1.filter(function(placement) {
            return allowedAutoPlacements.indexOf(placement) >= 0;
        });
        if (allowedPlacements.length === 0) {
            allowedPlacements = placements$1;
        }
 // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...
                var overflows = allowedPlacements.reduce(function(acc, placement) {
            acc[placement] = detectOverflow(state, {
                placement: placement,
                boundary: boundary,
                rootBoundary: rootBoundary,
                padding: padding
            })[getBasePlacement(placement)];
            return acc;
        }, {});
        return Object.keys(overflows).sort(function(a, b) {
            return overflows[a] - overflows[b];
        });
    }
    function getExpandedFallbackPlacements(placement) {
        if (getBasePlacement(placement) === auto) {
            return [];
        }
        var oppositePlacement = getOppositePlacement(placement);
        return [ getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement) ];
    }
    function flip(_ref) {
        var state = _ref.state, options = _ref.options, name = _ref.name;
        if (state.modifiersData[name]._skip) {
            return;
        }
        var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
        var preferredPlacement = state.options.placement;
        var basePlacement = getBasePlacement(preferredPlacement);
        var isBasePlacement = basePlacement === preferredPlacement;
        var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [ getOppositePlacement(preferredPlacement) ] : getExpandedFallbackPlacements(preferredPlacement));
        var placements = [ preferredPlacement ].concat(fallbackPlacements).reduce(function(acc, placement) {
            return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
                placement: placement,
                boundary: boundary,
                rootBoundary: rootBoundary,
                padding: padding,
                flipVariations: flipVariations,
                allowedAutoPlacements: allowedAutoPlacements
            }) : placement);
        }, []);
        var referenceRect = state.rects.reference;
        var popperRect = state.rects.popper;
        var checksMap = new Map;
        var makeFallbackChecks = true;
        var firstFittingPlacement = placements[0];
        for (var i = 0; i < placements.length; i++) {
            var placement = placements[i];
            var _basePlacement = getBasePlacement(placement);
            var isStartVariation = getVariation(placement) === start;
            var isVertical = [ top, bottom ].indexOf(_basePlacement) >= 0;
            var len = isVertical ? "width" : "height";
            var overflow = detectOverflow(state, {
                placement: placement,
                boundary: boundary,
                rootBoundary: rootBoundary,
                altBoundary: altBoundary,
                padding: padding
            });
            var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
            if (referenceRect[len] > popperRect[len]) {
                mainVariationSide = getOppositePlacement(mainVariationSide);
            }
            var altVariationSide = getOppositePlacement(mainVariationSide);
            var checks = [];
            if (checkMainAxis) {
                checks.push(overflow[_basePlacement] <= 0);
            }
            if (checkAltAxis) {
                checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
            }
            if (checks.every(function(check) {
                return check;
            })) {
                firstFittingPlacement = placement;
                makeFallbackChecks = false;
                break;
            }
            checksMap.set(placement, checks);
        }
        if (makeFallbackChecks) {
            // `2` may be desired in some cases – research later
            var numberOfChecks = flipVariations ? 3 : 1;
            var _loop = function _loop(_i) {
                var fittingPlacement = placements.find(function(placement) {
                    var checks = checksMap.get(placement);
                    if (checks) {
                        return checks.slice(0, _i).every(function(check) {
                            return check;
                        });
                    }
                });
                if (fittingPlacement) {
                    firstFittingPlacement = fittingPlacement;
                    return "break";
                }
            };
            for (var _i = numberOfChecks; _i > 0; _i--) {
                var _ret = _loop(_i);
                if (_ret === "break") break;
            }
        }
        if (state.placement !== firstFittingPlacement) {
            state.modifiersData[name]._skip = true;
            state.placement = firstFittingPlacement;
            state.reset = true;
        }
    }
 // eslint-disable-next-line import/no-unused-modules
        const flip$1 = {
        name: "flip",
        enabled: true,
        phase: "main",
        fn: flip,
        requiresIfExists: [ "offset" ],
        data: {
            _skip: false
        }
    };
    function getSideOffsets(overflow, rect, preventedOffsets) {
        if (preventedOffsets === void 0) {
            preventedOffsets = {
                x: 0,
                y: 0
            };
        }
        return {
            top: overflow.top - rect.height - preventedOffsets.y,
            right: overflow.right - rect.width + preventedOffsets.x,
            bottom: overflow.bottom - rect.height + preventedOffsets.y,
            left: overflow.left - rect.width - preventedOffsets.x
        };
    }
    function isAnySideFullyClipped(overflow) {
        return [ top, right, bottom, left ].some(function(side) {
            return overflow[side] >= 0;
        });
    }
    function hide(_ref) {
        var state = _ref.state, name = _ref.name;
        var referenceRect = state.rects.reference;
        var popperRect = state.rects.popper;
        var preventedOffsets = state.modifiersData.preventOverflow;
        var referenceOverflow = detectOverflow(state, {
            elementContext: "reference"
        });
        var popperAltOverflow = detectOverflow(state, {
            altBoundary: true
        });
        var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
        var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
        var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
        var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
        state.modifiersData[name] = {
            referenceClippingOffsets: referenceClippingOffsets,
            popperEscapeOffsets: popperEscapeOffsets,
            isReferenceHidden: isReferenceHidden,
            hasPopperEscaped: hasPopperEscaped
        };
        state.attributes.popper = Object.assign({}, state.attributes.popper, {
            "data-popper-reference-hidden": isReferenceHidden,
            "data-popper-escaped": hasPopperEscaped
        });
    }
 // eslint-disable-next-line import/no-unused-modules
        const hide$1 = {
        name: "hide",
        enabled: true,
        phase: "main",
        requiresIfExists: [ "preventOverflow" ],
        fn: hide
    };
    function distanceAndSkiddingToXY(placement, rects, offset) {
        var basePlacement = getBasePlacement(placement);
        var invertDistance = [ left, top ].indexOf(basePlacement) >= 0 ? -1 : 1;
        var _ref = typeof offset === "function" ? offset(Object.assign({}, rects, {
            placement: placement
        })) : offset, skidding = _ref[0], distance = _ref[1];
        skidding = skidding || 0;
        distance = (distance || 0) * invertDistance;
        return [ left, right ].indexOf(basePlacement) >= 0 ? {
            x: distance,
            y: skidding
        } : {
            x: skidding,
            y: distance
        };
    }
    function offset(_ref2) {
        var state = _ref2.state, options = _ref2.options, name = _ref2.name;
        var _options$offset = options.offset, offset = _options$offset === void 0 ? [ 0, 0 ] : _options$offset;
        var data = placements.reduce(function(acc, placement) {
            acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
            return acc;
        }, {});
        var _data$state$placement = data[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
        if (state.modifiersData.popperOffsets != null) {
            state.modifiersData.popperOffsets.x += x;
            state.modifiersData.popperOffsets.y += y;
        }
        state.modifiersData[name] = data;
    }
 // eslint-disable-next-line import/no-unused-modules
        const offset$1 = {
        name: "offset",
        enabled: true,
        phase: "main",
        requires: [ "popperOffsets" ],
        fn: offset
    };
    function popperOffsets(_ref) {
        var state = _ref.state, name = _ref.name;
        // Offsets are the actual position the popper needs to have to be
        // properly positioned near its reference element
        // This is the most basic placement, and will be adjusted by
        // the modifiers in the next step
                state.modifiersData[name] = computeOffsets({
            reference: state.rects.reference,
            element: state.rects.popper,
            strategy: "absolute",
            placement: state.placement
        });
    }
 // eslint-disable-next-line import/no-unused-modules
        const popperOffsets$1 = {
        name: "popperOffsets",
        enabled: true,
        phase: "read",
        fn: popperOffsets,
        data: {}
    };
    function getAltAxis(axis) {
        return axis === "x" ? "y" : "x";
    }
    function preventOverflow(_ref) {
        var state = _ref.state, options = _ref.options, name = _ref.name;
        var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
        var overflow = detectOverflow(state, {
            boundary: boundary,
            rootBoundary: rootBoundary,
            padding: padding,
            altBoundary: altBoundary
        });
        var basePlacement = getBasePlacement(state.placement);
        var variation = getVariation(state.placement);
        var isBasePlacement = !variation;
        var mainAxis = getMainAxisFromPlacement(basePlacement);
        var altAxis = getAltAxis(mainAxis);
        var popperOffsets = state.modifiersData.popperOffsets;
        var referenceRect = state.rects.reference;
        var popperRect = state.rects.popper;
        var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
            placement: state.placement
        })) : tetherOffset;
        var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
            mainAxis: tetherOffsetValue,
            altAxis: tetherOffsetValue
        } : Object.assign({
            mainAxis: 0,
            altAxis: 0
        }, tetherOffsetValue);
        var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
        var data = {
            x: 0,
            y: 0
        };
        if (!popperOffsets) {
            return;
        }
        if (checkMainAxis) {
            var _offsetModifierState$;
            var mainSide = mainAxis === "y" ? top : left;
            var altSide = mainAxis === "y" ? bottom : right;
            var len = mainAxis === "y" ? "height" : "width";
            var offset = popperOffsets[mainAxis];
            var min$1 = offset + overflow[mainSide];
            var max$1 = offset - overflow[altSide];
            var additive = tether ? -popperRect[len] / 2 : 0;
            var minLen = variation === start ? referenceRect[len] : popperRect[len];
            var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
 // We need to include the arrow in the calculation so the arrow doesn't go
            // outside the reference bounds
                        var arrowElement = state.elements.arrow;
            var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
                width: 0,
                height: 0
            };
            var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
            var arrowPaddingMin = arrowPaddingObject[mainSide];
            var arrowPaddingMax = arrowPaddingObject[altSide];
 // If the reference length is smaller than the arrow length, we don't want
            // to include its full size in the calculation. If the reference is small
            // and near the edge of a boundary, the popper can overflow even if the
            // reference is not overflowing as well (e.g. virtual elements with no
            // width or height)
                        var arrowLen = within(0, referenceRect[len], arrowRect[len]);
            var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
            var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
            var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
            var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
            var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
            var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
            var tetherMax = offset + maxOffset - offsetModifierValue;
            var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
            popperOffsets[mainAxis] = preventedOffset;
            data[mainAxis] = preventedOffset - offset;
        }
        if (checkAltAxis) {
            var _offsetModifierState$2;
            var _mainSide = mainAxis === "x" ? top : left;
            var _altSide = mainAxis === "x" ? bottom : right;
            var _offset = popperOffsets[altAxis];
            var _len = altAxis === "y" ? "height" : "width";
            var _min = _offset + overflow[_mainSide];
            var _max = _offset - overflow[_altSide];
            var isOriginSide = [ top, left ].indexOf(basePlacement) !== -1;
            var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
            var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
            var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
            var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
            popperOffsets[altAxis] = _preventedOffset;
            data[altAxis] = _preventedOffset - _offset;
        }
        state.modifiersData[name] = data;
    }
 // eslint-disable-next-line import/no-unused-modules
        const preventOverflow$1 = {
        name: "preventOverflow",
        enabled: true,
        phase: "main",
        fn: preventOverflow,
        requiresIfExists: [ "offset" ]
    };
    function getHTMLElementScroll(element) {
        return {
            scrollLeft: element.scrollLeft,
            scrollTop: element.scrollTop
        };
    }
    function getNodeScroll(node) {
        if (node === getWindow(node) || !isHTMLElement(node)) {
            return getWindowScroll(node);
        } else {
            return getHTMLElementScroll(node);
        }
    }
    function isElementScaled(element) {
        var rect = element.getBoundingClientRect();
        var scaleX = round(rect.width) / element.offsetWidth || 1;
        var scaleY = round(rect.height) / element.offsetHeight || 1;
        return scaleX !== 1 || scaleY !== 1;
    }
 // Returns the composite rect of an element relative to its offsetParent.
    // Composite means it takes into account transforms as well as layout.
        function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
        if (isFixed === void 0) {
            isFixed = false;
        }
        var isOffsetParentAnElement = isHTMLElement(offsetParent);
        var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
        var documentElement = getDocumentElement(offsetParent);
        var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
        var scroll = {
            scrollLeft: 0,
            scrollTop: 0
        };
        var offsets = {
            x: 0,
            y: 0
        };
        if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
            if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
            isScrollParent(documentElement)) {
                scroll = getNodeScroll(offsetParent);
            }
            if (isHTMLElement(offsetParent)) {
                offsets = getBoundingClientRect(offsetParent, true);
                offsets.x += offsetParent.clientLeft;
                offsets.y += offsetParent.clientTop;
            } else if (documentElement) {
                offsets.x = getWindowScrollBarX(documentElement);
            }
        }
        return {
            x: rect.left + scroll.scrollLeft - offsets.x,
            y: rect.top + scroll.scrollTop - offsets.y,
            width: rect.width,
            height: rect.height
        };
    }
    function order(modifiers) {
        var map = new Map;
        var visited = new Set;
        var result = [];
        modifiers.forEach(function(modifier) {
            map.set(modifier.name, modifier);
        });
 // On visiting object, check for its dependencies and visit them recursively
                function sort(modifier) {
            visited.add(modifier.name);
            var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
            requires.forEach(function(dep) {
                if (!visited.has(dep)) {
                    var depModifier = map.get(dep);
                    if (depModifier) {
                        sort(depModifier);
                    }
                }
            });
            result.push(modifier);
        }
        modifiers.forEach(function(modifier) {
            if (!visited.has(modifier.name)) {
                // check for visited object
                sort(modifier);
            }
        });
        return result;
    }
    function orderModifiers(modifiers) {
        // order based on dependencies
        var orderedModifiers = order(modifiers);
 // order based on phase
                return modifierPhases.reduce(function(acc, phase) {
            return acc.concat(orderedModifiers.filter(function(modifier) {
                return modifier.phase === phase;
            }));
        }, []);
    }
    function debounce(fn) {
        var pending;
        return function() {
            if (!pending) {
                pending = new Promise(function(resolve) {
                    Promise.resolve().then(function() {
                        pending = undefined;
                        resolve(fn());
                    });
                });
            }
            return pending;
        };
    }
    function mergeByName(modifiers) {
        var merged = modifiers.reduce(function(merged, current) {
            var existing = merged[current.name];
            merged[current.name] = existing ? Object.assign({}, existing, current, {
                options: Object.assign({}, existing.options, current.options),
                data: Object.assign({}, existing.data, current.data)
            }) : current;
            return merged;
        }, {});
 // IE11 does not support Object.values
                return Object.keys(merged).map(function(key) {
            return merged[key];
        });
    }
    var DEFAULT_OPTIONS = {
        placement: "bottom",
        modifiers: [],
        strategy: "absolute"
    };
    function areValidElements() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }
        return !args.some(function(element) {
            return !(element && typeof element.getBoundingClientRect === "function");
        });
    }
    function popperGenerator(generatorOptions) {
        if (generatorOptions === void 0) {
            generatorOptions = {};
        }
        var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
        return function createPopper(reference, popper, options) {
            if (options === void 0) {
                options = defaultOptions;
            }
            var state = {
                placement: "bottom",
                orderedModifiers: [],
                options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
                modifiersData: {},
                elements: {
                    reference: reference,
                    popper: popper
                },
                attributes: {},
                styles: {}
            };
            var effectCleanupFns = [];
            var isDestroyed = false;
            var instance = {
                state: state,
                setOptions: function setOptions(setOptionsAction) {
                    var options = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
                    cleanupModifierEffects();
                    state.options = Object.assign({}, defaultOptions, state.options, options);
                    state.scrollParents = {
                        reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
                        popper: listScrollParents(popper)
                    };
 // Orders the modifiers based on their dependencies and `phase`
                    // properties
                                        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers)));
 // Strip out disabled modifiers
                                        state.orderedModifiers = orderedModifiers.filter(function(m) {
                        return m.enabled;
                    });
                    runModifierEffects();
                    return instance.update();
                },
                // Sync update – it will always be executed, even if not necessary. This
                // is useful for low frequency updates where sync behavior simplifies the
                // logic.
                // For high frequency updates (e.g. `resize` and `scroll` events), always
                // prefer the async Popper#update method
                forceUpdate: function forceUpdate() {
                    if (isDestroyed) {
                        return;
                    }
                    var _state$elements = state.elements, reference = _state$elements.reference, popper = _state$elements.popper;
 // Don't proceed if `reference` or `popper` are not valid elements
                    // anymore
                                        if (!areValidElements(reference, popper)) {
                        return;
                    }
 // Store the reference and popper rects to be read by modifiers
                                        state.rects = {
                        reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === "fixed"),
                        popper: getLayoutRect(popper)
                    };
 // Modifiers have the ability to reset the current update cycle. The
                    // most common use case for this is the `flip` modifier changing the
                    // placement, which then needs to re-run all the modifiers, because the
                    // logic was previously ran for the previous placement and is therefore
                    // stale/incorrect
                                        state.reset = false;
                    state.placement = state.options.placement;
 // On each update cycle, the `modifiersData` property for each modifier
                    // is filled with the initial data specified by the modifier. This means
                    // it doesn't persist and is fresh on each update.
                    // To ensure persistent data, use `${name}#persistent`
                                        state.orderedModifiers.forEach(function(modifier) {
                        return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
                    });
                    for (var index = 0; index < state.orderedModifiers.length; index++) {
                        if (state.reset === true) {
                            state.reset = false;
                            index = -1;
                            continue;
                        }
                        var _state$orderedModifie = state.orderedModifiers[index], fn = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
                        if (typeof fn === "function") {
                            state = fn({
                                state: state,
                                options: _options,
                                name: name,
                                instance: instance
                            }) || state;
                        }
                    }
                },
                // Async and optimistically optimized update – it will not be executed if
                // not necessary (debounced to run at most once-per-tick)
                update: debounce(function() {
                    return new Promise(function(resolve) {
                        instance.forceUpdate();
                        resolve(state);
                    });
                }),
                destroy: function destroy() {
                    cleanupModifierEffects();
                    isDestroyed = true;
                }
            };
            if (!areValidElements(reference, popper)) {
                return instance;
            }
            instance.setOptions(options).then(function(state) {
                if (!isDestroyed && options.onFirstUpdate) {
                    options.onFirstUpdate(state);
                }
            });
 // Modifiers have the ability to execute arbitrary code before the first
            // update cycle runs. They will be executed in the same order as the update
            // cycle. This is useful when a modifier adds some persistent data that
            // other modifiers need to use, but the modifier is run after the dependent
            // one.
                        function runModifierEffects() {
                state.orderedModifiers.forEach(function(_ref) {
                    var name = _ref.name, _ref$options = _ref.options, options = _ref$options === void 0 ? {} : _ref$options, effect = _ref.effect;
                    if (typeof effect === "function") {
                        var cleanupFn = effect({
                            state: state,
                            name: name,
                            instance: instance,
                            options: options
                        });
                        var noopFn = function noopFn() {};
                        effectCleanupFns.push(cleanupFn || noopFn);
                    }
                });
            }
            function cleanupModifierEffects() {
                effectCleanupFns.forEach(function(fn) {
                    return fn();
                });
                effectCleanupFns = [];
            }
            return instance;
        };
    }
    var createPopper$2 =  popperGenerator();
 // eslint-disable-next-line import/no-unused-modules
        var defaultModifiers$1 = [ eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1 ];
    var createPopper$1 =  popperGenerator({
        defaultModifiers: defaultModifiers$1
    });
 // eslint-disable-next-line import/no-unused-modules
        var defaultModifiers = [ eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1 ];
    var createPopper =  popperGenerator({
        defaultModifiers: defaultModifiers
    });
 // eslint-disable-next-line import/no-unused-modules
        const Popper =  Object.freeze( Object.defineProperty({
        __proto__: null,
        afterMain: afterMain,
        afterRead: afterRead,
        afterWrite: afterWrite,
        applyStyles: applyStyles$1,
        arrow: arrow$1,
        auto: auto,
        basePlacements: basePlacements,
        beforeMain: beforeMain,
        beforeRead: beforeRead,
        beforeWrite: beforeWrite,
        bottom: bottom,
        clippingParents: clippingParents,
        computeStyles: computeStyles$1,
        createPopper: createPopper,
        createPopperBase: createPopper$2,
        createPopperLite: createPopper$1,
        detectOverflow: detectOverflow,
        end: end,
        eventListeners: eventListeners,
        flip: flip$1,
        hide: hide$1,
        left: left,
        main: main,
        modifierPhases: modifierPhases,
        offset: offset$1,
        placements: placements,
        popper: popper,
        popperGenerator: popperGenerator,
        popperOffsets: popperOffsets$1,
        preventOverflow: preventOverflow$1,
        read: read,
        reference: reference,
        right: right,
        start: start,
        top: top,
        variationPlacements: variationPlacements,
        viewport: viewport,
        write: write
    }, Symbol.toStringTag, {
        value: "Module"
    }));
    /**
   * --------------------------------------------------------------------------
   * Bootstrap dropdown.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$a = "dropdown";
    const DATA_KEY$6 = "bs.dropdown";
    const EVENT_KEY$6 = `.${DATA_KEY$6}`;
    const DATA_API_KEY$3 = ".data-api";
    const ESCAPE_KEY$2 = "Escape";
    const TAB_KEY$1 = "Tab";
    const ARROW_UP_KEY$1 = "ArrowUp";
    const ARROW_DOWN_KEY$1 = "ArrowDown";
    const RIGHT_MOUSE_BUTTON = 2;
 // MouseEvent.button value for the secondary button, usually the right button
        const EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
    const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
    const EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
    const EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
    const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
    const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
    const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
    const CLASS_NAME_SHOW$6 = "show";
    const CLASS_NAME_DROPUP = "dropup";
    const CLASS_NAME_DROPEND = "dropend";
    const CLASS_NAME_DROPSTART = "dropstart";
    const CLASS_NAME_DROPUP_CENTER = "dropup-center";
    const CLASS_NAME_DROPDOWN_CENTER = "dropdown-center";
    const SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
    const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
    const SELECTOR_MENU = ".dropdown-menu";
    const SELECTOR_NAVBAR = ".navbar";
    const SELECTOR_NAVBAR_NAV = ".navbar-nav";
    const SELECTOR_VISIBLE_ITEMS = ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
    const PLACEMENT_TOP = isRTL() ? "top-end" : "top-start";
    const PLACEMENT_TOPEND = isRTL() ? "top-start" : "top-end";
    const PLACEMENT_BOTTOM = isRTL() ? "bottom-end" : "bottom-start";
    const PLACEMENT_BOTTOMEND = isRTL() ? "bottom-start" : "bottom-end";
    const PLACEMENT_RIGHT = isRTL() ? "left-start" : "right-start";
    const PLACEMENT_LEFT = isRTL() ? "right-start" : "left-start";
    const PLACEMENT_TOPCENTER = "top";
    const PLACEMENT_BOTTOMCENTER = "bottom";
    const Default$9 = {
        autoClose: true,
        boundary: "clippingParents",
        display: "dynamic",
        offset: [ 0, 2 ],
        popperConfig: null,
        reference: "toggle"
    };
    const DefaultType$9 = {
        autoClose: "(boolean|string)",
        boundary: "(string|element)",
        display: "string",
        offset: "(array|string|function)",
        popperConfig: "(null|object|function)",
        reference: "(string|element|object)"
    };
    /**
   * Class definition
   */    class Dropdown extends BaseComponent {
        constructor(element, config) {
            super(element, config);
            this._popper = null;
            this._parent = this._element.parentNode;
 // dropdown wrapper
            // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
                        this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
            this._inNavbar = this._detectNavbar();
        }
        // Getters
        static get Default() {
            return Default$9;
        }
        static get DefaultType() {
            return DefaultType$9;
        }
        static get NAME() {
            return NAME$a;
        }
        // Public
        toggle() {
            return this._isShown() ? this.hide() : this.show();
        }
        show() {
            if (isDisabled(this._element) || this._isShown()) {
                return;
            }
            const relatedTarget = {
                relatedTarget: this._element
            };
            const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);
            if (showEvent.defaultPrevented) {
                return;
            }
            this._createPopper();
            // If this is a touch-enabled device we add extra
            // empty mouseover listeners to the body's immediate children;
            // only needed because of broken event delegation on iOS
            // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
                        if ("ontouchstart" in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
                for (const element of [].concat(...document.body.children)) {
                    EventHandler.on(element, "mouseover", noop);
                }
            }
            this._element.focus();
            this._element.setAttribute("aria-expanded", true);
            this._menu.classList.add(CLASS_NAME_SHOW$6);
            this._element.classList.add(CLASS_NAME_SHOW$6);
            EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
        }
        hide() {
            if (isDisabled(this._element) || !this._isShown()) {
                return;
            }
            const relatedTarget = {
                relatedTarget: this._element
            };
            this._completeHide(relatedTarget);
        }
        dispose() {
            if (this._popper) {
                this._popper.destroy();
            }
            super.dispose();
        }
        update() {
            this._inNavbar = this._detectNavbar();
            if (this._popper) {
                this._popper.update();
            }
        }
        // Private
        _completeHide(relatedTarget) {
            const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);
            if (hideEvent.defaultPrevented) {
                return;
            }
            // If this is a touch-enabled device we remove the extra
            // empty mouseover listeners we added for iOS support
                        if ("ontouchstart" in document.documentElement) {
                for (const element of [].concat(...document.body.children)) {
                    EventHandler.off(element, "mouseover", noop);
                }
            }
            if (this._popper) {
                this._popper.destroy();
            }
            this._menu.classList.remove(CLASS_NAME_SHOW$6);
            this._element.classList.remove(CLASS_NAME_SHOW$6);
            this._element.setAttribute("aria-expanded", "false");
            Manipulator.removeDataAttribute(this._menu, "popper");
            EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
        }
        _getConfig(config) {
            config = super._getConfig(config);
            if (typeof config.reference === "object" && !isElement$1(config.reference) && typeof config.reference.getBoundingClientRect !== "function") {
                // Popper virtual elements require a getBoundingClientRect method
                throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
            }
            return config;
        }
        _createPopper() {
            if (typeof Popper === "undefined") {
                throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org)");
            }
            let referenceElement = this._element;
            if (this._config.reference === "parent") {
                referenceElement = this._parent;
            } else if (isElement$1(this._config.reference)) {
                referenceElement = getElement(this._config.reference);
            } else if (typeof this._config.reference === "object") {
                referenceElement = this._config.reference;
            }
            const popperConfig = this._getPopperConfig();
            this._popper = createPopper(referenceElement, this._menu, popperConfig);
        }
        _isShown() {
            return this._menu.classList.contains(CLASS_NAME_SHOW$6);
        }
        _getPlacement() {
            const parentDropdown = this._parent;
            if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
                return PLACEMENT_RIGHT;
            }
            if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
                return PLACEMENT_LEFT;
            }
            if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
                return PLACEMENT_TOPCENTER;
            }
            if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
                return PLACEMENT_BOTTOMCENTER;
            }
            // We need to trim the value because custom properties can also include spaces
                        const isEnd = getComputedStyle(this._menu).getPropertyValue("--bs-position").trim() === "end";
            if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
                return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
            }
            return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
        }
        _detectNavbar() {
            return this._element.closest(SELECTOR_NAVBAR) !== null;
        }
        _getOffset() {
            const {offset: offset} = this._config;
            if (typeof offset === "string") {
                return offset.split(",").map(value => Number.parseInt(value, 10));
            }
            if (typeof offset === "function") {
                return popperData => offset(popperData, this._element);
            }
            return offset;
        }
        _getPopperConfig() {
            const defaultBsPopperConfig = {
                placement: this._getPlacement(),
                modifiers: [ {
                    name: "preventOverflow",
                    options: {
                        boundary: this._config.boundary
                    }
                }, {
                    name: "offset",
                    options: {
                        offset: this._getOffset()
                    }
                } ]
            };
            // Disable Popper if we have a static display or Dropdown is in Navbar
                        if (this._inNavbar || this._config.display === "static") {
                Manipulator.setDataAttribute(this._menu, "popper", "static");
 // TODO: v6 remove
                                defaultBsPopperConfig.modifiers = [ {
                    name: "applyStyles",
                    enabled: false
                } ];
            }
            return {
                ...defaultBsPopperConfig,
                ...execute(this._config.popperConfig, [ defaultBsPopperConfig ])
            };
        }
        _selectMenuItem({key: key, target: target}) {
            const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(element => isVisible(element));
            if (!items.length) {
                return;
            }
            // if target isn't included in items (e.g. when expanding the dropdown)
            // allow cycling to get the last item in case key equals ARROW_UP_KEY
                        getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
        }
        // Static
        static jQueryInterface(config) {
            return this.each(function() {
                const data = Dropdown.getOrCreateInstance(this, config);
                if (typeof config !== "string") {
                    return;
                }
                if (typeof data[config] === "undefined") {
                    throw new TypeError(`No method named "${config}"`);
                }
                data[config]();
            });
        }
        static clearMenus(event) {
            if (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY$1) {
                return;
            }
            const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
            for (const toggle of openToggles) {
                const context = Dropdown.getInstance(toggle);
                if (!context || context._config.autoClose === false) {
                    continue;
                }
                const composedPath = event.composedPath();
                const isMenuTarget = composedPath.includes(context._menu);
                if (composedPath.includes(context._element) || context._config.autoClose === "inside" && !isMenuTarget || context._config.autoClose === "outside" && isMenuTarget) {
                    continue;
                }
                // Tab navigation through the dropdown menu or events from contained inputs shouldn't close the menu
                                if (context._menu.contains(event.target) && (event.type === "keyup" && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
                    continue;
                }
                const relatedTarget = {
                    relatedTarget: context._element
                };
                if (event.type === "click") {
                    relatedTarget.clickEvent = event;
                }
                context._completeHide(relatedTarget);
            }
        }
        static dataApiKeydownHandler(event) {
            // If not an UP | DOWN | ESCAPE key => not a dropdown command
            // If input/textarea && if key is other than ESCAPE => not a dropdown command
            const isInput = /input|textarea/i.test(event.target.tagName);
            const isEscapeEvent = event.key === ESCAPE_KEY$2;
            const isUpOrDownEvent = [ ARROW_UP_KEY$1, ARROW_DOWN_KEY$1 ].includes(event.key);
            if (!isUpOrDownEvent && !isEscapeEvent) {
                return;
            }
            if (isInput && !isEscapeEvent) {
                return;
            }
            event.preventDefault();
            // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
                        const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
            const instance = Dropdown.getOrCreateInstance(getToggleButton);
            if (isUpOrDownEvent) {
                event.stopPropagation();
                instance.show();
                instance._selectMenuItem(event);
                return;
            }
            if (instance._isShown()) {
                // else is escape and we check if it is shown
                event.stopPropagation();
                instance.hide();
                getToggleButton.focus();
            }
        }
    }
    /**
   * Data API implementation
   */    EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
    EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
    EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
    EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
    EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function(event) {
        event.preventDefault();
        Dropdown.getOrCreateInstance(this).toggle();
    });
    /**
   * jQuery
   */    defineJQueryPlugin(Dropdown);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap util/backdrop.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$9 = "backdrop";
    const CLASS_NAME_FADE$4 = "fade";
    const CLASS_NAME_SHOW$5 = "show";
    const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
    const Default$8 = {
        className: "modal-backdrop",
        clickCallback: null,
        isAnimated: false,
        isVisible: true,
        // if false, we use the backdrop helper without adding any element to the dom
        rootElement: "body"
    };
    const DefaultType$8 = {
        className: "string",
        clickCallback: "(function|null)",
        isAnimated: "boolean",
        isVisible: "boolean",
        rootElement: "(element|string)"
    };
    /**
   * Class definition
   */    class Backdrop extends Config {
        constructor(config) {
            super();
            this._config = this._getConfig(config);
            this._isAppended = false;
            this._element = null;
        }
        // Getters
        static get Default() {
            return Default$8;
        }
        static get DefaultType() {
            return DefaultType$8;
        }
        static get NAME() {
            return NAME$9;
        }
        // Public
        show(callback) {
            if (!this._config.isVisible) {
                execute(callback);
                return;
            }
            this._append();
            const element = this._getElement();
            if (this._config.isAnimated) {
                reflow(element);
            }
            element.classList.add(CLASS_NAME_SHOW$5);
            this._emulateAnimation(() => {
                execute(callback);
            });
        }
        hide(callback) {
            if (!this._config.isVisible) {
                execute(callback);
                return;
            }
            this._getElement().classList.remove(CLASS_NAME_SHOW$5);
            this._emulateAnimation(() => {
                this.dispose();
                execute(callback);
            });
        }
        dispose() {
            if (!this._isAppended) {
                return;
            }
            EventHandler.off(this._element, EVENT_MOUSEDOWN);
            this._element.remove();
            this._isAppended = false;
        }
        // Private
        _getElement() {
            if (!this._element) {
                const backdrop = document.createElement("div");
                backdrop.className = this._config.className;
                if (this._config.isAnimated) {
                    backdrop.classList.add(CLASS_NAME_FADE$4);
                }
                this._element = backdrop;
            }
            return this._element;
        }
        _configAfterMerge(config) {
            // use getElement() with the default "body" to get a fresh Element on each instantiation
            config.rootElement = getElement(config.rootElement);
            return config;
        }
        _append() {
            if (this._isAppended) {
                return;
            }
            const element = this._getElement();
            this._config.rootElement.append(element);
            EventHandler.on(element, EVENT_MOUSEDOWN, () => {
                execute(this._config.clickCallback);
            });
            this._isAppended = true;
        }
        _emulateAnimation(callback) {
            executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
        }
    }
    /**
   * --------------------------------------------------------------------------
   * Bootstrap util/focustrap.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$8 = "focustrap";
    const DATA_KEY$5 = "bs.focustrap";
    const EVENT_KEY$5 = `.${DATA_KEY$5}`;
    const EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
    const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
    const TAB_KEY = "Tab";
    const TAB_NAV_FORWARD = "forward";
    const TAB_NAV_BACKWARD = "backward";
    const Default$7 = {
        autofocus: true,
        trapElement: null
    };
    const DefaultType$7 = {
        autofocus: "boolean",
        trapElement: "element"
    };
    /**
   * Class definition
   */    class FocusTrap extends Config {
        constructor(config) {
            super();
            this._config = this._getConfig(config);
            this._isActive = false;
            this._lastTabNavDirection = null;
        }
        // Getters
        static get Default() {
            return Default$7;
        }
        static get DefaultType() {
            return DefaultType$7;
        }
        static get NAME() {
            return NAME$8;
        }
        // Public
        activate() {
            if (this._isActive) {
                return;
            }
            if (this._config.autofocus) {
                this._config.trapElement.focus();
            }
            EventHandler.off(document, EVENT_KEY$5);
 // guard against infinite focus loop
                        EventHandler.on(document, EVENT_FOCUSIN$2, event => this._handleFocusin(event));
            EventHandler.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event));
            this._isActive = true;
        }
        deactivate() {
            if (!this._isActive) {
                return;
            }
            this._isActive = false;
            EventHandler.off(document, EVENT_KEY$5);
        }
        // Private
        _handleFocusin(event) {
            const {trapElement: trapElement} = this._config;
            if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
                return;
            }
            const elements = SelectorEngine.focusableChildren(trapElement);
            if (elements.length === 0) {
                trapElement.focus();
            } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
                elements[elements.length - 1].focus();
            } else {
                elements[0].focus();
            }
        }
        _handleKeydown(event) {
            if (event.key !== TAB_KEY) {
                return;
            }
            this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
        }
    }
    /**
   * --------------------------------------------------------------------------
   * Bootstrap util/scrollBar.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
    const SELECTOR_STICKY_CONTENT = ".sticky-top";
    const PROPERTY_PADDING = "padding-right";
    const PROPERTY_MARGIN = "margin-right";
    /**
   * Class definition
   */    class ScrollBarHelper {
        constructor() {
            this._element = document.body;
        }
        // Public
        getWidth() {
            // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
            const documentWidth = document.documentElement.clientWidth;
            return Math.abs(window.innerWidth - documentWidth);
        }
        hide() {
            const width = this.getWidth();
            this._disableOverFlow();
            // give padding to element to balance the hidden scrollbar width
                        this._setElementAttributes(this._element, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
            // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth
                        this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
            this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, calculatedValue => calculatedValue - width);
        }
        reset() {
            this._resetElementAttributes(this._element, "overflow");
            this._resetElementAttributes(this._element, PROPERTY_PADDING);
            this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
            this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
        }
        isOverflowing() {
            return this.getWidth() > 0;
        }
        // Private
        _disableOverFlow() {
            this._saveInitialAttribute(this._element, "overflow");
            this._element.style.overflow = "hidden";
        }
        _setElementAttributes(selector, styleProperty, callback) {
            const scrollbarWidth = this.getWidth();
            const manipulationCallBack = element => {
                if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
                    return;
                }
                this._saveInitialAttribute(element, styleProperty);
                const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
                element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
            };
            this._applyManipulationCallback(selector, manipulationCallBack);
        }
        _saveInitialAttribute(element, styleProperty) {
            const actualValue = element.style.getPropertyValue(styleProperty);
            if (actualValue) {
                Manipulator.setDataAttribute(element, styleProperty, actualValue);
            }
        }
        _resetElementAttributes(selector, styleProperty) {
            const manipulationCallBack = element => {
                const value = Manipulator.getDataAttribute(element, styleProperty);
                // We only want to remove the property if the value is `null`; the value can also be zero
                                if (value === null) {
                    element.style.removeProperty(styleProperty);
                    return;
                }
                Manipulator.removeDataAttribute(element, styleProperty);
                element.style.setProperty(styleProperty, value);
            };
            this._applyManipulationCallback(selector, manipulationCallBack);
        }
        _applyManipulationCallback(selector, callBack) {
            if (isElement$1(selector)) {
                callBack(selector);
                return;
            }
            for (const sel of SelectorEngine.find(selector, this._element)) {
                callBack(sel);
            }
        }
    }
    /**
   * --------------------------------------------------------------------------
   * Bootstrap modal.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$7 = "modal";
    const DATA_KEY$4 = "bs.modal";
    const EVENT_KEY$4 = `.${DATA_KEY$4}`;
    const DATA_API_KEY$2 = ".data-api";
    const ESCAPE_KEY$1 = "Escape";
    const EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
    const EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
    const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
    const EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
    const EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
    const EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
    const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$4}`;
    const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
    const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
    const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
    const CLASS_NAME_OPEN = "modal-open";
    const CLASS_NAME_FADE$3 = "fade";
    const CLASS_NAME_SHOW$4 = "show";
    const CLASS_NAME_STATIC = "modal-static";
    const OPEN_SELECTOR$1 = ".modal.show";
    const SELECTOR_DIALOG = ".modal-dialog";
    const SELECTOR_MODAL_BODY = ".modal-body";
    const SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
    const Default$6 = {
        backdrop: true,
        focus: true,
        keyboard: true
    };
    const DefaultType$6 = {
        backdrop: "(boolean|string)",
        focus: "boolean",
        keyboard: "boolean"
    };
    /**
   * Class definition
   */    class Modal extends BaseComponent {
        constructor(element, config) {
            super(element, config);
            this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
            this._backdrop = this._initializeBackDrop();
            this._focustrap = this._initializeFocusTrap();
            this._isShown = false;
            this._isTransitioning = false;
            this._scrollBar = new ScrollBarHelper;
            this._addEventListeners();
        }
        // Getters
        static get Default() {
            return Default$6;
        }
        static get DefaultType() {
            return DefaultType$6;
        }
        static get NAME() {
            return NAME$7;
        }
        // Public
        toggle(relatedTarget) {
            return this._isShown ? this.hide() : this.show(relatedTarget);
        }
        show(relatedTarget) {
            if (this._isShown || this._isTransitioning) {
                return;
            }
            const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
                relatedTarget: relatedTarget
            });
            if (showEvent.defaultPrevented) {
                return;
            }
            this._isShown = true;
            this._isTransitioning = true;
            this._scrollBar.hide();
            document.body.classList.add(CLASS_NAME_OPEN);
            this._adjustDialog();
            this._backdrop.show(() => this._showElement(relatedTarget));
        }
        hide() {
            if (!this._isShown || this._isTransitioning) {
                return;
            }
            const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);
            if (hideEvent.defaultPrevented) {
                return;
            }
            this._isShown = false;
            this._isTransitioning = true;
            this._focustrap.deactivate();
            this._element.classList.remove(CLASS_NAME_SHOW$4);
            this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
        }
        dispose() {
            EventHandler.off(window, EVENT_KEY$4);
            EventHandler.off(this._dialog, EVENT_KEY$4);
            this._backdrop.dispose();
            this._focustrap.deactivate();
            super.dispose();
        }
        handleUpdate() {
            this._adjustDialog();
        }
        // Private
        _initializeBackDrop() {
            return new Backdrop({
                isVisible: Boolean(this._config.backdrop),
                // 'static' option will be translated to true, and booleans will keep their value,
                isAnimated: this._isAnimated()
            });
        }
        _initializeFocusTrap() {
            return new FocusTrap({
                trapElement: this._element
            });
        }
        _showElement(relatedTarget) {
            // try to append dynamic modal
            if (!document.body.contains(this._element)) {
                document.body.append(this._element);
            }
            this._element.style.display = "block";
            this._element.removeAttribute("aria-hidden");
            this._element.setAttribute("aria-modal", true);
            this._element.setAttribute("role", "dialog");
            this._element.scrollTop = 0;
            const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
            if (modalBody) {
                modalBody.scrollTop = 0;
            }
            reflow(this._element);
            this._element.classList.add(CLASS_NAME_SHOW$4);
            const transitionComplete = () => {
                if (this._config.focus) {
                    this._focustrap.activate();
                }
                this._isTransitioning = false;
                EventHandler.trigger(this._element, EVENT_SHOWN$4, {
                    relatedTarget: relatedTarget
                });
            };
            this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
        }
        _addEventListeners() {
            EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, event => {
                if (event.key !== ESCAPE_KEY$1) {
                    return;
                }
                if (this._config.keyboard) {
                    this.hide();
                    return;
                }
                this._triggerBackdropTransition();
            });
            EventHandler.on(window, EVENT_RESIZE$1, () => {
                if (this._isShown && !this._isTransitioning) {
                    this._adjustDialog();
                }
            });
            EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, event => {
                // a bad trick to segregate clicks that may start inside dialog but end outside, and avoid listen to scrollbar clicks
                EventHandler.one(this._element, EVENT_CLICK_DISMISS, event2 => {
                    if (this._element !== event.target || this._element !== event2.target) {
                        return;
                    }
                    if (this._config.backdrop === "static") {
                        this._triggerBackdropTransition();
                        return;
                    }
                    if (this._config.backdrop) {
                        this.hide();
                    }
                });
            });
        }
        _hideModal() {
            this._element.style.display = "none";
            this._element.setAttribute("aria-hidden", true);
            this._element.removeAttribute("aria-modal");
            this._element.removeAttribute("role");
            this._isTransitioning = false;
            this._backdrop.hide(() => {
                document.body.classList.remove(CLASS_NAME_OPEN);
                this._resetAdjustments();
                this._scrollBar.reset();
                EventHandler.trigger(this._element, EVENT_HIDDEN$4);
            });
        }
        _isAnimated() {
            return this._element.classList.contains(CLASS_NAME_FADE$3);
        }
        _triggerBackdropTransition() {
            const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);
            if (hideEvent.defaultPrevented) {
                return;
            }
            const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
            const initialOverflowY = this._element.style.overflowY;
            // return if the following background transition hasn't yet completed
                        if (initialOverflowY === "hidden" || this._element.classList.contains(CLASS_NAME_STATIC)) {
                return;
            }
            if (!isModalOverflowing) {
                this._element.style.overflowY = "hidden";
            }
            this._element.classList.add(CLASS_NAME_STATIC);
            this._queueCallback(() => {
                this._element.classList.remove(CLASS_NAME_STATIC);
                this._queueCallback(() => {
                    this._element.style.overflowY = initialOverflowY;
                }, this._dialog);
            }, this._dialog);
            this._element.focus();
        }
        /**
     * The following methods are used to handle overflowing modals
     */        _adjustDialog() {
            const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
            const scrollbarWidth = this._scrollBar.getWidth();
            const isBodyOverflowing = scrollbarWidth > 0;
            if (isBodyOverflowing && !isModalOverflowing) {
                const property = isRTL() ? "paddingLeft" : "paddingRight";
                this._element.style[property] = `${scrollbarWidth}px`;
            }
            if (!isBodyOverflowing && isModalOverflowing) {
                const property = isRTL() ? "paddingRight" : "paddingLeft";
                this._element.style[property] = `${scrollbarWidth}px`;
            }
        }
        _resetAdjustments() {
            this._element.style.paddingLeft = "";
            this._element.style.paddingRight = "";
        }
        // Static
        static jQueryInterface(config, relatedTarget) {
            return this.each(function() {
                const data = Modal.getOrCreateInstance(this, config);
                if (typeof config !== "string") {
                    return;
                }
                if (typeof data[config] === "undefined") {
                    throw new TypeError(`No method named "${config}"`);
                }
                data[config](relatedTarget);
            });
        }
    }
    /**
   * Data API implementation
   */    EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function(event) {
        const target = SelectorEngine.getElementFromSelector(this);
        if ([ "A", "AREA" ].includes(this.tagName)) {
            event.preventDefault();
        }
        EventHandler.one(target, EVENT_SHOW$4, showEvent => {
            if (showEvent.defaultPrevented) {
                // only register focus restorer if modal will actually get shown
                return;
            }
            EventHandler.one(target, EVENT_HIDDEN$4, () => {
                if (isVisible(this)) {
                    this.focus();
                }
            });
        });
        // avoid conflict when clicking modal toggler while another one is open
                const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
        if (alreadyOpen) {
            Modal.getInstance(alreadyOpen).hide();
        }
        const data = Modal.getOrCreateInstance(target);
        data.toggle(this);
    });
    enableDismissTrigger(Modal);
    /**
   * jQuery
   */    defineJQueryPlugin(Modal);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap offcanvas.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$6 = "offcanvas";
    const DATA_KEY$3 = "bs.offcanvas";
    const EVENT_KEY$3 = `.${DATA_KEY$3}`;
    const DATA_API_KEY$1 = ".data-api";
    const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
    const ESCAPE_KEY = "Escape";
    const CLASS_NAME_SHOW$3 = "show";
    const CLASS_NAME_SHOWING$1 = "showing";
    const CLASS_NAME_HIDING = "hiding";
    const CLASS_NAME_BACKDROP = "offcanvas-backdrop";
    const OPEN_SELECTOR = ".offcanvas.show";
    const EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
    const EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
    const EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
    const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
    const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
    const EVENT_RESIZE = `resize${EVENT_KEY$3}`;
    const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
    const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
    const SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
    const Default$5 = {
        backdrop: true,
        keyboard: true,
        scroll: false
    };
    const DefaultType$5 = {
        backdrop: "(boolean|string)",
        keyboard: "boolean",
        scroll: "boolean"
    };
    /**
   * Class definition
   */    class Offcanvas extends BaseComponent {
        constructor(element, config) {
            super(element, config);
            this._isShown = false;
            this._backdrop = this._initializeBackDrop();
            this._focustrap = this._initializeFocusTrap();
            this._addEventListeners();
        }
        // Getters
        static get Default() {
            return Default$5;
        }
        static get DefaultType() {
            return DefaultType$5;
        }
        static get NAME() {
            return NAME$6;
        }
        // Public
        toggle(relatedTarget) {
            return this._isShown ? this.hide() : this.show(relatedTarget);
        }
        show(relatedTarget) {
            if (this._isShown) {
                return;
            }
            const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
                relatedTarget: relatedTarget
            });
            if (showEvent.defaultPrevented) {
                return;
            }
            this._isShown = true;
            this._backdrop.show();
            if (!this._config.scroll) {
                (new ScrollBarHelper).hide();
            }
            this._element.setAttribute("aria-modal", true);
            this._element.setAttribute("role", "dialog");
            this._element.classList.add(CLASS_NAME_SHOWING$1);
            const completeCallBack = () => {
                if (!this._config.scroll || this._config.backdrop) {
                    this._focustrap.activate();
                }
                this._element.classList.add(CLASS_NAME_SHOW$3);
                this._element.classList.remove(CLASS_NAME_SHOWING$1);
                EventHandler.trigger(this._element, EVENT_SHOWN$3, {
                    relatedTarget: relatedTarget
                });
            };
            this._queueCallback(completeCallBack, this._element, true);
        }
        hide() {
            if (!this._isShown) {
                return;
            }
            const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);
            if (hideEvent.defaultPrevented) {
                return;
            }
            this._focustrap.deactivate();
            this._element.blur();
            this._isShown = false;
            this._element.classList.add(CLASS_NAME_HIDING);
            this._backdrop.hide();
            const completeCallback = () => {
                this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
                this._element.removeAttribute("aria-modal");
                this._element.removeAttribute("role");
                if (!this._config.scroll) {
                    (new ScrollBarHelper).reset();
                }
                EventHandler.trigger(this._element, EVENT_HIDDEN$3);
            };
            this._queueCallback(completeCallback, this._element, true);
        }
        dispose() {
            this._backdrop.dispose();
            this._focustrap.deactivate();
            super.dispose();
        }
        // Private
        _initializeBackDrop() {
            const clickCallback = () => {
                if (this._config.backdrop === "static") {
                    EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
                    return;
                }
                this.hide();
            };
            // 'static' option will be translated to true, and booleans will keep their value
                        const isVisible = Boolean(this._config.backdrop);
            return new Backdrop({
                className: CLASS_NAME_BACKDROP,
                isVisible: isVisible,
                isAnimated: true,
                rootElement: this._element.parentNode,
                clickCallback: isVisible ? clickCallback : null
            });
        }
        _initializeFocusTrap() {
            return new FocusTrap({
                trapElement: this._element
            });
        }
        _addEventListeners() {
            EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, event => {
                if (event.key !== ESCAPE_KEY) {
                    return;
                }
                if (this._config.keyboard) {
                    this.hide();
                    return;
                }
                EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
            });
        }
        // Static
        static jQueryInterface(config) {
            return this.each(function() {
                const data = Offcanvas.getOrCreateInstance(this, config);
                if (typeof config !== "string") {
                    return;
                }
                if (data[config] === undefined || config.startsWith("_") || config === "constructor") {
                    throw new TypeError(`No method named "${config}"`);
                }
                data[config](this);
            });
        }
    }
    /**
   * Data API implementation
   */    EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function(event) {
        const target = SelectorEngine.getElementFromSelector(this);
        if ([ "A", "AREA" ].includes(this.tagName)) {
            event.preventDefault();
        }
        if (isDisabled(this)) {
            return;
        }
        EventHandler.one(target, EVENT_HIDDEN$3, () => {
            // focus on trigger when it is closed
            if (isVisible(this)) {
                this.focus();
            }
        });
        // avoid conflict when clicking a toggler of an offcanvas, while another is open
                const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
        if (alreadyOpen && alreadyOpen !== target) {
            Offcanvas.getInstance(alreadyOpen).hide();
        }
        const data = Offcanvas.getOrCreateInstance(target);
        data.toggle(this);
    });
    EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
        for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
            Offcanvas.getOrCreateInstance(selector).show();
        }
    });
    EventHandler.on(window, EVENT_RESIZE, () => {
        for (const element of SelectorEngine.find("[aria-modal][class*=show][class*=offcanvas-]")) {
            if (getComputedStyle(element).position !== "fixed") {
                Offcanvas.getOrCreateInstance(element).hide();
            }
        }
    });
    enableDismissTrigger(Offcanvas);
    /**
   * jQuery
   */    defineJQueryPlugin(Offcanvas);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap util/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    // js-docs-start allow-list
        const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
    const DefaultAllowlist = {
        // Global attributes allowed on any supplied element below.
        "*": [ "class", "dir", "id", "lang", "role", ARIA_ATTRIBUTE_PATTERN ],
        a: [ "target", "href", "title", "rel" ],
        area: [],
        b: [],
        br: [],
        col: [],
        code: [],
        dd: [],
        div: [],
        dl: [],
        dt: [],
        em: [],
        hr: [],
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: [],
        i: [],
        img: [ "src", "srcset", "alt", "title", "width", "height" ],
        li: [],
        ol: [],
        p: [],
        pre: [],
        s: [],
        small: [],
        span: [],
        sub: [],
        sup: [],
        strong: [],
        u: [],
        ul: []
    };
    // js-docs-end allow-list
        const uriAttributes = new Set([ "background", "cite", "href", "itemtype", "longdesc", "poster", "src", "xlink:href" ]);
    /**
   * A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
   * contexts.
   *
   * Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L38
   */
    // eslint-disable-next-line unicorn/better-regex
        const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
    const allowedAttribute = (attribute, allowedAttributeList) => {
        const attributeName = attribute.nodeName.toLowerCase();
        if (allowedAttributeList.includes(attributeName)) {
            if (uriAttributes.has(attributeName)) {
                return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
            }
            return true;
        }
        // Check if a regular expression validates the attribute.
                return allowedAttributeList.filter(attributeRegex => attributeRegex instanceof RegExp).some(regex => regex.test(attributeName));
    };
    function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
        if (!unsafeHtml.length) {
            return unsafeHtml;
        }
        if (sanitizeFunction && typeof sanitizeFunction === "function") {
            return sanitizeFunction(unsafeHtml);
        }
        const domParser = new window.DOMParser;
        const createdDocument = domParser.parseFromString(unsafeHtml, "text/html");
        const elements = [].concat(...createdDocument.body.querySelectorAll("*"));
        for (const element of elements) {
            const elementName = element.nodeName.toLowerCase();
            if (!Object.keys(allowList).includes(elementName)) {
                element.remove();
                continue;
            }
            const attributeList = [].concat(...element.attributes);
            const allowedAttributes = [].concat(allowList["*"] || [], allowList[elementName] || []);
            for (const attribute of attributeList) {
                if (!allowedAttribute(attribute, allowedAttributes)) {
                    element.removeAttribute(attribute.nodeName);
                }
            }
        }
        return createdDocument.body.innerHTML;
    }
    /**
   * --------------------------------------------------------------------------
   * Bootstrap util/template-factory.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$5 = "TemplateFactory";
    const Default$4 = {
        allowList: DefaultAllowlist,
        content: {},
        // { selector : text ,  selector2 : text2 , }
        extraClass: "",
        html: false,
        sanitize: true,
        sanitizeFn: null,
        template: "<div></div>"
    };
    const DefaultType$4 = {
        allowList: "object",
        content: "object",
        extraClass: "(string|function)",
        html: "boolean",
        sanitize: "boolean",
        sanitizeFn: "(null|function)",
        template: "string"
    };
    const DefaultContentType = {
        entry: "(string|element|function|null)",
        selector: "(string|element)"
    };
    /**
   * Class definition
   */    class TemplateFactory extends Config {
        constructor(config) {
            super();
            this._config = this._getConfig(config);
        }
        // Getters
        static get Default() {
            return Default$4;
        }
        static get DefaultType() {
            return DefaultType$4;
        }
        static get NAME() {
            return NAME$5;
        }
        // Public
        getContent() {
            return Object.values(this._config.content).map(config => this._resolvePossibleFunction(config)).filter(Boolean);
        }
        hasContent() {
            return this.getContent().length > 0;
        }
        changeContent(content) {
            this._checkContent(content);
            this._config.content = {
                ...this._config.content,
                ...content
            };
            return this;
        }
        toHtml() {
            const templateWrapper = document.createElement("div");
            templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
            for (const [selector, text] of Object.entries(this._config.content)) {
                this._setContent(templateWrapper, text, selector);
            }
            const template = templateWrapper.children[0];
            const extraClass = this._resolvePossibleFunction(this._config.extraClass);
            if (extraClass) {
                template.classList.add(...extraClass.split(" "));
            }
            return template;
        }
        // Private
        _typeCheckConfig(config) {
            super._typeCheckConfig(config);
            this._checkContent(config.content);
        }
        _checkContent(arg) {
            for (const [selector, content] of Object.entries(arg)) {
                super._typeCheckConfig({
                    selector: selector,
                    entry: content
                }, DefaultContentType);
            }
        }
        _setContent(template, content, selector) {
            const templateElement = SelectorEngine.findOne(selector, template);
            if (!templateElement) {
                return;
            }
            content = this._resolvePossibleFunction(content);
            if (!content) {
                templateElement.remove();
                return;
            }
            if (isElement$1(content)) {
                this._putElementInTemplate(getElement(content), templateElement);
                return;
            }
            if (this._config.html) {
                templateElement.innerHTML = this._maybeSanitize(content);
                return;
            }
            templateElement.textContent = content;
        }
        _maybeSanitize(arg) {
            return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
        }
        _resolvePossibleFunction(arg) {
            return execute(arg, [ this ]);
        }
        _putElementInTemplate(element, templateElement) {
            if (this._config.html) {
                templateElement.innerHTML = "";
                templateElement.append(element);
                return;
            }
            templateElement.textContent = element.textContent;
        }
    }
    /**
   * --------------------------------------------------------------------------
   * Bootstrap tooltip.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$4 = "tooltip";
    const DISALLOWED_ATTRIBUTES = new Set([ "sanitize", "allowList", "sanitizeFn" ]);
    const CLASS_NAME_FADE$2 = "fade";
    const CLASS_NAME_MODAL = "modal";
    const CLASS_NAME_SHOW$2 = "show";
    const SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
    const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
    const EVENT_MODAL_HIDE = "hide.bs.modal";
    const TRIGGER_HOVER = "hover";
    const TRIGGER_FOCUS = "focus";
    const TRIGGER_CLICK = "click";
    const TRIGGER_MANUAL = "manual";
    const EVENT_HIDE$2 = "hide";
    const EVENT_HIDDEN$2 = "hidden";
    const EVENT_SHOW$2 = "show";
    const EVENT_SHOWN$2 = "shown";
    const EVENT_INSERTED = "inserted";
    const EVENT_CLICK$1 = "click";
    const EVENT_FOCUSIN$1 = "focusin";
    const EVENT_FOCUSOUT$1 = "focusout";
    const EVENT_MOUSEENTER = "mouseenter";
    const EVENT_MOUSELEAVE = "mouseleave";
    const AttachmentMap = {
        AUTO: "auto",
        TOP: "top",
        RIGHT: isRTL() ? "left" : "right",
        BOTTOM: "bottom",
        LEFT: isRTL() ? "right" : "left"
    };
    const Default$3 = {
        allowList: DefaultAllowlist,
        animation: true,
        boundary: "clippingParents",
        container: false,
        customClass: "",
        delay: 0,
        fallbackPlacements: [ "top", "right", "bottom", "left" ],
        html: false,
        offset: [ 0, 6 ],
        placement: "top",
        popperConfig: null,
        sanitize: true,
        sanitizeFn: null,
        selector: false,
        template: '<div class="tooltip" role="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner"></div>' + "</div>",
        title: "",
        trigger: "hover focus"
    };
    const DefaultType$3 = {
        allowList: "object",
        animation: "boolean",
        boundary: "(string|element)",
        container: "(string|element|boolean)",
        customClass: "(string|function)",
        delay: "(number|object)",
        fallbackPlacements: "array",
        html: "boolean",
        offset: "(array|string|function)",
        placement: "(string|function)",
        popperConfig: "(null|object|function)",
        sanitize: "boolean",
        sanitizeFn: "(null|function)",
        selector: "(string|boolean)",
        template: "string",
        title: "(string|element|function)",
        trigger: "string"
    };
    /**
   * Class definition
   */    class Tooltip extends BaseComponent {
        constructor(element, config) {
            if (typeof Popper === "undefined") {
                throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org)");
            }
            super(element, config);
            // Private
                        this._isEnabled = true;
            this._timeout = 0;
            this._isHovered = null;
            this._activeTrigger = {};
            this._popper = null;
            this._templateFactory = null;
            this._newContent = null;
            // Protected
                        this.tip = null;
            this._setListeners();
            if (!this._config.selector) {
                this._fixTitle();
            }
        }
        // Getters
        static get Default() {
            return Default$3;
        }
        static get DefaultType() {
            return DefaultType$3;
        }
        static get NAME() {
            return NAME$4;
        }
        // Public
        enable() {
            this._isEnabled = true;
        }
        disable() {
            this._isEnabled = false;
        }
        toggleEnabled() {
            this._isEnabled = !this._isEnabled;
        }
        toggle() {
            if (!this._isEnabled) {
                return;
            }
            this._activeTrigger.click = !this._activeTrigger.click;
            if (this._isShown()) {
                this._leave();
                return;
            }
            this._enter();
        }
        dispose() {
            clearTimeout(this._timeout);
            EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
            if (this._element.getAttribute("data-bs-original-title")) {
                this._element.setAttribute("title", this._element.getAttribute("data-bs-original-title"));
            }
            this._disposePopper();
            super.dispose();
        }
        show() {
            if (this._element.style.display === "none") {
                throw new Error("Please use show on visible elements");
            }
            if (!(this._isWithContent() && this._isEnabled)) {
                return;
            }
            const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
            const shadowRoot = findShadowRoot(this._element);
            const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
            if (showEvent.defaultPrevented || !isInTheDom) {
                return;
            }
            // TODO: v6 remove this or make it optional
                        this._disposePopper();
            const tip = this._getTipElement();
            this._element.setAttribute("aria-describedby", tip.getAttribute("id"));
            const {container: container} = this._config;
            if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
                container.append(tip);
                EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
            }
            this._popper = this._createPopper(tip);
            tip.classList.add(CLASS_NAME_SHOW$2);
            // If this is a touch-enabled device we add extra
            // empty mouseover listeners to the body's immediate children;
            // only needed because of broken event delegation on iOS
            // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
                        if ("ontouchstart" in document.documentElement) {
                for (const element of [].concat(...document.body.children)) {
                    EventHandler.on(element, "mouseover", noop);
                }
            }
            const complete = () => {
                EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));
                if (this._isHovered === false) {
                    this._leave();
                }
                this._isHovered = false;
            };
            this._queueCallback(complete, this.tip, this._isAnimated());
        }
        hide() {
            if (!this._isShown()) {
                return;
            }
            const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));
            if (hideEvent.defaultPrevented) {
                return;
            }
            const tip = this._getTipElement();
            tip.classList.remove(CLASS_NAME_SHOW$2);
            // If this is a touch-enabled device we remove the extra
            // empty mouseover listeners we added for iOS support
                        if ("ontouchstart" in document.documentElement) {
                for (const element of [].concat(...document.body.children)) {
                    EventHandler.off(element, "mouseover", noop);
                }
            }
            this._activeTrigger[TRIGGER_CLICK] = false;
            this._activeTrigger[TRIGGER_FOCUS] = false;
            this._activeTrigger[TRIGGER_HOVER] = false;
            this._isHovered = null;
 // it is a trick to support manual triggering
                        const complete = () => {
                if (this._isWithActiveTrigger()) {
                    return;
                }
                if (!this._isHovered) {
                    this._disposePopper();
                }
                this._element.removeAttribute("aria-describedby");
                EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));
            };
            this._queueCallback(complete, this.tip, this._isAnimated());
        }
        update() {
            if (this._popper) {
                this._popper.update();
            }
        }
        // Protected
        _isWithContent() {
            return Boolean(this._getTitle());
        }
        _getTipElement() {
            if (!this.tip) {
                this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
            }
            return this.tip;
        }
        _createTipElement(content) {
            const tip = this._getTemplateFactory(content).toHtml();
            // TODO: remove this check in v6
                        if (!tip) {
                return null;
            }
            tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
            // TODO: v6 the following can be achieved with CSS only
                        tip.classList.add(`bs-${this.constructor.NAME}-auto`);
            const tipId = getUID(this.constructor.NAME).toString();
            tip.setAttribute("id", tipId);
            if (this._isAnimated()) {
                tip.classList.add(CLASS_NAME_FADE$2);
            }
            return tip;
        }
        setContent(content) {
            this._newContent = content;
            if (this._isShown()) {
                this._disposePopper();
                this.show();
            }
        }
        _getTemplateFactory(content) {
            if (this._templateFactory) {
                this._templateFactory.changeContent(content);
            } else {
                this._templateFactory = new TemplateFactory({
                    ...this._config,
                    // the `content` var has to be after `this._config`
                    // to override config.content in case of popover
                    content: content,
                    extraClass: this._resolvePossibleFunction(this._config.customClass)
                });
            }
            return this._templateFactory;
        }
        _getContentForTemplate() {
            return {
                [SELECTOR_TOOLTIP_INNER]: this._getTitle()
            };
        }
        _getTitle() {
            return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute("data-bs-original-title");
        }
        // Private
        _initializeOnDelegatedTarget(event) {
            return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
        }
        _isAnimated() {
            return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
        }
        _isShown() {
            return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
        }
        _createPopper(tip) {
            const placement = execute(this._config.placement, [ this, tip, this._element ]);
            const attachment = AttachmentMap[placement.toUpperCase()];
            return createPopper(this._element, tip, this._getPopperConfig(attachment));
        }
        _getOffset() {
            const {offset: offset} = this._config;
            if (typeof offset === "string") {
                return offset.split(",").map(value => Number.parseInt(value, 10));
            }
            if (typeof offset === "function") {
                return popperData => offset(popperData, this._element);
            }
            return offset;
        }
        _resolvePossibleFunction(arg) {
            return execute(arg, [ this._element ]);
        }
        _getPopperConfig(attachment) {
            const defaultBsPopperConfig = {
                placement: attachment,
                modifiers: [ {
                    name: "flip",
                    options: {
                        fallbackPlacements: this._config.fallbackPlacements
                    }
                }, {
                    name: "offset",
                    options: {
                        offset: this._getOffset()
                    }
                }, {
                    name: "preventOverflow",
                    options: {
                        boundary: this._config.boundary
                    }
                }, {
                    name: "arrow",
                    options: {
                        element: `.${this.constructor.NAME}-arrow`
                    }
                }, {
                    name: "preSetPlacement",
                    enabled: true,
                    phase: "beforeMain",
                    fn: data => {
                        // Pre-set Popper's placement attribute in order to read the arrow sizes properly.
                        // Otherwise, Popper mixes up the width and height dimensions since the initial arrow style is for top placement
                        this._getTipElement().setAttribute("data-popper-placement", data.state.placement);
                    }
                } ]
            };
            return {
                ...defaultBsPopperConfig,
                ...execute(this._config.popperConfig, [ defaultBsPopperConfig ])
            };
        }
        _setListeners() {
            const triggers = this._config.trigger.split(" ");
            for (const trigger of triggers) {
                if (trigger === "click") {
                    EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, event => {
                        const context = this._initializeOnDelegatedTarget(event);
                        context.toggle();
                    });
                } else if (trigger !== TRIGGER_MANUAL) {
                    const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
                    const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
                    EventHandler.on(this._element, eventIn, this._config.selector, event => {
                        const context = this._initializeOnDelegatedTarget(event);
                        context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
                        context._enter();
                    });
                    EventHandler.on(this._element, eventOut, this._config.selector, event => {
                        const context = this._initializeOnDelegatedTarget(event);
                        context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
                        context._leave();
                    });
                }
            }
            this._hideModalHandler = () => {
                if (this._element) {
                    this.hide();
                }
            };
            EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
        }
        _fixTitle() {
            const title = this._element.getAttribute("title");
            if (!title) {
                return;
            }
            if (!this._element.getAttribute("aria-label") && !this._element.textContent.trim()) {
                this._element.setAttribute("aria-label", title);
            }
            this._element.setAttribute("data-bs-original-title", title);
 // DO NOT USE IT. Is only for backwards compatibility
                        this._element.removeAttribute("title");
        }
        _enter() {
            if (this._isShown() || this._isHovered) {
                this._isHovered = true;
                return;
            }
            this._isHovered = true;
            this._setTimeout(() => {
                if (this._isHovered) {
                    this.show();
                }
            }, this._config.delay.show);
        }
        _leave() {
            if (this._isWithActiveTrigger()) {
                return;
            }
            this._isHovered = false;
            this._setTimeout(() => {
                if (!this._isHovered) {
                    this.hide();
                }
            }, this._config.delay.hide);
        }
        _setTimeout(handler, timeout) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(handler, timeout);
        }
        _isWithActiveTrigger() {
            return Object.values(this._activeTrigger).includes(true);
        }
        _getConfig(config) {
            const dataAttributes = Manipulator.getDataAttributes(this._element);
            for (const dataAttribute of Object.keys(dataAttributes)) {
                if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
                    delete dataAttributes[dataAttribute];
                }
            }
            config = {
                ...dataAttributes,
                ...typeof config === "object" && config ? config : {}
            };
            config = this._mergeConfigObj(config);
            config = this._configAfterMerge(config);
            this._typeCheckConfig(config);
            return config;
        }
        _configAfterMerge(config) {
            config.container = config.container === false ? document.body : getElement(config.container);
            if (typeof config.delay === "number") {
                config.delay = {
                    show: config.delay,
                    hide: config.delay
                };
            }
            if (typeof config.title === "number") {
                config.title = config.title.toString();
            }
            if (typeof config.content === "number") {
                config.content = config.content.toString();
            }
            return config;
        }
        _getDelegateConfig() {
            const config = {};
            for (const [key, value] of Object.entries(this._config)) {
                if (this.constructor.Default[key] !== value) {
                    config[key] = value;
                }
            }
            config.selector = false;
            config.trigger = "manual";
            // In the future can be replaced with:
            // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
            // `Object.fromEntries(keysWithDifferentValues)`
                        return config;
        }
        _disposePopper() {
            if (this._popper) {
                this._popper.destroy();
                this._popper = null;
            }
            if (this.tip) {
                this.tip.remove();
                this.tip = null;
            }
        }
        // Static
        static jQueryInterface(config) {
            return this.each(function() {
                const data = Tooltip.getOrCreateInstance(this, config);
                if (typeof config !== "string") {
                    return;
                }
                if (typeof data[config] === "undefined") {
                    throw new TypeError(`No method named "${config}"`);
                }
                data[config]();
            });
        }
    }
    /**
   * jQuery
   */    defineJQueryPlugin(Tooltip);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap popover.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$3 = "popover";
    const SELECTOR_TITLE = ".popover-header";
    const SELECTOR_CONTENT = ".popover-body";
    const Default$2 = {
        ...Tooltip.Default,
        content: "",
        offset: [ 0, 8 ],
        placement: "right",
        template: '<div class="popover" role="tooltip">' + '<div class="popover-arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div>' + "</div>",
        trigger: "click"
    };
    const DefaultType$2 = {
        ...Tooltip.DefaultType,
        content: "(null|string|element|function)"
    };
    /**
   * Class definition
   */    class Popover extends Tooltip {
        // Getters
        static get Default() {
            return Default$2;
        }
        static get DefaultType() {
            return DefaultType$2;
        }
        static get NAME() {
            return NAME$3;
        }
        // Overrides
        _isWithContent() {
            return this._getTitle() || this._getContent();
        }
        // Private
        _getContentForTemplate() {
            return {
                [SELECTOR_TITLE]: this._getTitle(),
                [SELECTOR_CONTENT]: this._getContent()
            };
        }
        _getContent() {
            return this._resolvePossibleFunction(this._config.content);
        }
        // Static
        static jQueryInterface(config) {
            return this.each(function() {
                const data = Popover.getOrCreateInstance(this, config);
                if (typeof config !== "string") {
                    return;
                }
                if (typeof data[config] === "undefined") {
                    throw new TypeError(`No method named "${config}"`);
                }
                data[config]();
            });
        }
    }
    /**
   * jQuery
   */    defineJQueryPlugin(Popover);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap scrollspy.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$2 = "scrollspy";
    const DATA_KEY$2 = "bs.scrollspy";
    const EVENT_KEY$2 = `.${DATA_KEY$2}`;
    const DATA_API_KEY = ".data-api";
    const EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
    const EVENT_CLICK = `click${EVENT_KEY$2}`;
    const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
    const CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
    const CLASS_NAME_ACTIVE$1 = "active";
    const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
    const SELECTOR_TARGET_LINKS = "[href]";
    const SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
    const SELECTOR_NAV_LINKS = ".nav-link";
    const SELECTOR_NAV_ITEMS = ".nav-item";
    const SELECTOR_LIST_ITEMS = ".list-group-item";
    const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
    const SELECTOR_DROPDOWN = ".dropdown";
    const SELECTOR_DROPDOWN_TOGGLE$1 = ".dropdown-toggle";
    const Default$1 = {
        offset: null,
        // TODO: v6 @deprecated, keep it for backwards compatibility reasons
        rootMargin: "0px 0px -25%",
        smoothScroll: false,
        target: null,
        threshold: [ .1, .5, 1 ]
    };
    const DefaultType$1 = {
        offset: "(number|null)",
        // TODO v6 @deprecated, keep it for backwards compatibility reasons
        rootMargin: "string",
        smoothScroll: "boolean",
        target: "element",
        threshold: "array"
    };
    /**
   * Class definition
   */    class ScrollSpy extends BaseComponent {
        constructor(element, config) {
            super(element, config);
            // this._element is the observablesContainer and config.target the menu links wrapper
                        this._targetLinks = new Map;
            this._observableSections = new Map;
            this._rootElement = getComputedStyle(this._element).overflowY === "visible" ? null : this._element;
            this._activeTarget = null;
            this._observer = null;
            this._previousScrollData = {
                visibleEntryTop: 0,
                parentScrollTop: 0
            };
            this.refresh();
 // initialize
                }
        // Getters
        static get Default() {
            return Default$1;
        }
        static get DefaultType() {
            return DefaultType$1;
        }
        static get NAME() {
            return NAME$2;
        }
        // Public
        refresh() {
            this._initializeTargetsAndObservables();
            this._maybeEnableSmoothScroll();
            if (this._observer) {
                this._observer.disconnect();
            } else {
                this._observer = this._getNewObserver();
            }
            for (const section of this._observableSections.values()) {
                this._observer.observe(section);
            }
        }
        dispose() {
            this._observer.disconnect();
            super.dispose();
        }
        // Private
        _configAfterMerge(config) {
            // TODO: on v6 target should be given explicitly & remove the {target: 'ss-target'} case
            config.target = getElement(config.target) || document.body;
            // TODO: v6 Only for backwards compatibility reasons. Use rootMargin only
                        config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;
            if (typeof config.threshold === "string") {
                config.threshold = config.threshold.split(",").map(value => Number.parseFloat(value));
            }
            return config;
        }
        _maybeEnableSmoothScroll() {
            if (!this._config.smoothScroll) {
                return;
            }
            // unregister any previous listeners
                        EventHandler.off(this._config.target, EVENT_CLICK);
            EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, event => {
                const observableSection = this._observableSections.get(event.target.hash);
                if (observableSection) {
                    event.preventDefault();
                    const root = this._rootElement || window;
                    const height = observableSection.offsetTop - this._element.offsetTop;
                    if (root.scrollTo) {
                        root.scrollTo({
                            top: height,
                            behavior: "smooth"
                        });
                        return;
                    }
                    // Chrome 60 doesn't support `scrollTo`
                                        root.scrollTop = height;
                }
            });
        }
        _getNewObserver() {
            const options = {
                root: this._rootElement,
                threshold: this._config.threshold,
                rootMargin: this._config.rootMargin
            };
            return new IntersectionObserver(entries => this._observerCallback(entries), options);
        }
        // The logic of selection
        _observerCallback(entries) {
            const targetElement = entry => this._targetLinks.get(`#${entry.target.id}`);
            const activate = entry => {
                this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
                this._process(targetElement(entry));
            };
            const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
            const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
            this._previousScrollData.parentScrollTop = parentScrollTop;
            for (const entry of entries) {
                if (!entry.isIntersecting) {
                    this._activeTarget = null;
                    this._clearActiveClass(targetElement(entry));
                    continue;
                }
                const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
                // if we are scrolling down, pick the bigger offsetTop
                                if (userScrollsDown && entryIsLowerThanPrevious) {
                    activate(entry);
                    // if parent isn't scrolled, let's keep the first visible item, breaking the iteration
                                        if (!parentScrollTop) {
                        return;
                    }
                    continue;
                }
                // if we are scrolling up, pick the smallest offsetTop
                                if (!userScrollsDown && !entryIsLowerThanPrevious) {
                    activate(entry);
                }
            }
        }
        _initializeTargetsAndObservables() {
            this._targetLinks = new Map;
            this._observableSections = new Map;
            const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
            for (const anchor of targetLinks) {
                // ensure that the anchor has an id and is not disabled
                if (!anchor.hash || isDisabled(anchor)) {
                    continue;
                }
                const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);
                // ensure that the observableSection exists & is visible
                                if (isVisible(observableSection)) {
                    this._targetLinks.set(decodeURI(anchor.hash), anchor);
                    this._observableSections.set(anchor.hash, observableSection);
                }
            }
        }
        _process(target) {
            if (this._activeTarget === target) {
                return;
            }
            this._clearActiveClass(this._config.target);
            this._activeTarget = target;
            target.classList.add(CLASS_NAME_ACTIVE$1);
            this._activateParents(target);
            EventHandler.trigger(this._element, EVENT_ACTIVATE, {
                relatedTarget: target
            });
        }
        _activateParents(target) {
            // Activate dropdown parents
            if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
                SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
                return;
            }
            for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
                // Set triggered links parents as active
                // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
                for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
                    item.classList.add(CLASS_NAME_ACTIVE$1);
                }
            }
        }
        _clearActiveClass(parent) {
            parent.classList.remove(CLASS_NAME_ACTIVE$1);
            const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
            for (const node of activeNodes) {
                node.classList.remove(CLASS_NAME_ACTIVE$1);
            }
        }
        // Static
        static jQueryInterface(config) {
            return this.each(function() {
                const data = ScrollSpy.getOrCreateInstance(this, config);
                if (typeof config !== "string") {
                    return;
                }
                if (data[config] === undefined || config.startsWith("_") || config === "constructor") {
                    throw new TypeError(`No method named "${config}"`);
                }
                data[config]();
            });
        }
    }
    /**
   * Data API implementation
   */    EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
        for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
            ScrollSpy.getOrCreateInstance(spy);
        }
    });
    /**
   * jQuery
   */    defineJQueryPlugin(ScrollSpy);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap tab.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME$1 = "tab";
    const DATA_KEY$1 = "bs.tab";
    const EVENT_KEY$1 = `.${DATA_KEY$1}`;
    const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
    const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
    const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
    const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
    const EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
    const EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
    const EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
    const ARROW_LEFT_KEY = "ArrowLeft";
    const ARROW_RIGHT_KEY = "ArrowRight";
    const ARROW_UP_KEY = "ArrowUp";
    const ARROW_DOWN_KEY = "ArrowDown";
    const HOME_KEY = "Home";
    const END_KEY = "End";
    const CLASS_NAME_ACTIVE = "active";
    const CLASS_NAME_FADE$1 = "fade";
    const CLASS_NAME_SHOW$1 = "show";
    const CLASS_DROPDOWN = "dropdown";
    const SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
    const SELECTOR_DROPDOWN_MENU = ".dropdown-menu";
    const NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
    const SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
    const SELECTOR_OUTER = ".nav-item, .list-group-item";
    const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
    const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]';
 // TODO: could only be `tab` in v6
        const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
    const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`
    /**
   * Class definition
   */;
    class Tab extends BaseComponent {
        constructor(element) {
            super(element);
            this._parent = this._element.closest(SELECTOR_TAB_PANEL);
            if (!this._parent) {
                return;
                // TODO: should throw exception in v6
                // throw new TypeError(`${element.outerHTML} has not a valid parent ${SELECTOR_INNER_ELEM}`)
                        }
            // Set up initial aria attributes
                        this._setInitialAttributes(this._parent, this._getChildren());
            EventHandler.on(this._element, EVENT_KEYDOWN, event => this._keydown(event));
        }
        // Getters
        static get NAME() {
            return NAME$1;
        }
        // Public
        show() {
            // Shows this elem and deactivate the active sibling if exists
            const innerElem = this._element;
            if (this._elemIsActive(innerElem)) {
                return;
            }
            // Search for active tab on same parent to deactivate it
                        const active = this._getActiveElem();
            const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
                relatedTarget: innerElem
            }) : null;
            const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
                relatedTarget: active
            });
            if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
                return;
            }
            this._deactivate(active, innerElem);
            this._activate(innerElem, active);
        }
        // Private
        _activate(element, relatedElem) {
            if (!element) {
                return;
            }
            element.classList.add(CLASS_NAME_ACTIVE);
            this._activate(SelectorEngine.getElementFromSelector(element));
 // Search and activate/show the proper section
                        const complete = () => {
                if (element.getAttribute("role") !== "tab") {
                    element.classList.add(CLASS_NAME_SHOW$1);
                    return;
                }
                element.removeAttribute("tabindex");
                element.setAttribute("aria-selected", true);
                this._toggleDropDown(element, true);
                EventHandler.trigger(element, EVENT_SHOWN$1, {
                    relatedTarget: relatedElem
                });
            };
            this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
        }
        _deactivate(element, relatedElem) {
            if (!element) {
                return;
            }
            element.classList.remove(CLASS_NAME_ACTIVE);
            element.blur();
            this._deactivate(SelectorEngine.getElementFromSelector(element));
 // Search and deactivate the shown section too
                        const complete = () => {
                if (element.getAttribute("role") !== "tab") {
                    element.classList.remove(CLASS_NAME_SHOW$1);
                    return;
                }
                element.setAttribute("aria-selected", false);
                element.setAttribute("tabindex", "-1");
                this._toggleDropDown(element, false);
                EventHandler.trigger(element, EVENT_HIDDEN$1, {
                    relatedTarget: relatedElem
                });
            };
            this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
        }
        _keydown(event) {
            if (![ ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY ].includes(event.key)) {
                return;
            }
            event.stopPropagation();
 // stopPropagation/preventDefault both added to support up/down keys without scrolling the page
                        event.preventDefault();
            const children = this._getChildren().filter(element => !isDisabled(element));
            let nextActiveElement;
            if ([ HOME_KEY, END_KEY ].includes(event.key)) {
                nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
            } else {
                const isNext = [ ARROW_RIGHT_KEY, ARROW_DOWN_KEY ].includes(event.key);
                nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
            }
            if (nextActiveElement) {
                nextActiveElement.focus({
                    preventScroll: true
                });
                Tab.getOrCreateInstance(nextActiveElement).show();
            }
        }
        _getChildren() {
            // collection of inner elements
            return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
        }
        _getActiveElem() {
            return this._getChildren().find(child => this._elemIsActive(child)) || null;
        }
        _setInitialAttributes(parent, children) {
            this._setAttributeIfNotExists(parent, "role", "tablist");
            for (const child of children) {
                this._setInitialAttributesOnChild(child);
            }
        }
        _setInitialAttributesOnChild(child) {
            child = this._getInnerElement(child);
            const isActive = this._elemIsActive(child);
            const outerElem = this._getOuterElement(child);
            child.setAttribute("aria-selected", isActive);
            if (outerElem !== child) {
                this._setAttributeIfNotExists(outerElem, "role", "presentation");
            }
            if (!isActive) {
                child.setAttribute("tabindex", "-1");
            }
            this._setAttributeIfNotExists(child, "role", "tab");
            // set attributes to the related panel too
                        this._setInitialAttributesOnTargetPanel(child);
        }
        _setInitialAttributesOnTargetPanel(child) {
            const target = SelectorEngine.getElementFromSelector(child);
            if (!target) {
                return;
            }
            this._setAttributeIfNotExists(target, "role", "tabpanel");
            if (child.id) {
                this._setAttributeIfNotExists(target, "aria-labelledby", `${child.id}`);
            }
        }
        _toggleDropDown(element, open) {
            const outerElem = this._getOuterElement(element);
            if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
                return;
            }
            const toggle = (selector, className) => {
                const element = SelectorEngine.findOne(selector, outerElem);
                if (element) {
                    element.classList.toggle(className, open);
                }
            };
            toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
            toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
            outerElem.setAttribute("aria-expanded", open);
        }
        _setAttributeIfNotExists(element, attribute, value) {
            if (!element.hasAttribute(attribute)) {
                element.setAttribute(attribute, value);
            }
        }
        _elemIsActive(elem) {
            return elem.classList.contains(CLASS_NAME_ACTIVE);
        }
        // Try to get the inner element (usually the .nav-link)
        _getInnerElement(elem) {
            return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
        }
        // Try to get the outer element (usually the .nav-item)
        _getOuterElement(elem) {
            return elem.closest(SELECTOR_OUTER) || elem;
        }
        // Static
        static jQueryInterface(config) {
            return this.each(function() {
                const data = Tab.getOrCreateInstance(this);
                if (typeof config !== "string") {
                    return;
                }
                if (data[config] === undefined || config.startsWith("_") || config === "constructor") {
                    throw new TypeError(`No method named "${config}"`);
                }
                data[config]();
            });
        }
    }
    /**
   * Data API implementation
   */    EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function(event) {
        if ([ "A", "AREA" ].includes(this.tagName)) {
            event.preventDefault();
        }
        if (isDisabled(this)) {
            return;
        }
        Tab.getOrCreateInstance(this).show();
    });
    /**
   * Initialize on focus
   */    EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
        for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
            Tab.getOrCreateInstance(element);
        }
    });
    /**
   * jQuery
   */    defineJQueryPlugin(Tab);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap toast.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
    /**
   * Constants
   */    const NAME = "toast";
    const DATA_KEY = "bs.toast";
    const EVENT_KEY = `.${DATA_KEY}`;
    const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
    const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
    const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
    const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
    const EVENT_HIDE = `hide${EVENT_KEY}`;
    const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
    const EVENT_SHOW = `show${EVENT_KEY}`;
    const EVENT_SHOWN = `shown${EVENT_KEY}`;
    const CLASS_NAME_FADE = "fade";
    const CLASS_NAME_HIDE = "hide";
 // @deprecated - kept here only for backwards compatibility
        const CLASS_NAME_SHOW = "show";
    const CLASS_NAME_SHOWING = "showing";
    const DefaultType = {
        animation: "boolean",
        autohide: "boolean",
        delay: "number"
    };
    const Default = {
        animation: true,
        autohide: true,
        delay: 5e3
    };
    /**
   * Class definition
   */    class Toast extends BaseComponent {
        constructor(element, config) {
            super(element, config);
            this._timeout = null;
            this._hasMouseInteraction = false;
            this._hasKeyboardInteraction = false;
            this._setListeners();
        }
        // Getters
        static get Default() {
            return Default;
        }
        static get DefaultType() {
            return DefaultType;
        }
        static get NAME() {
            return NAME;
        }
        // Public
        show() {
            const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);
            if (showEvent.defaultPrevented) {
                return;
            }
            this._clearTimeout();
            if (this._config.animation) {
                this._element.classList.add(CLASS_NAME_FADE);
            }
            const complete = () => {
                this._element.classList.remove(CLASS_NAME_SHOWING);
                EventHandler.trigger(this._element, EVENT_SHOWN);
                this._maybeScheduleHide();
            };
            this._element.classList.remove(CLASS_NAME_HIDE);
 // @deprecated
                        reflow(this._element);
            this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
            this._queueCallback(complete, this._element, this._config.animation);
        }
        hide() {
            if (!this.isShown()) {
                return;
            }
            const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);
            if (hideEvent.defaultPrevented) {
                return;
            }
            const complete = () => {
                this._element.classList.add(CLASS_NAME_HIDE);
 // @deprecated
                                this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
                EventHandler.trigger(this._element, EVENT_HIDDEN);
            };
            this._element.classList.add(CLASS_NAME_SHOWING);
            this._queueCallback(complete, this._element, this._config.animation);
        }
        dispose() {
            this._clearTimeout();
            if (this.isShown()) {
                this._element.classList.remove(CLASS_NAME_SHOW);
            }
            super.dispose();
        }
        isShown() {
            return this._element.classList.contains(CLASS_NAME_SHOW);
        }
        // Private
        _maybeScheduleHide() {
            if (!this._config.autohide) {
                return;
            }
            if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
                return;
            }
            this._timeout = setTimeout(() => {
                this.hide();
            }, this._config.delay);
        }
        _onInteraction(event, isInteracting) {
            switch (event.type) {
              case "mouseover":
              case "mouseout":
                {
                    this._hasMouseInteraction = isInteracting;
                    break;
                }

              case "focusin":
              case "focusout":
                {
                    this._hasKeyboardInteraction = isInteracting;
                    break;
                }
            }
            if (isInteracting) {
                this._clearTimeout();
                return;
            }
            const nextElement = event.relatedTarget;
            if (this._element === nextElement || this._element.contains(nextElement)) {
                return;
            }
            this._maybeScheduleHide();
        }
        _setListeners() {
            EventHandler.on(this._element, EVENT_MOUSEOVER, event => this._onInteraction(event, true));
            EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onInteraction(event, false));
            EventHandler.on(this._element, EVENT_FOCUSIN, event => this._onInteraction(event, true));
            EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onInteraction(event, false));
        }
        _clearTimeout() {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        // Static
        static jQueryInterface(config) {
            return this.each(function() {
                const data = Toast.getOrCreateInstance(this, config);
                if (typeof config === "string") {
                    if (typeof data[config] === "undefined") {
                        throw new TypeError(`No method named "${config}"`);
                    }
                    data[config](this);
                }
            });
        }
    }
    /**
   * Data API implementation
   */    enableDismissTrigger(Toast);
    /**
   * jQuery
   */    defineJQueryPlugin(Toast);
    /**
   * --------------------------------------------------------------------------
   * Bootstrap index.umd.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */    const index_umd = {
        Alert: Alert,
        Button: Button,
        Carousel: Carousel,
        Collapse: Collapse,
        Dropdown: Dropdown,
        Modal: Modal,
        Offcanvas: Offcanvas,
        Popover: Popover,
        ScrollSpy: ScrollSpy,
        Tab: Tab,
        Toast: Toast,
        Tooltip: Tooltip
    };
    return index_umd;
});

(function(root, factory) {
    var pluginName = "Navigation";
    if (typeof define === "function" && define.amd) {
        define([], factory(pluginName));
    } else if (typeof exports === "object") {
        module.exports = factory(pluginName);
    } else {
        root[pluginName] = factory(pluginName);
    }
})(this, function(pluginName) {
    "use strict";
    var defaults = {
        breakpoint: 992,
        submenuTrigger: "hover",
        overlay: true,
        overlayColor: "rgba(0, 0, 0, 0.7)",
        autoSubmenuIndicator: true,
        submenuIndicatorTrigger: false,
        hideSubWhenClickOut: true,
        scrollMomentum: true,
        scrollSpy: false,
        scrollSpySpeed: 1e3,
        scrollSpyOffset: 0,
        landscapeClass: "navigation-landscape",
        onInit: function() {},
        onLandscape: function() {},
        onShowOffCanvas: function() {},
        onHideOffCanvas: function() {}
    };
    // Merge defaults with user options
        var extend = function(target, options) {
        var prop, extended = {};
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };
    // Events namespacing
        var events = {
        on: function on(event, callback, useCapture) {
            if (!this.namespaces) // save the namespaces on the DOM element itself
            this.namespaces = {};
            this.namespaces[event] = callback;
            var options = useCapture || false;
            this.addEventListener(event.split(".")[0], callback, options);
            return this;
        },
        off: function off(event, useCapture) {
            if (this.namespaces !== undefined) {
                if (this.namespaces[event]) {
                    this.removeEventListener(event.split(".")[0], this.namespaces[event], useCapture);
                    delete this.namespaces[event];
                    return this;
                }
            }
        },
        check: function check(event) {
            if (this.namespaces !== undefined) {
                if (this.namespaces[event]) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    };
    window.on = document.on = Element.prototype.on = events.on;
    window.off = document.off = Element.prototype.off = events.off;
    window.check = document.check = Element.prototype.check = events.check;
    // Check if given element has a parent with the given class
        var closestByClass = function(el, clazz) {
        while (el !== null && el.tagName.toLowerCase() !== "html") {
            if (el.classList.length > 0 && el.classList.contains(clazz)) {
                return true;
            } else {
                el = el.parentNode;
            }
        }
        return false;
    };
    // Return the window's width
        var windowWidth = function() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    };
    // Constructor
        function Plugin(element, options) {
        var nav, clickEvent = "click.link", bigScreenFlag = Number.MAX_VALUE, smallScreenFlag = 1, hoverEnabled;
        if (element !== null) {
            nav = element;
        } else {
            return false;
        }
        // Initialize the navigation
                nav.init = function(options) {
            nav.options = extend(defaults, options);
            nav.navigationBody = nav.getElementsByClassName("navigation-body")[0];
            nav.menuItems = nav.querySelectorAll(".navigation-item, .navigation-dropdown-item");
            nav.menuLinks = nav.querySelectorAll(".navigation-link, .navigation-dropdown-link");
            var submenus = nav.querySelectorAll(".navigation-dropdown, .navigation-megamenu");
            for (var i = 0; i < submenus.length; i++) {
                submenus[i].className += " navigation-submenu";
                submenus[i].parentNode.className += " has-submenu";
            }
            if (nav.options.autoSubmenuIndicator) {
                for (var i = 0; i < nav.menuItems.length; i++) {
                    if (nav.menuItems[i].classList.contains("has-submenu")) {
                        var indicator = document.createElement("span");
                        indicator.classList.add("submenu-indicator");
                        if (nav.menuItems[i].children[1].classList.contains("navigation-dropdown-left")) {
                            indicator.classList.add("submenu-indicator-left");
                        }
                        nav.menuItems[i].children[0].appendChild(indicator);
                    }
                }
            }
            hoverEnabled = !matchMedia("(hover: none)").matches;
            navigationMode();
            window.on("resize", navigationMode);
            if (nav.options.overlay) {
                nav.overlayPanel = document.createElement("div");
                nav.overlayPanel.classList.add("overlay-panel");
                nav.overlayPanel.style.background = nav.options.overlayColor;
                nav.appendChild(nav.overlayPanel);
                nav.overlayPanel.addEventListener("click", nav.toggleOffcanvas);
            }
            nav.getElementsByClassName("navigation-button-toggler")[0].on("click", function(e) {
                e.stopPropagation();
                e.preventDefault();
                nav.toggleOffcanvas();
            });
            nav.getElementsByClassName("navigation-body-close-button")[0].on("click", nav.toggleOffcanvas);
            if (nav.options.hideSubWhenClickOut) {
                document.on("touchstart.body", function(e) {
                    if (closestByClass(e.target, "navigation") === false) {
                        nav.hideSubmenus("BODY");
                    }
                });
                document.on("click.body", function(e) {
                    if (closestByClass(e.target, "navigation") === false) {
                        nav.hideSubmenus("BODY");
                    }
                });
            }
            var tabs = nav.querySelectorAll(".navigation-tabs");
            if (tabs.length > 0) {
                for (var i = 0; i < tabs.length; i++) {
                    navigationTabs(tabs[i]);
                }
            }
            if (nav.options.scrollMomentum) {
                nav.navigationBody.classList.add("scroll-momentum");
            }
            nav.options.onInit.call();
        }
        // Navigation mode
        ;
        var navigationMode = function() {
            fixSubmenuRightPositionAll();
            if (windowWidth() < nav.options.breakpoint && bigScreenFlag > nav.options.breakpoint) {
                nav.classList.remove(nav.options.landscapeClass);
                nav.hideSubmenus("BODY");
                turnOffEvents();
                if (nav.options.submenuIndicatorTrigger) {
                    clickIndicators();
                } else {
                    click(clickEvent);
                    clickIndicators();
                }
            }
            if (windowWidth() > nav.options.breakpoint && smallScreenFlag < nav.options.breakpoint) {
                if (!nav.classList.contains(nav.options.landscapeClass)) {
                    nav.className += " " + nav.options.landscapeClass;
                }
                nav.hideSubmenus("BODY");
                turnOffEvents();
                if (nav.options.submenuTrigger === "click" || navigator.userAgent.match(/Mobi/i) || navigator.maxTouchPoints > 1 && hoverEnabled) {
                    click(clickEvent);
                } else {
                    hover();
                }
                nav.options.onLandscape.call();
            }
            bigScreenFlag = windowWidth();
            smallScreenFlag = windowWidth();
        };
        // Show the Offcanvas
                nav.toggleOffcanvas = function() {
            if (!nav.classList.contains(nav.options.landscapeClass)) {
                if (!nav.navigationBody.classList.contains("is-visible") && !nav.classList.contains(nav.options.landscapeClass)) {
                    nav.navigationBody.className += " is-visible";
                    nav.overlayPanel.classList.add("is-visible");
                    nav.options.onShowOffCanvas.call();
                } else {
                    nav.navigationBody.className += " is-invisible";
                    if (!nav.navigationBody.check("transitionend")) {
                        nav.navigationBody.on("transitionend", function() {
                            nav.navigationBody.classList.remove("is-visible");
                            nav.navigationBody.classList.remove("is-invisible");
                            nav.navigationBody.off("transitionend");
                        });
                    }
                    nav.overlayPanel.className += " is-invisible";
                    if (!nav.overlayPanel.check("transitionend")) {
                        nav.overlayPanel.on("transitionend", function() {
                            nav.overlayPanel.classList.remove("is-visible");
                            nav.overlayPanel.classList.remove("is-invisible");
                            nav.overlayPanel.off("transitionend");
                        });
                    }
                    nav.options.onHideOffCanvas.call();
                }
            }
        };
        // Show a submenu
                nav.showSubmenu = function(el) {
            if (!el.nextElementSibling.classList.contains("is-visible")) {
                el.nextElementSibling.className += " is-visible";
            }
            fixSubmenuRightPositionItem(el);
        };
        // Hide an item
                function hide(item, delayMultiplyer) {
            setTimeout(function() {
                item.classList.remove("is-visible");
            }, 100 * delayMultiplyer);
        }
        // Hide a submenu
                nav.hideSubmenus = function(el) {
            var submenus;
            if (el === "BODY") {
                submenus = nav.querySelectorAll(".navigation-submenu.is-visible");
            } else {
                submenus = el.parentNode.querySelectorAll(".navigation-submenu.is-visible");
            }
            for (var i = submenus.length - 1; i >= 0; i--) {
                if (nav.classList.contains(nav.options.landscapeClass)) {
                    hide(submenus[i], submenus.length - i);
                } else {
                    submenus[i].classList.remove("is-visible");
                }
                submenus[i].parentNode.classList.remove("is-active");
                if (submenus[i].previousElementSibling.getElementsByClassName("submenu-indicator").length > 0) {
                    submenus[i].previousElementSibling.lastElementChild.classList.remove("is-active");
                }
            }
        };
        // Click on menu links to show submenus
                var click = function(eventName) {
            for (var i = 0; i < nav.menuLinks.length; i++) {
                nav.menuLinks[i].on(eventName, function(e) {
                    if (e.target.parentNode.classList.contains("has-submenu")) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.target.parentNode.classList.contains("is-active")) {
                            e.target.parentNode.classList.remove("is-active");
                            if (e.target.getElementsByClassName("submenu-indicator").length > 0) {
                                e.target.lastElementChild.classList.remove("is-active");
                            }
                            nav.hideSubmenus(e.target);
                        } else {
                            if (e.target.parentNode.classList.contains("navigation-item")) {
                                nav.hideSubmenus("BODY");
                            }
                            e.target.parentNode.className += " is-active";
                            if (e.target.getElementsByClassName("submenu-indicator").length > 0) {
                                e.target.lastElementChild.className += " is-active";
                            }
                            nav.hideSubmenus(e.target.parentNode);
                            nav.showSubmenu(e.target);
                            return false;
                        }
                        if (e.target.getAttribute("target") === "_blank" || e.target.getAttribute("target") === "blank") {
                            window.open(e.target.getAttribute("href"));
                        } else {
                            if (e.target.getAttribute("href") === "#" || e.target.getAttribute("href") === "" || e.target.getAttribute("href") === "javascript:void(0)") {
                                return false;
                            } else {
                                window.location.href = e.target.getAttribute("href");
                            }
                        }
                    }
                });
            }
        };
        // Click on submenus indicators to show submenus
                var clickIndicators = function() {
            nav.navigationBody.on("click.indicator", function(e) {
                if (e.target.classList.length > 0 && e.target.classList.contains("submenu-indicator")) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.target.classList.contains("is-active")) {
                        e.target.classList.remove("is-active");
                        e.target.parentNode.parentNode.classList.remove("is-active");
                        nav.hideSubmenus(e.target.parentNode);
                    } else {
                        if (e.target.parentNode.parentNode.classList.contains("navigation-item")) {
                            nav.hideSubmenus("BODY");
                        }
                        e.target.className += " is-active";
                        e.target.parentNode.parentNode.classList.add("is-active");
                        nav.showSubmenu(e.target.parentNode);
                    }
                }
            });
        };
        // Hover on menu items to show submenus
                var hover = function() {
            function getPosition(el) {
                var rect = el.getBoundingClientRect();
                return {
                    x: rect.left,
                    y: rect.top
                };
            }
            for (var i = 0; i < nav.menuItems.length; i++) {
                if (nav.menuItems[i].classList.contains("has-submenu")) {
                    nav.menuItems[i].on("mouseenter.item", function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.target.classList.contains("has-submenu")) {
                            nav.showSubmenu(e.target.firstElementChild);
                            e.target.className += " is-active";
                        }
                    });
                    nav.menuItems[i].on("mouseleave.item", function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.target.classList.contains("has-submenu")) {
                            var coords = getPosition(e.target.lastElementChild);
                            if (e.clientX < coords.x || e.clientX > coords.x + e.target.lastElementChild.offsetWidth || (e.clientY < coords.y || e.clientY > coords.y + e.target.lastElementChild.offsetHeight)) {
                                nav.hideSubmenus(e.target.firstElementChild);
                                e.target.classList.remove("is-active");
                            }
                        }
                    });
                }
            }
        };
        // Turn off the events
                var turnOffEvents = function() {
            nav.navigationBody.off("click.indicator");
            for (var i = 0; i < nav.menuItems.length; i++) {
                nav.menuItems[i].off("mouseenter.item");
                nav.menuItems[i].off("mouseleave.item");
            }
            for (var i = 0; i < nav.menuLinks.length; i++) {
                nav.menuLinks[i].off("click.link");
            }
        };
        // Fix submenu position on right
                var fixSubmenuRightPositionItem = function(el) {
            if (windowWidth() > nav.options.breakpoint) {
                var navWidth = nav.navigationBody.offsetWidth;
                if (el.classList.contains("navigation-link")) {
                    if (el.offsetLeft + el.nextElementSibling.offsetWidth > navWidth) {
                        el.nextElementSibling.style.right = 0;
                    } else {
                        el.nextElementSibling.style.right = "auto";
                    }
                }
            }
        };
        var fixSubmenuRightPositionAll = function() {
            var submenus = nav.navigationBody.querySelectorAll(".navigation-item > .navigation-submenu");
            var navWidth = nav.navigationBody.offsetWidth;
            for (var i = 0; i < submenus.length; i++) {
                if (submenus[i].previousElementSibling.offsetLeft + submenus[i].offsetWidth > navWidth) {
                    submenus[i].style.right = 0;
                } else {
                    submenus[i].style.right = "auto";
                }
            }
        };
        // Navigation tabs
                var navigationTabs = function(tab) {
            var navs = tab.getElementsByClassName("navigation-tabs-nav-item");
            var panes = tab.getElementsByClassName("navigation-tabs-pane");
            for (var i = 0; i < navs.length; i++) {
                navs[i].on("click.tabs", function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    for (var i = 0; i < navs.length; i++) {
                        navs[i].classList.remove("is-active");
                    }
                    e.target.parentNode.classList.add("is-active");
                    for (var i = 0; i < panes.length; i++) {
                        panes[i].classList.remove("is-active");
                    }
                    panes[getIndex(e.target.parentNode)].classList.add("is-active");
                });
            }
            function getIndex(item) {
                var children = item.parentNode.childNodes;
                var num = 0;
                for (var i = 0; i < children.length; i++) {
                    if (children[i] == item) return num;
                    if (children[i].nodeType == 1) num++;
                }
                return -1;
            }
        };
        //************************
        // Scrollspy functionality
        //************************
                var scrollSpy = function() {
            var links = nav.querySelectorAll(".navigation-link[href*='#']");
            // Adds two numbers together
                        var add = function(ex1, ex2) {
                return parseInt(ex1, 10) + parseInt(ex2, 10);
            };
            // Find the elements
                        var findElements = function(links) {
                var elements = [];
                for (var i = 0; i < links.length; i++) {
                    var hash = links[i].getAttribute("href");
                    if (hash.length > 1 && hash.substring(0, 1) === "#") {
                        var element = document.getElementById(hash.substr(1)), top = Math.floor(element.offsetTop), bottom = top + Math.floor(element.offsetHeight);
                        elements.push({
                            element: hash,
                            hash: hash,
                            top: top,
                            bottom: bottom
                        });
                    }
                }
                return elements;
            };
            // Find our link from a hash
                        var findLink = function(links, hash) {
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    if (link.getAttribute("href") === hash) {
                        return link;
                    }
                }
            };
            // Reset classes on our elements
                        var resetClasses = function(links) {
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    link.parentNode.classList.remove("is-active");
                }
            };
            // Smooth scroll
                        var smoothScroll = function(destination, duration, easing, callback) {
                var easings = {
                    linear: function linear(t) {
                        return t;
                    },
                    easeInQuad: function easeInQuad(t) {
                        return t * t;
                    },
                    easeOutQuad: function easeOutQuad(t) {
                        return t * (2 - t);
                    },
                    easeInOutQuad: function easeInOutQuad(t) {
                        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    },
                    easeInCubic: function easeInCubic(t) {
                        return t * t * t;
                    },
                    easeOutCubic: function easeOutCubic(t) {
                        return --t * t * t + 1;
                    },
                    easeInOutCubic: function easeInOutCubic(t) {
                        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                    },
                    easeInQuart: function easeInQuart(t) {
                        return t * t * t * t;
                    },
                    easeOutQuart: function easeOutQuart(t) {
                        return 1 - --t * t * t * t;
                    },
                    easeInOutQuart: function easeInOutQuart(t) {
                        return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
                    },
                    easeInQuint: function easeInQuint(t) {
                        return t * t * t * t * t;
                    },
                    easeOutQuint: function easeOutQuint(t) {
                        return 1 + --t * t * t * t * t;
                    },
                    easeInOutQuint: function easeInOutQuint(t) {
                        return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
                    }
                };
                var start = window.pageYOffset;
                var startTime = "now" in window.performance ? performance.now() : (new Date).getTime();
                var documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
                var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName("body")[0].clientHeight;
                var destinationOffset = typeof destination === "number" ? destination : destination.offsetTop + nav.options.scrollSpyOffset;
                var destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);
                if ("requestAnimationFrame" in window === false) {
                    window.scroll(0, destinationOffsetToScroll);
                    if (callback) {
                        callback();
                    }
                    return;
                }
                function scroll() {
                    var now = "now" in window.performance ? performance.now() : (new Date).getTime();
                    var time = Math.min(1, (now - startTime) / duration);
                    var timeFunction = easings[easing](time);
                    if (destinationOffsetToScroll < 0) {
                        destinationOffsetToScroll = 0;
                    }
                    window.scroll(0, Math.ceil(timeFunction * (destinationOffsetToScroll - start) + start));
                    if (window.pageYOffset === destinationOffsetToScroll) {
                        if (callback) {
                            callback();
                        }
                        return;
                    }
                    requestAnimationFrame(scroll);
                }
                scroll();
            };
            // For each scrollspy instance
                        var scrollSpyInit = function() {
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    link.on("click.scrollSpy", function(e) {
                        if (!e.target.classList.contains("submenu-indicator") && e.target.getAttribute("href").length > 1 && e.target.getAttribute("href").substring(0, 1) === "#") {
                            var target = e.target.getAttribute("href"), section = document.getElementById(target.replace("#", ""));
                            if (target.length > 0) {
                                smoothScroll(document.querySelector(target), nav.options.scrollSpySpeed, "easeInOutCubic");
                            }
                        }
                    });
                }
                var elements = findElements(links);
                window.on("resize.scrollSpy", function() {
                    elements = [];
                    elements = findElements(links);
                });
                window.on("scroll.scrollSpy", function() {
                    var position = {
                        top: add(this.pageYOffset, Math.abs(nav.options.scrollSpyOffset)),
                        left: this.pageXOffset
                    };
                    var link;
                    for (var i = 0; i < elements.length; i++) {
                        var current = elements[i];
                        if (position.top >= current.top && position.top < current.bottom) {
                            var hash = current.hash;
                            link = findLink(links, hash);
                            if (link) {
                                resetClasses(links);
                                link.parentNode.classList.add("is-active");
                                break;
                            }
                        }
                    }
                });
            };
            scrollSpyInit();
        };
        nav.init(options);
        if (nav.options.scrollSpy) {
            window.onload = function() {
                scrollSpy();
            };
        }
        return nav;
    }
    return Plugin;
});

/**
 * Swiper 11.1.14
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * https://swiperjs.com
 *
 * Copyright 2014-2024 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: September 12, 2024
 */ var Swiper = function() {
    "use strict";
    function e(e) {
        return null !== e && "object" == typeof e && "constructor" in e && e.constructor === Object;
    }
    function t(s, a) {
        void 0 === s && (s = {}), void 0 === a && (a = {}), Object.keys(a).forEach(i => {
            void 0 === s[i] ? s[i] = a[i] : e(a[i]) && e(s[i]) && Object.keys(a[i]).length > 0 && t(s[i], a[i]);
        });
    }
    const s = {
        body: {},
        addEventListener() {},
        removeEventListener() {},
        activeElement: {
            blur() {},
            nodeName: ""
        },
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementById: () => null,
        createEvent: () => ({
            initEvent() {}
        }),
        createElement: () => ({
            children: [],
            childNodes: [],
            style: {},
            setAttribute() {},
            getElementsByTagName: () => []
        }),
        createElementNS: () => ({}),
        importNode: () => null,
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        }
    };
    function a() {
        const e = "undefined" != typeof document ? document : {};
        return t(e, s), e;
    }
    const i = {
        document: s,
        navigator: {
            userAgent: ""
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        },
        history: {
            replaceState() {},
            pushState() {},
            go() {},
            back() {}
        },
        CustomEvent: function() {
            return this;
        },
        addEventListener() {},
        removeEventListener() {},
        getComputedStyle: () => ({
            getPropertyValue: () => ""
        }),
        Image() {},
        Date() {},
        screen: {},
        setTimeout() {},
        clearTimeout() {},
        matchMedia: () => ({}),
        requestAnimationFrame: e => "undefined" == typeof setTimeout ? (e(), null) : setTimeout(e, 0),
        cancelAnimationFrame(e) {
            "undefined" != typeof setTimeout && clearTimeout(e);
        }
    };
    function r() {
        const e = "undefined" != typeof window ? window : {};
        return t(e, i), e;
    }
    function n(e) {
        return void 0 === e && (e = ""), e.trim().split(" ").filter(e => !!e.trim());
    }
    function l(e, t) {
        return void 0 === t && (t = 0), setTimeout(e, t);
    }
    function o() {
        return Date.now();
    }
    function d(e, t) {
        void 0 === t && (t = "x");
        const s = r();
        let a, i, n;
        const l = function(e) {
            const t = r();
            let s;
            return t.getComputedStyle && (s = t.getComputedStyle(e, null)), !s && e.currentStyle && (s = e.currentStyle), 
            s || (s = e.style), s;
        }(e);
        return s.WebKitCSSMatrix ? (i = l.transform || l.webkitTransform, i.split(",").length > 6 && (i = i.split(", ").map(e => e.replace(",", ".")).join(", ")), 
        n = new s.WebKitCSSMatrix("none" === i ? "" : i)) : (n = l.MozTransform || l.OTransform || l.MsTransform || l.msTransform || l.transform || l.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,"), 
        a = n.toString().split(",")), "x" === t && (i = s.WebKitCSSMatrix ? n.m41 : 16 === a.length ? parseFloat(a[12]) : parseFloat(a[4])), 
        "y" === t && (i = s.WebKitCSSMatrix ? n.m42 : 16 === a.length ? parseFloat(a[13]) : parseFloat(a[5])), 
        i || 0;
    }
    function c(e) {
        return "object" == typeof e && null !== e && e.constructor && "Object" === Object.prototype.toString.call(e).slice(8, -1);
    }
    function p() {
        const e = Object(arguments.length <= 0 ? void 0 : arguments[0]), t = [ "__proto__", "constructor", "prototype" ];
        for (let a = 1; a < arguments.length; a += 1) {
            const i = a < 0 || arguments.length <= a ? void 0 : arguments[a];
            if (null != i && (s = i, !("undefined" != typeof window && void 0 !== window.HTMLElement ? s instanceof HTMLElement : s && (1 === s.nodeType || 11 === s.nodeType)))) {
                const s = Object.keys(Object(i)).filter(e => t.indexOf(e) < 0);
                for (let t = 0, a = s.length; t < a; t += 1) {
                    const a = s[t], r = Object.getOwnPropertyDescriptor(i, a);
                    void 0 !== r && r.enumerable && (c(e[a]) && c(i[a]) ? i[a].__swiper__ ? e[a] = i[a] : p(e[a], i[a]) : !c(e[a]) && c(i[a]) ? (e[a] = {}, 
                    i[a].__swiper__ ? e[a] = i[a] : p(e[a], i[a])) : e[a] = i[a]);
                }
            }
        }
        var s;
        return e;
    }
    function u(e, t, s) {
        e.style.setProperty(t, s);
    }
    function m(e) {
        let {swiper: t, targetPosition: s, side: a} = e;
        const i = r(), n = -t.translate;
        let l, o = null;
        const d = t.params.speed;
        t.wrapperEl.style.scrollSnapType = "none", i.cancelAnimationFrame(t.cssModeFrameID);
        const c = s > n ? "next" : "prev", p = (e, t) => "next" === c && e >= t || "prev" === c && e <= t, u = () => {
            l = (new Date).getTime(), null === o && (o = l);
            const e = Math.max(Math.min((l - o) / d, 1), 0), r = .5 - Math.cos(e * Math.PI) / 2;
            let c = n + r * (s - n);
            if (p(c, s) && (c = s), t.wrapperEl.scrollTo({
                [a]: c
            }), p(c, s)) return t.wrapperEl.style.overflow = "hidden", t.wrapperEl.style.scrollSnapType = "", 
            setTimeout(() => {
                t.wrapperEl.style.overflow = "", t.wrapperEl.scrollTo({
                    [a]: c
                });
            }), void i.cancelAnimationFrame(t.cssModeFrameID);
            t.cssModeFrameID = i.requestAnimationFrame(u);
        };
        u();
    }
    function h(e) {
        return e.querySelector(".swiper-slide-transform") || e.shadowRoot && e.shadowRoot.querySelector(".swiper-slide-transform") || e;
    }
    function f(e, t) {
        void 0 === t && (t = "");
        const s = [ ...e.children ];
        return e instanceof HTMLSlotElement && s.push(...e.assignedElements()), t ? s.filter(e => e.matches(t)) : s;
    }
    function g(e) {
        try {
            return void console.warn(e);
        } catch (e) {}
    }
    function v(e, t) {
        void 0 === t && (t = []);
        const s = document.createElement(e);
        return s.classList.add(...Array.isArray(t) ? t : n(t)), s;
    }
    function w(e) {
        const t = r(), s = a(), i = e.getBoundingClientRect(), n = s.body, l = e.clientTop || n.clientTop || 0, o = e.clientLeft || n.clientLeft || 0, d = e === t ? t.scrollY : e.scrollTop, c = e === t ? t.scrollX : e.scrollLeft;
        return {
            top: i.top + d - l,
            left: i.left + c - o
        };
    }
    function b(e, t) {
        return r().getComputedStyle(e, null).getPropertyValue(t);
    }
    function y(e) {
        let t, s = e;
        if (s) {
            for (t = 0; null !== (s = s.previousSibling); ) 1 === s.nodeType && (t += 1);
            return t;
        }
    }
    function E(e, t) {
        const s = [];
        let a = e.parentElement;
        for (;a; ) t ? a.matches(t) && s.push(a) : s.push(a), a = a.parentElement;
        return s;
    }
    function x(e, t) {
        t && e.addEventListener("transitionend", function s(a) {
            a.target === e && (t.call(e, a), e.removeEventListener("transitionend", s));
        });
    }
    function S(e, t, s) {
        const a = r();
        return s ? e["width" === t ? "offsetWidth" : "offsetHeight"] + parseFloat(a.getComputedStyle(e, null).getPropertyValue("width" === t ? "margin-right" : "margin-top")) + parseFloat(a.getComputedStyle(e, null).getPropertyValue("width" === t ? "margin-left" : "margin-bottom")) : e.offsetWidth;
    }
    function T(e) {
        return (Array.isArray(e) ? e : [ e ]).filter(e => !!e);
    }
    function M(e) {
        return t => Math.abs(t) > 0 && e.browser && e.browser.need3dFix && Math.abs(t) % 90 == 0 ? t + .001 : t;
    }
    let C, P, L;
    function I() {
        return C || (C = function() {
            const e = r(), t = a();
            return {
                smoothScroll: t.documentElement && t.documentElement.style && "scrollBehavior" in t.documentElement.style,
                touch: !!("ontouchstart" in e || e.DocumentTouch && t instanceof e.DocumentTouch)
            };
        }()), C;
    }
    function z(e) {
        return void 0 === e && (e = {}), P || (P = function(e) {
            let {userAgent: t} = void 0 === e ? {} : e;
            const s = I(), a = r(), i = a.navigator.platform, n = t || a.navigator.userAgent, l = {
                ios: !1,
                android: !1
            }, o = a.screen.width, d = a.screen.height, c = n.match(/(Android);?[\s\/]+([\d.]+)?/);
            let p = n.match(/(iPad).*OS\s([\d_]+)/);
            const u = n.match(/(iPod)(.*OS\s([\d_]+))?/), m = !p && n.match(/(iPhone\sOS|iOS)\s([\d_]+)/), h = "Win32" === i;
            let f = "MacIntel" === i;
            return !p && f && s.touch && [ "1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810" ].indexOf(`${o}x${d}`) >= 0 && (p = n.match(/(Version)\/([\d.]+)/), 
            p || (p = [ 0, 1, "13_0_0" ]), f = !1), c && !h && (l.os = "android", l.android = !0), 
            (p || m || u) && (l.os = "ios", l.ios = !0), l;
        }(e)), P;
    }
    function A() {
        return L || (L = function() {
            const e = r(), t = z();
            let s = !1;
            function a() {
                const t = e.navigator.userAgent.toLowerCase();
                return t.indexOf("safari") >= 0 && t.indexOf("chrome") < 0 && t.indexOf("android") < 0;
            }
            if (a()) {
                const t = String(e.navigator.userAgent);
                if (t.includes("Version/")) {
                    const [e, a] = t.split("Version/")[1].split(" ")[0].split(".").map(e => Number(e));
                    s = e < 16 || 16 === e && a < 2;
                }
            }
            const i = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(e.navigator.userAgent), n = a();
            return {
                isSafari: s || n,
                needPerspectiveFix: s,
                need3dFix: n || i && t.ios,
                isWebView: i
            };
        }()), L;
    }
    var $ = {
        on(e, t, s) {
            const a = this;
            if (!a.eventsListeners || a.destroyed) return a;
            if ("function" != typeof t) return a;
            const i = s ? "unshift" : "push";
            return e.split(" ").forEach(e => {
                a.eventsListeners[e] || (a.eventsListeners[e] = []), a.eventsListeners[e][i](t);
            }), a;
        },
        once(e, t, s) {
            const a = this;
            if (!a.eventsListeners || a.destroyed) return a;
            if ("function" != typeof t) return a;
            function i() {
                a.off(e, i), i.__emitterProxy && delete i.__emitterProxy;
                for (var s = arguments.length, r = new Array(s), n = 0; n < s; n++) r[n] = arguments[n];
                t.apply(a, r);
            }
            return i.__emitterProxy = t, a.on(e, i, s);
        },
        onAny(e, t) {
            const s = this;
            if (!s.eventsListeners || s.destroyed) return s;
            if ("function" != typeof e) return s;
            const a = t ? "unshift" : "push";
            return s.eventsAnyListeners.indexOf(e) < 0 && s.eventsAnyListeners[a](e), s;
        },
        offAny(e) {
            const t = this;
            if (!t.eventsListeners || t.destroyed) return t;
            if (!t.eventsAnyListeners) return t;
            const s = t.eventsAnyListeners.indexOf(e);
            return s >= 0 && t.eventsAnyListeners.splice(s, 1), t;
        },
        off(e, t) {
            const s = this;
            return !s.eventsListeners || s.destroyed ? s : s.eventsListeners ? (e.split(" ").forEach(e => {
                void 0 === t ? s.eventsListeners[e] = [] : s.eventsListeners[e] && s.eventsListeners[e].forEach((a, i) => {
                    (a === t || a.__emitterProxy && a.__emitterProxy === t) && s.eventsListeners[e].splice(i, 1);
                });
            }), s) : s;
        },
        emit() {
            const e = this;
            if (!e.eventsListeners || e.destroyed) return e;
            if (!e.eventsListeners) return e;
            let t, s, a;
            for (var i = arguments.length, r = new Array(i), n = 0; n < i; n++) r[n] = arguments[n];
            "string" == typeof r[0] || Array.isArray(r[0]) ? (t = r[0], s = r.slice(1, r.length), 
            a = e) : (t = r[0].events, s = r[0].data, a = r[0].context || e), s.unshift(a);
            return (Array.isArray(t) ? t : t.split(" ")).forEach(t => {
                e.eventsAnyListeners && e.eventsAnyListeners.length && e.eventsAnyListeners.forEach(e => {
                    e.apply(a, [ t, ...s ]);
                }), e.eventsListeners && e.eventsListeners[t] && e.eventsListeners[t].forEach(e => {
                    e.apply(a, s);
                });
            }), e;
        }
    };
    const k = (e, t, s) => {
        t && !e.classList.contains(s) ? e.classList.add(s) : !t && e.classList.contains(s) && e.classList.remove(s);
    };
    const O = (e, t, s) => {
        t && !e.classList.contains(s) ? e.classList.add(s) : !t && e.classList.contains(s) && e.classList.remove(s);
    };
    const D = (e, t) => {
        if (!e || e.destroyed || !e.params) return;
        const s = t.closest(e.isElement ? "swiper-slide" : `.${e.params.slideClass}`);
        if (s) {
            let t = s.querySelector(`.${e.params.lazyPreloaderClass}`);
            !t && e.isElement && (s.shadowRoot ? t = s.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`) : requestAnimationFrame(() => {
                s.shadowRoot && (t = s.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`), 
                t && t.remove());
            })), t && t.remove();
        }
    }, G = (e, t) => {
        if (!e.slides[t]) return;
        const s = e.slides[t].querySelector('[loading="lazy"]');
        s && s.removeAttribute("loading");
    }, H = e => {
        if (!e || e.destroyed || !e.params) return;
        let t = e.params.lazyPreloadPrevNext;
        const s = e.slides.length;
        if (!s || !t || t < 0) return;
        t = Math.min(t, s);
        const a = "auto" === e.params.slidesPerView ? e.slidesPerViewDynamic() : Math.ceil(e.params.slidesPerView), i = e.activeIndex;
        if (e.params.grid && e.params.grid.rows > 1) {
            const s = i, r = [ s - t ];
            return r.push(...Array.from({
                length: t
            }).map((e, t) => s + a + t)), void e.slides.forEach((t, s) => {
                r.includes(t.column) && G(e, s);
            });
        }
        const r = i + a - 1;
        if (e.params.rewind || e.params.loop) for (let a = i - t; a <= r + t; a += 1) {
            const t = (a % s + s) % s;
            (t < i || t > r) && G(e, t);
        } else for (let a = Math.max(i - t, 0); a <= Math.min(r + t, s - 1); a += 1) a !== i && (a > r || a < i) && G(e, a);
    };
    var B = {
        updateSize: function() {
            const e = this;
            let t, s;
            const a = e.el;
            t = void 0 !== e.params.width && null !== e.params.width ? e.params.width : a.clientWidth, 
            s = void 0 !== e.params.height && null !== e.params.height ? e.params.height : a.clientHeight, 
            0 === t && e.isHorizontal() || 0 === s && e.isVertical() || (t = t - parseInt(b(a, "padding-left") || 0, 10) - parseInt(b(a, "padding-right") || 0, 10), 
            s = s - parseInt(b(a, "padding-top") || 0, 10) - parseInt(b(a, "padding-bottom") || 0, 10), 
            Number.isNaN(t) && (t = 0), Number.isNaN(s) && (s = 0), Object.assign(e, {
                width: t,
                height: s,
                size: e.isHorizontal() ? t : s
            }));
        },
        updateSlides: function() {
            const e = this;
            function t(t, s) {
                return parseFloat(t.getPropertyValue(e.getDirectionLabel(s)) || 0);
            }
            const s = e.params, {wrapperEl: a, slidesEl: i, size: r, rtlTranslate: n, wrongRTL: l} = e, o = e.virtual && s.virtual.enabled, d = o ? e.virtual.slides.length : e.slides.length, c = f(i, `.${e.params.slideClass}, swiper-slide`), p = o ? e.virtual.slides.length : c.length;
            let m = [];
            const h = [], g = [];
            let v = s.slidesOffsetBefore;
            "function" == typeof v && (v = s.slidesOffsetBefore.call(e));
            let w = s.slidesOffsetAfter;
            "function" == typeof w && (w = s.slidesOffsetAfter.call(e));
            const y = e.snapGrid.length, E = e.slidesGrid.length;
            let x = s.spaceBetween, T = -v, M = 0, C = 0;
            if (void 0 === r) return;
            "string" == typeof x && x.indexOf("%") >= 0 ? x = parseFloat(x.replace("%", "")) / 100 * r : "string" == typeof x && (x = parseFloat(x)), 
            e.virtualSize = -x, c.forEach(e => {
                n ? e.style.marginLeft = "" : e.style.marginRight = "", e.style.marginBottom = "", 
                e.style.marginTop = "";
            }), s.centeredSlides && s.cssMode && (u(a, "--swiper-centered-offset-before", ""), 
            u(a, "--swiper-centered-offset-after", ""));
            const P = s.grid && s.grid.rows > 1 && e.grid;
            let L;
            P ? e.grid.initSlides(c) : e.grid && e.grid.unsetSlides();
            const I = "auto" === s.slidesPerView && s.breakpoints && Object.keys(s.breakpoints).filter(e => void 0 !== s.breakpoints[e].slidesPerView).length > 0;
            for (let a = 0; a < p; a += 1) {
                let i;
                if (L = 0, c[a] && (i = c[a]), P && e.grid.updateSlide(a, i, c), !c[a] || "none" !== b(i, "display")) {
                    if ("auto" === s.slidesPerView) {
                        I && (c[a].style[e.getDirectionLabel("width")] = "");
                        const r = getComputedStyle(i), n = i.style.transform, l = i.style.webkitTransform;
                        if (n && (i.style.transform = "none"), l && (i.style.webkitTransform = "none"), 
                        s.roundLengths) L = e.isHorizontal() ? S(i, "width", !0) : S(i, "height", !0); else {
                            const e = t(r, "width"), s = t(r, "padding-left"), a = t(r, "padding-right"), n = t(r, "margin-left"), l = t(r, "margin-right"), o = r.getPropertyValue("box-sizing");
                            if (o && "border-box" === o) L = e + n + l; else {
                                const {clientWidth: t, offsetWidth: r} = i;
                                L = e + s + a + n + l + (r - t);
                            }
                        }
                        n && (i.style.transform = n), l && (i.style.webkitTransform = l), s.roundLengths && (L = Math.floor(L));
                    } else L = (r - (s.slidesPerView - 1) * x) / s.slidesPerView, s.roundLengths && (L = Math.floor(L)), 
                    c[a] && (c[a].style[e.getDirectionLabel("width")] = `${L}px`);
                    c[a] && (c[a].swiperSlideSize = L), g.push(L), s.centeredSlides ? (T = T + L / 2 + M / 2 + x, 
                    0 === M && 0 !== a && (T = T - r / 2 - x), 0 === a && (T = T - r / 2 - x), Math.abs(T) < .001 && (T = 0), 
                    s.roundLengths && (T = Math.floor(T)), C % s.slidesPerGroup == 0 && m.push(T), h.push(T)) : (s.roundLengths && (T = Math.floor(T)), 
                    (C - Math.min(e.params.slidesPerGroupSkip, C)) % e.params.slidesPerGroup == 0 && m.push(T), 
                    h.push(T), T = T + L + x), e.virtualSize += L + x, M = L, C += 1;
                }
            }
            if (e.virtualSize = Math.max(e.virtualSize, r) + w, n && l && ("slide" === s.effect || "coverflow" === s.effect) && (a.style.width = `${e.virtualSize + x}px`), 
            s.setWrapperSize && (a.style[e.getDirectionLabel("width")] = `${e.virtualSize + x}px`), 
            P && e.grid.updateWrapperSize(L, m), !s.centeredSlides) {
                const t = [];
                for (let a = 0; a < m.length; a += 1) {
                    let i = m[a];
                    s.roundLengths && (i = Math.floor(i)), m[a] <= e.virtualSize - r && t.push(i);
                }
                m = t, Math.floor(e.virtualSize - r) - Math.floor(m[m.length - 1]) > 1 && m.push(e.virtualSize - r);
            }
            if (o && s.loop) {
                const t = g[0] + x;
                if (s.slidesPerGroup > 1) {
                    const a = Math.ceil((e.virtual.slidesBefore + e.virtual.slidesAfter) / s.slidesPerGroup), i = t * s.slidesPerGroup;
                    for (let e = 0; e < a; e += 1) m.push(m[m.length - 1] + i);
                }
                for (let a = 0; a < e.virtual.slidesBefore + e.virtual.slidesAfter; a += 1) 1 === s.slidesPerGroup && m.push(m[m.length - 1] + t), 
                h.push(h[h.length - 1] + t), e.virtualSize += t;
            }
            if (0 === m.length && (m = [ 0 ]), 0 !== x) {
                const t = e.isHorizontal() && n ? "marginLeft" : e.getDirectionLabel("marginRight");
                c.filter((e, t) => !(s.cssMode && !s.loop) || t !== c.length - 1).forEach(e => {
                    e.style[t] = `${x}px`;
                });
            }
            if (s.centeredSlides && s.centeredSlidesBounds) {
                let e = 0;
                g.forEach(t => {
                    e += t + (x || 0);
                }), e -= x;
                const t = e > r ? e - r : 0;
                m = m.map(e => e <= 0 ? -v : e > t ? t + w : e);
            }
            if (s.centerInsufficientSlides) {
                let e = 0;
                g.forEach(t => {
                    e += t + (x || 0);
                }), e -= x;
                const t = (s.slidesOffsetBefore || 0) + (s.slidesOffsetAfter || 0);
                if (e + t < r) {
                    const s = (r - e - t) / 2;
                    m.forEach((e, t) => {
                        m[t] = e - s;
                    }), h.forEach((e, t) => {
                        h[t] = e + s;
                    });
                }
            }
            if (Object.assign(e, {
                slides: c,
                snapGrid: m,
                slidesGrid: h,
                slidesSizesGrid: g
            }), s.centeredSlides && s.cssMode && !s.centeredSlidesBounds) {
                u(a, "--swiper-centered-offset-before", -m[0] + "px"), u(a, "--swiper-centered-offset-after", e.size / 2 - g[g.length - 1] / 2 + "px");
                const t = -e.snapGrid[0], s = -e.slidesGrid[0];
                e.snapGrid = e.snapGrid.map(e => e + t), e.slidesGrid = e.slidesGrid.map(e => e + s);
            }
            if (p !== d && e.emit("slidesLengthChange"), m.length !== y && (e.params.watchOverflow && e.checkOverflow(), 
            e.emit("snapGridLengthChange")), h.length !== E && e.emit("slidesGridLengthChange"), 
            s.watchSlidesProgress && e.updateSlidesOffset(), e.emit("slidesUpdated"), !(o || s.cssMode || "slide" !== s.effect && "fade" !== s.effect)) {
                const t = `${s.containerModifierClass}backface-hidden`, a = e.el.classList.contains(t);
                p <= s.maxBackfaceHiddenSlides ? a || e.el.classList.add(t) : a && e.el.classList.remove(t);
            }
        },
        updateAutoHeight: function(e) {
            const t = this, s = [], a = t.virtual && t.params.virtual.enabled;
            let i, r = 0;
            "number" == typeof e ? t.setTransition(e) : !0 === e && t.setTransition(t.params.speed);
            const n = e => a ? t.slides[t.getSlideIndexByData(e)] : t.slides[e];
            if ("auto" !== t.params.slidesPerView && t.params.slidesPerView > 1) if (t.params.centeredSlides) (t.visibleSlides || []).forEach(e => {
                s.push(e);
            }); else for (i = 0; i < Math.ceil(t.params.slidesPerView); i += 1) {
                const e = t.activeIndex + i;
                if (e > t.slides.length && !a) break;
                s.push(n(e));
            } else s.push(n(t.activeIndex));
            for (i = 0; i < s.length; i += 1) if (void 0 !== s[i]) {
                const e = s[i].offsetHeight;
                r = e > r ? e : r;
            }
            (r || 0 === r) && (t.wrapperEl.style.height = `${r}px`);
        },
        updateSlidesOffset: function() {
            const e = this, t = e.slides, s = e.isElement ? e.isHorizontal() ? e.wrapperEl.offsetLeft : e.wrapperEl.offsetTop : 0;
            for (let a = 0; a < t.length; a += 1) t[a].swiperSlideOffset = (e.isHorizontal() ? t[a].offsetLeft : t[a].offsetTop) - s - e.cssOverflowAdjustment();
        },
        updateSlidesProgress: function(e) {
            void 0 === e && (e = this && this.translate || 0);
            const t = this, s = t.params, {slides: a, rtlTranslate: i, snapGrid: r} = t;
            if (0 === a.length) return;
            void 0 === a[0].swiperSlideOffset && t.updateSlidesOffset();
            let n = -e;
            i && (n = e), t.visibleSlidesIndexes = [], t.visibleSlides = [];
            let l = s.spaceBetween;
            "string" == typeof l && l.indexOf("%") >= 0 ? l = parseFloat(l.replace("%", "")) / 100 * t.size : "string" == typeof l && (l = parseFloat(l));
            for (let e = 0; e < a.length; e += 1) {
                const o = a[e];
                let d = o.swiperSlideOffset;
                s.cssMode && s.centeredSlides && (d -= a[0].swiperSlideOffset);
                const c = (n + (s.centeredSlides ? t.minTranslate() : 0) - d) / (o.swiperSlideSize + l), p = (n - r[0] + (s.centeredSlides ? t.minTranslate() : 0) - d) / (o.swiperSlideSize + l), u = -(n - d), m = u + t.slidesSizesGrid[e], h = u >= 0 && u <= t.size - t.slidesSizesGrid[e], f = u >= 0 && u < t.size - 1 || m > 1 && m <= t.size || u <= 0 && m >= t.size;
                f && (t.visibleSlides.push(o), t.visibleSlidesIndexes.push(e)), k(o, f, s.slideVisibleClass), 
                k(o, h, s.slideFullyVisibleClass), o.progress = i ? -c : c, o.originalProgress = i ? -p : p;
            }
        },
        updateProgress: function(e) {
            const t = this;
            if (void 0 === e) {
                const s = t.rtlTranslate ? -1 : 1;
                e = t && t.translate && t.translate * s || 0;
            }
            const s = t.params, a = t.maxTranslate() - t.minTranslate();
            let {progress: i, isBeginning: r, isEnd: n, progressLoop: l} = t;
            const o = r, d = n;
            if (0 === a) i = 0, r = !0, n = !0; else {
                i = (e - t.minTranslate()) / a;
                const s = Math.abs(e - t.minTranslate()) < 1, l = Math.abs(e - t.maxTranslate()) < 1;
                r = s || i <= 0, n = l || i >= 1, s && (i = 0), l && (i = 1);
            }
            if (s.loop) {
                const s = t.getSlideIndexByData(0), a = t.getSlideIndexByData(t.slides.length - 1), i = t.slidesGrid[s], r = t.slidesGrid[a], n = t.slidesGrid[t.slidesGrid.length - 1], o = Math.abs(e);
                l = o >= i ? (o - i) / n : (o + n - r) / n, l > 1 && (l -= 1);
            }
            Object.assign(t, {
                progress: i,
                progressLoop: l,
                isBeginning: r,
                isEnd: n
            }), (s.watchSlidesProgress || s.centeredSlides && s.autoHeight) && t.updateSlidesProgress(e), 
            r && !o && t.emit("reachBeginning toEdge"), n && !d && t.emit("reachEnd toEdge"), 
            (o && !r || d && !n) && t.emit("fromEdge"), t.emit("progress", i);
        },
        updateSlidesClasses: function() {
            const e = this, {slides: t, params: s, slidesEl: a, activeIndex: i} = e, r = e.virtual && s.virtual.enabled, n = e.grid && s.grid && s.grid.rows > 1, l = e => f(a, `.${s.slideClass}${e}, swiper-slide${e}`)[0];
            let o, d, c;
            if (r) if (s.loop) {
                let t = i - e.virtual.slidesBefore;
                t < 0 && (t = e.virtual.slides.length + t), t >= e.virtual.slides.length && (t -= e.virtual.slides.length), 
                o = l(`[data-swiper-slide-index="${t}"]`);
            } else o = l(`[data-swiper-slide-index="${i}"]`); else n ? (o = t.filter(e => e.column === i)[0], 
            c = t.filter(e => e.column === i + 1)[0], d = t.filter(e => e.column === i - 1)[0]) : o = t[i];
            o && (n || (c = function(e, t) {
                const s = [];
                for (;e.nextElementSibling; ) {
                    const a = e.nextElementSibling;
                    t ? a.matches(t) && s.push(a) : s.push(a), e = a;
                }
                return s;
            }(o, `.${s.slideClass}, swiper-slide`)[0], s.loop && !c && (c = t[0]), d = function(e, t) {
                const s = [];
                for (;e.previousElementSibling; ) {
                    const a = e.previousElementSibling;
                    t ? a.matches(t) && s.push(a) : s.push(a), e = a;
                }
                return s;
            }(o, `.${s.slideClass}, swiper-slide`)[0], s.loop && 0 === !d && (d = t[t.length - 1]))), 
            t.forEach(e => {
                O(e, e === o, s.slideActiveClass), O(e, e === c, s.slideNextClass), O(e, e === d, s.slidePrevClass);
            }), e.emitSlidesClasses();
        },
        updateActiveIndex: function(e) {
            const t = this, s = t.rtlTranslate ? t.translate : -t.translate, {snapGrid: a, params: i, activeIndex: r, realIndex: n, snapIndex: l} = t;
            let o, d = e;
            const c = e => {
                let s = e - t.virtual.slidesBefore;
                return s < 0 && (s = t.virtual.slides.length + s), s >= t.virtual.slides.length && (s -= t.virtual.slides.length), 
                s;
            };
            if (void 0 === d && (d = function(e) {
                const {slidesGrid: t, params: s} = e, a = e.rtlTranslate ? e.translate : -e.translate;
                let i;
                for (let e = 0; e < t.length; e += 1) void 0 !== t[e + 1] ? a >= t[e] && a < t[e + 1] - (t[e + 1] - t[e]) / 2 ? i = e : a >= t[e] && a < t[e + 1] && (i = e + 1) : a >= t[e] && (i = e);
                return s.normalizeSlideIndex && (i < 0 || void 0 === i) && (i = 0), i;
            }(t)), a.indexOf(s) >= 0) o = a.indexOf(s); else {
                const e = Math.min(i.slidesPerGroupSkip, d);
                o = e + Math.floor((d - e) / i.slidesPerGroup);
            }
            if (o >= a.length && (o = a.length - 1), d === r && !t.params.loop) return void (o !== l && (t.snapIndex = o, 
            t.emit("snapIndexChange")));
            if (d === r && t.params.loop && t.virtual && t.params.virtual.enabled) return void (t.realIndex = c(d));
            const p = t.grid && i.grid && i.grid.rows > 1;
            let u;
            if (t.virtual && i.virtual.enabled && i.loop) u = c(d); else if (p) {
                const e = t.slides.filter(e => e.column === d)[0];
                let s = parseInt(e.getAttribute("data-swiper-slide-index"), 10);
                Number.isNaN(s) && (s = Math.max(t.slides.indexOf(e), 0)), u = Math.floor(s / i.grid.rows);
            } else if (t.slides[d]) {
                const e = t.slides[d].getAttribute("data-swiper-slide-index");
                u = e ? parseInt(e, 10) : d;
            } else u = d;
            Object.assign(t, {
                previousSnapIndex: l,
                snapIndex: o,
                previousRealIndex: n,
                realIndex: u,
                previousIndex: r,
                activeIndex: d
            }), t.initialized && H(t), t.emit("activeIndexChange"), t.emit("snapIndexChange"), 
            (t.initialized || t.params.runCallbacksOnInit) && (n !== u && t.emit("realIndexChange"), 
            t.emit("slideChange"));
        },
        updateClickedSlide: function(e, t) {
            const s = this, a = s.params;
            let i = e.closest(`.${a.slideClass}, swiper-slide`);
            !i && s.isElement && t && t.length > 1 && t.includes(e) && [ ...t.slice(t.indexOf(e) + 1, t.length) ].forEach(e => {
                !i && e.matches && e.matches(`.${a.slideClass}, swiper-slide`) && (i = e);
            });
            let r, n = !1;
            if (i) for (let e = 0; e < s.slides.length; e += 1) if (s.slides[e] === i) {
                n = !0, r = e;
                break;
            }
            if (!i || !n) return s.clickedSlide = void 0, void (s.clickedIndex = void 0);
            s.clickedSlide = i, s.virtual && s.params.virtual.enabled ? s.clickedIndex = parseInt(i.getAttribute("data-swiper-slide-index"), 10) : s.clickedIndex = r, 
            a.slideToClickedSlide && void 0 !== s.clickedIndex && s.clickedIndex !== s.activeIndex && s.slideToClickedSlide();
        }
    };
    var N = {
        getTranslate: function(e) {
            void 0 === e && (e = this.isHorizontal() ? "x" : "y");
            const {params: t, rtlTranslate: s, translate: a, wrapperEl: i} = this;
            if (t.virtualTranslate) return s ? -a : a;
            if (t.cssMode) return a;
            let r = d(i, e);
            return r += this.cssOverflowAdjustment(), s && (r = -r), r || 0;
        },
        setTranslate: function(e, t) {
            const s = this, {rtlTranslate: a, params: i, wrapperEl: r, progress: n} = s;
            let l, o = 0, d = 0;
            s.isHorizontal() ? o = a ? -e : e : d = e, i.roundLengths && (o = Math.floor(o), 
            d = Math.floor(d)), s.previousTranslate = s.translate, s.translate = s.isHorizontal() ? o : d, 
            i.cssMode ? r[s.isHorizontal() ? "scrollLeft" : "scrollTop"] = s.isHorizontal() ? -o : -d : i.virtualTranslate || (s.isHorizontal() ? o -= s.cssOverflowAdjustment() : d -= s.cssOverflowAdjustment(), 
            r.style.transform = `translate3d(${o}px, ${d}px, 0px)`);
            const c = s.maxTranslate() - s.minTranslate();
            l = 0 === c ? 0 : (e - s.minTranslate()) / c, l !== n && s.updateProgress(e), s.emit("setTranslate", s.translate, t);
        },
        minTranslate: function() {
            return -this.snapGrid[0];
        },
        maxTranslate: function() {
            return -this.snapGrid[this.snapGrid.length - 1];
        },
        translateTo: function(e, t, s, a, i) {
            void 0 === e && (e = 0), void 0 === t && (t = this.params.speed), void 0 === s && (s = !0), 
            void 0 === a && (a = !0);
            const r = this, {params: n, wrapperEl: l} = r;
            if (r.animating && n.preventInteractionOnTransition) return !1;
            const o = r.minTranslate(), d = r.maxTranslate();
            let c;
            if (c = a && e > o ? o : a && e < d ? d : e, r.updateProgress(c), n.cssMode) {
                const e = r.isHorizontal();
                if (0 === t) l[e ? "scrollLeft" : "scrollTop"] = -c; else {
                    if (!r.support.smoothScroll) return m({
                        swiper: r,
                        targetPosition: -c,
                        side: e ? "left" : "top"
                    }), !0;
                    l.scrollTo({
                        [e ? "left" : "top"]: -c,
                        behavior: "smooth"
                    });
                }
                return !0;
            }
            return 0 === t ? (r.setTransition(0), r.setTranslate(c), s && (r.emit("beforeTransitionStart", t, i), 
            r.emit("transitionEnd"))) : (r.setTransition(t), r.setTranslate(c), s && (r.emit("beforeTransitionStart", t, i), 
            r.emit("transitionStart")), r.animating || (r.animating = !0, r.onTranslateToWrapperTransitionEnd || (r.onTranslateToWrapperTransitionEnd = function(e) {
                r && !r.destroyed && e.target === this && (r.wrapperEl.removeEventListener("transitionend", r.onTranslateToWrapperTransitionEnd), 
                r.onTranslateToWrapperTransitionEnd = null, delete r.onTranslateToWrapperTransitionEnd, 
                r.animating = !1, s && r.emit("transitionEnd"));
            }), r.wrapperEl.addEventListener("transitionend", r.onTranslateToWrapperTransitionEnd))), 
            !0;
        }
    };
    function X(e) {
        let {swiper: t, runCallbacks: s, direction: a, step: i} = e;
        const {activeIndex: r, previousIndex: n} = t;
        let l = a;
        if (l || (l = r > n ? "next" : r < n ? "prev" : "reset"), t.emit(`transition${i}`), 
        s && r !== n) {
            if ("reset" === l) return void t.emit(`slideResetTransition${i}`);
            t.emit(`slideChangeTransition${i}`), "next" === l ? t.emit(`slideNextTransition${i}`) : t.emit(`slidePrevTransition${i}`);
        }
    }
    var Y = {
        slideTo: function(e, t, s, a, i) {
            void 0 === e && (e = 0), void 0 === s && (s = !0), "string" == typeof e && (e = parseInt(e, 10));
            const r = this;
            let n = e;
            n < 0 && (n = 0);
            const {params: l, snapGrid: o, slidesGrid: d, previousIndex: c, activeIndex: p, rtlTranslate: u, wrapperEl: h, enabled: f} = r;
            if (!f && !a && !i || r.destroyed || r.animating && l.preventInteractionOnTransition) return !1;
            void 0 === t && (t = r.params.speed);
            const g = Math.min(r.params.slidesPerGroupSkip, n);
            let v = g + Math.floor((n - g) / r.params.slidesPerGroup);
            v >= o.length && (v = o.length - 1);
            const w = -o[v];
            if (l.normalizeSlideIndex) for (let e = 0; e < d.length; e += 1) {
                const t = -Math.floor(100 * w), s = Math.floor(100 * d[e]), a = Math.floor(100 * d[e + 1]);
                void 0 !== d[e + 1] ? t >= s && t < a - (a - s) / 2 ? n = e : t >= s && t < a && (n = e + 1) : t >= s && (n = e);
            }
            if (r.initialized && n !== p) {
                if (!r.allowSlideNext && (u ? w > r.translate && w > r.minTranslate() : w < r.translate && w < r.minTranslate())) return !1;
                if (!r.allowSlidePrev && w > r.translate && w > r.maxTranslate() && (p || 0) !== n) return !1;
            }
            let b;
            n !== (c || 0) && s && r.emit("beforeSlideChangeStart"), r.updateProgress(w), b = n > p ? "next" : n < p ? "prev" : "reset";
            const y = r.virtual && r.params.virtual.enabled;
            if (!(y && i) && (u && -w === r.translate || !u && w === r.translate)) return r.updateActiveIndex(n), 
            l.autoHeight && r.updateAutoHeight(), r.updateSlidesClasses(), "slide" !== l.effect && r.setTranslate(w), 
            "reset" !== b && (r.transitionStart(s, b), r.transitionEnd(s, b)), !1;
            if (l.cssMode) {
                const e = r.isHorizontal(), s = u ? w : -w;
                if (0 === t) y && (r.wrapperEl.style.scrollSnapType = "none", r._immediateVirtual = !0), 
                y && !r._cssModeVirtualInitialSet && r.params.initialSlide > 0 ? (r._cssModeVirtualInitialSet = !0, 
                requestAnimationFrame(() => {
                    h[e ? "scrollLeft" : "scrollTop"] = s;
                })) : h[e ? "scrollLeft" : "scrollTop"] = s, y && requestAnimationFrame(() => {
                    r.wrapperEl.style.scrollSnapType = "", r._immediateVirtual = !1;
                }); else {
                    if (!r.support.smoothScroll) return m({
                        swiper: r,
                        targetPosition: s,
                        side: e ? "left" : "top"
                    }), !0;
                    h.scrollTo({
                        [e ? "left" : "top"]: s,
                        behavior: "smooth"
                    });
                }
                return !0;
            }
            return r.setTransition(t), r.setTranslate(w), r.updateActiveIndex(n), r.updateSlidesClasses(), 
            r.emit("beforeTransitionStart", t, a), r.transitionStart(s, b), 0 === t ? r.transitionEnd(s, b) : r.animating || (r.animating = !0, 
            r.onSlideToWrapperTransitionEnd || (r.onSlideToWrapperTransitionEnd = function(e) {
                r && !r.destroyed && e.target === this && (r.wrapperEl.removeEventListener("transitionend", r.onSlideToWrapperTransitionEnd), 
                r.onSlideToWrapperTransitionEnd = null, delete r.onSlideToWrapperTransitionEnd, 
                r.transitionEnd(s, b));
            }), r.wrapperEl.addEventListener("transitionend", r.onSlideToWrapperTransitionEnd)), 
            !0;
        },
        slideToLoop: function(e, t, s, a) {
            if (void 0 === e && (e = 0), void 0 === s && (s = !0), "string" == typeof e) {
                e = parseInt(e, 10);
            }
            const i = this;
            if (i.destroyed) return;
            void 0 === t && (t = i.params.speed);
            const r = i.grid && i.params.grid && i.params.grid.rows > 1;
            let n = e;
            if (i.params.loop) if (i.virtual && i.params.virtual.enabled) n += i.virtual.slidesBefore; else {
                let e;
                if (r) {
                    const t = n * i.params.grid.rows;
                    e = i.slides.filter(e => 1 * e.getAttribute("data-swiper-slide-index") === t)[0].column;
                } else e = i.getSlideIndexByData(n);
                const t = r ? Math.ceil(i.slides.length / i.params.grid.rows) : i.slides.length, {centeredSlides: s} = i.params;
                let l = i.params.slidesPerView;
                "auto" === l ? l = i.slidesPerViewDynamic() : (l = Math.ceil(parseFloat(i.params.slidesPerView, 10)), 
                s && l % 2 == 0 && (l += 1));
                let o = t - e < l;
                if (s && (o = o || e < Math.ceil(l / 2)), a && s && "auto" !== i.params.slidesPerView && !r && (o = !1), 
                o) {
                    const a = s ? e < i.activeIndex ? "prev" : "next" : e - i.activeIndex - 1 < i.params.slidesPerView ? "next" : "prev";
                    i.loopFix({
                        direction: a,
                        slideTo: !0,
                        activeSlideIndex: "next" === a ? e + 1 : e - t + 1,
                        slideRealIndex: "next" === a ? i.realIndex : void 0
                    });
                }
                if (r) {
                    const e = n * i.params.grid.rows;
                    n = i.slides.filter(t => 1 * t.getAttribute("data-swiper-slide-index") === e)[0].column;
                } else n = i.getSlideIndexByData(n);
            }
            return requestAnimationFrame(() => {
                i.slideTo(n, t, s, a);
            }), i;
        },
        slideNext: function(e, t, s) {
            void 0 === t && (t = !0);
            const a = this, {enabled: i, params: r, animating: n} = a;
            if (!i || a.destroyed) return a;
            void 0 === e && (e = a.params.speed);
            let l = r.slidesPerGroup;
            "auto" === r.slidesPerView && 1 === r.slidesPerGroup && r.slidesPerGroupAuto && (l = Math.max(a.slidesPerViewDynamic("current", !0), 1));
            const o = a.activeIndex < r.slidesPerGroupSkip ? 1 : l, d = a.virtual && r.virtual.enabled;
            if (r.loop) {
                if (n && !d && r.loopPreventsSliding) return !1;
                if (a.loopFix({
                    direction: "next"
                }), a._clientLeft = a.wrapperEl.clientLeft, a.activeIndex === a.slides.length - 1 && r.cssMode) return requestAnimationFrame(() => {
                    a.slideTo(a.activeIndex + o, e, t, s);
                }), !0;
            }
            return r.rewind && a.isEnd ? a.slideTo(0, e, t, s) : a.slideTo(a.activeIndex + o, e, t, s);
        },
        slidePrev: function(e, t, s) {
            void 0 === t && (t = !0);
            const a = this, {params: i, snapGrid: r, slidesGrid: n, rtlTranslate: l, enabled: o, animating: d} = a;
            if (!o || a.destroyed) return a;
            void 0 === e && (e = a.params.speed);
            const c = a.virtual && i.virtual.enabled;
            if (i.loop) {
                if (d && !c && i.loopPreventsSliding) return !1;
                a.loopFix({
                    direction: "prev"
                }), a._clientLeft = a.wrapperEl.clientLeft;
            }
            function p(e) {
                return e < 0 ? -Math.floor(Math.abs(e)) : Math.floor(e);
            }
            const u = p(l ? a.translate : -a.translate), m = r.map(e => p(e));
            let h = r[m.indexOf(u) - 1];
            if (void 0 === h && i.cssMode) {
                let e;
                r.forEach((t, s) => {
                    u >= t && (e = s);
                }), void 0 !== e && (h = r[e > 0 ? e - 1 : e]);
            }
            let f = 0;
            if (void 0 !== h && (f = n.indexOf(h), f < 0 && (f = a.activeIndex - 1), "auto" === i.slidesPerView && 1 === i.slidesPerGroup && i.slidesPerGroupAuto && (f = f - a.slidesPerViewDynamic("previous", !0) + 1, 
            f = Math.max(f, 0))), i.rewind && a.isBeginning) {
                const i = a.params.virtual && a.params.virtual.enabled && a.virtual ? a.virtual.slides.length - 1 : a.slides.length - 1;
                return a.slideTo(i, e, t, s);
            }
            return i.loop && 0 === a.activeIndex && i.cssMode ? (requestAnimationFrame(() => {
                a.slideTo(f, e, t, s);
            }), !0) : a.slideTo(f, e, t, s);
        },
        slideReset: function(e, t, s) {
            void 0 === t && (t = !0);
            const a = this;
            if (!a.destroyed) return void 0 === e && (e = a.params.speed), a.slideTo(a.activeIndex, e, t, s);
        },
        slideToClosest: function(e, t, s, a) {
            void 0 === t && (t = !0), void 0 === a && (a = .5);
            const i = this;
            if (i.destroyed) return;
            void 0 === e && (e = i.params.speed);
            let r = i.activeIndex;
            const n = Math.min(i.params.slidesPerGroupSkip, r), l = n + Math.floor((r - n) / i.params.slidesPerGroup), o = i.rtlTranslate ? i.translate : -i.translate;
            if (o >= i.snapGrid[l]) {
                const e = i.snapGrid[l];
                o - e > (i.snapGrid[l + 1] - e) * a && (r += i.params.slidesPerGroup);
            } else {
                const e = i.snapGrid[l - 1];
                o - e <= (i.snapGrid[l] - e) * a && (r -= i.params.slidesPerGroup);
            }
            return r = Math.max(r, 0), r = Math.min(r, i.slidesGrid.length - 1), i.slideTo(r, e, t, s);
        },
        slideToClickedSlide: function() {
            const e = this;
            if (e.destroyed) return;
            const {params: t, slidesEl: s} = e, a = "auto" === t.slidesPerView ? e.slidesPerViewDynamic() : t.slidesPerView;
            let i, r = e.clickedIndex;
            const n = e.isElement ? "swiper-slide" : `.${t.slideClass}`;
            if (t.loop) {
                if (e.animating) return;
                i = parseInt(e.clickedSlide.getAttribute("data-swiper-slide-index"), 10), t.centeredSlides ? r < e.loopedSlides - a / 2 || r > e.slides.length - e.loopedSlides + a / 2 ? (e.loopFix(), 
                r = e.getSlideIndex(f(s, `${n}[data-swiper-slide-index="${i}"]`)[0]), l(() => {
                    e.slideTo(r);
                })) : e.slideTo(r) : r > e.slides.length - a ? (e.loopFix(), r = e.getSlideIndex(f(s, `${n}[data-swiper-slide-index="${i}"]`)[0]), 
                l(() => {
                    e.slideTo(r);
                })) : e.slideTo(r);
            } else e.slideTo(r);
        }
    };
    var R = {
        loopCreate: function(e) {
            const t = this, {params: s, slidesEl: a} = t;
            if (!s.loop || t.virtual && t.params.virtual.enabled) return;
            const i = () => {
                f(a, `.${s.slideClass}, swiper-slide`).forEach((e, t) => {
                    e.setAttribute("data-swiper-slide-index", t);
                });
            }, r = t.grid && s.grid && s.grid.rows > 1, n = s.slidesPerGroup * (r ? s.grid.rows : 1), l = t.slides.length % n != 0, o = r && t.slides.length % s.grid.rows != 0, d = e => {
                for (let a = 0; a < e; a += 1) {
                    const e = t.isElement ? v("swiper-slide", [ s.slideBlankClass ]) : v("div", [ s.slideClass, s.slideBlankClass ]);
                    t.slidesEl.append(e);
                }
            };
            if (l) {
                if (s.loopAddBlankSlides) {
                    d(n - t.slides.length % n), t.recalcSlides(), t.updateSlides();
                } else g("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
                i();
            } else if (o) {
                if (s.loopAddBlankSlides) {
                    d(s.grid.rows - t.slides.length % s.grid.rows), t.recalcSlides(), t.updateSlides();
                } else g("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
                i();
            } else i();
            t.loopFix({
                slideRealIndex: e,
                direction: s.centeredSlides ? void 0 : "next"
            });
        },
        loopFix: function(e) {
            let {slideRealIndex: t, slideTo: s = !0, direction: a, setTranslate: i, activeSlideIndex: r, byController: n, byMousewheel: l} = void 0 === e ? {} : e;
            const o = this;
            if (!o.params.loop) return;
            o.emit("beforeLoopFix");
            const {slides: d, allowSlidePrev: c, allowSlideNext: p, slidesEl: u, params: m} = o, {centeredSlides: h} = m;
            if (o.allowSlidePrev = !0, o.allowSlideNext = !0, o.virtual && m.virtual.enabled) return s && (m.centeredSlides || 0 !== o.snapIndex ? m.centeredSlides && o.snapIndex < m.slidesPerView ? o.slideTo(o.virtual.slides.length + o.snapIndex, 0, !1, !0) : o.snapIndex === o.snapGrid.length - 1 && o.slideTo(o.virtual.slidesBefore, 0, !1, !0) : o.slideTo(o.virtual.slides.length, 0, !1, !0)), 
            o.allowSlidePrev = c, o.allowSlideNext = p, void o.emit("loopFix");
            let f = m.slidesPerView;
            "auto" === f ? f = o.slidesPerViewDynamic() : (f = Math.ceil(parseFloat(m.slidesPerView, 10)), 
            h && f % 2 == 0 && (f += 1));
            const v = m.slidesPerGroupAuto ? f : m.slidesPerGroup;
            let w = v;
            w % v != 0 && (w += v - w % v), w += m.loopAdditionalSlides, o.loopedSlides = w;
            const b = o.grid && m.grid && m.grid.rows > 1;
            d.length < f + w ? g("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters") : b && "row" === m.grid.fill && g("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
            const y = [], E = [];
            let x = o.activeIndex;
            void 0 === r ? r = o.getSlideIndex(d.filter(e => e.classList.contains(m.slideActiveClass))[0]) : x = r;
            const S = "next" === a || !a, T = "prev" === a || !a;
            let M = 0, C = 0;
            const P = b ? Math.ceil(d.length / m.grid.rows) : d.length, L = (b ? d[r].column : r) + (h && void 0 === i ? -f / 2 + .5 : 0);
            if (L < w) {
                M = Math.max(w - L, v);
                for (let e = 0; e < w - L; e += 1) {
                    const t = e - Math.floor(e / P) * P;
                    if (b) {
                        const e = P - t - 1;
                        for (let t = d.length - 1; t >= 0; t -= 1) d[t].column === e && y.push(t);
                    } else y.push(P - t - 1);
                }
            } else if (L + f > P - w) {
                C = Math.max(L - (P - 2 * w), v);
                for (let e = 0; e < C; e += 1) {
                    const t = e - Math.floor(e / P) * P;
                    b ? d.forEach((e, s) => {
                        e.column === t && E.push(s);
                    }) : E.push(t);
                }
            }
            if (o.__preventObserver__ = !0, requestAnimationFrame(() => {
                o.__preventObserver__ = !1;
            }), T && y.forEach(e => {
                d[e].swiperLoopMoveDOM = !0, u.prepend(d[e]), d[e].swiperLoopMoveDOM = !1;
            }), S && E.forEach(e => {
                d[e].swiperLoopMoveDOM = !0, u.append(d[e]), d[e].swiperLoopMoveDOM = !1;
            }), o.recalcSlides(), "auto" === m.slidesPerView ? o.updateSlides() : b && (y.length > 0 && T || E.length > 0 && S) && o.slides.forEach((e, t) => {
                o.grid.updateSlide(t, e, o.slides);
            }), m.watchSlidesProgress && o.updateSlidesOffset(), s) if (y.length > 0 && T) {
                if (void 0 === t) {
                    const e = o.slidesGrid[x], t = o.slidesGrid[x + M] - e;
                    l ? o.setTranslate(o.translate - t) : (o.slideTo(x + Math.ceil(M), 0, !1, !0), i && (o.touchEventsData.startTranslate = o.touchEventsData.startTranslate - t, 
                    o.touchEventsData.currentTranslate = o.touchEventsData.currentTranslate - t));
                } else if (i) {
                    const e = b ? y.length / m.grid.rows : y.length;
                    o.slideTo(o.activeIndex + e, 0, !1, !0), o.touchEventsData.currentTranslate = o.translate;
                }
            } else if (E.length > 0 && S) if (void 0 === t) {
                const e = o.slidesGrid[x], t = o.slidesGrid[x - C] - e;
                l ? o.setTranslate(o.translate - t) : (o.slideTo(x - C, 0, !1, !0), i && (o.touchEventsData.startTranslate = o.touchEventsData.startTranslate - t, 
                o.touchEventsData.currentTranslate = o.touchEventsData.currentTranslate - t));
            } else {
                const e = b ? E.length / m.grid.rows : E.length;
                o.slideTo(o.activeIndex - e, 0, !1, !0);
            }
            if (o.allowSlidePrev = c, o.allowSlideNext = p, o.controller && o.controller.control && !n) {
                const e = {
                    slideRealIndex: t,
                    direction: a,
                    setTranslate: i,
                    activeSlideIndex: r,
                    byController: !0
                };
                Array.isArray(o.controller.control) ? o.controller.control.forEach(t => {
                    !t.destroyed && t.params.loop && t.loopFix({
                        ...e,
                        slideTo: t.params.slidesPerView === m.slidesPerView && s
                    });
                }) : o.controller.control instanceof o.constructor && o.controller.control.params.loop && o.controller.control.loopFix({
                    ...e,
                    slideTo: o.controller.control.params.slidesPerView === m.slidesPerView && s
                });
            }
            o.emit("loopFix");
        },
        loopDestroy: function() {
            const e = this, {params: t, slidesEl: s} = e;
            if (!t.loop || e.virtual && e.params.virtual.enabled) return;
            e.recalcSlides();
            const a = [];
            e.slides.forEach(e => {
                const t = void 0 === e.swiperSlideIndex ? 1 * e.getAttribute("data-swiper-slide-index") : e.swiperSlideIndex;
                a[t] = e;
            }), e.slides.forEach(e => {
                e.removeAttribute("data-swiper-slide-index");
            }), a.forEach(e => {
                s.append(e);
            }), e.recalcSlides(), e.slideTo(e.realIndex, 0);
        }
    };
    function q(e, t, s) {
        const a = r(), {params: i} = e, n = i.edgeSwipeDetection, l = i.edgeSwipeThreshold;
        return !n || !(s <= l || s >= a.innerWidth - l) || "prevent" === n && (t.preventDefault(), 
        !0);
    }
    function F(e) {
        const t = this, s = a();
        let i = e;
        i.originalEvent && (i = i.originalEvent);
        const n = t.touchEventsData;
        if ("pointerdown" === i.type) {
            if (null !== n.pointerId && n.pointerId !== i.pointerId) return;
            n.pointerId = i.pointerId;
        } else "touchstart" === i.type && 1 === i.targetTouches.length && (n.touchId = i.targetTouches[0].identifier);
        if ("touchstart" === i.type) return void q(t, i, i.targetTouches[0].pageX);
        const {params: l, touches: d, enabled: c} = t;
        if (!c) return;
        if (!l.simulateTouch && "mouse" === i.pointerType) return;
        if (t.animating && l.preventInteractionOnTransition) return;
        !t.animating && l.cssMode && l.loop && t.loopFix();
        let p = i.target;
        if ("wrapper" === l.touchEventsTarget && !function(e, t) {
            const s = t.contains(e);
            if (!s && t instanceof HTMLSlotElement) return [ ...t.assignedElements() ].includes(e);
            return s;
        }(p, t.wrapperEl)) return;
        if ("which" in i && 3 === i.which) return;
        if ("button" in i && i.button > 0) return;
        if (n.isTouched && n.isMoved) return;
        const u = !!l.noSwipingClass && "" !== l.noSwipingClass, m = i.composedPath ? i.composedPath() : i.path;
        u && i.target && i.target.shadowRoot && m && (p = m[0]);
        const h = l.noSwipingSelector ? l.noSwipingSelector : `.${l.noSwipingClass}`, f = !(!i.target || !i.target.shadowRoot);
        if (l.noSwiping && (f ? function(e, t) {
            return void 0 === t && (t = this), function t(s) {
                if (!s || s === a() || s === r()) return null;
                s.assignedSlot && (s = s.assignedSlot);
                const i = s.closest(e);
                return i || s.getRootNode ? i || t(s.getRootNode().host) : null;
            }(t);
        }(h, p) : p.closest(h))) return void (t.allowClick = !0);
        if (l.swipeHandler && !p.closest(l.swipeHandler)) return;
        d.currentX = i.pageX, d.currentY = i.pageY;
        const g = d.currentX, v = d.currentY;
        if (!q(t, i, g)) return;
        Object.assign(n, {
            isTouched: !0,
            isMoved: !1,
            allowTouchCallbacks: !0,
            isScrolling: void 0,
            startMoving: void 0
        }), d.startX = g, d.startY = v, n.touchStartTime = o(), t.allowClick = !0, t.updateSize(), 
        t.swipeDirection = void 0, l.threshold > 0 && (n.allowThresholdMove = !1);
        let w = !0;
        p.matches(n.focusableElements) && (w = !1, "SELECT" === p.nodeName && (n.isTouched = !1)), 
        s.activeElement && s.activeElement.matches(n.focusableElements) && s.activeElement !== p && ("mouse" === i.pointerType || "mouse" !== i.pointerType && !p.matches(n.focusableElements)) && s.activeElement.blur();
        const b = w && t.allowTouchMove && l.touchStartPreventDefault;
        !l.touchStartForcePreventDefault && !b || p.isContentEditable || i.preventDefault(), 
        l.freeMode && l.freeMode.enabled && t.freeMode && t.animating && !l.cssMode && t.freeMode.onTouchStart(), 
        t.emit("touchStart", i);
    }
    function V(e) {
        const t = a(), s = this, i = s.touchEventsData, {params: r, touches: n, rtlTranslate: l, enabled: d} = s;
        if (!d) return;
        if (!r.simulateTouch && "mouse" === e.pointerType) return;
        let c, p = e;
        if (p.originalEvent && (p = p.originalEvent), "pointermove" === p.type) {
            if (null !== i.touchId) return;
            if (p.pointerId !== i.pointerId) return;
        }
        if ("touchmove" === p.type) {
            if (c = [ ...p.changedTouches ].filter(e => e.identifier === i.touchId)[0], !c || c.identifier !== i.touchId) return;
        } else c = p;
        if (!i.isTouched) return void (i.startMoving && i.isScrolling && s.emit("touchMoveOpposite", p));
        const u = c.pageX, m = c.pageY;
        if (p.preventedByNestedSwiper) return n.startX = u, void (n.startY = m);
        if (!s.allowTouchMove) return p.target.matches(i.focusableElements) || (s.allowClick = !1), 
        void (i.isTouched && (Object.assign(n, {
            startX: u,
            startY: m,
            currentX: u,
            currentY: m
        }), i.touchStartTime = o()));
        if (r.touchReleaseOnEdges && !r.loop) if (s.isVertical()) {
            if (m < n.startY && s.translate <= s.maxTranslate() || m > n.startY && s.translate >= s.minTranslate()) return i.isTouched = !1, 
            void (i.isMoved = !1);
        } else if (u < n.startX && s.translate <= s.maxTranslate() || u > n.startX && s.translate >= s.minTranslate()) return;
        if (t.activeElement && t.activeElement.matches(i.focusableElements) && t.activeElement !== p.target && "mouse" !== p.pointerType && t.activeElement.blur(), 
        t.activeElement && p.target === t.activeElement && p.target.matches(i.focusableElements)) return i.isMoved = !0, 
        void (s.allowClick = !1);
        i.allowTouchCallbacks && s.emit("touchMove", p), n.previousX = n.currentX, n.previousY = n.currentY, 
        n.currentX = u, n.currentY = m;
        const h = n.currentX - n.startX, f = n.currentY - n.startY;
        if (s.params.threshold && Math.sqrt(h ** 2 + f ** 2) < s.params.threshold) return;
        if (void 0 === i.isScrolling) {
            let e;
            s.isHorizontal() && n.currentY === n.startY || s.isVertical() && n.currentX === n.startX ? i.isScrolling = !1 : h * h + f * f >= 25 && (e = 180 * Math.atan2(Math.abs(f), Math.abs(h)) / Math.PI, 
            i.isScrolling = s.isHorizontal() ? e > r.touchAngle : 90 - e > r.touchAngle);
        }
        if (i.isScrolling && s.emit("touchMoveOpposite", p), void 0 === i.startMoving && (n.currentX === n.startX && n.currentY === n.startY || (i.startMoving = !0)), 
        i.isScrolling || "touchmove" === p.type && i.preventTouchMoveFromPointerMove) return void (i.isTouched = !1);
        if (!i.startMoving) return;
        s.allowClick = !1, !r.cssMode && p.cancelable && p.preventDefault(), r.touchMoveStopPropagation && !r.nested && p.stopPropagation();
        let g = s.isHorizontal() ? h : f, v = s.isHorizontal() ? n.currentX - n.previousX : n.currentY - n.previousY;
        r.oneWayMovement && (g = Math.abs(g) * (l ? 1 : -1), v = Math.abs(v) * (l ? 1 : -1)), 
        n.diff = g, g *= r.touchRatio, l && (g = -g, v = -v);
        const w = s.touchesDirection;
        s.swipeDirection = g > 0 ? "prev" : "next", s.touchesDirection = v > 0 ? "prev" : "next";
        const b = s.params.loop && !r.cssMode, y = "next" === s.touchesDirection && s.allowSlideNext || "prev" === s.touchesDirection && s.allowSlidePrev;
        if (!i.isMoved) {
            if (b && y && s.loopFix({
                direction: s.swipeDirection
            }), i.startTranslate = s.getTranslate(), s.setTransition(0), s.animating) {
                const e = new window.CustomEvent("transitionend", {
                    bubbles: !0,
                    cancelable: !0,
                    detail: {
                        bySwiperTouchMove: !0
                    }
                });
                s.wrapperEl.dispatchEvent(e);
            }
            i.allowMomentumBounce = !1, !r.grabCursor || !0 !== s.allowSlideNext && !0 !== s.allowSlidePrev || s.setGrabCursor(!0), 
            s.emit("sliderFirstMove", p);
        }
        if ((new Date).getTime(), i.isMoved && i.allowThresholdMove && w !== s.touchesDirection && b && y && Math.abs(g) >= 1) return Object.assign(n, {
            startX: u,
            startY: m,
            currentX: u,
            currentY: m,
            startTranslate: i.currentTranslate
        }), i.loopSwapReset = !0, void (i.startTranslate = i.currentTranslate);
        s.emit("sliderMove", p), i.isMoved = !0, i.currentTranslate = g + i.startTranslate;
        let E = !0, x = r.resistanceRatio;
        if (r.touchReleaseOnEdges && (x = 0), g > 0 ? (b && y && i.allowThresholdMove && i.currentTranslate > (r.centeredSlides ? s.minTranslate() - s.slidesSizesGrid[s.activeIndex + 1] - ("auto" !== r.slidesPerView && s.slides.length - r.slidesPerView >= 2 ? s.slidesSizesGrid[s.activeIndex + 1] + s.params.spaceBetween : 0) - s.params.spaceBetween : s.minTranslate()) && s.loopFix({
            direction: "prev",
            setTranslate: !0,
            activeSlideIndex: 0
        }), i.currentTranslate > s.minTranslate() && (E = !1, r.resistance && (i.currentTranslate = s.minTranslate() - 1 + (-s.minTranslate() + i.startTranslate + g) ** x))) : g < 0 && (b && y && i.allowThresholdMove && i.currentTranslate < (r.centeredSlides ? s.maxTranslate() + s.slidesSizesGrid[s.slidesSizesGrid.length - 1] + s.params.spaceBetween + ("auto" !== r.slidesPerView && s.slides.length - r.slidesPerView >= 2 ? s.slidesSizesGrid[s.slidesSizesGrid.length - 1] + s.params.spaceBetween : 0) : s.maxTranslate()) && s.loopFix({
            direction: "next",
            setTranslate: !0,
            activeSlideIndex: s.slides.length - ("auto" === r.slidesPerView ? s.slidesPerViewDynamic() : Math.ceil(parseFloat(r.slidesPerView, 10)))
        }), i.currentTranslate < s.maxTranslate() && (E = !1, r.resistance && (i.currentTranslate = s.maxTranslate() + 1 - (s.maxTranslate() - i.startTranslate - g) ** x))), 
        E && (p.preventedByNestedSwiper = !0), !s.allowSlideNext && "next" === s.swipeDirection && i.currentTranslate < i.startTranslate && (i.currentTranslate = i.startTranslate), 
        !s.allowSlidePrev && "prev" === s.swipeDirection && i.currentTranslate > i.startTranslate && (i.currentTranslate = i.startTranslate), 
        s.allowSlidePrev || s.allowSlideNext || (i.currentTranslate = i.startTranslate), 
        r.threshold > 0) {
            if (!(Math.abs(g) > r.threshold || i.allowThresholdMove)) return void (i.currentTranslate = i.startTranslate);
            if (!i.allowThresholdMove) return i.allowThresholdMove = !0, n.startX = n.currentX, 
            n.startY = n.currentY, i.currentTranslate = i.startTranslate, void (n.diff = s.isHorizontal() ? n.currentX - n.startX : n.currentY - n.startY);
        }
        r.followFinger && !r.cssMode && ((r.freeMode && r.freeMode.enabled && s.freeMode || r.watchSlidesProgress) && (s.updateActiveIndex(), 
        s.updateSlidesClasses()), r.freeMode && r.freeMode.enabled && s.freeMode && s.freeMode.onTouchMove(), 
        s.updateProgress(i.currentTranslate), s.setTranslate(i.currentTranslate));
    }
    function _(e) {
        const t = this, s = t.touchEventsData;
        let a, i = e;
        i.originalEvent && (i = i.originalEvent);
        if ("touchend" === i.type || "touchcancel" === i.type) {
            if (a = [ ...i.changedTouches ].filter(e => e.identifier === s.touchId)[0], !a || a.identifier !== s.touchId) return;
        } else {
            if (null !== s.touchId) return;
            if (i.pointerId !== s.pointerId) return;
            a = i;
        }
        if ([ "pointercancel", "pointerout", "pointerleave", "contextmenu" ].includes(i.type)) {
            if (!([ "pointercancel", "contextmenu" ].includes(i.type) && (t.browser.isSafari || t.browser.isWebView))) return;
        }
        s.pointerId = null, s.touchId = null;
        const {params: r, touches: n, rtlTranslate: d, slidesGrid: c, enabled: p} = t;
        if (!p) return;
        if (!r.simulateTouch && "mouse" === i.pointerType) return;
        if (s.allowTouchCallbacks && t.emit("touchEnd", i), s.allowTouchCallbacks = !1, 
        !s.isTouched) return s.isMoved && r.grabCursor && t.setGrabCursor(!1), s.isMoved = !1, 
        void (s.startMoving = !1);
        r.grabCursor && s.isMoved && s.isTouched && (!0 === t.allowSlideNext || !0 === t.allowSlidePrev) && t.setGrabCursor(!1);
        const u = o(), m = u - s.touchStartTime;
        if (t.allowClick) {
            const e = i.path || i.composedPath && i.composedPath();
            t.updateClickedSlide(e && e[0] || i.target, e), t.emit("tap click", i), m < 300 && u - s.lastClickTime < 300 && t.emit("doubleTap doubleClick", i);
        }
        if (s.lastClickTime = o(), l(() => {
            t.destroyed || (t.allowClick = !0);
        }), !s.isTouched || !s.isMoved || !t.swipeDirection || 0 === n.diff && !s.loopSwapReset || s.currentTranslate === s.startTranslate && !s.loopSwapReset) return s.isTouched = !1, 
        s.isMoved = !1, void (s.startMoving = !1);
        let h;
        if (s.isTouched = !1, s.isMoved = !1, s.startMoving = !1, h = r.followFinger ? d ? t.translate : -t.translate : -s.currentTranslate, 
        r.cssMode) return;
        if (r.freeMode && r.freeMode.enabled) return void t.freeMode.onTouchEnd({
            currentPos: h
        });
        const f = h >= -t.maxTranslate() && !t.params.loop;
        let g = 0, v = t.slidesSizesGrid[0];
        for (let e = 0; e < c.length; e += e < r.slidesPerGroupSkip ? 1 : r.slidesPerGroup) {
            const t = e < r.slidesPerGroupSkip - 1 ? 1 : r.slidesPerGroup;
            void 0 !== c[e + t] ? (f || h >= c[e] && h < c[e + t]) && (g = e, v = c[e + t] - c[e]) : (f || h >= c[e]) && (g = e, 
            v = c[c.length - 1] - c[c.length - 2]);
        }
        let w = null, b = null;
        r.rewind && (t.isBeginning ? b = r.virtual && r.virtual.enabled && t.virtual ? t.virtual.slides.length - 1 : t.slides.length - 1 : t.isEnd && (w = 0));
        const y = (h - c[g]) / v, E = g < r.slidesPerGroupSkip - 1 ? 1 : r.slidesPerGroup;
        if (m > r.longSwipesMs) {
            if (!r.longSwipes) return void t.slideTo(t.activeIndex);
            "next" === t.swipeDirection && (y >= r.longSwipesRatio ? t.slideTo(r.rewind && t.isEnd ? w : g + E) : t.slideTo(g)), 
            "prev" === t.swipeDirection && (y > 1 - r.longSwipesRatio ? t.slideTo(g + E) : null !== b && y < 0 && Math.abs(y) > r.longSwipesRatio ? t.slideTo(b) : t.slideTo(g));
        } else {
            if (!r.shortSwipes) return void t.slideTo(t.activeIndex);
            t.navigation && (i.target === t.navigation.nextEl || i.target === t.navigation.prevEl) ? i.target === t.navigation.nextEl ? t.slideTo(g + E) : t.slideTo(g) : ("next" === t.swipeDirection && t.slideTo(null !== w ? w : g + E), 
            "prev" === t.swipeDirection && t.slideTo(null !== b ? b : g));
        }
    }
    function W() {
        const e = this, {params: t, el: s} = e;
        if (s && 0 === s.offsetWidth) return;
        t.breakpoints && e.setBreakpoint();
        const {allowSlideNext: a, allowSlidePrev: i, snapGrid: r} = e, n = e.virtual && e.params.virtual.enabled;
        e.allowSlideNext = !0, e.allowSlidePrev = !0, e.updateSize(), e.updateSlides(), 
        e.updateSlidesClasses();
        const l = n && t.loop;
        !("auto" === t.slidesPerView || t.slidesPerView > 1) || !e.isEnd || e.isBeginning || e.params.centeredSlides || l ? e.params.loop && !n ? e.slideToLoop(e.realIndex, 0, !1, !0) : e.slideTo(e.activeIndex, 0, !1, !0) : e.slideTo(e.slides.length - 1, 0, !1, !0), 
        e.autoplay && e.autoplay.running && e.autoplay.paused && (clearTimeout(e.autoplay.resizeTimeout), 
        e.autoplay.resizeTimeout = setTimeout(() => {
            e.autoplay && e.autoplay.running && e.autoplay.paused && e.autoplay.resume();
        }, 500)), e.allowSlidePrev = i, e.allowSlideNext = a, e.params.watchOverflow && r !== e.snapGrid && e.checkOverflow();
    }
    function j(e) {
        const t = this;
        t.enabled && (t.allowClick || (t.params.preventClicks && e.preventDefault(), t.params.preventClicksPropagation && t.animating && (e.stopPropagation(), 
        e.stopImmediatePropagation())));
    }
    function U() {
        const e = this, {wrapperEl: t, rtlTranslate: s, enabled: a} = e;
        if (!a) return;
        let i;
        e.previousTranslate = e.translate, e.isHorizontal() ? e.translate = -t.scrollLeft : e.translate = -t.scrollTop, 
        0 === e.translate && (e.translate = 0), e.updateActiveIndex(), e.updateSlidesClasses();
        const r = e.maxTranslate() - e.minTranslate();
        i = 0 === r ? 0 : (e.translate - e.minTranslate()) / r, i !== e.progress && e.updateProgress(s ? -e.translate : e.translate), 
        e.emit("setTranslate", e.translate, !1);
    }
    function K(e) {
        const t = this;
        D(t, e.target), t.params.cssMode || "auto" !== t.params.slidesPerView && !t.params.autoHeight || t.update();
    }
    function Z() {
        const e = this;
        e.documentTouchHandlerProceeded || (e.documentTouchHandlerProceeded = !0, e.params.touchReleaseOnEdges && (e.el.style.touchAction = "auto"));
    }
    const Q = (e, t) => {
        const s = a(), {params: i, el: r, wrapperEl: n, device: l} = e, o = !!i.nested, d = "on" === t ? "addEventListener" : "removeEventListener", c = t;
        r && "string" != typeof r && (s[d]("touchstart", e.onDocumentTouchStart, {
            passive: !1,
            capture: o
        }), r[d]("touchstart", e.onTouchStart, {
            passive: !1
        }), r[d]("pointerdown", e.onTouchStart, {
            passive: !1
        }), s[d]("touchmove", e.onTouchMove, {
            passive: !1,
            capture: o
        }), s[d]("pointermove", e.onTouchMove, {
            passive: !1,
            capture: o
        }), s[d]("touchend", e.onTouchEnd, {
            passive: !0
        }), s[d]("pointerup", e.onTouchEnd, {
            passive: !0
        }), s[d]("pointercancel", e.onTouchEnd, {
            passive: !0
        }), s[d]("touchcancel", e.onTouchEnd, {
            passive: !0
        }), s[d]("pointerout", e.onTouchEnd, {
            passive: !0
        }), s[d]("pointerleave", e.onTouchEnd, {
            passive: !0
        }), s[d]("contextmenu", e.onTouchEnd, {
            passive: !0
        }), (i.preventClicks || i.preventClicksPropagation) && r[d]("click", e.onClick, !0), 
        i.cssMode && n[d]("scroll", e.onScroll), i.updateOnWindowResize ? e[c](l.ios || l.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", W, !0) : e[c]("observerUpdate", W, !0), 
        r[d]("load", e.onLoad, {
            capture: !0
        }));
    };
    const J = (e, t) => e.grid && t.grid && t.grid.rows > 1;
    var ee = {
        init: !0,
        direction: "horizontal",
        oneWayMovement: !1,
        swiperElementNodeName: "SWIPER-CONTAINER",
        touchEventsTarget: "wrapper",
        initialSlide: 0,
        speed: 300,
        cssMode: !1,
        updateOnWindowResize: !0,
        resizeObserver: !0,
        nested: !1,
        createElements: !1,
        eventsPrefix: "swiper",
        enabled: !0,
        focusableElements: "input, select, option, textarea, button, video, label",
        width: null,
        height: null,
        preventInteractionOnTransition: !1,
        userAgent: null,
        url: null,
        edgeSwipeDetection: !1,
        edgeSwipeThreshold: 20,
        autoHeight: !1,
        setWrapperSize: !1,
        virtualTranslate: !1,
        effect: "slide",
        breakpoints: void 0,
        breakpointsBase: "window",
        spaceBetween: 0,
        slidesPerView: 1,
        slidesPerGroup: 1,
        slidesPerGroupSkip: 0,
        slidesPerGroupAuto: !1,
        centeredSlides: !1,
        centeredSlidesBounds: !1,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        normalizeSlideIndex: !0,
        centerInsufficientSlides: !1,
        watchOverflow: !0,
        roundLengths: !1,
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: !0,
        shortSwipes: !0,
        longSwipes: !0,
        longSwipesRatio: .5,
        longSwipesMs: 300,
        followFinger: !0,
        allowTouchMove: !0,
        threshold: 5,
        touchMoveStopPropagation: !1,
        touchStartPreventDefault: !0,
        touchStartForcePreventDefault: !1,
        touchReleaseOnEdges: !1,
        uniqueNavElements: !0,
        resistance: !0,
        resistanceRatio: .85,
        watchSlidesProgress: !1,
        grabCursor: !1,
        preventClicks: !0,
        preventClicksPropagation: !0,
        slideToClickedSlide: !1,
        loop: !1,
        loopAddBlankSlides: !0,
        loopAdditionalSlides: 0,
        loopPreventsSliding: !0,
        rewind: !1,
        allowSlidePrev: !0,
        allowSlideNext: !0,
        swipeHandler: null,
        noSwiping: !0,
        noSwipingClass: "swiper-no-swiping",
        noSwipingSelector: null,
        passiveListeners: !0,
        maxBackfaceHiddenSlides: 10,
        containerModifierClass: "swiper-",
        slideClass: "swiper-slide",
        slideBlankClass: "swiper-slide-blank",
        slideActiveClass: "swiper-slide-active",
        slideVisibleClass: "swiper-slide-visible",
        slideFullyVisibleClass: "swiper-slide-fully-visible",
        slideNextClass: "swiper-slide-next",
        slidePrevClass: "swiper-slide-prev",
        wrapperClass: "swiper-wrapper",
        lazyPreloaderClass: "swiper-lazy-preloader",
        lazyPreloadPrevNext: 0,
        runCallbacksOnInit: !0,
        _emitClasses: !1
    };
    function te(e, t) {
        return function(s) {
            void 0 === s && (s = {});
            const a = Object.keys(s)[0], i = s[a];
            "object" == typeof i && null !== i ? (!0 === e[a] && (e[a] = {
                enabled: !0
            }), "navigation" === a && e[a] && e[a].enabled && !e[a].prevEl && !e[a].nextEl && (e[a].auto = !0), 
            [ "pagination", "scrollbar" ].indexOf(a) >= 0 && e[a] && e[a].enabled && !e[a].el && (e[a].auto = !0), 
            a in e && "enabled" in i ? ("object" != typeof e[a] || "enabled" in e[a] || (e[a].enabled = !0), 
            e[a] || (e[a] = {
                enabled: !1
            }), p(t, s)) : p(t, s)) : p(t, s);
        };
    }
    const se = {
        eventsEmitter: $,
        update: B,
        translate: N,
        transition: {
            setTransition: function(e, t) {
                const s = this;
                s.params.cssMode || (s.wrapperEl.style.transitionDuration = `${e}ms`, s.wrapperEl.style.transitionDelay = 0 === e ? "0ms" : ""), 
                s.emit("setTransition", e, t);
            },
            transitionStart: function(e, t) {
                void 0 === e && (e = !0);
                const s = this, {params: a} = s;
                a.cssMode || (a.autoHeight && s.updateAutoHeight(), X({
                    swiper: s,
                    runCallbacks: e,
                    direction: t,
                    step: "Start"
                }));
            },
            transitionEnd: function(e, t) {
                void 0 === e && (e = !0);
                const s = this, {params: a} = s;
                s.animating = !1, a.cssMode || (s.setTransition(0), X({
                    swiper: s,
                    runCallbacks: e,
                    direction: t,
                    step: "End"
                }));
            }
        },
        slide: Y,
        loop: R,
        grabCursor: {
            setGrabCursor: function(e) {
                const t = this;
                if (!t.params.simulateTouch || t.params.watchOverflow && t.isLocked || t.params.cssMode) return;
                const s = "container" === t.params.touchEventsTarget ? t.el : t.wrapperEl;
                t.isElement && (t.__preventObserver__ = !0), s.style.cursor = "move", s.style.cursor = e ? "grabbing" : "grab", 
                t.isElement && requestAnimationFrame(() => {
                    t.__preventObserver__ = !1;
                });
            },
            unsetGrabCursor: function() {
                const e = this;
                e.params.watchOverflow && e.isLocked || e.params.cssMode || (e.isElement && (e.__preventObserver__ = !0), 
                e["container" === e.params.touchEventsTarget ? "el" : "wrapperEl"].style.cursor = "", 
                e.isElement && requestAnimationFrame(() => {
                    e.__preventObserver__ = !1;
                }));
            }
        },
        events: {
            attachEvents: function() {
                const e = this, {params: t} = e;
                e.onTouchStart = F.bind(e), e.onTouchMove = V.bind(e), e.onTouchEnd = _.bind(e), 
                e.onDocumentTouchStart = Z.bind(e), t.cssMode && (e.onScroll = U.bind(e)), e.onClick = j.bind(e), 
                e.onLoad = K.bind(e), Q(e, "on");
            },
            detachEvents: function() {
                Q(this, "off");
            }
        },
        breakpoints: {
            setBreakpoint: function() {
                const e = this, {realIndex: t, initialized: s, params: a, el: i} = e, r = a.breakpoints;
                if (!r || r && 0 === Object.keys(r).length) return;
                const n = e.getBreakpoint(r, e.params.breakpointsBase, e.el);
                if (!n || e.currentBreakpoint === n) return;
                const l = (n in r ? r[n] : void 0) || e.originalParams, o = J(e, a), d = J(e, l), c = e.params.grabCursor, u = l.grabCursor, m = a.enabled;
                o && !d ? (i.classList.remove(`${a.containerModifierClass}grid`, `${a.containerModifierClass}grid-column`), 
                e.emitContainerClasses()) : !o && d && (i.classList.add(`${a.containerModifierClass}grid`), 
                (l.grid.fill && "column" === l.grid.fill || !l.grid.fill && "column" === a.grid.fill) && i.classList.add(`${a.containerModifierClass}grid-column`), 
                e.emitContainerClasses()), c && !u ? e.unsetGrabCursor() : !c && u && e.setGrabCursor(), 
                [ "navigation", "pagination", "scrollbar" ].forEach(t => {
                    if (void 0 === l[t]) return;
                    const s = a[t] && a[t].enabled, i = l[t] && l[t].enabled;
                    s && !i && e[t].disable(), !s && i && e[t].enable();
                });
                const h = l.direction && l.direction !== a.direction, f = a.loop && (l.slidesPerView !== a.slidesPerView || h), g = a.loop;
                h && s && e.changeDirection(), p(e.params, l);
                const v = e.params.enabled, w = e.params.loop;
                Object.assign(e, {
                    allowTouchMove: e.params.allowTouchMove,
                    allowSlideNext: e.params.allowSlideNext,
                    allowSlidePrev: e.params.allowSlidePrev
                }), m && !v ? e.disable() : !m && v && e.enable(), e.currentBreakpoint = n, e.emit("_beforeBreakpoint", l), 
                s && (f ? (e.loopDestroy(), e.loopCreate(t), e.updateSlides()) : !g && w ? (e.loopCreate(t), 
                e.updateSlides()) : g && !w && e.loopDestroy()), e.emit("breakpoint", l);
            },
            getBreakpoint: function(e, t, s) {
                if (void 0 === t && (t = "window"), !e || "container" === t && !s) return;
                let a = !1;
                const i = r(), n = "window" === t ? i.innerHeight : s.clientHeight, l = Object.keys(e).map(e => {
                    if ("string" == typeof e && 0 === e.indexOf("@")) {
                        const t = parseFloat(e.substr(1));
                        return {
                            value: n * t,
                            point: e
                        };
                    }
                    return {
                        value: e,
                        point: e
                    };
                });
                l.sort((e, t) => parseInt(e.value, 10) - parseInt(t.value, 10));
                for (let e = 0; e < l.length; e += 1) {
                    const {point: r, value: n} = l[e];
                    "window" === t ? i.matchMedia(`(min-width: ${n}px)`).matches && (a = r) : n <= s.clientWidth && (a = r);
                }
                return a || "max";
            }
        },
        checkOverflow: {
            checkOverflow: function() {
                const e = this, {isLocked: t, params: s} = e, {slidesOffsetBefore: a} = s;
                if (a) {
                    const t = e.slides.length - 1, s = e.slidesGrid[t] + e.slidesSizesGrid[t] + 2 * a;
                    e.isLocked = e.size > s;
                } else e.isLocked = 1 === e.snapGrid.length;
                !0 === s.allowSlideNext && (e.allowSlideNext = !e.isLocked), !0 === s.allowSlidePrev && (e.allowSlidePrev = !e.isLocked), 
                t && t !== e.isLocked && (e.isEnd = !1), t !== e.isLocked && e.emit(e.isLocked ? "lock" : "unlock");
            }
        },
        classes: {
            addClasses: function() {
                const e = this, {classNames: t, params: s, rtl: a, el: i, device: r} = e, n = function(e, t) {
                    const s = [];
                    return e.forEach(e => {
                        "object" == typeof e ? Object.keys(e).forEach(a => {
                            e[a] && s.push(t + a);
                        }) : "string" == typeof e && s.push(t + e);
                    }), s;
                }([ "initialized", s.direction, {
                    "free-mode": e.params.freeMode && s.freeMode.enabled
                }, {
                    autoheight: s.autoHeight
                }, {
                    rtl: a
                }, {
                    grid: s.grid && s.grid.rows > 1
                }, {
                    "grid-column": s.grid && s.grid.rows > 1 && "column" === s.grid.fill
                }, {
                    android: r.android
                }, {
                    ios: r.ios
                }, {
                    "css-mode": s.cssMode
                }, {
                    centered: s.cssMode && s.centeredSlides
                }, {
                    "watch-progress": s.watchSlidesProgress
                } ], s.containerModifierClass);
                t.push(...n), i.classList.add(...t), e.emitContainerClasses();
            },
            removeClasses: function() {
                const {el: e, classNames: t} = this;
                e && "string" != typeof e && (e.classList.remove(...t), this.emitContainerClasses());
            }
        }
    }, ae = {};
    class ie {
        constructor() {
            let e, t;
            for (var s = arguments.length, i = new Array(s), r = 0; r < s; r++) i[r] = arguments[r];
            1 === i.length && i[0].constructor && "Object" === Object.prototype.toString.call(i[0]).slice(8, -1) ? t = i[0] : [e, t] = i, 
            t || (t = {}), t = p({}, t), e && !t.el && (t.el = e);
            const n = a();
            if (t.el && "string" == typeof t.el && n.querySelectorAll(t.el).length > 1) {
                const e = [];
                return n.querySelectorAll(t.el).forEach(s => {
                    const a = p({}, t, {
                        el: s
                    });
                    e.push(new ie(a));
                }), e;
            }
            const l = this;
            l.__swiper__ = !0, l.support = I(), l.device = z({
                userAgent: t.userAgent
            }), l.browser = A(), l.eventsListeners = {}, l.eventsAnyListeners = [], l.modules = [ ...l.__modules__ ], 
            t.modules && Array.isArray(t.modules) && l.modules.push(...t.modules);
            const o = {};
            l.modules.forEach(e => {
                e({
                    params: t,
                    swiper: l,
                    extendParams: te(t, o),
                    on: l.on.bind(l),
                    once: l.once.bind(l),
                    off: l.off.bind(l),
                    emit: l.emit.bind(l)
                });
            });
            const d = p({}, ee, o);
            return l.params = p({}, d, ae, t), l.originalParams = p({}, l.params), l.passedParams = p({}, t), 
            l.params && l.params.on && Object.keys(l.params.on).forEach(e => {
                l.on(e, l.params.on[e]);
            }), l.params && l.params.onAny && l.onAny(l.params.onAny), Object.assign(l, {
                enabled: l.params.enabled,
                el: e,
                classNames: [],
                slides: [],
                slidesGrid: [],
                snapGrid: [],
                slidesSizesGrid: [],
                isHorizontal: () => "horizontal" === l.params.direction,
                isVertical: () => "vertical" === l.params.direction,
                activeIndex: 0,
                realIndex: 0,
                isBeginning: !0,
                isEnd: !1,
                translate: 0,
                previousTranslate: 0,
                progress: 0,
                velocity: 0,
                animating: !1,
                cssOverflowAdjustment() {
                    return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
                },
                allowSlideNext: l.params.allowSlideNext,
                allowSlidePrev: l.params.allowSlidePrev,
                touchEventsData: {
                    isTouched: void 0,
                    isMoved: void 0,
                    allowTouchCallbacks: void 0,
                    touchStartTime: void 0,
                    isScrolling: void 0,
                    currentTranslate: void 0,
                    startTranslate: void 0,
                    allowThresholdMove: void 0,
                    focusableElements: l.params.focusableElements,
                    lastClickTime: 0,
                    clickTimeout: void 0,
                    velocities: [],
                    allowMomentumBounce: void 0,
                    startMoving: void 0,
                    pointerId: null,
                    touchId: null
                },
                allowClick: !0,
                allowTouchMove: l.params.allowTouchMove,
                touches: {
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                    diff: 0
                },
                imagesToLoad: [],
                imagesLoaded: 0
            }), l.emit("_swiper"), l.params.init && l.init(), l;
        }
        getDirectionLabel(e) {
            return this.isHorizontal() ? e : {
                width: "height",
                "margin-top": "margin-left",
                "margin-bottom ": "margin-right",
                "margin-left": "margin-top",
                "margin-right": "margin-bottom",
                "padding-left": "padding-top",
                "padding-right": "padding-bottom",
                marginRight: "marginBottom"
            }[e];
        }
        getSlideIndex(e) {
            const {slidesEl: t, params: s} = this, a = y(f(t, `.${s.slideClass}, swiper-slide`)[0]);
            return y(e) - a;
        }
        getSlideIndexByData(e) {
            return this.getSlideIndex(this.slides.filter(t => 1 * t.getAttribute("data-swiper-slide-index") === e)[0]);
        }
        recalcSlides() {
            const {slidesEl: e, params: t} = this;
            this.slides = f(e, `.${t.slideClass}, swiper-slide`);
        }
        enable() {
            const e = this;
            e.enabled || (e.enabled = !0, e.params.grabCursor && e.setGrabCursor(), e.emit("enable"));
        }
        disable() {
            const e = this;
            e.enabled && (e.enabled = !1, e.params.grabCursor && e.unsetGrabCursor(), e.emit("disable"));
        }
        setProgress(e, t) {
            const s = this;
            e = Math.min(Math.max(e, 0), 1);
            const a = s.minTranslate(), i = (s.maxTranslate() - a) * e + a;
            s.translateTo(i, void 0 === t ? 0 : t), s.updateActiveIndex(), s.updateSlidesClasses();
        }
        emitContainerClasses() {
            const e = this;
            if (!e.params._emitClasses || !e.el) return;
            const t = e.el.className.split(" ").filter(t => 0 === t.indexOf("swiper") || 0 === t.indexOf(e.params.containerModifierClass));
            e.emit("_containerClasses", t.join(" "));
        }
        getSlideClasses(e) {
            const t = this;
            return t.destroyed ? "" : e.className.split(" ").filter(e => 0 === e.indexOf("swiper-slide") || 0 === e.indexOf(t.params.slideClass)).join(" ");
        }
        emitSlidesClasses() {
            const e = this;
            if (!e.params._emitClasses || !e.el) return;
            const t = [];
            e.slides.forEach(s => {
                const a = e.getSlideClasses(s);
                t.push({
                    slideEl: s,
                    classNames: a
                }), e.emit("_slideClass", s, a);
            }), e.emit("_slideClasses", t);
        }
        slidesPerViewDynamic(e, t) {
            void 0 === e && (e = "current"), void 0 === t && (t = !1);
            const {params: s, slides: a, slidesGrid: i, slidesSizesGrid: r, size: n, activeIndex: l} = this;
            let o = 1;
            if ("number" == typeof s.slidesPerView) return s.slidesPerView;
            if (s.centeredSlides) {
                let e, t = a[l] ? Math.ceil(a[l].swiperSlideSize) : 0;
                for (let s = l + 1; s < a.length; s += 1) a[s] && !e && (t += Math.ceil(a[s].swiperSlideSize), 
                o += 1, t > n && (e = !0));
                for (let s = l - 1; s >= 0; s -= 1) a[s] && !e && (t += a[s].swiperSlideSize, o += 1, 
                t > n && (e = !0));
            } else if ("current" === e) for (let e = l + 1; e < a.length; e += 1) {
                (t ? i[e] + r[e] - i[l] < n : i[e] - i[l] < n) && (o += 1);
            } else for (let e = l - 1; e >= 0; e -= 1) {
                i[l] - i[e] < n && (o += 1);
            }
            return o;
        }
        update() {
            const e = this;
            if (!e || e.destroyed) return;
            const {snapGrid: t, params: s} = e;
            function a() {
                const t = e.rtlTranslate ? -1 * e.translate : e.translate, s = Math.min(Math.max(t, e.maxTranslate()), e.minTranslate());
                e.setTranslate(s), e.updateActiveIndex(), e.updateSlidesClasses();
            }
            let i;
            if (s.breakpoints && e.setBreakpoint(), [ ...e.el.querySelectorAll('[loading="lazy"]') ].forEach(t => {
                t.complete && D(e, t);
            }), e.updateSize(), e.updateSlides(), e.updateProgress(), e.updateSlidesClasses(), 
            s.freeMode && s.freeMode.enabled && !s.cssMode) a(), s.autoHeight && e.updateAutoHeight(); else {
                if (("auto" === s.slidesPerView || s.slidesPerView > 1) && e.isEnd && !s.centeredSlides) {
                    const t = e.virtual && s.virtual.enabled ? e.virtual.slides : e.slides;
                    i = e.slideTo(t.length - 1, 0, !1, !0);
                } else i = e.slideTo(e.activeIndex, 0, !1, !0);
                i || a();
            }
            s.watchOverflow && t !== e.snapGrid && e.checkOverflow(), e.emit("update");
        }
        changeDirection(e, t) {
            void 0 === t && (t = !0);
            const s = this, a = s.params.direction;
            return e || (e = "horizontal" === a ? "vertical" : "horizontal"), e === a || "horizontal" !== e && "vertical" !== e || (s.el.classList.remove(`${s.params.containerModifierClass}${a}`), 
            s.el.classList.add(`${s.params.containerModifierClass}${e}`), s.emitContainerClasses(), 
            s.params.direction = e, s.slides.forEach(t => {
                "vertical" === e ? t.style.width = "" : t.style.height = "";
            }), s.emit("changeDirection"), t && s.update()), s;
        }
        changeLanguageDirection(e) {
            const t = this;
            t.rtl && "rtl" === e || !t.rtl && "ltr" === e || (t.rtl = "rtl" === e, t.rtlTranslate = "horizontal" === t.params.direction && t.rtl, 
            t.rtl ? (t.el.classList.add(`${t.params.containerModifierClass}rtl`), t.el.dir = "rtl") : (t.el.classList.remove(`${t.params.containerModifierClass}rtl`), 
            t.el.dir = "ltr"), t.update());
        }
        mount(e) {
            const t = this;
            if (t.mounted) return !0;
            let s = e || t.params.el;
            if ("string" == typeof s && (s = document.querySelector(s)), !s) return !1;
            s.swiper = t, s.parentNode && s.parentNode.host && s.parentNode.host.nodeName === t.params.swiperElementNodeName.toUpperCase() && (t.isElement = !0);
            const a = () => `.${(t.params.wrapperClass || "").trim().split(" ").join(".")}`;
            let i = (() => {
                if (s && s.shadowRoot && s.shadowRoot.querySelector) {
                    return s.shadowRoot.querySelector(a());
                }
                return f(s, a())[0];
            })();
            return !i && t.params.createElements && (i = v("div", t.params.wrapperClass), s.append(i), 
            f(s, `.${t.params.slideClass}`).forEach(e => {
                i.append(e);
            })), Object.assign(t, {
                el: s,
                wrapperEl: i,
                slidesEl: t.isElement && !s.parentNode.host.slideSlots ? s.parentNode.host : i,
                hostEl: t.isElement ? s.parentNode.host : s,
                mounted: !0,
                rtl: "rtl" === s.dir.toLowerCase() || "rtl" === b(s, "direction"),
                rtlTranslate: "horizontal" === t.params.direction && ("rtl" === s.dir.toLowerCase() || "rtl" === b(s, "direction")),
                wrongRTL: "-webkit-box" === b(i, "display")
            }), !0;
        }
        init(e) {
            const t = this;
            if (t.initialized) return t;
            if (!1 === t.mount(e)) return t;
            t.emit("beforeInit"), t.params.breakpoints && t.setBreakpoint(), t.addClasses(), 
            t.updateSize(), t.updateSlides(), t.params.watchOverflow && t.checkOverflow(), t.params.grabCursor && t.enabled && t.setGrabCursor(), 
            t.params.loop && t.virtual && t.params.virtual.enabled ? t.slideTo(t.params.initialSlide + t.virtual.slidesBefore, 0, t.params.runCallbacksOnInit, !1, !0) : t.slideTo(t.params.initialSlide, 0, t.params.runCallbacksOnInit, !1, !0), 
            t.params.loop && t.loopCreate(), t.attachEvents();
            const s = [ ...t.el.querySelectorAll('[loading="lazy"]') ];
            return t.isElement && s.push(...t.hostEl.querySelectorAll('[loading="lazy"]')), 
            s.forEach(e => {
                e.complete ? D(t, e) : e.addEventListener("load", e => {
                    D(t, e.target);
                });
            }), H(t), t.initialized = !0, H(t), t.emit("init"), t.emit("afterInit"), t;
        }
        destroy(e, t) {
            void 0 === e && (e = !0), void 0 === t && (t = !0);
            const s = this, {params: a, el: i, wrapperEl: r, slides: n} = s;
            return void 0 === s.params || s.destroyed || (s.emit("beforeDestroy"), s.initialized = !1, 
            s.detachEvents(), a.loop && s.loopDestroy(), t && (s.removeClasses(), i && "string" != typeof i && i.removeAttribute("style"), 
            r && r.removeAttribute("style"), n && n.length && n.forEach(e => {
                e.classList.remove(a.slideVisibleClass, a.slideFullyVisibleClass, a.slideActiveClass, a.slideNextClass, a.slidePrevClass), 
                e.removeAttribute("style"), e.removeAttribute("data-swiper-slide-index");
            })), s.emit("destroy"), Object.keys(s.eventsListeners).forEach(e => {
                s.off(e);
            }), !1 !== e && (s.el && "string" != typeof s.el && (s.el.swiper = null), function(e) {
                const t = e;
                Object.keys(t).forEach(e => {
                    try {
                        t[e] = null;
                    } catch (e) {}
                    try {
                        delete t[e];
                    } catch (e) {}
                });
            }(s)), s.destroyed = !0), null;
        }
        static extendDefaults(e) {
            p(ae, e);
        }
        static get extendedDefaults() {
            return ae;
        }
        static get defaults() {
            return ee;
        }
        static installModule(e) {
            ie.prototype.__modules__ || (ie.prototype.__modules__ = []);
            const t = ie.prototype.__modules__;
            "function" == typeof e && t.indexOf(e) < 0 && t.push(e);
        }
        static use(e) {
            return Array.isArray(e) ? (e.forEach(e => ie.installModule(e)), ie) : (ie.installModule(e), 
            ie);
        }
    }
    function re(e, t, s, a) {
        return e.params.createElements && Object.keys(a).forEach(i => {
            if (!s[i] && !0 === s.auto) {
                let r = f(e.el, `.${a[i]}`)[0];
                r || (r = v("div", a[i]), r.className = a[i], e.el.append(r)), s[i] = r, t[i] = r;
            }
        }), s;
    }
    function ne(e) {
        return void 0 === e && (e = ""), `.${e.trim().replace(/([\.:!+\/])/g, "\\$1").replace(/ /g, ".")}`;
    }
    function le(e) {
        const t = this, {params: s, slidesEl: a} = t;
        s.loop && t.loopDestroy();
        const i = e => {
            if ("string" == typeof e) {
                const t = document.createElement("div");
                t.innerHTML = e, a.append(t.children[0]), t.innerHTML = "";
            } else a.append(e);
        };
        if ("object" == typeof e && "length" in e) for (let t = 0; t < e.length; t += 1) e[t] && i(e[t]); else i(e);
        t.recalcSlides(), s.loop && t.loopCreate(), s.observer && !t.isElement || t.update();
    }
    function oe(e) {
        const t = this, {params: s, activeIndex: a, slidesEl: i} = t;
        s.loop && t.loopDestroy();
        let r = a + 1;
        const n = e => {
            if ("string" == typeof e) {
                const t = document.createElement("div");
                t.innerHTML = e, i.prepend(t.children[0]), t.innerHTML = "";
            } else i.prepend(e);
        };
        if ("object" == typeof e && "length" in e) {
            for (let t = 0; t < e.length; t += 1) e[t] && n(e[t]);
            r = a + e.length;
        } else n(e);
        t.recalcSlides(), s.loop && t.loopCreate(), s.observer && !t.isElement || t.update(), 
        t.slideTo(r, 0, !1);
    }
    function de(e, t) {
        const s = this, {params: a, activeIndex: i, slidesEl: r} = s;
        let n = i;
        a.loop && (n -= s.loopedSlides, s.loopDestroy(), s.recalcSlides());
        const l = s.slides.length;
        if (e <= 0) return void s.prependSlide(t);
        if (e >= l) return void s.appendSlide(t);
        let o = n > e ? n + 1 : n;
        const d = [];
        for (let t = l - 1; t >= e; t -= 1) {
            const e = s.slides[t];
            e.remove(), d.unshift(e);
        }
        if ("object" == typeof t && "length" in t) {
            for (let e = 0; e < t.length; e += 1) t[e] && r.append(t[e]);
            o = n > e ? n + t.length : n;
        } else r.append(t);
        for (let e = 0; e < d.length; e += 1) r.append(d[e]);
        s.recalcSlides(), a.loop && s.loopCreate(), a.observer && !s.isElement || s.update(), 
        a.loop ? s.slideTo(o + s.loopedSlides, 0, !1) : s.slideTo(o, 0, !1);
    }
    function ce(e) {
        const t = this, {params: s, activeIndex: a} = t;
        let i = a;
        s.loop && (i -= t.loopedSlides, t.loopDestroy());
        let r, n = i;
        if ("object" == typeof e && "length" in e) {
            for (let s = 0; s < e.length; s += 1) r = e[s], t.slides[r] && t.slides[r].remove(), 
            r < n && (n -= 1);
            n = Math.max(n, 0);
        } else r = e, t.slides[r] && t.slides[r].remove(), r < n && (n -= 1), n = Math.max(n, 0);
        t.recalcSlides(), s.loop && t.loopCreate(), s.observer && !t.isElement || t.update(), 
        s.loop ? t.slideTo(n + t.loopedSlides, 0, !1) : t.slideTo(n, 0, !1);
    }
    function pe() {
        const e = this, t = [];
        for (let s = 0; s < e.slides.length; s += 1) t.push(s);
        e.removeSlide(t);
    }
    function ue(e) {
        const {effect: t, swiper: s, on: a, setTranslate: i, setTransition: r, overwriteParams: n, perspective: l, recreateShadows: o, getEffectParams: d} = e;
        let c;
        a("beforeInit", () => {
            if (s.params.effect !== t) return;
            s.classNames.push(`${s.params.containerModifierClass}${t}`), l && l() && s.classNames.push(`${s.params.containerModifierClass}3d`);
            const e = n ? n() : {};
            Object.assign(s.params, e), Object.assign(s.originalParams, e);
        }), a("setTranslate", () => {
            s.params.effect === t && i();
        }), a("setTransition", (e, a) => {
            s.params.effect === t && r(a);
        }), a("transitionEnd", () => {
            if (s.params.effect === t && o) {
                if (!d || !d().slideShadows) return;
                s.slides.forEach(e => {
                    e.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach(e => e.remove());
                }), o();
            }
        }), a("virtualUpdate", () => {
            s.params.effect === t && (s.slides.length || (c = !0), requestAnimationFrame(() => {
                c && s.slides && s.slides.length && (i(), c = !1);
            }));
        });
    }
    function me(e, t) {
        const s = h(t);
        return s !== t && (s.style.backfaceVisibility = "hidden", s.style["-webkit-backface-visibility"] = "hidden"), 
        s;
    }
    function he(e) {
        let {swiper: t, duration: s, transformElements: a, allSlides: i} = e;
        const {activeIndex: r} = t;
        if (t.params.virtualTranslate && 0 !== s) {
            let e, s = !1;
            e = i ? a : a.filter(e => {
                const s = e.classList.contains("swiper-slide-transform") ? (e => {
                    if (!e.parentElement) return t.slides.filter(t => t.shadowRoot && t.shadowRoot === e.parentNode)[0];
                    return e.parentElement;
                })(e) : e;
                return t.getSlideIndex(s) === r;
            }), e.forEach(e => {
                x(e, () => {
                    if (s) return;
                    if (!t || t.destroyed) return;
                    s = !0, t.animating = !1;
                    const e = new window.CustomEvent("transitionend", {
                        bubbles: !0,
                        cancelable: !0
                    });
                    t.wrapperEl.dispatchEvent(e);
                });
            });
        }
    }
    function fe(e, t, s) {
        const a = `swiper-slide-shadow${s ? `-${s}` : ""}${e ? ` swiper-slide-shadow-${e}` : ""}`, i = h(t);
        let r = i.querySelector(`.${a.split(" ").join(".")}`);
        return r || (r = v("div", a.split(" ")), i.append(r)), r;
    }
    Object.keys(se).forEach(e => {
        Object.keys(se[e]).forEach(t => {
            ie.prototype[t] = se[e][t];
        });
    }), ie.use([ function(e) {
        let {swiper: t, on: s, emit: a} = e;
        const i = r();
        let n = null, l = null;
        const o = () => {
            t && !t.destroyed && t.initialized && (a("beforeResize"), a("resize"));
        }, d = () => {
            t && !t.destroyed && t.initialized && a("orientationchange");
        };
        s("init", () => {
            t.params.resizeObserver && void 0 !== i.ResizeObserver ? t && !t.destroyed && t.initialized && (n = new ResizeObserver(e => {
                l = i.requestAnimationFrame(() => {
                    const {width: s, height: a} = t;
                    let i = s, r = a;
                    e.forEach(e => {
                        let {contentBoxSize: s, contentRect: a, target: n} = e;
                        n && n !== t.el || (i = a ? a.width : (s[0] || s).inlineSize, r = a ? a.height : (s[0] || s).blockSize);
                    }), i === s && r === a || o();
                });
            }), n.observe(t.el)) : (i.addEventListener("resize", o), i.addEventListener("orientationchange", d));
        }), s("destroy", () => {
            l && i.cancelAnimationFrame(l), n && n.unobserve && t.el && (n.unobserve(t.el), 
            n = null), i.removeEventListener("resize", o), i.removeEventListener("orientationchange", d);
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a, emit: i} = e;
        const n = [], l = r(), o = function(e, s) {
            void 0 === s && (s = {});
            const a = new (l.MutationObserver || l.WebkitMutationObserver)(e => {
                if (t.__preventObserver__) return;
                if (1 === e.length) return void i("observerUpdate", e[0]);
                const s = function() {
                    i("observerUpdate", e[0]);
                };
                l.requestAnimationFrame ? l.requestAnimationFrame(s) : l.setTimeout(s, 0);
            });
            a.observe(e, {
                attributes: void 0 === s.attributes || s.attributes,
                childList: t.isElement || (void 0 === s.childList || s).childList,
                characterData: void 0 === s.characterData || s.characterData
            }), n.push(a);
        };
        s({
            observer: !1,
            observeParents: !1,
            observeSlideChildren: !1
        }), a("init", () => {
            if (t.params.observer) {
                if (t.params.observeParents) {
                    const e = E(t.hostEl);
                    for (let t = 0; t < e.length; t += 1) o(e[t]);
                }
                o(t.hostEl, {
                    childList: t.params.observeSlideChildren
                }), o(t.wrapperEl, {
                    attributes: !1
                });
            }
        }), a("destroy", () => {
            n.forEach(e => {
                e.disconnect();
            }), n.splice(0, n.length);
        });
    } ]);
    const ge = [ function(e) {
        let t, {swiper: s, extendParams: i, on: r, emit: n} = e;
        i({
            virtual: {
                enabled: !1,
                slides: [],
                cache: !0,
                renderSlide: null,
                renderExternal: null,
                renderExternalUpdate: !0,
                addSlidesBefore: 0,
                addSlidesAfter: 0
            }
        });
        const l = a();
        s.virtual = {
            cache: {},
            from: void 0,
            to: void 0,
            slides: [],
            offset: 0,
            slidesGrid: []
        };
        const o = l.createElement("div");
        function d(e, t) {
            const a = s.params.virtual;
            if (a.cache && s.virtual.cache[t]) return s.virtual.cache[t];
            let i;
            return a.renderSlide ? (i = a.renderSlide.call(s, e, t), "string" == typeof i && (o.innerHTML = i, 
            i = o.children[0])) : i = s.isElement ? v("swiper-slide") : v("div", s.params.slideClass), 
            i.setAttribute("data-swiper-slide-index", t), a.renderSlide || (i.innerHTML = e), 
            a.cache && (s.virtual.cache[t] = i), i;
        }
        function c(e, t) {
            const {slidesPerView: a, slidesPerGroup: i, centeredSlides: r, loop: l, initialSlide: o} = s.params;
            if (t && !l && o > 0) return;
            const {addSlidesBefore: c, addSlidesAfter: p} = s.params.virtual, {from: u, to: m, slides: h, slidesGrid: g, offset: v} = s.virtual;
            s.params.cssMode || s.updateActiveIndex();
            const w = s.activeIndex || 0;
            let b, y, E;
            b = s.rtlTranslate ? "right" : s.isHorizontal() ? "left" : "top", r ? (y = Math.floor(a / 2) + i + p, 
            E = Math.floor(a / 2) + i + c) : (y = a + (i - 1) + p, E = (l ? a : i) + c);
            let x = w - E, S = w + y;
            l || (x = Math.max(x, 0), S = Math.min(S, h.length - 1));
            let T = (s.slidesGrid[x] || 0) - (s.slidesGrid[0] || 0);
            function M() {
                s.updateSlides(), s.updateProgress(), s.updateSlidesClasses(), n("virtualUpdate");
            }
            if (l && w >= E ? (x -= E, r || (T += s.slidesGrid[0])) : l && w < E && (x = -E, 
            r && (T += s.slidesGrid[0])), Object.assign(s.virtual, {
                from: x,
                to: S,
                offset: T,
                slidesGrid: s.slidesGrid,
                slidesBefore: E,
                slidesAfter: y
            }), u === x && m === S && !e) return s.slidesGrid !== g && T !== v && s.slides.forEach(e => {
                e.style[b] = T - Math.abs(s.cssOverflowAdjustment()) + "px";
            }), s.updateProgress(), void n("virtualUpdate");
            if (s.params.virtual.renderExternal) return s.params.virtual.renderExternal.call(s, {
                offset: T,
                from: x,
                to: S,
                slides: function() {
                    const e = [];
                    for (let t = x; t <= S; t += 1) e.push(h[t]);
                    return e;
                }()
            }), void (s.params.virtual.renderExternalUpdate ? M() : n("virtualUpdate"));
            const C = [], P = [], L = e => {
                let t = e;
                return e < 0 ? t = h.length + e : t >= h.length && (t -= h.length), t;
            };
            if (e) s.slides.filter(e => e.matches(`.${s.params.slideClass}, swiper-slide`)).forEach(e => {
                e.remove();
            }); else for (let e = u; e <= m; e += 1) if (e < x || e > S) {
                const t = L(e);
                s.slides.filter(e => e.matches(`.${s.params.slideClass}[data-swiper-slide-index="${t}"], swiper-slide[data-swiper-slide-index="${t}"]`)).forEach(e => {
                    e.remove();
                });
            }
            const I = l ? -h.length : 0, z = l ? 2 * h.length : h.length;
            for (let t = I; t < z; t += 1) if (t >= x && t <= S) {
                const s = L(t);
                void 0 === m || e ? P.push(s) : (t > m && P.push(s), t < u && C.push(s));
            }
            if (P.forEach(e => {
                s.slidesEl.append(d(h[e], e));
            }), l) for (let e = C.length - 1; e >= 0; e -= 1) {
                const t = C[e];
                s.slidesEl.prepend(d(h[t], t));
            } else C.sort((e, t) => t - e), C.forEach(e => {
                s.slidesEl.prepend(d(h[e], e));
            });
            f(s.slidesEl, ".swiper-slide, swiper-slide").forEach(e => {
                e.style[b] = T - Math.abs(s.cssOverflowAdjustment()) + "px";
            }), M();
        }
        r("beforeInit", () => {
            if (!s.params.virtual.enabled) return;
            let e;
            if (void 0 === s.passedParams.virtual.slides) {
                const t = [ ...s.slidesEl.children ].filter(e => e.matches(`.${s.params.slideClass}, swiper-slide`));
                t && t.length && (s.virtual.slides = [ ...t ], e = !0, t.forEach((e, t) => {
                    e.setAttribute("data-swiper-slide-index", t), s.virtual.cache[t] = e, e.remove();
                }));
            }
            e || (s.virtual.slides = s.params.virtual.slides), s.classNames.push(`${s.params.containerModifierClass}virtual`), 
            s.params.watchSlidesProgress = !0, s.originalParams.watchSlidesProgress = !0, c(!1, !0);
        }), r("setTranslate", () => {
            s.params.virtual.enabled && (s.params.cssMode && !s._immediateVirtual ? (clearTimeout(t), 
            t = setTimeout(() => {
                c();
            }, 100)) : c());
        }), r("init update resize", () => {
            s.params.virtual.enabled && s.params.cssMode && u(s.wrapperEl, "--swiper-virtual-size", `${s.virtualSize}px`);
        }), Object.assign(s.virtual, {
            appendSlide: function(e) {
                if ("object" == typeof e && "length" in e) for (let t = 0; t < e.length; t += 1) e[t] && s.virtual.slides.push(e[t]); else s.virtual.slides.push(e);
                c(!0);
            },
            prependSlide: function(e) {
                const t = s.activeIndex;
                let a = t + 1, i = 1;
                if (Array.isArray(e)) {
                    for (let t = 0; t < e.length; t += 1) e[t] && s.virtual.slides.unshift(e[t]);
                    a = t + e.length, i = e.length;
                } else s.virtual.slides.unshift(e);
                if (s.params.virtual.cache) {
                    const e = s.virtual.cache, t = {};
                    Object.keys(e).forEach(s => {
                        const a = e[s], r = a.getAttribute("data-swiper-slide-index");
                        r && a.setAttribute("data-swiper-slide-index", parseInt(r, 10) + i), t[parseInt(s, 10) + i] = a;
                    }), s.virtual.cache = t;
                }
                c(!0), s.slideTo(a, 0);
            },
            removeSlide: function(e) {
                if (null == e) return;
                let t = s.activeIndex;
                if (Array.isArray(e)) for (let a = e.length - 1; a >= 0; a -= 1) s.params.virtual.cache && (delete s.virtual.cache[e[a]], 
                Object.keys(s.virtual.cache).forEach(t => {
                    t > e && (s.virtual.cache[t - 1] = s.virtual.cache[t], s.virtual.cache[t - 1].setAttribute("data-swiper-slide-index", t - 1), 
                    delete s.virtual.cache[t]);
                })), s.virtual.slides.splice(e[a], 1), e[a] < t && (t -= 1), t = Math.max(t, 0); else s.params.virtual.cache && (delete s.virtual.cache[e], 
                Object.keys(s.virtual.cache).forEach(t => {
                    t > e && (s.virtual.cache[t - 1] = s.virtual.cache[t], s.virtual.cache[t - 1].setAttribute("data-swiper-slide-index", t - 1), 
                    delete s.virtual.cache[t]);
                })), s.virtual.slides.splice(e, 1), e < t && (t -= 1), t = Math.max(t, 0);
                c(!0), s.slideTo(t, 0);
            },
            removeAllSlides: function() {
                s.virtual.slides = [], s.params.virtual.cache && (s.virtual.cache = {}), c(!0), 
                s.slideTo(0, 0);
            },
            update: c
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: i, emit: n} = e;
        const l = a(), o = r();
        function d(e) {
            if (!t.enabled) return;
            const {rtlTranslate: s} = t;
            let a = e;
            a.originalEvent && (a = a.originalEvent);
            const i = a.keyCode || a.charCode, r = t.params.keyboard.pageUpDown, d = r && 33 === i, c = r && 34 === i, p = 37 === i, u = 39 === i, m = 38 === i, h = 40 === i;
            if (!t.allowSlideNext && (t.isHorizontal() && u || t.isVertical() && h || c)) return !1;
            if (!t.allowSlidePrev && (t.isHorizontal() && p || t.isVertical() && m || d)) return !1;
            if (!(a.shiftKey || a.altKey || a.ctrlKey || a.metaKey || l.activeElement && l.activeElement.nodeName && ("input" === l.activeElement.nodeName.toLowerCase() || "textarea" === l.activeElement.nodeName.toLowerCase()))) {
                if (t.params.keyboard.onlyInViewport && (d || c || p || u || m || h)) {
                    let e = !1;
                    if (E(t.el, `.${t.params.slideClass}, swiper-slide`).length > 0 && 0 === E(t.el, `.${t.params.slideActiveClass}`).length) return;
                    const a = t.el, i = a.clientWidth, r = a.clientHeight, n = o.innerWidth, l = o.innerHeight, d = w(a);
                    s && (d.left -= a.scrollLeft);
                    const c = [ [ d.left, d.top ], [ d.left + i, d.top ], [ d.left, d.top + r ], [ d.left + i, d.top + r ] ];
                    for (let t = 0; t < c.length; t += 1) {
                        const s = c[t];
                        if (s[0] >= 0 && s[0] <= n && s[1] >= 0 && s[1] <= l) {
                            if (0 === s[0] && 0 === s[1]) continue;
                            e = !0;
                        }
                    }
                    if (!e) return;
                }
                t.isHorizontal() ? ((d || c || p || u) && (a.preventDefault ? a.preventDefault() : a.returnValue = !1), 
                ((c || u) && !s || (d || p) && s) && t.slideNext(), ((d || p) && !s || (c || u) && s) && t.slidePrev()) : ((d || c || m || h) && (a.preventDefault ? a.preventDefault() : a.returnValue = !1), 
                (c || h) && t.slideNext(), (d || m) && t.slidePrev()), n("keyPress", i);
            }
        }
        function c() {
            t.keyboard.enabled || (l.addEventListener("keydown", d), t.keyboard.enabled = !0);
        }
        function p() {
            t.keyboard.enabled && (l.removeEventListener("keydown", d), t.keyboard.enabled = !1);
        }
        t.keyboard = {
            enabled: !1
        }, s({
            keyboard: {
                enabled: !1,
                onlyInViewport: !0,
                pageUpDown: !0
            }
        }), i("init", () => {
            t.params.keyboard.enabled && c();
        }), i("destroy", () => {
            t.keyboard.enabled && p();
        }), Object.assign(t.keyboard, {
            enable: c,
            disable: p
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a, emit: i} = e;
        const n = r();
        let d;
        s({
            mousewheel: {
                enabled: !1,
                releaseOnEdges: !1,
                invert: !1,
                forceToAxis: !1,
                sensitivity: 1,
                eventsTarget: "container",
                thresholdDelta: null,
                thresholdTime: null,
                noMousewheelClass: "swiper-no-mousewheel"
            }
        }), t.mousewheel = {
            enabled: !1
        };
        let c, p = o();
        const u = [];
        function m() {
            t.enabled && (t.mouseEntered = !0);
        }
        function h() {
            t.enabled && (t.mouseEntered = !1);
        }
        function f(e) {
            return !(t.params.mousewheel.thresholdDelta && e.delta < t.params.mousewheel.thresholdDelta) && (!(t.params.mousewheel.thresholdTime && o() - p < t.params.mousewheel.thresholdTime) && (e.delta >= 6 && o() - p < 60 || (e.direction < 0 ? t.isEnd && !t.params.loop || t.animating || (t.slideNext(), 
            i("scroll", e.raw)) : t.isBeginning && !t.params.loop || t.animating || (t.slidePrev(), 
            i("scroll", e.raw)), p = (new n.Date).getTime(), !1)));
        }
        function g(e) {
            let s = e, a = !0;
            if (!t.enabled) return;
            if (e.target.closest(`.${t.params.mousewheel.noMousewheelClass}`)) return;
            const r = t.params.mousewheel;
            t.params.cssMode && s.preventDefault();
            let n = t.el;
            "container" !== t.params.mousewheel.eventsTarget && (n = document.querySelector(t.params.mousewheel.eventsTarget));
            const p = n && n.contains(s.target);
            if (!t.mouseEntered && !p && !r.releaseOnEdges) return !0;
            s.originalEvent && (s = s.originalEvent);
            let m = 0;
            const h = t.rtlTranslate ? -1 : 1, g = function(e) {
                let t = 0, s = 0, a = 0, i = 0;
                return "detail" in e && (s = e.detail), "wheelDelta" in e && (s = -e.wheelDelta / 120), 
                "wheelDeltaY" in e && (s = -e.wheelDeltaY / 120), "wheelDeltaX" in e && (t = -e.wheelDeltaX / 120), 
                "axis" in e && e.axis === e.HORIZONTAL_AXIS && (t = s, s = 0), a = 10 * t, i = 10 * s, 
                "deltaY" in e && (i = e.deltaY), "deltaX" in e && (a = e.deltaX), e.shiftKey && !a && (a = i, 
                i = 0), (a || i) && e.deltaMode && (1 === e.deltaMode ? (a *= 40, i *= 40) : (a *= 800, 
                i *= 800)), a && !t && (t = a < 1 ? -1 : 1), i && !s && (s = i < 1 ? -1 : 1), {
                    spinX: t,
                    spinY: s,
                    pixelX: a,
                    pixelY: i
                };
            }(s);
            if (r.forceToAxis) if (t.isHorizontal()) {
                if (!(Math.abs(g.pixelX) > Math.abs(g.pixelY))) return !0;
                m = -g.pixelX * h;
            } else {
                if (!(Math.abs(g.pixelY) > Math.abs(g.pixelX))) return !0;
                m = -g.pixelY;
            } else m = Math.abs(g.pixelX) > Math.abs(g.pixelY) ? -g.pixelX * h : -g.pixelY;
            if (0 === m) return !0;
            r.invert && (m = -m);
            let v = t.getTranslate() + m * r.sensitivity;
            if (v >= t.minTranslate() && (v = t.minTranslate()), v <= t.maxTranslate() && (v = t.maxTranslate()), 
            a = !!t.params.loop || !(v === t.minTranslate() || v === t.maxTranslate()), a && t.params.nested && s.stopPropagation(), 
            t.params.freeMode && t.params.freeMode.enabled) {
                const e = {
                    time: o(),
                    delta: Math.abs(m),
                    direction: Math.sign(m)
                }, a = c && e.time < c.time + 500 && e.delta <= c.delta && e.direction === c.direction;
                if (!a) {
                    c = void 0;
                    let n = t.getTranslate() + m * r.sensitivity;
                    const o = t.isBeginning, p = t.isEnd;
                    if (n >= t.minTranslate() && (n = t.minTranslate()), n <= t.maxTranslate() && (n = t.maxTranslate()), 
                    t.setTransition(0), t.setTranslate(n), t.updateProgress(), t.updateActiveIndex(), 
                    t.updateSlidesClasses(), (!o && t.isBeginning || !p && t.isEnd) && t.updateSlidesClasses(), 
                    t.params.loop && t.loopFix({
                        direction: e.direction < 0 ? "next" : "prev",
                        byMousewheel: !0
                    }), t.params.freeMode.sticky) {
                        clearTimeout(d), d = void 0, u.length >= 15 && u.shift();
                        const s = u.length ? u[u.length - 1] : void 0, a = u[0];
                        if (u.push(e), s && (e.delta > s.delta || e.direction !== s.direction)) u.splice(0); else if (u.length >= 15 && e.time - a.time < 500 && a.delta - e.delta >= 1 && e.delta <= 6) {
                            const s = m > 0 ? .8 : .2;
                            c = e, u.splice(0), d = l(() => {
                                !t.destroyed && t.params && t.slideToClosest(t.params.speed, !0, void 0, s);
                            }, 0);
                        }
                        d || (d = l(() => {
                            if (t.destroyed || !t.params) return;
                            c = e, u.splice(0), t.slideToClosest(t.params.speed, !0, void 0, .5);
                        }, 500));
                    }
                    if (a || i("scroll", s), t.params.autoplay && t.params.autoplayDisableOnInteraction && t.autoplay.stop(), 
                    r.releaseOnEdges && (n === t.minTranslate() || n === t.maxTranslate())) return !0;
                }
            } else {
                const s = {
                    time: o(),
                    delta: Math.abs(m),
                    direction: Math.sign(m),
                    raw: e
                };
                u.length >= 2 && u.shift();
                const a = u.length ? u[u.length - 1] : void 0;
                if (u.push(s), a ? (s.direction !== a.direction || s.delta > a.delta || s.time > a.time + 150) && f(s) : f(s), 
                function(e) {
                    const s = t.params.mousewheel;
                    if (e.direction < 0) {
                        if (t.isEnd && !t.params.loop && s.releaseOnEdges) return !0;
                    } else if (t.isBeginning && !t.params.loop && s.releaseOnEdges) return !0;
                    return !1;
                }(s)) return !0;
            }
            return s.preventDefault ? s.preventDefault() : s.returnValue = !1, !1;
        }
        function v(e) {
            let s = t.el;
            "container" !== t.params.mousewheel.eventsTarget && (s = document.querySelector(t.params.mousewheel.eventsTarget)), 
            s[e]("mouseenter", m), s[e]("mouseleave", h), s[e]("wheel", g);
        }
        function w() {
            return t.params.cssMode ? (t.wrapperEl.removeEventListener("wheel", g), !0) : !t.mousewheel.enabled && (v("addEventListener"), 
            t.mousewheel.enabled = !0, !0);
        }
        function b() {
            return t.params.cssMode ? (t.wrapperEl.addEventListener(event, g), !0) : !!t.mousewheel.enabled && (v("removeEventListener"), 
            t.mousewheel.enabled = !1, !0);
        }
        a("init", () => {
            !t.params.mousewheel.enabled && t.params.cssMode && b(), t.params.mousewheel.enabled && w();
        }), a("destroy", () => {
            t.params.cssMode && w(), t.mousewheel.enabled && b();
        }), Object.assign(t.mousewheel, {
            enable: w,
            disable: b
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a, emit: i} = e;
        function r(e) {
            let s;
            return e && "string" == typeof e && t.isElement && (s = t.el.querySelector(e) || t.hostEl.querySelector(e), 
            s) ? s : (e && ("string" == typeof e && (s = [ ...document.querySelectorAll(e) ]), 
            t.params.uniqueNavElements && "string" == typeof e && s && s.length > 1 && 1 === t.el.querySelectorAll(e).length ? s = t.el.querySelector(e) : s && 1 === s.length && (s = s[0])), 
            e && !s ? e : s);
        }
        function n(e, s) {
            const a = t.params.navigation;
            (e = T(e)).forEach(e => {
                e && (e.classList[s ? "add" : "remove"](...a.disabledClass.split(" ")), "BUTTON" === e.tagName && (e.disabled = s), 
                t.params.watchOverflow && t.enabled && e.classList[t.isLocked ? "add" : "remove"](a.lockClass));
            });
        }
        function l() {
            const {nextEl: e, prevEl: s} = t.navigation;
            if (t.params.loop) return n(s, !1), void n(e, !1);
            n(s, t.isBeginning && !t.params.rewind), n(e, t.isEnd && !t.params.rewind);
        }
        function o(e) {
            e.preventDefault(), (!t.isBeginning || t.params.loop || t.params.rewind) && (t.slidePrev(), 
            i("navigationPrev"));
        }
        function d(e) {
            e.preventDefault(), (!t.isEnd || t.params.loop || t.params.rewind) && (t.slideNext(), 
            i("navigationNext"));
        }
        function c() {
            const e = t.params.navigation;
            if (t.params.navigation = re(t, t.originalParams.navigation, t.params.navigation, {
                nextEl: "swiper-button-next",
                prevEl: "swiper-button-prev"
            }), !e.nextEl && !e.prevEl) return;
            let s = r(e.nextEl), a = r(e.prevEl);
            Object.assign(t.navigation, {
                nextEl: s,
                prevEl: a
            }), s = T(s), a = T(a);
            const i = (s, a) => {
                s && s.addEventListener("click", "next" === a ? d : o), !t.enabled && s && s.classList.add(...e.lockClass.split(" "));
            };
            s.forEach(e => i(e, "next")), a.forEach(e => i(e, "prev"));
        }
        function p() {
            let {nextEl: e, prevEl: s} = t.navigation;
            e = T(e), s = T(s);
            const a = (e, s) => {
                e.removeEventListener("click", "next" === s ? d : o), e.classList.remove(...t.params.navigation.disabledClass.split(" "));
            };
            e.forEach(e => a(e, "next")), s.forEach(e => a(e, "prev"));
        }
        s({
            navigation: {
                nextEl: null,
                prevEl: null,
                hideOnClick: !1,
                disabledClass: "swiper-button-disabled",
                hiddenClass: "swiper-button-hidden",
                lockClass: "swiper-button-lock",
                navigationDisabledClass: "swiper-navigation-disabled"
            }
        }), t.navigation = {
            nextEl: null,
            prevEl: null
        }, a("init", () => {
            !1 === t.params.navigation.enabled ? u() : (c(), l());
        }), a("toEdge fromEdge lock unlock", () => {
            l();
        }), a("destroy", () => {
            p();
        }), a("enable disable", () => {
            let {nextEl: e, prevEl: s} = t.navigation;
            e = T(e), s = T(s), t.enabled ? l() : [ ...e, ...s ].filter(e => !!e).forEach(e => e.classList.add(t.params.navigation.lockClass));
        }), a("click", (e, s) => {
            let {nextEl: a, prevEl: r} = t.navigation;
            a = T(a), r = T(r);
            const n = s.target;
            let l = r.includes(n) || a.includes(n);
            if (t.isElement && !l) {
                const e = s.path || s.composedPath && s.composedPath();
                e && (l = e.find(e => a.includes(e) || r.includes(e)));
            }
            if (t.params.navigation.hideOnClick && !l) {
                if (t.pagination && t.params.pagination && t.params.pagination.clickable && (t.pagination.el === n || t.pagination.el.contains(n))) return;
                let e;
                a.length ? e = a[0].classList.contains(t.params.navigation.hiddenClass) : r.length && (e = r[0].classList.contains(t.params.navigation.hiddenClass)), 
                i(!0 === e ? "navigationShow" : "navigationHide"), [ ...a, ...r ].filter(e => !!e).forEach(e => e.classList.toggle(t.params.navigation.hiddenClass));
            }
        });
        const u = () => {
            t.el.classList.add(...t.params.navigation.navigationDisabledClass.split(" ")), p();
        };
        Object.assign(t.navigation, {
            enable: () => {
                t.el.classList.remove(...t.params.navigation.navigationDisabledClass.split(" ")), 
                c(), l();
            },
            disable: u,
            update: l,
            init: c,
            destroy: p
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a, emit: i} = e;
        const r = "swiper-pagination";
        let n;
        s({
            pagination: {
                el: null,
                bulletElement: "span",
                clickable: !1,
                hideOnClick: !1,
                renderBullet: null,
                renderProgressbar: null,
                renderFraction: null,
                renderCustom: null,
                progressbarOpposite: !1,
                type: "bullets",
                dynamicBullets: !1,
                dynamicMainBullets: 1,
                formatFractionCurrent: e => e,
                formatFractionTotal: e => e,
                bulletClass: `${r}-bullet`,
                bulletActiveClass: `${r}-bullet-active`,
                modifierClass: `${r}-`,
                currentClass: `${r}-current`,
                totalClass: `${r}-total`,
                hiddenClass: `${r}-hidden`,
                progressbarFillClass: `${r}-progressbar-fill`,
                progressbarOppositeClass: `${r}-progressbar-opposite`,
                clickableClass: `${r}-clickable`,
                lockClass: `${r}-lock`,
                horizontalClass: `${r}-horizontal`,
                verticalClass: `${r}-vertical`,
                paginationDisabledClass: `${r}-disabled`
            }
        }), t.pagination = {
            el: null,
            bullets: []
        };
        let l = 0;
        function o() {
            return !t.params.pagination.el || !t.pagination.el || Array.isArray(t.pagination.el) && 0 === t.pagination.el.length;
        }
        function d(e, s) {
            const {bulletActiveClass: a} = t.params.pagination;
            e && (e = e[("prev" === s ? "previous" : "next") + "ElementSibling"]) && (e.classList.add(`${a}-${s}`), 
            (e = e[("prev" === s ? "previous" : "next") + "ElementSibling"]) && e.classList.add(`${a}-${s}-${s}`));
        }
        function c(e) {
            const s = e.target.closest(ne(t.params.pagination.bulletClass));
            if (!s) return;
            e.preventDefault();
            const a = y(s) * t.params.slidesPerGroup;
            if (t.params.loop) {
                if (t.realIndex === a) return;
                const e = (i = t.realIndex, r = a, n = t.slides.length, (r %= n) == 1 + (i %= n) ? "next" : r === i - 1 ? "previous" : void 0);
                "next" === e ? t.slideNext() : "previous" === e ? t.slidePrev() : t.slideToLoop(a);
            } else t.slideTo(a);
            var i, r, n;
        }
        function p() {
            const e = t.rtl, s = t.params.pagination;
            if (o()) return;
            let a, r, c = t.pagination.el;
            c = T(c);
            const p = t.virtual && t.params.virtual.enabled ? t.virtual.slides.length : t.slides.length, u = t.params.loop ? Math.ceil(p / t.params.slidesPerGroup) : t.snapGrid.length;
            if (t.params.loop ? (r = t.previousRealIndex || 0, a = t.params.slidesPerGroup > 1 ? Math.floor(t.realIndex / t.params.slidesPerGroup) : t.realIndex) : void 0 !== t.snapIndex ? (a = t.snapIndex, 
            r = t.previousSnapIndex) : (r = t.previousIndex || 0, a = t.activeIndex || 0), "bullets" === s.type && t.pagination.bullets && t.pagination.bullets.length > 0) {
                const i = t.pagination.bullets;
                let o, p, u;
                if (s.dynamicBullets && (n = S(i[0], t.isHorizontal() ? "width" : "height", !0), 
                c.forEach(e => {
                    e.style[t.isHorizontal() ? "width" : "height"] = n * (s.dynamicMainBullets + 4) + "px";
                }), s.dynamicMainBullets > 1 && void 0 !== r && (l += a - (r || 0), l > s.dynamicMainBullets - 1 ? l = s.dynamicMainBullets - 1 : l < 0 && (l = 0)), 
                o = Math.max(a - l, 0), p = o + (Math.min(i.length, s.dynamicMainBullets) - 1), 
                u = (p + o) / 2), i.forEach(e => {
                    const t = [ ...[ "", "-next", "-next-next", "-prev", "-prev-prev", "-main" ].map(e => `${s.bulletActiveClass}${e}`) ].map(e => "string" == typeof e && e.includes(" ") ? e.split(" ") : e).flat();
                    e.classList.remove(...t);
                }), c.length > 1) i.forEach(e => {
                    const i = y(e);
                    i === a ? e.classList.add(...s.bulletActiveClass.split(" ")) : t.isElement && e.setAttribute("part", "bullet"), 
                    s.dynamicBullets && (i >= o && i <= p && e.classList.add(...`${s.bulletActiveClass}-main`.split(" ")), 
                    i === o && d(e, "prev"), i === p && d(e, "next"));
                }); else {
                    const e = i[a];
                    if (e && e.classList.add(...s.bulletActiveClass.split(" ")), t.isElement && i.forEach((e, t) => {
                        e.setAttribute("part", t === a ? "bullet-active" : "bullet");
                    }), s.dynamicBullets) {
                        const e = i[o], t = i[p];
                        for (let e = o; e <= p; e += 1) i[e] && i[e].classList.add(...`${s.bulletActiveClass}-main`.split(" "));
                        d(e, "prev"), d(t, "next");
                    }
                }
                if (s.dynamicBullets) {
                    const a = Math.min(i.length, s.dynamicMainBullets + 4), r = (n * a - n) / 2 - u * n, l = e ? "right" : "left";
                    i.forEach(e => {
                        e.style[t.isHorizontal() ? l : "top"] = `${r}px`;
                    });
                }
            }
            c.forEach((e, r) => {
                if ("fraction" === s.type && (e.querySelectorAll(ne(s.currentClass)).forEach(e => {
                    e.textContent = s.formatFractionCurrent(a + 1);
                }), e.querySelectorAll(ne(s.totalClass)).forEach(e => {
                    e.textContent = s.formatFractionTotal(u);
                })), "progressbar" === s.type) {
                    let i;
                    i = s.progressbarOpposite ? t.isHorizontal() ? "vertical" : "horizontal" : t.isHorizontal() ? "horizontal" : "vertical";
                    const r = (a + 1) / u;
                    let n = 1, l = 1;
                    "horizontal" === i ? n = r : l = r, e.querySelectorAll(ne(s.progressbarFillClass)).forEach(e => {
                        e.style.transform = `translate3d(0,0,0) scaleX(${n}) scaleY(${l})`, e.style.transitionDuration = `${t.params.speed}ms`;
                    });
                }
                "custom" === s.type && s.renderCustom ? (e.innerHTML = s.renderCustom(t, a + 1, u), 
                0 === r && i("paginationRender", e)) : (0 === r && i("paginationRender", e), i("paginationUpdate", e)), 
                t.params.watchOverflow && t.enabled && e.classList[t.isLocked ? "add" : "remove"](s.lockClass);
            });
        }
        function u() {
            const e = t.params.pagination;
            if (o()) return;
            const s = t.virtual && t.params.virtual.enabled ? t.virtual.slides.length : t.grid && t.params.grid.rows > 1 ? t.slides.length / Math.ceil(t.params.grid.rows) : t.slides.length;
            let a = t.pagination.el;
            a = T(a);
            let r = "";
            if ("bullets" === e.type) {
                let a = t.params.loop ? Math.ceil(s / t.params.slidesPerGroup) : t.snapGrid.length;
                t.params.freeMode && t.params.freeMode.enabled && a > s && (a = s);
                for (let s = 0; s < a; s += 1) e.renderBullet ? r += e.renderBullet.call(t, s, e.bulletClass) : r += `<${e.bulletElement} ${t.isElement ? 'part="bullet"' : ""} class="${e.bulletClass}"></${e.bulletElement}>`;
            }
            "fraction" === e.type && (r = e.renderFraction ? e.renderFraction.call(t, e.currentClass, e.totalClass) : `<span class="${e.currentClass}"></span> / <span class="${e.totalClass}"></span>`), 
            "progressbar" === e.type && (r = e.renderProgressbar ? e.renderProgressbar.call(t, e.progressbarFillClass) : `<span class="${e.progressbarFillClass}"></span>`), 
            t.pagination.bullets = [], a.forEach(s => {
                "custom" !== e.type && (s.innerHTML = r || ""), "bullets" === e.type && t.pagination.bullets.push(...s.querySelectorAll(ne(e.bulletClass)));
            }), "custom" !== e.type && i("paginationRender", a[0]);
        }
        function m() {
            t.params.pagination = re(t, t.originalParams.pagination, t.params.pagination, {
                el: "swiper-pagination"
            });
            const e = t.params.pagination;
            if (!e.el) return;
            let s;
            "string" == typeof e.el && t.isElement && (s = t.el.querySelector(e.el)), s || "string" != typeof e.el || (s = [ ...document.querySelectorAll(e.el) ]), 
            s || (s = e.el), s && 0 !== s.length && (t.params.uniqueNavElements && "string" == typeof e.el && Array.isArray(s) && s.length > 1 && (s = [ ...t.el.querySelectorAll(e.el) ], 
            s.length > 1 && (s = s.filter(e => E(e, ".swiper")[0] === t.el)[0])), Array.isArray(s) && 1 === s.length && (s = s[0]), 
            Object.assign(t.pagination, {
                el: s
            }), s = T(s), s.forEach(s => {
                "bullets" === e.type && e.clickable && s.classList.add(...(e.clickableClass || "").split(" ")), 
                s.classList.add(e.modifierClass + e.type), s.classList.add(t.isHorizontal() ? e.horizontalClass : e.verticalClass), 
                "bullets" === e.type && e.dynamicBullets && (s.classList.add(`${e.modifierClass}${e.type}-dynamic`), 
                l = 0, e.dynamicMainBullets < 1 && (e.dynamicMainBullets = 1)), "progressbar" === e.type && e.progressbarOpposite && s.classList.add(e.progressbarOppositeClass), 
                e.clickable && s.addEventListener("click", c), t.enabled || s.classList.add(e.lockClass);
            }));
        }
        function h() {
            const e = t.params.pagination;
            if (o()) return;
            let s = t.pagination.el;
            s && (s = T(s), s.forEach(s => {
                s.classList.remove(e.hiddenClass), s.classList.remove(e.modifierClass + e.type), 
                s.classList.remove(t.isHorizontal() ? e.horizontalClass : e.verticalClass), e.clickable && (s.classList.remove(...(e.clickableClass || "").split(" ")), 
                s.removeEventListener("click", c));
            })), t.pagination.bullets && t.pagination.bullets.forEach(t => t.classList.remove(...e.bulletActiveClass.split(" ")));
        }
        a("changeDirection", () => {
            if (!t.pagination || !t.pagination.el) return;
            const e = t.params.pagination;
            let {el: s} = t.pagination;
            s = T(s), s.forEach(s => {
                s.classList.remove(e.horizontalClass, e.verticalClass), s.classList.add(t.isHorizontal() ? e.horizontalClass : e.verticalClass);
            });
        }), a("init", () => {
            !1 === t.params.pagination.enabled ? f() : (m(), u(), p());
        }), a("activeIndexChange", () => {
            void 0 === t.snapIndex && p();
        }), a("snapIndexChange", () => {
            p();
        }), a("snapGridLengthChange", () => {
            u(), p();
        }), a("destroy", () => {
            h();
        }), a("enable disable", () => {
            let {el: e} = t.pagination;
            e && (e = T(e), e.forEach(e => e.classList[t.enabled ? "remove" : "add"](t.params.pagination.lockClass)));
        }), a("lock unlock", () => {
            p();
        }), a("click", (e, s) => {
            const a = s.target, r = T(t.pagination.el);
            if (t.params.pagination.el && t.params.pagination.hideOnClick && r && r.length > 0 && !a.classList.contains(t.params.pagination.bulletClass)) {
                if (t.navigation && (t.navigation.nextEl && a === t.navigation.nextEl || t.navigation.prevEl && a === t.navigation.prevEl)) return;
                const e = r[0].classList.contains(t.params.pagination.hiddenClass);
                i(!0 === e ? "paginationShow" : "paginationHide"), r.forEach(e => e.classList.toggle(t.params.pagination.hiddenClass));
            }
        });
        const f = () => {
            t.el.classList.add(t.params.pagination.paginationDisabledClass);
            let {el: e} = t.pagination;
            e && (e = T(e), e.forEach(e => e.classList.add(t.params.pagination.paginationDisabledClass))), 
            h();
        };
        Object.assign(t.pagination, {
            enable: () => {
                t.el.classList.remove(t.params.pagination.paginationDisabledClass);
                let {el: e} = t.pagination;
                e && (e = T(e), e.forEach(e => e.classList.remove(t.params.pagination.paginationDisabledClass))), 
                m(), u(), p();
            },
            disable: f,
            render: u,
            update: p,
            init: m,
            destroy: h
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: i, emit: r} = e;
        const o = a();
        let d, c, p, u, m = !1, h = null, f = null;
        function g() {
            if (!t.params.scrollbar.el || !t.scrollbar.el) return;
            const {scrollbar: e, rtlTranslate: s} = t, {dragEl: a, el: i} = e, r = t.params.scrollbar, n = t.params.loop ? t.progressLoop : t.progress;
            let l = c, o = (p - c) * n;
            s ? (o = -o, o > 0 ? (l = c - o, o = 0) : -o + c > p && (l = p + o)) : o < 0 ? (l = c + o, 
            o = 0) : o + c > p && (l = p - o), t.isHorizontal() ? (a.style.transform = `translate3d(${o}px, 0, 0)`, 
            a.style.width = `${l}px`) : (a.style.transform = `translate3d(0px, ${o}px, 0)`, 
            a.style.height = `${l}px`), r.hide && (clearTimeout(h), i.style.opacity = 1, h = setTimeout(() => {
                i.style.opacity = 0, i.style.transitionDuration = "400ms";
            }, 1e3));
        }
        function b() {
            if (!t.params.scrollbar.el || !t.scrollbar.el) return;
            const {scrollbar: e} = t, {dragEl: s, el: a} = e;
            s.style.width = "", s.style.height = "", p = t.isHorizontal() ? a.offsetWidth : a.offsetHeight, 
            u = t.size / (t.virtualSize + t.params.slidesOffsetBefore - (t.params.centeredSlides ? t.snapGrid[0] : 0)), 
            c = "auto" === t.params.scrollbar.dragSize ? p * u : parseInt(t.params.scrollbar.dragSize, 10), 
            t.isHorizontal() ? s.style.width = `${c}px` : s.style.height = `${c}px`, a.style.display = u >= 1 ? "none" : "", 
            t.params.scrollbar.hide && (a.style.opacity = 0), t.params.watchOverflow && t.enabled && e.el.classList[t.isLocked ? "add" : "remove"](t.params.scrollbar.lockClass);
        }
        function y(e) {
            return t.isHorizontal() ? e.clientX : e.clientY;
        }
        function E(e) {
            const {scrollbar: s, rtlTranslate: a} = t, {el: i} = s;
            let r;
            r = (y(e) - w(i)[t.isHorizontal() ? "left" : "top"] - (null !== d ? d : c / 2)) / (p - c), 
            r = Math.max(Math.min(r, 1), 0), a && (r = 1 - r);
            const n = t.minTranslate() + (t.maxTranslate() - t.minTranslate()) * r;
            t.updateProgress(n), t.setTranslate(n), t.updateActiveIndex(), t.updateSlidesClasses();
        }
        function x(e) {
            const s = t.params.scrollbar, {scrollbar: a, wrapperEl: i} = t, {el: n, dragEl: l} = a;
            m = !0, d = e.target === l ? y(e) - e.target.getBoundingClientRect()[t.isHorizontal() ? "left" : "top"] : null, 
            e.preventDefault(), e.stopPropagation(), i.style.transitionDuration = "100ms", l.style.transitionDuration = "100ms", 
            E(e), clearTimeout(f), n.style.transitionDuration = "0ms", s.hide && (n.style.opacity = 1), 
            t.params.cssMode && (t.wrapperEl.style["scroll-snap-type"] = "none"), r("scrollbarDragStart", e);
        }
        function S(e) {
            const {scrollbar: s, wrapperEl: a} = t, {el: i, dragEl: n} = s;
            m && (e.preventDefault && e.cancelable ? e.preventDefault() : e.returnValue = !1, 
            E(e), a.style.transitionDuration = "0ms", i.style.transitionDuration = "0ms", n.style.transitionDuration = "0ms", 
            r("scrollbarDragMove", e));
        }
        function M(e) {
            const s = t.params.scrollbar, {scrollbar: a, wrapperEl: i} = t, {el: n} = a;
            m && (m = !1, t.params.cssMode && (t.wrapperEl.style["scroll-snap-type"] = "", i.style.transitionDuration = ""), 
            s.hide && (clearTimeout(f), f = l(() => {
                n.style.opacity = 0, n.style.transitionDuration = "400ms";
            }, 1e3)), r("scrollbarDragEnd", e), s.snapOnRelease && t.slideToClosest());
        }
        function C(e) {
            const {scrollbar: s, params: a} = t, i = s.el;
            if (!i) return;
            const r = i, n = !!a.passiveListeners && {
                passive: !1,
                capture: !1
            }, l = !!a.passiveListeners && {
                passive: !0,
                capture: !1
            };
            if (!r) return;
            const d = "on" === e ? "addEventListener" : "removeEventListener";
            r[d]("pointerdown", x, n), o[d]("pointermove", S, n), o[d]("pointerup", M, l);
        }
        function P() {
            const {scrollbar: e, el: s} = t;
            t.params.scrollbar = re(t, t.originalParams.scrollbar, t.params.scrollbar, {
                el: "swiper-scrollbar"
            });
            const a = t.params.scrollbar;
            if (!a.el) return;
            let i, r;
            if ("string" == typeof a.el && t.isElement && (i = t.el.querySelector(a.el)), i || "string" != typeof a.el) i || (i = a.el); else if (i = o.querySelectorAll(a.el), 
            !i.length) return;
            t.params.uniqueNavElements && "string" == typeof a.el && i.length > 1 && 1 === s.querySelectorAll(a.el).length && (i = s.querySelector(a.el)), 
            i.length > 0 && (i = i[0]), i.classList.add(t.isHorizontal() ? a.horizontalClass : a.verticalClass), 
            i && (r = i.querySelector(ne(t.params.scrollbar.dragClass)), r || (r = v("div", t.params.scrollbar.dragClass), 
            i.append(r))), Object.assign(e, {
                el: i,
                dragEl: r
            }), a.draggable && t.params.scrollbar.el && t.scrollbar.el && C("on"), i && i.classList[t.enabled ? "remove" : "add"](...n(t.params.scrollbar.lockClass));
        }
        function L() {
            const e = t.params.scrollbar, s = t.scrollbar.el;
            s && s.classList.remove(...n(t.isHorizontal() ? e.horizontalClass : e.verticalClass)), 
            t.params.scrollbar.el && t.scrollbar.el && C("off");
        }
        s({
            scrollbar: {
                el: null,
                dragSize: "auto",
                hide: !1,
                draggable: !1,
                snapOnRelease: !0,
                lockClass: "swiper-scrollbar-lock",
                dragClass: "swiper-scrollbar-drag",
                scrollbarDisabledClass: "swiper-scrollbar-disabled",
                horizontalClass: "swiper-scrollbar-horizontal",
                verticalClass: "swiper-scrollbar-vertical"
            }
        }), t.scrollbar = {
            el: null,
            dragEl: null
        }, i("changeDirection", () => {
            if (!t.scrollbar || !t.scrollbar.el) return;
            const e = t.params.scrollbar;
            let {el: s} = t.scrollbar;
            s = T(s), s.forEach(s => {
                s.classList.remove(e.horizontalClass, e.verticalClass), s.classList.add(t.isHorizontal() ? e.horizontalClass : e.verticalClass);
            });
        }), i("init", () => {
            !1 === t.params.scrollbar.enabled ? I() : (P(), b(), g());
        }), i("update resize observerUpdate lock unlock changeDirection", () => {
            b();
        }), i("setTranslate", () => {
            g();
        }), i("setTransition", (e, s) => {
            !function(e) {
                t.params.scrollbar.el && t.scrollbar.el && (t.scrollbar.dragEl.style.transitionDuration = `${e}ms`);
            }(s);
        }), i("enable disable", () => {
            const {el: e} = t.scrollbar;
            e && e.classList[t.enabled ? "remove" : "add"](...n(t.params.scrollbar.lockClass));
        }), i("destroy", () => {
            L();
        });
        const I = () => {
            t.el.classList.add(...n(t.params.scrollbar.scrollbarDisabledClass)), t.scrollbar.el && t.scrollbar.el.classList.add(...n(t.params.scrollbar.scrollbarDisabledClass)), 
            L();
        };
        Object.assign(t.scrollbar, {
            enable: () => {
                t.el.classList.remove(...n(t.params.scrollbar.scrollbarDisabledClass)), t.scrollbar.el && t.scrollbar.el.classList.remove(...n(t.params.scrollbar.scrollbarDisabledClass)), 
                P(), b(), g();
            },
            disable: I,
            updateSize: b,
            setTranslate: g,
            init: P,
            destroy: L
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a} = e;
        s({
            parallax: {
                enabled: !1
            }
        });
        const i = "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]", r = (e, s) => {
            const {rtl: a} = t, i = a ? -1 : 1, r = e.getAttribute("data-swiper-parallax") || "0";
            let n = e.getAttribute("data-swiper-parallax-x"), l = e.getAttribute("data-swiper-parallax-y");
            const o = e.getAttribute("data-swiper-parallax-scale"), d = e.getAttribute("data-swiper-parallax-opacity"), c = e.getAttribute("data-swiper-parallax-rotate");
            if (n || l ? (n = n || "0", l = l || "0") : t.isHorizontal() ? (n = r, l = "0") : (l = r, 
            n = "0"), n = n.indexOf("%") >= 0 ? parseInt(n, 10) * s * i + "%" : n * s * i + "px", 
            l = l.indexOf("%") >= 0 ? parseInt(l, 10) * s + "%" : l * s + "px", null != d) {
                const t = d - (d - 1) * (1 - Math.abs(s));
                e.style.opacity = t;
            }
            let p = `translate3d(${n}, ${l}, 0px)`;
            if (null != o) {
                p += ` scale(${o - (o - 1) * (1 - Math.abs(s))})`;
            }
            if (c && null != c) {
                p += ` rotate(${c * s * -1}deg)`;
            }
            e.style.transform = p;
        }, n = () => {
            const {el: e, slides: s, progress: a, snapGrid: n, isElement: l} = t, o = f(e, i);
            t.isElement && o.push(...f(t.hostEl, i)), o.forEach(e => {
                r(e, a);
            }), s.forEach((e, s) => {
                let l = e.progress;
                t.params.slidesPerGroup > 1 && "auto" !== t.params.slidesPerView && (l += Math.ceil(s / 2) - a * (n.length - 1)), 
                l = Math.min(Math.max(l, -1), 1), e.querySelectorAll(`${i}, [data-swiper-parallax-rotate]`).forEach(e => {
                    r(e, l);
                });
            });
        };
        a("beforeInit", () => {
            t.params.parallax.enabled && (t.params.watchSlidesProgress = !0, t.originalParams.watchSlidesProgress = !0);
        }), a("init", () => {
            t.params.parallax.enabled && n();
        }), a("setTranslate", () => {
            t.params.parallax.enabled && n();
        }), a("setTransition", (e, s) => {
            t.params.parallax.enabled && function(e) {
                void 0 === e && (e = t.params.speed);
                const {el: s, hostEl: a} = t, r = [ ...s.querySelectorAll(i) ];
                t.isElement && r.push(...a.querySelectorAll(i)), r.forEach(t => {
                    let s = parseInt(t.getAttribute("data-swiper-parallax-duration"), 10) || e;
                    0 === e && (s = 0), t.style.transitionDuration = `${s}ms`;
                });
            }(s);
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a, emit: i} = e;
        const n = r();
        s({
            zoom: {
                enabled: !1,
                limitToOriginalSize: !1,
                maxRatio: 3,
                minRatio: 1,
                toggle: !0,
                containerClass: "swiper-zoom-container",
                zoomedSlideClass: "swiper-slide-zoomed"
            }
        }), t.zoom = {
            enabled: !1
        };
        let l, o, c = 1, p = !1;
        const u = [], m = {
            originX: 0,
            originY: 0,
            slideEl: void 0,
            slideWidth: void 0,
            slideHeight: void 0,
            imageEl: void 0,
            imageWrapEl: void 0,
            maxRatio: 3
        }, h = {
            isTouched: void 0,
            isMoved: void 0,
            currentX: void 0,
            currentY: void 0,
            minX: void 0,
            minY: void 0,
            maxX: void 0,
            maxY: void 0,
            width: void 0,
            height: void 0,
            startX: void 0,
            startY: void 0,
            touchesStart: {},
            touchesCurrent: {}
        }, g = {
            x: void 0,
            y: void 0,
            prevPositionX: void 0,
            prevPositionY: void 0,
            prevTime: void 0
        };
        let v, b = 1;
        function y() {
            if (u.length < 2) return 1;
            const e = u[0].pageX, t = u[0].pageY, s = u[1].pageX, a = u[1].pageY;
            return Math.sqrt((s - e) ** 2 + (a - t) ** 2);
        }
        function x() {
            const e = t.params.zoom, s = m.imageWrapEl.getAttribute("data-swiper-zoom") || e.maxRatio;
            if (e.limitToOriginalSize && m.imageEl && m.imageEl.naturalWidth) {
                const e = m.imageEl.naturalWidth / m.imageEl.offsetWidth;
                return Math.min(e, s);
            }
            return s;
        }
        function S(e) {
            const s = t.isElement ? "swiper-slide" : `.${t.params.slideClass}`;
            return !!e.target.matches(s) || t.slides.filter(t => t.contains(e.target)).length > 0;
        }
        function T(e) {
            if ("mouse" === e.pointerType && u.splice(0, u.length), !S(e)) return;
            const s = t.params.zoom;
            if (l = !1, o = !1, u.push(e), !(u.length < 2)) {
                if (l = !0, m.scaleStart = y(), !m.slideEl) {
                    m.slideEl = e.target.closest(`.${t.params.slideClass}, swiper-slide`), m.slideEl || (m.slideEl = t.slides[t.activeIndex]);
                    let a = m.slideEl.querySelector(`.${s.containerClass}`);
                    if (a && (a = a.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]), 
                    m.imageEl = a, m.imageWrapEl = a ? E(m.imageEl, `.${s.containerClass}`)[0] : void 0, 
                    !m.imageWrapEl) return void (m.imageEl = void 0);
                    m.maxRatio = x();
                }
                if (m.imageEl) {
                    const [e, t] = function() {
                        if (u.length < 2) return {
                            x: null,
                            y: null
                        };
                        const e = m.imageEl.getBoundingClientRect();
                        return [ (u[0].pageX + (u[1].pageX - u[0].pageX) / 2 - e.x - n.scrollX) / c, (u[0].pageY + (u[1].pageY - u[0].pageY) / 2 - e.y - n.scrollY) / c ];
                    }();
                    m.originX = e, m.originY = t, m.imageEl.style.transitionDuration = "0ms";
                }
                p = !0;
            }
        }
        function M(e) {
            if (!S(e)) return;
            const s = t.params.zoom, a = t.zoom, i = u.findIndex(t => t.pointerId === e.pointerId);
            i >= 0 && (u[i] = e), u.length < 2 || (o = !0, m.scaleMove = y(), m.imageEl && (a.scale = m.scaleMove / m.scaleStart * c, 
            a.scale > m.maxRatio && (a.scale = m.maxRatio - 1 + (a.scale - m.maxRatio + 1) ** .5), 
            a.scale < s.minRatio && (a.scale = s.minRatio + 1 - (s.minRatio - a.scale + 1) ** .5), 
            m.imageEl.style.transform = `translate3d(0,0,0) scale(${a.scale})`));
        }
        function C(e) {
            if (!S(e)) return;
            if ("mouse" === e.pointerType && "pointerout" === e.type) return;
            const s = t.params.zoom, a = t.zoom, i = u.findIndex(t => t.pointerId === e.pointerId);
            i >= 0 && u.splice(i, 1), l && o && (l = !1, o = !1, m.imageEl && (a.scale = Math.max(Math.min(a.scale, m.maxRatio), s.minRatio), 
            m.imageEl.style.transitionDuration = `${t.params.speed}ms`, m.imageEl.style.transform = `translate3d(0,0,0) scale(${a.scale})`, 
            c = a.scale, p = !1, a.scale > 1 && m.slideEl ? m.slideEl.classList.add(`${s.zoomedSlideClass}`) : a.scale <= 1 && m.slideEl && m.slideEl.classList.remove(`${s.zoomedSlideClass}`), 
            1 === a.scale && (m.originX = 0, m.originY = 0, m.slideEl = void 0)));
        }
        function P() {
            t.touchEventsData.preventTouchMoveFromPointerMove = !1;
        }
        function L(e) {
            if (!S(e) || !function(e) {
                const s = `.${t.params.zoom.containerClass}`;
                return !!e.target.matches(s) || [ ...t.hostEl.querySelectorAll(s) ].filter(t => t.contains(e.target)).length > 0;
            }(e)) return;
            const s = t.zoom;
            if (!m.imageEl) return;
            if (!h.isTouched || !m.slideEl) return;
            h.isMoved || (h.width = m.imageEl.offsetWidth || m.imageEl.clientWidth, h.height = m.imageEl.offsetHeight || m.imageEl.clientHeight, 
            h.startX = d(m.imageWrapEl, "x") || 0, h.startY = d(m.imageWrapEl, "y") || 0, m.slideWidth = m.slideEl.offsetWidth, 
            m.slideHeight = m.slideEl.offsetHeight, m.imageWrapEl.style.transitionDuration = "0ms");
            const a = h.width * s.scale, i = h.height * s.scale;
            h.minX = Math.min(m.slideWidth / 2 - a / 2, 0), h.maxX = -h.minX, h.minY = Math.min(m.slideHeight / 2 - i / 2, 0), 
            h.maxY = -h.minY, h.touchesCurrent.x = u.length > 0 ? u[0].pageX : e.pageX, h.touchesCurrent.y = u.length > 0 ? u[0].pageY : e.pageY;
            if (Math.max(Math.abs(h.touchesCurrent.x - h.touchesStart.x), Math.abs(h.touchesCurrent.y - h.touchesStart.y)) > 5 && (t.allowClick = !1), 
            !h.isMoved && !p) {
                if (t.isHorizontal() && (Math.floor(h.minX) === Math.floor(h.startX) && h.touchesCurrent.x < h.touchesStart.x || Math.floor(h.maxX) === Math.floor(h.startX) && h.touchesCurrent.x > h.touchesStart.x)) return h.isTouched = !1, 
                void P();
                if (!t.isHorizontal() && (Math.floor(h.minY) === Math.floor(h.startY) && h.touchesCurrent.y < h.touchesStart.y || Math.floor(h.maxY) === Math.floor(h.startY) && h.touchesCurrent.y > h.touchesStart.y)) return h.isTouched = !1, 
                void P();
            }
            e.cancelable && e.preventDefault(), e.stopPropagation(), clearTimeout(v), t.touchEventsData.preventTouchMoveFromPointerMove = !0, 
            v = setTimeout(() => {
                t.destroyed || P();
            }), h.isMoved = !0;
            const r = (s.scale - c) / (m.maxRatio - t.params.zoom.minRatio), {originX: n, originY: l} = m;
            h.currentX = h.touchesCurrent.x - h.touchesStart.x + h.startX + r * (h.width - 2 * n), 
            h.currentY = h.touchesCurrent.y - h.touchesStart.y + h.startY + r * (h.height - 2 * l), 
            h.currentX < h.minX && (h.currentX = h.minX + 1 - (h.minX - h.currentX + 1) ** .8), 
            h.currentX > h.maxX && (h.currentX = h.maxX - 1 + (h.currentX - h.maxX + 1) ** .8), 
            h.currentY < h.minY && (h.currentY = h.minY + 1 - (h.minY - h.currentY + 1) ** .8), 
            h.currentY > h.maxY && (h.currentY = h.maxY - 1 + (h.currentY - h.maxY + 1) ** .8), 
            g.prevPositionX || (g.prevPositionX = h.touchesCurrent.x), g.prevPositionY || (g.prevPositionY = h.touchesCurrent.y), 
            g.prevTime || (g.prevTime = Date.now()), g.x = (h.touchesCurrent.x - g.prevPositionX) / (Date.now() - g.prevTime) / 2, 
            g.y = (h.touchesCurrent.y - g.prevPositionY) / (Date.now() - g.prevTime) / 2, Math.abs(h.touchesCurrent.x - g.prevPositionX) < 2 && (g.x = 0), 
            Math.abs(h.touchesCurrent.y - g.prevPositionY) < 2 && (g.y = 0), g.prevPositionX = h.touchesCurrent.x, 
            g.prevPositionY = h.touchesCurrent.y, g.prevTime = Date.now(), m.imageWrapEl.style.transform = `translate3d(${h.currentX}px, ${h.currentY}px,0)`;
        }
        function I() {
            const e = t.zoom;
            m.slideEl && t.activeIndex !== t.slides.indexOf(m.slideEl) && (m.imageEl && (m.imageEl.style.transform = "translate3d(0,0,0) scale(1)"), 
            m.imageWrapEl && (m.imageWrapEl.style.transform = "translate3d(0,0,0)"), m.slideEl.classList.remove(`${t.params.zoom.zoomedSlideClass}`), 
            e.scale = 1, c = 1, m.slideEl = void 0, m.imageEl = void 0, m.imageWrapEl = void 0, 
            m.originX = 0, m.originY = 0);
        }
        function z(e) {
            const s = t.zoom, a = t.params.zoom;
            if (!m.slideEl) {
                e && e.target && (m.slideEl = e.target.closest(`.${t.params.slideClass}, swiper-slide`)), 
                m.slideEl || (t.params.virtual && t.params.virtual.enabled && t.virtual ? m.slideEl = f(t.slidesEl, `.${t.params.slideActiveClass}`)[0] : m.slideEl = t.slides[t.activeIndex]);
                let s = m.slideEl.querySelector(`.${a.containerClass}`);
                s && (s = s.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]), 
                m.imageEl = s, m.imageWrapEl = s ? E(m.imageEl, `.${a.containerClass}`)[0] : void 0;
            }
            if (!m.imageEl || !m.imageWrapEl) return;
            let i, r, l, o, d, p, u, g, v, b, y, S, T, M, C, P, L, I;
            t.params.cssMode && (t.wrapperEl.style.overflow = "hidden", t.wrapperEl.style.touchAction = "none"), 
            m.slideEl.classList.add(`${a.zoomedSlideClass}`), void 0 === h.touchesStart.x && e ? (i = e.pageX, 
            r = e.pageY) : (i = h.touchesStart.x, r = h.touchesStart.y);
            const z = "number" == typeof e ? e : null;
            1 === c && z && (i = void 0, r = void 0, h.touchesStart.x = void 0, h.touchesStart.y = void 0);
            const A = x();
            s.scale = z || A, c = z || A, !e || 1 === c && z ? (u = 0, g = 0) : (L = m.slideEl.offsetWidth, 
            I = m.slideEl.offsetHeight, l = w(m.slideEl).left + n.scrollX, o = w(m.slideEl).top + n.scrollY, 
            d = l + L / 2 - i, p = o + I / 2 - r, v = m.imageEl.offsetWidth || m.imageEl.clientWidth, 
            b = m.imageEl.offsetHeight || m.imageEl.clientHeight, y = v * s.scale, S = b * s.scale, 
            T = Math.min(L / 2 - y / 2, 0), M = Math.min(I / 2 - S / 2, 0), C = -T, P = -M, 
            u = d * s.scale, g = p * s.scale, u < T && (u = T), u > C && (u = C), g < M && (g = M), 
            g > P && (g = P)), z && 1 === s.scale && (m.originX = 0, m.originY = 0), m.imageWrapEl.style.transitionDuration = "300ms", 
            m.imageWrapEl.style.transform = `translate3d(${u}px, ${g}px,0)`, m.imageEl.style.transitionDuration = "300ms", 
            m.imageEl.style.transform = `translate3d(0,0,0) scale(${s.scale})`;
        }
        function A() {
            const e = t.zoom, s = t.params.zoom;
            if (!m.slideEl) {
                t.params.virtual && t.params.virtual.enabled && t.virtual ? m.slideEl = f(t.slidesEl, `.${t.params.slideActiveClass}`)[0] : m.slideEl = t.slides[t.activeIndex];
                let e = m.slideEl.querySelector(`.${s.containerClass}`);
                e && (e = e.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]), 
                m.imageEl = e, m.imageWrapEl = e ? E(m.imageEl, `.${s.containerClass}`)[0] : void 0;
            }
            m.imageEl && m.imageWrapEl && (t.params.cssMode && (t.wrapperEl.style.overflow = "", 
            t.wrapperEl.style.touchAction = ""), e.scale = 1, c = 1, h.touchesStart.x = void 0, 
            h.touchesStart.y = void 0, m.imageWrapEl.style.transitionDuration = "300ms", m.imageWrapEl.style.transform = "translate3d(0,0,0)", 
            m.imageEl.style.transitionDuration = "300ms", m.imageEl.style.transform = "translate3d(0,0,0) scale(1)", 
            m.slideEl.classList.remove(`${s.zoomedSlideClass}`), m.slideEl = void 0, m.originX = 0, 
            m.originY = 0);
        }
        function $(e) {
            const s = t.zoom;
            s.scale && 1 !== s.scale ? A() : z(e);
        }
        function k() {
            return {
                passiveListener: !!t.params.passiveListeners && {
                    passive: !0,
                    capture: !1
                },
                activeListenerWithCapture: !t.params.passiveListeners || {
                    passive: !1,
                    capture: !0
                }
            };
        }
        function O() {
            const e = t.zoom;
            if (e.enabled) return;
            e.enabled = !0;
            const {passiveListener: s, activeListenerWithCapture: a} = k();
            t.wrapperEl.addEventListener("pointerdown", T, s), t.wrapperEl.addEventListener("pointermove", M, a), 
            [ "pointerup", "pointercancel", "pointerout" ].forEach(e => {
                t.wrapperEl.addEventListener(e, C, s);
            }), t.wrapperEl.addEventListener("pointermove", L, a);
        }
        function D() {
            const e = t.zoom;
            if (!e.enabled) return;
            e.enabled = !1;
            const {passiveListener: s, activeListenerWithCapture: a} = k();
            t.wrapperEl.removeEventListener("pointerdown", T, s), t.wrapperEl.removeEventListener("pointermove", M, a), 
            [ "pointerup", "pointercancel", "pointerout" ].forEach(e => {
                t.wrapperEl.removeEventListener(e, C, s);
            }), t.wrapperEl.removeEventListener("pointermove", L, a);
        }
        Object.defineProperty(t.zoom, "scale", {
            get: () => b,
            set(e) {
                if (b !== e) {
                    const t = m.imageEl, s = m.slideEl;
                    i("zoomChange", e, t, s);
                }
                b = e;
            }
        }), a("init", () => {
            t.params.zoom.enabled && O();
        }), a("destroy", () => {
            D();
        }), a("touchStart", (e, s) => {
            t.zoom.enabled && function(e) {
                const s = t.device;
                if (!m.imageEl) return;
                if (h.isTouched) return;
                s.android && e.cancelable && e.preventDefault(), h.isTouched = !0;
                const a = u.length > 0 ? u[0] : e;
                h.touchesStart.x = a.pageX, h.touchesStart.y = a.pageY;
            }(s);
        }), a("touchEnd", (e, s) => {
            t.zoom.enabled && function() {
                const e = t.zoom;
                if (!m.imageEl) return;
                if (!h.isTouched || !h.isMoved) return h.isTouched = !1, void (h.isMoved = !1);
                h.isTouched = !1, h.isMoved = !1;
                let s = 300, a = 300;
                const i = g.x * s, r = h.currentX + i, n = g.y * a, l = h.currentY + n;
                0 !== g.x && (s = Math.abs((r - h.currentX) / g.x)), 0 !== g.y && (a = Math.abs((l - h.currentY) / g.y));
                const o = Math.max(s, a);
                h.currentX = r, h.currentY = l;
                const d = h.width * e.scale, c = h.height * e.scale;
                h.minX = Math.min(m.slideWidth / 2 - d / 2, 0), h.maxX = -h.minX, h.minY = Math.min(m.slideHeight / 2 - c / 2, 0), 
                h.maxY = -h.minY, h.currentX = Math.max(Math.min(h.currentX, h.maxX), h.minX), h.currentY = Math.max(Math.min(h.currentY, h.maxY), h.minY), 
                m.imageWrapEl.style.transitionDuration = `${o}ms`, m.imageWrapEl.style.transform = `translate3d(${h.currentX}px, ${h.currentY}px,0)`;
            }();
        }), a("doubleTap", (e, s) => {
            !t.animating && t.params.zoom.enabled && t.zoom.enabled && t.params.zoom.toggle && $(s);
        }), a("transitionEnd", () => {
            t.zoom.enabled && t.params.zoom.enabled && I();
        }), a("slideChange", () => {
            t.zoom.enabled && t.params.zoom.enabled && t.params.cssMode && I();
        }), Object.assign(t.zoom, {
            enable: O,
            disable: D,
            in: z,
            out: A,
            toggle: $
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a} = e;
        function i(e, t) {
            const s = function() {
                let e, t, s;
                return (a, i) => {
                    for (t = -1, e = a.length; e - t > 1; ) s = e + t >> 1, a[s] <= i ? t = s : e = s;
                    return e;
                };
            }();
            let a, i;
            return this.x = e, this.y = t, this.lastIndex = e.length - 1, this.interpolate = function(e) {
                return e ? (i = s(this.x, e), a = i - 1, (e - this.x[a]) * (this.y[i] - this.y[a]) / (this.x[i] - this.x[a]) + this.y[a]) : 0;
            }, this;
        }
        function r() {
            t.controller.control && t.controller.spline && (t.controller.spline = void 0, delete t.controller.spline);
        }
        s({
            controller: {
                control: void 0,
                inverse: !1,
                by: "slide"
            }
        }), t.controller = {
            control: void 0
        }, a("beforeInit", () => {
            if ("undefined" != typeof window && ("string" == typeof t.params.controller.control || t.params.controller.control instanceof HTMLElement)) {
                ("string" == typeof t.params.controller.control ? [ ...document.querySelectorAll(t.params.controller.control) ] : [ t.params.controller.control ]).forEach(e => {
                    if (t.controller.control || (t.controller.control = []), e && e.swiper) t.controller.control.push(e.swiper); else if (e) {
                        const s = `${t.params.eventsPrefix}init`, a = i => {
                            t.controller.control.push(i.detail[0]), t.update(), e.removeEventListener(s, a);
                        };
                        e.addEventListener(s, a);
                    }
                });
            } else t.controller.control = t.params.controller.control;
        }), a("update", () => {
            r();
        }), a("resize", () => {
            r();
        }), a("observerUpdate", () => {
            r();
        }), a("setTranslate", (e, s, a) => {
            t.controller.control && !t.controller.control.destroyed && t.controller.setTranslate(s, a);
        }), a("setTransition", (e, s, a) => {
            t.controller.control && !t.controller.control.destroyed && t.controller.setTransition(s, a);
        }), Object.assign(t.controller, {
            setTranslate: function(e, s) {
                const a = t.controller.control;
                let r, n;
                const l = t.constructor;
                function o(e) {
                    if (e.destroyed) return;
                    const s = t.rtlTranslate ? -t.translate : t.translate;
                    "slide" === t.params.controller.by && (!function(e) {
                        t.controller.spline = t.params.loop ? new i(t.slidesGrid, e.slidesGrid) : new i(t.snapGrid, e.snapGrid);
                    }(e), n = -t.controller.spline.interpolate(-s)), n && "container" !== t.params.controller.by || (r = (e.maxTranslate() - e.minTranslate()) / (t.maxTranslate() - t.minTranslate()), 
                    !Number.isNaN(r) && Number.isFinite(r) || (r = 1), n = (s - t.minTranslate()) * r + e.minTranslate()), 
                    t.params.controller.inverse && (n = e.maxTranslate() - n), e.updateProgress(n), 
                    e.setTranslate(n, t), e.updateActiveIndex(), e.updateSlidesClasses();
                }
                if (Array.isArray(a)) for (let e = 0; e < a.length; e += 1) a[e] !== s && a[e] instanceof l && o(a[e]); else a instanceof l && s !== a && o(a);
            },
            setTransition: function(e, s) {
                const a = t.constructor, i = t.controller.control;
                let r;
                function n(s) {
                    s.destroyed || (s.setTransition(e, t), 0 !== e && (s.transitionStart(), s.params.autoHeight && l(() => {
                        s.updateAutoHeight();
                    }), x(s.wrapperEl, () => {
                        i && s.transitionEnd();
                    })));
                }
                if (Array.isArray(i)) for (r = 0; r < i.length; r += 1) i[r] !== s && i[r] instanceof a && n(i[r]); else i instanceof a && s !== i && n(i);
            }
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: i} = e;
        s({
            a11y: {
                enabled: !0,
                notificationClass: "swiper-notification",
                prevSlideMessage: "Previous slide",
                nextSlideMessage: "Next slide",
                firstSlideMessage: "This is the first slide",
                lastSlideMessage: "This is the last slide",
                paginationBulletMessage: "Go to slide {{index}}",
                slideLabelMessage: "{{index}} / {{slidesLength}}",
                containerMessage: null,
                containerRoleDescriptionMessage: null,
                containerRole: null,
                itemRoleDescriptionMessage: null,
                slideRole: "group",
                id: null,
                scrollOnFocus: !0
            }
        }), t.a11y = {
            clicked: !1
        };
        let r, n, l = null, o = (new Date).getTime();
        function d(e) {
            const t = l;
            0 !== t.length && (t.innerHTML = "", t.innerHTML = e);
        }
        function c(e) {
            (e = T(e)).forEach(e => {
                e.setAttribute("tabIndex", "0");
            });
        }
        function p(e) {
            (e = T(e)).forEach(e => {
                e.setAttribute("tabIndex", "-1");
            });
        }
        function u(e, t) {
            (e = T(e)).forEach(e => {
                e.setAttribute("role", t);
            });
        }
        function m(e, t) {
            (e = T(e)).forEach(e => {
                e.setAttribute("aria-roledescription", t);
            });
        }
        function h(e, t) {
            (e = T(e)).forEach(e => {
                e.setAttribute("aria-label", t);
            });
        }
        function f(e) {
            (e = T(e)).forEach(e => {
                e.setAttribute("aria-disabled", !0);
            });
        }
        function g(e) {
            (e = T(e)).forEach(e => {
                e.setAttribute("aria-disabled", !1);
            });
        }
        function w(e) {
            if (13 !== e.keyCode && 32 !== e.keyCode) return;
            const s = t.params.a11y, a = e.target;
            if (!t.pagination || !t.pagination.el || a !== t.pagination.el && !t.pagination.el.contains(e.target) || e.target.matches(ne(t.params.pagination.bulletClass))) {
                if (t.navigation && t.navigation.prevEl && t.navigation.nextEl) {
                    const e = T(t.navigation.prevEl);
                    T(t.navigation.nextEl).includes(a) && (t.isEnd && !t.params.loop || t.slideNext(), 
                    t.isEnd ? d(s.lastSlideMessage) : d(s.nextSlideMessage)), e.includes(a) && (t.isBeginning && !t.params.loop || t.slidePrev(), 
                    t.isBeginning ? d(s.firstSlideMessage) : d(s.prevSlideMessage));
                }
                t.pagination && a.matches(ne(t.params.pagination.bulletClass)) && a.click();
            }
        }
        function b() {
            return t.pagination && t.pagination.bullets && t.pagination.bullets.length;
        }
        function E() {
            return b() && t.params.pagination.clickable;
        }
        const x = (e, t, s) => {
            c(e), "BUTTON" !== e.tagName && (u(e, "button"), e.addEventListener("keydown", w)), 
            h(e, s), function(e, t) {
                (e = T(e)).forEach(e => {
                    e.setAttribute("aria-controls", t);
                });
            }(e, t);
        }, S = e => {
            n && n !== e.target && !n.contains(e.target) && (r = !0), t.a11y.clicked = !0;
        }, M = () => {
            r = !1, requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    t.destroyed || (t.a11y.clicked = !1);
                });
            });
        }, C = e => {
            o = (new Date).getTime();
        }, P = e => {
            if (t.a11y.clicked || !t.params.a11y.scrollOnFocus) return;
            if ((new Date).getTime() - o < 100) return;
            const s = e.target.closest(`.${t.params.slideClass}, swiper-slide`);
            if (!s || !t.slides.includes(s)) return;
            n = s;
            const a = t.slides.indexOf(s) === t.activeIndex, i = t.params.watchSlidesProgress && t.visibleSlides && t.visibleSlides.includes(s);
            a || i || e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents || (t.isHorizontal() ? t.el.scrollLeft = 0 : t.el.scrollTop = 0, 
            requestAnimationFrame(() => {
                r || (t.params.loop ? t.slideToLoop(parseInt(s.getAttribute("data-swiper-slide-index")), 0) : t.slideTo(t.slides.indexOf(s), 0), 
                r = !1);
            }));
        }, L = () => {
            const e = t.params.a11y;
            e.itemRoleDescriptionMessage && m(t.slides, e.itemRoleDescriptionMessage), e.slideRole && u(t.slides, e.slideRole);
            const s = t.slides.length;
            e.slideLabelMessage && t.slides.forEach((a, i) => {
                const r = t.params.loop ? parseInt(a.getAttribute("data-swiper-slide-index"), 10) : i;
                h(a, e.slideLabelMessage.replace(/\{\{index\}\}/, r + 1).replace(/\{\{slidesLength\}\}/, s));
            });
        }, I = () => {
            const e = t.params.a11y;
            t.el.append(l);
            const s = t.el;
            e.containerRoleDescriptionMessage && m(s, e.containerRoleDescriptionMessage), e.containerMessage && h(s, e.containerMessage), 
            e.containerRole && u(s, e.containerRole);
            const i = t.wrapperEl, r = e.id || i.getAttribute("id") || `swiper-wrapper-${n = 16, 
            void 0 === n && (n = 16), "x".repeat(n).replace(/x/g, () => Math.round(16 * Math.random()).toString(16))}`;
            var n;
            const o = t.params.autoplay && t.params.autoplay.enabled ? "off" : "polite";
            var d;
            d = r, T(i).forEach(e => {
                e.setAttribute("id", d);
            }), function(e, t) {
                (e = T(e)).forEach(e => {
                    e.setAttribute("aria-live", t);
                });
            }(i, o), L();
            let {nextEl: c, prevEl: p} = t.navigation ? t.navigation : {};
            if (c = T(c), p = T(p), c && c.forEach(t => x(t, r, e.nextSlideMessage)), p && p.forEach(t => x(t, r, e.prevSlideMessage)), 
            E()) {
                T(t.pagination.el).forEach(e => {
                    e.addEventListener("keydown", w);
                });
            }
            a().addEventListener("visibilitychange", C), t.el.addEventListener("focus", P, !0), 
            t.el.addEventListener("focus", P, !0), t.el.addEventListener("pointerdown", S, !0), 
            t.el.addEventListener("pointerup", M, !0);
        };
        i("beforeInit", () => {
            l = v("span", t.params.a11y.notificationClass), l.setAttribute("aria-live", "assertive"), 
            l.setAttribute("aria-atomic", "true");
        }), i("afterInit", () => {
            t.params.a11y.enabled && I();
        }), i("slidesLengthChange snapGridLengthChange slidesGridLengthChange", () => {
            t.params.a11y.enabled && L();
        }), i("fromEdge toEdge afterInit lock unlock", () => {
            t.params.a11y.enabled && function() {
                if (t.params.loop || t.params.rewind || !t.navigation) return;
                const {nextEl: e, prevEl: s} = t.navigation;
                s && (t.isBeginning ? (f(s), p(s)) : (g(s), c(s))), e && (t.isEnd ? (f(e), p(e)) : (g(e), 
                c(e)));
            }();
        }), i("paginationUpdate", () => {
            t.params.a11y.enabled && function() {
                const e = t.params.a11y;
                b() && t.pagination.bullets.forEach(s => {
                    t.params.pagination.clickable && (c(s), t.params.pagination.renderBullet || (u(s, "button"), 
                    h(s, e.paginationBulletMessage.replace(/\{\{index\}\}/, y(s) + 1)))), s.matches(ne(t.params.pagination.bulletActiveClass)) ? s.setAttribute("aria-current", "true") : s.removeAttribute("aria-current");
                });
            }();
        }), i("destroy", () => {
            t.params.a11y.enabled && function() {
                l && l.remove();
                let {nextEl: e, prevEl: s} = t.navigation ? t.navigation : {};
                e = T(e), s = T(s), e && e.forEach(e => e.removeEventListener("keydown", w)), s && s.forEach(e => e.removeEventListener("keydown", w)), 
                E() && T(t.pagination.el).forEach(e => {
                    e.removeEventListener("keydown", w);
                });
                a().removeEventListener("visibilitychange", C), t.el && "string" != typeof t.el && (t.el.removeEventListener("focus", P, !0), 
                t.el.removeEventListener("pointerdown", S, !0), t.el.removeEventListener("pointerup", M, !0));
            }();
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a} = e;
        s({
            history: {
                enabled: !1,
                root: "",
                replaceState: !1,
                key: "slides",
                keepQuery: !1
            }
        });
        let i = !1, n = {};
        const l = e => e.toString().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+/, "").replace(/-+$/, ""), o = e => {
            const t = r();
            let s;
            s = e ? new URL(e) : t.location;
            const a = s.pathname.slice(1).split("/").filter(e => "" !== e), i = a.length;
            return {
                key: a[i - 2],
                value: a[i - 1]
            };
        }, d = (e, s) => {
            const a = r();
            if (!i || !t.params.history.enabled) return;
            let n;
            n = t.params.url ? new URL(t.params.url) : a.location;
            const o = t.virtual && t.params.virtual.enabled ? t.slidesEl.querySelector(`[data-swiper-slide-index="${s}"]`) : t.slides[s];
            let d = l(o.getAttribute("data-history"));
            if (t.params.history.root.length > 0) {
                let s = t.params.history.root;
                "/" === s[s.length - 1] && (s = s.slice(0, s.length - 1)), d = `${s}/${e ? `${e}/` : ""}${d}`;
            } else n.pathname.includes(e) || (d = `${e ? `${e}/` : ""}${d}`);
            t.params.history.keepQuery && (d += n.search);
            const c = a.history.state;
            c && c.value === d || (t.params.history.replaceState ? a.history.replaceState({
                value: d
            }, null, d) : a.history.pushState({
                value: d
            }, null, d));
        }, c = (e, s, a) => {
            if (s) for (let i = 0, r = t.slides.length; i < r; i += 1) {
                const r = t.slides[i];
                if (l(r.getAttribute("data-history")) === s) {
                    const s = t.getSlideIndex(r);
                    t.slideTo(s, e, a);
                }
            } else t.slideTo(0, e, a);
        }, p = () => {
            n = o(t.params.url), c(t.params.speed, n.value, !1);
        };
        a("init", () => {
            t.params.history.enabled && (() => {
                const e = r();
                if (t.params.history) {
                    if (!e.history || !e.history.pushState) return t.params.history.enabled = !1, void (t.params.hashNavigation.enabled = !0);
                    i = !0, n = o(t.params.url), n.key || n.value ? (c(0, n.value, t.params.runCallbacksOnInit), 
                    t.params.history.replaceState || e.addEventListener("popstate", p)) : t.params.history.replaceState || e.addEventListener("popstate", p);
                }
            })();
        }), a("destroy", () => {
            t.params.history.enabled && (() => {
                const e = r();
                t.params.history.replaceState || e.removeEventListener("popstate", p);
            })();
        }), a("transitionEnd _freeModeNoMomentumRelease", () => {
            i && d(t.params.history.key, t.activeIndex);
        }), a("slideChange", () => {
            i && t.params.cssMode && d(t.params.history.key, t.activeIndex);
        });
    }, function(e) {
        let {swiper: t, extendParams: s, emit: i, on: n} = e, l = !1;
        const o = a(), d = r();
        s({
            hashNavigation: {
                enabled: !1,
                replaceState: !1,
                watchState: !1,
                getSlideIndex(e, s) {
                    if (t.virtual && t.params.virtual.enabled) {
                        const e = t.slides.filter(e => e.getAttribute("data-hash") === s)[0];
                        if (!e) return 0;
                        return parseInt(e.getAttribute("data-swiper-slide-index"), 10);
                    }
                    return t.getSlideIndex(f(t.slidesEl, `.${t.params.slideClass}[data-hash="${s}"], swiper-slide[data-hash="${s}"]`)[0]);
                }
            }
        });
        const c = () => {
            i("hashChange");
            const e = o.location.hash.replace("#", ""), s = t.virtual && t.params.virtual.enabled ? t.slidesEl.querySelector(`[data-swiper-slide-index="${t.activeIndex}"]`) : t.slides[t.activeIndex];
            if (e !== (s ? s.getAttribute("data-hash") : "")) {
                const s = t.params.hashNavigation.getSlideIndex(t, e);
                if (void 0 === s || Number.isNaN(s)) return;
                t.slideTo(s);
            }
        }, p = () => {
            if (!l || !t.params.hashNavigation.enabled) return;
            const e = t.virtual && t.params.virtual.enabled ? t.slidesEl.querySelector(`[data-swiper-slide-index="${t.activeIndex}"]`) : t.slides[t.activeIndex], s = e ? e.getAttribute("data-hash") || e.getAttribute("data-history") : "";
            t.params.hashNavigation.replaceState && d.history && d.history.replaceState ? (d.history.replaceState(null, null, `#${s}` || ""), 
            i("hashSet")) : (o.location.hash = s || "", i("hashSet"));
        };
        n("init", () => {
            t.params.hashNavigation.enabled && (() => {
                if (!t.params.hashNavigation.enabled || t.params.history && t.params.history.enabled) return;
                l = !0;
                const e = o.location.hash.replace("#", "");
                if (e) {
                    const s = 0, a = t.params.hashNavigation.getSlideIndex(t, e);
                    t.slideTo(a || 0, s, t.params.runCallbacksOnInit, !0);
                }
                t.params.hashNavigation.watchState && d.addEventListener("hashchange", c);
            })();
        }), n("destroy", () => {
            t.params.hashNavigation.enabled && t.params.hashNavigation.watchState && d.removeEventListener("hashchange", c);
        }), n("transitionEnd _freeModeNoMomentumRelease", () => {
            l && p();
        }), n("slideChange", () => {
            l && t.params.cssMode && p();
        });
    }, function(e) {
        let t, s, {swiper: i, extendParams: r, on: n, emit: l, params: o} = e;
        i.autoplay = {
            running: !1,
            paused: !1,
            timeLeft: 0
        }, r({
            autoplay: {
                enabled: !1,
                delay: 3e3,
                waitForTransition: !0,
                disableOnInteraction: !1,
                stopOnLastSlide: !1,
                reverseDirection: !1,
                pauseOnMouseEnter: !1
            }
        });
        let d, c, p, u, m, h, f, g, v = o && o.autoplay ? o.autoplay.delay : 3e3, w = o && o.autoplay ? o.autoplay.delay : 3e3, b = (new Date).getTime();
        function y(e) {
            i && !i.destroyed && i.wrapperEl && e.target === i.wrapperEl && (i.wrapperEl.removeEventListener("transitionend", y), 
            g || e.detail && e.detail.bySwiperTouchMove || C());
        }
        const E = () => {
            if (i.destroyed || !i.autoplay.running) return;
            i.autoplay.paused ? c = !0 : c && (w = d, c = !1);
            const e = i.autoplay.paused ? d : b + w - (new Date).getTime();
            i.autoplay.timeLeft = e, l("autoplayTimeLeft", e, e / v), s = requestAnimationFrame(() => {
                E();
            });
        }, x = e => {
            if (i.destroyed || !i.autoplay.running) return;
            cancelAnimationFrame(s), E();
            let a = void 0 === e ? i.params.autoplay.delay : e;
            v = i.params.autoplay.delay, w = i.params.autoplay.delay;
            const r = (() => {
                let e;
                if (e = i.virtual && i.params.virtual.enabled ? i.slides.filter(e => e.classList.contains("swiper-slide-active"))[0] : i.slides[i.activeIndex], 
                !e) return;
                return parseInt(e.getAttribute("data-swiper-autoplay"), 10);
            })();
            !Number.isNaN(r) && r > 0 && void 0 === e && (a = r, v = r, w = r), d = a;
            const n = i.params.speed, o = () => {
                i && !i.destroyed && (i.params.autoplay.reverseDirection ? !i.isBeginning || i.params.loop || i.params.rewind ? (i.slidePrev(n, !0, !0), 
                l("autoplay")) : i.params.autoplay.stopOnLastSlide || (i.slideTo(i.slides.length - 1, n, !0, !0), 
                l("autoplay")) : !i.isEnd || i.params.loop || i.params.rewind ? (i.slideNext(n, !0, !0), 
                l("autoplay")) : i.params.autoplay.stopOnLastSlide || (i.slideTo(0, n, !0, !0), 
                l("autoplay")), i.params.cssMode && (b = (new Date).getTime(), requestAnimationFrame(() => {
                    x();
                })));
            };
            return a > 0 ? (clearTimeout(t), t = setTimeout(() => {
                o();
            }, a)) : requestAnimationFrame(() => {
                o();
            }), a;
        }, S = () => {
            b = (new Date).getTime(), i.autoplay.running = !0, x(), l("autoplayStart");
        }, T = () => {
            i.autoplay.running = !1, clearTimeout(t), cancelAnimationFrame(s), l("autoplayStop");
        }, M = (e, s) => {
            if (i.destroyed || !i.autoplay.running) return;
            clearTimeout(t), e || (f = !0);
            const a = () => {
                l("autoplayPause"), i.params.autoplay.waitForTransition ? i.wrapperEl.addEventListener("transitionend", y) : C();
            };
            if (i.autoplay.paused = !0, s) return h && (d = i.params.autoplay.delay), h = !1, 
            void a();
            const r = d || i.params.autoplay.delay;
            d = r - ((new Date).getTime() - b), i.isEnd && d < 0 && !i.params.loop || (d < 0 && (d = 0), 
            a());
        }, C = () => {
            i.isEnd && d < 0 && !i.params.loop || i.destroyed || !i.autoplay.running || (b = (new Date).getTime(), 
            f ? (f = !1, x(d)) : x(), i.autoplay.paused = !1, l("autoplayResume"));
        }, P = () => {
            if (i.destroyed || !i.autoplay.running) return;
            const e = a();
            "hidden" === e.visibilityState && (f = !0, M(!0)), "visible" === e.visibilityState && C();
        }, L = e => {
            "mouse" === e.pointerType && (f = !0, g = !0, i.animating || i.autoplay.paused || M(!0));
        }, I = e => {
            "mouse" === e.pointerType && (g = !1, i.autoplay.paused && C());
        };
        n("init", () => {
            i.params.autoplay.enabled && (i.params.autoplay.pauseOnMouseEnter && (i.el.addEventListener("pointerenter", L), 
            i.el.addEventListener("pointerleave", I)), a().addEventListener("visibilitychange", P), 
            S());
        }), n("destroy", () => {
            i.el && "string" != typeof i.el && (i.el.removeEventListener("pointerenter", L), 
            i.el.removeEventListener("pointerleave", I)), a().removeEventListener("visibilitychange", P), 
            i.autoplay.running && T();
        }), n("_freeModeStaticRelease", () => {
            (u || f) && C();
        }), n("_freeModeNoMomentumRelease", () => {
            i.params.autoplay.disableOnInteraction ? T() : M(!0, !0);
        }), n("beforeTransitionStart", (e, t, s) => {
            !i.destroyed && i.autoplay.running && (s || !i.params.autoplay.disableOnInteraction ? M(!0, !0) : T());
        }), n("sliderFirstMove", () => {
            !i.destroyed && i.autoplay.running && (i.params.autoplay.disableOnInteraction ? T() : (p = !0, 
            u = !1, f = !1, m = setTimeout(() => {
                f = !0, u = !0, M(!0);
            }, 200)));
        }), n("touchEnd", () => {
            if (!i.destroyed && i.autoplay.running && p) {
                if (clearTimeout(m), clearTimeout(t), i.params.autoplay.disableOnInteraction) return u = !1, 
                void (p = !1);
                u && i.params.cssMode && C(), u = !1, p = !1;
            }
        }), n("slideChange", () => {
            !i.destroyed && i.autoplay.running && (h = !0);
        }), Object.assign(i.autoplay, {
            start: S,
            stop: T,
            pause: M,
            resume: C
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: i} = e;
        s({
            thumbs: {
                swiper: null,
                multipleActiveThumbs: !0,
                autoScrollOffset: 0,
                slideThumbActiveClass: "swiper-slide-thumb-active",
                thumbsContainerClass: "swiper-thumbs"
            }
        });
        let r = !1, n = !1;
        function l() {
            const e = t.thumbs.swiper;
            if (!e || e.destroyed) return;
            const s = e.clickedIndex, a = e.clickedSlide;
            if (a && a.classList.contains(t.params.thumbs.slideThumbActiveClass)) return;
            if (null == s) return;
            let i;
            i = e.params.loop ? parseInt(e.clickedSlide.getAttribute("data-swiper-slide-index"), 10) : s, 
            t.params.loop ? t.slideToLoop(i) : t.slideTo(i);
        }
        function o() {
            const {thumbs: e} = t.params;
            if (r) return !1;
            r = !0;
            const s = t.constructor;
            if (e.swiper instanceof s) t.thumbs.swiper = e.swiper, Object.assign(t.thumbs.swiper.originalParams, {
                watchSlidesProgress: !0,
                slideToClickedSlide: !1
            }), Object.assign(t.thumbs.swiper.params, {
                watchSlidesProgress: !0,
                slideToClickedSlide: !1
            }), t.thumbs.swiper.update(); else if (c(e.swiper)) {
                const a = Object.assign({}, e.swiper);
                Object.assign(a, {
                    watchSlidesProgress: !0,
                    slideToClickedSlide: !1
                }), t.thumbs.swiper = new s(a), n = !0;
            }
            return t.thumbs.swiper.el.classList.add(t.params.thumbs.thumbsContainerClass), t.thumbs.swiper.on("tap", l), 
            !0;
        }
        function d(e) {
            const s = t.thumbs.swiper;
            if (!s || s.destroyed) return;
            const a = "auto" === s.params.slidesPerView ? s.slidesPerViewDynamic() : s.params.slidesPerView;
            let i = 1;
            const r = t.params.thumbs.slideThumbActiveClass;
            if (t.params.slidesPerView > 1 && !t.params.centeredSlides && (i = t.params.slidesPerView), 
            t.params.thumbs.multipleActiveThumbs || (i = 1), i = Math.floor(i), s.slides.forEach(e => e.classList.remove(r)), 
            s.params.loop || s.params.virtual && s.params.virtual.enabled) for (let e = 0; e < i; e += 1) f(s.slidesEl, `[data-swiper-slide-index="${t.realIndex + e}"]`).forEach(e => {
                e.classList.add(r);
            }); else for (let e = 0; e < i; e += 1) s.slides[t.realIndex + e] && s.slides[t.realIndex + e].classList.add(r);
            const n = t.params.thumbs.autoScrollOffset, l = n && !s.params.loop;
            if (t.realIndex !== s.realIndex || l) {
                const i = s.activeIndex;
                let r, o;
                if (s.params.loop) {
                    const e = s.slides.filter(e => e.getAttribute("data-swiper-slide-index") === `${t.realIndex}`)[0];
                    r = s.slides.indexOf(e), o = t.activeIndex > t.previousIndex ? "next" : "prev";
                } else r = t.realIndex, o = r > t.previousIndex ? "next" : "prev";
                l && (r += "next" === o ? n : -1 * n), s.visibleSlidesIndexes && s.visibleSlidesIndexes.indexOf(r) < 0 && (s.params.centeredSlides ? r = r > i ? r - Math.floor(a / 2) + 1 : r + Math.floor(a / 2) - 1 : r > i && s.params.slidesPerGroup, 
                s.slideTo(r, e ? 0 : void 0));
            }
        }
        t.thumbs = {
            swiper: null
        }, i("beforeInit", () => {
            const {thumbs: e} = t.params;
            if (e && e.swiper) if ("string" == typeof e.swiper || e.swiper instanceof HTMLElement) {
                const s = a(), i = () => {
                    const a = "string" == typeof e.swiper ? s.querySelector(e.swiper) : e.swiper;
                    if (a && a.swiper) e.swiper = a.swiper, o(), d(!0); else if (a) {
                        const s = `${t.params.eventsPrefix}init`, i = r => {
                            e.swiper = r.detail[0], a.removeEventListener(s, i), o(), d(!0), e.swiper.update(), 
                            t.update();
                        };
                        a.addEventListener(s, i);
                    }
                    return a;
                }, r = () => {
                    if (t.destroyed) return;
                    i() || requestAnimationFrame(r);
                };
                requestAnimationFrame(r);
            } else o(), d(!0);
        }), i("slideChange update resize observerUpdate", () => {
            d();
        }), i("setTransition", (e, s) => {
            const a = t.thumbs.swiper;
            a && !a.destroyed && a.setTransition(s);
        }), i("beforeDestroy", () => {
            const e = t.thumbs.swiper;
            e && !e.destroyed && n && e.destroy();
        }), Object.assign(t.thumbs, {
            init: o,
            update: d
        });
    }, function(e) {
        let {swiper: t, extendParams: s, emit: a, once: i} = e;
        s({
            freeMode: {
                enabled: !1,
                momentum: !0,
                momentumRatio: 1,
                momentumBounce: !0,
                momentumBounceRatio: 1,
                momentumVelocityRatio: 1,
                sticky: !1,
                minimumVelocity: .02
            }
        }), Object.assign(t, {
            freeMode: {
                onTouchStart: function() {
                    if (t.params.cssMode) return;
                    const e = t.getTranslate();
                    t.setTranslate(e), t.setTransition(0), t.touchEventsData.velocities.length = 0, 
                    t.freeMode.onTouchEnd({
                        currentPos: t.rtl ? t.translate : -t.translate
                    });
                },
                onTouchMove: function() {
                    if (t.params.cssMode) return;
                    const {touchEventsData: e, touches: s} = t;
                    0 === e.velocities.length && e.velocities.push({
                        position: s[t.isHorizontal() ? "startX" : "startY"],
                        time: e.touchStartTime
                    }), e.velocities.push({
                        position: s[t.isHorizontal() ? "currentX" : "currentY"],
                        time: o()
                    });
                },
                onTouchEnd: function(e) {
                    let {currentPos: s} = e;
                    if (t.params.cssMode) return;
                    const {params: r, wrapperEl: n, rtlTranslate: l, snapGrid: d, touchEventsData: c} = t, p = o() - c.touchStartTime;
                    if (s < -t.minTranslate()) t.slideTo(t.activeIndex); else if (s > -t.maxTranslate()) t.slides.length < d.length ? t.slideTo(d.length - 1) : t.slideTo(t.slides.length - 1); else {
                        if (r.freeMode.momentum) {
                            if (c.velocities.length > 1) {
                                const e = c.velocities.pop(), s = c.velocities.pop(), a = e.position - s.position, i = e.time - s.time;
                                t.velocity = a / i, t.velocity /= 2, Math.abs(t.velocity) < r.freeMode.minimumVelocity && (t.velocity = 0), 
                                (i > 150 || o() - e.time > 300) && (t.velocity = 0);
                            } else t.velocity = 0;
                            t.velocity *= r.freeMode.momentumVelocityRatio, c.velocities.length = 0;
                            let e = 1e3 * r.freeMode.momentumRatio;
                            const s = t.velocity * e;
                            let p = t.translate + s;
                            l && (p = -p);
                            let u, m = !1;
                            const h = 20 * Math.abs(t.velocity) * r.freeMode.momentumBounceRatio;
                            let f;
                            if (p < t.maxTranslate()) r.freeMode.momentumBounce ? (p + t.maxTranslate() < -h && (p = t.maxTranslate() - h), 
                            u = t.maxTranslate(), m = !0, c.allowMomentumBounce = !0) : p = t.maxTranslate(), 
                            r.loop && r.centeredSlides && (f = !0); else if (p > t.minTranslate()) r.freeMode.momentumBounce ? (p - t.minTranslate() > h && (p = t.minTranslate() + h), 
                            u = t.minTranslate(), m = !0, c.allowMomentumBounce = !0) : p = t.minTranslate(), 
                            r.loop && r.centeredSlides && (f = !0); else if (r.freeMode.sticky) {
                                let e;
                                for (let t = 0; t < d.length; t += 1) if (d[t] > -p) {
                                    e = t;
                                    break;
                                }
                                p = Math.abs(d[e] - p) < Math.abs(d[e - 1] - p) || "next" === t.swipeDirection ? d[e] : d[e - 1], 
                                p = -p;
                            }
                            if (f && i("transitionEnd", () => {
                                t.loopFix();
                            }), 0 !== t.velocity) {
                                if (e = l ? Math.abs((-p - t.translate) / t.velocity) : Math.abs((p - t.translate) / t.velocity), 
                                r.freeMode.sticky) {
                                    const s = Math.abs((l ? -p : p) - t.translate), a = t.slidesSizesGrid[t.activeIndex];
                                    e = s < a ? r.speed : s < 2 * a ? 1.5 * r.speed : 2.5 * r.speed;
                                }
                            } else if (r.freeMode.sticky) return void t.slideToClosest();
                            r.freeMode.momentumBounce && m ? (t.updateProgress(u), t.setTransition(e), t.setTranslate(p), 
                            t.transitionStart(!0, t.swipeDirection), t.animating = !0, x(n, () => {
                                t && !t.destroyed && c.allowMomentumBounce && (a("momentumBounce"), t.setTransition(r.speed), 
                                setTimeout(() => {
                                    t.setTranslate(u), x(n, () => {
                                        t && !t.destroyed && t.transitionEnd();
                                    });
                                }, 0));
                            })) : t.velocity ? (a("_freeModeNoMomentumRelease"), t.updateProgress(p), t.setTransition(e), 
                            t.setTranslate(p), t.transitionStart(!0, t.swipeDirection), t.animating || (t.animating = !0, 
                            x(n, () => {
                                t && !t.destroyed && t.transitionEnd();
                            }))) : t.updateProgress(p), t.updateActiveIndex(), t.updateSlidesClasses();
                        } else {
                            if (r.freeMode.sticky) return void t.slideToClosest();
                            r.freeMode && a("_freeModeNoMomentumRelease");
                        }
                        (!r.freeMode.momentum || p >= r.longSwipesMs) && (a("_freeModeStaticRelease"), t.updateProgress(), 
                        t.updateActiveIndex(), t.updateSlidesClasses());
                    }
                }
            }
        });
    }, function(e) {
        let t, s, a, i, {swiper: r, extendParams: n, on: l} = e;
        n({
            grid: {
                rows: 1,
                fill: "column"
            }
        });
        const o = () => {
            let e = r.params.spaceBetween;
            return "string" == typeof e && e.indexOf("%") >= 0 ? e = parseFloat(e.replace("%", "")) / 100 * r.size : "string" == typeof e && (e = parseFloat(e)), 
            e;
        };
        l("init", () => {
            i = r.params.grid && r.params.grid.rows > 1;
        }), l("update", () => {
            const {params: e, el: t} = r, s = e.grid && e.grid.rows > 1;
            i && !s ? (t.classList.remove(`${e.containerModifierClass}grid`, `${e.containerModifierClass}grid-column`), 
            a = 1, r.emitContainerClasses()) : !i && s && (t.classList.add(`${e.containerModifierClass}grid`), 
            "column" === e.grid.fill && t.classList.add(`${e.containerModifierClass}grid-column`), 
            r.emitContainerClasses()), i = s;
        }), r.grid = {
            initSlides: e => {
                const {slidesPerView: i} = r.params, {rows: n, fill: l} = r.params.grid, o = r.virtual && r.params.virtual.enabled ? r.virtual.slides.length : e.length;
                a = Math.floor(o / n), t = Math.floor(o / n) === o / n ? o : Math.ceil(o / n) * n, 
                "auto" !== i && "row" === l && (t = Math.max(t, i * n)), s = t / n;
            },
            unsetSlides: () => {
                r.slides && r.slides.forEach(e => {
                    e.swiperSlideGridSet && (e.style.height = "", e.style[r.getDirectionLabel("margin-top")] = "");
                });
            },
            updateSlide: (e, i, n) => {
                const {slidesPerGroup: l} = r.params, d = o(), {rows: c, fill: p} = r.params.grid, u = r.virtual && r.params.virtual.enabled ? r.virtual.slides.length : n.length;
                let m, h, f;
                if ("row" === p && l > 1) {
                    const s = Math.floor(e / (l * c)), a = e - c * l * s, r = 0 === s ? l : Math.min(Math.ceil((u - s * c * l) / c), l);
                    f = Math.floor(a / r), h = a - f * r + s * l, m = h + f * t / c, i.style.order = m;
                } else "column" === p ? (h = Math.floor(e / c), f = e - h * c, (h > a || h === a && f === c - 1) && (f += 1, 
                f >= c && (f = 0, h += 1))) : (f = Math.floor(e / s), h = e - f * s);
                i.row = f, i.column = h, i.style.height = `calc((100% - ${(c - 1) * d}px) / ${c})`, 
                i.style[r.getDirectionLabel("margin-top")] = 0 !== f ? d && `${d}px` : "", i.swiperSlideGridSet = !0;
            },
            updateWrapperSize: (e, s) => {
                const {centeredSlides: a, roundLengths: i} = r.params, n = o(), {rows: l} = r.params.grid;
                if (r.virtualSize = (e + n) * t, r.virtualSize = Math.ceil(r.virtualSize / l) - n, 
                r.params.cssMode || (r.wrapperEl.style[r.getDirectionLabel("width")] = `${r.virtualSize + n}px`), 
                a) {
                    const e = [];
                    for (let t = 0; t < s.length; t += 1) {
                        let a = s[t];
                        i && (a = Math.floor(a)), s[t] < r.virtualSize + s[0] && e.push(a);
                    }
                    s.splice(0, s.length), s.push(...e);
                }
            }
        };
    }, function(e) {
        let {swiper: t} = e;
        Object.assign(t, {
            appendSlide: le.bind(t),
            prependSlide: oe.bind(t),
            addSlide: de.bind(t),
            removeSlide: ce.bind(t),
            removeAllSlides: pe.bind(t)
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a} = e;
        s({
            fadeEffect: {
                crossFade: !1
            }
        }), ue({
            effect: "fade",
            swiper: t,
            on: a,
            setTranslate: () => {
                const {slides: e} = t;
                t.params.fadeEffect;
                for (let s = 0; s < e.length; s += 1) {
                    const e = t.slides[s];
                    let a = -e.swiperSlideOffset;
                    t.params.virtualTranslate || (a -= t.translate);
                    let i = 0;
                    t.isHorizontal() || (i = a, a = 0);
                    const r = t.params.fadeEffect.crossFade ? Math.max(1 - Math.abs(e.progress), 0) : 1 + Math.min(Math.max(e.progress, -1), 0), n = me(0, e);
                    n.style.opacity = r, n.style.transform = `translate3d(${a}px, ${i}px, 0px)`;
                }
            },
            setTransition: e => {
                const s = t.slides.map(e => h(e));
                s.forEach(t => {
                    t.style.transitionDuration = `${e}ms`;
                }), he({
                    swiper: t,
                    duration: e,
                    transformElements: s,
                    allSlides: !0
                });
            },
            overwriteParams: () => ({
                slidesPerView: 1,
                slidesPerGroup: 1,
                watchSlidesProgress: !0,
                spaceBetween: 0,
                virtualTranslate: !t.params.cssMode
            })
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a} = e;
        s({
            cubeEffect: {
                slideShadows: !0,
                shadow: !0,
                shadowOffset: 20,
                shadowScale: .94
            }
        });
        const i = (e, t, s) => {
            let a = s ? e.querySelector(".swiper-slide-shadow-left") : e.querySelector(".swiper-slide-shadow-top"), i = s ? e.querySelector(".swiper-slide-shadow-right") : e.querySelector(".swiper-slide-shadow-bottom");
            a || (a = v("div", ("swiper-slide-shadow-cube swiper-slide-shadow-" + (s ? "left" : "top")).split(" ")), 
            e.append(a)), i || (i = v("div", ("swiper-slide-shadow-cube swiper-slide-shadow-" + (s ? "right" : "bottom")).split(" ")), 
            e.append(i)), a && (a.style.opacity = Math.max(-t, 0)), i && (i.style.opacity = Math.max(t, 0));
        };
        ue({
            effect: "cube",
            swiper: t,
            on: a,
            setTranslate: () => {
                const {el: e, wrapperEl: s, slides: a, width: r, height: n, rtlTranslate: l, size: o, browser: d} = t, c = M(t), p = t.params.cubeEffect, u = t.isHorizontal(), m = t.virtual && t.params.virtual.enabled;
                let h, f = 0;
                p.shadow && (u ? (h = t.wrapperEl.querySelector(".swiper-cube-shadow"), h || (h = v("div", "swiper-cube-shadow"), 
                t.wrapperEl.append(h)), h.style.height = `${r}px`) : (h = e.querySelector(".swiper-cube-shadow"), 
                h || (h = v("div", "swiper-cube-shadow"), e.append(h))));
                for (let e = 0; e < a.length; e += 1) {
                    const t = a[e];
                    let s = e;
                    m && (s = parseInt(t.getAttribute("data-swiper-slide-index"), 10));
                    let r = 90 * s, n = Math.floor(r / 360);
                    l && (r = -r, n = Math.floor(-r / 360));
                    const d = Math.max(Math.min(t.progress, 1), -1);
                    let h = 0, g = 0, v = 0;
                    s % 4 == 0 ? (h = 4 * -n * o, v = 0) : (s - 1) % 4 == 0 ? (h = 0, v = 4 * -n * o) : (s - 2) % 4 == 0 ? (h = o + 4 * n * o, 
                    v = o) : (s - 3) % 4 == 0 && (h = -o, v = 3 * o + 4 * o * n), l && (h = -h), u || (g = h, 
                    h = 0);
                    const w = `rotateX(${c(u ? 0 : -r)}deg) rotateY(${c(u ? r : 0)}deg) translate3d(${h}px, ${g}px, ${v}px)`;
                    d <= 1 && d > -1 && (f = 90 * s + 90 * d, l && (f = 90 * -s - 90 * d)), t.style.transform = w, 
                    p.slideShadows && i(t, d, u);
                }
                if (s.style.transformOrigin = `50% 50% -${o / 2}px`, s.style["-webkit-transform-origin"] = `50% 50% -${o / 2}px`, 
                p.shadow) if (u) h.style.transform = `translate3d(0px, ${r / 2 + p.shadowOffset}px, ${-r / 2}px) rotateX(89.99deg) rotateZ(0deg) scale(${p.shadowScale})`; else {
                    const e = Math.abs(f) - 90 * Math.floor(Math.abs(f) / 90), t = 1.5 - (Math.sin(2 * e * Math.PI / 360) / 2 + Math.cos(2 * e * Math.PI / 360) / 2), s = p.shadowScale, a = p.shadowScale / t, i = p.shadowOffset;
                    h.style.transform = `scale3d(${s}, 1, ${a}) translate3d(0px, ${n / 2 + i}px, ${-n / 2 / a}px) rotateX(-89.99deg)`;
                }
                const g = (d.isSafari || d.isWebView) && d.needPerspectiveFix ? -o / 2 : 0;
                s.style.transform = `translate3d(0px,0,${g}px) rotateX(${c(t.isHorizontal() ? 0 : f)}deg) rotateY(${c(t.isHorizontal() ? -f : 0)}deg)`, 
                s.style.setProperty("--swiper-cube-translate-z", `${g}px`);
            },
            setTransition: e => {
                const {el: s, slides: a} = t;
                if (a.forEach(t => {
                    t.style.transitionDuration = `${e}ms`, t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach(t => {
                        t.style.transitionDuration = `${e}ms`;
                    });
                }), t.params.cubeEffect.shadow && !t.isHorizontal()) {
                    const t = s.querySelector(".swiper-cube-shadow");
                    t && (t.style.transitionDuration = `${e}ms`);
                }
            },
            recreateShadows: () => {
                const e = t.isHorizontal();
                t.slides.forEach(t => {
                    const s = Math.max(Math.min(t.progress, 1), -1);
                    i(t, s, e);
                });
            },
            getEffectParams: () => t.params.cubeEffect,
            perspective: () => !0,
            overwriteParams: () => ({
                slidesPerView: 1,
                slidesPerGroup: 1,
                watchSlidesProgress: !0,
                resistanceRatio: 0,
                spaceBetween: 0,
                centeredSlides: !1,
                virtualTranslate: !0
            })
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a} = e;
        s({
            flipEffect: {
                slideShadows: !0,
                limitRotation: !0
            }
        });
        const i = (e, s) => {
            let a = t.isHorizontal() ? e.querySelector(".swiper-slide-shadow-left") : e.querySelector(".swiper-slide-shadow-top"), i = t.isHorizontal() ? e.querySelector(".swiper-slide-shadow-right") : e.querySelector(".swiper-slide-shadow-bottom");
            a || (a = fe("flip", e, t.isHorizontal() ? "left" : "top")), i || (i = fe("flip", e, t.isHorizontal() ? "right" : "bottom")), 
            a && (a.style.opacity = Math.max(-s, 0)), i && (i.style.opacity = Math.max(s, 0));
        };
        ue({
            effect: "flip",
            swiper: t,
            on: a,
            setTranslate: () => {
                const {slides: e, rtlTranslate: s} = t, a = t.params.flipEffect, r = M(t);
                for (let n = 0; n < e.length; n += 1) {
                    const l = e[n];
                    let o = l.progress;
                    t.params.flipEffect.limitRotation && (o = Math.max(Math.min(l.progress, 1), -1));
                    const d = l.swiperSlideOffset;
                    let c = -180 * o, p = 0, u = t.params.cssMode ? -d - t.translate : -d, m = 0;
                    t.isHorizontal() ? s && (c = -c) : (m = u, u = 0, p = -c, c = 0), l.style.zIndex = -Math.abs(Math.round(o)) + e.length, 
                    a.slideShadows && i(l, o);
                    const h = `translate3d(${u}px, ${m}px, 0px) rotateX(${r(p)}deg) rotateY(${r(c)}deg)`;
                    me(0, l).style.transform = h;
                }
            },
            setTransition: e => {
                const s = t.slides.map(e => h(e));
                s.forEach(t => {
                    t.style.transitionDuration = `${e}ms`, t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach(t => {
                        t.style.transitionDuration = `${e}ms`;
                    });
                }), he({
                    swiper: t,
                    duration: e,
                    transformElements: s
                });
            },
            recreateShadows: () => {
                t.params.flipEffect, t.slides.forEach(e => {
                    let s = e.progress;
                    t.params.flipEffect.limitRotation && (s = Math.max(Math.min(e.progress, 1), -1)), 
                    i(e, s);
                });
            },
            getEffectParams: () => t.params.flipEffect,
            perspective: () => !0,
            overwriteParams: () => ({
                slidesPerView: 1,
                slidesPerGroup: 1,
                watchSlidesProgress: !0,
                spaceBetween: 0,
                virtualTranslate: !t.params.cssMode
            })
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a} = e;
        s({
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                scale: 1,
                modifier: 1,
                slideShadows: !0
            }
        }), ue({
            effect: "coverflow",
            swiper: t,
            on: a,
            setTranslate: () => {
                const {width: e, height: s, slides: a, slidesSizesGrid: i} = t, r = t.params.coverflowEffect, n = t.isHorizontal(), l = t.translate, o = n ? e / 2 - l : s / 2 - l, d = n ? r.rotate : -r.rotate, c = r.depth, p = M(t);
                for (let e = 0, t = a.length; e < t; e += 1) {
                    const t = a[e], s = i[e], l = (o - t.swiperSlideOffset - s / 2) / s, u = "function" == typeof r.modifier ? r.modifier(l) : l * r.modifier;
                    let m = n ? d * u : 0, h = n ? 0 : d * u, f = -c * Math.abs(u), g = r.stretch;
                    "string" == typeof g && -1 !== g.indexOf("%") && (g = parseFloat(r.stretch) / 100 * s);
                    let v = n ? 0 : g * u, w = n ? g * u : 0, b = 1 - (1 - r.scale) * Math.abs(u);
                    Math.abs(w) < .001 && (w = 0), Math.abs(v) < .001 && (v = 0), Math.abs(f) < .001 && (f = 0), 
                    Math.abs(m) < .001 && (m = 0), Math.abs(h) < .001 && (h = 0), Math.abs(b) < .001 && (b = 0);
                    const y = `translate3d(${w}px,${v}px,${f}px)  rotateX(${p(h)}deg) rotateY(${p(m)}deg) scale(${b})`;
                    if (me(0, t).style.transform = y, t.style.zIndex = 1 - Math.abs(Math.round(u)), 
                    r.slideShadows) {
                        let e = n ? t.querySelector(".swiper-slide-shadow-left") : t.querySelector(".swiper-slide-shadow-top"), s = n ? t.querySelector(".swiper-slide-shadow-right") : t.querySelector(".swiper-slide-shadow-bottom");
                        e || (e = fe("coverflow", t, n ? "left" : "top")), s || (s = fe("coverflow", t, n ? "right" : "bottom")), 
                        e && (e.style.opacity = u > 0 ? u : 0), s && (s.style.opacity = -u > 0 ? -u : 0);
                    }
                }
            },
            setTransition: e => {
                t.slides.map(e => h(e)).forEach(t => {
                    t.style.transitionDuration = `${e}ms`, t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach(t => {
                        t.style.transitionDuration = `${e}ms`;
                    });
                });
            },
            perspective: () => !0,
            overwriteParams: () => ({
                watchSlidesProgress: !0
            })
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a} = e;
        s({
            creativeEffect: {
                limitProgress: 1,
                shadowPerProgress: !1,
                progressMultiplier: 1,
                perspective: !0,
                prev: {
                    translate: [ 0, 0, 0 ],
                    rotate: [ 0, 0, 0 ],
                    opacity: 1,
                    scale: 1
                },
                next: {
                    translate: [ 0, 0, 0 ],
                    rotate: [ 0, 0, 0 ],
                    opacity: 1,
                    scale: 1
                }
            }
        });
        const i = e => "string" == typeof e ? e : `${e}px`;
        ue({
            effect: "creative",
            swiper: t,
            on: a,
            setTranslate: () => {
                const {slides: e, wrapperEl: s, slidesSizesGrid: a} = t, r = t.params.creativeEffect, {progressMultiplier: n} = r, l = t.params.centeredSlides, o = M(t);
                if (l) {
                    const e = a[0] / 2 - t.params.slidesOffsetBefore || 0;
                    s.style.transform = `translateX(calc(50% - ${e}px))`;
                }
                for (let s = 0; s < e.length; s += 1) {
                    const a = e[s], d = a.progress, c = Math.min(Math.max(a.progress, -r.limitProgress), r.limitProgress);
                    let p = c;
                    l || (p = Math.min(Math.max(a.originalProgress, -r.limitProgress), r.limitProgress));
                    const u = a.swiperSlideOffset, m = [ t.params.cssMode ? -u - t.translate : -u, 0, 0 ], h = [ 0, 0, 0 ];
                    let f = !1;
                    t.isHorizontal() || (m[1] = m[0], m[0] = 0);
                    let g = {
                        translate: [ 0, 0, 0 ],
                        rotate: [ 0, 0, 0 ],
                        scale: 1,
                        opacity: 1
                    };
                    c < 0 ? (g = r.next, f = !0) : c > 0 && (g = r.prev, f = !0), m.forEach((e, t) => {
                        m[t] = `calc(${e}px + (${i(g.translate[t])} * ${Math.abs(c * n)}))`;
                    }), h.forEach((e, t) => {
                        let s = g.rotate[t] * Math.abs(c * n);
                        h[t] = s;
                    }), a.style.zIndex = -Math.abs(Math.round(d)) + e.length;
                    const v = m.join(", "), w = `rotateX(${o(h[0])}deg) rotateY(${o(h[1])}deg) rotateZ(${o(h[2])}deg)`, b = p < 0 ? `scale(${1 + (1 - g.scale) * p * n})` : `scale(${1 - (1 - g.scale) * p * n})`, y = p < 0 ? 1 + (1 - g.opacity) * p * n : 1 - (1 - g.opacity) * p * n, E = `translate3d(${v}) ${w} ${b}`;
                    if (f && g.shadow || !f) {
                        let e = a.querySelector(".swiper-slide-shadow");
                        if (!e && g.shadow && (e = fe("creative", a)), e) {
                            const t = r.shadowPerProgress ? c * (1 / r.limitProgress) : c;
                            e.style.opacity = Math.min(Math.max(Math.abs(t), 0), 1);
                        }
                    }
                    const x = me(0, a);
                    x.style.transform = E, x.style.opacity = y, g.origin && (x.style.transformOrigin = g.origin);
                }
            },
            setTransition: e => {
                const s = t.slides.map(e => h(e));
                s.forEach(t => {
                    t.style.transitionDuration = `${e}ms`, t.querySelectorAll(".swiper-slide-shadow").forEach(t => {
                        t.style.transitionDuration = `${e}ms`;
                    });
                }), he({
                    swiper: t,
                    duration: e,
                    transformElements: s,
                    allSlides: !0
                });
            },
            perspective: () => t.params.creativeEffect.perspective,
            overwriteParams: () => ({
                watchSlidesProgress: !0,
                virtualTranslate: !t.params.cssMode
            })
        });
    }, function(e) {
        let {swiper: t, extendParams: s, on: a} = e;
        s({
            cardsEffect: {
                slideShadows: !0,
                rotate: !0,
                perSlideRotate: 2,
                perSlideOffset: 8
            }
        }), ue({
            effect: "cards",
            swiper: t,
            on: a,
            setTranslate: () => {
                const {slides: e, activeIndex: s, rtlTranslate: a} = t, i = t.params.cardsEffect, {startTranslate: r, isTouched: n} = t.touchEventsData, l = a ? -t.translate : t.translate;
                for (let o = 0; o < e.length; o += 1) {
                    const d = e[o], c = d.progress, p = Math.min(Math.max(c, -4), 4);
                    let u = d.swiperSlideOffset;
                    t.params.centeredSlides && !t.params.cssMode && (t.wrapperEl.style.transform = `translateX(${t.minTranslate()}px)`), 
                    t.params.centeredSlides && t.params.cssMode && (u -= e[0].swiperSlideOffset);
                    let m = t.params.cssMode ? -u - t.translate : -u, h = 0;
                    const f = -100 * Math.abs(p);
                    let g = 1, v = -i.perSlideRotate * p, w = i.perSlideOffset - .75 * Math.abs(p);
                    const b = t.virtual && t.params.virtual.enabled ? t.virtual.from + o : o, y = (b === s || b === s - 1) && p > 0 && p < 1 && (n || t.params.cssMode) && l < r, E = (b === s || b === s + 1) && p < 0 && p > -1 && (n || t.params.cssMode) && l > r;
                    if (y || E) {
                        const e = (1 - Math.abs((Math.abs(p) - .5) / .5)) ** .5;
                        v += -28 * p * e, g += -.5 * e, w += 96 * e, h = -25 * e * Math.abs(p) + "%";
                    }
                    if (m = p < 0 ? `calc(${m}px ${a ? "-" : "+"} (${w * Math.abs(p)}%))` : p > 0 ? `calc(${m}px ${a ? "-" : "+"} (-${w * Math.abs(p)}%))` : `${m}px`, 
                    !t.isHorizontal()) {
                        const e = h;
                        h = m, m = e;
                    }
                    const x = p < 0 ? "" + (1 + (1 - g) * p) : "" + (1 - (1 - g) * p), S = `\n        translate3d(${m}, ${h}, ${f}px)\n        rotateZ(${i.rotate ? a ? -v : v : 0}deg)\n        scale(${x})\n      `;
                    if (i.slideShadows) {
                        let e = d.querySelector(".swiper-slide-shadow");
                        e || (e = fe("cards", d)), e && (e.style.opacity = Math.min(Math.max((Math.abs(p) - .5) / .5, 0), 1));
                    }
                    d.style.zIndex = -Math.abs(Math.round(c)) + e.length;
                    me(0, d).style.transform = S;
                }
            },
            setTransition: e => {
                const s = t.slides.map(e => h(e));
                s.forEach(t => {
                    t.style.transitionDuration = `${e}ms`, t.querySelectorAll(".swiper-slide-shadow").forEach(t => {
                        t.style.transitionDuration = `${e}ms`;
                    });
                }), he({
                    swiper: t,
                    duration: e,
                    transformElements: s
                });
            },
            perspective: () => !0,
            overwriteParams: () => ({
                watchSlidesProgress: !0,
                virtualTranslate: !t.params.cssMode
            })
        });
    } ];
    return ie.use(ge), ie;
}();

(function() {
    "use strict";
    // const slider = new Swiper(".mySwiper", {
    //   pagination: {
    //     el: ".swiper-pagination",
    //   },
    // });
        function mainNavigation() {
        const navigation = new Navigation(document.getElementById("navigation"), {});
    }
    function heroSlider() {
        if (document.querySelector(".hero-slider")) {
            const swiper = new Swiper(".hero-slider .swiper", {
                loop: true,
                autoplay: {
                    delay: 2500,
                    disableOnInteraction: false
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true
                },
                navigation: {
                    nextEl: ".hero-slider .slider-button-next",
                    prevEl: ".hero-slider .slider-button-prev"
                }
            });
        }
    }
    // Önce Sonra Slider
        function onceSonraSlider() {
        if (document.querySelector(".once-sonra-slider")) {
            const slider = new Swiper(".once-sonra-slider .swiper", {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                navigation: {
                    nextEl: ".once-sonra-slider .slider-button-outline-next",
                    prevEl: ".once-sonra-slider .slider-button-outline-prev"
                },
                breakpoints: {
                    768: {
                        slidesPerView: 2
                    },
                    992: {
                        slidesPerView: 3
                    }
                }
            });
        }
    }
    // Intl Tel Input
        function telefonInput() {
        const input = document.querySelector("#phone");
        window.intlTelInput(input, {
            // allowDropdown: false,
            // autoPlaceholder: "off",
            // containerClass: "test",
            // countryOrder: ["jp", "kr"],
            // customPlaceholder: function(selectedCountryPlaceholder, selectedCountryData) {
            //   return "e.g. " + selectedCountryPlaceholder;
            // },
            // dropdownContainer: document.querySelector('#custom-container'),
            // excludeCountries: ["us"],
            // fixDropdownWidth: false,
            // formatAsYouType: false,
            // formatOnDisplay: false,
            // geoIpLookup: function(callback) {
            //   fetch("https://ipapi.co/json")
            //     .then(function(res) { return res.json(); })
            //     .then(function(data) { callback(data.country_code); })
            //     .catch(function() { callback(); });
            // },
            // hiddenInput: () => "phone_full",
            // i18n: { 'de': 'Deutschland' },
            initialCountry: "us",
            // nationalMode: false,
            // onlyCountries: ['us', 'gb', 'ch', 'ca', 'do'],
            // placeholderNumberType: "MOBILE",
            // showFlags: false,
            // separateDialCode: true,
            // strictMode: true,
            // useFullscreenPopup: true,
            utilsScript: "./utils.js"
        });
    }
    // Scroll top Button
        function scrollTop() {
        const btnScrollTop = document.getElementById("scrollTop");
        document.addEventListener("scroll", () => {
            if (window.scrollY > 1e3) {
                btnScrollTop.classList.remove("hide-btn");
            } else {
                btnScrollTop.classList.add("hide-btn");
            }
        });
        btnScrollTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
    mainNavigation();
    heroSlider();
    // telefonInput()
    // onceSonraSlider()
    // videoSlider()
    // videoSayfaSlider()
    // deneyimSlider()
    // initAcc('.accordion.v1', true);
    // uygulamalarSlider()
    // scrollTop()
})();//# sourceMappingURL=script.js.map

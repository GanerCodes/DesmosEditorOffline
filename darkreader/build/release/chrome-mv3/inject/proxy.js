(function () {
    "use strict";

    function injectProxy(enableStyleSheetsProxy) {
        document.dispatchEvent(
            new CustomEvent("__darkreader__inlineScriptsAllowed")
        );
        const addRuleDescriptor = Object.getOwnPropertyDescriptor(
            CSSStyleSheet.prototype,
            "addRule"
        );
        const insertRuleDescriptor = Object.getOwnPropertyDescriptor(
            CSSStyleSheet.prototype,
            "insertRule"
        );
        const deleteRuleDescriptor = Object.getOwnPropertyDescriptor(
            CSSStyleSheet.prototype,
            "deleteRule"
        );
        const removeRuleDescriptor = Object.getOwnPropertyDescriptor(
            CSSStyleSheet.prototype,
            "removeRule"
        );
        const documentStyleSheetsDescriptor = enableStyleSheetsProxy
            ? Object.getOwnPropertyDescriptor(Document.prototype, "styleSheets")
            : null;
        const shouldWrapHTMLElement = [
            "baidu.com",
            "baike.baidu.com",
            "ditu.baidu.com",
            "map.baidu.com",
            "maps.baidu.com",
            "haokan.baidu.com",
            "pan.baidu.com",
            "passport.baidu.com",
            "tieba.baidu.com",
            "www.baidu.com"
        ].includes(location.hostname);
        const getElementsByTagNameDescriptor = shouldWrapHTMLElement
            ? Object.getOwnPropertyDescriptor(
                  Element.prototype,
                  "getElementsByTagName"
              )
            : null;
        const shouldProxyChildNodes = location.hostname === "www.vy.no";
        const childNodesDescriptor = shouldProxyChildNodes
            ? Object.getOwnPropertyDescriptor(Node.prototype, "childNodes")
            : null;
        const cleanUp = () => {
            Object.defineProperty(
                CSSStyleSheet.prototype,
                "addRule",
                addRuleDescriptor
            );
            Object.defineProperty(
                CSSStyleSheet.prototype,
                "insertRule",
                insertRuleDescriptor
            );
            Object.defineProperty(
                CSSStyleSheet.prototype,
                "deleteRule",
                deleteRuleDescriptor
            );
            Object.defineProperty(
                CSSStyleSheet.prototype,
                "removeRule",
                removeRuleDescriptor
            );
            document.removeEventListener("__darkreader__cleanUp", cleanUp);
            document.removeEventListener(
                "__darkreader__addUndefinedResolver",
                addUndefinedResolver
            );
            if (enableStyleSheetsProxy) {
                Object.defineProperty(
                    Document.prototype,
                    "styleSheets",
                    documentStyleSheetsDescriptor
                );
            }
            if (shouldWrapHTMLElement) {
                Object.defineProperty(
                    Element.prototype,
                    "getElementsByTagName",
                    getElementsByTagNameDescriptor
                );
            }
            if (shouldProxyChildNodes) {
                Object.defineProperty(
                    Node.prototype,
                    "childNodes",
                    childNodesDescriptor
                );
            }
        };
        const addUndefinedResolver = (e) => {
            customElements.whenDefined(e.detail.tag).then(() => {
                document.dispatchEvent(
                    new CustomEvent("__darkreader__isDefined", {
                        detail: {tag: e.detail.tag}
                    })
                );
            });
        };
        document.addEventListener("__darkreader__cleanUp", cleanUp);
        document.addEventListener(
            "__darkreader__addUndefinedResolver",
            addUndefinedResolver
        );
        const updateSheetEvent = new Event("__darkreader__updateSheet");
        function proxyAddRule(selector, style, index) {
            addRuleDescriptor.value.call(this, selector, style, index);
            if (
                this.ownerNode &&
                !this.ownerNode.classList.contains("darkreader")
            ) {
                this.ownerNode.dispatchEvent(updateSheetEvent);
            }
            return -1;
        }
        function proxyInsertRule(rule, index) {
            const returnValue = insertRuleDescriptor.value.call(
                this,
                rule,
                index
            );
            if (
                this.ownerNode &&
                !this.ownerNode.classList.contains("darkreader")
            ) {
                this.ownerNode.dispatchEvent(updateSheetEvent);
            }
            return returnValue;
        }
        function proxyDeleteRule(index) {
            deleteRuleDescriptor.value.call(this, index);
            if (
                this.ownerNode &&
                !this.ownerNode.classList.contains("darkreader")
            ) {
                this.ownerNode.dispatchEvent(updateSheetEvent);
            }
        }
        function proxyRemoveRule(index) {
            removeRuleDescriptor.value.call(this, index);
            if (
                this.ownerNode &&
                !this.ownerNode.classList.contains("darkreader")
            ) {
                this.ownerNode.dispatchEvent(updateSheetEvent);
            }
        }
        function proxyDocumentStyleSheets() {
            const getCurrentValue = () => {
                const docSheets = documentStyleSheetsDescriptor.get.call(this);
                const filteredSheets = [...docSheets].filter((styleSheet) => {
                    return (
                        styleSheet.ownerNode &&
                        !styleSheet.ownerNode.classList.contains("darkreader")
                    );
                });
                filteredSheets.item = (item) => {
                    return filteredSheets[item];
                };
                return Object.setPrototypeOf(
                    filteredSheets,
                    StyleSheetList.prototype
                );
            };
            let elements = getCurrentValue();
            const styleSheetListBehavior = {
                get: function (_, property) {
                    return getCurrentValue()[property];
                }
            };
            elements = new Proxy(elements, styleSheetListBehavior);
            return elements;
        }
        function proxyGetElementsByTagName(tagName) {
            if (tagName !== "style") {
                return getElementsByTagNameDescriptor.value.call(this, tagName);
            }
            const getCurrentElementValue = () => {
                const elements = getElementsByTagNameDescriptor.value.call(
                    this,
                    tagName
                );
                return Object.setPrototypeOf(
                    [...elements].filter((element) => {
                        return !element.classList.contains("darkreader");
                    }),
                    NodeList.prototype
                );
            };
            let elements = getCurrentElementValue();
            const nodeListBehavior = {
                get: function (_, property) {
                    return getCurrentElementValue()[
                        Number(property) || property
                    ];
                }
            };
            elements = new Proxy(elements, nodeListBehavior);
            return elements;
        }
        function proxyChildNodes() {
            const childNodes = childNodesDescriptor.get.call(this);
            return Object.setPrototypeOf(
                [...childNodes].filter((element) => {
                    return (
                        !element.classList ||
                        !element.classList.contains("darkreader")
                    );
                }),
                NodeList.prototype
            );
        }
        Object.defineProperty(
            CSSStyleSheet.prototype,
            "addRule",
            Object.assign({}, addRuleDescriptor, {value: proxyAddRule})
        );
        Object.defineProperty(
            CSSStyleSheet.prototype,
            "insertRule",
            Object.assign({}, insertRuleDescriptor, {value: proxyInsertRule})
        );
        Object.defineProperty(
            CSSStyleSheet.prototype,
            "deleteRule",
            Object.assign({}, deleteRuleDescriptor, {value: proxyDeleteRule})
        );
        Object.defineProperty(
            CSSStyleSheet.prototype,
            "removeRule",
            Object.assign({}, removeRuleDescriptor, {value: proxyRemoveRule})
        );
        if (enableStyleSheetsProxy) {
            Object.defineProperty(
                Document.prototype,
                "styleSheets",
                Object.assign({}, documentStyleSheetsDescriptor, {
                    get: proxyDocumentStyleSheets
                })
            );
        }
        if (shouldWrapHTMLElement) {
            Object.defineProperty(
                Element.prototype,
                "getElementsByTagName",
                Object.assign({}, getElementsByTagNameDescriptor, {
                    value: proxyGetElementsByTagName
                })
            );
        }
        if (shouldProxyChildNodes) {
            Object.defineProperty(
                Node.prototype,
                "childNodes",
                Object.assign({}, childNodesDescriptor, {get: proxyChildNodes})
            );
        }
    }

    var MessageType;
    (function (MessageType) {
        MessageType["UI_GET_DATA"] = "ui-get-data";
        MessageType["UI_GET_DEVTOOLS_DATA"] = "ui-get-devtools-data";
        MessageType["UI_SUBSCRIBE_TO_CHANGES"] = "ui-subscribe-to-changes";
        MessageType["UI_UNSUBSCRIBE_FROM_CHANGES"] =
            "ui-unsubscribe-from-changes";
        MessageType["UI_CHANGE_SETTINGS"] = "ui-change-settings";
        MessageType["UI_SET_THEME"] = "ui-set-theme";
        MessageType["UI_TOGGLE_ACTIVE_TAB"] = "ui-toggle-active-tab";
        MessageType["UI_MARK_NEWS_AS_READ"] = "ui-mark-news-as-read";
        MessageType["UI_MARK_NEWS_AS_DISPLAYED"] = "ui-mark-news-as-displayed";
        MessageType["UI_LOAD_CONFIG"] = "ui-load-config";
        MessageType["UI_APPLY_DEV_DYNAMIC_THEME_FIXES"] =
            "ui-apply-dev-dynamic-theme-fixes";
        MessageType["UI_RESET_DEV_DYNAMIC_THEME_FIXES"] =
            "ui-reset-dev-dynamic-theme-fixes";
        MessageType["UI_APPLY_DEV_INVERSION_FIXES"] =
            "ui-apply-dev-inversion-fixes";
        MessageType["UI_RESET_DEV_INVERSION_FIXES"] =
            "ui-reset-dev-inversion-fixes";
        MessageType["UI_APPLY_DEV_STATIC_THEMES"] =
            "ui-apply-dev-static-themes";
        MessageType["UI_RESET_DEV_STATIC_THEMES"] =
            "ui-reset-dev-static-themes";
        MessageType["UI_SAVE_FILE"] = "ui-save-file";
        MessageType["UI_REQUEST_EXPORT_CSS"] = "ui-request-export-css";
        MessageType["UI_COLOR_SCHEME_CHANGE"] = "ui-color-scheme-change";
        MessageType["BG_CHANGES"] = "bg-changes";
        MessageType["BG_ADD_CSS_FILTER"] = "bg-add-css-filter";
        MessageType["BG_ADD_STATIC_THEME"] = "bg-add-static-theme";
        MessageType["BG_ADD_SVG_FILTER"] = "bg-add-svg-filter";
        MessageType["BG_ADD_DYNAMIC_THEME"] = "bg-add-dynamic-theme";
        MessageType["BG_EXPORT_CSS"] = "bg-export-css";
        MessageType["BG_UNSUPPORTED_SENDER"] = "bg-unsupported-sender";
        MessageType["BG_CLEAN_UP"] = "bg-clean-up";
        MessageType["BG_RELOAD"] = "bg-reload";
        MessageType["BG_FETCH_RESPONSE"] = "bg-fetch-response";
        MessageType["BG_UI_UPDATE"] = "bg-ui-update";
        MessageType["BG_CSS_UPDATE"] = "bg-css-update";
        MessageType["CS_COLOR_SCHEME_CHANGE"] = "cs-color-scheme-change";
        MessageType["CS_FRAME_CONNECT"] = "cs-frame-connect";
        MessageType["CS_FRAME_FORGET"] = "cs-frame-forget";
        MessageType["CS_FRAME_FREEZE"] = "cs-frame-freeze";
        MessageType["CS_FRAME_RESUME"] = "cs-frame-resume";
        MessageType["CS_EXPORT_CSS_RESPONSE"] = "cs-export-css-response";
        MessageType["CS_FETCH"] = "cs-fetch";
        MessageType["CS_DARK_THEME_DETECTED"] = "cs-dark-theme-detected";
        MessageType["CS_DARK_THEME_NOT_DETECTED"] =
            "cs-dark-theme-not-detected";
        MessageType["CS_LOG"] = "cs-log";
    })(MessageType || (MessageType = {}));

    function logInfo(...args) {}

    document.currentScript && document.currentScript.remove();
    const key = "darkreaderProxyInjected";
    const EVENT_DONE = "__darkreader__stylesheetProxy__done";
    const EVENT_ARG = "__darkreader__stylesheetProxy__arg";
    const registerdScriptPath = !document.currentScript;
    function injectProxyAndCleanup(arg) {
        injectProxy(arg);
        doneReceiver();
        document.dispatchEvent(new CustomEvent(EVENT_DONE));
    }
    function regularPath() {
        const argString = document.currentScript.dataset.arg;
        if (argString !== undefined) {
            document.documentElement.dataset[key] = "true";
            const arg = JSON.parse(argString);
            injectProxyAndCleanup(arg);
        }
    }
    function dataReceiver(e) {
        document.removeEventListener(EVENT_ARG, dataReceiver);
        if (document.documentElement.dataset[key] !== undefined) {
            return;
        }
        document.documentElement.dataset[key] = "true";
        logInfo(
            `MV3 proxy injector: ${
                registerdScriptPath ? "registerd" : "dedicated"
            } path runs injectProxy(${e.detail}).`
        );
        injectProxyAndCleanup(e.detail);
    }
    function doneReceiver() {
        document.removeEventListener(EVENT_ARG, dataReceiver);
        document.removeEventListener(EVENT_DONE, doneReceiver);
    }
    function dedicatedPath() {
        document.addEventListener(EVENT_ARG, dataReceiver);
        document.addEventListener(EVENT_DONE, doneReceiver);
    }
    function inject() {
        if (document.documentElement.dataset[key] !== undefined) {
            return;
        }
        document.currentScript && regularPath();
        dedicatedPath();
    }
    inject();
})();

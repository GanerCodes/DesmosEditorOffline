(function () {
    "use strict";

    const isNavigatorDefined = typeof navigator !== "undefined";
    const userAgent = isNavigatorDefined
        ? navigator.userAgentData &&
          Array.isArray(navigator.userAgentData.brands)
            ? navigator.userAgentData.brands
                  .map(
                      (brand) => `${brand.brand.toLowerCase()} ${brand.version}`
                  )
                  .join(" ")
            : navigator.userAgent.toLowerCase()
        : "some useragent";
    const platform = isNavigatorDefined
        ? navigator.userAgentData &&
          typeof navigator.userAgentData.platform === "string"
            ? navigator.userAgentData.platform.toLowerCase()
            : navigator.platform.toLowerCase()
        : "some platform";
    userAgent.includes("vivaldi");
    userAgent.includes("yabrowser");
    userAgent.includes("opr") || userAgent.includes("opera");
    userAgent.includes("edg");
    platform.startsWith("win");
    platform.startsWith("mac");
    isNavigatorDefined && navigator.userAgentData
        ? navigator.userAgentData.mobile
        : userAgent.includes("mobile");
    (isNavigatorDefined &&
        navigator.userAgentData &&
        ["Linux", "Android"].includes(navigator.userAgentData.platform)) ||
        platform.startsWith("linux");
    (() => {
        const m = userAgent.match(/chrom(?:e|ium)(?:\/| )([^ ]+)/);
        if (m && m[1]) {
            return m[1];
        }
        return "";
    })();
    (() => {
        const m = userAgent.match(/(?:firefox|librewolf)(?:\/| )([^ ]+)/);
        if (m && m[1]) {
            return m[1];
        }
        return "";
    })();
    (() => {
        try {
            document.querySelector(":defined");
            return true;
        } catch (err) {
            return false;
        }
    })();

    let query = null;
    const onChange = ({matches}) =>
        listeners.forEach((listener) => listener(matches));
    const listeners = new Set();
    function runColorSchemeChangeDetector(callback) {
        listeners.add(callback);
        if (query) {
            return;
        }
        query = matchMedia("(prefers-color-scheme: dark)");
        {
            query.addEventListener("change", onChange);
        }
    }
    function stopColorSchemeChangeDetector() {
        if (!query || !onChange) {
            return;
        }
        {
            query.removeEventListener("change", onChange);
        }
        listeners.clear();
        query = null;
    }
    const isSystemDarkModeEnabled = () =>
        (query || matchMedia("(prefers-color-scheme: dark)")).matches;

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

    let documentVisibilityListener = null;
    let documentIsVisible_ = !document.hidden;
    const listenerOptions = {
        capture: true,
        passive: true
    };
    function watchForDocumentVisibility() {
        document.addEventListener(
            "visibilitychange",
            documentVisibilityListener,
            listenerOptions
        );
        window.addEventListener(
            "pageshow",
            documentVisibilityListener,
            listenerOptions
        );
        window.addEventListener(
            "focus",
            documentVisibilityListener,
            listenerOptions
        );
    }
    function stopWatchingForDocumentVisibility() {
        document.removeEventListener(
            "visibilitychange",
            documentVisibilityListener,
            listenerOptions
        );
        window.removeEventListener(
            "pageshow",
            documentVisibilityListener,
            listenerOptions
        );
        window.removeEventListener(
            "focus",
            documentVisibilityListener,
            listenerOptions
        );
    }
    function setDocumentVisibilityListener(callback) {
        const alreadyWatching = Boolean(documentVisibilityListener);
        documentVisibilityListener = () => {
            if (!document.hidden) {
                removeDocumentVisibilityListener();
                callback();
                documentIsVisible_ = true;
            }
        };
        if (!alreadyWatching) {
            watchForDocumentVisibility();
        }
    }
    function removeDocumentVisibilityListener() {
        stopWatchingForDocumentVisibility();
        documentVisibilityListener = null;
    }
    function documentIsVisible() {
        return documentIsVisible_;
    }

    function cleanup() {
        stopColorSchemeChangeDetector();
        removeDocumentVisibilityListener();
    }
    function sendMessage(message) {
        const responseHandler = (response) => {
            if (response === "unsupportedSender") {
                cleanup();
            }
        };
        try {
            const promise = chrome.runtime.sendMessage(message);
            promise.then(responseHandler).catch(cleanup);
        } catch (error) {
            if (error.message === "Extension context invalidated.") {
                console.log(
                    "Dark Reader: instance of old CS detected, clening up."
                );
                cleanup();
            } else {
                console.log(
                    "Dark Reader: unexpected error during message passing."
                );
            }
        }
    }
    function notifyOfColorScheme(isDark) {
        sendMessage({type: MessageType.CS_COLOR_SCHEME_CHANGE, data: {isDark}});
    }
    function updateEventListeners() {
        notifyOfColorScheme(isSystemDarkModeEnabled());
        if (documentIsVisible()) {
            runColorSchemeChangeDetector(notifyOfColorScheme);
        } else {
            stopColorSchemeChangeDetector();
        }
    }
    setDocumentVisibilityListener(updateEventListeners);
    updateEventListeners();
})();

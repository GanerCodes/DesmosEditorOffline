const createTable = function(name, size) {
    size = Math.min(size, 12);
    return {
        "type": "table",
        "columns": [...Array(size).keys()].map(x => ({
            "latex": `Z_{${name}${x}}`,
            "hidden": true,
            "pointStyle": "POINT",
            "pointSize": "",
            "pointOpacity": "",
            "lineStyle": "SOLID",
            "lineWidth": "",
            "lineOpacity": "",
            "points": true,
            "lines": false,
            "dragMode": "NONE",
            "values": [...Array(size)].map(x => "0")}))};
}

const parseTableMacro = function(str) { // chatGPT
    const regex = /^T\s+([a-zA-Z0-9]+)\s+(\d+)$/;
    const match = regex.exec(str);
    
    if (match === null) return null;

    const name = match[1];
    const number = parseInt(match[2], 10);
    
    return { name, number };
}

const checkMacros = function() {
    const idx = Calc.selectedExpressionId;
    if(!idx) return;
    const state = Calc.getState();
    const exprs = state['expressions']['list'];
    let modId = -1;
    let lastExpr = null;
    for(let i = 0; i < exprs.length; i++) {
        const e = exprs[i];
        if(e['id'] == idx && e['type'] == "text" && e['text']) {
            const p = parseTableMacro(e['text']);
            if(p) {
                const table = createTable(p['name'], p['number']);
                table['id'] = e['id'];
                if(e['folderId']) table['folderId'] = e['folderId'];
                modId = e['id'];
                exprs[i] = table;
            }else if(e["text"] == "c") {
                if(lastExpr != null && lastExpr['type'] == "table") {
                    console.log(lastExpr);
                    exprs[i] = lastExpr;
                    modId = e['id'];
                }
            }
        }
        lastExpr = e;
    }
    state['expressions']['list'] = exprs;
    if(modId != -1) { // eeeee
        Calc.setBlank();
        Calc.setState(state);
        setTimeout(() => {
            document.querySelector(`[expr-id="${modId}"]`) .children[0].children[0].children[0].children[0].children[0].children[0].children[0].dispatchEvent(new Event("dcg-tapstart"));
        }, 100);
    }
}

function fixShortcuts() {
    $(document).keydown((e) => {
        e.superKey = e["originalEvent"].getModifierState("OS");

        const noMod = !e.ctrlKey && !e.shiftKey && !e.altKey && !e.superKey;
        const Ctrl = e.ctrlKey && !e.shiftKey && !e.altKey && !e.superKey;
        const Shift = !e.ctrlKey && e.shiftKey && !e.altKey && !e.superKey;
        const Alt = !e.ctrlKey && !e.shiftKey && e.altKey && !e.superKey;
        const Super = !e.ctrlKey && !e.shiftKey && !e.altKey && e.superKey;
        const CtrlShift = e.ctrlKey && e.shiftKey && !e.altKey && !e.superKey;
        const CtrlAlt = e.ctrlKey && !e.shiftKey && e.altKey && !e.superKey;
        const ShiftAlt = !e.ctrlKey && e.shiftKey && e.altKey && !e.superKey;
        const CtrlAltShift = e.ctrlKey && e.shiftKey && e.altKey && !e.superKey;
        
        if(Ctrl && e.code == "KeyM") {
            checkMacros();
            return;
        }
        
        // Close a dialog
        if (noMod && e.code === "Escape") {
            const dcg_elt = $("#dcg-modal-container .dcg-icon-remove");
            if (dcg_elt.length) {
                dcg_elt.trigger("dcg-tap");
            }
            const alert_elt = $(".dcg-alert-container");
            if (alert_elt.length) {
                alert_elt.remove();
            }
            return;
        }
        // New Graph
        if (Ctrl && e.code === "KeyN") {
            e.preventDefault();
            $(".align-left-container .dcg-icon.dcg-icon-plus").click()
            return;
        }
        // Print Graph
        if (Ctrl && e.code === "KeyP") {
            Calc._calc.controller.dispatch({ type: "toast/show", toast: { message: "Printing is currently not supported", toastStyle: "error", hideAfter: 6e3 } });
            return;
        }
        // Show or Hide the Expression List
        if (ShiftAlt && e.code === "KeyE") {
            e.preventDefault();
            const t = Calc._calc.controller;
            const expVisible = t.layoutModel.expressionsVisible;
            if (expVisible) {
                t.dispatch({ type: "hide-expressions-list", focusShowIcon: !1 });
            } else {
                t.dispatch({ type: "show-expressions-list", focusShowIcon: !1 })
            }
            return;
        }
        // Focus the Expression List
        if (CtrlAlt && e.code === "KeyE") {
            Calc.focusFirstExpression();
            return;
        }
        // Toggle Options for the Focused Expression
        if (CtrlShift && e.code === "KeyO") {
            let t = Calc._calc.controller;
            let item = t.getSelectedItem();
            if (item && (item.type === "expression" || item.type === "image"))
                Calc._toggleOptions(item);
            return;
        }
        // Delete the Focused Expression
        if (CtrlShift && e.code === "KeyD") {
            Calc.removeSelected();
            return;
        }
        // Add an Expression
        if (CtrlAlt && e.code === "KeyX") {
            Calc._add("expression");
            return;
        }
        // Add a Note
        if (CtrlAlt && e.code === "KeyO") {
            Calc._add("note");
            return;
        }
        // Collapse / Expand Selected Folder
        if (Alt && e.code === "ArrowUp") {
            let t = Calc._calc.controller;
            let item = t.getSelectedItem();
            if (item && item.type === "folder") {
                item.model = t.getItemModel(item.id);
                t.dispatch({ type: "set-folder-collapsed", id: item.id, isCollapsed: !item.model.collapsed });
            }
        }
        // Add a Folder
        if (CtrlAlt && e.code === "KeyF") {
            Calc._add("folder");
            return;
        }
        // Add a Note
        if (CtrlAlt && e.code === "KeyI") {
            Calc._add("image");
            return;
        }
        // Add a Table
        if (CtrlAlt && e.code === "KeyT") {
            Calc._add("table");
            return;
        }
        // Undo
        if (Ctrl && e.code === "KeyZ") {
            const t = Calc._calc.controller;
            if (t.hasVisibleAndUndoableToast()) {
                t.toastUndo();
            } else {
                Calc.undo();
            }
            return;
        }
        // Redo
        if ((CtrlShift && e.code === "KeyZ") || (Ctrl && e.code === "KeyY")) {
            Calc.redo();
            return;
        }
        // Turn Edit List Mode On or Off
        if (CtrlAlt && e.code === "KeyD") {
            let t = Calc._calc.controller;
            let mode = !t.isInEditListMode();
            t.dispatch({ type: "set-edit-list-mode", isEditListMode: mode, focusExpressionList: !0 });
            return;
        }
        // Open or Close the Graph Settings Menu
        if (CtrlAlt && e.code === "KeyG") {
            Calc._calc.controller.dispatch({ type: "toggle-graph-settings", focusOnOpen: !0 });
            return;
        }
        // Open or Close the Help Menu
        if (CtrlAlt && e.code === "KeyH") {
            $(".dcg-help-btn").trigger("dcg-tap");
            return;
        }
    });
}
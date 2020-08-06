"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var memoize_one_1 = require("memoize-one");
var lodash_1 = require("lodash");
var styled_components_1 = require("styled-components");
var linalg_1 = require("../../utils/linalg");
var number_aware_compare_1 = require("../../utils/number-aware-compare");
var fullscreen_1 = require("../../utils/fullscreen");
var HelpScreen_1 = require("./HelpScreen");
var Layer_1 = require("../../layers/Layer");
var ImageFrameWithLoading_1 = require("../ImageFrameWithLoading");
var navigation_1 = require("./navigation");
var MainDiv = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  background-color: #333;\n  font-size: .9em;\n  position: absolute;\n  top: 0; bottom: 0; left: 0; right: 0;\n  display: flex;\n  flex-direction: column;\n  color: #AAA;\n"], ["\n  background-color: #333;\n  font-size: .9em;\n  position: absolute;\n  top: 0; bottom: 0; left: 0; right: 0;\n  display: flex;\n  flex-direction: column;\n  color: #AAA;\n"])));
var ImageArea = styled_components_1.default.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  flex-grow: 1;\n  position: relative;\n"], ["\n  flex-grow: 1;\n  position: relative;\n"])));
var ImageInfo = styled_components_1.default.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  background-color: #333;\n  color: #AAA;\n  padding: 0;\n  font-size: x-small;\n"], ["\n  background-color: #333;\n  color: #AAA;\n  padding: 0;\n  font-size: x-small;\n"])));
var ImageInfoBlock = styled_components_1.default.span(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  display: inline-block;\n  margin: 0px 1px;\n  padding: .4em .6em;\n  text-decoration: none;\n  color: #AAA;\n"], ["\n  display: inline-block;\n  margin: 0px 1px;\n  padding: .4em .6em;\n  text-decoration: none;\n  color: #AAA;\n"])));
var ImageInfoLink = styled_components_1.default.a(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  display: inline-block\n  background-color: #666;\n  color: #AAA;\n  margin: 0px 1px;\n  padding: .4em .6em;\n  text-decoration: none;\n  user-select: none;\n  -moz-user-select: none;\n"], ["\n  display: inline-block\n  background-color: #666;\n  color: #AAA;\n  margin: 0px 1px;\n  padding: .4em .6em;\n  text-decoration: none;\n  user-select: none;\n  -moz-user-select: none;\n"])));
// A little hack to allow detecting shift click
var SHIFT_IS_DOWN = false;
document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Shift') {
        SHIFT_IS_DOWN = true;
    }
});
document.addEventListener('keyup', function (ev) {
    if (ev.key === 'Shift') {
        SHIFT_IS_DOWN = false;
    }
});
// A replacement editing distance
function distance(a, b) {
    var lenMin = Math.min(a.length, b.length);
    var lenMax = Math.max(a.length, b.length);
    var distance = lenMax - lenMin;
    for (var i = 0; i < lenMin; ++i) {
        if (a[i] !== b[i]) {
            ++distance;
        }
    }
    return distance;
}
var ImageViewer = /** @class */ (function (_super) {
    __extends(ImageViewer, _super);
    function ImageViewer(props) {
        var _this = _super.call(this, props) || this;
        // Controlled or stand-alone component
        if (Boolean(_this.props.selection) != Boolean(_this.props.onSelectionChange)) {
            throw new Error("ImageViewer properties selection and onSelectionChange must both be set or both be unset.");
        }
        // Set the initial state
        _this.state = {
            activeRow: 0,
            selection: _this.getDefaultSelection(_this.getMenu()).slice(1),
            viewTransform: { default: 0.0 },
            exposure: { default: 1.0 },
            helpIsOpen: false,
            defaultTransformation: linalg_1.Matrix4x4.create(),
            transformationNeedsUpdate: true,
            hasFocus: false,
        };
        // Make sure 'this' is available in the keyboard handler when assigned to the keyup event
        _this.keyboardHandler = _this.keyboardHandler.bind(_this);
        _this.setFocus = _this.setFocus.bind(_this);
        _this.unsetFocus = _this.unsetFocus.bind(_this);
        // Cache filter results
        _this.validateSelection = memoize_one_1.default(_this.validateSelection, lodash_1.isEqual);
        _this.sortMenuRows = memoize_one_1.default(_this.sortMenuRows, lodash_1.isEqual);
        return _this;
    }
    ImageViewer.prototype.getSelection = function () {
        var selection = this.props.selection ? this.props.selection : this.state.selection;
        return this.validateSelection(selection, this.getMenu());
    };
    ImageViewer.prototype.getMenu = function () {
        if (this.props.sortMenu) {
            return this.sortMenuRows(this.props.data);
        }
        return this.props.data;
    };
    ImageViewer.prototype.componentDidMount = function () {
        if (this.props.onSelectionChange) {
            this.props.onSelectionChange(this.getSelection());
        }
        this.mainContainer.setAttribute('tabindex', '1');
        this.mainContainer.addEventListener('keydown', this.keyboardHandler);
        this.mainContainer.addEventListener('focus', this.setFocus);
        this.mainContainer.addEventListener('focusout', this.unsetFocus);
    };
    ImageViewer.prototype.componentDidUpdate = function (prevProps) {
        if (this.imageFrame && this.state.transformationNeedsUpdate) {
            this.imageFrame.setTransformation(this.state.defaultTransformation);
            this.setState({ transformationNeedsUpdate: false });
        }
        // Controlled or stand-alone component
        if (Boolean(this.props.selection) != Boolean(this.props.onSelectionChange)) {
            throw new Error("ImageViewer properties selection and onSelectionChange must both be set or both be unset.");
        }
        if (this.props.selection) {
            // If this component is controlled, notify controller of valid selection, if the props changed
            if (!lodash_1.isEqual(this.props.selection, prevProps.selection)) {
                var selection = this.getSelection();
                if (!lodash_1.isEqual(selection, this.props.selection)) {
                    this.updateSelectionState(selection);
                }
            }
        }
        else {
            // If component is not controlled, then there's nothing to do
        }
    };
    ImageViewer.prototype.componentWillUnmount = function () {
        this.mainContainer.removeEventListener('keydown', this.keyboardHandler);
    };
    ImageViewer.prototype.setTransformation = function (transformation) {
        if (this.imageFrame != null) {
            this.imageFrame.setTransformation(transformation);
        }
        this.setState({ defaultTransformation: transformation });
    };
    ImageViewer.prototype.render = function () {
        var _this = this;
        var menuData = this.getMenu();
        var selection = this.getSelection();
        var rows = this.activeRows(menuData, selection);
        var imageSpec = this.imageSpec(selection, menuData);
        return (React.createElement(MainDiv, { ref: function (div) { return _this.mainContainer = div; } },
            React.createElement("div", null, rows.map(function (row, i) { return (React.createElement(navigation_1.NavRow, { key: row.title, row: row, selection: selection[i], handleClick: _this.navigateTo.bind(_this, rows, i), removeCommonPrefix: _this.props.removeCommonPrefix, active: _this.state.activeRow === i })); })),
            React.createElement(ImageArea, null,
                React.createElement(ImageFrameWithLoading_1.default, { viewTransform: this.state.viewTransform[imageSpec.tonemapGroup], exposure: this.state.exposure[imageSpec.tonemapGroup] || 1.0, gamma: 1.0, offset: 0.0, imageSpec: imageSpec, ref: function (frame) { return _this.imageFrame = (frame != null) ? frame.imageFrame : null; }, allowMovement: true, enableMouseEvents: this.state.hasFocus }),
                this.state.helpIsOpen ? React.createElement(HelpScreen_1.default, null) : null),
            this.renderImageSpec(imageSpec)));
    };
    ImageViewer.prototype.renderImageSpec = function (imageSpec) {
        if (!this.props.showInfo) {
            return React.createElement(React.Fragment, null);
        }
        if (imageSpec.type === 'Difference') {
            imageSpec = imageSpec;
            return (React.createElement(ImageInfo, null,
                React.createElement(ImageInfoLink, { href: imageSpec.urlA }, imageSpec.urlA.split('/').pop()),
                React.createElement(ImageInfoLink, { href: imageSpec.urlB }, imageSpec.urlB.split('/').pop()),
                React.createElement(ImageInfoBlock, null,
                    "Loss: ",
                    Layer_1.LossFunction[imageSpec.lossFunction]),
                React.createElement(ImageInfoBlock, null,
                    "Exposure: ",
                    (this.state.exposure[imageSpec.tonemapGroup] || 1.0).toPrecision(3))));
        }
        else if (imageSpec.type === 'Url') {
            imageSpec = imageSpec;
            return (React.createElement(ImageInfo, null,
                React.createElement(ImageInfoLink, { href: imageSpec.url }, imageSpec.url.split('/').pop()),
                React.createElement(ImageInfoBlock, null,
                    "Exposure: ",
                    this.state.exposure[imageSpec.tonemapGroup].toPrecision(3) || 1.0)));
        }
        else {
            return React.createElement(React.Fragment, null);
        }
    };
    /**
     * Select the active rows from the navigation data tree, according to the given selection
     *
     * @param tree navigation datastructure
     * @param selection array of the titles of selected items from top to bottom
     */
    ImageViewer.prototype.activeRows = function (tree, selection) {
        if (selection.length === 0) {
            // Base case of the recursion
            return [];
        }
        else {
            // Find the child with this name
            if (!tree.hasOwnProperty('children')) {
                throw new Error("Can't find match for " + selection);
            }
            var node = tree;
            var res = node.children.find(function (child) { return child.title === selection[0]; });
            if (res == null) {
                // fall back to giving up
                return [];
            }
            else {
                return [node].concat(this.activeRows(res, selection.slice(1)));
            }
        }
    };
    /**
     * Recursively sort the input data
     *
     * It's a bit smart, for example bathroom-32 will come before bathroom-128,
     * and the word Color always goes first.
     * @param tree to be sored
     */
    ImageViewer.prototype.sortMenuRows = function (tree) {
        var _this = this;
        if (tree.hasOwnProperty('children')) {
            var node = tree;
            var children = node.children.map(function (child) { return _this.sortMenuRows(child); });
            children.sort(function (a, b) {
                if (a.title === b.title) {
                    return 0;
                }
                else if (a.title === 'Color') {
                    return -1;
                }
                else if (b.title === 'Color') {
                    return 1;
                }
                else {
                    return number_aware_compare_1.default(a.title, b.title);
                }
            });
            return {
                title: node.title,
                children: children,
            };
        }
        else {
            return tree;
        }
    };
    /**
     * Find the image to be shown based on the current selection
     */
    ImageViewer.prototype.currentImage = function (currentSelection, menuData) {
        var selection = currentSelection.slice();
        var tree = menuData;
        var _loop_1 = function () {
            var entry = selection.shift();
            tree = tree.children.find(function (item) { return item.title === entry; });
        };
        while (selection.length > 0) {
            _loop_1();
        }
        return tree; // tslint:disable-line
    };
    /**
     * Specification for the current image to load
     */
    ImageViewer.prototype.imageSpec = function (currentSelection, menuData) {
        var img = this.currentImage(currentSelection, menuData);
        if (img.hasOwnProperty('lossMap')) {
            var config = img;
            return {
                type: 'Difference',
                lossFunction: Layer_1.lossFunctionFromString(config.lossMap.function),
                urlA: this.props.baseUrl + config.lossMap.imageA,
                urlB: this.props.baseUrl + config.lossMap.imageB,
                tonemapGroup: config.tonemapGroup || 'default',
            };
        }
        else {
            return {
                type: 'Url',
                url: this.props.baseUrl + img.image,
                tonemapGroup: img.tonemapGroup || 'default',
            };
        }
    };
    /**
     * Navigate to a particular image
     *
     * @param rows: a list of the rows currently visible
     * @param rowIndex: the index of the row in which to switch tabs
     * @param title: the title of the requested node
     *
     * For rows > rowIndex, we select children matching the current selection titles
     * if they exist. Otherwise, we resort to lazy matching.
     */
    ImageViewer.prototype.navigateTo = function (rows, rowIndex, title) {
        var selection = this.getSelection().slice();
        selection[rowIndex] = title;
        var activeRow = this.state.activeRow;
        if (SHIFT_IS_DOWN) {
            // Set active row on shift click
            activeRow = rowIndex;
        }
        if (this.state.activeRow !== activeRow) {
            this.setState({ activeRow: Math.min(activeRow, selection.length - 1) });
        }
        this.updateSelectionState(selection);
    };
    /**
     * Make sure that the current selection is valid given the current menu data
     *
     * If a title in the selection does not exist in the respective row, take a closely matching
     * element of the row.
     * @param wishes the desired selection, which might not be valid given the selected menu items
     */
    ImageViewer.prototype.validateSelection = function (wishes, root) {
        var selection = [];
        var i = 0;
        var _loop_2 = function () {
            var candidate = root.children.find(function (row) { return row.title === wishes[i]; });
            if (candidate) {
                root = candidate;
            }
            else if (i < wishes.length && wishes[i]) {
                var lastSelection_1 = wishes[i];
                var closest = root.children
                    .map(function (row) { return distance(row.title, lastSelection_1); })
                    .reduce(function (res, val, idx) { return val < res.val ? { val: val, idx: idx } : res; }, { val: Number.MAX_SAFE_INTEGER, idx: 0 });
                root = root.children[closest.idx];
            }
            else {
                root = root.children[0]; // resort to the first
            }
            selection.push(root.title);
            i++;
        };
        while (root.hasOwnProperty('children')) {
            _loop_2();
        }
        return selection;
    };
    /**
     * Update the selection state in the internal state or observers, depending
     * on configuration.
     * @param selection The selection to use
     */
    ImageViewer.prototype.updateSelectionState = function (selection) {
        if (this.props.selection) {
            // Controlled
            if (!lodash_1.isEqual(selection, this.props.selection)) {
                if (this.props.onSelectionChange) {
                    this.props.onSelectionChange(selection);
                }
            }
        }
        else {
            // Stand-alone
            if (!lodash_1.isEqual(selection, this.state.selection)) {
                this.setState({ selection: selection });
            }
        }
    };
    /**
     * Return the titles of the first items of a sorted tree
     * @param tree a sorted navigation data structure
     */
    ImageViewer.prototype.getDefaultSelection = function (tree) {
        if (tree.hasOwnProperty('children')) {
            var node = tree;
            if (node.children.length > 0) {
                return [node.title].concat(this.getDefaultSelection(node.children[0]));
            }
            else {
                return [node.title];
            }
        }
        else {
            return [tree.title];
        }
    };
    ImageViewer.prototype.dumpTransformation = function () {
        if (this.imageFrame != null) {
            var transformation = this.imageFrame.getTransformation();
            console.log(transformation.data);
        }
    };
    ImageViewer.prototype.keyboardHandler = function (event) {
        var _this = this;
        var key = event.key;
        var actions = {};
        var actionsUnderShift = {};
        // Number keys
        var goToNumber = function (i) { return function () {
            var rows = _this.activeRows(_this.getMenu(), _this.getSelection());
            var activeRow = _this.state.activeRow;
            var goTo = rows[activeRow].children[i];
            if (goTo != null) {
                _this.navigateTo(rows, activeRow, goTo.title);
            }
        }; };
        actions['0'] = goToNumber(9);
        for (var i = 1; i <= 9; ++i) {
            actions[i.toString()] = goToNumber(i - 1);
        }
        // Arrows
        var moveInLine = function (offset) { return function () {
            var selection = _this.getSelection();
            var rows = _this.activeRows(_this.getMenu(), selection);
            var activeRow = _this.state.activeRow;
            var currentTitle = selection[activeRow];
            var currentIndex = rows[activeRow].children.findIndex(function (n) { return n.title === currentTitle; });
            var nextIndex = (currentIndex + offset + rows[activeRow].children.length) % rows[activeRow].children.length;
            var goTo = rows[activeRow].children[nextIndex];
            _this.navigateTo(rows, activeRow, goTo.title);
        }; };
        actionsUnderShift.ArrowLeft = moveInLine(-1);
        actionsUnderShift.ArrowRight = moveInLine(1);
        actions['-'] = moveInLine(-1);
        actions['='] = moveInLine(1);
        var moveUpDown = function (offset) { return function () {
            var selection = _this.getSelection();
            var nextRow = _this.state.activeRow + offset;
            if (nextRow < 0) {
                nextRow = 0;
            }
            if (nextRow >= selection.length - 1) {
                nextRow = selection.length - 1;
            }
            _this.setState({ activeRow: nextRow });
        }; };
        actionsUnderShift.ArrowUp = moveUpDown(-1);
        actionsUnderShift.ArrowDown = moveUpDown(1);
        actions['['] = moveUpDown(-1);
        actions[']'] = moveUpDown(1);
        // ViewTransform controls
        var changeViewTransform = function () { return function () {
            var _a;
            var selection = _this.getSelection();
            var tonemapGroup = _this.imageSpec(selection, _this.getMenu()).tonemapGroup;
            var viewTransform = __assign({}, _this.state.viewTransform, (_a = {}, _a[tonemapGroup] = (Math.abs(_this.state.viewTransform[tonemapGroup] - 1)), _a));
            _this.setState({ viewTransform: viewTransform });
        }; };
        actions.t = changeViewTransform();
        // Exposure controls
        var changeExposure = function (multiplier) { return function () {
            var _a;
            var selection = _this.getSelection();
            var tonemapGroup = _this.imageSpec(selection, _this.getMenu()).tonemapGroup;
            var exposure = __assign({}, _this.state.exposure, (_a = {}, _a[tonemapGroup] = multiplier * (_this.state.exposure[tonemapGroup] || 1.0), _a));
            _this.setState({ exposure: exposure });
        }; };
        actions.e = changeExposure(1.1);
        actions.E = changeExposure(1.0 / 1.1);
        // Reset
        actions.r = function () {
            _this.setState({ viewTransform: { default: 0.0 } });
            _this.setState({ exposure: { default: 1.0 } });
            if (_this.imageFrame) {
                _this.imageFrame.reset();
            }
        };
        // Toggle help
        actions['/'] = actions['?'] = function () {
            _this.setState({ helpIsOpen: !_this.state.helpIsOpen });
        };
        actions.Escape = function () {
            _this.setState({ helpIsOpen: false });
        };
        // Go fullscreen
        actions.f = function () { return fullscreen_1.default(_this.mainContainer); };
        // Dump the current transformation
        actions.d = function () { return _this.dumpTransformation(); };
        if (actions.hasOwnProperty(key) && !event.metaKey && !event.altKey && !event.ctrlKey) {
            event.preventDefault();
            actions[key]();
            return;
        }
        if (actionsUnderShift.hasOwnProperty(key) && event.shiftKey) {
            event.preventDefault();
            actionsUnderShift[key]();
            return;
        }
    };
    ImageViewer.prototype.setFocus = function () {
        this.setState({ hasFocus: true });
    };
    ImageViewer.prototype.unsetFocus = function () {
        this.setState({ hasFocus: false });
    };
    ImageViewer.defaultProps = {
        baseUrl: '',
        sortMenu: false,
        removeCommonPrefix: false,
        showInfo: true,
    };
    return ImageViewer;
}(React.Component));
exports.default = ImageViewer;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
//# sourceMappingURL=index.js.map
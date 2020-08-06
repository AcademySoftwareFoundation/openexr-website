"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var styled_components_1 = require("styled-components");
var commonPrefix = require('common-prefix');
/** Helper to reverse string */
var reverse = function (x) { return x.split('').reverse().join(''); };
// tslint:disable
var NavLink = styled_components_1.default.a(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  cursor: pointer;\n  display: inline-block;\n  margin: 0;\n  flex-grow: 0;\n  flex-shrink: ", ";\n  padding: .4em .7em;\n  overflow: hidden;\n  text-decoration: none;\n  white-space: nowrap;\n  position: relative;\n  background-color: ", ";\n  color: ", ";\n  &:active {\n    background-color: ", ";\n  }\n  &:hover {\n    flex-shrink: 0;\n  }\n  user-select: none;\n  -moz-user-select: none;\n"], ["\n  cursor: pointer;\n  display: inline-block;\n  margin: 0;\n  flex-grow: 0;\n  flex-shrink: ", ";\n  padding: .4em .7em;\n  overflow: hidden;\n  text-decoration: none;\n  white-space: nowrap;\n  position: relative;\n  background-color: ", ";\n  color: ", ";\n  &:active {\n    background-color: ", ";\n  }\n  &:hover {\n    flex-shrink: 0;\n  }\n  user-select: none;\n  -moz-user-select: none;\n"])), function (props) { return props.active ? '0' : '1'; }, function (props) { return props.active ? '#7DC6C6' : 'inherit'; }, function (props) { return props.active ? '#FFFFFF !important' : '#AAA !important'; }, function (props) { return props.active ? '#6DB6B6' : '#222'; });
// tslint:enable
var NavRowDiv = styled_components_1.default.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  display: block;\n  padding: 0;\n  border-bottom: 1px solid #333;\n  background: #333;\n  color: #ccc;\n  display: flex;\n  &:first-child {\n    border-top: 1px solid #333;\n  }\n  &:hover ", " {\n    flex-shrink: 1;\n  }\n  &:hover ", ":hover {\n    flex-shrink: 0;\n  }\n"], ["\n  display: block;\n  padding: 0;\n  border-bottom: 1px solid #333;\n  background: #333;\n  color: #ccc;\n  display: flex;\n  &:first-child {\n    border-top: 1px solid #333;\n  }\n  &:hover ", " {\n    flex-shrink: 1;\n  }\n  &:hover ", ":hover {\n    flex-shrink: 0;\n  }\n"])), NavLink, NavLink);
var NavLinkNumber = styled_components_1.default.span(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  color: white;\n  font-size: .6em;\n  position: absolute;\n  top: .3em;\n  right: .4em;\n"], ["\n  color: white;\n  font-size: .6em;\n  position: absolute;\n  top: .3em;\n  right: .4em;\n"])));
exports.NavRow = function (_a) {
    var row = _a.row, active = _a.active, selection = _a.selection, handleClick = _a.handleClick, removeCommonPrefix = _a.removeCommonPrefix;
    var titlesInRow = row.children.map(function (child) { return child.title; });
    // Trim common prefices and suffices from the row's entries
    var trimmedTitles;
    if (removeCommonPrefix) {
        var prefix_1 = commonPrefix(titlesInRow);
        var suffix_1 = reverse(commonPrefix(titlesInRow.map(reverse)));
        trimmedTitles = titlesInRow.map(function (t) { return t.slice(prefix_1.lastIndexOf('/') + 1, t.length - suffix_1.length); });
    }
    else {
        trimmedTitles = titlesInRow;
    }
    return (React.createElement(NavRowDiv, null, row.children.map(function (child, i) { return (React.createElement(NavLink, { onClick: function () { return handleClick(child.title); }, key: child.title, active: child.title === selection, title: titlesInRow[i] },
        i === 0 ? titlesInRow[i] : trimmedTitles[i],
        active && i < 10 ? React.createElement(NavLinkNumber, null, (i + 1) % 10) : null)); })));
};
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=navigation.js.map
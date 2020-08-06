"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var styled_components_1 = require("styled-components");
var HelpScreenDiv = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 2em 0;\n  background-color: rgba(0, 0, 0, 0.8);\n  line-height: 1.4em;\n  color: white;\n  table {\n    width: 40em;\n    margin: 0 auto;\n  }\n  h1 {\n    font-size: 1em;\n    margin: 0;\n    padding: 0;\n    line-height: 2em;\n    text-align: center;\n    padding-bottom: .5em;\n  }\n  th, td {\n    text-align: left;\n    padding: .4em 1em;\n    vertical-align: top;\n  }\n  th {\n    width: 10em;\n  }\n"], ["\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 2em 0;\n  background-color: rgba(0, 0, 0, 0.8);\n  line-height: 1.4em;\n  color: white;\n  table {\n    width: 40em;\n    margin: 0 auto;\n  }\n  h1 {\n    font-size: 1em;\n    margin: 0;\n    padding: 0;\n    line-height: 2em;\n    text-align: center;\n    padding-bottom: .5em;\n  }\n  th, td {\n    text-align: left;\n    padding: .4em 1em;\n    vertical-align: top;\n  }\n  th {\n    width: 10em;\n  }\n"])));
exports.default = (function () {
    return (React.createElement(HelpScreenDiv, null,
        React.createElement("h1", null, "Shortcuts"),
        React.createElement("table", null,
            React.createElement("tbody", null,
                React.createElement("tr", null,
                    React.createElement("th", null, "0-9"),
                    React.createElement("td", null, "Switch images")),
                React.createElement("tr", null,
                    React.createElement("th", null, "Shift + 0-9"),
                    React.createElement("td", null, "Switch comparison (to for example reference or input)")),
                React.createElement("tr", null,
                    React.createElement("th", null, "Shift + Arrows"),
                    React.createElement("td", null, "Navigate through the menu")),
                React.createElement("tr", null,
                    React.createElement("th", null, "Shift + click"),
                    React.createElement("td", null, "Open a tab, and activate keyboard shortcuts for the row clicked")),
                React.createElement("tr", null,
                    React.createElement("th", null, "e / E"),
                    React.createElement("td", null,
                        "Increase / decrease ",
                        React.createElement("strong", null, "e"),
                        "xposure")),
                React.createElement("tr", null,
                    React.createElement("th", null, "r"),
                    React.createElement("td", null, "Reset exposure, view transform, positioning and zooming")),
                React.createElement("tr", null,
                    React.createElement("th", null, "t"),
                    React.createElement("td", null, "Toggle between the Gamma 2.2 and the Pseudo ARRI K1S1 view transforms")),
                React.createElement("tr", null,
                    React.createElement("th", null, "f"),
                    React.createElement("td", null,
                        "Enter ",
                        React.createElement("strong", null, "f"),
                        "ullscreen mode")),
                React.createElement("tr", null,
                    React.createElement("th", null, "?"),
                    React.createElement("td", null, "Toggle this help screen"))))));
});
var templateObject_1;
//# sourceMappingURL=HelpScreen.js.map
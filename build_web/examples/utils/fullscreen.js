"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function requestFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    }
    else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    }
    else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); //tslint:disable-line
    }
}
exports.default = requestFullscreen;
//# sourceMappingURL=fullscreen.js.map
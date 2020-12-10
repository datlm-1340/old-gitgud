function HotKeysService() {
  this.diffNext = 190; // key "." for ">"
  this.diffPrev = 188; // key "," for "<"
  this.toggleSidebar = 77; // key m for toggle sidebar
  this.closeSidebar = 27; // key esc to close sidebar
};

HotKeysService.prototype.getKeyCodeForNextDiff = function () {
  return this.diffNext;
}

HotKeysService.prototype.getKeyCodeForPrevDiff = function () {
  return this.diffPrev;
}

HotKeysService.prototype.getKeyCodeForToggleSidebar = function () {
  return this.toggleSidebar;
}

HotKeysService.prototype.getKeyCodeForCloseSidebar = function () {
  return this.closeSidebar;
}

HotKeysService.prototype.isValidKeyCodeForDiff = function (keyCode) {
  return keyCode == this.getKeyCodeForNextDiff() || keyCode == this.getKeyCodeForPrevDiff();
}

HotKeysService.prototype.isValidKeyCodeForSideBarToggle = function (keyCode) {
  return keyCode == this.getKeyCodeForToggleSidebar();
}

HotKeysService.prototype.isValidKeyCodeForCloseSidebar = function (keyCode) {
  return keyCode == this.getKeyCodeForCloseSidebar();
}

HotKeysService.prototype.isValidKeyCode = function (keyCode) {
  return this.isValidKeyCodeForDiff(keyCode) ||
    this.isValidKeyCodeForCloseSidebar(keyCode) ||
    this.isValidKeyCodeForSideBarToggle(keyCode);
}

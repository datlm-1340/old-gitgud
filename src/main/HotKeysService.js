function HotKeysService() {
  this.diffNext = 190;
  this.diffPrev = 188;
  this.toggleSidebar = 77;
  this.closeSidebar = 27;
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

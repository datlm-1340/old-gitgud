function HotKeysService() {
  this.diffNext = 190; // key "." for ">"
  this.diffPrev = 188; // key "," for "<"

  this.toggleSidebar = 77; // key m for "map", duh?

  var that = this;
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

HotKeysService.prototype.isValidKeyCodeForDiff = function (keyCode) {
  return keyCode == this.getKeyCodeForNextDiff() || keyCode == this.getKeyCodeForPrevDiff();
}

HotKeysService.prototype.isValidKeyCodeForSideBarToggle = function (keyCode) {
  return keyCode == this.getKeyCodeForToggleSidebar();
}

HotKeysService.prototype.isValidKeyCode = function (keyCode) {
  return this.isValidKeyCodeForDiff(keyCode) ||
    this.getKeyCodeForToggleSidebar(keyCode);
}


function Main() { }

Main.prototype.init = function () {

  this.hiddenSidebarUrls = [];
  this.pageLoadWaitTimeout = 1000; // 1 sec
  this.initialNumberOfFiles = 0;

  this.hotKeysService = new HotKeysService();

  this.generateApp();

  if (window == top) {
    window.addEventListener('keyup', this.doKeyPress.bind(this), false);
    setInterval(this.monitorUrlChange.bind(this), 100);
  }

  setInterval(this.monitorLazyLoading.bind(this), 100);

};

Main.prototype.generateApp = function () {
  this.currentPageUrl = this.getWindowLocationHref();
  this.toolBarHeight = $('.pr-toolbar').height();

  this.initialNumberOfFiles = $('.file').length;

  var files = [];
  var fileIDs = [];

  $.each($('.file'), function (index, item) {
    var file = $(item).find('.file-header[data-path]').data('path');

    if (file) {
      files[index] = file;
      fileIDs[index] = item.id;
    }

  });

  var hierarchy = $('<p id="jk-hierarchy"></p>');

  var hierarchyGenerator = new HierarchyGeneratorService();
  hierarchyGenerator.generateAndApplyHierarchyHtml(files, fileIDs, hierarchy);

  $("body").prepend(hierarchy);

  var decorationService = new DecorationService(hierarchy);
  decorationService.applyInitStyle();
  decorationService.reviewDiffs();
  decorationService.appendShowMore();
  decorationService.appendCommentCounts();
  decorationService.appendNoDiffMessage();
  decorationService.appendWrongBaseMessage();

  var appInteractionService = new AppInteractionService(this.toolBarHeight, this.hotKeysService, this);
  appInteractionService.attachFolderCollapseBehavior(hierarchy);
  appInteractionService.attachJumpOnClickBehavior(hierarchy);

  appInteractionService.updateCurentDiffPos();

  this.appInteractionService = appInteractionService;

};

Main.prototype.doKeyPress = function (e) {

  // Do not react on key press if user is typing text.
  var clickedTarget = $(e.target).prop("tagName");
  if (clickedTarget != 'BODY' && clickedTarget != undefined) {
    return;
  }

  if (this.hotKeysService.isValidKeyCode(e.keyCode)) {
    this.appInteractionService.respondToHotKey(e.keyCode);
  }

};

Main.prototype.monitorUrlChange = function () {
  // If URL changed, remove the sidebar.
  if (!this.isSameUrl()) {
    this.currentPageUrl = this.getWindowLocationHref();
    $('#jk-hierarchy').remove();
  }

};

Main.prototype.isSameUrl = function () {
  return this.currentPageUrl == this.getWindowLocationHref();
};

Main.prototype.getWindowLocationHref = function () {
  return window.location.href.split("#")[0];
};

Main.prototype.monitorLazyLoading = function () {
  if (this.initialNumberOfFiles != $('.file').length) {
    $('#jk-hierarchy').remove();
    this.generateApp();
  }
};

$(document).ready(function() {
  $('body').on('click', '.load-diff-button', function() {
    var hierarchy = $('<p id="jk-hierarchy"></p>');
    var decorationService = new DecorationService(hierarchy);
    var currentId = $(this).closest("div.file").attr("id");

    decorationService.reviewDiffs(currentId);
  });

  $('body').on('click', '.close-notice', function() {
    if (confirm('Are you sure you want to hide this notice?')) {
      $('#develop-notice').hide();
    }
  });
});

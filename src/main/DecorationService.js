var WARNING = 0;
var DANGER = 1;
var checklistKey = "GITGUD_CHECKLIST";

function DecorationService(element) {
  this.element = element;
};

// safety first
String.prototype.htmlSafe = function() {
  return this.valueOf().replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
};

DecorationService.prototype.applyInitStyle = function () {
  $(this.element).css('width', $(this.element).width() * 1.2);
  $(this.element).css("background-color", $('body').css('background-color'));
  // Hide the sidebar by default.
  $(this.element).hide();
};

DecorationService.prototype.appendCommentCounts = function () {
  var files = $('#jk-hierarchy').find('.jk-file');

  $.each(files, function (key, item) {
    var fileId = $(item).data('file-id');

    var comments = $('#' + fileId).find('.js-comment.unminimized-comment');
    if (comments.length) {
      var count = $('<span class="comment-count"><b class="icon-comment">' + comments.length + '</b></span>');
      $(item).append(count);
    }
  });
};

DecorationService.prototype.appendShowMore = function () {
  var files = $('#jk-hierarchy').find('.jk-file');

  $.each(files, function (key, item) {
    var fileId = $(item).data('file-id');

    var unopenedFile = $('#' + fileId).find('.load-diff-button');
    if (unopenedFile.length > 0) {
      var unopenedFile = $('<span class="unopened-count" title="Large diffs"><b class="icon-unopened">...</b></span>');
      $(item).append(unopenedFile);
    }
  });
};

DecorationService.prototype.appendNoDiffMessage = function () {
  if ($('#jk-notice').length) return;

  $("body").prepend('<div id="jk-notice">No diffs found</div>');
  $('#jk-notice').css("background-color", $('body').css('background-color'));
};

DecorationService.prototype.reviewDiffs = function (singleFile) {
  if(singleFile) {
    var additions = $('#' + singleFile).find('.blob-code.blob-code-addition');
    // tạo 1 interval để chờ đến khi file được load xong thì bắt đầu review file đó
    var interval = setInterval(function() {
      if(!additions.length) {
        additions = $('#' + singleFile).find('.blob-code.blob-code-addition');
      } else {
        var file = $("#jk-hierarchy ").find("[data-file-id=" + singleFile + "]");
        $(file).find(".unopened-count").hide();
        // review lại file hiện tại
        review(file, additions, true);
        // clear interval hiện tại
        clearInterval(interval);
      }
    }, 1000);
  } else {
    var files = $('#jk-hierarchy').find('.jk-file');

    $.each(files, function (key, file) {
      var fileId = $(file).data('file-id');
      var additions = $('#' + fileId).find('.blob-code.blob-code-addition');

      review(file, additions);
    });

    $("body").prepend('<span id="reviewed"></span>');
  }


  function strip(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  function appendWarningIndicators(report, addition) {
    if ($(addition).data('is-viewed') === 'true') return;

    if (report.warningCounts > 0) {
      var indicator = $('<span class="gitgud-tooltip warning-count">' +
        '<b class="icon-warning">' + report.warningCounts + '</b>' +
        '<span class="gitgud-tooltip-content"></span></span>'
      );

      $(addition).append(indicator);

      $.each(report.warnings, function(index, warning) {
        var content = $('<p>' + '- ' + warning + '</p>');
        $(indicator).find('.gitgud-tooltip-content').append(content);
      });
    };
  };

  function appendDangerIndicators(report, addition) {
    if ($(addition).data('is-viewed') === 'true') return;

    if (report.dangerCounts > 0) {
      var indicator = $('<span class="gitgud-tooltip danger-count">' +
        '<b class="icon-danger">' + report.dangerCounts + '</b>' +
        '<span class="gitgud-tooltip-content"></span></span>'
      );

      $(addition).append(indicator);
      $.each(report.dangers, function(index, danger) {
        var content = $('<p>' + '- ' + danger + '</p>');
        $(indicator).find('.gitgud-tooltip-content').append(content);
      });
    }
  };

  function appendWarningCounts(count, file) {
    if (count > 0) {
      var count = $('<span class="warning-count"><b class="icon-warning">' + count + '</b></span>');

      $(file).append(count);
      $(file).addClass("gitgud-warning");
    }
  };

  function appendDangerCounts(count, file) {
    if (count > 0) {
      var count = $('<span class="danger-count"><b class="icon-danger">' + count + '</b></span>');

      $(file).append(count);
      $(file).addClass("gitgud-danger");
    }
  };

  function appendIndicators(report, addition, isSingleFile) {
    // thêm icon và tooltip cho warnings và dangers vào dòng addition
    appendWarningIndicators(report, addition);
    appendDangerIndicators(report, addition);

    if(isSingleFile !== true) {
      $(addition).data('is-viewed', 'true');
    };
  };

  function review(file, additions, isSingleFile) {
    // lấy PR checklist
    chrome.storage.local.get(checklistKey, function(checklist) {
      var warningCounts = 0;
      var dangerCounts = 0;

      PRChecklist = JSON.parse(checklist[checklistKey]);
      // loop từng line thay đổi
      $.each(additions, function (index, addition) {
        // lấy toàn bộ html của 1 line (chưa format)
        var unformattedLine = $(addition).find(".blob-code-inner.blob-code-marker").html();
        // gộp html của github để lấy nội dung của 1 line
        var line = strip(unformattedLine);
        // khai báo báo cáo lỗi của từng line
        var report = {
          warnings: [],
          dangers: [],
          warningCounts: 0,
          dangerCounts: 0
        };
        // loop qua từng record của checklist và check với line hiện tại
        $.each(PRChecklist, function(i, item) {
          if(line.includes(item.pattern)) {
            if (item.type == WARNING) {
              report.warningCounts++;

              if(item.note.length) {
                report.warnings.push(item.note.htmlSafe());
              }
            } else {
              report.dangerCounts++;

              if(item.note.length) {
                report.dangers.push(item.note.htmlSafe());
              }
            }
          }
        });
        // thêm thông báo cho từng dòng
        appendIndicators(report, addition);
        // đếm số lỗi trong 1 file
        warningCounts += report.warningCounts;
        dangerCounts += report.dangerCounts;
      });
      // thêm số lượng lỗi ở sau tên file
      appendWarningCounts(warningCounts, file);
      appendDangerCounts(dangerCounts, file);
    });
  };
};

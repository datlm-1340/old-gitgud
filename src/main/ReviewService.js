var WARNING = 0;
var DANGER = 1;
var DISCO_DEVELOP = "develop";
var checklistKey = "GITGUD_CHECKLIST";

function ReviewService(element) {
  this.element = element;
};

String.prototype.htmlSafe = function() {
  return this.valueOf().replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
};

function strip(html) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

ReviewService.prototype.applyInitStyle = function () {
  $(this.element).css('width', $(this.element).width() * 1.2);
  $(this.element).css("background-color", $('body').css('background-color'));
  $(this.element).hide();
};

ReviewService.prototype.appendCommentCounts = function () {
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

ReviewService.prototype.appendShowMore = function () {
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

ReviewService.prototype.appendNoDiffMessage = function () {
  if ($('#jk-notice').length) return;

  $("body").prepend('<div id="jk-notice">No diffs found</div>');
  $('#jk-notice').css("background-color", $('body').css('background-color'));
};

ReviewService.prototype.appendWrongBaseMessage = function () {
  if ($('#develop-notice').length) return;

  var unformattedBase = $('.commit-ref').find(".no-underline").html();
  var base = strip(unformattedBase);

  if (base.includes(DISCO_DEVELOP)) {
    var notice = "THIS PULL REQUEST IS ON DEVELOP BASE, PLEASE CHANGE BASE IF NOT NEEDED"
    $("body").prepend('<div id="develop-notice">' + notice + '<div class="close-notice">&times;</div></div>');
  };
};

ReviewService.prototype.reviewDiffs = function (singleFile) {
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

      $(addition).addClass('has-warnings');
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

      $(addition).addClass('has-dangers');
    };
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
    if (!$(addition).hasClass('has-warnings')) appendWarningIndicators(report, addition);
    if (!$(addition).hasClass('has-dangers')) appendDangerIndicators(report, addition);

    if(isSingleFile !== true) {
      $(addition).data('is-viewed', 'true');
    };
  };

  function groupByKey(array, key) {
    return array
      .reduce(function (hash, obj) {
        if(obj[key] === undefined) return hash;
        var res = {};
        res[obj[key]] = (hash[obj[key]] || []).concat(obj);
        return Object.assign(hash, res)
      }, {})
  };

  function review(file, additions, isSingleFile) {
    // lấy PR checklist
    chrome.storage.local.get(checklistKey, function(checklist) {
      var warningCounts = 0;
      var dangerCounts = 0;
      var fileType = $(file).data('fileType')
      var PRChecklist = groupByKey(JSON.parse(checklist[checklistKey]), 'file')[fileType];

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
          var pattern = (item.regex == 1) ? (new RegExp(item.pattern)) : item.pattern

          if(line.match(pattern)) {
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

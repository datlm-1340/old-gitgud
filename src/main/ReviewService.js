var WARNING = 0;
var DANGER = 1;

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
};

ReviewService.prototype.reviewDiffs = function (singleFile) {
  if(singleFile) {
    var additions = $('#' + singleFile).find('.blob-code.blob-code-addition');
    var interval = setInterval(function() {
      if(!additions.length) {
        additions = $('#' + singleFile).find('.blob-code.blob-code-addition');
      } else {
        var file = $("#jk-hierarchy ").find("[data-file-id=" + singleFile + "]");

        $(file).find(".unopened-count").hide();
        review(file, additions, true);
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

    $("#reviewed").remove();
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

  function isMatch(line, item) {
    if (item.regex == 1) return line.match(new RegExp(item.pattern));
    return line.includes(item.pattern);
  };

  function review(file, additions, isSingleFile) {
    var repositoryKey = window.location.href.split("/")[4];

    chrome.storage.local.get(repositoryKey, function(checklist) {
      var warningCounts = 0;
      var dangerCounts = 0;
      var fileType = $(file).data('fileType');

      if (!checklist[repositoryKey]) return;

      var checklistData = JSON.parse(checklist[repositoryKey]).checklist;

      if (!checklistData) return;

      var PRChecklist = groupByKey(checklistData, 'file')[fileType];

      $.each(additions, function (index, addition) {
        var unformattedLine = $(addition).find(".blob-code-inner.blob-code-marker").html();
        var line = strip(unformattedLine);
        var report = {
          warnings: [],
          dangers: [],
          warningCounts: 0,
          dangerCounts: 0
        };

        $.each(PRChecklist, function(i, item) {
          if(isMatch(line, item)) {
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

        appendIndicators(report, addition);

        warningCounts += report.warningCounts;
        dangerCounts += report.dangerCounts;
      });

      appendWarningCounts(warningCounts, file);
      appendDangerCounts(dangerCounts, file);
    });
  };
};

// một vài settings
var Settings = {
  baseURL: "https://v2-api.sheety.co/0e31cded92f461b669291ff171a274fd/prChecklist/",
  checklistKey: "GITGUD_CHECKLIST",
  lastUpdatedAtKey: "GITGUD_LAST_UPDATED_AT",
  repositoryKey: "GITGUD_REPOSITORY",
  repositoryKeySplitIndex: 4
};

function saveRepositoryKey() {
  // lấy url của tab đang mở
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabs) {
      // lấy slug của repo
      var currentTab = tabs[0];
      if(currentTab.url.includes('github.com')) {
        var repositoryKey = currentTab.url.split("/")[Settings.repositoryKeySplitIndex].toLowerCase();

        // sau đó lưu vào session để dùng
        sessionStorage.setItem(Settings.repositoryKey, repositoryKey);
      };
  });
};

function getRepositoryKey() {
  return sessionStorage.getItem(Settings.repositoryKey);
}

// lấy API Endpoint của checklist trong repository hiện tại
function getChecklistEndpoint() {
  var repositoryKey = getRepositoryKey();

  if (repositoryKey === null) {
    saveRepositoryKey();
    repositoryKey = getRepositoryKey();
  }
  return Settings.baseURL + repositoryKey;
}

// request lên API Endpoint để lấy dữ liệu
function fetchData() {
  var repositoryKey = getRepositoryKey();
  var xmlHttpRequest = new XMLHttpRequest();

  xmlHttpRequest.open("GET", getChecklistEndpoint(), true);
  xmlHttpRequest.send();

  xmlHttpRequest.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      var responseData = JSON.parse(this.response)[repositoryKey];
      var storageData = {};
      // lưu dữ liệu vào local storage để dùng
      storageData[Settings.checklistKey] = JSON.stringify(responseData);
      storageData[Settings.lastUpdatedAtKey] = new Date().getTime();

      chrome.storage.local.set(storageData);

      // update thành công thì thông báo rồi reload page
      alert("UPDATE THÀNH CÔNG");
      chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        var code = 'window.location.reload();';
        chrome.tabs.executeScript(arrayOfTabs[0].id, {code: code});
      });
    } else if (this.readyState === 4 && this.status === 400) {
      alert("UPDATE THẤT BẠI");
    }
  };
};

$(document).ready(function() {
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabs) {
    var currentTab = tabs[0];
    if(currentTab.url.includes('github.com')) {
      $("#not-on-github-popup").hide();
      $("#main-popup").show();
    } else {
      $("#not-on-github-popup").show();
      $("#main-popup").hide();
    }
  });
  saveRepositoryKey();

  // update dữ liệu
  $('#update').click(function () {
    fetchData();
  });

  // tự động fetch dữ liệu khi không có dữ liệu trong DB
  chrome.storage.local.get(Settings.checklistKey, function(result){
    if (!result[Settings.checklistKey].length) {
      fetchData();
    }
  });
});

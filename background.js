chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
      const queryParameters = tab.url.split("?")[1]; //[1]: This accesses the second element of the array returned by split()
      const urlParameters = new URLSearchParams(queryParameters);
  
      //Send a message to contentScript that new video was loaded and this is the video id
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        videoId: urlParameters.get("v"),
      });
    }
  });
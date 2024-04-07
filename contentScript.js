(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === "PLAY"){
            youtubePlayer.currentTime = value;
        }else if ( type === "DELETE") {
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
      
            response(currentVideoBookmarks);
        }
    });

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) =>{
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []); //It checks if obj[currentVideo] exists. If it does, it parses it as JSON using JSON.parse(). If it doesn't exist, it resolves with an empty array [].
            });
        });
    }

    const newVideoLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        currentVideoBookmarks = await fetchBookmarks(); //async allows you to use await within the function body to handle asynchronous operations more conveniently

        //If bookmarkbtn doesnot exists
        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            //bookmarkBtn's attributes
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            //Get elements from youtube
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
            
            //Add bookmarkBtn
            youtubeLeftControls.appendChild(bookmarkBtn);
            //Listen for a click
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    const addNewBookmarkEventHandler = async () => {
        //CurrentTime in Second
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime), //getTime function is used to change currentTime in second to Standard time
        };
        // console.log(newBookmark);

        currentVideoBookmarks = await  fetchBookmarks();

        //Things need to be storage in chrome storage in json format and sort accordingly time properties  of the object
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    }

    // newVideoLoaded();
})();

//getTime : Time in Second to Standard time
const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substring(11, 19);
}

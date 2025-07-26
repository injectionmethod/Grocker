const HARDCODED_BOTS = ['@grok'];
let observer = null;

function hideTweets() {
  chrome.storage.sync.get(
    ['excludeFollowers', 'grockerActive', 'blockOtherBots', 'customBotList'],
    (data) => {
      if (!data.grockerActive) return;

      const excludeFollowers = data.excludeFollowers;
      const blockOtherBots = data.blockOtherBots;
      const customBots = data.customBotList || [];
      const botsToBlock = HARDCODED_BOTS.concat(blockOtherBots ? customBots : []);

      const tweets = document.querySelectorAll('article');
      tweets.forEach((tweet) => {
        const text = tweet.innerText.toLowerCase();


        const mentionsBlockedBot = botsToBlock.some((bot) => text.includes(bot));

        if (!mentionsBlockedBot) return; // nothing to block here

        let isFollowing = false;

        const followBadge = tweet.querySelector('span[aria-label*="Following"]');
        if (followBadge) {
          isFollowing = true;
        }

        if (!excludeFollowers || !isFollowing) {
          tweet.style.display = 'none';
        } else {
          tweet.style.display = ''; 
        }
      });
    }
  );
}

function startGrocker() {
  if (observer) return;
  observer = new MutationObserver(hideTweets);
  observer.observe(document.body, { childList: true, subtree: true });
  hideTweets();
}

function stopGrocker() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'startGrocker') startGrocker();
  else if (message.action === 'stopGrocker') stopGrocker();
});

// Start if already active on page load
chrome.storage.sync.get(['grockerActive'], (data) => {
  if (data.grockerActive) startGrocker();
});
